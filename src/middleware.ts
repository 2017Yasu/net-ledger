import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserIdFromRequest } from "./lib/server-auth";

export async function middleware(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  const path = request.nextUrl.pathname;

  // Redirect logged-in users from '/' to '/dashboard'
  if (userId && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"], // Apply middleware to these paths
};
