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