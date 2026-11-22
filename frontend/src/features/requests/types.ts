export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface RequestListFilters {
  search: string;
  status: RequestStatus | '';
  priority: RequestPriority | '';
  page: number;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  priority: RequestPriority;
}