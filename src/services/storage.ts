import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Keys are kept short and ASCII; SecureStore keys cannot contain special chars.
const TOKEN_KEY = 'PIToken';
const USER_KEY = 'PIUser';
const GUEST_CART_KEY = 'PIGuestCart';
const GUEST_WISHLIST_KEY = 'PIFav';

// Token is stored in SecureStore (Keychain on iOS, Keystore on Android) when available.
// On web (Expo Go on web), SecureStore is not supported; fall back to AsyncStorage.
const secureAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

export async function setToken(token: string | null): Promise<void> {
  if (token == null) {
    if (secureAvailable) await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (secureAvailable) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (secureAvailable) {
    const v = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
    if (v) return v;
  }
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setUser(user: any | null): Promise<void> {
  if (user == null) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser<T = any>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await setToken(null);
  await setUser(null);
}

// Guest cart JSON helpers
export async function getGuestCart(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setGuestCart(cart: any): Promise<void> {
  await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export async function clearGuestCart(): Promise<void> {
  await AsyncStorage.removeItem(GUEST_CART_KEY);
}

// Guest wishlist helpers
export async function getGuestWishlist(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(GUEST_WISHLIST_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setGuestWishlist(items: any[]): Promise<void> {
  await AsyncStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

export async function clearGuestWishlist(): Promise<void> {
  await AsyncStorage.removeItem(GUEST_WISHLIST_KEY);
}
