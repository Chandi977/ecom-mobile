import { Text, AppRegistry } from "react-native";
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
import App from './App';
import { name as appName } from './app.json';

// FCM background/quit handler. Must be registered at the top level, outside any
// component. Guarded so the bundle still builds before firebase is installed.
try {
  const messaging = require('@react-native-firebase/messaging').default;
  const { displayNotification, createChannels } = require('./src/service/pushNotifications');

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // notification+data messages are shown by the OS automatically. For data-only
    // messages the OS shows nothing, so render a rich notification ourselves —
    // this is how you control image/channel/priority for silent-data pushes.
    if (!remoteMessage?.notification && remoteMessage?.data) {
      await createChannels();
      await displayNotification(remoteMessage);
    }
  });
} catch (e) {
  // @react-native-firebase/messaging not installed yet — push stays inactive.
}

// Notifee background event handler — required so taps on Notifee-shown
// notifications (data-only pushes) are handled while the app is backgrounded.
try {
  const notifee = require('@notifee/react-native').default;
  const { EventType } = require('@notifee/react-native');
  const { resolveDeepLink } = require('./src/service/deepLink');

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      await resolveDeepLink(detail?.notification?.data);
    }
  });
} catch (e) {
  // @notifee/react-native not installed yet — rich/background display inactive.
}

AppRegistry.registerComponent(appName, () => App);
