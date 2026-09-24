import axios from 'axios';
import StorageService from '../utils/storageService';
import { BASE_URL, FALLBACK_BASE_URL, API_ENDPOINTS } from '../service/APIConfig';

let cachedAuthToken = null;

const setAuthToken = token => {
  cachedAuthToken = token;
};

const clearAuthToken = () => {
  cachedAuthToken = null;
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

const summarizeResponse = data => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return `[${data.length} items]`;
  }

  const summary = { ...data };
  if (Array.isArray(summary.data)) {
    summary.data = `[${summary.data.length} items]`;
  } else if (summary.data && typeof summary.data === 'object') {
    summary.data = '[OBJECT]';
  }

  return summary;
};

const canRetryOnFallbackBackend = error => {
  const status = error?.response?.status;
  return !status || [404, 502, 503, 504].includes(status);
};

apiClient.interceptors.request.use(
  async config => {
    if (!cachedAuthToken) {
      cachedAuthToken = await StorageService.getItem('authToken');
    }
    if (cachedAuthToken) {
      config.headers.Authorization = `Bearer ${cachedAuthToken}`;
    }

    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${
          config.url
        }`,
        {
          hasAuth: Boolean(config.headers.Authorization),
          data: config.data ? '[DATA]' : null,
        },
      );
    }

    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`[API Response] ${response.status}`, summarizeResponse(response.data));
    }
    return response;
  },
  async error => {
    if (__DEV__) {
      console.error('[API Error]', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
      });
    }

    if (error.response?.status === 401) {
      cachedAuthToken = null;
      await StorageService.removeItem('authToken');
      await StorageService.removeItem('refreshToken');
      await StorageService.removeItem('user_data');
      await StorageService.removeItem('user');
    }

    return Promise.reject(error);
  },
);

const ApiService = {
  async get(endpoint, config = {}) {
    try {
      const response = await apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async postWithFallbackBackend(endpoint, data = {}, config = {}) {
    try {
      return await ApiService.post(endpoint, data, config);
    } catch (error) {
      if (
        !FALLBACK_BASE_URL ||
        FALLBACK_BASE_URL === BASE_URL ||
        !canRetryOnFallbackBackend(error)
      ) {
        throw error;
      }

      try {
        const response = await apiClient.post(endpoint, data, {
          ...config,
          baseURL: FALLBACK_BASE_URL,
        });
        return response.data;
      } catch (fallbackError) {
        throw this._handleError(fallbackError);
      }
    }
  },

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await apiClient.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async patch(endpoint, data = {}, config = {}) {
    try {
      const response = await apiClient.patch(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async delete(endpoint, config = {}) {
    try {
      const response = await apiClient.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async multipartPost(endpoint, formData) {
    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: data => data,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  async SIGNUP_USER(data) {
    return ApiService.post(API_ENDPOINTS.AUTH.SIGNUP_USER, data);
  },

  async LOGIN_USER(data) {
    return ApiService.post(API_ENDPOINTS.AUTH.LOGIN_USER, data);
  },

  async GOOGLE_LOGIN(data) {
    return ApiService.postWithFallbackBackend(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
  },

  async VERIFY_SIGN_UP_USER_EMAIL(data) {
    return ApiService.post(API_ENDPOINTS.AUTH.VERIFY_SIGN_UP_USER_EMAIL, data);
  },

  // Re-issues the signup verification OTP (expects { email }).
  async RE_VERIFY_EMAIL(data) {
    return ApiService.post(API_ENDPOINTS.AUTH.RE_VERIFY_EMAIL, data);
  },

  async SEND_OTP_ON_EMAIL(data) {
    return ApiService.post(API_ENDPOINTS.PASSWORD.SEND_OTP_ON_EMAIL, data);
  },
  async VERIFY_OTP(data) {
    return ApiService.post(API_ENDPOINTS.PASSWORD.VERIFY_OTP, data);
  },

  async DELETE_USER(data) {
    return ApiService.post(API_ENDPOINTS.USER.DELETE_USER, data);
  },

  async CHANGE_PASSWORD(data) {
    return ApiService.post(API_ENDPOINTS.PASSWORD.CHANGE_PASSWORD, data);
  },

  async GET_ALL_PRODUCTS() {
    return ApiService.get(API_ENDPOINTS.PRODUCTS.GET_ALL_PRODUCTS);
  },

  async GET_SINGLE_PRODUCT(id) {
    return ApiService.get(`${API_ENDPOINTS.PRODUCTS.GET_SINGLE_PRODUCT}${id}`);
  },

  // Fetch a fully-populated product by slug (product detail's preferred path —
  // matches the web SSR fetch, so the detail screen never renders a stale/partial
  // list object).
  async GET_PRODUCT_BY_SLUG(slug) {
    return ApiService.get(
      `${API_ENDPOINTS.PRODUCTS.GET_PRODUCT_BY_SLUG}${encodeURIComponent(slug)}`,
    );
  },

  // Curated related/buy-it-with products are stored as an array of product ids;
  // resolve each to a full product (with signed images) by id.
  async GET_RELATED_PRODUCT_DETAILS_BY_ID(id) {
    return ApiService.get(`${API_ENDPOINTS.PRODUCTS.GET_SINGLE_PRODUCT}${id}`);
  },

  // Server-side, paginated catalog filtering — the scalable replacement for
  // pulling GET_ALL_PRODUCTS and filtering on the client. Accepts
  // { category, brand, subcategory, q, skip, limit, includeMeta, ...ranges }.
  async FILTER_PRODUCTS(payload = {}) {
    return ApiService.post(API_ENDPOINTS.PRODUCTS.FILTER_PRODUCTS, payload);
  },

  async SEARCH_PRODUCT(params) {
    return ApiService.get(API_ENDPOINTS.PRODUCTS.SEARCH_PRODUCT, { params });
  },

  async HOME_PRODUCTS_SEARCH(data) {
    return ApiService.post(API_ENDPOINTS.PRODUCTS.HOME_PRODUCTS_SEARCH, data);
  },

  // CATEGORIES
  async GET_ALL_CATEGORIES() {
    return ApiService.get(API_ENDPOINTS.CATEGORIES.GET_ALL_CATEGORIES);
  },

  async GET_ALL_BRANDS() {
    return ApiService.get(API_ENDPOINTS.BRANDS.GET_ALL_BRANDS);
  },

  // CART
  async GET_CART_PRODUCTS(id) {
    return ApiService.get(`${API_ENDPOINTS.CART.GET_CART_PRODUCTS}${id}`);
  },

  async ADD_TO_CART(data) {
    return ApiService.post(API_ENDPOINTS.CART.ADD_TO_CART, data);
  },

  async REMOVE_FROM_CART(data) {
    return ApiService.post(API_ENDPOINTS.CART.REMOVE_FROM_CART, data);
  },

  async EMPTY_CART(data) {
    return ApiService.post(API_ENDPOINTS.CART.EMPTY_CART, data);
  },

  async GET_TOTAL_CART_COUNT(id) {
    return ApiService.get(`${API_ENDPOINTS.CART.GET_TOTAL_CART_COUNT}${id}`);
  },

  // COMBO ORDERS
  async GET_ALL_COMBOS() {
    return ApiService.get(API_ENDPOINTS.COMBO_ORDERS.GET_ALL_COMBOS);
  },

  async GET_COMBO_BY_SLUG(slug) {
    return ApiService.get(
      `${API_ENDPOINTS.COMBO_ORDERS.GET_COMBO_BY_SLUG}${encodeURIComponent(
        slug,
      )}`,
    );
  },

  // WISHLIST
  async GET_WISHLIST_PRODUCTS(id) {
    return ApiService.get(
      `${API_ENDPOINTS.WISHLIST.GET_WISHLIST_PRODUCTS}${id}`,
    );
  },

  async ADD_TO_WISHLIST(data) {
    return ApiService.post(API_ENDPOINTS.WISHLIST.ADD_TO_WISHLIST, data);
  },

  async REMOVE_FROM_WISHLIST(data) {
    return ApiService.post(API_ENDPOINTS.WISHLIST.REMOVE_FROM_WISHLIST, data);
  },

  async GET_TOTAL_WISHLIST_COUNT(id) {
    return ApiService.get(
      `${API_ENDPOINTS.WISHLIST.GET_TOTAL_WISHLIST_COUNT}${id}`,
    );
  },

  // ORDERS
  async PLACE_ORDER(data) {
    return ApiService.post(API_ENDPOINTS.ORDERS.PLACE_ORDER, data);
  },

  async CREATE_RAZORPAY_ORDER(data) {
    return ApiService.post(API_ENDPOINTS.ORDERS.CREATE_RAZORPAY_ORDER, data);
  },

  async UPDATE_PAYMENT_STATUS(data) {
    return ApiService.put(API_ENDPOINTS.ORDERS.UPDATE_PAYMENT_STATUS, data);
  },

  async GET_ALL_ORDERS(userId) {
    return ApiService.get(`${API_ENDPOINTS.ORDERS.GET_ALL_ORDERS}${userId}`);
  },

  async GET_ORDER_BY_ID(id) {
    return ApiService.get(`${API_ENDPOINTS.ORDERS.GET_ORDER_BY_ID}${id}`);
  },

  // USER
  async UPDATE_PROFILE(data) {
    return ApiService.post(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  },

  async GET_SPECIFIC_USER_DETAILS(id) {
    return ApiService.get(
      `${API_ENDPOINTS.USER.GET_SPECIFIC_USER_DETAILS}${id}`,
    );
  },

  // PRIVACY PREFERENCES
  async GET_PRIVACY_PREFERENCES() {
    return ApiService.get(API_ENDPOINTS.USER.GET_PRIVACY_PREFERENCES);
  },

  async UPDATE_PRIVACY_PREFERENCES(data) {
    return ApiService.put(API_ENDPOINTS.USER.UPDATE_PRIVACY_PREFERENCES, data);
  },

  // COUPONS
  async GET_ALL_COUPON() {
    return ApiService.get(API_ENDPOINTS.COUPONS.GET_ALL_COUPON);
  },

  async GET_COUPON_BY_COUPON_CODE(code) {
    return ApiService.get(
      `${API_ENDPOINTS.COUPONS.GET_COUPON_BY_COUPON_CODE}${code}`,
    );
  },

  // ADDRESS
  async ADD_ADDRESS(data) {
    return ApiService.post(API_ENDPOINTS.ADDRESS.ADD_ADDRESS, data);
  },

  async EDIT_ADDRESS(data) {
    return ApiService.post(API_ENDPOINTS.ADDRESS.EDIT_ADDRESS, data);
  },

  async REMOVE_ADDRESS(data) {
    return ApiService.post(API_ENDPOINTS.ADDRESS.REMOVE_ADDRESS, data);
  },

  // CUSTOM
  async CUSTOM_PACKAGING(data) {
    return ApiService.post(API_ENDPOINTS.CUSTOM.CUSTOM_PACKAGING, data);
  },

  // Notify Button
  async NOTIFY_PRODUCT(data) {
    return ApiService.post(API_ENDPOINTS.PRODUCTS.NOTIFY_PRODUCT, data);
  },

  // Contact/Report Form
  async SUBMIT_REPORT(data) {
    return ApiService.post(API_ENDPOINTS.CONTACT.CREATE_CONTACT, data);
  },

  // NOTIFICATIONS
  async GET_NOTIFICATIONS(params) {
    return ApiService.get(API_ENDPOINTS.NOTIFICATIONS.GET_FEED, { params });
  },

  async GET_NOTIFICATION_UNREAD_COUNT() {
    return ApiService.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  },

  async MARK_NOTIFICATION_READ(id) {
    return ApiService.put(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}${id}/read`);
  },

  async MARK_ALL_NOTIFICATIONS_READ() {
    return ApiService.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  async REGISTER_DEVICE(data) {
    return ApiService.postWithFallbackBackend(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data);
  },

  async UNREGISTER_DEVICE(data) {
    return ApiService.postWithFallbackBackend(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE, data);
  },

  // REVIEWS
  async GET_PRODUCT_REVIEWS(productId, params = {}) {
    return ApiService.get(`${API_ENDPOINTS.REVIEWS.GET_PRODUCT_REVIEWS}${productId}`, { params });
  },

  async GET_REVIEW_SUMMARY(productId) {
    return ApiService.get(`${API_ENDPOINTS.REVIEWS.GET_SUMMARY}${productId}`);
  },

  async GET_REVIEW_ELIGIBILITY(productId) {
    return ApiService.get(`${API_ENDPOINTS.REVIEWS.GET_ELIGIBILITY}${productId}`);
  },

  async GET_MY_REVIEW(productId) {
    return ApiService.get(`${API_ENDPOINTS.REVIEWS.GET_MINE}${productId}`);
  },

  async CREATE_REVIEW(data) {
    return ApiService.post(API_ENDPOINTS.REVIEWS.CREATE_REVIEW, data);
  },

  async UPDATE_REVIEW(id, data) {
    return ApiService.patch(`${API_ENDPOINTS.REVIEWS.UPDATE_REVIEW}${id}`, data);
  },

  async MARK_REVIEW_HELPFUL(id) {
    return ApiService.post(`${API_ENDPOINTS.REVIEWS.MARK_HELPFUL}${id}/helpful`, {});
  },

  _handleError(error) {
    return error;
  },

  setAuthToken,
  clearAuthToken,
};

export default ApiService;
