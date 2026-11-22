import { apiFetch } from '@/lib/api/client';
import type { ApiResource } from '@/types/api';
import type {
  ChangeStatusPayload,
  CreateRequestPayload,
  Paginated,
  RequestHistoryEntry,
  RequestListFilters,
  ServiceRequest,
} from './types';

export const requestsApi = {
  list: (filters: RequestListFilters, signal?: AbortSignal) =>
    apiFetch<Paginated<ServiceRequest>>('/requests', { query: { ...filters }, signal }),

  get: (id: number | string, signal?: AbortSignal) =>
    apiFetch<ApiResource<ServiceRequest>>(`/requests/${id}`, { signal }).then((r) => r.data),

  create: (payload: CreateRequestPayload) =>
    apiFetch<ApiResource<ServiceRequest>>('/requests', { method: 'POST', body: payload }).then((r) => r.data),

  history: (id: number | string, signal?: AbortSignal) =>
    apiFetch<ApiResource<RequestHistoryEntry[]>>(`/requests/${id}/history`, { signal }).then((r) => r.data),

  changeStatus: (id: number | string, payload: ChangeStatusPayload) =>
    apiFetch<ApiResource<ServiceRequest>>(`/requests/${id}/status`, { method: 'PATCH', body: payload }).then(
      (r) => r.data,
    ),
};