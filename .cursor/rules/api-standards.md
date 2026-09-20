# Java 21 + Spring Boot API Standards

## 1. API design principles

- Prefer simple, predictable, resource-oriented APIs over clever or overly abstract designs.
- Align API design with standard HTTP semantics and Spring Boot conventions.
- Keep API contracts explicit, stable, and easy to understand.
- Avoid creating unnecessary abstraction layers or framework-heavy patterns for simple APIs.
- Design APIs to be easy to consume, document, and evolve.
- Favor consistency across controllers and endpoints over local optimization.

## 2. Resource-oriented URL and endpoint naming

- Model the API around resources, not actions or procedures.
- Use nouns for resources and avoid RPC-style naming such as `doSomething` or `processX` when a resource-oriented design is more natural.
- Prefer clear, stable resource paths such as `/tickets`, `/tickets/{id}`, `/tickets/{id}/comments`.
- Keep URL paths hierarchical and descriptive, reflecting the domain structure.
- Use plural nouns for collection resources.
- Avoid deep nesting unless it reflects a real domain relationship and improves clarity.
- Do not create excessive endpoint proliferation for minor variations of the same resource behavior.
- Keep endpoint naming consistent across the application.

## 3. HTTP methods and semantics

- Use HTTP methods to reflect action semantics:
  - `GET` for read-only retrieval
  - `POST` for creating a new resource or triggering a server-side creation workflow
  - `PUT` for full replacement when appropriate
  - `PATCH` for partial updates
  - `DELETE` for removal when the operation is valid
- Do not overload `GET` with state-changing behavior.
- Do not use `POST` for simple retrieval or query operations when `GET` is appropriate.
- Use `PATCH` instead of `PUT` for partial changes unless full replacement is clearly required.
- Ensure operations are consistent with HTTP semantics and expected client behavior.
- Keep request/response behavior predictable for all standard methods.

## 4. HTTP status codes

- Use standard HTTP status codes consistently and semantically.
- Common patterns:
  - `200 OK` for successful retrieval or update operations
  - `201 Created` for resource creation
  - `204 No Content` for successful operations without a response body
  - `400 Bad Request` for invalid input or malformed requests
  - `401 Unauthorized` for missing or invalid authentication
  - `403 Forbidden` for valid authentication but insufficient permission
  - `404 Not Found` for missing resources
  - `409 Conflict` for conflicting state or duplicate business constraints
  - `422 Unprocessable Entity` when validation fails at the business level
  - `500 Internal Server Error` only for unexpected server-side failures
- Do not invent custom success semantics that conflict with standard HTTP behavior.
- Return consistent error codes across similar failure scenarios.
- Use the most precise code that matches the real result.

## 5. Request and response structure

- Keep request and response payloads simple, explicit, and domain-oriented.
- Prefer clear, predictable JSON structures with stable field names.
- Use consistent naming conventions across all endpoints.
- Keep responses focused on the contract, not internal implementation details.
- Avoid unnecessary wrapper objects unless the API contract genuinely requires them.
- A response should clearly communicate success, failure, data, and relevant metadata without leaking internal state.
- Ensure the same resource shape is represented consistently across endpoints when applicable.

## 6. DTO usage and API boundaries

- Use DTOs for API contracts and keep them separate from persistence entities and internal domain models.
- Do not expose JPA entities directly as REST API contracts.
- Keep DTOs purpose-specific and minimal, reflecting the API use case rather than internal persistence details.
- Keep controllers focused on transport concerns and input/output mapping.
- Keep business logic in service/application layers rather than inside controllers.
- Keep persistence and infrastructure concerns out of the public API contract.
- Do not allow API contracts to mirror internal implementation choices.

## 7. JSON naming and serialization conventions

- Use consistent JSON property naming conventions across the API.
- Prefer camelCase for JSON fields in Java-based Spring Boot APIs unless the project explicitly standardizes otherwise.
- Use stable serialization behavior and avoid surprising field aliases unless justified.
- Keep field names descriptive and business-relevant.
- Do not expose internal technical names or persistence column names as public API fields.
- Treat serialization conventions as part of the API contract and keep them consistent.

## 8. Request validation

- Validate incoming request data at the API boundary before business logic is processed.
- Use standard validation annotations and framework validation mechanisms when appropriate.
- Validate required fields, payload structure, and object constraints consistently.
- Use domain/service-level validation for business rules that must be enforced server-side.
- Do not rely on client-side validation as the only source of correctness.
- Return clear validation errors with enough information for clients to correct the request.

## 9. Error response format and exception mapping

- Use a consistent error response structure across the API.
- Include clear error metadata such as a message, error code or category, and relevant details when useful.
- Avoid leaking internal implementation details, stack traces, or sensitive system information in API responses.
- Map exceptions to appropriate HTTP responses at the boundary layer.
- Keep error semantics consistent across controllers and services.
- Prefer predictable error contracts over ad hoc response shapes.

## 10. Pagination, sorting, and filtering

- Use explicit query parameters for pagination, sorting, and filtering when returning lists.
- Prefer standard, predictable conventions such as page number/size or offset/limit patterns when appropriate.
- Provide stable, documented sorting semantics and avoid ambiguous defaults.
- Keep filtering explicit and consistent with resource fields.
- Return metadata that helps clients navigate results when pagination is used.
- Do not overload APIs with large, ambiguous query parameter combinations when a smaller, clearer contract is sufficient.

## 11. API versioning

