import StorageService from './storageService';

/**
 * Guest Cart Service
 *
 * Pure *local* cart storage for a logged-out user, persisted in encrypted
 * storage so it survives app restarts. This module intentionally knows nothing
 * about the server or auth — pushing the local cart to a user's server cart on
 * login is handled by CartService.syncGuestCartAfterLogin, keeping guest and
 * authenticated logic cleanly separated.
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
};

export default GuestCartService;
