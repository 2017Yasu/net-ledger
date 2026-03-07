import { NextRequest } from "next/server";
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
import { X_USER_ID_HEADER } from "./lib/server-auth";

// Define public paths that don't require authentication
const publicPagePaths = ["/auth/login", "/auth/register"];
const publicApiPaths = ["/api/auth/login", "/api/auth/register"];

export async function proxy(request: NextRequest) {
  // Initialize authenticatedUserId early to determine user status
  let authenticatedUserId: string | null = null;
  const nextResponse =
    publicPagePaths.some((path) => request.nextUrl.pathname.startsWith(path)) ||
    request.nextUrl.pathname === "/"
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();

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

      // Validate that the refresh token from the cookie matches the stored token for the user
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

        nextResponse.headers.set("Authorization", `Bearer ${newAccessToken}`);
        nextResponse.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `Refresh token validation failed in middleware for path: ${request.nextUrl.pathname}: ${message}`,
        { context: "Middleware", error: message },
      );
    }
  }

  // Redirect authenticated users from /auth/login and /auth/register to /dashboard
  if (authenticatedUserId) {
    logger.info(
      `Authenticated user ${authenticatedUserId} accessed path: ${request.nextUrl.pathname}`,
      { context: "Middleware", userId: authenticatedUserId },
    );
    nextResponse.headers.set(X_USER_ID_HEADER, authenticatedUserId);
    return nextResponse;
  }

  // Original public path check, allow if no specific authenticated redirect happened
  if (
    publicPagePaths.some((path) => request.nextUrl.pathname.startsWith(path)) ||
    publicApiPaths.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    return nextResponse;
  }

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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Apply middleware to all routes except static files and images
};
