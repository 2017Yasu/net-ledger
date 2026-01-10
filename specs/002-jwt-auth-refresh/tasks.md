# Tasks: JWT Authentication with Refresh Token

**Feature Branch**: `002-jwt-auth-refresh` | **Date**: January 10, 2026

## Dependencies: User Story Completion Order

1.  User Story 1: Secure User Session (P1)
2.  User Story 2: Protected Resource Access (P1)
3.  User Story 3: Logout and Session Termination (P2)

## Parallel Execution Examples

- **Backend (Authentication Logic)**: Implement JWT generation, validation, and refresh token handling (`src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/refresh/route.ts`).
- **Database (Prisma Schema)**: Define `RefreshToken` model (`prisma/schema.prisma`).
- **Client-side (Authentication UI)**: Implement login and logout forms (`src/components/LoginForm.tsx`, `src/components/RegistrationForm.tsx`). Note: Actual registration form implementation is outside this feature's scope, but its existence is assumed for login.
- **Client-side (Token Management)**: Implement AuthContext and API interceptors (`src/lib/auth-context.ts`, `src/lib/api-client.ts`).

## Implementation Strategy

This feature will be implemented in phases, starting with foundational elements and proceeding through user stories in priority order. An MVP approach will be taken, ensuring each user story is independently testable and delivers value incrementally.

## Phase 1: Setup

- [x] T001 Configure JWT environment variables (JWT_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION) in `.env` file.
- [x] T002 Define `RefreshToken` model in `prisma/schema.prisma`.
- [x] T003 Generate new Prisma migration for `RefreshToken` model by running `npx prisma migrate dev --name add_refresh_token_model`.

## Phase 2: Foundational

- [x] T004 Implement JWT token generation utility (`generateAccessToken`, `generateRefreshToken`) in `src/lib/auth.ts`.
- [x] T005 Implement utility for hashing and verifying refresh tokens in `src/lib/auth.ts`.
- [x] T006 Create `createRefreshToken` and `revokeRefreshToken` functions for Prisma operations in `src/lib/refresh-token.ts`.
- [x] T007 Implement authentication middleware to verify access tokens in `src/lib/server-auth.ts` (for API routes).

## Phase 3: User Story 1 - Secure User Session [US1]

**Goal**: As a user, I want my authentication session to be secure, where my access token is short-lived to minimize exposure, and I can seamlessly continue my session without re-logging in by using a refresh token.
**Independent Test**: User logs in, access token expires, transparently refreshed without re-login.

- [x] T008 [P] [US1] Implement `/api/auth/login` endpoint to issue access and refresh tokens in `src/app/api/auth/login/route.ts`.
- [x] T009 [P] [US1] Implement `/api/auth/refresh` endpoint to exchange refresh token for new access token in `src/app/api/auth/refresh/route.ts`.
- [x] T010 [P] [US1] Update `AuthContext` to store access token in memory upon login and clear on logout in `src/lib/auth-context.ts`.
- [x] T011 [P] [US1] Implement client-side API interceptor to catch 401 errors and trigger token refresh flow in `src/lib/api-client.ts`.
- [x] T012 [P] [US1] Handle successful token refresh by retrying original failed request with new access token in `src/lib/api-client.ts`.
- [x] T013 [P] [US1] Redirect to login on refresh token expiration/invalidation in `src/lib/api-client.ts`.

## Phase 4: User Story 2 - Protected Resource Access [US2]

**Goal**: As an authenticated user, I want to access protected resources using my access token, and if my access token is invalid or expired, I want the system to handle it gracefully by attempting to refresh the token.
**Independent Test**: User accesses protected resources with valid/expired access token, system grants access/refreshes and retries.

- [x] T014 [US2] Apply authentication middleware to example protected API route in `src/app/api/salary/route.ts`.
- [x] T015 [US2] Create a simple protected client-side page/component to demonstrate access control in `src/app/(pages)/protected/page.tsx`.
- [x] T016 [US2] Implement conditional rendering/redirection for unauthenticated users on protected client-side routes in `src/middleware.ts`.

## Phase 5: User Story 3 - Logout and Session Termination [US3]

**Goal**: As a user, I want to be able to explicitly log out of the application, and I expect my session to be securely terminated, preventing further unauthorized access.
**Independent Test**: User logs out, subsequent protected resource access fails.

- [x] T017 [P] [US3] Implement `/api/auth/logout` endpoint to invalidate refresh token and clear cookie in `src/app/api/auth/logout/route.ts`.
- [x] T018 [P] [US3] Update client-side logout action to call `/api/auth/logout` and clear local access token in `src/components/AuthProvider.tsx`.
- [x] T019 [US3] Implement "Logout from all devices" functionality (if applicable, would involve revoking all user's refresh tokens in DB) in `src/app/api/auth/logout-all/route.ts`.

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T020 Implement robust error handling and user feedback for all authentication flows in `src/lib/api-client.ts` and UI components.
- [x] T021 Integrate logging and monitoring for authentication events (success, failure, refresh) using `src/lib/logger.ts`.
- [x] T022 Add basic rate limiting to `/api/auth/login` and `/api/auth/refresh` endpoints (e.g., using `next-rate-limit`).
- [x] T023 Review and refine security aspects based on best practices and potential attack vectors (e.g., token revocation list management).
- [x] T024 Document key architectural decisions and deployment considerations related to JWT authentication in `docs/jwt-auth-architecture.md`.
