'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { RequestRefreshProvider } from '@/features/requests/request-refresh-context';
import { AppHeader } from '@/components/app-header';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  return (
    <>
      {status === 'authenticated' && <AppHeader />}
      <RequestRefreshProvider>
        <main className="container py-4">{children}</main>
      </RequestRefreshProvider>
    </>
  );
}