# InterviewPrep Frontend — Skills & Guidelines

> **Architecture decisions (auth, data flow, security) are defined in the root [`../AGENTS.md`](../AGENTS.md). This file covers frontend-specific conventions only.**

## Project Overview
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: SCSS with CSS Modules (NO Tailwind CSS)
- **Package Manager**: npm
- **State Management**: React Context API
- **Theme**: Dark/Light mode with CSS variables

## Architecture Principles

### SOLID Principles
1. **Single Responsibility**: Each component does one thing well
2. **Open-Closed**: Extend via props/composition, not modification
3. **Liskov Substitution**: Components accept interfaces, not concretions
4. **Interface Segregation**: Small, focused prop interfaces
5. **Dependency Inversion**: Depend on abstractions (contexts, hooks)

### Component Design
- **Container/Presentational**: Separate logic from UI
- **Composition over Inheritance**: Use children, render props, HOCs
- **Hooks for Logic**: Extract reusable logic into custom hooks
- **Context for State**: Use React Context for shared state

## Styling Guidelines

### SCSS Rules
1. **NEVER use Tailwind CSS** - This project uses SCSS exclusively
2. Use CSS Modules for component-scoped styles (`.module.scss`)
3. Global styles go in `src/app/globals.scss`
4. Follow BEM naming convention: `.block__element--modifier`
5. Use SCSS variables for colors, fonts, and spacing
6. Keep styles organized by component

### Theme System
- CSS variables defined in `:root` and `[data-theme]` selectors
- Dark theme: `[data-theme='dark']` (default)
- Light theme: `[data-theme='light']`
- Access via `useTheme()` hook

### File Structure for Components
```
src/components/ComponentName/
  ├── index.tsx                    # Component logic
  ├── ComponentName.module.scss    # Scoped styles
  └── types.ts                     # TypeScript interfaces (if needed)
```

## Component Guidelines

### File Organization
1. Each component gets its own directory under `src/components/`
2. Use descriptive, PascalCase naming for components
3. Export components as default exports
4. Keep components small and focused (single responsibility)

### TypeScript
1. Define interfaces/types in `src/types/index.ts`
2. Use strict typing (no `any` unless absolutely necessary)
3. Prefer interface over type for object shapes
4. Export all types from `src/types/index.ts`

### Client Components
- Mark interactive components with `'use client'`
- Server components by default (no directive needed)
- Only add `'use client'` when using hooks, browser APIs, or event handlers

## Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes (login, signup, forgot-password)
│   ├── (protected)/        # Protected routes (dashboard, phases, etc.)
│   ├── globals.scss        # Global styles + theme variables
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
│   ├── Auth/               # Auth components (AuthGuard, LoginForm, etc.)
│   ├── Layout/             # Layout components (Navbar, Footer, ThemeToggle)
│   ├── Hero/               # Hero section
│   ├── Dashboard/          # Dashboard with progress tracking
│   ├── CompanyIntel/       # Company information with tabs
│   ├── Phases/             # Preparation phases with expandable cards
│   ├── Timeline/           # Timeline component
│   ├── QuickRef/           # Quick reference grid
│   └── Modal/              # Modal dialog
├── context/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   ├── ThemeContext.tsx     # Theme management
│   └── ProgressContext.tsx  # Progress tracking state
├── config/                 # Configuration constants
│   └── api.ts              # API endpoints and base URL
├── data/                   # Static data
│   └── phases.ts           # All phase, timeline, and company data
├── hooks/                  # Custom React hooks
│   └── useScroll.ts        # Scroll-related hooks
├── lib/                    # Core libraries
│   └── apiClient.ts        # Axios instance with interceptors
├── services/               # API service layer
│   └── auth.ts             # Auth API calls + storage management
├── types/                  # Shared TypeScript types
│   └── index.ts            # All type definitions
└── utils/                  # Utility functions
    ├── cookies.ts          # Cookie management (auth tokens)
    └── storage.ts          # localStorage/sessionStorage helpers
