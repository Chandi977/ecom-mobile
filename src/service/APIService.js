import axios from 'axios';
import StorageService from '../utils/storageService';
import { BASE_URL, API_ENDPOINTS } from '../service/APIConfig';

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

apiClient.interceptors.request.use(
  async config => {
    const token = await StorageService.getItem('authToken');
    console.log('Retrieved Auth Token:', token ? '[PRESENT]' : '[MISSING]');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      {
        hasAuth: Boolean(config.headers.Authorization),
        data: config.data ? '[DATA]' : null,
      },
    );

    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.status}`, summarizeResponse(response.data));
    return response;
  },
  async error => {
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
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
    return ApiService.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
  },

  async VERIFY_SIGN_UP_USER_EMAIL(data) {
    return ApiService.post(API_ENDPOINTS.AUTH.VERIFY_SIGN_UP_USER_EMAIL, data);
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
    return ApiService.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, data);
  },

  async UNREGISTER_DEVICE(data) {
    return ApiService.post(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE, data);
  },

  _handleError(error) {
    return error;
  },
};

export default ApiService;
