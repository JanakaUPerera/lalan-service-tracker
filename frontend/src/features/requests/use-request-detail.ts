'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { requestsApi } from './api';
import type { RequestHistoryEntry, ServiceRequest } from './types';

export function useRequestDetail(id: string) {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [history, setHistory] = useState<RequestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([requestsApi.get(id, controller.signal), requestsApi.history(id, controller.signal)])
      .then(([latest, entries]) => {
        setRequest(latest);
        setHistory(entries);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'Unexpected error.'));
        setLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { request, history, loading, error, reload };
}