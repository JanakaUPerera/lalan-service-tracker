'use client';

import { useState, type FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ApiError } from '@/lib/api/client';
import { requestsApi } from '../api';
import { ACTION_LABELS, NEXT_STATUS, STATUS_LABELS } from '../constants';
import type { ServiceRequest } from '../types';

interface Props {
  request: ServiceRequest;
  /** Re-fetch the latest request and history. */
  onChanged: () => void;
}

export function StatusActions({ request, onChanged }: Props) {
  const [remark, setRemark] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [remarkError, setRemarkError] = useState<string | null>(null);

  const next = NEXT_STATUS[request.status];

  if (!next) {
    return (
      <div className="alert alert-success mb-0">
        <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
        This request is resolved. No further changes are allowed.
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setConflict(null);
    setRemarkError(null);

    try {
      await requestsApi.changeStatus(request.id, {
        status: next,
        expected_version: request.version,
        remark: remark.trim() || undefined,
      });
      setRemark('');
      onChanged();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Stale version or invalid transition: show why, then pull the latest data
        // so the user can review and retry with the current version.
        setConflict(err.message);
        onChanged();
      } else if (err instanceof ApiError && err.status === 404) {
        onChanged(); // detail view will show the not-found state
      } else if (err instanceof ApiError && err.status === 422) {
        setRemarkError(err.errors?.remark?.[0] ?? err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Unexpected error. Please try again.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {conflict && (
        <div role="alert" className="alert alert-warning">
          <strong>Update not applied.</strong> {conflict} We have loaded the latest version (v{request.version}).
          Review it and try again.
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="remark" className="form-label">
          Remark <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="remark"
          rows={2}
          maxLength={255}
          className={`form-control ${remarkError ? 'is-invalid' : ''}`}
          aria-invalid={!!remarkError}
          aria-describedby={remarkError ? 'remark-error' : undefined}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
        {remarkError && (
          <div id="remark-error" className="invalid-feedback">
            {remarkError}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            Updating…
          </>
        ) : (
          <>
            {ACTION_LABELS[next]}
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            <span className="visually-hidden"> (moves to {STATUS_LABELS[next]})</span>
          </>
        )}
      </button>
    </form>
  );
}