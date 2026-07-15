import ApiService from './APIService';
import GuestCartService from '../utils/GuestCartService';
import StorageService from '../utils/storageService';
import { parseStoredUser } from '../utils/HelperFunction';
import { getPrimaryPriceTier } from '../utils/productCatalog';

/**
 * CartService — the single entry point for all cart mutations.
 *
 * It abstracts *where* the cart lives so callers never have to branch on auth
 * state themselves:
 *   - Guest (logged-out) → items are persisted locally via GuestCartService
 *     (encrypted storage), so they survive app restarts.
 *   - Logged-in user     → items go to the server via ApiService, exactly as
 *     the existing authenticated flow already does.
 *
 * Every method resolves the current user first, then delegates. Callers get a
 * consistent result shape and can stay agnostic about guest vs. server carts.
 *
 * A line item is uniquely identified by (product._id + packSize) on both sides,
 * so the same product in two pack sizes stays as two lines.
 */

/**
 * Read the persisted session user and return their id, or null for a guest.
 * @returns {Promise<string|null>}
 */
async function getCurrentUserId() {
  try {
    const stored = await StorageService.getItem('user_data');
    const user = parseStoredUser(stored);
    return user?._id || null;
  } catch (e) {
    console.log('CartService: failed to resolve current user:', e?.message);
    return null;
  }
}

/**
 * Build the payload shape the server's ADD_TO_CART endpoint expects. Defaults
 * are pulled from the product's first price tier when a value is not supplied,
 * mirroring the shapes used by the existing add-to-cart call sites.
 *
 * `brand` / `category` are only attached when provided (the product-details
 * screen sends them; the product-list screens do not).
 */
function buildServerCartItem(product, options, userId) {
  const { packSize, price, quantity, brand, category } = options || {};
  const firstTier = getPrimaryPriceTier(product);

  const item = {
    product: product?._id,
    packSize: packSize ?? firstTier.number,
    price: price ?? firstTier.SP,
    quantity: quantity ?? 1,
    stock: 1000,
    totalWeight: firstTier.number,
    totalPackWeight: 0,
  };

  if (brand) {
    item.brand = brand;
  }
  if (category) {
    item.category = category;
  }

  return { product: item, user: userId };
}

