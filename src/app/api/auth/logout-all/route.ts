import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger"; // Import the logger
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth"; // Utility to get userId from access token

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request); // Get userId from access token
    if (!userId) {
      logger.warn("Logout from all devices attempt by unauthenticated user", {
        context: "Auth/LogoutAll",
      });
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Revoke all refresh tokens for this user in the database
    await prisma.refreshToken.updateMany({
      where: { userId: userId, isRevoked: false },
      data: { isRevoked: true },
    });

    logger.info(`User ${userId} logged out from all devices successfully`, {
      context: "Auth/LogoutAll",
      userId: userId,
    });

    const response = NextResponse.json(
      { message: "Logged out from all devices" },
      { status: 200 },
    );
    response.cookies.delete("refreshToken"); // Clear the refresh token cookie
    return response;
  } catch (error: unknown) {
    logger.error(
      `Logout from all devices error for userId: ${getUserIdFromRequest(request) || "unknown"}: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      {
        context: "Auth/LogoutAll",
        error: error instanceof Error ? error.message : "Unknown error type",
        userId: getUserIdFromRequest(request) || "unknown",
      },
    );
    return NextResponse.json(
      { message: "Something went wrong during logout from all devices" },
      { status: 500 },
    );
  }
}
