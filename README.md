# Ticket Management

A support ticket application with a Java 21/Spring Boot REST API, a Next.js frontend, and PostgreSQL persistence.

## Features

- Create, list, view, search, filter, and edit tickets
- Update title, description, priority, and assignee
- Add and view ticket comments
- Move tickets through a backend-enforced lifecycle
- Display field validation, API errors, not-found states, and retry actions in the UI

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 22.6+ and npm (for native TypeScript test execution)
- PostgreSQL for local or production use

## Configuration

Copy `.env.example` values into your environment and change them for your database:

| Variable | Local default | Purpose |
| --- | --- | --- |
| `APP_PROFILE` | `local` | Spring profile (`dev`, `local`, `test`, or `prod`) |
| `SERVER_PORT` | `8080` | Backend HTTP port |
| `DB_URL` | `jdbc:postgresql://localhost:5432/ticket_management` | JDBC database URL |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password; override outside local development |
| `APP_DATA_DIR` | `~/.ticket-management/data` | Persistent H2 storage directory for the `dev` and `test` profiles |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api` | Frontend API base URL |

The `local` and `prod` profiles use PostgreSQL. The `dev` profile provides a zero-setup, file-backed H2 database that survives restarts. The `test` profile is also file-backed for backwards compatibility, while automated integration tests override it with an isolated in-memory database.

## Run locally

Create the PostgreSQL database, export the database settings, and start the backend:

```bash
cd backend
mvn spring-boot:run
```

For lightweight development without PostgreSQL, use the persistent H2 profile:

```bash
cd backend
APP_PROFILE=dev mvn spring-boot:run
```

Tickets and comments are stored under `~/.ticket-management/data` by default. Set `APP_DATA_DIR` to an absolute directory to use another location. Always restart with the same profile: PostgreSQL (`local`) and H2 (`dev`) are separate databases.

In another terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The API is served from `http://localhost:8080/api` by default.

## Ticket lifecycle

Every new ticket starts in `OPEN`. The backend permits only these transitions:

```text
OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
  └----> CANCELLED
IN_PROGRESS ---------> CANCELLED
```

`CLOSED` and `CANCELLED` are terminal. Every other transition returns `409 Conflict` and leaves the persisted ticket unchanged. The frontend limits the choices shown to users, but the backend remains authoritative.

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/tickets` | Create a ticket |
| `GET` | `/api/tickets` | List, search with `keyword`, or filter with `status` |
| `GET` | `/api/tickets/{id}` | Get ticket details |
| `PATCH` | `/api/tickets/{id}` | Update ticket fields |
| `PATCH` | `/api/tickets/{id}/status` | Change ticket status |
| `POST` | `/api/tickets/{id}/comments` | Add a comment |
| `GET` | `/api/tickets/{id}/comments` | List comments |

Validation and business errors use the structured error shape documented in `spec/api-contract.md`.

## Validation and error handling

- Title, description, priority, optional assignee length, comment content, status, and status transitions are validated by the backend.
- The frontend mirrors input validation for immediate feedback without replacing backend enforcement.
- Blank search input is normalized to an unfiltered ticket-list request.
- Unsupported status filters are rejected and reset to all statuses.
- Retryable list, detail, comment, and edit-load errors provide a retry action.
- Missing tickets display a distinct not-found state.

## Tests

Run the complete backend suite, including HTTP/database lifecycle integration tests and the generated invalid-transition matrix:

```bash
cd backend
mvn test
```

Run frontend validation tests and the production build:

```bash
cd frontend
npm test
npm run build
```

The integration suite covers creation, retrieval, editing, comments, search/filter behavior, the complete resolution path, both cancellation paths, and every unsupported transition with a persistence check.

## Specifications

The implementation is aligned with the approved documents under `spec/`:

- `requirements.md`
- `architecture.md`
- `api-contract.md`
- `data-model.md`
- `state-machine.md`
- `ui-flow.md`
- `test-strategy.md`
- `implementation-plan.md`

