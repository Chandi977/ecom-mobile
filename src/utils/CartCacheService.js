import StorageService from './storageService';

/**
 * Cart Cache Service
 *
 * Stale-while-revalidate cache for a logged-in user's server cart. The last
 * known cart snapshot (and badge count) are persisted locally so the Cart
 * screen and header badge can paint instantly, then the fresh server copy is
 * fetched in the background and written back here.
 *
 * Everything is keyed by userId so a cached cart is never shown to a different
 * account. Guest carts are handled separately by GuestCartService.
 */

const PRODUCTS_KEY = 'cart_products_cache_v1';
const COUNT_KEY = 'cart_count_cache_v1';

const CartCacheService = {
  /**
   * @param {string} userId
   * @returns {Promise<Array|null>} cached products, or null when there is no
   *   snapshot for this user yet.
   */
  async getProducts(userId) {
    if (!userId) return null;
    const cache = await StorageService.getItem(PRODUCTS_KEY);
    if (cache && cache.userId === userId && Array.isArray(cache.products)) {
      return cache.products;
    }
    return null;
  },

  async setProducts(userId, products) {
    if (!userId) return;
    await StorageService.setItem(PRODUCTS_KEY, {
      userId,
      products: Array.isArray(products) ? products : [],
      updatedAt: Date.now(),
    });
  },

  /**
   * @param {string} userId
   * @returns {Promise<number|null>} cached badge count, or null when unknown.
   */
  async getCount(userId) {
    if (!userId) return null;
    const cache = await StorageService.getItem(COUNT_KEY);
    if (cache && cache.userId === userId && typeof cache.count === 'number') {
      return cache.count;
    }
    return null;
  },

  async setCount(userId, count) {
    if (!userId) return;
    await StorageService.setItem(COUNT_KEY, {
      userId,
      count: Number(count) || 0,
      updatedAt: Date.now(),
    });
  },

  /** Drop the cached cart. Call on logout so the next user starts clean. */
  async clear() {
    await StorageService.removeItem(PRODUCTS_KEY);
    await StorageService.removeItem(COUNT_KEY);
  },
};

export default CartCacheService;
