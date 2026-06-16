'use client';

import { useState, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './RegisterForm.module.scss';

type Step = 'register' | 'verify';

const OTP_LENGTH = 6;

export default function RegisterForm() {
  const { register, verifyEmail, loginWithProvider, error, isLoading, clearError } = useAuth();
  const [step, setStep] = useState<Step>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!username.trim()) {
      setLocalError('Name is required');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const ok = await register(username.trim(), email.trim(), password);
    if (!ok) return;
    setStep('verify');
    setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setLocalError('');

    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (next.every(d => d !== '') && next.join('').length === OTP_LENGTH) {
      submitOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIdx]?.focus();

    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  };

  const submitOtp = async (code: string) => {
    setLocalError('');
    const ok = await verifyEmail(email, code);
    if (!ok) return;
  };

  const handleProviderLogin = async (provider: 'github' | 'google') => {
    clearError();
    setLocalError('');
    await loginWithProvider(provider);
  };

  const displayError = localError || error;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>M</span>
        </div>
        <h1 className={styles.title}>
          {step === 'register' ? 'Create your account' : 'Verify your email'}
        </h1>
        <p className={styles.subtitle}>
          {step === 'register'
            ? 'Start your interview preparation journey'
            : <>We sent a 6-digit code to <strong>{email}</strong></>}
        </p>
      </div>

      {displayError && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>!</span>
          {displayError}
        </div>
      )}

      {step === 'register' ? (
        <form className={styles.form} onSubmit={handleRegisterSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Enter your name"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setLocalError(''); clearError(); }}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setLocalError(''); clearError(); }}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(''); clearError(); }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); clearError(); }}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); submitOtp(otpDigits.join('')); }}>
          <div className={styles.field}>
            <label className={styles.label}>Verification code</label>
            <div className={styles.otpGrid}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpInputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  className={`${styles.otpInput} ${digit ? styles.otpFilled : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={isLoading}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isLoading || otpDigits.some(d => !d)}
          >
            {isLoading ? <span className={styles.spinner} /> : 'Verify & Sign In'}
          </button>
        </form>
      )}

      {step === 'register' && (
        <>
          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          <div className={styles.providers}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnProvider}`}
              onClick={() => handleProviderLogin('github')}
              disabled={isLoading}
            >
              <svg className={styles.providerIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnProvider} ${styles.btnGoogle}`}
              onClick={() => handleProviderLogin('google')}
              disabled={isLoading}
            >
              <svg className={styles.providerIcon} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>
        </>
      )}

      <div className={styles.footer}>
        {step === 'register' ? (
          <>Already have an account?{' '}
            <Link href="/login" className={styles.footerLink}>Sign in</Link></>
        ) : (
          <>Already verified?{' '}
            <Link href="/login" className={styles.footerLink}>Sign in</Link></>
        )}
      </div>
    </div>
  );
}
