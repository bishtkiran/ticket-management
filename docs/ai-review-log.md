# AI Review Log

## Review 001 — Java Spring Boot Guidelines

### AI-generated suggestion

The initial AI-generated guidelines required every application
component to use four layers:

- presentation
- application/service
- domain
- persistence/infrastructure

### Review finding

This was considered too prescriptive for the relatively small
Support Ticket Management System and could encourage unnecessary
abstractions.

### Correction

The guideline was changed to require separation of API,
business/application, and persistence concerns while allowing a
dedicated domain layer when justified by the business complexity.

### Reason

The project guidelines themselves state that unnecessary complexity
and premature abstraction should be avoided.

### Additional correction

The state-machine requirement was explicitly added to the engineering
guidelines so that ticket status transitions are enforced server-side
and are not dependent on frontend validation.



## Review 002 — API Standards

**Artifact reviewed:** `.cursor/rules/api-standards.md`

**Review stage:** AI-generated API engineering guidelines

### Finding 1 — HTTP validation semantics

The AI proposed both `400 Bad Request` and `422 Unprocessable Entity`
for different validation scenarios without defining a sufficiently
clear project-wide boundary.

### Correction

Use `400` for malformed requests and request validation failures.
Use `409 Conflict` for resource-state conflicts such as invalid ticket
status transitions.

`422` will not be introduced unless the approved API specification
explicitly adopts it.

### Finding 2 — Unnecessary API versioning

The AI included general API versioning guidance even though the
application has no requirement for versioned APIs.

### Correction

Do not introduce API version prefixes unless a documented
compatibility requirement exists.

### Finding 3 — Unnecessary pagination

The AI implied that list APIs should use pagination by default.

Pagination is not currently an application requirement.

### Correction

Implement search and status filtering as required. Introduce
pagination only if the specification or expected data volume
justifies it.

### Finding 4 — Unrequested authentication

The AI included authentication and authorization guidance even
though authentication is not part of the current requirements.

### Correction

Do not introduce authentication/authorization infrastructure unless
it becomes an approved requirement.

Security rules concerning secrets, input validation, error leakage,
and server-side business-rule enforcement remain applicable.


## Review 003 — Requirements Specification Review

**Artifact reviewed:** `spec/requirements.md`

**Review stage:** Human review of AI-generated requirements specification

### Finding 1 — Database technology was incorrectly treated as unspecified

**AI suggestion**

The specification stated that the exact database technology was not specified and could be chosen by the implementation team.

**Issue**

The original exercise explicitly requires PostgreSQL/H2.

**Correction**

The requirement was updated to explicitly require PostgreSQL as the primary persistent database and allow H2 for appropriate testing or lightweight local development.


### Finding 2 — Initial ticket status was not explicitly defined

**AI suggestion**

The specification defined valid ticket transitions but did not explicitly state the initial status of a newly created ticket.

**Issue**

Without an explicit initial state, implementation could leave the status nullable or allow the client to choose an arbitrary initial status.

**Correction**

Added the business rule:

`Every newly created ticket shall have status OPEN.`

**Why this matters**

The initial state is part of the state-machine contract and must be deterministic for both implementation and testing.



### Finding 3 — State-machine requirements were not sufficiently explicit

**AI suggestion**

The specification initially described the lifecycle as needing to remain "coherent".

**Issue**

This was too vague to serve as an implementation and testing contract.

**Correction**

The requirements were changed to explicitly define the only valid transitions:

* `OPEN → IN_PROGRESS`
* `IN_PROGRESS → RESOLVED`
* `RESOLVED → CLOSED`
* `OPEN → CANCELLED`
* `IN_PROGRESS → CANCELLED`

The backend must reject every transition outside this set.

**Why this matters**

The state machine is a core business rule and must be precise enough to derive automated integration tests.


### Finding 4 — Assignee requirement could introduce unrequested user management

**AI suggestion**

The specification stated that an assignee must correspond to a valid record in the application context.

**Issue**

The original exercise requires that an assignee can be changed, but it does not require authentication, user management, or a separate user-management subsystem.

This wording could cause the implementation AI to introduce unnecessary user entities, authentication, and authorization infrastructure.

**Correction**

The requirement was changed so that an assignee may be assigned or unassigned, while the exact representation is defined by the approved data model and API contract.

Full user management remains outside the current scope.

