export const GOOGLE_WEB_CLIENT_ID =
  '601110091773-dramqmft74qqrbsl60ll7fset546kdnq.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID =
  '601110091773-38hle89nm4a6s7ftqj5i48eftfticjke.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '';

export const GOOGLE_SIGNIN_SCOPES = ['email', 'profile'];

const hasValue = value => typeof value === 'string' && value.trim().length > 0;

export const isGoogleAuthConfigured = hasValue(GOOGLE_WEB_CLIENT_ID);

export const getGoogleAuthConfigMessage = () =>
  'Google sign-in requires GOOGLE_WEB_CLIENT_ID in ecom-mobile/src/service/googleAuthConfig.js and matching Google OAuth env values in the backend.';

export const getGoogleAndroidDependencyMessage = () =>
  'Google sign-in is not configured for this Android build. Add OAuth clients for com.store.prempackaging with the debug and release SHA-1 fingerprints in Google Console/Firebase, then replace android/app/google-services.json.';

export const getGoogleSigninConfig = () => {
  if (!isGoogleAuthConfigured) {
    return null;
  }

  const config = {
    scopes: GOOGLE_SIGNIN_SCOPES,
    offlineAccess: false,
    webClientId: GOOGLE_WEB_CLIENT_ID.trim(),
  };

  if (hasValue(GOOGLE_IOS_CLIENT_ID)) {
    config.iosClientId = GOOGLE_IOS_CLIENT_ID.trim();
  }

  return config;
};
