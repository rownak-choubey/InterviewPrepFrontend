export type Priority = 'critical' | 'high' | 'medium';

export type Theme = 'dark' | 'light';

export type AuthProviderType = 'email' | 'github' | 'google';

// ─── Backend DTOs ──────────────────────────────────────────────

export interface UserDto {
  id: string;
  username: string;
  email: string;
}

export interface AuthResult {
  user: UserDto;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ProvidersResponse {
  providers: Array<{
    name: string;
    enabled: boolean;
    loginUrl: string | null;
  }>;
}

// ─── Frontend Auth State ───────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  provider: AuthProviderType;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── App Types ─────────────────────────────────────────────────

export interface Topic {
  id: string;
  name: string;
  desc: string;
  pri: Priority;
  detail?: string;
}

export interface Phase {
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

export interface Question {
  q: string;
  a: string;
}

export interface TimelineItem {
  day: string;
  title: string;
  desc: string;
  status: 'current' | 'pending' | 'done';
}

export interface ProgressState {
  topics: Record<string, boolean>;
  phases: Record<number, boolean>;
}

export interface DashboardStats {
  totalTopics: number;
  completedTopics: number;
  completedPhases: number;
  percentage: number;
  streak: number;
}

export interface Milestone {
  pct: number;
  label: string;
  color: string;
}
