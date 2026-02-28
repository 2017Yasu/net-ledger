# Data Model: Post-Login Dashboard Redirection

This feature does not introduce any new data entities or modify existing data models. It primarily relies on the successful authentication status of a `User` entity, which is managed by the existing authentication system.

## Existing Entities Utilized:

- **User**: An authenticated user with an active session.
- **Authentication State**: The state indicating whether a user is logged in or not.
