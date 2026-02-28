# Research: Next.js Redirection Strategies for Post-Login Dashboard Redirection

## Overview of Next.js 16+ Redirection Strategies

Next.js 16+ provides several mechanisms for handling redirection, each suited for different scenarios, balancing performance, security, and user experience.

### 1. `proxy.ts` (formerly Middleware)

- **Mechanism**: Executes code on every request before it reaches a page, operating at the Edge runtime.
- **Use Cases**: Ideal for initial, "optimistic" checks such as verifying session existence and redirecting unauthenticated users to a login page. Can also prevent authenticated users from accessing public routes like `/login` or `/register`.
- **Limitations**: Not designed for sole authorization; more sensitive checks should occur closer to data. Avoid heavy API/DB calls to prevent performance bottlenecks.

### 2. Server Actions/Server Components

- **Mechanism**: Server-side logic for handling secure operations and data mutations. Can perform redirects using `redirect` from `next/navigation`.
- **Use Cases**: Secure handling of login/logout processes, credential validation, and in-depth authorization. Ensures protected content is never exposed to unauthorized users.

### 3. Client-Side Redirection

- **Mechanism**: Uses `next/router` or the `useRouter` hook within React components after a page has loaded.
- **Use Cases**: User-initiated navigation or state-dependent redirections after initial page load.
- **Limitations**: Can result in a "flash of unauthorized content" if protected content is rendered before redirection. Relies on JavaScript.

## Decision for Post-Login Dashboard Redirection

Given the feature requirements, a hybrid approach combining `proxy.ts` and client-side redirection is recommended:

- **Primary Redirection (Preventing Access to Login/Register)**: `src/proxy.ts` will be utilized to intercept requests from authenticated users attempting to access `/login` or `/register` and redirect them to `/dashboard`. This ensures these sensitive pages are not accessed by logged-in users at the earliest possible point.
- **Post-Login Redirect**: After a successful authentication API call (likely handled by a Server Action or Route Handler), a client-side redirection within the login component (`src/app/(pages)/auth/login/page.tsx`) using `useRouter` will navigate the user to `/dashboard`. This provides an immediate and responsive user experience post-authentication.
- **Dashboard Unavailable Error**: The redirection to a dedicated error page (`/error?code=dashboard-unavailable`) if `/dashboard` is unavailable will be handled within `src/proxy.ts`. This provides a robust server-side fallback before the page even attempts to render.

## Rationale

This combination leverages the strengths of both server-side (Edge) and client-side logic:

- `proxy.ts` provides a secure and performant way to enforce access rules for `login`/`register` and handle critical server-side fallbacks (like dashboard unavailability).
- Client-side redirection enhances responsiveness immediately after a successful authentication API call.

## Alternatives Considered

- **Pure Client-Side Redirection**: Rejected due to potential "flash of unauthorized content" and less robust security for preventing access to sensitive routes by authenticated users.
- **Pure Server-Side Redirection (Server Components/Actions)**: While secure, relying solely on server components for all redirection might introduce additional latency for the immediate post-login experience compared to an optimized client-side navigation after an API response. `proxy.ts` offers a more efficient "early exit" for specific routing concerns.
