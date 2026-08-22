/* global jest */

require('react-native-gesture-handler/jestSetup');

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('jail-monkey', () => ({
  isJailBroken: jest.fn(() => false),
}));

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
}));

jest.mock('react-native-version-check', () => ({
  needUpdate: jest.fn(() => Promise.resolve({ isNeeded: false })),
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ data: { user: {} } })),
    signOut: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('react-native-flash-message', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: props => React.createElement('FlashMessage', props),
    showMessage: jest.fn(),
  };
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const WebView = props => React.createElement('WebView', props);
  return { WebView, default: WebView };
});

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({ assets: [] })),
  launchImageLibrary: jest.fn(() => Promise.resolve({ assets: [] })),
}));

jest.mock('react-native-indicators', () => {
  const React = require('react');
  const Indicator = props => React.createElement('Indicator', props);
  return {
    BallIndicator: Indicator,
    BarIndicator: Indicator,
    DotIndicator: Indicator,
    MaterialIndicator: Indicator,
  };
});

jest.mock('react-native-razorpay', () => ({
  open: jest.fn(() => Promise.resolve({ razorpay_payment_id: 'test-payment' })),
}));

jest.mock('@react-native-firebase/messaging', () => () => ({
  requestPermission: jest.fn(() => Promise.resolve(1)),
  getToken: jest.fn(() => Promise.resolve('test-token')),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(() => Promise.resolve('default')),
    displayNotification: jest.fn(() => Promise.resolve()),
    onForegroundEvent: jest.fn(() => jest.fn()),
    onBackgroundEvent: jest.fn(),
  },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  EventType: { PRESS: 1 },
}));
