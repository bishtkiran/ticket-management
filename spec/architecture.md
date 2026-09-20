# Architecture Specification

## 1. Overview

This project is a small support ticket management system built with Java 21 and Spring Boot on the backend, a React/Next.js frontend, and PostgreSQL as the production database. The architecture is intentionally simple and pragmatic, with clear boundaries between the presentation layer, business logic, persistence, and external integration points.

The design must remain appropriate to the size and complexity of the application. It should favor clarity and maintainability over unnecessary abstraction or framework-heavy patterns.

## 2. Technology summary

- Backend: Java 21, Spring Boot
- Production database: PostgreSQL
- Test/local lightweight database: H2
- API: REST
- Frontend: React/Next.js
- Runtime model: a small, layered web application with clear service boundaries

## 3. Backend architecture

### 3.1 Layering

The backend should follow a simple layered structure appropriate for a small application:

- API/presentation layer
  - Handles HTTP requests and responses
  - Maps request payloads to application objects or DTOs
  - Executes basic request validation and error translation
  - Does not contain business rules

- Application/service layer
  - Contains use-case orchestration and business workflows
  - Applies business rules and validation that are required by the application
  - Coordinates persistence and domain behavior
  - Owns transaction boundaries for write operations

- Domain layer
  - Holds core business concepts and rules when they add meaningful value
  - Encapsulates state transitions and workflow logic
  - Keeps business rules out of controllers and repositories
  - May be lightweight for a small application, but must still protect invariants and valid state transitions

- Persistence/infrastructure layer
  - Manages database access, repositories, and technical integration concerns
  - Isolates persistence technology from higher layers
  - Exposes data access capabilities without leaking technical details into the business layer

### 3.2 Backend responsibilities

- Expose REST endpoints for ticket operations
- Validate incoming requests
- Enforce business rules and state transitions
- Coordinate persistence and transactional writes
- Return consistent success and error responses
- Keep controllers thin and focused on HTTP concerns

### 3.3 Business rule ownership

- The domain model owns ticket lifecycle invariants and valid state transitions.
- The application/service layer coordinates use cases, transactions,authorization boundaries if introduced later, and persistence.
- The service layer must not duplicate the state-machine rules when those rules are already enforced by the domain model.
- Controllers must not implement state-machine logic.

## 4. Frontend architecture

The frontend should be intentionally lightweight and focused on user experience and interaction with the backend API.

### 4.1 Frontend responsibilities

- Render ticket-related pages and forms
- Collect user input and submit requests to the backend
- Display ticket lists, detail views, and status-aware UI states
- Show meaningful validation and failure messages to users
- Provide a user-friendly interface for ticket lifecycle actions

### 4.2 Frontend constraints

- The frontend must not be treated as the source of truth for business rules.
- The frontend may provide UI guidance and convenience checks, but the backend is authoritative for validation and workflow enforcement.
- The frontend should not duplicate complex business logic or state-machine rules that belong to the backend.
- Frontend behavior should remain simple and aligned with the API contract.

## 5. Database boundary

### 5.1 Production database

- PostgreSQL is the production database.
- It is used for persistent application data and transactional consistency.
- The database should maintain the canonical state of ticket records and related data.

### 5.2 Test/local database

- H2 may be used for fast unit/integration tests where the SQL and persistence behavior are compatible with PostgreSQL.
- Tests that depend on PostgreSQL-specific behavior shall use a PostgreSQL test environment rather than relying on H2 compatibility.
- H2 shall not be treated as behaviorally identical to PostgreSQL.

### 5.3 Persistence boundaries

- Persistence concerns belong in the repository/infrastructure layer.
- Application logic should not depend on database implementation details.
- JPA entities may be used for persistence models when appropriate, but they should not be exposed directly as API contracts.

## 6. API boundary

The application exposes a REST API that is the contract between frontend and backend.

### 6.1 API responsibilities

