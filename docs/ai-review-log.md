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