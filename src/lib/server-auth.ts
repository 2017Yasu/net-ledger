import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

/**
 * Extracts and verifies the access token from a NextRequest, returning the userId if valid.
 * This function is intended for server-side use, typically within API routes, to authenticate requests.
 * It checks for the access token in the 'token' cookie or the 'Authorization' header.
 *
 * @param request The NextRequest object.
 * @returns The userId if the access token is valid, otherwise null.
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("Authorization")?.split(" ")[1];

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
