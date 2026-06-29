import React, { useCallback, useEffect, useState } from 'react';
import Splash from './src/screen/commonScreens/Splash';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './src/screen/commonScreens/NoInternet';
import RootedDevice from './src/screen/commonScreens/RootedDevice';
import JailMonkey from 'jail-monkey';
import FlashMessage from 'react-native-flash-message';
import { textScale } from './src/utils/responsiveSize';
import StackNavigation from './src/navigation/StackNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import UpdateModal from './src/components/General/UpdateModal';
import { registerForPush, setupPushListeners } from './src/service/pushNotifications';

LogBox.ignoreAllLogs(true);

const App = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showSplash, setShowSplash] = useState(!__DEV__);
  const [isSecure, setIsSecure] = useState(true);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const hideSplash = useCallback(() => {
    console.log('Splash timeout completed');
    setShowSplash(false);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!showSplash) {
      return undefined;
    }

    const timer = setTimeout(hideSplash, 3000);
    return () => clearTimeout(timer);
  }, [hideSplash, showSplash]);

  useEffect(() => {
    let insecure = false;
    try {
      insecure = JailMonkey.isJailBroken();
    } catch (e) {
      insecure = false;
    }
    if (insecure) setIsSecure(false);
  }, []);

  useEffect(() => {
    checkUpdate().catch(error => {
      console.log('Version check failed:', error?.message);
    });
  }, []);

  useEffect(() => {
    // FCM: register this device for push (no-op until the native messaging
    // library + Firebase credentials are present and a user is signed in).
    registerForPush().catch(error => {
      console.log('Push registration skipped:', error?.message);
    });
    // Foreground display + notification-tap deep-linking.
    const unsubscribe = setupPushListeners();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const checkUpdate = async () => {
    const currentVersion = DeviceInfo.getVersion();
    const res = await VersionCheck.needUpdate({ currentVersion });
    console.log(res, 'version check');
    if (res?.isNeeded) {
      setUpdateInfo({ storeUrl: res?.storeUrl });
      setShowUpdateModal(true);
    }
  };

  return (
    <SafeAreaProvider>
      <FlashMessage
        position="top"
        floating={true}
        duration={3000}
        titleStyle={{ fontSize: textScale(12), textTransform: 'capitalize' }}
      />

      {showSplash ? (
        <Splash />
      ) : !isSecure ? (
        <RootedDevice />
      ) : !isConnected ? (
        <NoInternet />
      ) : (
        <StackNavigation />
      )}

      <UpdateModal
        visible={showUpdateModal}
        storeUrl={updateInfo?.storeUrl}
        onLater={() => setShowUpdateModal(false)}
      />
    </SafeAreaProvider>
  );
};

export default App;
