# UI Flow Specification

## 1. Overview

This document defines the user interface flow for the Support Ticket Management System. The interface is designed for a simple, clear support workflow with ticket creation, listing, viewing, updating, status changes, comments, search, and status-based filtering.

The UI should remain straightforward and user-friendly, with clear feedback for loading, empty states, validation, and API failure scenarios.

## 2. Screen: Ticket List

### 2.1 Purpose

The Ticket List screen is the primary landing view for users. It shows all tickets and enables users to search, filter, create a new ticket, and open a ticket for more detail.

### 2.2 Layout

- Header or page title: "Tickets"
- Search input for keyword search
- Status filter dropdown or segmented control
- Create Ticket button
- Ticket table or list view with summary rows

### 2.3 Ticket list item content

Each ticket row should display:

- ticket identifier
- title
- current status
- priority
- assignee, if available
- last updated time or creation time

### 2.4 User actions

- Search by keyword
- Filter by status
- Open a ticket to view details
- Create a new ticket

### 2.5 Pagination

- If the ticket list API uses pagination, the UI should provide controls to navigate between result pages.
- The UI should display the current page and available navigation options.
- The UI should preserve the active search and status filter when changing pages.
- Pagination controls should be disabled while the corresponding request is loading.
### 2.6 Loading state

- Show a spinner, skeleton rows, or loading text while tickets are being fetched.
- Disable related controls while the list is loading if needed.

### 2.7 Empty state

- If no tickets exist, show a friendly empty state such as:
  - "No tickets found"
  - "Create a new ticket to get started"
- If a search or filter returns no results, show a related empty state such as:
  - "No tickets match your search"
  - "No tickets found for the selected status"

### 2.8 Validation and API errors

- If the search request fails, show a non-blocking error message.
- If the ticket list request fails, show a clear error banner or inline message.
- Do not display technical backend details to the end user.

## 3. Flow: Create Ticket

### 3.1 Trigger

Triggered from the Ticket List screen via the "Create Ticket" button.

### 3.2 Form fields

- Title
- Description
- Priority
- Assignee (optional depending on workflow design)

### 3.3 Validation

- Title is required.
- Description is required.
- Priority must be a valid supported value.
- Assignee, if included, must be valid when provided.

### 3.4 Error handling

- Display inline validation errors next to invalid fields.
- Show a top-level form error if the backend rejects the create request.
- Do not leave the user guessing; show a clear message such as "Unable to create ticket. Please check the details and try again."

### 3.5 Success behaviour

- On successful creation, the user is returned to the Ticket List screen.
- The UI must refresh or re-fetch the ticket list after successful creation.
- The newly created ticket should be available in the refreshed list.
- The created ticket must have an initial status of `OPEN`.

### 3.6 Loading state

- Disable the submit button while creation is in progress.
- Show a loading state such as "Creating ticket...".

## 4. Screen: Ticket Details

### 4.1 Purpose

The Ticket Details screen shows the complete information for a selected ticket and provides actions to update the ticket, change status, and add comments.

### 4.2 Content

- Ticket title
- Ticket description
- Current status
- Priority
- Assignee
- Creation timestamp
- Updated timestamp
- Comments list

### 4.3 User actions

- Edit Ticket
- Change Status
- Add Comment
- Return to the Ticket List

### 4.4 Loading state

- Display a spinner or loading placeholder while the ticket detail is being fetched.
- If the ticket cannot be loaded, show a clear error state.

### 4.5 Error state

- If the selected ticket is not found, show a not-found state with a message such as "Ticket not found" and a way to return to the list.
- If the fetch fails, show a meaningful error message and a retry option when appropriate.

## 5. Flow: Edit Ticket

### 5.1 Trigger

Triggered from the Ticket Details screen through an "Edit Ticket" action.

### 5.2 Form fields

- Title
- Description
- Priority
- Assignee

The UI must respect the ticket's current lifecycle state when determining whether ticket fields can be edited.

Unless the business rules explicitly allow editing terminal tickets, tickets in `CLOSED` or `CANCELLED` state should be treated as read-only.

### 5.3 Validation

- Title must not be blank.
- Description must not be blank.
- Priority must be valid.
- Assignee must be valid when provided.

### 5.4 Loading state

- Show a loading indicator while the update request is in progress.
- Disable form submission while saving.

### 5.5 Validation errors

- Show inline errors next to invalid form fields.
- Show a general form-level error if the backend rejects the update.

### 5.6 API errors

- Show a clear error alert if the update request fails.
- Preserve the form values if possible so the user can correct them.

### 5.7 Success behaviour

- Save the updated values.
- Return to the Ticket Details screen with the updated data.

## 6. Flow: Change Status

### 6.1 Trigger

Triggered from the Ticket Details screen through a status action or status selector.

### 6.2 Status model

Valid states:

- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED
- CANCELLED

### 6.3 Allowed transitions

- OPEN -> IN_PROGRESS
- IN_PROGRESS -> RESOLVED
- RESOLVED -> CLOSED
- OPEN -> CANCELLED
- IN_PROGRESS -> CANCELLED

### 6.4 Status transition actions

- The UI should display only the status actions that are valid for the ticket's current state.
- The UI may prevent users from selecting invalid transitions.
- The backend remains the authoritative source for transition validation.
- The UI must handle a `409 Conflict` response if the backend rejects a transition.

Valid actions:

- `OPEN` -> `IN_PROGRESS`
- `OPEN` -> `CANCELLED`
- `IN_PROGRESS` -> `RESOLVED`
- `IN_PROGRESS` -> `CANCELLED`
- `RESOLVED` -> `CLOSED`

No status-change action should be offered for `CLOSED` or `CANCELLED`.