```

## Development Rules

### When Adding New Features
1. Create component directory first
2. Add TypeScript types to `src/types/index.ts`
3. Add static data to `src/data/` if needed
4. Create component with SCSS Module
5. Add to appropriate page/route
6. Run `npm run lint` before committing

### When Modifying Existing Code
1. Maintain existing code style
2. Preserve SCSS structure and naming
3. Update types if interfaces change
4. Test component rendering

### Code Style
1. Use functional components with hooks
2. Keep imports organized (React, libraries, local)
3. Use meaningful variable/function names
4. Add TypeScript types for props and state
5. Use `useCallback` for functions passed as props
6. Use `useMemo` for expensive computations

## Context Providers

### AuthProvider
- Wraps entire app in `layout.tsx`
- Provides `user`, `isAuthenticated`, `isLoading`, `error`, `login`, `logout`, etc.
- Two-phase initialization: sync restore from localStorage + async backend verify
- Uses `useAuth()` hook

### ThemeProvider
- Wraps entire app in `layout.tsx`
- Provides `theme` and `toggleTheme`
- Persists to localStorage via `getStoredTheme()` / `setStoredTheme()`
- Uses `useTheme()` hook

### ProgressProvider
- Wraps entire app in `layout.tsx`
- Provides `state`, `stats`, `milestones`, `toggleTopic`, `toggleAllPhase`, `resetProgress`
- Persists to localStorage via `getLocalItem()` / `setLocalItem()`
- Uses `useProgress()` hook

## Browser Storage Architecture

This project follows the industry-standard storage hierarchy used by Azure, Google, and other enterprise applications:

### Storage Layer Overview

| Storage | Purpose | Lifetime | Scope | Examples |
|---------|---------|----------|-------|----------|
| **Cookie** | Auth tokens | Session / 7d | All tabs + server | `access_token`, `refresh_token` |
| **localStorage** | Persistent preferences | Permanent | All tabs | Theme, user profile, progress |
| **sessionStorage** | Temporary UI state | Tab only | Current tab | Form drafts, scroll position |

### Cookie Storage (`src/utils/cookies.ts`)
Auth cookies are set **entirely by the backend** as HttpOnly + Secure. The frontend never writes auth cookies — the browser sends HttpOnly cookies automatically via `withCredentials: true`.

```
access_token    → Backend HttpOnly + Secure (set by backend via Set-Cookie header)
refresh_token   → Backend HttpOnly + Secure (set by backend via Set-Cookie header)
```

**Why cookies for auth?**
- Cookies are sent automatically with every HTTP request
- They persist across tabs (unlike sessionStorage)
- They can be set with `Secure`, `SameSite` flags for security
- `hasAuthCookie()` provides a synchronous client-side check for route guards
- HttpOnly prevents XSS from accessing tokens (frontend JS cannot read them)

**Note:** The dev server runs with `--https` so the browser accepts `Secure` cookies from `localhost`.

**API:**
```typescript
import { hasAuthCookie, AUTH_COOKIES } from '@/utils/cookies';

hasAuthCookie();  // quick synchronous check (reads non-HttpOnly cookie if present)
```

### localStorage (`src/utils/storage.ts`)
Persistent data that survives browser restarts.

```
meru_theme        → 'dark' | 'light'
meru_user         → User object (cached profile)
meru_prep_state   → ProgressState (topics/phases completion)
meru_last_visit   → Date string (streak tracking)
meru_streak       → Number (daily visit streak)
```

**Why localStorage for preferences?**
- Persists across sessions (theme stays set after browser restart)
- Synchronous reads (fast UI rendering)
- No network overhead (unlike cookies)
- User-specific, not security-sensitive

**API:**
```typescript
import { getLocalItem, setLocalItem, LOCAL_KEYS } from '@/utils/storage';

setLocalItem(LOCAL_KEYS.THEME, 'dark');
getLocalItem<string>(LOCAL_KEYS.THEME);
```

### sessionStorage (`src/utils/storage.ts`)
Temporary per-tab state.

```
meru_form_draft   → Form data in progress
meru_scroll_pos   → Scroll position for navigation
```

**Why sessionStorage for UI state?**
- Tab-scoped (different users on same browser stay isolated)
- Clears on tab close (no stale data)
- Good for ephemeral state that shouldn't persist

### Storage Flow Diagram

```
Login Success
  ├─ Backend sets HttpOnly cookies (access_token, refresh_token)
  ├─ localStorage ← setCachedUser(user)
  └─ AuthContext state ← { user, isAuthenticated: true }

Page Load (Fresh)
  ├─ Middleware checks access_token cookie → allow/redirect
  ├─ AuthContext Phase 1 (sync) → getCachedUser() from localStorage → instant UI
  └─ AuthContext Phase 2 (async) → getCurrentUser() API → update if changed

Logout
  ├─ Backend clears its own HttpOnly cookies
  ├─ localStorage ← clearCachedUser()
  ├─ sessionStorage ← clear()
  └─ AuthContext state ← { user: null, isAuthenticated: false }
