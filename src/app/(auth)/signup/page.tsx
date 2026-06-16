'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RegisterForm from '@/components/Auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const raw = searchParams.get('returnUrl') || '/dashboard';
      const returnUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isAuthenticated) return null;

  return (
    <div className="auth-content">
      <RegisterForm />
    </div>
  );
}