### 6.5 Confirmation for terminal transitions

- The UI should request confirmation before performing a transition that moves the ticket into a terminal state.
- Confirmation should be required for:
  - `OPEN -> CANCELLED`
  - `IN_PROGRESS -> CANCELLED`
  - `RESOLVED -> CLOSED`
- The confirmation message should clearly identify that the action changes the ticket to a terminal state.
- Cancelling the confirmation must leave the ticket unchanged.
- The backend must still validate the transition after confirmation.

### 6.6 Status display

- Display the current ticket status clearly and consistently.
- Use a badge, pill, or label with distinct colors or styling for each status.
- Show status in a way that helps users quickly understand the ticket lifecycle.

### 6.7 Validation and API errors

- If the user attempts an invalid transition, show a clear message such as:
  - "This status change is not allowed for the current ticket state."
- If the backend rejects the status update, surface an API error message without exposing internal details.

### 6.8 Loading state

- Show a loading indicator or disabled state during status submission.

### 6.9 Terminal-state behaviour

- `CLOSED` and `CANCELLED` are terminal states.
- A ticket in `CLOSED` state must not provide an action to reopen or change its status.
- A ticket in `CANCELLED` state must not provide an action to reopen or change its status.
- The UI may present terminal tickets as read-only with respect to status changes.
- The backend remains authoritative and must reject invalid transitions even if the UI does not expose those actions.

## 7. Flow: Add Comment

### 7.1 Trigger

Triggered from the Ticket Details screen through an "Add Comment" action or comment form.

### 7.2 Form fields

- Comment text

### 7.3 Validation

- Comment content is required.
- Comment content must not be empty or whitespace-only.
- The ticket must exist.
- Whether comments are allowed on `CLOSED` or `CANCELLED` tickets must follow the application's business rule.
- If comments are not allowed on terminal tickets, the UI must disable the comment form for `CLOSED` and `CANCELLED` tickets.
- The backend must remain authoritative for this rule.

### 7.4 Loading state

- Disable the submit action while the comment is being posted.
- Show a loading indicator such as "Adding comment..."

### 7.5 Validation errors

- Show inline validation for an empty or invalid comment.

### 7.6 API errors

- Show a generic error such as "Unable to add comment. Please try again."
- Keep the form present so the user can correct the input.

### 7.7 Success behaviour

- Append the new comment to the comments list.
- Preserve ticket detail view context after success.

## 8. Search

### 8.1 Purpose

Search allows users to find tickets by keyword.

### 8.2 Controls

- Search input in the Ticket List header
- Search trigger by button or on input depending on UX design

### 8.3 Behaviour

- Search matches ticket title and description according to the backend API contract.
- When the search field contains a valid keyword, the UI calls the search API.
- When the search field is blank, the UI uses the normal ticket-list API without a keyword.
- The UI must not send an empty keyword to an endpoint that requires a non-empty keyword.
- If the backend returns no matches, show an appropriate empty state.

### 8.4 Validation and errors

- Empty search values should be treated as a normal list request or ignored gracefully.
- Display a clear error message if the search request fails.

## 9. Status filtering

### 9.1 Purpose

Users can filter tickets by current status.

### 9.2 Controls

- Status dropdown or filter buttons for each valid status.

### 9.3 Supported values

Ticket status values:

- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`
- `CANCELLED`

The UI should also provide an `All statuses` option.

`All statuses` means that no `status` query parameter is sent to the backend.

### 9.4 Behaviour

- Filtering should display only tickets matching the selected status.
- If no tickets match, show a filtered empty state.

### 9.5 Validation and errors

- If the filter value is invalid, show a clear error and reset to the default state if appropriate.
- If the backend returns an error, show a non-blocking message.

## 10. Status display conventions

The UI should present statuses in a consistent and clear manner.

- OPEN: neutral or open state styling
- IN_PROGRESS: active/in-progress styling
- RESOLVED: successful or complete styling
- CLOSED: final or closed styling
- CANCELLED: cancelled/secondary styling

Use a consistent badge, label, or color scheme throughout the app.

## 11. Validation error patterns

Validation errors should be shown in a consistent way across screens:

- Inline text under the relevant field
- Form-level summary for multiple errors
- Clear and actionable wording

Examples:

- "Title is required."
- "Description cannot be blank."
- "Please select a valid status."
- "This status change is not allowed for the current ticket state."

## 12. API error patterns

API failures should be presented in a user-friendly way:

- For network or server errors: show a generic alert such as "Unable to load tickets. Please try again."
- For not-found errors: show a not-found state for the ticket or redirect to the list if appropriate.
- For invalid state transitions: show a business-rule message that explains the user cannot make that status change.

## 13. API error mapping

The UI should map API responses to user-friendly messages without exposing internal implementation details.

| HTTP status | UI behaviour |
| --- | --- |
| `400 Bad Request` | Display validation or invalid-request feedback |
| `404 Not Found` | Display a not-found state for the requested ticket |
| `409 Conflict` | Display the business-rule error, especially for invalid status transitions |
| `422 Unprocessable Entity` | Display business validation feedback when used by the API |
| `500 Internal Server Error` | Display a generic server-error message |
| Network failure | Display a retryable connection/error message |

Field-level validation errors should be displayed next to the relevant fields when the API provides field information.

## 14. Accessibility and clarity

- Ensure all actions and error messages are readable and accessible.
- Use labels, visible focus states, and clear call-to-action wording.
- Keep the UI simple and consistent across screens.

## 15. Scope note

This document defines the user flows and interface behavior for the Support Ticket Management System. It specifies the primary screens, states, validation expectations, feedback patterns, and status-management behavior, without prescribing implementation code.
