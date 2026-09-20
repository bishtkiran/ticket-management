# Test Strategy

## 1. Objective

The testing strategy for the Support Ticket Management System is designed to verify the correctness, reliability, and maintainability of the application while keeping the test suite practical and aligned with the project size.

The most critical tests are those that guard business rules, backend validation, and ticket lifecycle enforcement. Special emphasis must be placed on proving that the backend rejects invalid ticket state transitions and that the initial ticket state is OPEN.

## 2. Testing principles

- Test real behavior, not implementation details.
- Prefer small, focused tests over large, brittle test suites.
- Validate behavior at the correct layer: UI, API, service, persistence, or business rule.
- Keep tests readable and maintainable.
- Use the backend as the source of truth for validation and state-machine enforcement.
- Avoid tests that only assert framework behavior or mock behavior rather than observable application outcomes.

## 3. Test scope by layer

### 3.1 Unit tests

Unit tests should validate isolated business logic and domain behavior.

Focus areas:

- Ticket validation rules
- Ticket state transition validation logic
- Business-rule checks for required fields and invalid transitions
- Validation of priority and other constrained fields
- Small helper logic, if any

Examples:

- Ticket title is required
- Ticket description is required
- Priority value is recognized and accepted
- Invalid status transition is rejected

### 3.2 Repository tests

Repository tests verify persistence behavior and database interaction contracts.

Focus areas:

- Persisting a new ticket
- Retrieving tickets by ID and by list query
- Filtering by status
- Saving comments for a given ticket
- Query behavior for search and list operations
- Default initial state is OPEN when a ticket is created

Examples:

- A created ticket is stored with status OPEN
- A ticket can be retrieved by ID
- Filtering by status returns only matching tickets
- A comment is linked to the correct ticket

### 3.3 Controller/API tests

Controller tests validate the public API contract and the behavior of HTTP endpoints.

Focus areas:

- Create ticket endpoint
- List tickets endpoint
- Get ticket detail endpoint
- Update ticket fields
- Change status endpoint
- Add comment endpoint
- Search endpoint
- Filter-by-status endpoint

Examples:

- Create ticket returns 201 and the created ticket payload
- List tickets returns 200 and the correct collection
- Ticket detail returns 404 for a missing ticket
- Invalid status transition returns 409 Conflict
- Empty or invalid request payload returns a validation error response

### 3.4 Integration tests

Integration tests validate that the application works correctly when multiple components interact together.

Focus areas:

- Full ticket creation workflow
- Full ticket update workflow
- End-to-end status transitions through allowed lifecycle steps
- Comment creation and retrieval
- Search and filter behavior across the application stack

Examples:

- Create a ticket, then fetch it by ID, then update it, then filter by its current status
- Create a ticket with status OPEN, transition to IN_PROGRESS, then RESOLVED, then CLOSED
- Create a ticket from OPEN and cancel it successfully

## 4. State-machine test strategy

State-machine validation is a critical requirement and must be tested thoroughly.

### 4.1 Core rule

The backend must reject every invalid transition, and the initial state must be OPEN.

### 4.2 Required state-machine tests

- A newly created ticket has status OPEN.
- OPEN -> IN_PROGRESS is allowed.
- IN_PROGRESS -> RESOLVED is allowed.
- RESOLVED -> CLOSED is allowed.
- OPEN -> CANCELLED is allowed.
- IN_PROGRESS -> CANCELLED is allowed.

State that every transition not explicitly listed as valid must be tested/rejected, not only the examples.

### 4.3 Invalid transition tests

The test suite must explicitly prove that the backend rejects the following invalid transitions:

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

### 4.4 Backend enforcement requirement

The test strategy must ensure that invalid transitions are rejected by the backend before persistence occurs.

This should be proven with tests that:

- attempt an invalid transition through the API
- verify the HTTP status is 409 Conflict
- verify the ticket state remains unchanged after the failed request
- verify the database still contains the original status

This requirement is essential and must not be treated as optional.

## 5. Backend validation tests

Validation tests should cover all critical input and rule checks.

Focus areas:

