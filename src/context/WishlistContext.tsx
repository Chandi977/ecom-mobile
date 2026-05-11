import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiGet, apiPost } from '../services/api';
import {
  clearGuestWishlist,
  getGuestWishlist,
  setGuestWishlist,
} from '../services/storage';
import { useAuth } from './AuthContext';
import { useUpdateWishlistCount } from './WishlistCountContext';

export interface WishItem {
  product: any;
  quantity?: number;
  price?: number;
  packSize?: number;
}

interface WishlistValue {
  items: WishItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (product: any) => Promise<{ ok: boolean; message: string }>;
  remove: (productId: string) => Promise<{ ok: boolean; message: string }>;
  has: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistValue | null>(null);

function pid(item: any): string {
  const p = item?.product;
  if (p && typeof p === 'object') return String(p._id || p.id || '');
  return String(p || '');
}

function defaultPayload(product: any) {
  const priceOption = Array.isArray(product?.priceList) ? product.priceList[0] : null;
  return {
    product: product?._id,
    quantity: 1,
    price: Number(priceOption?.SP ?? product?.price ?? 0),
    discountPrice: 0,
    totalPackWeight: Number(priceOption?.pack_weight ?? 0),
    packSize: Number(priceOption?.number ?? 1),
    brand:
      typeof product?.brand === 'object' ? product?.brand?.name || '' : product?.brand || '',
    category:
      typeof product?.category === 'object'
        ? product?.category?.name || ''
        : product?.category || '',
  };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(false);
  const setWishlistCount = useUpdateWishlistCount();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (token && user?._id) {
        const res = await apiGet<any>(`wishlist/${user._id}`);
        if (res.ok) {
          const products = res.data?.products || [];
          setItems(products);
        } else {
          setItems([]);
        }
      } else {
        const guest = await getGuestWishlist();
        setItems(guest);
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  // Sync guest wishlist into server on login
  useEffect(() => {
    (async () => {
      if (token && user?._id) {
        const guest = await getGuestWishlist();
        if (guest.length) {
          for (const it of guest) {
            const product = it?.product;
            if (!product?._id) continue;
            await apiPost('AddtoWishlist', {
              user: user._id,
              product: defaultPayload(product),
            });
          }
          await clearGuestWishlist();
        }
      }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?._id]);

  const add = useCallback(
    async (product: any) => {
      if (!product?._id) return { ok: false, message: 'Invalid product.' };
      const exists = items.some((x) => pid(x) === String(product._id));
      if (exists) return { ok: true, message: 'Item is already in favourites.' };
      if (!token || !user?._id) {
        const next = [...items, { product }];
        setItems(next);
        await setGuestWishlist(next);
        return { ok: true, message: 'Item added in favourites.' };
      }
      const res = await apiPost('AddtoWishlist', {
        user: user._id,
        product: defaultPayload(product),
      });
      if (res.ok) {
        setItems((s) => [...s, { product }]);
        return { ok: true, message: res.message || 'Added to favourites.' };
      }
      return { ok: false, message: res.message };
    },
    [items, token, user?._id],
  );

  const remove = useCallback(
    async (productId: string) => {
      if (!productId) return { ok: false, message: 'Missing product id.' };
      if (!token || !user?._id) {
        const next = items.filter((x) => pid(x) !== String(productId));
        setItems(next);
        await setGuestWishlist(next);
        return { ok: true, message: 'Removed from favourites.' };
      }
      const res = await apiPost('removefromwishlist', {
        user: user._id,
        product: productId,
      });
      if (res.ok) {
        setItems((s) => s.filter((x) => pid(x) !== String(productId)));
        return { ok: true, message: res.message || 'Removed.' };
      }
      return { ok: false, message: res.message };
    },
    [items, token, user?._id],
  );

  const has = useCallback(
    (productId: string) => items.some((x) => pid(x) === String(productId)),
    [items],
  );

  const value = useMemo<WishlistValue>(
    () => ({ items, loading, refresh, add, remove, has, count: items.length }),
    [items, loading, refresh, add, remove, has],
  );

  useEffect(() => { setWishlistCount(items.length); }, [items.length, setWishlistCount]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
