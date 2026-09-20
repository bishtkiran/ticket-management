# ticket-management
A support ticket Management System.

Build a Support Ticket Management System with the following features:
Create a ticket.
List tickets.
View ticket details.
Update title, description, priority and assignee.
Add comments.
Search tickets by keyword.
Filter tickets by status.
Persist data in a database.
Validate input at the backend.
Display meaningful errors in the UI.
 
The following state machine must be enforced by the backend:
OPEN → IN_PROGRESS → RESOLVED → CLOSED

OPEN → CANCELLED
IN_PROGRESS → CANCELLED
Invalid transitions must be rejected.
Example:
CLOSED → OPEN       ❌
RESOLVED → OPEN     ❌
CANCELLED → OPEN    ❌

