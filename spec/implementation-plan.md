# Implementation Plan

## 1. Project setup

### PS-001: Initialize backend and frontend project structure
- Objective: Create the base project skeleton for the Java 21 Spring Boot backend and the React/Next.js frontend, with a simple workspace layout that supports the required backend/frontend split.
- Relevant specs: requirements FR-001 to FR-016, architecture §2, §3, §4, §11; API contract §1.
- Acceptance criteria:
  - Backend and frontend folders are created in a clear, standard structure.
  - Project metadata and configuration files are present for Java 21 Spring Boot and React/Next.js.
  - The workspace separates backend, frontend, and shared specification folders.
  - No application logic is implemented yet.

### PS-002: Configure environment and database setup
- Objective: Define base configuration for PostgreSQL in production and H2 for lightweight local/test usage, along with environment-variable handling for secrets and local settings.
- Relevant specs: requirements NFR-001, NFR-003, NFR-007; architecture §5, §11; data-model §1-8.
- Acceptance criteria:
  - Separate configuration entries exist for local, test, and production settings.
  - PostgreSQL is identified as the production database.
  - H2 is available for lightweight local/test usage as appropriate.
  - Secrets are not hard-coded into source-controlled configuration files.

## 2. Backend domain

### BD-001: Define domain concepts and ticket metadata model
- Objective: Establish the core ticket concepts that match the approved specification: ticket identity, title, description, priority, status, assignee, and timestamps.
Relevant specs: requirements FR-001, FR-004 to FR-007, FR-011, BR-001, BR-002, BR-003; data-model §3; architecture §3.1, §3.3.
- Acceptance criteria:
  - The core ticket concept is documented and aligned with the approved data model.
  - Required ticket fields and lifecycle metadata are clearly defined.
  - The domain model does not expose persistence implementation details.

### BD-002: Define comment domain model and ownership
- Objective: Define the comment concept and its relationship to a ticket.
- Relevant specs: requirements FR-008, BR-004; data-model §4, §5; API contract §9.
- Acceptance criteria:
  - Comment ownership is defined as a child record of a ticket.
  - Required fields and constraints are identified.
  - The comment model is consistent with the API contract and persistence model.

## 3. Database

### DB-001: Define PostgreSQL schema for tickets and comments
- Objective: Define the persisted structure for tickets and comments, including required fields, status values, timestamps, and foreign-key relationships.
- Relevant specs: requirements FR-011, BR-001 to BR-004, BR-008, NFR-003; data-model §3-7.
- Acceptance criteria:
  - Ticket table includes required fields and constraints.
  - Comment table includes required fields and constraints.
  - Ticket-to-comment relationship is represented by a foreign key.
  - Terminal timestamps and status storage are included as specified.

### DB-002: Add indexing and integrity rules
- Objective: Ensure database-level integrity and efficient retrieval for common queries such as listing, filtering by status, and comment lookup.
- Relevant specs: data-model §3.5, §4.5, §6, §7.5; requirements FR-002, FR-010, FR-011, NFR-004.
- Acceptance criteria:
  - Indexes exist for status, created/update timestamps, and ticket-comment lookup.
  - Database constraints enforce not-null, uniqueness, and check rules.
  - The data model remains simple and consistent with the project scope.

## 4. REST API

### RA-001: Implement ticket create, list, and detail APIs
- Objective: Finalize the HTTP contract for creating tickets, listing tickets, and retrieving ticket details, including request and response bodies.
- Relevant specs: API contract §4, §5, §6; requirements FR-001 to FR-003, FR-011, FR-012.
- Acceptance criteria:
  - HTTP method, URL, request body, and response contract are clear for create/list/detail operations.
  - Validation and error cases are documented.
  - All responses are consistent with the standard API contract.

### RA-002: Implement ticket update and status-change API
- Objective: Define the update endpoint and state-change endpoint, including allowed transitions and expected status codes.
- Relevant specs: API contract §7, §8; requirements FR-004 to FR-007, FR-014 to FR-016, BR-009 to BR-013, ER-008, ER-009; state-machine §2-6.
- Acceptance criteria:
  - Update endpoint contract is documented for title, description, priority, and assignee.
  - Status endpoint contract is documented for valid lifecycle changes.
  - Invalid transitions are mapped to the specified conflict/error behavior.

