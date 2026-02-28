import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken,
} from "./lib/auth";
import { logger } from "./lib/logger";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "./lib/refresh-token";

const X_USER_ID_HEADER = "X-User-Id"; // Define custom header constant

// Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

export async function proxy(request: NextRequest) {
  // Define public paths that don't require authentication
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/api/auth/login",
    "/api/auth/register",
  ];

  // Initialize authenticatedUserId early to determine user status
  let authenticatedUserId: string | null = null;

  // Attempt to authenticate via access token
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  if (accessToken) {
    try {
      const decoded = verifyToken(accessToken);
      authenticatedUserId = decoded.userId;
      logger.info(`Access token valid for path: ${request.nextUrl.pathname}`, {
        context: "Middleware",
        userId: authenticatedUserId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(
        `Invalid or expired access token for path: ${request.nextUrl.pathname}: ${message}`,
        { context: "Middleware" },
      );
    }
  }

  // If no valid access token, try refresh token
  const refreshTokenCookie = request.cookies.get("refreshToken")?.value;
  if (!authenticatedUserId && refreshTokenCookie) {
    try {
      const decodedRefreshToken = verifyRefreshToken(refreshTokenCookie);
      const storedRefreshToken = await getRefreshToken(
        refreshTokenCookie,
        decodedRefreshToken.userId,
      );

      if (
        storedRefreshToken &&
        storedRefreshToken.userId === decodedRefreshToken.userId
      ) {
        logger.info(
          `Valid refresh token found for userId: ${decodedRefreshToken.userId} for path: ${request.nextUrl.pathname}`,
          { context: "Middleware", userId: decodedRefreshToken.userId },
        );

        await revokeRefreshToken(refreshTokenCookie); // Revoke old refresh token
        const newAccessToken = generateAccessToken(decodedRefreshToken.userId);
        const newRefreshToken = generateRefreshToken(
          decodedRefreshToken.userId,
        );

        const newRefreshTokenExpiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );
        await createRefreshToken(
          decodedRefreshToken.userId,
          newRefreshToken,
          newRefreshTokenExpiresAt,
        );

        authenticatedUserId = decodedRefreshToken.userId;

        const response = NextResponse.next();
        response.headers.set("Authorization", `Bearer ${newAccessToken}`);
        response.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
        response.headers.set(X_USER_ID_HEADER, authenticatedUserId);
        return response;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `Refresh token validation failed in middleware for path: ${request.nextUrl.pathname}: ${message}`,
        { context: "Middleware", error: message },
      );
    }
  }

  // --- Start of new redirection logic for authenticated users ---

  // T004, T005: Redirect authenticated users from /auth/login and /auth/register to /dashboard
  if (authenticatedUserId) {
    if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
      logger.info(
        `Authenticated user ${authenticatedUserId} attempted to access ${request.nextUrl.pathname}, redirecting to /dashboard`,
        { context: "Middleware", userId: authenticatedUserId },
      );
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect authenticated users accessing "/" to "/dashboard"
    if (request.nextUrl.pathname === "/") {
      logger.info(
        `Authenticated user ${authenticatedUserId} accessed root path, redirecting to /dashboard`,
        { context: "Middleware", userId: authenticatedUserId },
      );
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // T006: If dashboard is "unavailable" (proxy can't identify authenticated user for dashboard request)
    // This scenario implies a protected route like /dashboard expects authenticatedUserId to be present
    // but due to some error in the proxy's authentication flow, it's null.
    // However, the current flow establishes authenticatedUserId early.
    // A more direct interpretation of T006 based on clarification: If an authenticated user
    // is trying to access /dashboard, but for some reason the authenticatedUserId is null *at this point*
    // it signifies an issue with dashboard availability from the proxy's perspective.
    // The previous logic ensures authenticatedUserId is set if tokens are valid.
    // Therefore, if authenticatedUserId is null *here*, it means they are not genuinely authenticated for this request.
    // The most robust check is at the route level.
    // For proxy.ts, if authenticatedUserId is null, the user will be redirected to /auth/login.
    // To implement T006 for `proxy.ts`, I'll assume it means a scenario where a user *should* be authenticated
    // for dashboard, but an internal proxy error made authenticatedUserId null when trying to access /dashboard.
    // This is currently covered by the final unauthenticated redirect.

    // A more suitable interpretation for T006 in proxy.ts is if the target is /dashboard and authenticatedUserId is NULL
    // due to internal proxy error (e.g. token expired, refresh failed for some reason before this point),
    // then instead of redirecting to login, redirect to a generic error page.
    // But given the current flow, if authenticatedUserId is null, they're simply unauthenticated.
    // The only way to fulfill T006 within proxy.ts capabilities as specified is to ensure
    // that if an *authenticated* user (authenticatedUserId is not null) attempts to access /dashboard,
    // and for some reason the dashboard itself were known to be unavailable *at this stage*,
    // which proxy.ts currently cannot know, we'd redirect.
    //
    // The best place to address T006, within the `proxy.ts` scope,
    // is to ensure that if a request *intends* to proceed to a protected route (like dashboard),
    // and `authenticatedUserId` is *still* null, we redirect to a specific error.
    // This is already broadly covered by the unauthenticated redirect below.
    //
    // To specifically fulfill T006 *within proxy.ts* as per the clarification,
    // I need to consider a scenario where `authenticatedUserId` *should* be present,
    // but isn't for a dashboard-bound request. This is currently handled by the general
    // unauthenticated redirect.
    //
    // The most direct way to interpret T006 in `proxy.ts` given its current state and other redirects,
    // is to catch requests *to dashboard* where authentication might have failed *specifically*.
    // However, this is hard to distinguish from a regular unauthenticated access.
    //
    // I'll make a pragmatic choice: If an authenticated user's session has somehow become invalid
    // while trying to access a protected route (e.g., `/dashboard`), and the proxy couldn't refresh it,
    // instead of redirecting to `/auth/login`, we redirect to a more generic error to signify
    // a deeper issue with the session or dashboard availability from the backend perspective.
    // This condition would essentially catch "authenticated" users whose session is internally broken
    // by the time they hit the dashboard route in the proxy.
  }

  // Check for broken session: if user tried to access /dashboard with a refresh token cookie,
  // but authentication failed, it's a broken session (redirect to error)
  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !authenticatedUserId
  ) {
    const hasRefreshTokenCookie = request.cookies.get("refreshToken")?.value;
    if (hasRefreshTokenCookie) {
      logger.warn(
        `Attempt to access dashboard without valid authentication after token checks for path: ${request.nextUrl.pathname}, redirecting to error page.`,
        { context: "Middleware" },
      );
      return NextResponse.redirect(
        new URL("/error?code=dashboard-unavailable", request.url),
      );
    }
  }

  // --- End of new redirection logic for authenticated users ---

  // Original public path check, allow if no specific authenticated redirect happened
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If authenticatedUserId is still null, means unauthenticated
  if (authenticatedUserId) {
    const response = NextResponse.next();
    response.headers.set(X_USER_ID_HEADER, authenticatedUserId); // Set custom header for already authenticated user
    return response;
  } else {
    // No valid access or refresh token, redirect to login
    logger.info(
      `Redirecting to login for unauthenticated access to path: ${request.nextUrl.pathname}`,
      { context: "Middleware" },
    );
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("refreshToken");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Apply middleware to all routes except static files and images
};
