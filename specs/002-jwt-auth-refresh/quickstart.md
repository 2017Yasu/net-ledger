# Quickstart: JWT Authentication with Refresh Token

This guide provides a quick overview and instructions for integrating and testing the JWT Authentication with Refresh Token feature.

## Prerequisites

- Node.js (LTS)
- PostgreSQL database running and accessible
- `net-ledger` project setup (dependencies installed, `.env` configured)

## Backend Setup (Assuming `net-ledger` project)

1.  **Database Migrations**: Ensure your database is up-to-date with the necessary schema for `RefreshToken` entities. This is typically handled by Prisma migrations.
    ```bash
    npx prisma migrate dev --name init # Or apply existing migrations
    ```
2.  **Environment Variables**: Ensure the following environment variables are set in your `.env` file for JWTs:
    ```
    JWT_SECRET="YOUR_SUPER_SECRET_KEY"
    REFRESH_TOKEN_SECRET="ANOTHER_SUPER_SECRET_KEY_FOR_REFRESH"
    ACCESS_TOKEN_EXPIRATION="15m" # e.g., 15 minutes
    REFRESH_TOKEN_EXPIRATION="7d" # e.g., 7 days
    ```
    _(Note: Use strong, randomly generated secrets in production.)_

## API Endpoints

The following endpoints are available:

- **`POST /api/auth/login`**: Authenticates a user.
  - **Request Body**: `{ "email": "...", "password": "..." }`
  - **Response**: `{ "accessToken": "..." }` (Access token in body), `Set-Cookie` header for `refreshToken`.
- **`POST /api/auth/refresh`**: Exchanges a valid refresh token (from HTTP-only cookie) for a new access token.
  - **Request**: Must include `refreshToken` cookie.
  - **Response**: `{ "accessToken": "..." }` (New access token), `Set-Cookie` header for `refreshToken`.
- **`POST /api/auth/logout`**: Invalidates the current refresh token and clears the cookie.
  - **Request**: Must include `refreshToken` cookie.
  - **Response**: `204 No Content`, `Set-Cookie` header to clear `refreshToken`.

## Client-Side Integration Notes

- **Access Token**: Store in JavaScript memory (e.g., global state, Redux, React Context) and attach as `Authorization: Bearer <accessToken>` header for protected API requests.
- **Refresh Token**: Automatically handled by the browser via HTTP-only cookie. No direct JavaScript access.
- **Automatic Refresh**: Implement an interceptor or similar mechanism to catch `401 Unauthorized` responses from protected endpoints. If a 401 is received, trigger a `POST /api/auth/refresh` request. If successful, retry the original failed request with the new access token. If refresh fails, redirect the user to the login page.
- **Logout**: On logout action, make a `POST /api/auth/logout` request and then clear the client-side access token.