### RA-003: Implement comment, search, and filter APIs
- Objective: Define endpoints for adding comments and for search/status-filter queries.
- Relevant specs: API contract §9-11; requirements FR-008 to FR-010, FR-012, VR-005, VR-006; UI-flow §8, §9.
- Acceptance criteria:
  - Add-comment endpoint contract is documented.
  - Search API contract is documented with keyword handling.
  - Filter-by-status contract is documented with supported statuses and validation rules.

## 5. Backend validation

### BV-001: Define input validation rules for ticket creation and updates
- Objective: Document and confirm the backend validation rules for required fields, priority, assignee, and request structure.
- Relevant specs: requirements VR-001 to VR-003, VR-007; API contract §4, §7; architecture §7.
- Acceptance criteria:
  - Required ticket fields are clearly defined.
  - Invalid priority and invalid assignee situations are defined.
  - Validation rules are separated from controller logic and assigned to backend validation boundaries.

### BV-002: Define validation rules for comments, search, and status filtering
- Objective: Confirm backend rules for comments, blank search terms, and supported status filters.
- Relevant specs: requirements VR-004 to VR-006, VR-008, VR-009; API contract §9-11; state-machine §3-6.
- Acceptance criteria:
  - Comment validation requirements are defined.
  - Dedicated keyword search requires a non-blank keyword.
  - The normal ticket listing may be requested without a keyword.
  - Blank search behavior is consistent with the UI and API contracts.
  - Supported status values are documented and invalid status values are rejected.

## 6. State machine

### SM-001: Document the ticket lifecycle and allowed transitions
- Objective: Confirm the complete lifecycle and the approved valid transitions used throughout the backend and UI.
-Relevant specs: requirements FR-014 to FR-016, BR-009 to BR-012, AC-010 to AC-012; state-machine §1-8.- 
-Acceptance criteria:
  - All states are defined: OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED.
  - Valid transitions are listed and explicit.
  - Terminal states and invalid reversions are documented.

### SM-002: Define backend state-machine enforcement contract
- Objective: Make the backend responsibility for state validation explicit and consistent between all status-changing endpoints.
- Relevant specs: requirements BR-011, BR-012, ER-008, ER-009; architecture §8; state-machine §5-6; API contract §8.
- Acceptance criteria:
  - Every status-changing API path uses the same backend state-machine validation logic.
  - Invalid transitions are rejected before persistence.
  - The frontend is not trusted to enforce lifecycle rules.

## 7. Backend tests

### BT-001: Create backend unit-test plan for validation and business rules
- Objective: Define focused unit tests for required validation, ticket fields, priority values, and default state behavior.
- Relevant specs: requirements VR-001 to VR-009, BR-001 to BR-012, test-strategy §3.1, §5.
- Acceptance criteria:
  - Unit tests cover required ticket field validation.
  - Unit tests cover invalid priority and invalid assignee conditions.
  - Unit tests assert that new tickets initialize to OPEN.

### BT-002: Create backend repository and API test plan for ticket persistence and HTTP behavior
- Objective: Define repository tests for persistence and API tests for contract correctness, including invalid transition rejection.
- Relevant specs: requirements FR-001 to FR-011, ER-001 to ER-009, AC-001 to AC-012; test-strategy §3.2, §3.3, §4, §5, §7, §8.
- Acceptance criteria:
  - Repository tests verify creation, retrieval, filtering, and comment persistence.
  - API tests verify status and validation behavior for valid and invalid requests.
  - Tests explicitly prove that invalid transitions are rejected by the backend without persisting changes.

## 8. Frontend setup

### FS-001: Set up frontend structure and app shell
- Objective: Create the Next.js/React app shell and the initial layout for the ticket application.
- Relevant specs: architecture §4, §11; requirements NFR-006, AC-009.
- Acceptance criteria:
  - App shell is created with a route structure sufficient for Ticket List and Ticket Details flows.
  - Frontend structure is consistent with the application’s small-scale architecture.
  - No business logic is embedded in the shell beyond basic UI orchestration.

### FS-002: Configure frontend API integration and shared state patterns
- Objective: Prepare the frontend for calling the backend API using a simple, maintainable pattern without introducing unnecessary abstraction.
- Relevant specs: architecture §4.1, §4.2, §6, §9.2; API contract §1-15.
- Acceptance criteria:
  - A simple API client or fetch layer is planned.
  - Shared state and request handling are limited to the UI layer.
  - The frontend remains aligned with backend contracts and does not duplicate business rules.

