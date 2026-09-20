# Ticket State Machine

## 1. States
    

The ticket lifecycle includes the following states:

- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED
- CANCELLED

## 1.1 Initial state

Every newly created ticket shall have the initial status:
- OPEN
The client shall not be required to provide an initial status when creating a ticket.

## 1.2 Terminal states

The following are terminal states:

- CLOSED
- CANCELLED

A ticket in a terminal state cannot transition to any other state.

## 2. Valid transitions

The following transitions are valid:

- OPEN -> IN_PROGRESS
- IN_PROGRESS -> RESOLVED
- RESOLVED -> CLOSED
- OPEN -> CANCELLED
- IN_PROGRESS -> CANCELLED

The system must allow only these transitions. Every other transition is invalid.

## 3. Invalid transition examples

The backend must reject the following transitions:

- CLOSED -> OPEN
- RESOLVED -> OPEN
- CANCELLED -> OPEN
- OPEN -> RESOLVED
- OPEN -> CLOSED
- IN_PROGRESS -> OPEN
- IN_PROGRESS -> CLOSED
- RESOLVED -> IN_PROGRESS
- RESOLVED -> CANCELLED
- CLOSED -> IN_PROGRESS
- CLOSED -> RESOLVED
- CLOSED -> CANCELLED
- CANCELLED -> IN_PROGRESS
- CANCELLED -> RESOLVED
- CANCELLED -> CLOSED
- A ticket must not transition directly from OPEN to CLOSED.
- A ticket must not transition directly from IN_PROGRESS to CLOSED.
- CLOSED can only be reached from RESOLVED.

Any transition not explicitly listed as valid must be rejected.

## 4. Business rule summary

- The normal lifecycle progresses forward from OPEN to IN_PROGRESS,then RESOLVED, then CLOSED.
- Cancellation provides an alternative terminal path from OPEN or IN_PROGRESS.
- Tickets may be cancelled only from OPEN or IN_PROGRESS.
- Once a ticket reaches a terminal status such as CLOSED or CANCELLED, it must not transition back to an earlier state.
- The backend is the source of truth for transition validation.
- The frontend must not be trusted to enforce or determine valid transitions.

## 5. Expected API behaviour

- Any API endpoint that updates ticket status must validate the requested transition server-side.
- Transition validation must occur in the backend before persistence.
- If the requested transition is invalid, the API must reject the change and return an error response.
- A valid transition must persist the new state and return the updated ticket information or a success response consistent with the API contract.
- All status-changing API paths must use the same transition validation logic.

## 6. Expected HTTP status for invalid transitions

For invalid ticket status transitions, the API should use a client-error status code. Recommended status:

- 409 Conflict

Rationale:
- The request conflicts with the current ticket state and the defined workflow rules.
- A 400 Bad Request may also be used in some API designs, but 409 Conflict is the clearest and most semantically appropriate choice for invalid lifecycle transitions.

The final status code used by the API should remain consistent across all ticket state-changing endpoints.

## 7. Test cases

### 7.1 Valid transition tests

- TC-000: A newly created ticket has status OPEN.
- TC-001: OPEN -> IN_PROGRESS is accepted.
- TC-002: IN_PROGRESS -> RESOLVED is accepted.
- TC-003: RESOLVED -> CLOSED is accepted.
- TC-004: OPEN -> CANCELLED is accepted.
- TC-005: IN_PROGRESS -> CANCELLED is accepted.

### 7.2 Invalid transition tests

- TC-006: CLOSED -> OPEN is rejected.
- TC-007: RESOLVED -> OPEN is rejected.
- TC-008: CANCELLED -> OPEN is rejected.
- TC-009: OPEN -> RESOLVED is rejected.
- TC-010: OPEN -> CLOSED is rejected.
- TC-011: IN_PROGRESS -> OPEN is rejected.
- TC-012: IN_PROGRESS -> CLOSED is rejected.
- TC-013: RESOLVED -> IN_PROGRESS is rejected.
- TC-014: RESOLVED -> CANCELLED is rejected.
- TC-015: CLOSED -> IN_PROGRESS is rejected.
- TC-016: CLOSED -> RESOLVED is rejected.
- TC-017: CLOSED -> CANCELLED is rejected.
- TC-018: CANCELLED -> IN_PROGRESS is rejected.
- TC-019: CANCELLED -> RESOLVED is rejected.
- TC-020: CANCELLED -> CLOSED is rejected.

### 7.3 Business rule tests

- TC-021: A terminal state cannot transition back to any earlier state.
- TC-022: A ticket in CANCELLED state cannot transition to another status.
- TC-023: A ticket in CLOSED state cannot transition to another status.
- TC-024: A status-changing API request with a disallowed transition is rejected before persistence.
- TC-025: A valid status change persists the new state and the updated state is readable afterward.

### 7.4 API contract tests

- TC-026: Valid transitions return the expected success response and updated ticket state.
- TC-027: Invalid transitions return a consistent error payload and HTTP 409 status.
- TC-028: All status-changing endpoints enforce the same state machine rules.

## 8. Scope note

This document defines the required ticket lifecycle and validation rules for the application. It is intended as a project-wide business rule specification and does not prescribe implementation code or framework-specific patterns.
