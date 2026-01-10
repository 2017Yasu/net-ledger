import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth"; // Utility to get userId from access token
import { logger } from "@/lib/logger"; // Import the logger

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
  } catch (error: any) {
    logger.error(
      `Logout from all devices error for userId: ${getUserIdFromRequest(request) || "unknown"}: ${error.message}`,
      {
        context: "Auth/LogoutAll",
        error: error.message,
        userId: getUserIdFromRequest(request) || "unknown",
      },
    );
    return NextResponse.json(
      { message: "Something went wrong during logout from all devices" },
      { status: 500 },
    );
  }
}