- Define resource-oriented endpoints for ticket operations
- Use standard HTTP methods and semantics
- Return consistent success and error payloads
- Validate input at the API boundary
- Translate backend exceptions into clear HTTP responses

### 6.2 API constraints

- The API contract must remain separate from persistence entities and internal domain models.
- Controllers should not contain business logic.
- API responses should avoid leaking internal implementation details.
- DTOs should represent the public contract, not persistence structure.

## 7. Validation boundary

Validation should occur at clear boundaries:

- API boundary: validate incoming request structure, required fields, and obvious format errors
- Service/application layer: validate business rules and workflow constraints
- Persistence/database layer: enforce data integrity constraints when needed

The backend must enforce all meaningful validation rules. The frontend may help with UX, but it is not the authoritative validation layer.

## 8. State-machine responsibility

The ticket state machine is a core business rule and must be enforced by the backend.

### 8.1 Required lifecycle

- Newly created tickets shall start in the OPEN state.
- The client shall not control the initial lifecycle state during ticket creation.

- OPEN -> IN_PROGRESS
- IN_PROGRESS -> RESOLVED
- RESOLVED -> CLOSED
- OPEN -> CANCELLED
- IN_PROGRESS -> CANCELLED

### 8.2 Enforcement requirement

- The backend is the source of truth for valid ticket transitions.
- The frontend must not determine whether a transition is valid.
- All API paths that can change ticket status must use the same transition validation logic.
- Invalid transitions must be rejected before persistence.

### 8.3 Terminal states

- CLOSED and CANCELLED are terminal states in the defined state machine.
- A ticket in a terminal state must not transition back to an earlier state.

## 9. Error handling

Errors should be handled in a consistent, predictable way across the application.

### 9.1 Backend error handling

- Translate validation failures, domain violations, and persistence failures into clear API responses.
- Return meaningful error messages without exposing internal system details.
- Use consistent HTTP status codes for similar failures.
- Keep exception handling centralized at the HTTP boundary where practical.

### 9.2 Frontend error handling

- Render meaningful user-facing errors based on API responses.
- Display validation feedback and failure messages without exposing internal technical details.
- Keep error rendering simple and user-friendly.

## 10. Testing architecture

The testing strategy should remain lean and practical for a small application.

### 10.1 Test layers

- Unit tests
  - Validate focused business logic and validation behavior
  - Keep tests fast and isolated

- Integration tests
  - Validate interactions across key application components and persistence
  - Use controlled data and environment setup

- API tests
  - Validate HTTP contracts, status codes, payloads, and error responses

- Repository/persistence tests
  - Verify query behavior and persistence semantics where needed

### 10.2 Rules

- Tests should validate real behavior rather than mock internals.
- Use mocks only where external dependencies or constraints require them.
- Avoid brittle or over-engineered test patterns.
- Keep the test suite maintainable and fast enough for normal development feedback.

## 11. Configuration and environment strategy

### 11.1 Environment separation

- Use environment-specific configuration for application settings.
- Keep local development, testing, and production configuration clearly separated.
- Use environment variables or external configuration for secrets and sensitive values.

### 11.2 Database configuration

- PostgreSQL for production and any shared or full deployment environment.
- H2 for local execution and lightweight tests when appropriate.
- Avoid hard-coding credentials or sensitive configuration values in source-controlled files.

### 11.3 Operational configuration

- Keep configuration explicit and readable.
- Prefer standard Spring Boot conventions over custom configuration patterns.
- Keep the environment setup simple and suitable for a small application.

## 12. Design principles for a small application

- Favor a simple layered architecture over speculative abstraction.
- Add a dedicated domain layer only when it meaningfully improves the understanding or enforcement of business rules.
- Avoid creating layers or abstractions solely to satisfy a pattern.
- Prefer clear responsibilities and straightforward code over generic frameworks.
- Keep the system easy to understand, test, and evolve.

## 13. Scope note

This architecture is intended for a small support ticket management system. It balances clarity, maintainability, and project size without introducing unnecessary complexity or heavy enterprise patterns.
