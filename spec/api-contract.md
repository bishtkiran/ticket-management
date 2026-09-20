# API Contract Specification

## 1. General API conventions

- The API is REST-based and resource-oriented.
- All endpoints use JSON for request and response bodies.
- Request and response payloads must be consistent and predictable across controllers.
- Client and server validation are both required: the frontend may provide convenience validation, but the backend is authoritative.
- Validation failures and business-rule violations must return structured error responses.
- The API must not expose internal implementation details, persistence structures, or raw database errors.
- The API should remain simple and easy to consume, with a clear contract for resource creation, retrieval, update, filtering, and status changes.

## 2. Common response shapes

### 2.1 Success response

A successful action should return:

- HTTP status appropriate to the operation
- JSON payload representing the created or updated resource, or a minimal success payload when no content is returned

### 2.2 Error response

A failing request should return a consistent JSON error payload, for example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ticket title is required.",
    "details": [
      {
        "field": "title",
        "message": "must not be blank"
      }
    ]
  }
}
```

The `error` object must contain:
- `code`: machine-readable error code.
- `message`: human-readable error message.
- `details`: optional list of additional error details.

Each item in `details` must contain:
- `field`: the affected request field, when applicable.
- `message`: human-readable explanation of the validation or business error.

The API must not return stack traces, database exception details, internal class names, or other implementation-specific information.

## 3. Ticket resource

### 3.1 Ticket object shape

A ticket resource should include the following fields:

- `id`: unique ticket identifier
- `title`: ticket title
- `description`: ticket description
- `status`: current ticket status
- `priority`: ticket priority
- `assignee`: assignee identifier or name, when set
- `createdAt`: timestamp when the ticket was created
- `updatedAt`: timestamp when the ticket was last updated
- `closedAt`: timestamp when closed, if applicable
- `cancelledAt`: timestamp when cancelled, if applicable

The exact naming convention should remain consistent across the API. The project should prefer a clear JSON property naming convention without exposing internal database column names.

## 4. Endpoint: Create ticket

### 4.1 HTTP method and URL

- Method: `POST`
- URL: `/api/tickets`

### 4.2 Request body

```json
{
  "title": "Login error after password reset",
  "description": "Users cannot log in after resetting credentials.",
  "priority": "HIGH",
  "assignee": "alice@example.com"
}
```

### 4.3 Request validation

- `title` is required and must not be blank.
- `description` is required and must not be blank.
- `priority` is required and must be a valid supported priority.
- `assignee` may be optional depending on the chosen workflow.
- The backend assigns the initial status as `OPEN` automatically.

### 4.4 Response

- `201 Created`
- Response body contains the created ticket resource.

### 4.5 Validation errors

- `400 Bad Request` for malformed or missing required fields

### 4.6 Not-found behaviour

- Not applicable for creation.

### 4.7 Business-rule errors

- Invalid priority value
- Empty required fields
- A request that violates ticket creation rules

### 4.8 HTTP status codes

- `201 Created` on success
- `400 Bad Request` on invalid structure or missing required fields
- `422 Unprocessable Entity` for business validation violations if used by the application

## 5. Endpoint: List tickets

### 5.1 HTTP method and URL

- Method: `GET`
- URL: `/api/tickets`

### 5.2 Query parameters

- `keyword` (optional): search term for matching ticket title or description
- `status` (optional): filter by ticket status
- `page` (optional): page number when pagination is implemented
- `size` (optional): page size when pagination is implemented

### 5.3 Request body

- No request body.

### 5.4 Response

A list response should return the collection of tickets and, if applicable, pagination metadata.

Example shape:

```json
{
  "items": [
    {
      "id": 1,
      "title": "Login error after password reset",
      "description": "Users cannot log in after resetting credentials.",
      "status": "OPEN",
      "priority": "HIGH",
      "assignee": "alice@example.com",
      "createdAt": "2026-09-20T12:00:00Z",
      "updatedAt": "2026-09-20T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1
}
```

### 5.5 Validation errors

- `400 Bad Request` for invalid query parameter values
- `422 Unprocessable Entity` when a filter is unsupported or invalid

### 5.6 Not-found behaviour

- Not applicable; an empty list is valid when no tickets match the query.

### 5.7 Business-rule errors

- Invalid sort field
- Invalid status filter value
- Invalid pagination input

### 5.8 HTTP status codes

- `200 OK` on success
- `400 Bad Request` on invalid request parameters

## 6. Endpoint: View ticket details

### 6.1 HTTP method and URL

- Method: `GET`
- URL: `/api/tickets/{id}`

### 6.2 Path parameters

- `id`: ticket identifier

### 6.3 Request body

- No request body.

### 6.4 Response

- `200 OK`
- Response body contains the full ticket resource with all supported fields.

### 6.5 Validation errors

- `400 Bad Request` for malformed identifier values

### 6.6 Not-found behaviour

- `404 Not Found` when the ticket does not exist.

### 6.7 Business-rule errors

- None beyond invalid resource identity or access restrictions if applicable.

### 6.8 HTTP status codes

- `200 OK` on success
- `400 Bad Request` for invalid path data
- `404 Not Found` when the ticket does not exist

## 7. Endpoint: Update ticket fields

### 7.1 HTTP method and URL

- Method: `PATCH`
- URL: `/api/tickets/{id}`

### 7.2 Path parameters

- `id`: ticket identifier

### 7.3 Request body

```json
{
  "title": "Updated login error after password reset",
  "description": "The problem affects users who reset their password using the new flow.",
  "priority": "MEDIUM",
  "assignee": "bob@example.com"
}
```

### 7.4 Request validation

- `id` must exist.
- At least one updatable field must be provided.
- Fields, if provided, must be valid and non-empty when required.
- `priority` must be a valid supported priority.
- `assignee` may be empty or null if unassigned.

### 7.5 Response

- `200 OK`
- Response body contains the updated ticket resource.

### 7.6 Validation errors

- `400 Bad Request` for malformed payload or invalid field values
- `422 Unprocessable Entity` if field constraints are violated

### 7.7 Not-found behaviour

- `404 Not Found` when the ticket does not exist.

### 7.8 Business-rule errors

- Attempt to update a field that is not allowed by the current workflow
- Invalid assignee value or invalid priority value

### 7.9 HTTP status codes

- `200 OK` on success
- `400 Bad Request` for invalid request data
- `404 Not Found` when the ticket does not exist
- `422 Unprocessable Entity` for invalid business-level field values if used

## 8. Endpoint: Change ticket status

### 8.1 HTTP method and URL

- Method: `PATCH`
- URL: `/api/tickets/{id}/status`

### 8.2 Path parameters

- `id`: ticket identifier

### 8.3 Request body

```json
{
  "status": "IN_PROGRESS"
}
```

### 8.4 Request validation

- `status` is required.
- `status` must be one of the valid states: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`.
- The backend must validate the requested transition against the defined state machine.

### 8.5 Valid transitions

- `OPEN -> IN_PROGRESS`
- `IN_PROGRESS -> RESOLVED`
- `RESOLVED -> CLOSED`
- `OPEN -> CANCELLED`
- `IN_PROGRESS -> CANCELLED`

### 8.6 Invalid transition examples

- `CLOSED -> OPEN`
- `RESOLVED -> OPEN`
- `CANCELLED -> OPEN`
- `OPEN -> RESOLVED`
- `OPEN -> CLOSED`
- `IN_PROGRESS -> OPEN`
- `IN_PROGRESS -> CLOSED`

### 8.7 Response

- `200 OK`
- Response body contains the updated ticket resource with the new status.

### 8.8 Validation errors

- `400 Bad Request` for missing or malformed `status` value

### 8.9 Not-found behaviour

- `404 Not Found` when the ticket does not exist.

### 8.10 Business-rule errors

- Invalid transition according to the state machine
- Attempt to move a ticket into a terminal state from an invalid source
- Attempt to move a ticket in a terminal state back to a prior state

### 8.11 HTTP status codes

- `200 OK` on success
- `400 Bad Request` for invalid payload or missing `status`
- `404 Not Found` when the ticket does not exist
- `409 Conflict` for invalid state transitions

## 9. Endpoint: Add comment

### 9.1 HTTP method and URL

- Method: `POST`
- URL: `/api/tickets/{id}/comments`

### 9.2 Path parameters

- `id`: ticket identifier

### 9.3 Request body

```json
{
  "content": "I have started investigating the login issue."
}
```

### 9.4 Request validation

- `content` is required and must not be blank.
- `id` must reference an existing ticket.

### 9.5 Response

- `201 Created`
- Response body contains the created comment object.

### 9.6 Validation errors

- `400 Bad Request` for missing or empty `content`
- `400 Bad Request` for malformed request data

### 9.7 Not-found behaviour

- `404 Not Found` when the ticket does not exist.

### 9.8 Business-rule errors

- Attempt to add a comment to a non-existent ticket
- Empty or invalid comment content

### 9.9 HTTP status codes

- `201 Created` on success
- `400 Bad Request` on invalid input
- `404 Not Found` when the ticket does not exist

## 10. Endpoint: Search tickets

### 10.1 HTTP method and URL

- Method: `GET`
- URL: `/api/tickets?keyword=`

### 10.2 Query parameters

- `keyword` (required): search term to find matching tickets
- `page` (optional): page number
- `size` (optional): page size

### 10.3 Request body

- No request body.

### 10.4 Response

- `200 OK`
- Response body contains a matching list of tickets.

### 10.5 Validation errors

- `400 Bad Request` when the keyword is missing or invalid
- `400 Bad Request` for malformed pagination or sort parameters

### 10.6 Not-found behaviour

- An empty list is valid when no tickets match the search criteria.

### 10.7 Business-rule errors

- Invalid keyword value if the application treats empty search terms as invalid
- Invalid pagination parameters

### 10.8 HTTP status codes

- `200 OK` on success
- `400 Bad Request` for invalid query parameters

## 11. Endpoint: Filter tickets by status

### 11.1 HTTP method and URL

- Method: `GET`
- URL: `/api/tickets`

### 11.2 Query parameters

- `status` (optional): one of the valid ticket states

### 11.3 Request body

- No request body.

### 11.4 Response

- `200 OK`
- Response body contains the tickets matching the status filter.

### 11.5 Validation errors

- `400 Bad Request` when `status` is not one of the valid values

### 11.6 Not-found behaviour

- Empty list if no tickets match the selected status.

### 11.7 Business-rule errors

- Invalid status filter value

### 11.8 HTTP status codes

- `200 OK` on success
- `400 Bad Request` on invalid status filter value

## 12. Error-handling summary

- The API must return consistent and predictable error responses.
- Validation failures should return clear field-level information when possible.
- Business-rule violation errors must be explicit, especially for invalid ticket state transitions.
- Not-found conditions must return `404 Not Found`.
- Invalid lifecycle transitions should return `409 Conflict` consistent with the state machine requirements.
- Internal failures should be mapped to safe server errors without exposing system details.

## 13. Status-code summary

Recommended standard mapping:

- `200 OK`: successful retrieval or update
- `201 Created`: successful creation
- `204 No Content`: successful action without a response body, if used
- `400 Bad Request`: malformed or invalid request payload or query parameters
- `404 Not Found`: requested resource does not exist
- `409 Conflict`: invalid business-state transition or conflicting state
- `422 Unprocessable Entity`: business validation failure when the API chooses to distinguish it from `400`
- `500 Internal Server Error`: unexpected server-side failure

## 14. API boundary notes

- Controllers should handle HTTP concerns only.
- Business logic and workflow validation belong in the service/application layer.
- Persistence and repository details must not leak into the API contract.
- The API should be simple, stable, and consistent across endpoints.
- The API contract should remain documentation-friendly and easy for the frontend to consume.

## 15. Scope note

This document defines the REST API contract for the ticket management system and establishes the expected behavior for creation, retrieval, modification, comment creation, filtering, and state transitions. It is a specification only and does not prescribe implementation code or concrete framework classes.
