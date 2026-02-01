import { NextRequest } from "next/server";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"; // Import ReadonlyRequestCookies
import { verifyToken } from "./auth";

/**
 * Extracts and verifies the access token, returning the userId if valid.
 * This function is intended for server-side use.
 * It checks for the access token in the provided cookies or a NextRequest object's cookies/Authorization header.
 *
 * @param source The NextRequest object or a ReadonlyRequestCookies object.
 * @returns The userId if the access token is valid, otherwise null.
 */
export function getUserIdFromRequest(
  source: NextRequest | { cookies: ReadonlyRequestCookies },
): string | null {
  let token: string | undefined;

  if (source instanceof NextRequest) {
    token =
      source.cookies.get("token")?.value ||
      source.headers.get("Authorization")?.split(" ")[1];
  } else {
    token = source.cookies.get("token")?.value;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token); // verifyToken now verifies access tokens
    return decoded.userId;
  } catch (error) {
    console.error("Error verifying token in server-auth:", error);
    return null;
  }
}
