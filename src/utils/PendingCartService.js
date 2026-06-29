let pendingCartItem = null;

const PendingCartService = {
  set(product, count = 1) {
    pendingCartItem = { product, count };
  },

  get() {
    return pendingCartItem;
  },

  clear() {
    pendingCartItem = null;
  },
};

export default PendingCartService;
