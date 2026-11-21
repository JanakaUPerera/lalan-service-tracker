'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth/login-form';
import { useAuth } from '@/features/auth/auth-context';

export default function LoginPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/requests');
  }, [status, router]);

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-4 text-center">Service Request Tracker</h1>
              <LoginForm />
              <p className="text-muted small text-center mt-4 mb-0">
                Demo: admin@gmail.com / password
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}