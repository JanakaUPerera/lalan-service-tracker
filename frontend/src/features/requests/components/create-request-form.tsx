'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast-provider';
import { ApiError } from '@/lib/api/client';
import { requestsApi } from '../api';
import { PRIORITY_LABELS } from '../constants';
import { useRequestRefresh } from '../request-refresh-context';
import type { CreateRequestPayload, RequestPriority } from '../types';

const EMPTY_FORM: CreateRequestPayload = {
  title: '',
  description: '',
  priority: 'MEDIUM',
};

export function CreateRequestForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshRequests } = useRequestRefresh();

  const [form, setForm] = useState<CreateRequestPayload>(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const fieldProps = (name: string, base = 'form-control') => ({
    id: name,
    className: `${base} ${errors[name] ? 'is-invalid' : ''}`,
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const renderError = (name: string) =>
    errors[name] ? (
      <div id={`${name}-error`} className="invalid-feedback">
        {errors[name][0]}
      </div>
    ) : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setErrors({});

    try {
      await requestsApi.create(form);
      setForm(EMPTY_FORM);
      showToast('Request created successfully.');
      refreshRequests();
      router.push('/requests');
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setErrors(error.errors ?? {});
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
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          {...fieldProps('title')}
          type="text"
          maxLength={100}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        {renderError('title')}
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          {...fieldProps('description')}
          rows={4}
          maxLength={500}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {renderError('description')}
        <div className="form-text">{form.description.length}/500 (minimum 10 characters)</div>
      </div>

      <div className="mb-4">
        <label htmlFor="priority" className="form-label">
          Priority
        </label>
        <select
          {...fieldProps('priority', 'form-select')}
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as RequestPriority })}
        >
          {(Object.keys(PRIORITY_LABELS) as RequestPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        {renderError('priority')}
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              Creating…
            </>
          ) : (
            'Create request'
          )}
        </button>
        <Link href="/requests" className="btn btn-outline-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}