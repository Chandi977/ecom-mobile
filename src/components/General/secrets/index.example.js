// Template for src/components/General/secrets/index.js (which is git-ignored so
// keys never enter the repo). Copy this file to index.js and fill in real values.
//
// SECURITY: the Razorpay SECRET key must NEVER live in the mobile app — it ships
// inside the APK/IPA. Move any secret-key signing (order creation, payment
// verification) to the backend and keep only the public key id on the client.
export const RAZORPAY_PAYMENT_KEY = 'YOUR_RAZORPAY_KEY_ID';
export const RAZORPAY_SECRET_KEY = '';