**Why this matters**

AI should not expand the project scope based on assumptions that are not supported by the requirements.


### Finding 5 — Assignee workflow dependency was invented

**AI suggestion**

The specification stated that a ticket may be assigned or unassigned "depending on the workflow state".

**Issue**

The original requirements do not state that assignment depends on ticket status.

**Correction**

The workflow dependency was removed. A ticket may be assigned or unassigned unless a future approved requirement defines a status-specific assignment rule.

**Why this matters**

Business rules should be derived from approved requirements rather than inferred by the AI.


### Finding 6 — Search and status-filter validation was too vague

**AI suggestion**

The specification required search terms and filter criteria to be validated but did not define what constituted valid input.

**Issue**

The implementation could make arbitrary decisions about blank searches or invalid status values.

**Correction**

The requirements were made more deterministic:

* Search terms are trimmed before processing.
* A blank search term is treated as no search filter.
* Status filters accept only supported ticket status values.

**Why this matters**

Requirements should define observable behavior so that implementation and tests do not depend on arbitrary AI decisions.


### Finding 7 — Persistence requirement did not explicitly cover application restart

**AI suggestion**

The specification initially required ticket data to remain available for subsequent retrieval but did not explicitly mention application restart.

**Issue**

The exercise explicitly requires that data survives an application restart.

**Correction**

The requirement was changed to explicitly require ticket and comment data to remain available after the application is stopped and restarted.

**Why this matters**

This converts an implicit persistence expectation into a testable acceptance criterion.



### Finding 8 — Invalid state transitions needed explicit error semantics

**AI suggestion**

The specification initially described invalid transitions as validation errors.

**Issue**

An invalid status transition is a business-rule/resource-state conflict rather than merely malformed request data.

**Correction**

The requirements now define invalid status transitions as a distinct business-rule failure. The API contract will define the corresponding HTTP response consistently, using `409 Conflict` for an operation that conflicts with the ticket's current state.

**Why this matters**

Clear error semantics allow the API specification and integration tests to verify the behavior consistently.


## Review 004 — State Machine Specification

**Artifact reviewed:** `spec/state-machine.md`

### Finding 1 — Initial state was not explicitly defined

The state machine defined valid transitions but did not explicitly state
the initial state of a newly created ticket.

**Correction:** Added `OPEN` as the mandatory initial ticket status.

**Why this matters:** The initial state must be deterministic and should
not be decided independently by the frontend or implementation AI.


### Finding 2 — AI used an ambiguous transition sequence

The specification listed `OPEN -> IN_PROGRESS -> CLOSED` as an invalid
transition example.

**Issue:** This represents multiple transitions rather than one
transition and could confuse test generation.

**Correction:** Replaced it with explicit invalid direct transitions,
including `OPEN -> CLOSED` and `IN_PROGRESS -> CLOSED`.


### Finding 3 — AI incorrectly described terminal tickets as immutable

The specification stated that CANCELLED and CLOSED tickets were
"immutable".

**Issue:** The requirements only state that these states cannot transition
to another status. They do not prohibit updating other ticket fields
such as title, description, priority, assignee, or comments.

**Correction:** Changed the rule to prohibit further status transitions
from terminal states without making the entire ticket immutable.

**Why this matters:** Overly broad AI-generated business rules could
prevent functionality that is actually required by the application.


### Finding 4 — State-machine and API concerns were mixed

The specification included detailed HTTP status-code guidance even
though `api-contract.md` is responsible for defining the API contract.

**Correction:** `state-machine.md` defines the business rule and
invalid-transition behavior, while `api-contract.md` defines the HTTP
status code and error response representation.


## Review 005 — Architecture Specification

**Artifact reviewed:** `spec/architecture.md`

### Finding 1 — H2 and PostgreSQL were treated too similarly

**AI suggestion**

The architecture suggested using H2 for local execution and tests as a
lightweight alternative to PostgreSQL.

**Issue**

H2 and PostgreSQL are not behaviorally identical databases. Tests that
depend on database-specific SQL, constraints, types, or behavior may
pass against H2 while failing against PostgreSQL.

**Correction**

The architecture was updated so PostgreSQL remains the primary runtime
database. H2 may be used for compatible tests, while PostgreSQL-specific
integration behavior must be tested against PostgreSQL.

**Why this matters**