const CartService = {
  /** @returns {Promise<boolean>} true when no user is logged in. */
  async isGuest() {
    return (await getCurrentUserId()) === null;
  },

  /**
   * Fetch the current cart's line items.
   * @returns {Promise<Array>} always an array (never null), so callers can map
   *   safely even on error.
   */
  async getCart() {
    const userId = await getCurrentUserId();

    if (!userId) {
      return GuestCartService.getCart();
    }

    try {
      const response = await ApiService.GET_CART_PRODUCTS(userId);
      return response?.data?.products || [];
    } catch (e) {
      console.log('CartService.getCart failed:', e?.message);
      return [];
    }
  },

  /**
   * Cart badge count.
   * @returns {Promise<number>}
   */
  async getCount() {
    const userId = await getCurrentUserId();

    if (!userId) {
      return GuestCartService.getCount();
    }

    try {
      const response = await ApiService.GET_TOTAL_CART_COUNT(userId);
      return response?.data?.count || 0;
    } catch (e) {
      console.log('CartService.getCount failed:', e?.message);
      return 0;
    }
  },

  /**
   * Add a product to the active cart, merging quantity onto an existing line
   * where appropriate (guest side merges locally; the server increments its
   * own matching line).
   *
   * @param {object} product        the full product object
   * @param {object} [options]
   * @param {number} [options.packSize] pack size (defaults to first price tier)
   * @param {number} [options.price]    unit price   (defaults to first tier SP)
   * @param {number} [options.quantity] quantity to add (default 1)
   * @param {string} [options.brand]    brand id (server payload only)
   * @param {string} [options.category] category id (server payload only)
   * @returns {Promise<{success: boolean, guest: boolean, error?: any}>}
   */
  async addToCart(product, options = {}) {
    const userId = await getCurrentUserId();
    const firstTier = getPrimaryPriceTier(product);
    const {
      packSize = firstTier.number,
      price = firstTier.SP,
      quantity = 1,
    } = options;

    try {
      if (!userId) {
        await GuestCartService.addItem({ product, packSize, price, quantity });
        return { success: true, guest: true };
      }

      const response = await ApiService.ADD_TO_CART(
        buildServerCartItem(product, { ...options, packSize, price, quantity }, userId),
      );
      return { success: Boolean(response?.success), guest: false };
    } catch (e) {
      console.log('CartService.addToCart failed:', e?.message);
      return { success: false, guest: !userId, error: e };
    }
  },

  /**
   * Remove a line from the active cart.
   * @param {string} productId
   * @param {number} [packSize] identifies the exact line for guests; the server
   *   removes by product for the current user.
   * @returns {Promise<{success: boolean, guest: boolean, error?: any}>}
   */
  async removeFromCart(productId, packSize) {
    const userId = await getCurrentUserId();

    try {
      if (!userId) {
        await GuestCartService.removeItem(productId, packSize);
        return { success: true, guest: true };
      }

      const response = await ApiService.REMOVE_FROM_CART({
        product: productId,
        user: userId,
      });
      return { success: Boolean(response?.success), guest: false };
    } catch (e) {
      console.log('CartService.removeFromCart failed:', e?.message);
      return { success: false, guest: !userId, error: e };
    }
  },

  /**
   * Set an absolute quantity for a line.
   *
   * Fully supported for guests. The backend currently exposes no
   * "update quantity" endpoint (only add / remove / empty), so for logged-in
   * users this is reported as unsupported rather than faked — keeping the
   * abstraction honest. No cart UI calls this for server carts today.
   *
   * @returns {Promise<{success: boolean, guest: boolean, unsupported?: boolean}>}
   */
  async updateQuantity(productId, packSize, quantity) {
    const userId = await getCurrentUserId();

    if (!userId) {
      try {
        await GuestCartService.setQuantity(productId, packSize, quantity);
        return { success: true, guest: true };
      } catch (e) {
        console.log('CartService.updateQuantity failed:', e?.message);
        return { success: false, guest: true, error: e };
      }
    }

    console.log(
      'CartService.updateQuantity: no server endpoint for absolute quantity; skipped.',
    );
    return { success: false, guest: false, unsupported: true };
  },

  /**
   * Empty the active cart.
   * @returns {Promise<{success: boolean, guest: boolean, error?: any}>}
   */
  async clearCart() {
    const userId = await getCurrentUserId();

    try {
      if (!userId) {
        await GuestCartService.clear();
        return { success: true, guest: true };
      }

      const response = await ApiService.EMPTY_CART({ id: userId });
      return { success: Boolean(response?.success), guest: false };
    } catch (e) {
      console.log('CartService.clearCart failed:', e?.message);
      return { success: false, guest: !userId, error: e };
    }
  },

  /**
   * Push every locally-stored guest cart line onto the given user's server cart
   * after they log in, then reconcile local storage.
   *
   * Robustness contract (per requirements):
   *   - Each line is pushed via ADD_TO_CART, so the server increments quantity
   *     on any line the user already had — no duplicates.
   *   - The local cart is cleared ONLY when every line synced successfully.
   *   - On partial failure, successfully-synced lines are dropped from local
   *     storage and the failed lines are kept, so a later retry (next login or
   *     app open) neither loses items nor double-adds the ones already synced.
   *
   * Safe to call when there is nothing to sync.
   *
   * @param {string} userId
   * @returns {Promise<{synced: number, failed: number}>}
   */
  async syncGuestCartAfterLogin(userId) {
    if (!userId) {
      return { synced: 0, failed: 0 };
    }

    const cart = await GuestCartService.getCart();
    if (!cart.length) {
      return { synced: 0, failed: 0 };
    }

    const failedLines = [];
    let synced = 0;

    for (const line of cart) {
      try {
        await ApiService.ADD_TO_CART(
          buildServerCartItem(
            line.product,
            {
              packSize: line.packSize,
              price: line.price,
              quantity: line.quantity,
            },
            userId,
          ),
        );
        synced += 1;
      } catch (e) {
        console.log(
          'Guest cart sync failed for item:',
          line?.product?._id,
          e?.message,
        );
        failedLines.push(line);
      }
    }

    if (failedLines.length === 0) {
      // Everything landed on the server — safe to wipe the local cart.
      await GuestCartService.clear();
    } else {
      // Keep only what did not sync so a retry won't re-add the rest.
      await GuestCartService.saveCart(failedLines);
    }

    return { synced, failed: failedLines.length };
  },
};

export default CartService;
