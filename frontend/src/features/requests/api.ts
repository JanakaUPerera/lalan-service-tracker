import { apiFetch } from '@/lib/api/client';
import type { ApiResource } from '@/types/api';
import type { CreateRequestPayload, Paginated, RequestListFilters, ServiceRequest } from './types';

export const requestsApi = {
  list: (filters: RequestListFilters, signal?: AbortSignal) =>
    apiFetch<Paginated<ServiceRequest>>('/requests', {
      query: { ...filters }, // empty strings are dropped by apiFetch
      signal,
    }),

  get: (id: number | string) =>
    apiFetch<ApiResource<ServiceRequest>>(`/requests/${id}`).then((r) => r.data),

  create: (payload: CreateRequestPayload) =>
    apiFetch<ApiResource<ServiceRequest>>('/requests', { method: 'POST', body: payload }).then((r) => r.data),
};