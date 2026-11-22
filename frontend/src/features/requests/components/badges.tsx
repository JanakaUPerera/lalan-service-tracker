import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import type { RequestPriority, RequestStatus } from '../types';

const STATUS_CLASS: Record<RequestStatus, string> = {
  OPEN: 'text-bg-secondary',
  IN_PROGRESS: 'text-bg-primary',
  RESOLVED: 'text-bg-success',
};

const PRIORITY_CLASS: Record<RequestPriority, string> = {
  LOW: 'text-bg-info',
  MEDIUM: 'text-bg-warning',
  HIGH: 'text-bg-danger',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return <span className={`badge ${PRIORITY_CLASS[priority]}`}>{PRIORITY_LABELS[priority]}</span>;
}