## 9. Ticket UI

### TU-001: Build Ticket List screen
- Objective: Create the main list screen containing search, status filtering, creation action, and ticket row summaries.
- Relevant specs: UI-flow §2; requirements FR-002, FR-009, FR-010, AC-002, AC-005, AC-006.
- Acceptance criteria:
  - Ticket rows show the required summary fields.
  - Search and status filter controls are present.
  - Empty state and loading state are designed.
  - User can navigate to create ticket or open a ticket detail.

### TU-002: Build create-ticket and detail views
- Objective: Implement the screen flow for creating a ticket and displaying ticket details.
- Relevant specs: UI-flow §3, §4; requirements FR-001, FR-003, FR-012, AC-001, AC-007; API contract §4, §6.
- Acceptance criteria:
  - Create form includes required fields and validation states.
  - Ticket detail view shows title, description, status, priority, assignee, and metadata.
  - Not-found and API error states are handled clearly.

### TU-003: Build edit ticket flow
- Objective: Implement the ability for a user to edit ticket fields from the ticket detail view.
- Relevant specs: UI-flow §5; requirements FR-004 to FR-007, AC-003.
- Acceptance criteria:
  - Editing form loads existing values.
  - Validation errors are shown inline.
  - Save action updates the ticket and returns to details view.
  - API failures are surfaced clearly to the user.

## 10. Comments UI

### CU-001: Build comment display and list behavior
- Objective: Render comments in the ticket detail flow and show the relevant comment history clearly.
- Relevant specs: UI-flow §4, §7; requirements FR-008, AC-004; API contract §9.
- Acceptance criteria:
  - Comments appear in chronological order.
  - Empty comment state is handled cleanly if no comments exist.
  - Comment history remains visible on the detail screen.

### CU-002: Build add-comment form and submission flow
- Objective: Implement the add-comment interaction and validation flow.
- Relevant specs: UI-flow §7; requirements FR-008, VR-004, ER-003; API contract §9.
- Acceptance criteria:
  - User can add a comment to an existing ticket.
  - Empty comment input is blocked with validation feedback.
  - API failure is handled gracefully without losing the existing form state.

## 11. Search/filter

### SF-001: Implement search and filter UI behavior
- Objective: Add the search box and status filter logic that matches the approved API contract and project requirements.
- Relevant specs: requirements FR-009, FR-010, VR-005, VR-006; UI-flow §8, §9; API contract §5, §10, §11.
- Acceptance criteria:
  - Search input calls the backend with a valid keyword.
  - Blank search is treated consistently.
  - Status filter only accepts supported values.
  - Empty result state is handled clearly.

### SF-002: Connect search/filter to backend queries
- Objective: Ensure the frontend requests the correct data for both keyword search and status filtering, with consistent server-side validation.
- Relevant specs: requirements FR-009, FR-010, BR-005, BR-006, NFR-004; API contract §5, §10, §11.
- Acceptance criteria:
  - Search and filter requests match the backend contract.
  - Query errors are surfaced properly.
  - Filtered lists reflect the backend’s actual result set.

## 12. Frontend error handling

### FE-001: Implement validation feedback for forms and filters
- Objective: Add clear user-facing validation for required fields, invalid status, and invalid search/filter input.
- Relevant specs: requirements NFR-002, VR-001 to VR-006, ER-005; UI-flow §3.4, §5.3, §6.6, §8.4, §9.5; API contract §2.2, §8.8, §10.5, §11.5.
- Acceptance criteria:
  - Validation messages appear inline or in a clear user-visible format.
  - Invalid input does not silently continue to a failed API request.
  - The UX remains consistent for create/edit/comment/status flows.

### FE-002: Implement error handling for API and not-found states
- Objective: Ensure frontend error states are consistent and understandable for failed loads, unavailable tickets, and server-side errors.
- Relevant specs: requirements ER-001, ER-005, ER-008; UI-flow §4.5, §5.6, §6.6, §7.6, §12; architecture §9.2.
- Acceptance criteria:
  - Not-found ticket flow displays a clear message.
  - API request failure states are shown to the user.
  - Users can recover without refreshing the app.

## 13. Integration testing

