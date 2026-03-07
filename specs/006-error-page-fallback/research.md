# Research: Global Error Page Fallback

## Decisions

### Decision: Error Capture and Redirection

- **Choice**: Use `src/app/error.tsx` (segment-level error boundary) and `src/app/global-error.tsx` (root-level error boundary).
- **Rationale**: To strictly follow the requirement of redirecting to `/error`, the `error.tsx` component will use `useEffect` and `useRouter` to navigate to `/error?code=...` if an unhandled error is caught. However, we will primarily render the `ErrorDisplay` UI _directly_ in these files if a redirect would cause infinite loops or complex state management. Given the spec's explicit "redirect to /error" requirement, we will implement the redirection logic in `src/app/error.tsx`.
- **Alternatives considered**:
  - _Render in-place_: Standard Next.js practice. Avoids extra page loads. (Rejected because spec explicitly asked for `/error` page).
  - _Middleware redirection_: Cannot catch runtime React rendering errors efficiently. (Rejected).

### Decision: API Error Isolation

- **Choice**: Do not wrap API routes in a way that triggers the global `error.tsx` HTML response.
- **Rationale**: Next.js API routes (`/api/*`) handle errors independently via their own handlers and return JSON by default. `error.tsx` only applies to page segments.
- **Alternatives considered**: None. This is standard Next.js behavior.

### Decision: 404 Exclusion

- **Choice**: Use `src/app/not-found.tsx` for 404 errors.
- **Rationale**: `not-found.tsx` is the idiomatic way to handle 404s in Next.js App Router and doesn't trigger `error.tsx`.
- **Alternatives considered**: None.

## Technical Tasks & Findings

1.  **Placement**: `src/app/error.tsx` will catch errors for all child segments.
2.  **Global Error**: `src/app/global-error.tsx` is required for errors in the root layout itself (rare but possible).
3.  **Redirection Safe-guards**: Ensure the redirect to `/error` is idempotent and doesn't trigger if already on `/error`.
