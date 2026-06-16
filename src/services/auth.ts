import {
  AuthResult,
  UserDto,
  ProvidersResponse,
  User,
  AuthProviderType,
} from '@/types';
import { AUTH_ENDPOINTS } from '@/config/api';
import { api } from '@/lib/apiClient';
import {
  setCachedUser,
  getCachedUser,
  clearAuthStorage,
} from '@/utils/storage';

// ─── Route Config ──────────────────────────────────────────────

export const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/api'];
export const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

// ─── Response Types ────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function mapUserDto(dto: UserDto): User {
  return {
    id: String(dto.id),
    email: dto.email,
    name: dto.username,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };
}

// ─── Session ───────────────────────────────────────────────────

/**
 * Synchronous check for a cached user (from localStorage).
 * Use as a fast initial value while the async session verify runs.
 */
export function getCachedSession(): { user: User } | null {
  const user = getCachedUser();
  return user ? { user } : null;
}

// ─── Login ─────────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResult>(AUTH_ENDPOINTS.login, { email, password });

  if (!res.ok) {
    return { success: false, error: res.error?.message || 'Login failed' };
  }

  const { user: dto } = res.data!;
  const user = mapUserDto(dto);

  // localStorage → persistent user profile (survives tab close)
  setCachedUser(user);

  return { success: true, user };
}

const TRUSTED_OAUTH_PATHS = ['/api/auth/oauth/google', '/api/auth/oauth/github'];

export async function loginWithProvider(provider: AuthProviderType): Promise<AuthResponse> {
  if (provider === 'email') {
    return { success: false, error: 'Use loginWithEmail for email login' };
  }

  if (typeof window !== 'undefined') {
    const configRes = await api.get<ProvidersResponse>(AUTH_ENDPOINTS.providers);
    if (configRes.ok && configRes.data) {
      const providerConfig = configRes.data.providers.find(p => p.name === provider);
      if (providerConfig?.loginUrl && TRUSTED_OAUTH_PATHS.includes(providerConfig.loginUrl)) {
        window.location.href = providerConfig.loginUrl;
        return { success: true };
      }
    }
    return { success: false, error: configRes.error?.message || `${provider} login is not available` };
  }

  return { success: false, error: 'OAuth requires browser environment' };
}

// ─── Register ──────────────────────────────────────────────────

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await api.post(AUTH_ENDPOINTS.register, { username, email, password });

  if (!res.ok) {
    return { success: false, error: res.error?.message || 'Registration failed' };
  }

  return { success: true };
}

export async function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  const res = await api.post<AuthResult>(AUTH_ENDPOINTS.verifyEmail, { email, code });

  if (!res.ok) {
    return { success: false, error: res.error?.message || 'Email verification failed' };
  }

  const { user: dto } = res.data!;
  const user = mapUserDto(dto);

  setCachedUser(user);

  return { success: true, user };
}

// ─── Forgot Password ───────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  const res = await api.post(AUTH_ENDPOINTS.forgotPassword, { email });

  if (!res.ok) {
    return { success: false, error: res.error?.message || 'Failed to send reset code' };
  }

  return { success: true };
}

// ─── Verify OTP ────────────────────────────────────────────────

export async function verifyOtp(email: string, code: string): Promise<AuthResponse & { resetToken?: string }> {
  const res = await api.post<{ resetToken: string; expiresIn: number }>(AUTH_ENDPOINTS.verifyOtp, { email, code });

  if (!res.ok) {
    return { success: false, error: res.error?.message || 'Invalid verification code' };
  }

  return { success: true, resetToken: res.data!.resetToken };
}

// ─── Reset Password ────────────────────────────────────────────

export async function resetPassword(email: string, code: string, newPassword: string): Promise<AuthResponse> {
  const res = await api.post(AUTH_ENDPOINTS.resetPassword, { email, code, newPassword });

  if (!res.ok) {
    return { success: false, error: res.error?.message || 'Password reset failed' };
  }

  return { success: true };
}

// ─── Logout ────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await api.post(AUTH_ENDPOINTS.logout);
  } catch {
    // ignore — server clears its own cookies even if call fails
  }

  // Clear localStorage + sessionStorage
  clearAuthStorage();
}

// ─── Get Current User ──────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthResponse> {
  const res = await api.get<{ userId: string; email: string; username: string }>(AUTH_ENDPOINTS.currentUser);

  if (!res.ok) {
    // Session expired or invalid — clear cached data
    clearAuthStorage();
    return { success: false, error: res.error?.message || 'Failed to get user' };
  }

  const user: User = {
    id: res.data!.userId,
    email: res.data!.email,
    name: res.data!.username,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  // Update cache
  setCachedUser(user);

  return { success: true, user };
}
