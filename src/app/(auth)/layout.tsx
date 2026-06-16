'use client';

import { Suspense } from 'react';
import './auth-layout.scss';

function AuthLoading() {
  return (
    <div className="auth-loading">
      <div className="auth-spinner" />
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-gradient" />
        <div className="auth-grid" />
      </div>
      <Suspense fallback={<AuthLoading />}>
        {children}
      </Suspense>
    </div>
  );
}
