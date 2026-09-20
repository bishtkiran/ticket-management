# Java 21 + Spring Boot Project Guidelines

## 1. Java 21 usage

- Use Java 21 as the baseline language level for all production code.
- Prefer modern Java language features that improve clarity and correctness when they are standard and easy to understand.
- Keep code idiomatic, readable, and aligned with current Java best practices.
- Avoid unnecessary abstraction or clever language tricks that reduce maintainability.
- Prefer records for immutable data carriers where appropriate, especially DTOs and simple value objects.
- Use sealed types and pattern matching only when they meaningfully improve safety and readability; do not overuse them.
- Prefer `var` only when it improves readability and the type is obvious from context.
- Keep compatibility and project-wide consistency in mind when introducing newer Java features.

## 2. Spring Boot conventions

- Use Spring Boot conventions as the default standard for configuration, application structure, and dependency management.
- Keep the application configuration explicit, predictable, and environment-friendly.
- Favor standard Spring Boot property names and established conventions over custom patterns.
- Use Spring Boot starter dependencies that match the project’s actual technical needs.
- Keep application startup configuration simple and avoid unnecessary custom infrastructure unless clearly justified.
- Prefer conventional Spring Boot package organization and naming over creating a large number of custom conventions.
- Ensure the application remains easy to run, test, and reason about in local and deployment environments.

## 3. Layered architecture

- Use a clear layered architecture appropriate to the application’s size and complexity.
- At minimum, separate API/presentation concerns, application/business logic, and persistence concerns.
- Introduce a dedicated domain layer only when it adds meaningful value for business rules or domain modelling.
- Keep responsibilities separated so each layer owns one cohesive concern.
- Presentation/API layer is responsible for request/response handling, input mapping, and HTTP concerns only.
- Application/service layer contains business logic orchestration and use-case coordination.
- Domain layer contains core business rules, entities, and domain logic with minimal framework coupling when a dedicated domain model is warranted.
- Persistence/infrastructure layer handles storage, integration, and technical concerns such as database access or third-party clients.
- Do not let lower layers leak implementation details into higher layers.
- Avoid cyclic dependencies between layers.
- Keep business logic out of controllers, repositories, and utility classes unless the logic is genuinely infrastructure-specific.
- Do not create layers or abstractions solely to satisfy an architectural pattern.

## 4. Dependency injection

- Use Spring’s dependency injection as the primary mechanism for wiring components.
- Favor constructor injection over field injection or setter injection.
- Keep constructors explicit and concise; dependencies should be obvious from the constructor signature.
- Prefer final fields for injected dependencies, where practical.
- Avoid service locator patterns and manual object creation in business logic.
- Keep components small, focused, and testable.
- Do not create unnecessary factories or container-like abstractions when Spring already provides the needed wiring model.

## 5. DTOs

- Use DTOs to separate API contracts from domain entities and persistence models.
- Keep DTOs intentionally simple: they should represent data transfer, not business behavior.
- Prefer narrow, purpose-specific DTOs for each use case rather than a single “god” DTO reused everywhere.
- Avoid exposing internal domain objects directly as API contracts or persistence entities.
- Map between domain objects and DTOs explicitly and clearly.
- Keep DTO validation and transformation logic focused and easy to follow.
- Do not place business logic inside DTOs.

## 6. Validation

- Validate all incoming request data at the boundary layer before it reaches business logic.
- Use Jakarta Bean Validation annotations for standard constraints such as `@NotNull`, `@NotBlank`, `@Size`, `@Email`, and `@Valid`.
- Validate nested objects and collections when appropriate.
- Keep validation rules close to the contract they describe and avoid duplicating business constraints in multiple places.
- Prefer meaningful validation error messages that help API consumers fix invalid requests.
- Validate domain invariants in the domain layer when they are essential to business correctness, even when request validation exists.
- State transition rules are business rules and must be enforced server-side in the application/domain layer.
- The frontend must not be the source of truth for valid ticket transitions.
- All API paths that can change ticket status must use the same transition validation logic.
- Do not rely on validation only in the UI or client; server-side validation is mandatory.

## 7. Exception handling

