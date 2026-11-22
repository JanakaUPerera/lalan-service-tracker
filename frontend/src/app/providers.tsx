'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/toast-provider';
import { AuthProvider } from '@/features/auth/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}