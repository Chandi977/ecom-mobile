import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, setOnUnauthorized } from '../services/api';
import { clearSession, getToken, getUser, setToken, setUser } from '../services/storage';

export interface AppUser {
  _id: string;
  first_name?: string;
  last_name?: string;
  email_address?: string;
  mobile_number?: string;
  role?: string;
  [k: string]: any;
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthValue extends AuthState {
  signin: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signinWithGoogleCredential: (credential: string) => Promise<{ ok: boolean; message: string }>;
  signup: (form: SignupForm) => Promise<{ ok: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface SignupForm {
  first_name: string;
  last_name?: string;
  email_address: string;
  password: string;
  mobile_number?: string;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  const bootstrap = useCallback(async () => {
    const [t, u] = await Promise.all([getToken(), getUser<AppUser>()]);
    setState({ token: t, user: u, loading: false });
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Wire 401 → clear session
  useEffect(() => {
    setOnUnauthorized(() => {
      setState({ user: null, token: null, loading: false });
    });
    return () => setOnUnauthorized(null);
  }, []);

  const storeSession = useCallback(async (data: any, fallbackMessage: string) => {
    const token: string | undefined = data?.Token;
    const user: AppUser | undefined = data?.user;
    if (!token || !user?._id) {
      return { ok: false, message: 'Unexpected sign-in response.' };
    }
    await setToken(token);
    await setUser(user);
    setState({ token, user, loading: false });
    return { ok: true, message: fallbackMessage };
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    const res = await apiPost<any>('signin', { email_address: email, password });
    if (!res.ok) return { ok: false, message: res.message };
    return storeSession(res.data, res.message || 'Signed in');
  }, [storeSession]);

  const signinWithGoogleCredential = useCallback(async (credential: string) => {
    const res = await apiPost<any>('auth/google', { credential });
    if (!res.ok) return { ok: false, message: res.message };
    return storeSession(res.data, res.message || 'Google sign-in successful');
  }, [storeSession]);

  const signup = useCallback(async (form: SignupForm) => {
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name || '',
      email_address: form.email_address,
      password: form.password,
      mobile_number: form.mobile_number || '',
      role: 'user',
    };
    const res = await apiPost('signup', payload);
    return { ok: res.ok, message: res.message };
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setState({ token: null, user: null, loading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.user?._id) return;
    const res = await apiGet<any>(`getuser/${state.user._id}`);
    if (res.ok && res.data?._id) {
      await setUser(res.data);
      setState((s) => ({ ...s, user: res.data }));
    }
  }, [state.user?._id]);

  const value = useMemo<AuthValue>(
    () => ({ ...state, signin, signinWithGoogleCredential, signup, logout, refreshUser }),
    [state, signin, signinWithGoogleCredential, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
