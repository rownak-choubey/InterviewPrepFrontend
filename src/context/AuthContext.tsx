'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, AuthState, AuthProviderType } from '@/types';
import * as authService from '@/services/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<string | null>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toErrorMessage(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'message' in raw) return String((raw as { message: unknown }).message);
  return String(raw || 'An unexpected error occurred');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === 'undefined') {
      return { user: null, isAuthenticated: false, isLoading: true, error: null };
    }
    const cached = authService.getCachedSession();
    if (cached?.user) {
      return { user: cached.user, isAuthenticated: true, isLoading: false, error: null };
    }
    return { user: null, isAuthenticated: false, isLoading: true, error: null };
  });

  // Phase 2: async verify with backend (updates cache if profile changed)
  useEffect(() => {
    let cancelled = false;
    const cached = authService.getCachedSession();

    async function verifySession() {
      if (!cached?.user) {
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        return;
      }

      try {
        const result = await authService.getCurrentUser();
        if (cancelled) return;

        if (result.success && result.user) {
          setState({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      } catch {
        if (cancelled) return;
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    }

    verifySession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.loginWithEmail(email, password);
    setState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
      error: result.success ? null : toErrorMessage(result.error) || 'Login failed',
    });
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.register(username, email, password);
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: result.success ? null : toErrorMessage(result.error) || 'Registration failed',
    }));
    return result.success;
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.verifyEmail(email, code);
    if (result.success && result.user) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: toErrorMessage(result.error) || 'Email verification failed',
    }));
    return false;
  }, []);

  const loginWithProvider = useCallback(async (provider: AuthProviderType) => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.loginWithProvider(provider);
    if (result.success && result.user) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else if (!result.success) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: toErrorMessage(result.error) || 'OAuth login failed',
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.requestPasswordReset(email);
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: result.success ? null : toErrorMessage(result.error) || 'Failed to send reset code',
    }));
    return result.success;
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string): Promise<string | null> => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.verifyOtp(email, code);
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: result.success ? null : toErrorMessage(result.error) || 'Invalid code',
    }));
    return result.success ? (result.resetToken || null) : null;
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    const result = await authService.resetPassword(email, code, newPassword);
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: result.success ? null : toErrorMessage(result.error) || 'Password reset failed',
    }));
    return result.success;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      verifyEmail,
      loginWithProvider,
      logout,
      forgotPassword,
      verifyOtp,
      resetPassword,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
