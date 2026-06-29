import { Text, AppRegistry } from "react-native";
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
import App from './App';
import { name as appName } from './app.json';

// FCM background/quit handler. Must be registered at the top level, outside any
// component. Guarded so the bundle still builds before firebase is installed.
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {
    // Notification-type messages are displayed by the OS automatically; this
    // handler just keeps data-only messages from being dropped.
  });
} catch (e) {
  // @react-native-firebase/messaging not installed yet — push stays inactive.
}

AppRegistry.registerComponent(appName, () => App);
