import ApiService from './APIService';
import { navigate } from '../navigation/navigationRef';

/**
 * Single source of truth for notification deep-linking. Both the push tap
 * handlers (pushNotifications.js) and the in-app feed (Notifications.jsx) route
 * through here so the behaviour can't drift. The `data` object is the payload the
 * backend attaches to a notification (see custom-notification.service on the API).
 *
 * Supported shapes:
 *   { type: 'order',   orderId }    -> opens that order (falls back to the list)
 *   { type: 'product', productId }  -> opens the product (fetches it first)
 *   anything else                   -> opens the notifications feed
 */
export const resolveDeepLink = async (data = {}) => {
  const payload = data || {};
  if (__DEV__) console.log('[DeepLink] resolving type:', payload.type || 'default', payload);

  switch (payload.type) {
    case 'order': {
      if (payload.orderId) {
        try {
          const res = await ApiService.GET_ORDER_BY_ID(payload.orderId);
          if (res?.data) {
            navigate('OrderDetails', { item: res.data });
            return;
          }
        } catch (e) {
          if (__DEV__) console.log('order deep-link failed', e?.message);
        }
      }
      navigate('My Order');
      return;
    }

    case 'product': {
      if (payload.productId) {
        try {
          const res = await ApiService.GET_SINGLE_PRODUCT(payload.productId);
          if (res?.data) {
            navigate('ProductDetails', { item: res.data });
            return;
          }
        } catch (e) {
          if (__DEV__) console.log('product deep-link failed', e?.message);
        }
      }
      navigate('Notifications');
      return;
    }

    default:
      navigate('Notifications');
  }
};
