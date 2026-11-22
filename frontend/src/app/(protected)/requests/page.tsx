import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { RequestList } from '@/features/requests/components/request-list';

export default function RequestsPage() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">My requests</h1>
        <Link href="/requests/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New request
        </Link>
      </div>
      <RequestList />
    </>
  );
}