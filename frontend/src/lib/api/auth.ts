import { apiFetch } from './client';
import type { ApiResource, LoginCredentials, User } from '@/types/api';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiFetch<ApiResource<User>>('/auth/login', { method: 'POST', body: credentials }).then((r) => r.data),

  me: () => apiFetch<ApiResource<User>>('/auth/me').then((r) => r.data),

  logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
};