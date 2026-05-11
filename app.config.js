const { expo } = require('./app.json');

const normalizeUrl = (value) => String(value || '').replace(/\/+$/, '');

const apiBaseUrl = normalizeUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/premind/api/'
);

const razorpayKey =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
  'rzp_test_S5d35tFimPrrMn';

const googleClientId =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '1026066635700-k73kiv35lm3m5sh6ukl1k4uge52mshd0.apps.googleusercontent.com';

const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  googleClientId;

const googleAndroidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  process.env.GOOGLE_ANDROID_CLIENT_ID ||
  googleWebClientId;

const googleIosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  process.env.GOOGLE_IOS_CLIENT_ID ||
  googleWebClientId;

module.exports = {
  expo: {
    ...expo,
    extra: {
      ...(expo.extra || {}),
      apiBaseUrl,
      razorpayKey,
      googleClientId,
      googleWebClientId,
      googleAndroidClientId,
      googleIosClientId,
    },
  },
};
