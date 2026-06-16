/**
 * Unified Browser Storage Utility
 *
 * Storage hierarchy (industry best practice):
 *   ┌─────────────────┬─────────────────────────────────────────────┐
 *   │ Storage          │ Purpose                                     │
 *   ├─────────────────┼─────────────────────────────────────────────┤
 *   │ Cookie           │ Auth tokens (access_token, refresh_token)   │
 *   │ localStorage     │ Persistent preferences & cached data       │
 *   │ sessionStorage   │ Temporary / per-tab UI state               │
 *   └─────────────────┴─────────────────────────────────────────────┘
 *
 * All access is SSR-safe (returns null / no-ops on the server).
 */

// ─── localStorage Keys ─────────────────────────────────────────

export const LOCAL_KEYS = {
  THEME: 'meru_theme',
  USER_PROFILE: 'meru_user',
  PREP_STATE: 'meru_prep_state',
  LAST_VISIT: 'meru_last_visit',
  STREAK: 'meru_streak',
} as const;

// ─── sessionStorage Keys ───────────────────────────────────────

export const SESSION_KEYS = {
  FORM_DRAFT: 'meru_form_draft',
  SCROLL_POSITION: 'meru_scroll_pos',
} as const;

// ─── Generic localStorage helpers ──────────────────────────────

export function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] localStorage write failed for key: ${key}`);
  }
}

export function getLocalItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function removeLocalItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ─── Generic sessionStorage helpers ────────────────────────────

export function setSessionItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] sessionStorage write failed for key: ${key}`);
  }
}

export function getSessionItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function removeSessionItem(key: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}

// ─── Typed Theme helpers ───────────────────────────────────────

import type { Theme } from '@/types';

export function getStoredTheme(): Theme {
  return getLocalItem<Theme>(LOCAL_KEYS.THEME) ?? 'dark';
}

export function setStoredTheme(theme: Theme): void {
  setLocalItem(LOCAL_KEYS.THEME, theme);
}

// ─── Typed User Profile cache ──────────────────────────────────

import type { User } from '@/types';

export function getCachedUser(): User | null {
  return getLocalItem<User>(LOCAL_KEYS.USER_PROFILE);
}

export function setCachedUser(user: User): void {
  setLocalItem(LOCAL_KEYS.USER_PROFILE, user);
}

export function clearCachedUser(): void {
  removeLocalItem(LOCAL_KEYS.USER_PROFILE);
}

// ─── Bulk clear (called on logout) ─────────────────────────────

export function clearAuthStorage(): void {
  clearCachedUser();
  // Clear all sessionStorage (form drafts, scroll positions, etc.)
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
  }
}
