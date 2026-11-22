'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number | null;
  to: number | null;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, total, from, to, disabled, onPageChange }: PaginationProps) {
  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
      <small className="text-muted">
        Showing {from ?? 0}–{to ?? 0} of {total}
      </small>

      <nav aria-label="Request pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage <= 1 || disabled ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || disabled}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </li>
          <li className="page-item active" aria-current="page">
            <span className="page-link">
              {currentPage} / {lastPage}
            </span>
          </li>
          <li className={`page-item ${currentPage >= lastPage || disabled ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage || disabled}
              aria-label="Next page"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}