- Handle exceptions at the appropriate boundary, not silently in the middle of business logic.
- Use dedicated exception types for domain errors, validation errors, and technical failures when it improves clarity.
- Prefer meaningful, consistent error responses instead of leaking internal implementation details.
- Keep exception handling centralized where practical, such as via `@ControllerAdvice` or equivalent Spring mechanisms.
- Do not catch exceptions just to log them without rethrowing, translating, or handling them appropriately.
- Avoid swallowing exceptions in business flows; make failure modes explicit.
- Ensure error handling stays predictable and consistent across the application.

## 8. Transaction boundaries

- Define transaction boundaries at service-layer use cases, not at the controller or presentation layer.
- Use `@Transactional` at service/use-case boundaries where a business operation requires atomic persistence.
- Use read-only transactions for appropriate read operations when beneficial for clarity or database optimization.
- Keep transactions focused on a single business operation or consistent unit of work.
- Avoid transaction scopes that span unrelated concerns or too much application logic.
- Do not perform transaction management manually unless absolutely required by the architecture.
- Ensure transactional methods include the necessary operations to maintain data consistency and atomicity.
- Keep transaction logic understandable and limited to real business operations.
- Do not add `@Transactional` indiscriminately to every service method.

## 9. Persistence

- Use Spring Data or repository abstractions in a way that matches the project’s persistence strategy and keeps persistence concerns isolated.
- For simple CRUD-oriented data, JPA entities may serve as persistence models where appropriate, but they must not be exposed directly as REST API contracts.
- Keep repository interfaces focused on data access and avoid mixing repository logic with business rules.
- Prefer clear query methods or explicit repository usage over overly dynamic or hard-to-follow persistence logic.
- Do not expose persistence details unnecessarily to the service layer or API layer.
- Keep entity design aligned with the domain model and avoid treating persistence concerns as the primary design source.
- Use database constraints and data model integrity rules when they are important for correctness, not only application-level checks.
- Keep persistence code readable and straightforward; do not overengineer repository abstractions.

## 10. Maintainability

- Write code that is easy to read, navigate, and change for the next engineer.
- Favor explicit, straightforward implementations over highly abstract or generically clever solutions.
- Keep class and method responsibilities small and cohesive.
- Use names that describe intent clearly and reflect domain language.
- Prefer consistency in code style, package naming, dependency usage, and project structure.
- Refactor small, repeated patterns early when they create confusion or drift.
- Keep comments focused on intent, constraints, or non-obvious decisions; do not comment obvious code.
- Ensure tests validate behavior and protect important business rules.

## 11. Avoiding unnecessary complexity

- Solve the problem in the simplest way that correctly meets the requirement.
- Avoid premature abstraction, speculative frameworks, or complex design patterns when a direct implementation is clearer.
- Do not introduce generic infrastructure or indirection without a concrete need.
- Favor composition and explicit code over deep inheritance hierarchies or highly abstract base classes.
- Keep configuration minimal and avoid custom abstraction layers unless they reduce actual complexity for the team.
- If a solution adds more indirection than value, it is not the right solution.
- Prefer maintainable clarity over theoretical extensibility.
- Revisit design choices regularly to remove accidental complexity.

## 12. Security and secret handling

- Never hard-code credentials, API keys, database passwords, tokens, or other secrets in source code or configuration committed to Git.
- Use environment variables or appropriate external configuration for secrets.
- Keep secrets out of local defaults, example files, and developer notes when those files may be committed.
- Never log passwords, tokens, credentials, or sensitive request data.
- Ensure logs and error messages do not expose confidential information.

## 13. General engineering standards

- Prefer correctness, clarity, and low surprise over cleverness.
- Keep changes focused and aligned with established project conventions.
- Write code that is easy to test in isolation and easy to review.
- Design with real business needs and long-term maintenance in mind.
- Do not optimize prematurely; optimize only when a measured need exists.
- Treat software quality as a product requirement, not as a secondary concern.

## 14. Scope reminder

- These are project-wide engineering guidelines for Java 21 and Spring Boot development.
- They apply to code, design decisions, and team conventions across the application.
- Do not add application-specific implementation code to this rule file.
- Keep this document reusable, concise, and easy to apply in future work.
