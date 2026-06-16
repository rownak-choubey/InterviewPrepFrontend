'use client';

import { useState, FormEvent, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './ForgotPasswordForm.module.scss';

type Step = 'email' | 'otp' | 'new-password';

const OTP_LENGTH = 6;

export default function ForgotPasswordForm() {
  const { forgotPassword, verifyOtp, resetPassword, clearError, error, isLoading } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) { setLocalError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address'); return;
    }

    const sent = await forgotPassword(email.trim());
    if (sent) {
      setStep('otp');
      startResendCooldown();
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setLocalError('');
    const sent = await forgotPassword(email.trim());
    if (sent) startResendCooldown();
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
    const resetToken = await verifyOtp(email, code);
    if (resetToken) {
      setResetToken(resetToken);
      setOtpVerified(true);
      clearError();
      setStep('new-password');
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!newPassword) { setLocalError('New password is required'); return; }
    if (newPassword.length < 8) { setLocalError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPassword)) { setLocalError('Password must contain an uppercase letter'); return; }
    if (!/[a-z]/.test(newPassword)) { setLocalError('Password must contain a lowercase letter'); return; }
    if (!/[0-9]/.test(newPassword)) { setLocalError('Password must contain a number'); return; }
    if (newPassword !== confirmPassword) { setLocalError('Passwords do not match'); return; }

    const ok = await resetPassword(email, resetToken, newPassword);
    if (ok) setSuccess(true);
  };

  const displayError = localError || error;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {step === 'email' && <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>}
            {step === 'otp' && <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>}
            {step === 'new-password' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
          </svg>
        </div>
        <h1 className={styles.title}>
          {step === 'email' && 'Forgot password?'}
          {step === 'otp' && 'Enter verification code'}
          {step === 'new-password' && 'Set new password'}
        </h1>
        <p className={styles.subtitle}>
          {step === 'email' && "No worries! Enter your email and we'll send you a code."}
          {step === 'otp' && <>We sent a 6-digit code to <strong>{email}</strong></>}
          {step === 'new-password' && 'Create a strong password for your account'}
        </p>
      </div>

      {success ? (
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Password updated!</h2>
          <p className={styles.successText}>
            Your password has been successfully reset. You can now sign in.
          </p>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Link href="/login" className={styles.link}>Sign In</Link>
          </button>
        </div>
      ) : (
        <>
          {displayError && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>!</span>
              {displayError}
            </div>
          )}

          {step === 'email' && (
            <form className={styles.form} onSubmit={handleEmailSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email" type="email" className={styles.input}
                  placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalError(''); }}
                  disabled={isLoading} autoFocus autoComplete="email"
                />
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isLoading}>
                {isLoading ? <span className={styles.spinner} /> : 'Send Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
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
                {isLoading ? <span className={styles.spinner} /> : 'Verify Code'}
              </button>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={isLoading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </button>
            </form>
          )}

          {step === 'new-password' && (
            <form className={styles.form} onSubmit={handlePasswordSubmit}>
              <div className={styles.verifiedBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Email verified
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="newPassword">New password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="newPassword" type={showPassword ? 'text' : 'password'}
                    className={styles.input} placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setLocalError(''); }}
                    disabled={isLoading} autoFocus autoComplete="new-password"
                  />
                  <button type="button" className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword" type="password" className={styles.input}
                  placeholder="Confirm new password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
                  disabled={isLoading} autoComplete="new-password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className={styles.matchError}>Passwords do not match</span>
                )}
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={isLoading || !newPassword || !confirmPassword}>
                {isLoading ? <span className={styles.spinner} /> : 'Reset Password'}
              </button>
            </form>
          )}
        </>
      )}

      <div className={styles.backToLogin}>
        <Link href="/login" className={styles.backLink} style={isLoading ? { pointerEvents: 'none', opacity: 0.5 } : undefined}>
          <svg className={styles.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
