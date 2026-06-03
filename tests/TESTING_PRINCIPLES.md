# Testing Principles

- Prefer testing the public API through HTTP requests instead of calling actions directly.
- Use factories or API calls to prepare data; avoid hand-crafted database rows unless the test explicitly targets persistence details.
- Keep fixtures compatible with the test database driver used in CI.
- Do not hardcode production-only SQL or schema assumptions into tests.
- When a test fails, keep the same behavior target and rewrite the test to follow these principles instead of weakening the assertion.
- Assert on response status, payload shape, and key persisted side effects, not implementation details.