### IT-001: Verify the supported ticket lifecycle end to end
- Objective: Validate the happy-path lifecycle through the system: create, update, change status, and review ticket details.
- Relevant specs: requirements AC-001, AC-003, AC-004, AC-010, AC-011; state-machine §2-7; test-strategy §3.4, §4, §8.
- Acceptance criteria:
  - Ticket creation works end to end.
  - Lifecycle transitions from OPEN to IN_PROGRESS to RESOLVED to CLOSED are valid.
  - OPEN to CANCELLED and IN_PROGRESS to CANCELLED are valid.
  - The app reflects the new state in the UI and API responses.

### IT-002: Verify invalid transitions are rejected by the backend
- Objective: Prove that invalid ticket transitions are rejected by the backend and do not persist changes.
- Relevant specs: requirements FR-015, FR-016, BR-011, BR-012, VR-008, VR-009, ER-008, ER-009, AC-012; state-machine §3-6; test-strategy §4.2, §4.3, §4.4.
- Acceptance criteria:
  - Every prohibited transition is rejected by the backend.
  - Invalid transitions return the documented conflict status.
  - Ticket status remains unchanged after failed transition attempts.
  - The frontend displays a user-friendly business-rule error without bypassing backend validation.

## 14. Documentation

### DOC-001: Update project documentation with setup and workflow guidance
- Objective: Ensure the project documentation reflects the approved requirements, architecture, API contract, state machine, and operational setup.
- Relevant specs: requirements NFR-005, NFR-006; architecture §11; API contract §14; state-machine §8; test-strategy §12.
- Acceptance criteria:
  - README or setup docs explain the local environment and database choices.
  - The ticket lifecycle and API conventions are described.
  - A developer can understand how to run the project and test key flows.

### DOC-002: Finalize specification review and handoff checklist
- Objective: Confirm that the spec set is internally consistent and ready for implementation review.
- Relevant specs: all approved spec documents under spec/.
- Acceptance criteria:
  - Architecture, requirements, API contract, data model, UI flow, state machine, and test strategy agree on the service lifecycle.
  - No conflicting requirements remain for ticket status rules or backend enforcement.
  - The work is ready for implementation handoff without requiring additional design interpretation.

## 15. Suggested execution order

1. Project setup
2. Backend domain
3. Database
4. REST API
5. Backend validation
6. State machine
7. Backend tests
8. Frontend setup
9. Ticket UI
10. Comments UI
11. Search/filter
12. Frontend error handling
13. Integration testing
14. Documentation

This ordering keeps the most critical backend rules—especially the state machine and validation—earlier in the process while leaving UI and documentation work after the API contract is stable.

## 16. UI Design

Redesign the existing Ticket Management / Support Desk ticket-detail page into a polished, modern SaaS support application.

IMPORTANT:
- Do NOT use a left sidebar.
- Do NOT use green as the primary color.
- Do NOT change backend functionality, APIs, routes, database logic, or existing business logic.
- Only redesign the frontend UI/UX.
- Keep all existing functionality working.
- Do not create a generic admin dashboard.
- The result should look like a premium production-ready customer support application.

==================================================
DESIGN DIRECTION
==================================================

Create a clean, modern, professional support-ticket interface inspired by products like Linear, Intercom, Zendesk, and modern SaaS applications.

Visual characteristics:

- Minimal
- Premium
- Clean
- Spacious but not wasteful
- Excellent typography
- Strong visual hierarchy
- Soft borders
- Subtle shadows
- Rounded corners
- Modern icons
- Compact information density
- Professional enterprise SaaS appearance

Use a LIGHT theme.

Do NOT use:
- Green branding
- Huge typography
- Giant empty spaces
- Heavy gradients
- Excessive shadows
- Thick borders
- Oversized cards
- Old-fashioned dashboard styling
- Serif fonts

==================================================
COLOR SYSTEM
==================================================

Use BLUE / INDIGO as the primary accent.

Suggested palette:

Background:
#F6F8FC

Main surface:
#FFFFFF

Primary:
#4057D6

Primary hover:
#3348B8

Primary light:
#EEF1FF

Text:
#172033

Secondary text:
#667085

Muted text:
#98A2B3

Border:
#E6EAF0

Success:
#16A34A

Warning:
#F59E0B

Danger:
#EF4444

Info:
#3B82F6

Use colors mainly for:
- buttons
- status badges
- priority indicators
- active states
- small accents

Do not make the entire page blue.