The test environment should not create false confidence about production
database behavior.


### Finding 2 — Business-rule ownership was ambiguous

**AI suggestion**

The architecture assigned business rules to both the application/service
layer and the domain layer.

**Issue**

This could lead to duplicated state-machine logic in multiple layers.

**Correction**

The domain model owns lifecycle invariants and state transitions. The
application/service layer coordinates use cases, transactions, and
persistence without duplicating the state-machine rules.

**Why this matters**

A business rule should have a clear owner so that different parts of
the application cannot implement conflicting versions of the rule.


### Finding 3 — State transition API responsibility was ambiguous

**AI suggestion**

The architecture stated that all status-changing API paths must enforce
the state machine but did not define a single application-level use case
for status changes.

**Correction**

Status changes are treated as a dedicated application use case, and all
API paths capable of changing status must delegate to the same backend
transition validation logic.

**Why this matters**

This prevents different endpoints from accidentally implementing
different state-machine behavior.


## Review 006 — Data Model Specification

**Artifact reviewed:** `spec/data-model.md`

### Finding-001 — Ambiguous identifier type
The specification defined the ticket and comment ID as `BIGINT or UUID`.

This is an implementation decision that should not remain ambiguous before coding.

Decision:
- Use `BIGINT` for ticket and comment primary keys.

Reason:
- The application is small.
- Sequential numeric identifiers are sufficient.
- UUID does not provide a demonstrated benefit for this exercise.

### Finding-002 — Ambiguous assignee representation
The specification allowed either `VARCHAR(255)` or `BIGINT`.

Decision:
- Use a simple `VARCHAR(255)` assignee identifier/name for the MVP because the requirements do not require a separate User entity.

### Finding-003 — Priority values were not defined
The specification referenced a "supported priority set" without defining the values.

Decision:
- Define the supported priority enum explicitly before implementation:
  - LOW
  - MEDIUM
  - HIGH
  - CRITICAL

### Finding-004 — State-machine enforcement clarification
The specification discussed database constraints for status but did not clearly distinguish valid status values from valid state transitions.

Correction:
- Database constraints may restrict status to:
  OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED.
- Backend/domain/service logic must enforce allowed transitions.
- Integration tests must verify invalid transitions are rejected and not persisted.

### Finding-005 — Initial status was not explicit
The specification did not explicitly define the status of a newly created ticket.

Decision:
- New tickets must start in `OPEN`.


### Finding-006 — Ticket deletion was not required
The specification introduced alternative deletion behavior even though ticket deletion is not part of the requirements.

Decision:
- Do not implement ticket deletion.

## Review 007 — UI Flow Specification

**Artifact reviewed:** `spec/ui-flow.md`

### Finding-001 — Ticket List API mapping was not explicit

The Ticket List specification defined search, filtering, creation, and ticket navigation, but it did not explicitly map each UI action to the corresponding API endpoint.

Decision:

* Ticket list must use `GET /api/tickets`.
* Search must use `GET /api/tickets/search?keyword={keyword}`.
* Status filtering must use `GET /api/tickets?status={status}`.
* Opening a ticket must use `GET /api/tickets/{id}`.
* Creating a ticket must use `POST /api/tickets`.

Reason:

* The UI flow should remain directly traceable to the API contract.
* Explicit API mapping reduces ambiguity during implementation and testing.

### Finding-002 — Create Ticket API behavior was not explicit

The Create Ticket flow defined the form fields and validation but did not explicitly identify the API operation and response handling.

Decision:

* Submit the form using `POST /api/tickets`.
* Expect `201 Created` on successful creation.
* Use the returned ticket resource to update or refresh the UI.
* Display backend validation errors when creation fails.

Reason:

* The API contract defines the backend operation.
* The UI must not assume creation succeeded until the backend confirms it.

### Finding-003 — Ticket Details API mapping was not explicit

The Ticket Details screen defined the displayed fields and actions but did not explicitly specify how ticket details are retrieved.

Decision:

* Load ticket details using `GET /api/tickets/{id}`.
* Display the returned ticket data.
* Display a not-found state when the API returns `404 Not Found`.
* Provide a retry option for recoverable API failures.

Reason:

* The UI needs a deterministic contract for loading a ticket.
* This keeps UI behavior consistent with the API specification.

### Finding-004 — Edit Ticket API mapping was not explicit

