import StorageService from './storageService';
import ApiService from '../service/APIService';

/**
 * Guest Cart Service
 *
 * Lets a logged-out user build a cart that is persisted locally (encrypted
 * storage). On login the local cart is pushed to the user's server cart and
 * the local copy is cleared.
 *
 * A line item is uniquely identified by product._id + packSize, so the same
 * product in two different pack sizes stays as two lines, mirroring the server.
 *
 * Each stored line has the shape consumed by the Cart screen:
 *   { product, packSize, price, quantity }
 */

const GUEST_CART_KEY = 'guest_cart';

const isSameLine = (line, item) =>
  line?.product?._id === item?.product?._id && line?.packSize === item?.packSize;

const GuestCartService = {
  async getCart() {
    const cart = await StorageService.getItem(GUEST_CART_KEY);
    return Array.isArray(cart) ? cart : [];
  },

  async saveCart(cart) {
    await StorageService.setItem(GUEST_CART_KEY, cart);
    return cart;
  },

  /**
   * Add an item to the guest cart, merging quantity when the same line exists.
   * @param {{product: object, packSize: number, price: number, quantity: number}} item
   */
  async addItem(item) {
    const cart = await GuestCartService.getCart();
    const existingIndex = cart.findIndex(line => isSameLine(line, item));

    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.push({
        product: item.product,
        packSize: item.packSize,
        price: item.price,
        quantity: item.quantity || 1,
      });
    }

    return GuestCartService.saveCart(cart);
  },

  async removeItem(productId, packSize) {
    const cart = await GuestCartService.getCart();
    const next = cart.filter(line => {
      if (packSize !== undefined && packSize !== null) {
        return !(line.product?._id === productId && line.packSize === packSize);
      }
      return line.product?._id !== productId;
    });
    return GuestCartService.saveCart(next);
  },

  async setQuantity(productId, packSize, quantity) {
    const cart = await GuestCartService.getCart();
    const line = cart.find(
      l => l.product?._id === productId && l.packSize === packSize,
    );
    if (line) {
      line.quantity = Math.max(1, quantity);
    }
    return GuestCartService.saveCart(cart);
  },

  async getCount() {
    const cart = await GuestCartService.getCart();
    return cart.length;
  },

  async clear() {
    await StorageService.removeItem(GUEST_CART_KEY);
  },

  /**
   * Push every locally stored guest cart item to the given user's server cart,
   * then clear the local cart. Safe to call when the cart is empty.
   * @param {string} userId
   */
  async mergeToUser(userId) {
    if (!userId) return;

    const cart = await GuestCartService.getCart();
    if (!cart.length) return;

    for (const line of cart) {
      const product = line.product;
      const data = {
        product: {
          product: product?._id,
          packSize: line.packSize ?? product?.priceList?.[0]?.number,
          price: line.price ?? product?.priceList?.[0]?.SP,
          quantity: line.quantity,
          stock: 1000,
          totalWeight: product?.priceList?.[0]?.number,
          totalPackWeight: 0,
        },
        user: userId,
      };

      try {
        await ApiService.ADD_TO_CART(data);
      } catch (e) {
        console.log('Guest cart merge failed for item:', product?._id, e?.message);
      }
    }

    await GuestCartService.clear();
  },
};

export default GuestCartService;
