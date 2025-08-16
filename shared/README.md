# @3d/shared

Shared, framework-agnostic TypeScript types and cross-platform helpers.

Contents:
- Domain models (pure data shapes)
- HTTP request/response DTOs
- Socket event contracts

Guidelines:
- Keep persistence-specific and framework-specific types out.
- Use ISO8601 strings for temporal fields across the boundary.
- Add versioned export groups if contracts evolve (e.g., `v2/`).