```

### Rules for Storage Usage

1. **Never store auth tokens in localStorage/sessionStorage** — use cookies
2. **Never store sensitive PII in cookies** — use localStorage
3. **Never store large objects in cookies** — use localStorage (4KB cookie limit)
4. **Always use the utility functions** — never raw `document.cookie`, `localStorage.*`, or `sessionStorage.*`
5. **All storage access must be SSR-safe** — guard with `typeof window === 'undefined'` or use the utility functions
6. **Clear all storage on logout** — cookies + localStorage auth data + sessionStorage
7. **Never write auth cookies from the frontend** — the backend sets all auth cookies; the frontend only reads them via HttpOnly

## Custom Hooks

### useScrollActive(sectionIds)
- Returns active section ID based on scroll position
- Used for navbar active state

### useNavScrolled()
- Returns boolean for navbar background
- True when scrolled past 50px

### useConfetti()
- Returns function to launch confetti animation
- Used when 100% progress achieved

## Common Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## SCSS Variable Reference
Edit `globals.scss` to update these values:
- `$primary-color` → `--accent`: Primary brand color (#6c5ce7)
- `$secondary-color` → `--green`: Secondary brand color (#00b894)
- `$background-color` → `--bg`: Page background
- `$text-color` → `--text`: Default text color
- `$border-color` → `--border`: Border colors
- `$font-family`: Default font stack (Inter)

## Data Structure

### Phase
```typescript
interface Phase {
  id: number;
  title: string;
  days: string;
  priority: string;
  color: string;
  icon: string;
  hours: string;
  desc: string;
  topics: Topic[];
  questions: Question[];
}
```

### Topic
```typescript
interface Topic {
  id: string;
  name: string;
  desc: string;
  pri: Priority; // 'critical' | 'high' | 'medium'
  detail?: string; // HTML content for modal
}
```

## Auth & Cookie Conventions

### Cookie-Based Auth (See Root AGENTS.md for Full Architecture)

1. **Backend sets HttpOnly cookies** — frontend never stores raw JWT in JS memory
2. **Dual cookie pattern**: Backend HttpOnly (real auth) + client-side mirror (client checks)
3. **Axios** uses `withCredentials: true` to auto-send cookies
4. **401 interceptor** triggers refresh token rotation automatically
5. **Never** store tokens in `localStorage` or `sessionStorage`
6. User profile **cache** in localStorage is a UX optimization — NOT an auth source of truth

### Auth Endpoints (Frontend Service Layer)

```
register(username, email, password)      → POST /api/auth/register
verifyEmail(email, code)                  → POST /api/auth/register/verify-email
loginWithEmail(email, password)           → POST /api/auth/login
logout()                                  → POST /api/auth/session/logout
getCurrentUser()                          → GET  /api/auth/session/current-user
requestPasswordReset(email)               → POST /api/auth/password/forgot
verifyOtp(email, code)                    → POST /api/auth/password/verify-otp
resetPassword(email, code, newPassword)   → POST /api/auth/password/reset
```

All service functions return `AuthResponse`:
```typescript
interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}
```

### Route Protection
- **Client-side guard**: `(protected)/layout.tsx` wraps children in `<AuthGuard>` which checks `useAuth().isAuthenticated` and redirects to `/login` if unauthenticated
- **No Next.js middleware** — protection is handled entirely via client-side AuthGuard + route group layouts.
- `hasAuthCookie()` utility provides a synchronous cookie check for client-side hooks and early redirects.

### Cookie Utilities (`src/utils/cookies.ts`)
- `setCookie`, `getCookie`, `removeCookie` — generic helpers
- `setAuthCookies` — writes access_token + refresh_token client-side cookies
- `clearAuthCookies` — removes all auth cookies (logout/session expired)
- `hasAuthCookie` — synchronous check for client-side route guards

### Storage Hierarchy
- **Cookies** → Auth tokens (HttpOnly: backend, client: non-HttpOnly mirror)
- **localStorage** → User profile cache, theme, progress (never tokens)
- **sessionStorage** → Form drafts, scroll position (per-tab ephemeral)

## DO NOT
- Do not install or use Tailwind CSS
- Do not use inline styles for complex components
- Do not mix CSS Modules with global styles in same component
- Do not use `any` type without justification
- Do not create files outside the established directory structure
- Do not use bare element selectors in SCSS modules (causes build errors)
- Do not put types in component files - use `src/types/index.ts`
- Do not store JWT tokens in localStorage/sessionStorage
- Do not read HttpOnly cookies from JavaScript (they are inaccessible by design)
- Do not create a custom auth state in context that duplicates cookie presence — rely on the AuthContext + service layer
- Do not create a Next.js `middleware.ts` unless specifically requested — route protection uses client-side AuthGuard
