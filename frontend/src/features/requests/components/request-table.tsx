import Link from 'next/link';
import { formatDateTime } from '@/lib/format';
import type { ServiceRequest } from '../types';
import { PriorityBadge, StatusBadge } from './badges';

export function RequestTable({
  requests,
  startNumber,
}: {
  requests: ServiceRequest[];
  startNumber: number;
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, index) => (
            <tr key={r.id}>
              <td className="text-muted">{startNumber + index}</td>
              <td>
                <Link href={`/requests/${r.id}`}>{r.title}</Link>
              </td>
              <td>
                <PriorityBadge priority={r.priority} />
              </td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td className="text-muted small">{formatDateTime(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}