# Data Model Specification

## 1. Overview

This document defines the persisted data model for the Support Ticket Management System. The model is intentionally small and pragmatic, designed to support ticket creation, listing, detail retrieval, status updates, search, filtering, comments, and persistence in a relational database.

The data model covers the core business entities:

- Ticket
- Comment

The design keeps the persistence model aligned with the application’s domain while remaining simple enough for a small application.

## 2. Core design principles

- Use a relational model with clear foreign-key relationships.
- Keep each ticket as a primary record with associated comments as child records.
- Preserve lifecycle and business-state information in the ticket record.
- Enforce required data and referential integrity in the database.
- Keep identifiers stable and predictable for API usage and persistence.
- Prefer simple, explicit fields over highly abstract or generic models.

## 3. Ticket entity

### 3.1 Purpose

The Ticket entity represents a support request or issue record. It stores the core information required to manage and track the lifecycle of a ticket.

### 3.2 Fields

| Field name | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | BIGINT | Primary key, not null, unique | Stable identifier for the ticket |
| title | VARCHAR(255) | Not null, not blank | A short summary of the issue |
| description | TEXT | Not null, not blank | Full issue description |
| status | VARCHAR(32) | Not null | Valid values include OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED |
| priority | VARCHAR(32) | Not null | Valid values include CRITICAL, HIGH , MEDIUM and LOW|
| assignee | VARCHAR(255) | Nullable | Optional assignee identifier or descriptive assignee name |
| created_at | TIMESTAMP | Not null | Creation timestamp |
| updated_at | TIMESTAMP | Not null | Last modification timestamp |
| closed_at | TIMESTAMP | Nullable | Set only when the ticket reaches a terminal state such as CLOSED |
| cancelled_at | TIMESTAMP | Nullable | Set only when the ticket is cancelled |

### 3.3 Constraints

- `id` must be unique and not null.
- `title` must not be null and must contain meaningful non-whitespace content.
- `description` must not be null and must contain meaningful non-whitespace content.
- `status` must be one of the supported lifecycle values.
- `priority` must be one of the supported priority values.
- `created_at` must be set on creation and must not be null.
- `updated_at` must be set on creation and updated on each modification.
- `closed_at` and `cancelled_at` must be null unless the ticket reaches the corresponding terminal state.
- A ticket must not have conflicting terminal time fields for incompatible states.

### 3.4 Status and lifecycle rules

The system must enforce the following valid lifecycle states:

- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED
- CANCELLED

Allowed transitions:

- OPEN -> IN_PROGRESS
- IN_PROGRESS -> RESOLVED
- RESOLVED -> CLOSED
- OPEN -> CANCELLED
- IN_PROGRESS -> CANCELLED

All other transitions are invalid and must be rejected by the backend.
- New tickets must start in `OPEN`.

### 3.5 Indexes

- Index on `status` to support filtering by ticket status.
- Index on `priority` if priority-based queries or reporting are expected.
- Index on `created_at` for listing and sorting by newest or oldest tickets.
- Index on `updated_at` for activity-based retrieval and sorting.
- Optional full-text or trigram index on `title` and `description` for keyword search, if the application needs more advanced text search.

### 3.6 Design decisions

- `status` is stored as a string or enum-backed value because the lifecycle is explicit and simple to validate.
- `assignee` is intentionally flexible in this specification to allow either a direct user identifier or a textual representation, depending on implementation choice.
- `created_at` and `updated_at` provide auditing and sorting support.
- `closed_at` and `cancelled_at` capture when a ticket reached a terminal state, which helps with reporting and state clarity.

## 4. Comment entity

### 4.1 Purpose

The Comment entity represents a user-supplied comment associated with a specific ticket. Comments add context, updates, and history to the ticket.

### 4.2 Fields

| Field name | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | BIGINT or UUID | Primary key, not null, unique | Stable identifier for the comment |
| ticket_id | BIGINT or UUID | Foreign key, not null | Reference to owning ticket |
| content | TEXT | Not null, not blank | Comment body |
| created_at | TIMESTAMP | Not null | Timestamp when the comment was created |
| created_by | VARCHAR(255) or BIGINT | Nullable | User or actor that created the comment |

### 4.3 Constraints

- `id` must be unique and not null.
- `ticket_id` must reference a valid ticket record.
- `content` must not be null and must contain meaningful non-whitespace text.
- `created_at` must be set on creation and must not be null.
- A comment must be attached to exactly one ticket.

### 4.4 Relationships

- A Ticket has many Comments.
- Each Comment belongs to exactly one Ticket.

### 4.5 Indexes

- Index on `ticket_id` to support retrieving comments for a specific ticket efficiently.
- Index on `created_at` to support chronological sorting of comments.

### 4.6 Design decisions

- Comments are treated as child records of the parent ticket.
- This keeps the model simple and allows efficient retrieval of ticket history.
- `created_by` is optional in this specification because the implementation may use a simplified user model or may omit user attribution if not required by the application.

## 5. Relationships

### 5.1 Ticket -> Comment

- One-to-many relationship.
- Each ticket can have zero or many comments.
- Each comment belongs to exactly one ticket.
- The relationship is enforced by a foreign key from `comment.ticket_id` to `ticket.id`.

### 5.2 Referential integrity

- Do not implement ticket deletion.

## 6. Database constraints

The following constraints should be enforced in the database where appropriate:

- Primary key uniqueness for `ticket.id` and `comment.id`
- Foreign key constraint from `comment.ticket_id` to `ticket.id`
- Not-null constraints for required fields
- Check constraints for valid ticket status values
- Check constraints for valid priority values
- Check constraints to ensure status values are recognized and consistent
- Check constraints to prevent empty strings or whitespace-only values for required text fields
- Database constraints may restrict status to:
  OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED.
- Backend/domain/service logic must enforce allowed transitions.
- Integration tests must verify invalid transitions are rejected and not persisted.

### 6.1 Example status check concept

The database should allow only the defined statuses:

- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED
- CANCELLED

This reduces the chance of invalid persisted state and keeps the business lifecycle explicit.

## 7. Important design decisions

### 7.1 Simple relational structure

The model uses a straightforward relational design instead of a more abstract or highly normalized schema because the application is small and the business domain is simple.

### 7.2 Lifecycle captured on the ticket

Ticket status is stored directly on the ticket record because status is central to listing, filtering, and workflow behavior. This keeps queries straightforward and makes lifecycle checks easy to enforce.

### 7.3 Comments as child records

Comments are stored separately from the ticket so the system can support multiple comments per ticket without bloating the main ticket record.

### 7.4 Data integrity over convenience

Database constraints are used to protect required values and relationship integrity. This ensures that invalid or inconsistent data is not allowed to persist.

### 7.5 Search and filtering support

The model includes indexes that support likely access patterns such as list operations, status filtering, and keyword search. This keeps the application responsive without overcomplicating the schema.

## 8. Summary

The data model for the Support Ticket Management System is intentionally small and efficient:

- Ticket stores the core lifecycle, metadata, and ownership information.
- Comment stores ticket history and discussion.
- Relationships are explicit and enforced.
- Constraints protect required data, domain validity, and referential integrity.
- Indexes support common listing, searching, and filtering use cases.

This model is appropriate for a small application while still providing a solid foundation for backend validation, persistence, and reporting.
