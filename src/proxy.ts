import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("Authorization")?.split(" ")[1];

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

  // If no token or token is invalid, redirect to login
  if (!token) {
    // Redirect to login, preserving the original request path as a query parameter
    return NextResponse.redirect(
      new URL(`/auth/login?from=${request.nextUrl.pathname}`, request.url),
    );
  }

  try {
    verifyToken(token);
    // If token is valid, continue to the requested page
    return NextResponse.next();
  } catch (error) {
    console.error("Invalid token:", error);
    // If token is invalid, redirect to login
    return NextResponse.redirect(
      new URL(`/auth/login?from=${request.nextUrl.pathname}`, request.url),
    );
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Apply middleware to all routes except API, static files, and images
};
