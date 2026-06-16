import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import { clearAuthStorage } from '@/utils/storage';

// ─── Types ─────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

/** Raw envelope returned by the .NET backend (camelCase via System.Text.Json) */
export interface BackendApiResponse<T> {
  responseCode: number;
  isSuccess: boolean;
  response?: T;
  responseMsg: string;
}

// ─── Axios Instance ────────────────────────────────────────────

const http = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  withCredentials: true, // browser sends HttpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,
});

// ─── Refresh Logic ─────────────────────────────────────────────

const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/session/refresh', '/api/auth/session/logout', '/api/auth/session/current-user', '/api/auth/oauth/providers', '/api/auth/password/forgot', '/api/auth/password/verify-otp', '/api/auth/password/reset', '/api/auth/register/verify-email'];

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  pendingQueue = [];
}

function redirectToLogin() {
  clearAuthStorage();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

// ─── Response Interceptor ──────────────────────────────────────

http.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (response.status === 401) {
      const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Skip refresh for auth endpoints — they're expected to fail when not logged in
      const isAuthEndpoint = AUTH_PATHS.some(path => originalRequest.url?.startsWith(path));
      if (isAuthEndpoint) {
        return response;
      }

      if (originalRequest._retry) {
        redirectToLogin();
        return response;
      }

      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          pendingQueue.push({
            resolve: () => resolve(http(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend sets new access_token + refresh_token as HttpOnly cookies
        const refreshRes = await axios.post(
          `${API_CONFIG.baseUrl}/api/auth/session/refresh`,
          {},
          { withCredentials: true, validateStatus: () => true, timeout: 10000 },
        );

        if (refreshRes.status !== 200) {
          throw new Error('Token refresh failed');
        }

        processQueue(null);
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        redirectToLogin();
        return response;
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  },
);

// ─── Envelope Unwrap ───────────────────────────────────────────

function unwrap<T>(response: AxiosResponse): ApiResponse<T> {
  const body = response.data as Record<string, unknown>;

  if (body && typeof body === 'object' && 'isSuccess' in body) {
    const ok = body.isSuccess as boolean;
    const msg = (body.responseMsg as string) || 'An error occurred';
    const code = (body.responseCode as number) || response.status;

    if (ok) {
      return { ok: true, data: body.response as T };
    }

    return { ok: false, error: { status: code, message: msg } };
  }

  if (response.status >= 200 && response.status < 300) {
    return { ok: true, data: response.data as T };
  }

  return {
    ok: false,
    error: { status: response.status, message: 'An error occurred' },
  };
}

// ─── Public API ────────────────────────────────────────────────

const NETWORK_ERROR: ApiResponse<never> = {
  ok: false,
  error: { status: 0, message: 'Network error. Please check your connection and try again.' },
};

const TIMEOUT_ERROR: ApiResponse<never> = {
  ok: false,
  error: { status: 408, message: 'Request timed out. Please try again.' },
};

export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      return unwrap<T>(await http.get(endpoint));
    } catch (err) {
      return networkError<T>(err);
    }
  },

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      return unwrap<T>(await http.post(endpoint, body));
    } catch (err) {
      return networkError<T>(err);
    }
  },

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      return unwrap<T>(await http.put(endpoint, body));
    } catch (err) {
      return networkError<T>(err);
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      return unwrap<T>(await http.delete(endpoint));
    } catch (err) {
      return networkError<T>(err);
    }
  },
};

function networkError<T>(err: unknown): ApiResponse<T> {
  if (axios.isCancel(err)) {
    return { ok: false, error: { status: 408, message: 'Request cancelled' } };
  }
  const axiosErr = err as AxiosError;
  if (axiosErr.code === 'ECONNABORTED') return TIMEOUT_ERROR;
  if (!axiosErr.response) return NETWORK_ERROR;
  return { ok: false, error: { status: axiosErr.response.status, message: axiosErr.message } };
}
