'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { formatDateTime } from '@/lib/format';
import { useRequestDetail } from '../use-request-detail';
import { PriorityBadge, StatusBadge } from './badges';
import { HistoryTimeline } from './history-timeline';
import { StatusActions } from './status-actions';

export function RequestDetail({ id }: { id: string }) {
  const { request, history, loading, error, reload } = useRequestDetail(id);

  const backLink = (
    <Link href="/requests" className="btn btn-link px-0 mb-3">
      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
      Back to requests
    </Link>
  );

  // Unknown ID or someone else's record: the API answers 404 for both.
  if (error?.status === 404) {
    return (
      <>
        {backLink}
        <div className="card text-center py-5">
          <div className="card-body">
            <h1 className="h5">Request not found</h1>
            <p className="text-muted mb-0">It may not exist, or you may not have access to it.</p>
          </div>
        </div>
      </>
    );
  }

  if (!request && loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading request…</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <>
        {backLink}
        <div role="alert" className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error?.message ?? 'Could not load the request.'}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={reload}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {backLink}

      {error && (
        <div role="alert" className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error.message}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={reload}>
            Retry
          </button>
        </div>
      )}

      <div className="row g-3" aria-busy={loading}>
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                <h1 className="h4 mb-0">{request.title}</h1>
                <div className="d-flex gap-2">
                  <PriorityBadge priority={request.priority} />
                  <StatusBadge status={request.status} />
                </div>
              </div>

              <p style={{ whiteSpace: 'pre-wrap' }}>{request.description}</p>

              <dl className="row small text-muted mb-0">
                <dt className="col-4 col-sm-3">Version</dt>
                <dd className="col-8 col-sm-9">v{request.version}</dd>
                <dt className="col-4 col-sm-3">Created</dt>
                <dd className="col-8 col-sm-9">{formatDateTime(request.created_at)}</dd>
                <dt className="col-4 col-sm-3">Updated</dt>
                <dd className="col-8 col-sm-9 mb-0">{formatDateTime(request.updated_at)}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card mb-3">
            <div className="card-header bg-white fw-semibold">Change status</div>
            <div className="card-body">
              <StatusActions request={request} onChanged={reload} />
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-white fw-semibold">Status history</div>
            <div className="card-body">
              <HistoryTimeline entries={history} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}