- Version APIs intentionally when a change would break existing clients or contracts.
- Prefer a clear, predictable versioning approach that matches the project’s needs.
- Keep versioning strategy explicit and documented.
- Do not break existing API contracts without a deliberate migration or compatibility plan.
- Prefer additive and backward-compatible changes when possible.
- Avoid versioning every minor change when the API can remain compatible instead.

## 12. Idempotency and safe operations

- Design operations to be safe and predictable.
- Use idempotent semantics where appropriate for repeated requests, especially on updates and deletes.
- Treat non-idempotent operations carefully and document their behavior.
- Avoid ambiguous operations that can produce inconsistent results when retried.
- Use the correct HTTP method and semantics for safe, repeatable behavior.

## 13. Path parameters, query parameters, and request bodies

- Use path parameters for resource identity and structural routing.
- Use query parameters for filtering, sorting, and optional retrieval concerns.
- Use request bodies for create/update payload data.
- Keep parameter usage consistent across the API surface.
- Do not mix unrelated concerns into a single parameter set.
- Prefer simple, clearly named values over overloaded or ambiguous parameter conventions.

## 14. Headers and content types

- Use appropriate content types for request and response payloads.
- Keep content negotiation consistent and standards-based.
- Use headers for transport metadata and authentication/authorization concerns where appropriate.
- Avoid custom headers for basic behavior unless there is a clear need.
- Do not rely on hidden conventions for required API semantics.

## 15. Date, time, number, enum, and identifier representations

- Use consistent, explicit representations for date, time, number, enum, and identifier values.
- Prefer standard ISO-8601 representations for date/time values when applicable.
- Represent enums consistently and document their allowed values.
- Use stable identifier types and avoid exposing internal implementation-specific formats unless required.
- Keep numeric values predictable, including precision and formatting expectations.
- Document any constraints or business rules associated with these representations.

## 16. Nullability and optional fields

- Be explicit about nullability and optional fields in API contracts.
- Avoid ambiguous semantics where a field is sometimes absent, sometimes null, and sometimes empty.
- Prefer clear, consistent rules for optional values.
- Do not expose internal null-handling concerns as part of the public contract unless needed.
- Keep response fields predictable and easy to consume.

## 17. Consistent success and error responses

- Use consistent success response shapes for similar operations.
- Use consistent error response shapes for similar failures.
- Keep success and error contracts easy to document and consume.
- Avoid highly variable or ad hoc response bodies for the same type of operation.
- Make response structure predictable enough for clients to handle reliably.

## 18. API documentation and OpenAPI conventions

- Keep API documentation aligned with the actual contract.
- Use standard OpenAPI conventions and clear descriptions for resources, parameters, and responses.
- Document required fields, validation rules, and meaningful error cases.
- Keep documentation accurate and maintainable.
- Avoid documenting internal implementation details that are not part of the public contract.
- Ensure public documentation reflects the actual supported API behavior.

## 19. Backward compatibility

- Preserve stable API contracts wherever possible.
- Prefer additive, backward-compatible changes over breaking changes.
- If a breaking change is necessary, use a deliberate versioning and migration strategy.
- Avoid silently changing fields, semantics, or response formats in a way that breaks clients.
- Treat compatibility as a first-class concern in API evolution.

## 20. Security considerations for APIs

- Secure API endpoints according to authentication and authorization requirements.
- Do not expose sensitive data through the public API unless it is required and authorized.
- Keep authorization checks enforced server-side and do not rely on client-side hiding.
- Validate permissions, not just user identity.
- Avoid leaking internal implementation details or system metadata in responses.
- Treat API security as a product requirement, not a secondary concern.

## 21. Logging and observability without exposing sensitive data

- Log operational context and request outcomes without exposing secrets or sensitive payload data.
- Avoid logging passwords, tokens, credentials, personal data, or sensitive request content.
- Keep logs useful for diagnosis without revealing internal business data beyond what is justified.
- Maintain consistent observability patterns across controllers and services.
- Prefer structured logging and meaningful correlation IDs when appropriate.

## 22. Performance considerations

- Keep API responses efficient and focused on the real use case.
- Avoid unnecessary data serialization, redundant queries, or expensive processing in controllers.
- Use pagination and filtering appropriately for list endpoints.
- Prevent large payloads and broad result sets from being returned unintentionally.
- Keep API design tuned for the actual workload and avoid premature optimization.
- Do not trade maintainability for minor performance gains unless the need is real and measurable.

## 23. API consistency across controllers

- Keep conventions consistent across controllers, including naming, response shapes, and error behavior.
- Reuse common patterns instead of inventing different conventions in different endpoints.
- Use the same validation, error, and success shapes for similar operations.
- Ensure controller responsibilities remain transport-focused and uniform.
- Do not let each controller evolve its own incompatible contract style.

## 24. Maintainability and avoiding unnecessary API complexity

- Keep API designs clear, stable, and easy to reason about.
- Do not add generic API frameworks or abstract wrappers without a concrete need.
- Avoid excessive endpoint proliferation and over-engineered request/response abstractions.
- Prefer straightforward contracts over clever generic patterns.
- Keep controller code thin, service logic separate, and persistence details internal.
- Revisit API design regularly to remove accidental complexity.

## 25. Scope reminder

- These are project-wide API standards for Java 21 and Spring Boot development.
- Keep the API design simple, predictable, standards-based, and maintainable.
- Do not add application-specific implementation code to this rule file.
- Favor stable, useful APIs over highly abstract or over-engineered interfaces.
