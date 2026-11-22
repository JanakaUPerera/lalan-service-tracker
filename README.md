# Service Request Tracker

Internal service-request tracker for employees. Each user creates and manages only their own requests. Status changes follow a controlled workflow, every change is audited, and concurrent (stale) updates are rejected instead of silently overwriting data.

Monorepo: Laravel REST API (`backend/`) + Next.js frontend (`frontend/`).

## Stack

| Layer | Choice |
|---|---|
| API | Laravel [13.x], PHP 8.5, Laravel Sanctum (SPA cookie auth) |
| Database | SQLite (migrations + seeders; portable to MySQL/PostgreSQL) |
| Frontend | Next.js (App Router, TypeScript), Bootstrap 5, FontAwesome |
| Tests | PHPUnit feature tests (Laravel) |

## Repository layout

```
backend/    Laravel API
frontend/   Next.js app
screenshots/
```

## Prerequisites

PHP 8.2+ (developed on 8.5), Composer, Node 20+ (developed on 26), npm.

## Setup

### Backend (http://localhost:8000)

```bash
cd backend
composer install
cp .env.example .env            # Windows PowerShell: Copy-Item .env.example .env
php artisan key:generate
touch database/database.sqlite  # PowerShell: New-Item database/database.sqlite -ItemType File
php artisan migrate --seed
php artisan serve
```

### Frontend (http://localhost:3000)

```bash
cd frontend
npm install
cp .env.example .env.local      # PowerShell: Copy-Item .env.example .env.local
npm run dev
```

> Always open the app at **http://localhost:3000** (not 127.0.0.1). The session cookie is scoped to `localhost`.

### Demo accounts

| Email | Password |
|---|---|
| janaka.perera@gmail.com | asd@1234 |
| lalan.group@gmail.com | asd@1234 |
| admin@gmail.com | password |

### Run tests

```bash
cd backend
php artisan test
```

## Authentication: Laravel Sanctum, SPA cookie mode

