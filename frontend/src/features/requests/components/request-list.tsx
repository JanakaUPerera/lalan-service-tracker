'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '@/components/pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useRequestList } from '../use-request-list';
import type { RequestListFilters } from '../types';
import { RequestFilterBar } from './request-filter-bar';
import { RequestTable } from './request-table';

const DEFAULT_FILTERS: RequestListFilters = { search: '', status: '', priority: '', page: 1 };

export function RequestList() {
  const [filters, setFilters] = useState<RequestListFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 400);

  // Apply the debounced search and go back to page 1.
  useEffect(() => {
    setFilters((f) => (f.search === debouncedSearch ? f : { ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const { data, loading, error, reload } = useRequestList(filters);

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.priority);

  function resetFilters() {
    setSearchInput('');
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <>
      <RequestFilterBar
        search={searchInput}
        status={filters.status}
        priority={filters.priority}
        onSearchChange={setSearchInput}
        onStatusChange={(status) => setFilters((f) => ({ ...f, status, page: 1 }))}
        onPriorityChange={(priority) => setFilters((f) => ({ ...f, priority, page: 1 }))}
        onReset={resetFilters}
      />

      {error && (
        <div role="alert" className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error.message}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={reload}>
            Retry
          </button>
        </div>
      )}

      {!data && loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading requests…</span>
          </div>
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="card text-center text-muted py-5">
          <div className="card-body">
            <FontAwesomeIcon icon={faInbox} size="2x" className="mb-3" />
            <p className="mb-0">
              {hasActiveFilters ? 'No requests match your filters.' : 'You have no requests yet. Create your first one.'}
            </p>
          </div>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="card">
          {/* Keep old rows visible but dimmed while the next page loads */}
          <div aria-busy={loading} className={loading ? 'opacity-50' : undefined}>
            <RequestTable requests={data.data} startNumber={data.meta.from ?? 1} />
          </div>
          <div className="card-footer bg-white">
            <Pagination
              currentPage={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              from={data.meta.from}
              to={data.meta.to}
              disabled={loading}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </div>
        </div>
      )}
    </>
  );
}