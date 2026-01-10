# JWT Authentication Architecture

This document outlines the key architectural decisions and deployment considerations for the JWT (JSON Web Token) authentication system with refresh tokens implemented in the `net-ledger` application.

## 1. Token Types and Lifespan

- **Access Token (AT)**:
  - **Purpose**: Used for authenticating requests to protected API endpoints.
  - **Lifespan**: Short-lived (e.g., 15 minutes, configurable via `ACCESS_TOKEN_EXPIRATION` environment variable). This minimizes the window of opportunity for attackers if an AT is compromised.
  - **Storage**: Stored in JavaScript memory on the client-side. This prevents XSS attacks from directly accessing it from `document.cookie` and reduces the risk of CSRF.
- **Refresh Token (RT)**:
  - **Purpose**: Used to obtain new access tokens once the current AT expires, allowing users to maintain a session without re-authenticating.
  - **Lifespan**: Longer-lived (e.g., 7 days, configurable via `REFRESH_TOKEN_EXPIRATION` environment variable).
  - **Storage**: Stored as an HTTP-only, Secure, SameSite cookie on the client-side.
    - **HTTP-only**: Prevents JavaScript (and thus XSS attacks) from reading the token.
    - **Secure**: Ensures the cookie is only sent over HTTPS connections.
    - **SameSite=Lax**: Provides protection against some forms of CSRF attacks.

## 2. Authentication Flow

### Login (`POST /api/auth/login`)

1.  User provides username/password.
2.  Server authenticates credentials.
3.  Server generates a new AT and RT.
4.  Server stores a hashed version of the RT in the PostgreSQL database with an expiration date.
5.  Server sets the RT as an HTTP-only cookie in the response.
6.  Server returns the AT in the response body.
7.  Client stores AT in memory and redirects to a protected route (e.g., dashboard).

### Accessing Protected Resources

1.  Client attaches the AT from memory in the `Authorization: Bearer <token>` header of API requests.
2.  Next.js `middleware.ts` or API route handlers verify the AT using `src/lib/server-auth.ts`.
3.  If AT is valid, request proceeds.

### Token Refresh (`POST /api/auth/refresh`)

1.  Client API interceptor (in `src/lib/api-client.ts`) catches a `401 Unauthorized` response.
2.  The interceptor sends a request to `POST /api/auth/refresh`.
3.  Server extracts RT from the HTTP-only cookie.
4.  Server verifies RT signature and checks against the database for validity (not revoked, not expired).
5.  **Token Rotation**: If valid, the old RT is immediately revoked in the database.
6.  Server generates a new AT and a new RT.
7.  Server stores the hashed new RT in the database.
8.  Server sets the new RT as an HTTP-only cookie in the response.
9.  Server returns the new AT in the response body.
10. Client updates AT in memory and retries the original failed request.

### Logout (`POST /api/auth/logout`)

1.  Client triggers logout action, making a request to `POST /api/auth/logout`.
2.  Server extracts RT from the HTTP-only cookie.
3.  Server revokes the RT in the database (marks `isRevoked = true`).
4.  Server clears the RT cookie.
5.  Client clears AT from memory and redirects to the login page.

### Logout from All Devices (`POST /api/auth/logout-all`)

1.  Client triggers "logout from all devices" action.
2.  Server extracts user ID from the access token.
3.  Server revokes ALL refresh tokens associated with that `userId` in the database.
4.  Server clears the RT cookie.
5.  Client clears AT from memory and redirects to the login page.

## 3. Security Considerations

- **HTTP-only Cookies**: Protects refresh tokens from XSS.
- **CSRF Protection**: `SameSite=Lax` on refresh token cookie helps mitigate CSRF. Access tokens in memory are inherently protected from CSRF when not sent as cookies.
- **Token Rotation**: Increases security by invalidating old refresh tokens, limiting replay attacks if a refresh token is compromised.
- **Server-Side Revocation**: The `isRevoked` flag in the `RefreshToken` model allows explicit invalidation of tokens (e.g., on logout or security breach).
- **Token Reuse Detection**: The refresh endpoint logic invalidates all user tokens if a used refresh token is presented again (potential compromise), forcing re-login.
- **Rate Limiting**: Basic rate limiting applied to login and refresh endpoints (`/api/auth/login`, `/api/auth/refresh`) to prevent brute-force and denial-of-service attacks.
- **Secrets Management**: `JWT_SECRET`, `REFRESH_TOKEN_SECRET` must be strong, unique, and securely stored in environment variables (e.g., `.env`, Docker secrets, Kubernetes secrets). Never commit them to version control.

## 4. Deployment Considerations

- **Environment Variables**: Ensure `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRATION`, `REFRESH_TOKEN_EXPIRATION` are configured in the deployment environment.
- **HTTPS**: Critical for `Secure` cookie flag and overall communication security.
- **Database**: PostgreSQL with Prisma is used for `RefreshToken` storage. Ensure database is accessible and migrations are applied.
- **Scalability**: The database-backed refresh token approach is scalable. Consider database indexing for `userId` and `token` fields on the `RefreshToken` model for performance under load.
- **Logging/Monitoring**: Authentication events (login, refresh, logout, errors) are logged via `src/lib/logger.ts` for observability and auditing. Integrate with a centralized logging system (e.g., ELK stack, Datadog, Sentry) in production.
- **Time Synchronization**: Ensure server clocks are synchronized to prevent issues with token expiration.
