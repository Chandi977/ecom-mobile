import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiGet, apiPost } from '../services/api';
import { clearGuestCart, getGuestCart, setGuestCart } from '../services/storage';
import { useAuth } from './AuthContext';
import { useUpdateCartCount } from './CartCountContext';

export interface CartLine {
  product: any; // product object (full or compact) or id
  quantity: number;
  price: number;
  selectedPackWeight?: number;
  totalPackWeight?: number;
  packSize?: number;
  brand?: string;
  category?: string;
  stock?: number;
}

export interface Cart {
  products: CartLine[];
  total_amount: number;
  discount_amount?: number;
  totalPackWeight?: number;
  [k: string]: any;
}

interface CartValue {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (params: AddItemParams) => Promise<{ ok: boolean; message: string }>;
  alterQuantity: (productId: string, quantity: number, packSize?: number) =>
    Promise<{ ok: boolean; message: string }>;
  removeItem: (productId: string) => Promise<{ ok: boolean; message: string }>;
  emptyCart: () => Promise<void>;
  count: number;
}

export interface AddItemParams {
  product: any; // full product object
  quantity: number;
  price: number;
  packSize: number;
  packWeight?: number;
  stock?: number;
}

const CartContext = createContext<CartValue | null>(null);

function getProductId(p: any): string {
  if (!p) return '';
  if (typeof p === 'object') return String(p._id || p.id || '');
  return String(p);
}

function recalc(products: CartLine[]): Cart {
  return {
    products,
    total_amount: products.reduce(
      (t, x) => t + (Number(x.price) || 0) * (Number(x.quantity) || 0),
      0,
    ),
    discount_amount: 0,
    totalPackWeight: products.reduce(
      (t, x) => t + (Number(x.totalPackWeight) || 0),
      0,
    ),
  };
}