- Missing required title
- Missing required description
- Blank title or description values
- Invalid priority values
- Invalid ticket status in update requests
- Invalid comment content
- Invalid query parameters for filtering and sorting
- Invalid ID or malformed path parameters

Examples:

- A create ticket request without title is rejected
- A create ticket request without description is rejected
- A ticket update with an unsupported status is rejected
- An invalid filter value for status is rejected
- An empty comment body is rejected

## 6. Frontend tests

Frontend tests should validate presentation and user interaction without duplicating full backend validation logic.

Focus areas:

- Rendering the ticket list
- Displaying empty states
- Showing loading states
- Showing validation errors on forms
- Showing API error messages
- Displaying ticket status badges and lifecycle states
- Search input behavior
- Status filter behavior
- Ticket detail screen rendering
- Successful create/update/comment/status-change workflows

Examples:

- Ticket list shows loading state before data arrives
- Empty state appears when there are no tickets
- Invalid create form fields show validation messages
- API error for ticket creation is displayed to the user
- Selected status filter matches the visible list results

## 7. Important negative tests

Negative tests are essential for confidence in this project.

The following should be explicitly covered:

- Invalid ticket transition is rejected
- Non-existent ticket returns 404
- Update request for missing ticket fails
- Comment against non-existent ticket fails
- Invalid search query is rejected or handled predictably
- Invalid status filter value is rejected
- Blank required fields are rejected
- Duplicate or conflicting business operations are rejected if applicable
- Terminal state cannot transition back to earlier state

## 8. Database persistence tests

Persistence tests ensure persisted data matches real application behavior.

Focus areas:

- A new ticket is stored with status OPEN
- A ticket update persists the changed field values
- A status update persists the new state
- A comment is stored against the correct ticket
- Search and filter queries return persisted records correctly
- Data integrity is maintained when invalid operations are rejected

Examples:

- Creating a ticket persists the correct title, description, priority, and initial status
- Updating the assignee persists the new assignee
- Changing status persists the new state after validation
- Invalid state update does not change the stored status

## 9. Edge cases

The test suite should include edge cases that frequently cause defects.

Important edge cases:

- Ticket created with empty or whitespace-only title
- Ticket created with empty or whitespace-only description
- Search with blank or whitespace-only keyword
- Filter with an unsupported status value
- Update request with no fields to change
- Ticket detail request for a missing or deleted record
- Transition from terminal state back to any earlier state
- Attempts to create or update a ticket with invalid priority values
- Attempt to add a comment with empty content
- Attempt to update a ticket in a terminal state when the state machine does not allow it

## 10. Recommended test matrix

| Area | Priority | Goal |
| --- | --- | --- |
| State-machine validation | High | Prove invalid transitions are rejected by the backend |
| Ticket creation validation | High | Verify required fields and initial status |
| Status update API | High | Validate allowed and forbidden transitions |
| Repository persistence | High | Ensure correct data writes and reads |
| API error mapping | High | Verify consistent failure handling |
| Search and filter behavior | Medium | Ensure list queries work correctly |
| Frontend user flows | Medium | Ensure correct screens and feedback |
| Edge-case validation | Medium | Prevent regressions in invalid input handling |

## 11. Test execution expectations

- Fast feedback is important; unit and validation tests should run quickly.
- Repository and integration tests should be targeted and focused.
- API tests should verify contract and error semantics, not just success flows.
- State-machine tests should be treated as critical regression tests.
- The initial state OPEN should be explicitly asserted in create and persistence tests.

## 12. Success criteria

The testing strategy is successful when:

- all required ticket operations work as expected
- all allowed transitions pass validation
- all disallowed transitions are rejected by the backend
- initial status is OPEN for every newly created ticket
- validation errors are consistent and meaningful
- persistence behavior is reliable and database-backed
- the UI reflects the real API behavior consistently

## 13. Scope note

This test strategy is intentionally practical and project-appropriate for a small Support Ticket Management System. It emphasizes the most important business risks: validation, lifecycle enforcement, and persistence correctness, while keeping the suite lean and maintainable.
