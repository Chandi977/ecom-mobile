import { Platform, ToastAndroid, Alert } from 'react-native';

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (!message) return;
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  // iOS — Alert is heavy for a transient toast, but it's the simplest and
  // avoids pulling in a native toast library for now.
  Alert.alert(type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info', message);
}
