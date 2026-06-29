import { Platform, DeviceEventEmitter } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import ApiService from './APIService';
import StorageService from '../utils/storageService';
import { navigate } from '../navigation/navigationRef';

/**
 * Firebase Cloud Messaging (real device push) integration.
 *
 * The native library is loaded lazily so the JS bundle still builds before
 * `@react-native-firebase/*` is installed. To finish enabling push:
 *   1. yarn add @react-native-firebase/app @react-native-firebase/messaging  (already in package.json)
 *   2. add android/app/google-services.json (Firebase console) + iOS APNs setup
 *   3. set FCM_PROJECT_ID / FCM_CLIENT_EMAIL / FCM_PRIVATE_KEY on the backend
 * After a native rebuild, push fires end-to-end. The in-app feed keeps working
 * regardless as a fallback / history.
 */

const loadMessaging = () => {
  try {
    return require('@react-native-firebase/messaging').default;
  } catch (e) {
    return null;
  }
};

// Navigate based on the data payload the backend attaches (see custom-notification.service).
const handleDeepLink = async (remoteMessage) => {
  const data = remoteMessage?.data || {};
  if (data.type === 'order') {
    navigate('My Order');
  } else if (data.type === 'product' && data.productId) {
    // ProductDetails needs the full product object, so fetch it first.
    try {
      const res = await ApiService.GET_SINGLE_PRODUCT(data.productId);
      if (res?.data) {
        navigate('ProductDetails', { item: res.data });
        return;
      }
    } catch (e) {
      console.log('product deep-link failed', e?.message);
    }
    navigate('Notifications');
  } else {
    navigate('Notifications');
  }
};

/**
 * Request permission, fetch the FCM token and register it with the backend.
 * Works for guests too (no login required) — the backend stores the device with
 * no user and links it once the user signs in and this runs again with auth.
 */
export const registerForPush = async () => {
  const messaging = loadMessaging();
  if (!messaging) return null;
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return null;

    const fcmToken = await messaging().getToken();
    if (!fcmToken) return null;

    await ApiService.REGISTER_DEVICE({
      token: fcmToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    await StorageService.setItem('fcmToken', fcmToken);
    return fcmToken;
  } catch (e) {
    console.log('registerForPush failed:', e?.message);
    return null;
  }
};

/**
 * Wire foreground display + tap handlers. Call once after the app mounts.
 * Returns an unsubscribe function (no-op when the native module is absent).
 */
export const setupPushListeners = () => {
  const messaging = loadMessaging();
  if (!messaging) return () => {};

  const subscriptions = [];

  try {
    const instance = messaging();

    // Foreground messages don't show a system banner — surface them ourselves.
    subscriptions.push(
      instance.onMessage(async (remoteMessage) => {
        const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Notification';
        const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';
        showMessage({ message: title, description: body, type: 'info', duration: 4000 });
        DeviceEventEmitter.emit('notificationsUpdated');
      }),
    );

    // Re-register when FCM rotates the token.
    subscriptions.push(
      instance.onTokenRefresh(async (fcmToken) => {
        try {
          const authToken = await StorageService.getItem('authToken');
          if (authToken && fcmToken) {
            await ApiService.REGISTER_DEVICE({
              token: fcmToken,
              platform: Platform.OS === 'ios' ? 'ios' : 'android',
            });
            await StorageService.setItem('fcmToken', fcmToken);
          }
        } catch (e) {
          console.log('token refresh re-register failed:', e?.message);
        }
      }),
    );

    // Tapped while app was backgrounded.
    subscriptions.push(instance.onNotificationOpenedApp(handleDeepLink));

    // Tapped while app was quit (cold start).
    instance.getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) handleDeepLink(remoteMessage);
    });
  } catch (e) {
    console.log('setupPushListeners failed:', e?.message);
  }

  return () => subscriptions.forEach((unsub) => typeof unsub === 'function' && unsub());
};

export const unregisterFromPush = async () => {
  try {
    const fcmToken = await StorageService.getItem('fcmToken');
    if (fcmToken) {
      await ApiService.UNREGISTER_DEVICE({ token: fcmToken });
      await StorageService.removeItem('fcmToken');
    }
  } catch (e) {
    console.log('unregisterFromPush failed:', e?.message);
  }
};