function compactProduct(product: any, packSize: number) {
  if (!product || typeof product !== 'object') return product;
  const selectedPriceList = Array.isArray(product?.priceList)
    ? product.priceList
        .filter((it: any) => String(it?.number) === String(packSize))
        .map((it: any) => ({
          number: it?.number,
          SP: it?.SP,
          MRP: it?.MRP,
          pack_weight: it?.pack_weight,
          stock_quantity: it?.stock_quantity,
        }))
    : [];
  return {
    _id: product?._id || product?.id,
    name: product?.name,
    model: product?.model,
    brand: product?.brand,
    images: product?.images?.slice?.(0, 1) || [],
    priceList: selectedPriceList,
    slug: product?.slug,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const migratedRef = useRef(false);
  const setCartCount = useUpdateCartCount();

  const fetchRemote = useCallback(async () => {
    if (!user?._id) return null;
    const res = await apiGet<any>(`cart/${user._id}`);
    if (res.ok) {
      const data = res.data || {};
      return {
        ...data,
        products: data.products || [],
        total_amount: data.total_amount || 0,
      } as Cart;
    }
    return null;
  }, [user?._id]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (token && user?._id) {
        const remote = await fetchRemote();
        setCart(remote);
      } else {
        const guest = await getGuestCart();
        setCart(guest || { products: [], total_amount: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?._id, fetchRemote]);

  // Migrate guest cart to server on login
  useEffect(() => {
    (async () => {
      if (!token || !user?._id || migratedRef.current) {
        await refresh();
        return;
      }
      const guest = await getGuestCart();
      if (guest?.products?.length) {
        migratedRef.current = true;
        for (const line of guest.products) {
          const pid = getProductId(line?.product);
          if (!pid) continue;
          await apiPost('AddtoCart', {
            user: user._id,
            product: {
              product: pid,
              name: line?.product?.name,
              price: Number(line.price) || 0,
              quantity: Number(line.quantity) || 1,
              packSize: Number(line.packSize) || 1,
              totalPackWeight: Number(line.totalPackWeight) || 0,
              brand: line.brand,
              category: line.category,
              stock: line.stock,
            },
          });
        }
        await clearGuestCart();
      } else {
        migratedRef.current = true;
      }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?._id]);

  const addItem = useCallback(
    async ({ product, quantity, price, packSize, packWeight = 0, stock }: AddItemParams) => {
      const pid = getProductId(product);
      if (!pid) return { ok: false, message: 'Invalid product.' };
      const qty = Math.max(1, Number(quantity) || 1);
      const totalPackWeight = qty * (Number(packWeight) || 0);

      if (!token || !user?._id) {
        const current = (await getGuestCart()) || { products: [], total_amount: 0 };
        const products: CartLine[] = current.products || [];
        const exists = products.find(
          (x) => getProductId(x.product) === pid && String(x.packSize) === String(packSize),
        );
        if (exists) {
          return { ok: false, message: 'Item is already in the cart.' };
        }
        const line: CartLine = {
          product: compactProduct(product, packSize),
          quantity: qty,
          price: Number(price) || 0,
          selectedPackWeight: Number(packWeight) || 0,
          totalPackWeight,
          packSize: Number(packSize),
          brand:
            typeof product?.brand === 'object'
              ? product?.brand?.name || product?.brand?._id
              : product?.brand,
          category:
            typeof product?.category === 'object'
              ? product?.category?.name || product?.category?._id
              : product?.category,
          stock,
        };
        const updated = recalc([...products, line]);
        await setGuestCart(updated);
        setCart(updated);
        return { ok: true, message: 'Item added to the cart.' };
      }

      const res = await apiPost('AddtoCart', {
        user: user._id,
        product: {
          product: pid,
          name: product?.name,
          price: Number(price) || 0,
          quantity: qty,
          packSize: Number(packSize),
          totalPackWeight,
          brand:
            typeof product?.brand === 'object'
              ? product?.brand?.name || product?.brand?._id
              : product?.brand,
          category:
            typeof product?.category === 'object'
              ? product?.category?.name || product?.category?._id
              : product?.category,
          stock,
        },
      });
      if (res.ok) {
        await refresh();
        return { ok: true, message: res.message || 'Item added to the cart.' };
      }
      return { ok: false, message: res.message };
    },
    [token, user?._id, refresh],
  );

  const alterQuantity = useCallback(
    async (productId: string, quantity: number, packSize?: number) => {
      const nextQty = Math.max(1, Number(quantity) || 1);
      if (!token || !user?._id) {
        const current = (await getGuestCart()) || { products: [], total_amount: 0 };
        const products: CartLine[] = current.products || [];
        const idx = products.findIndex(
          (x) =>
            getProductId(x.product) === String(productId) &&
            (packSize === undefined || String(x.packSize) === String(packSize)),
        );
        if (idx === -1) return { ok: false, message: 'Item not in cart.' };
        const line = products[idx];
        const perPackWeight =
          Number(line.selectedPackWeight) ||
          (Number(line.totalPackWeight) || 0) / (Number(line.quantity) || 1) ||
          0;
        products[idx] = {
          ...line,
          quantity: nextQty,
          selectedPackWeight: perPackWeight,
          totalPackWeight: perPackWeight * nextQty,
        };
        const updated = recalc(products);
        await setGuestCart(updated);
        setCart(updated);
        return { ok: true, message: 'Quantity updated.' };
      }
      const res = await apiPost('alterQunatity', {
        user: user._id,
        product: productId,
        quantity: nextQty,
        packSize,
      });
      if (res.ok) {
        await refresh();
        return { ok: true, message: res.message };
      }
      return { ok: false, message: res.message };
    },
    [token, user?._id, refresh],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!productId) return { ok: false, message: 'Missing product id.' };
      if (!token || !user?._id) {
        const current = (await getGuestCart()) || { products: [], total_amount: 0 };
        const filtered = (current.products || []).filter(
          (x: CartLine) => getProductId(x.product) !== String(productId),
        );
        if (filtered.length) {
          const updated = recalc(filtered);
          await setGuestCart(updated);
          setCart(updated);
        } else {
          await clearGuestCart();
          setCart({ products: [], total_amount: 0 });
        }
        return { ok: true, message: 'Item removed.' };
      }
      const res = await apiPost('removefromcart', {
        user: user._id,
        product: productId,
      });
      if (res.ok) {
        await refresh();
        return { ok: true, message: res.message };
      }
      return { ok: false, message: res.message };
    },
    [token, user?._id, refresh],
  );

  const emptyCart = useCallback(async () => {
    if (!token || !user?._id) {
      await clearGuestCart();
      setCart({ products: [], total_amount: 0 });
      return;
    }
    await apiPost('emptyCart', { id: user._id });
    await refresh();
  }, [token, user?._id, refresh]);

  const count = cart?.products?.length || 0;
  useEffect(() => { setCartCount(count); }, [count, setCartCount]);

  const value = useMemo<CartValue>(
    () => ({ cart, loading, refresh, addItem, alterQuantity, removeItem, emptyCart, count }),
    [cart, loading, refresh, addItem, alterQuantity, removeItem, emptyCart, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
