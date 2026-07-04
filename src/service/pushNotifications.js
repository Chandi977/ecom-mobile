import { Platform, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import ApiService from './APIService';
import StorageService from '../utils/storageService';
import { resolveDeepLink } from './deepLink';

/**
 * Firebase Cloud Messaging + Notifee (real device push) integration.
 *
 * Both native libraries are loaded lazily so the JS bundle still builds before
 * they're installed. To finish enabling push:
 *   1. yarn add @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
 *   2. android/app/google-services.json (Firebase console) + iOS APNs setup
 *   3. set FCM_PROJECT_ID / FCM_CLIENT_EMAIL / FCM_PRIVATE_KEY on the backend
 * After a native rebuild, push fires end-to-end. The in-app feed keeps working
 * regardless as a fallback / history.
 *
 * Notifee provides what messaging alone cannot: notification channels, real
 * foreground notifications, and rich display (big picture / big text / actions).
 */

const BRAND_COLOR = '#F02020';
const SMALL_ICON = 'ic_notification';

const loadMessaging = () => {
  try {
    return require('@react-native-firebase/messaging').default;
  } catch (e) {
    return null;
  }
};

// Returns { notifee, AndroidImportance, AndroidStyle, EventType, ... } or null.
const loadNotifee = () => {
  try {
    const mod = require('@notifee/react-native');
    return { notifee: mod.default || mod, ...mod };
  } catch (e) {
    return null;
  }
};

const platform = () => (Platform.OS === 'ios' ? 'ios' : 'android');
const log = (...args) => {
  if (__DEV__) console.log(...args);
};

/* ─────────────────────────── Channels ─────────────────────────── */

/**
 * Create the notification channels (Android 8+). Idempotent — safe to call on
 * every launch. `promotions` is also the manifest default channel FCM routes to.
 */
export const createChannels = async () => {
  const n = loadNotifee();
  if (!n) return;
  try {
    await n.notifee.createChannel({
      id: 'promotions',
      name: 'Offers & Promotions',
      importance: n.AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    await n.notifee.createChannel({
      id: 'orders',
      name: 'Order Updates',
      importance: n.AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    log('[Push] channels ready: promotions, orders');
  } catch (e) {
    log('createChannels failed:', e?.message);
  }
};

/* ────────────────────────── Permissions ───────────────────────── */

const requestUserPermission = async (messaging) => {
  if (Platform.OS === 'android') {
    // Android 13+ (API 33) gates notifications behind a runtime permission that
    // messaging().requestPermission() does NOT request — do it explicitly.
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // < 33: granted at install time
  }

  // iOS
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

/* ─────────────────────── Local rich display ────────────────────── */

/**
 * Render a real, rich system notification via Notifee. Used for foreground
 * messages and for data-only messages in the background handler. Falls back to
 * an in-app toast when Notifee isn't installed yet so foreground still surfaces.
 */
export const displayNotification = async (remoteMessage) => {
  const notification = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};
  const title = notification.title || data.title || 'Prem Packaging';
  const body = notification.body || data.body || '';
  const imageUrl = data.image || notification?.android?.imageUrl;
  const channelId = data.type === 'order' ? 'orders' : data.channelId || 'promotions';

  log('[Push] displaying notification:', title, imageUrl ? '(with image)' : '');

  const n = loadNotifee();
  if (!n) {
    // Graceful degradation before Notifee is installed.
    log('[Push] Notifee not installed — falling back to in-app toast');
    showMessage({ message: title, description: body, type: 'info', duration: 4000 });
    return;
  }

  try {
    await createChannels();
    await n.notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: SMALL_ICON,
        color: BRAND_COLOR,
        largeIcon: data.largeIcon || undefined,
        pressAction: { id: 'default' },
        style: imageUrl
          ? { type: n.AndroidStyle.BIGPICTURE, picture: imageUrl }
          : { type: n.AndroidStyle.BIGTEXT, text: body },
      },
      ios: {
        attachments: imageUrl ? [{ url: imageUrl }] : undefined,
      },
    });
  } catch (e) {
    log('displayNotification failed:', e?.message);
  }
};

/* ─────────────────────────── Register ──────────────────────────── */

/**
 * Request permission, fetch the FCM token and register it with the backend.
 * Works for guests too (no login required) — the backend stores the device with
 * no user and links it once the user signs in and this runs again with auth.
 */
export const registerForPush = async () => {
  const messaging = loadMessaging();
  if (!messaging) return null;
  try {
    const granted = await requestUserPermission(messaging);
    log('[Push] notification permission granted:', granted);
    if (!granted) return null;

    await createChannels();

    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const fcmToken = await messaging().getToken();
    if (!fcmToken) return null;
    // Full token printed in dev only — copy it into Firebase Console → Cloud
    // Messaging → "Send test message" to test push without backend creds.
    log('[Push] FCM token (dev only):', fcmToken);

    await ApiService.REGISTER_DEVICE({ token: fcmToken, platform: platform() });
    log('[Push] device registered with backend');
    await StorageService.setItem('fcmToken', fcmToken);
    return fcmToken;
  } catch (e) {
    log('registerForPush failed:', e?.message);
    return null;
  }
};

/* ─────────────────────────── Listeners ─────────────────────────── */

/**
 * Wire foreground display + tap handlers. Call once after the app mounts.
 * Returns an unsubscribe function (no-op when the native modules are absent).
 */
export const setupPushListeners = () => {
  const messaging = loadMessaging();
  if (!messaging) return () => {};

  const subscriptions = [];

  try {
    const instance = messaging();

    // Foreground messages don't show a system banner — render one ourselves.
    subscriptions.push(
      instance.onMessage(async (remoteMessage) => {
        log('[Push] foreground message received:', remoteMessage?.notification?.title || remoteMessage?.data?.title);
        await displayNotification(remoteMessage);
        DeviceEventEmitter.emit('notificationsUpdated');
      }),
    );

    // Re-register when FCM rotates the token. Always re-register (guest-safe) —
    // the backend links the token to a user later when they sign in.
    subscriptions.push(
      instance.onTokenRefresh(async (fcmToken) => {
        if (!fcmToken) return;
        try {
          await ApiService.REGISTER_DEVICE({ token: fcmToken, platform: platform() });
          await StorageService.setItem('fcmToken', fcmToken);
          log('[Push] token refreshed and re-registered');
        } catch (e) {
          log('token refresh re-register failed:', e?.message);
        }
      }),
    );

    // Tapped while app was backgrounded (OS-shown notification).
    subscriptions.push(
      instance.onNotificationOpenedApp((remoteMessage) => resolveDeepLink(remoteMessage?.data)),
    );

    // Tapped a Notifee-shown notification while app was in the foreground.
    const n = loadNotifee();
    if (n) {
      subscriptions.push(
        n.notifee.onForegroundEvent(({ type, detail }) => {
          if (type === n.EventType.PRESS) resolveDeepLink(detail?.notification?.data);
        }),
      );
    }

    // Tapped while app was quit (cold start). navigate() queues until the
    // NavigationContainer is ready, so these are never dropped.
    instance.getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) resolveDeepLink(remoteMessage.data);
    });
    if (n) {
      n.notifee.getInitialNotification().then((event) => {
        if (event) resolveDeepLink(event.notification?.data);
      });
    }
  } catch (e) {
    log('setupPushListeners failed:', e?.message);
  }

  return () => subscriptions.forEach((unsub) => typeof unsub === 'function' && unsub());
};

/* ────────────────────────── Unregister ─────────────────────────── */

export const unregisterFromPush = async () => {
  try {
    const fcmToken = await StorageService.getItem('fcmToken');
    if (fcmToken) {
      await ApiService.UNREGISTER_DEVICE({ token: fcmToken });
      await StorageService.removeItem('fcmToken');
    }
  } catch (e) {
    log('unregisterFromPush failed:', e?.message);
  }
};
