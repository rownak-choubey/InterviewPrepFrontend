export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 15000,
} as const;

export const AUTH_ENDPOINTS = {
  register: '/api/auth/register',
  verifyEmail: '/api/auth/register/verify-email',
  login: '/api/auth/login',
  logout: '/api/auth/session/logout',
  refreshSession: '/api/auth/session/refresh',
  currentUser: '/api/auth/session/current-user',
  providers: '/api/auth/oauth/providers',
  googleLogin: '/api/auth/oauth/google',
  githubLogin: '/api/auth/oauth/github',
  forgotPassword: '/api/auth/password/forgot',
  verifyOtp: '/api/auth/password/verify-otp',
  resetPassword: '/api/auth/password/reset',
} as const;
