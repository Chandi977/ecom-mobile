import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { clearSession, getToken } from './storage';

// Resolve API base URL from env -> Expo extra -> emulator fallback.
// All requests target /premind/api per backend contract.
function resolveBaseUrl(): string {
  const extra: any =
    (Constants?.expoConfig as any)?.extra ||
    ((Constants as any)?.manifest?.extra) ||
    {};
  const fromEnv: string | undefined =
    (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ||
    (process.env.NEXT_PUBLIC_API_URL as string | undefined) ||
    (process.env.API_BASE_URL as string | undefined);
  const fromExtra: string | undefined = extra.apiBaseUrl;
  const fallback = Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/premind/api'
    : 'http://localhost:5000/premind/api';
  return (fromEnv || fromExtra || fallback).replace(/\/+$/, '');
}

export const API_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Optional logout callback wired by the app shell so 401s can navigate.
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearSession();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  },
);

// Normalized backend common response shape.
export interface ApiOk<T = any> {
  ok: true;
  message: string;
  data: T;
  meta?: any;
  raw: any;
}
export interface ApiErr {
  ok: false;
  message: string;
  status?: number;
  raw?: any;
}
export type ApiResult<T = any> = ApiOk<T> | ApiErr;

function buildOk<T>(res: AxiosResponse<any>): ApiResult<T> {
  const body = res?.data ?? {};
  // Backend `commonResponse`: { success, message, data, meta }. Some endpoints omit `success`
  // and return raw JSON; treat any 2xx response without explicit `success:false` as success.
  if (body && typeof body === 'object' && body.success === false) {
    return {
      ok: false,
      message: body.message || body.error || 'Request failed',
      status: res.status,
      raw: body,
    };
  }
  const data = (body && typeof body === 'object' && 'data' in body) ? body.data : body;
  return {
    ok: true,
    message: body?.message || 'OK',
    data: data as T,
    meta: body?.meta,
    raw: body,
  };
}

function buildErr(err: any): ApiResult<any> {
  const status = err?.response?.status;
  const body = err?.response?.data;
  const message =
    body?.error?.description ||
    body?.message ||
    body?.error ||
    err?.message ||
    'Network error. Please check your connection.';
  return { ok: false, message, status, raw: body };
}

// Strip a single leading slash so callers can pass either `signin` or `/signin`.
const clean = (endpoint: string) => endpoint.replace(/^\/+/, '');

export async function apiGet<T = any>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  try {
    const res = await api.get(`/${clean(endpoint)}`, config);
    return buildOk<T>(res);
  } catch (err) {
    return buildErr(err);
  }
}

export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  try {
    const res = await api.post(`/${clean(endpoint)}`, data, config);
    return buildOk<T>(res);
  } catch (err) {
    return buildErr(err);
  }
}

export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  try {
    const res = await api.put(`/${clean(endpoint)}`, data, config);
    return buildOk<T>(res);
  } catch (err) {
    return buildErr(err);
  }
}

export async function apiDelete<T = any>(
  endpoint: string,
  config?: AxiosRequestConfig,
): Promise<ApiResult<T>> {
  try {
    const res = await api.delete(`/${clean(endpoint)}`, config);
    return buildOk<T>(res);
  } catch (err) {
    return buildErr(err);
  }
}

// Backwards-compatible wrappers used by existing screens (HomeScreen, BrandProductsScreen).
// These return an object that looks like the legacy axios response so we don't have to
// rewrite call sites that read `res?.data?.data`.
function legacyShape<T>(r: ApiResult<T>) {
  if (r.ok) {
    return {
      data: {
        success: true,
        message: r.message,
        data: r.data,
        meta: r.meta,
      },
      status: 200,
    };
  }
  return {
    data: { success: false, message: r.message, data: null },
    status: r.status || 500,
  };
}

export const getService = async (endpoint: string) => legacyShape(await apiGet(endpoint));
export const postService = async (endpoint: string, data?: any) =>
  legacyShape(await apiPost(endpoint, data));
export const putService = async (endpoint: string, data?: any) =>
  legacyShape(await apiPut(endpoint, data));
export const deleteService = async (endpoint: string) => legacyShape(await apiDelete(endpoint));

export default api;