The Edit Ticket flow defined editable fields but did not explicitly identify the API used to persist those changes.

Decision:

* Update ticket fields using `PATCH /api/tickets/{id}`.
* Allow updates to title, description, priority, and assignee.
* Expect `200 OK` with the updated ticket resource.
* Handle `400 Bad Request`, `404 Not Found`, and applicable business validation errors.

Reason:

* The API contract defines `PATCH /api/tickets/{id}` as the ticket field update operation.
* The UI must reflect the persisted backend state rather than assuming local changes were saved.

### Finding-005 — Status-change API and backend authority needed clarification

The UI correctly described the valid state transitions, but it could be interpreted as allowing the frontend to enforce the state machine.

Correction:

* Status changes must use `PATCH /api/tickets/{id}/status`.
* The frontend may disable invalid actions for user experience.
* The backend remains the authoritative source for transition validation.
* The UI must handle `409 Conflict` when the backend rejects an invalid transition.
* The UI must not treat a status change as successful until the API confirms it.

Reason:

* `state-machine.md` requires backend enforcement.
* The frontend must not become the source of truth for lifecycle rules.

### Finding-006 — Add Comment API mapping was not explicit

The Add Comment flow defined comment validation and success behavior but did not explicitly identify the API endpoint.

Decision:

* Submit comments using `POST /api/tickets/{id}/comments`.
* Require non-blank comment content.
* Expect `201 Created` on success.
* Display the returned comment after successful creation.
* Handle `400 Bad Request` and `404 Not Found` appropriately.

Reason:

* This directly aligns the UI workflow with the API contract.
* Comments must only be considered persisted after successful backend response.

### Finding-007 — Search behavior needed explicit API contract alignment

The Search section stated that blank search values should revert to normal listing, while the API contract defines `keyword` as required for the dedicated search endpoint.

Decision:

* A blank search value must not call `GET /api/tickets/search`.
* When the search input is blank, the UI should use the normal ticket-list request instead.
* A non-blank search term should call `GET /api/tickets/search?keyword={keyword}`.
* Search results should replace the current list.
* An empty result set should be displayed as a normal empty state.

Reason:

* This removes ambiguity between the dedicated search endpoint and default listing behavior.
* It keeps frontend behavior consistent with the API contract.

### Finding-008 — Status filter API mapping was not explicit

The status-filter UI was defined, but the API request and supported values should be stated explicitly.

Decision:

* Status filtering must use `GET /api/tickets?status={status}`.
* Supported values are:

  * `OPEN`
  * `IN_PROGRESS`
  * `RESOLVED`
  * `CLOSED`
  * `CANCELLED`
* The default "All statuses" option must request the normal ticket list without a status filter.
* Invalid status values returned or detected by the backend must be surfaced as a user-friendly error.

Reason:

* This aligns the UI directly with the API contract and state-machine specification.

### Finding-009 — UI status display must use backend state

The status display section defined visual styling for each state but did not explicitly state that the backend response is authoritative.

Decision:

* The UI must display the status returned by the backend.
* Status styling must be derived from the current backend status.
* The UI must not permanently change the displayed status before a successful status-update response.
* After a successful status update, the UI should use the returned ticket state.

Reason:

* Prevents the UI from displaying a state that was rejected or not persisted by the backend.
* Maintains consistency with the backend state machine.

### Finding-010 — API error-to-UI mapping needed to be explicit

The UI flow defined user-friendly error messages but did not provide a consistent mapping between API responses and UI behavior.

Decision:

* `400 Bad Request` → display validation or request error.
* `404 Not Found` → display a resource-not-found state.
* `409 Conflict` → display an invalid state-transition message.
* `422 Unprocessable Entity`, if used → display the applicable business validation error.
* `500 Internal Server Error` → display a generic server error.
* Network failure → display a connection/retry message.
* Raw backend/database/exception details must never be shown to the user.

Reason:

* Provides consistent error handling across all UI flows.
* Aligns the UI with the API contract and error-handling requirements.


## Review 008 — Backend Domain Implementation

**Artifact reviewed:** `backend/java/Ticket.java`

### Finding-001 — Wrong data type

The data type was UUID which was not aligned with the one defined in the data-model.md

Decision:

* Corrected the datatype

Reason:

* The AI should use the data defined in the specfication and should not assume anything.







