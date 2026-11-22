import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { formatDateTime } from '@/lib/format';
import type { RequestHistoryEntry } from '../types';
import { StatusBadge } from './badges';

export function HistoryTimeline({ entries }: { entries: RequestHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted mb-0">No status changes yet.</p>;
  }

  return (
    <ol className="list-group list-group-flush list-unstyled mb-0">
      {entries.map((entry) => (
        <li key={entry.id} className="list-group-item px-0">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <StatusBadge status={entry.from_status} />
            <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
            <StatusBadge status={entry.to_status} />
          </div>
          {entry.remark && <p className="mb-1 mt-2 fst-italic">“{entry.remark}”</p>}
          <small className="text-muted d-block mt-1">
            {entry.actioned_by?.name ?? 'Unknown'} · {formatDateTime(entry.created_at)}
          </small>
        </li>
      ))}
    </ol>
  );
}