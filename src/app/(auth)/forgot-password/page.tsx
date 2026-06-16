'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated) return null;

  return (
    <div className="auth-content">
      <ForgotPasswordForm />
    </div>
  );
}