**Why cookies over JWT/tokens:** the frontend and API share a registrable domain (`localhost`; ports don't affect "same-site"), so the SPA flow is a natural fit. The session cookie is `HttpOnly`, so JavaScript (and therefore XSS) cannot read it, unlike a JWT in `localStorage`. Logout destroys the server-side session, giving real revocation, which stateless JWTs cannot do without a denylist.

Flow:
1. `GET /sanctum/csrf-cookie` sets the `XSRF-TOKEN` cookie.
2. `POST /api/auth/login` with the `X-XSRF-TOKEN` header, which starts the session (session ID regenerated to prevent fixation).
3. Later requests send the session cookie (`credentials: 'include'`) plus the CSRF header on mutations.
4. `POST /api/auth/logout` invalidates the session and rotates the CSRF token.

Security notes: bcrypt password hashing (Laravel `hashed` cast), session lifetime 120 min (`SESSION_LIFETIME`), login throttled to 5 attempts/minute, CORS restricted to the frontend origin with `supports_credentials`, secrets only in `.env` (never committed). A 401 on any API call returns the user to the login screen.

## Data model

- `service_requests`: `id`, `created_by` (FK users), `title` (3-100), `description` (10-500), `priority` (LOW/MEDIUM/HIGH), `status` (OPEN/IN_PROGRESS/RESOLVED, default OPEN), `version` (default 1), timestamps.
  Indexes: `(created_by, created_at)` for the newest-first list, `(created_by, status, priority)` for combined filters.
- `request_status_histories`: `id`, `service_request_id` (FK, cascade), `actor_user_id` (FK), `from_status`, `to_status`, `remark` (nullable), `created_at`. Index `(service_request_id, created_at)`.

Status and priority are string columns validated by PHP backed enums (portable across databases, no DB `ENUM` migrations).

## API

All routes are under `/api`. Responses use Laravel resource envelopes.

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/auth/login` | `{email,password}` → `{data:{id,name,email}}` |
| GET | `/auth/me` | Current user, 401 if signed out |
| POST | `/auth/logout` | 204 |
| POST | `/requests` | `{title,description,priority}` → 201 `{data:{...}}`. `created_by`, `status`, `version` are server-controlled |
| GET | `/requests` | Own only, newest first. Query: `search` (title), `status`, `priority`, `page`, `per_page` (default 10, **max 25**, >25 is a 422) |
| GET | `/requests/{id}` | Owned detail including `version` |
| PATCH | `/requests/{id}/status` | `{status, expected_version, remark?}` |
| GET | `/requests/{id}/history` | Ordered audit trail (oldest first), owner only |

Shapes: single `{data:{id,title,description,priority,status,version,created_at,updated_at}}`; list `{data:[...], links:{...}, meta:{current_page,last_page,per_page,total,from,to}}`; history `{data:[{id,from_status,to_status,remark,actor:{id,name},created_at}]}`.

### Error contract

| Case | HTTP | Body |
|---|---|---|
| Not signed in | 401 | `{message}` |
| Invalid fields | 422 | `{message, errors:{field:[...]}}` |
| Another user's record **or** unknown id | **404** | `{message}` |
| Invalid/duplicate transition | 409 | `{message, code:"INVALID_TRANSITION"}` |
| Stale `expected_version` | 409 | `{message, code:"STALE_VERSION", current_version}` |

**Why 404 (not 403) for non-owned records:** it doesn't reveal that an ID exists. Applied consistently to detail, history and status endpoints via the policy (`Response::denyAsNotFound()`), and authorization runs before validation so non-owners never see 422s either.

## Workflow and concurrency

Allowed transitions: `OPEN → IN_PROGRESS → RESOLVED`. No skipping, reversing, no-ops or changes after RESOLVED. The rule lives in `RequestStatus::canTransitionTo()`.

`ChangeRequestStatus` (action class) runs in one DB transaction:
1. Re-read the row inside the transaction (`lockForUpdate`).
2. Reject if `expected_version` ≠ current version (409 `STALE_VERSION`).
3. Reject if the transition isn't legal (409 `INVALID_TRANSITION`).
4. Compare-and-set: `UPDATE … SET status=?, version=version+1 WHERE id=? AND version=?`. If 0 rows are affected, treat as stale.
5. Insert exactly one history row.

Any exception rolls the transaction back, so failed updates never create history. The version check precedes the transition check because a stale client's view of the state can't be trusted. `lockForUpdate` is a no-op on SQLite; the guarded `UPDATE … WHERE version = ?` is what guarantees correctness on every database.

Only the request's creator can change its status (policy `updateStatus`). Roles like technician/admin are out of scope.

## Backend structure

Thin controllers → Form Requests (validation + authorization) → Action (business rule) → Eloquent models; Policy for ownership; API Resources for output shape; custom exceptions render their own 409 JSON.

## Frontend

- `lib/api/client.ts`: single fetch wrapper (cookies, CSRF header, error normalization, global 401 handler).
- `features/auth`, `features/requests`: feature-oriented folders with typed API modules and hooks.
- Protected routes via a `(protected)` layout guard; the API enforces real security.
- List: server-side pagination, debounced title search, combined status/priority filters, and loading / empty / filtered-empty / error+retry states. Superseded requests are aborted (`AbortController`).
- Detail: version, status actions, chronological history. On a **409** the UI shows why the update failed, reloads the latest version and history, and lets the user retry.
- Bootstrap 5 CSS (no JS bundle) and FontAwesome icons, with labelled form controls and ARIA error wiring.

## Assumptions, trade-offs, future work

- Title search uses `LIKE '%term%'`; it can't use a B-tree index, which is acceptable at this scale (full-text/trigram search would be the next step).
- Filter state isn't synced to the URL.
- Only the owner can change status; role-based access would be a policy-only change.
- Session cookie auth assumes frontend and API share a registrable domain; a cross-site deployment would need an API-token approach.

## Screenshots

See `screenshots/`: login, request list with filters, create form with validation errors, detail with history, and the 409 stale-update warning.

## AI Use & Verification

**Tools used:** Claude was used as a step-by-step architecture and implementation guide. GitHub Copilot in VS Code was used to assist with code changes and documentation edits.

**Work assisted:** AI assistance helped plan the architecture and implementation slices, draft Laravel API and Next.js patterns, suggest test cases, and structure the README. The application code was reviewed and adapted locally before it was committed.

**Representative prompt / advice:** I requested step-by-step guidance with SOLID and maintainable code that I could review and adapt. A representative recommendation was to implement status changes as a transactional action that re-reads the request, validates the `expected_version`, performs a guarded `UPDATE … WHERE version = ?`, inserts the audit history row, and rolls back on failure.

**How I verified and corrected output:**
- Ran `php artisan test --compact`: all 26 tests passed with 133 assertions, covering authentication, validation, protected fields, cross-user isolation, status transitions, history, and stale versions.
- Reviewed the registered API routes and tested protected fields and cross-user access through the feature suite.
- Reviewed the frontend behavior and screenshots for login, filtering, creation, detail/history, and stale-update recovery.
- Corrected and refined AI suggestions where needed: the frontend uses Bootstrap 5 and FontAwesome instead of a Tailwind-based scaffold, and feature tests assert the behavior of the real authenticated routes rather than relying on a superficial response.

**One independent technical decision:** I chose a monorepo with Bootstrap CSS and FontAwesome icons, keeping the frontend dependency-light and avoiding an additional JavaScript UI/component bundle. I also decided to return 404 for a record owned by another user rather than 403, so record existence is not exposed.