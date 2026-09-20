# Java 21 + Spring Boot Testing Guidelines

## 1. Testing goals

- Tests should verify behavior, not implementation details.
- Prefer small, clear tests that prove important business outcomes.
- Keep the test suite maintainable, fast, and easy to understand.
- Do not add tests that only assert framework mechanics or mock behavior.
- Favor real behavior over elaborate test scaffolding.

## 2. Unit tests

- Use unit tests for focused validation of a single behavior or class responsibility.
- Keep unit tests fast and deterministic.
- Test meaningful inputs and outputs, especially edge cases and validation rules.
- Prefer direct, simple assertions over excessive setup.
- Do not over-mock dependencies when a small real object or in-memory stub is enough.
- Keep unit tests independent of external systems, network calls, and database state.

## 3. Integration tests

- Use integration tests to verify interaction between application components and infrastructure.
- Keep integration tests focused on the contract or workflow being tested.
- Use realistic but controlled test data and environment setup.
- Prefer stable test data and repeatable setup over fragile ordering assumptions.
- Avoid mixing unrelated behaviors into a single integration test.
- Keep the number of integration tests proportional to the value they add.

## 4. Spring Boot test conventions

- Use Spring Boot’s testing support when it matches the behavior under test.
- Prefer the standard Spring Boot test features and conventions over custom test infrastructure.
- Keep application context setup minimal and targeted.
- Use profiles or test-specific configuration when needed for environment isolation.
- Ensure tests are deterministic and do not depend on hidden state or external services.
- Avoid unnecessary application context startup overhead in unit-level tests.

## 5. Controller/API tests

- Test controller behavior through the HTTP boundary where appropriate.
- Validate request handling, status codes, response payloads, and error responses.
- Verify API contracts without depending on internal implementation details.
- Cover validation failures and business-rule violations at the API boundary.
- Prefer the smallest realistic HTTP test that proves the contract.
- Do not test the same behavior repeatedly across multiple controller layers if a single contract test already proves it.

## 6. Service-layer tests

- Test service logic for business rules, orchestration, and use-case behavior.
- Keep service tests focused on outcomes and invariants rather than internal method calls.
- Validate that business rules are enforced consistently.
- Cover happy paths, invalid input, and failure cases that affect domain correctness.
- Avoid writing service tests that are essentially re-tests of repository behavior.

## 7. Repository/persistence tests

- Use repository tests to validate persistence behavior and query correctness.
- Keep repository tests readable and focused on actual database behavior.
- Prefer a controlled database setup for persistence verification.
- Test relevant query semantics and edge cases without over-asserting every field.
- Do not treat repository tests as a substitute for service or API behavior tests.
- Avoid unnecessarily broad persistence tests that are slow or hard to diagnose.

## 8. Test fixtures, builders, and test data

- Use fixtures, builders, and reusable test data helpers to keep tests readable.
- Prefer simple, explicit test data over large or highly nested object graphs.
- Keep fixtures close to the behavior they support and avoid excessive abstraction.
- Do not create a large test utility framework unless it clearly reduces duplication and confusion.
- Use realistic domain values and meaningful defaults where they improve readability.

## 9. Mocking and when to avoid mocks

- Use mocks only when they represent external dependencies or interactions that are otherwise hard to control.
- Avoid mocks for simple business logic or for verifying behavior that can be tested directly.
- Do not assert only that a mock method was called when the real observable outcome is more important.
- Prefer real objects and in-memory collaborators for straightforward test scenarios.
- If mocking becomes complex, the test may be too coupled to implementation details or too brittle.
- Do not create mock-heavy tests that are difficult to read or maintain.

## 10. Assertions and test naming

- Write assertions that check behavior clearly and directly.
- Prefer assertions on observable outcomes rather than internal state or implementation artifacts.
- Keep test names descriptive and aligned with the behavior under test.
- Use naming that reads like a specification, such as when a condition is expected and what result is required.
- Avoid weak or generic test names that do not communicate intent.

## 11. Validation and exception-path testing

- Test validation failures and business-rule violations at the relevant boundary.
- Verify exception behavior for invalid input, domain violations, and transaction failures.
- Ensure error responses are consistent, meaningful, and aligned with the application contract.
- Cover both expected and unexpected failure paths without over-testing trivial branches.
- State transition validation must be tested as a business rule, not only as a UI-side convenience.

## 12. Transaction and database testing

- Test transaction boundaries where atomicity and consistency matter.
- Verify that write operations behave correctly under the expected database rules.
- Use transactional tests only when they provide real confidence in persistence semantics.
- Avoid broad database tests when a smaller, more precise test would validate the same behavior.
- Do not over-test incidental persistence details that are not part of the product requirement.

## 13. Security testing where applicable

- Test security-sensitive behavior where it is part of the application contract.
- Cover authorization and authentication checks at the appropriate layer.
- Verify that protected endpoints reject unauthorized access and enforce expected roles or permissions.
- Keep security tests focused on access rules and redirection/denial behavior, not unrelated application logic.
- Do not create large, brittle security test suites for every minor path unless there is real risk or complexity.

## 14. Maintainable and readable tests

- Keep tests concise, readable, and easy to review.
- Favor explicit setups and clear expectations over hidden helper magic.
- Use comments only when they explain intent or a non-obvious constraint.
- Group related tests logically and keep naming consistent across the suite.
- Remove redundant tests that do not add new behavioral confidence.

## 15. Avoiding brittle, redundant, slow, or over-engineered tests

- Do not write tests that depend on incidental implementation details, ordering, or framework internals.
- Avoid duplicated assertions across multiple layers when one test already proves the behavior.
- Prefer stability and reliability over elaborate test orchestration.
- Keep tests fast enough to run in normal development feedback loops.
- Do not introduce new testing infrastructure or libraries without a clear need.
- If a test adds complexity without improving confidence, it should be simplified or removed.

## 16. Scope reminder

- These are project-wide testing guidelines for Java 21 Spring Boot development.
- Keep the testing strategy practical, maintainable, and aligned with the project’s actual complexity.
- Do not add example implementation code or prescribe unnecessary libraries to this file.
- Favor a lean, effective test suite over a large, brittle one.
