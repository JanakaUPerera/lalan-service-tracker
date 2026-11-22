import type { RequestPriority, RequestStatus } from './types';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

/** Mirrors the server workflow for UI affordances only. The server remains the authority. */
export const NEXT_STATUS: Record<RequestStatus, RequestStatus | null> = {
  OPEN: 'IN_PROGRESS',
  IN_PROGRESS: 'RESOLVED',
  RESOLVED: null,
};

export const ACTION_LABELS: Record<RequestStatus, string> = {
  OPEN: '',
  IN_PROGRESS: 'Start work',
  RESOLVED: 'Mark as resolved',
};