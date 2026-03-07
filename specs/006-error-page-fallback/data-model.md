# Data Model: Global Error Page Fallback

## Conceptual Entity: Error Event (Client-Side)

### Description

Captures the runtime error event for logging and display purposes.

### Attributes

- `timestamp`: (DateTime) When the error occurred.
- `path`: (String) The URL path where the error was triggered.
- `code`: (String/Number) The HTTP status code or error identifier passed via search params (e.g., `403`, `500`).
- `message`: (String) Generic user-facing message corresponding to the code.
- `internalDetails`: (JSON) Private error details (stack, stack trace) for server-side logging (NOT exposed to user).

## State Transitions

1.  **Caught**: Error boundary (`error.tsx`) catches a runtime error.
2.  **Redirecting**: System navigates the user to `/error?code=...`.
3.  **Displayed**: User sees the generic error page and a "Back to Dashboard" button.
4.  **Returned**: User clicks the button and returns to the main application flow.
