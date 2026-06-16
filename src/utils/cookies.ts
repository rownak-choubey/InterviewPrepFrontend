/**
 * Cookie Management Utility
 * Auth cookies are set by the backend as HttpOnly + Secure. The frontend
 * never writes auth cookies — the browser sends HttpOnly cookies
 * automatically via withCredentials: true.
 */

// ─── Types ─────────────────────────────────────────────────────

export interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Backend-set HttpOnly cookies — these are the ONLY auth cookies.
 * The frontend never writes them; the browser sends them automatically.
 */
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// ─── Low-level helpers (used for non-auth cookies only) ────────

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  const {
    days = 7,
    path = '/',
    sameSite = 'lax',
    secure = IS_PROD,
  } = options;

  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  const sameSiteAttr = sameSite.charAt(0).toUpperCase() + sameSite.slice(1);

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `expires=${expires}`,
    `path=${path}`,
    `SameSite=${sameSiteAttr}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp('(?:^|; )' + encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

// ─── Auth helpers ──────────────────────────────────────────────

/** Quick synchronous check — does an access_token cookie exist? */
export function hasAuthCookie(): boolean {
  return !!getCookie(AUTH_COOKIES.ACCESS_TOKEN);
}
