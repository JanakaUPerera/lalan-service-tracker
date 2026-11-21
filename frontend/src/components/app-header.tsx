'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faCircleUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/features/auth/auth-context';

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar bg-white border-bottom">
      <div className="container d-flex justify-content-between">
        <span className="navbar-brand mb-0 h1 fs-5">
          <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
          Service Requests
        </span>

        <div className="d-flex align-items-center gap-3">
          <span className="small text-muted">
            <FontAwesomeIcon icon={faCircleUser} className="me-1" />
            {user?.name}
          </span>
          <button type="button" onClick={logout} className="btn btn-outline-secondary btn-sm">
            <FontAwesomeIcon icon={faRightFromBracket} className="me-1" />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}