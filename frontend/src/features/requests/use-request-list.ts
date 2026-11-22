'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { requestsApi } from './api';
import { useRequestRefresh } from './request-refresh-context';
import type { Paginated, RequestListFilters, ServiceRequest } from './types';

export function useRequestList(filters: RequestListFilters) {
  const { refreshVersion } = useRequestRefresh();
  const [data, setData] = useState<Paginated<ServiceRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { search, status, priority, page } = filters;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    requestsApi
      .list({ search, status, priority, page }, controller.signal)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return; // superseded request
        setError(err instanceof ApiError ? err : new ApiError(0, 'Unexpected error.'));
        setLoading(false);
      });

    // Cancels the in-flight request when filters change, so a slow old response
    // can never overwrite a newer one.
    return () => controller.abort();
  }, [search, status, priority, page, reloadKey, refreshVersion]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, reload };
}