==================================================
GLOBAL LAYOUT
==================================================

Do NOT create a sidebar.

Use a full-width application layout.

Structure:

--------------------------------------------------
TOP HEADER
--------------------------------------------------

--------------------------------------------------
BREADCRUMB
--------------------------------------------------

--------------------------------------------------
TICKET HEADER
--------------------------------------------------

--------------------------------------------------
MAIN CONTENT             RIGHT INFORMATION PANEL
                          

--------------------------------------------------
DESCRIPTION
--------------------------------------------------

--------------------------------------------------
STATUS ACTION
--------------------------------------------------

--------------------------------------------------
CONVERSATION
--------------------------------------------------

==================================================
TOP HEADER
==================================================

Create a clean horizontal header approximately 64px tall.

Left side:

Support Desk
small headset/support icon

Center:

Search input:

"Search tickets, users, or keywords..."

Include a keyboard shortcut indicator such as:

⌘ K

Right side:

Notification icon

User avatar

User name

Dropdown arrow

Example:

Support Desk                         Search...        🔔   KB  Kiran Bisht ▾

Header should have:
- white background
- subtle bottom border
- sticky positioning if appropriate
- no excessive height

==================================================
BREADCRUMB
==================================================

Below the header, create a compact breadcrumb:

Support Desk  /  Tickets  /  TICKET-1024

Use small muted typography.

Do not make breadcrumbs visually dominant.

==================================================
TICKET HEADER
==================================================

Create a strong but compact ticket header.

Small label:

TICKET-1024

Main title:

Issue with Attendance

Title should be approximately 30–34px.

Below the title:

[ Open ] [ High Priority ]

Use rounded status badges.

Open:
light blue background
blue text
small blue dot

High Priority:
light red/pink background
red text
small alert icon

Below badges:

Not able to mark my attendance on the portal

Use muted gray text.

On the right side of the header show ticket metadata:

Priority       High
Assignee       HR
Created        Sep 24, 2026, 7:18 PM
Last updated   Sep 24, 2026, 7:18 PM

Use small icons.

Keep metadata compact.

==================================================
MAIN CONTENT WIDTH
==================================================

Use a centered max-width container around:

1400px

with comfortable horizontal padding.

Use a two-column layout:

MAIN CONTENT:
approximately 70%

RIGHT PANEL:
approximately 30%

Gap:
24px

On smaller screens, collapse into one column.

==================================================
DESCRIPTION CARD
==================================================

Create a clean card.

Header:

Description

Use a small document icon.

Content:

Not able to mark my attendance on the portal

Card requirements:

- white background
- 1px subtle border
- 12–14px radius
- 20–24px padding
- subtle shadow
- no excessive height

==================================================
STATUS ACTION BAR
==================================================

Create a compact horizontal action card.

Left:

Change status

Dropdown:

[ 🔵 Open             ▼ ]

Right:

[ Update status ]

Primary button should use the blue/indigo accent.

Button should be approximately 40–44px tall.

Add:
- hover state
- disabled state
- loading state
- success feedback
- error feedback

Do not make the button huge.

==================================================
CONVERSATION
==================================================

Create a premium conversation section.

Header:

Conversation                         0 comments

Use a chat/message icon.

When there are no comments:

Center an elegant empty state.

Icon inside a soft circular background.

Text:

No comments yet

Secondary text:

Start the conversation by adding the first update to this ticket.

Keep the empty state compact.

Do NOT leave a giant empty white area.

==================================================
COMMENT COMPOSER
==================================================

At the bottom of the conversation card create a modern comment composer.

Layout:

Avatar

Textarea:

"Write an update for the support team..."

Below textarea:

Attach file
Mention
Emoji

Right side:

[ Comment ]

The textarea should have:
- subtle border
- rounded corners
- focus state
- comfortable padding
- appropriate minimum height

The Comment button should be indigo/blue.

==================================================
RIGHT INFORMATION PANEL
==================================================

Create a right-side information column.

Do NOT make it look like a traditional dashboard.

Use 2–3 compact cards.

CARD 1:

Ticket Information

Ticket ID       TICKET-1024
Status          Open
Priority        High
Assignee        HR
Created         Sep 24, 2026
Last updated    Sep 24, 2026

Use aligned labels and values.

CARD 2:

Quick Actions

Change status          >
Reassign ticket        >
Add internal note      >

