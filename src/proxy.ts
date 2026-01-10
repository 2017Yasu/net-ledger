import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

// Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

export async function proxy(request: NextRequest) {
  // Define public paths that don't require authentication
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/api/auth/login",
    "/api/auth/register",
  ];

  // If accessing a public path, allow it
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  const refreshTokenCookie = request.cookies.get("refreshToken")?.value;

  // Option 1: Valid access token is present
  if (accessToken) {
    try {
      verifyToken(accessToken);
      logger.info(`Access token valid for path: ${request.nextUrl.pathname}`, {
        context: "Middleware",
      });
      return NextResponse.next();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(
        `Invalid or expired access token for path: ${request.nextUrl.pathname}: ${message}`,
        { context: "Middleware" }
      );
      // Access token invalid/expired, proceed to check refresh token
    }
  }

  // Option 2: No valid access token, check for refresh token
  if (refreshTokenCookie) {
    try {
      const decodedRefreshToken = verifyRefreshToken(refreshTokenCookie);
      const storedRefreshToken = await getRefreshToken(refreshTokenCookie, decodedRefreshToken.userId);

      if (
        storedRefreshToken &&
        storedRefreshToken.userId === decodedRefreshToken.userId
      ) {
        logger.info(
          `Valid refresh token found for userId: ${decodedRefreshToken.userId} for path: ${request.nextUrl.pathname}`,
          { context: "Middleware", userId: decodedRefreshToken.userId }
        );

        await revokeRefreshToken(refreshTokenCookie); // Revoke old refresh token
        logger.info(
          `Old refresh token revoked for userId: ${decodedRefreshToken.userId} in middleware`,
          { context: "Middleware", userId: decodedRefreshToken.userId }
        );

        const newAccessToken = generateAccessToken(decodedRefreshToken.userId);
        const newRefreshToken = generateRefreshToken(
          decodedRefreshToken.userId
        );

        const newRefreshTokenExpiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        );
        await createRefreshToken(
          decodedRefreshToken.userId,
          newRefreshToken,
          newRefreshTokenExpiresAt
        );
        logger.info(
          `New access and refresh token generated for userId: ${decodedRefreshToken.userId} in middleware`,
          { context: "Middleware", userId: decodedRefreshToken.userId }
        );

        const response = NextResponse.next();
        response.headers.set("Authorization", `Bearer ${newAccessToken}`);
        response.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      } else {
        logger.warn(
          `Refresh token not found in DB or user mismatch for path: ${request.nextUrl.pathname}`,
          { context: "Middleware", userId: decodedRefreshToken?.userId }
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `Refresh token validation failed in middleware for path: ${request.nextUrl.pathname}: ${message}`,
        { context: "Middleware", error: message }
      );
      // Fall through to redirect to login
    }
  }

  // No valid access or refresh token, redirect to login
  logger.info(
    `Redirecting to login for unauthenticated access to path: ${request.nextUrl.pathname}`,
    { context: "Middleware" }
  );
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("refreshToken");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Apply middleware to all routes except static files and images
};
