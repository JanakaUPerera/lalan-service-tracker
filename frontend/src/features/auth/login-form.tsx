'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { ApiError } from '@/lib/api/client';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    try {
      await login({ email, password });
      router.replace('/requests');
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setFieldErrors(error.errors ?? {});
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Unexpected error. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div role="alert" className="alert alert-danger">
          {formError}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <div id="email-error" className="invalid-feedback">
            {fieldErrors.email[0]}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password && (
          <div id="password-error" className="invalid-feedback">
            {fieldErrors.password[0]}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={pending}
      >
        {pending ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faRightToBracket} className="me-2" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}