Each row should have:
- icon
- text
- subtle hover state
- right arrow

CARD 3:

Related Information

Customer       Internal
Department     HR
Category       Attendance
Source         Portal

Keep these cards compact.

==================================================
TYPOGRAPHY
==================================================

Use:

Inter

or:

Plus Jakarta Sans

Typography should feel modern and highly readable.

Recommended sizes:

Application name:
16px

Breadcrumb:
13px

Ticket ID:
12px

Ticket title:
30–34px

Section titles:
16–18px

Body:
14–15px

Metadata labels:
12–13px

Metadata values:
13–14px

Do not use giant text.

Use font weights:
400
500
600
700

Avoid using 800/900 excessively.

==================================================
CARDS
==================================================

Cards should have:

border-radius: 12px

border:
1px solid #E6EAF0

background:
#FFFFFF

shadow:
very subtle

Example visual philosophy:

Border should define the card.
Shadow should barely be noticeable.

Do not make every section look like a floating giant box.

==================================================
ICONS
==================================================

Use a consistent icon library already available in the project.

Prefer:
Lucide
Heroicons
or the project's existing icon system.

Use simple outline icons.

Do not mix multiple icon styles.

==================================================
SPACING
==================================================

Use a consistent spacing scale.

Prefer:

4px
8px
12px
16px
20px
24px
32px

Avoid arbitrary spacing.

The current UI has too much empty vertical space.

Make the content fit naturally inside a 900–1080px desktop viewport while still feeling comfortable.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:

Top header
Full-width content
Main ticket content + right information panel

Tablet:

Right panel becomes narrower.

Mobile:

Single-column layout.

Header becomes:

Support Desk     🔔     Avatar

Search becomes a separate row.

Metadata becomes a grid.

Right information cards move below the conversation.

Status action becomes stacked when necessary.

Comment composer should remain easy to use.

==================================================
INTERACTIONS
==================================================

Add polished micro-interactions:

- button hover
- button active state
- dropdown animation
- input focus ring
- card hover where appropriate
- status update loading
- toast notification after successful update
- comment submission feedback
- smooth transitions

Use short transitions around:

150–200ms

Do not over-animate the application.

==================================================
ACCESSIBILITY
==================================================

Ensure:

- keyboard navigation
- visible focus states
- accessible buttons
- accessible form labels
- sufficient contrast
- semantic HTML
- status and priority are not communicated by color alone

==================================================
IMPORTANT UX IMPROVEMENTS
==================================================

The existing page currently feels like a basic CRUD page.

Transform it into a real support-ticket workspace.

The user should immediately understand:

1. What ticket am I looking at?
2. What is the current status?
3. How urgent is it?
4. Who owns it?
5. What is the issue?
6. What actions can I perform?
7. What has happened in the conversation?
8. Where can I add a response?

The UI hierarchy should naturally answer those questions.

==================================================
IMPLEMENTATION REQUIREMENTS
==================================================

Before making changes:

1. Inspect the existing frontend architecture.
2. Identify the ticket-detail page.
3. Identify reusable components.
4. Preserve all existing functionality.
5. Reuse the existing API calls.
6. Do not modify backend code.

Then redesign the frontend.

Create reusable components where appropriate:

- AppHeader
- Breadcrumb
- TicketHeader
- StatusBadge
- PriorityBadge
- TicketMetadata
- DescriptionCard
- StatusActionBar
- Conversation
- CommentItem
- CommentComposer
- TicketInfoCard
- QuickActions
- EmptyState

Use shared design tokens for:
- colors
- spacing
- border radius
- typography
- shadows

==================================================
FINAL QUALITY BAR
==================================================

The final result should look like a polished commercial SaaS product.

Think:

"Modern support platform"

NOT:

"HTML form with cards"

NOT:

"basic admin dashboard"

NOT:

"green corporate portal"

The primary visual identity should be BLUE / INDIGO with a neutral light background.

No left sidebar.

No green branding.

No oversized heading.

No unnecessary empty space.

After implementation:

1. Start the application.
2. Open the ticket detail page.
3. Check the UI at 1440x900.
4. Check responsive behavior.
5. Fix alignment issues.
6. Fix spacing issues.
7. Fix typography issues.
8. Verify all existing buttons/forms/API interactions still work.
9. Check browser console for errors.
10. Iterate until the UI looks production-ready.
