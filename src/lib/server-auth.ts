import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest } from "next/server";

import { verifyToken } from "./auth";

const X_USER_ID_HEADER = "X-User-Id"; // Define custom header constant

/**
 * Extracts and verifies the access token, returning the userId if valid.
 * This function is intended for server-side use.
 * It checks for the X-User-Id header, then the access token in cookies, or Authorization header.
 *
 * @param source The NextRequest object or an object containing ReadonlyRequestCookies.
 * @returns The userId if the user is authenticated, otherwise null.
 */
export function getUserIdFromRequest(
  source: NextRequest | { cookies: ReadonlyRequestCookies },
): string | null {
  // 1. Check for X-User-Id header first (set by our proxy after successful auth)
  if (source instanceof NextRequest) {
    const userIdFromHeader = source.headers.get(X_USER_ID_HEADER);
    if (userIdFromHeader) {
      return userIdFromHeader;
    }
  }

  // 2. If no X-User-Id header, try to extract from token in cookies or Authorization header
  let token: string | undefined;

  if (source instanceof NextRequest) {
    token =
      source.cookies.get("token")?.value ||
      source.headers.get("Authorization")?.split(" ")[1];
  } else {
    // For ReadonlyRequestCookies object, only check 'token' cookie
    token = source.cookies.get("token")?.value;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);
    return decoded.userId;
  } catch (error) {
    console.error("Error verifying token in server-auth:", error);
    return null;
  }
}
