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






