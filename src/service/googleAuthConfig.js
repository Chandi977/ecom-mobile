export const GOOGLE_WEB_CLIENT_ID =
  '1026066635700-31im5npn30egqt234fg6pf7l5jrpk1em.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID =
  '1026066635700-0obve1gtnek05sn56momcmlq4smomqds.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '';

export const GOOGLE_SIGNIN_SCOPES = ['email', 'profile'];

const hasValue = value => typeof value === 'string' && value.trim().length > 0;

export const isGoogleAuthConfigured = hasValue(GOOGLE_WEB_CLIENT_ID);

export const getGoogleAuthConfigMessage = () =>
  'Google sign-in requires GOOGLE_WEB_CLIENT_ID in ecom-mobile/src/service/googleAuthConfig.js and matching Google OAuth env values in the backend.';

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
