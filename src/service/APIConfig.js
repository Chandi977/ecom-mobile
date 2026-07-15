import { Platform } from 'react-native';

// Development uses the local backend with dev tunnel fallback; release uses production only.
const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const LOCAL_BASE_URL = `http://${LOCAL_HOST}:5000/premind/api/`;
const DEV_BASE_URL = 'https://307h8lvv-5000.inc1.devtunnels.ms/premind/api/';
const PROD_BASE_URL = 'https://server.prempackaging.com/premind/api/';

export const BASE_URL = __DEV__ ? LOCAL_BASE_URL : PROD_BASE_URL;
export const FALLBACK_BASE_URL = __DEV__ ? DEV_BASE_URL : '';
export const LOCAL_API_BASE_URL = LOCAL_BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP_USER: 'signup',
    LOGIN_USER: 'signin',
    GOOGLE_LOGIN: 'auth/google',
    VERIFY_SIGN_UP_USER_EMAIL: 'verify/email',
    RE_VERIFY_EMAIL: 're/verify/email',
  },

  PASSWORD: {
    SEND_OTP_ON_EMAIL: 'reset/password/otp',
    VERIFY_OTP: 'reset/password/verify/otp',
    CHANGE_PASSWORD: 'reset/password/update',
  },

  PRODUCTS: {
    GET_ALL_PRODUCTS: 'product/all',
    GET_SINGLE_PRODUCT: 'product/get/id/',
    GET_PRODUCT_BY_SLUG: 'product/get/', // append `${slug}`
    GET_SINGLE_PRODUCT_WITH_IMAGE: 'product/image/single/', // append `${id}`
    FILTER_PRODUCTS: 'product/filter',
    SEARCH_PRODUCT: 'product/search',
    HOME_PRODUCTS_SEARCH: 'product/main/search',
    NOTIFY_PRODUCT: 'notify/create',
  },

  CATEGORIES: {
    GET_ALL_CATEGORIES: 'category/all',
  },

  BRANDS: {
    GET_ALL_BRANDS: 'brand/all',
  },

  CART: {
    GET_CART_PRODUCTS: 'cart/',
    ADD_TO_CART: 'AddtoCart',
    REMOVE_FROM_CART: 'removefromcart',
    EMPTY_CART: 'emptyCart',
    GET_TOTAL_CART_COUNT: 'cart/count/',
  },

  WISHLIST: {
    GET_WISHLIST_PRODUCTS: 'wishlist/',
    ADD_TO_WISHLIST: 'AddtoWishlist',
    REMOVE_FROM_WISHLIST: 'removefromwishlist',
    GET_TOTAL_WISHLIST_COUNT: 'wishlist/count/',
  },

  ORDERS: {
    PLACE_ORDER: 'order/create',
    GET_ALL_ORDERS: 'my/orders/',
    GET_ORDER_BY_ID: 'order/get/',
    CREATE_RAZORPAY_ORDER: 'order/create/payment',
    UPDATE_PAYMENT_STATUS: 'order/update/payment/status',
  },

  USER: {
    UPDATE_PROFILE: 'edituser',
    GET_SPECIFIC_USER_DETAILS: 'getuser/',
    DELETE_USER: 'deleteUser',
    GET_PRIVACY_PREFERENCES: 'user/privacy-preferences',
    UPDATE_PRIVACY_PREFERENCES: 'user/privacy-preferences',
  },

  COUPONS: {
    GET_ALL_COUPON: 'coupon/get/all',
    GET_COUPON_BY_COUPON_CODE: 'coupon/get/code/',
  },

  ADDRESS: {
    ADD_ADDRESS: 'edituser',
    EDIT_ADDRESS: 'edituser',
    REMOVE_ADDRESS: 'edituser',
  },

  CUSTOM: {
    CUSTOM_PACKAGING: 'custom-packaging',
  },

  CONTACT: {
    CREATE_CONTACT: 'contact-form/create',
  },

  NOTIFICATIONS: {
    GET_FEED: 'notification/feed',
    UNREAD_COUNT: 'notification/feed/unread-count',
    MARK_READ: 'notification/feed/', // append `${id}/read`
    MARK_ALL_READ: 'notification/feed/read-all',
    REGISTER_DEVICE: 'notification/device/register',
    UNREGISTER_DEVICE: 'notification/device/unregister',
  },
};
