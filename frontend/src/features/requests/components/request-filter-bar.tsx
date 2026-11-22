'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import type { RequestPriority, RequestStatus } from '../types';

interface Props {
  search: string;
  status: RequestStatus | '';
  priority: RequestPriority | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: RequestStatus | '') => void;
  onPriorityChange: (value: RequestPriority | '') => void;
  onReset: () => void;
}

export function RequestFilterBar(props: Props) {
  return (
    <form className="row g-2 mb-3" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="col-12 col-md-5">
        <label htmlFor="filter-search" className="visually-hidden">
          Search by title
        </label>
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            id="filter-search"
            type="search"
            className="form-control"
            placeholder="Search by title"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="col-6 col-md-3">
        <label htmlFor="filter-status" className="visually-hidden">
          Status
        </label>
        <select
          id="filter-status"
          className="form-select"
          value={props.status}
          onChange={(e) => props.onStatusChange(e.target.value as RequestStatus | '')}
        >
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="col-6 col-md-3">
        <label htmlFor="filter-priority" className="visually-hidden">
          Priority
        </label>
        <select
          id="filter-priority"
          className="form-select"
          value={props.priority}
          onChange={(e) => props.onPriorityChange(e.target.value as RequestPriority | '')}
        >
          <option value="">All priorities</option>
          {(Object.keys(PRIORITY_LABELS) as RequestPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-1 d-grid">
        <button type="button" className="btn btn-outline-secondary" onClick={props.onReset} title="Reset filters">
          <FontAwesomeIcon icon={faRotateLeft} />
          <span className="visually-hidden">Reset filters</span>
        </button>
      </div>
    </form>
  );
}