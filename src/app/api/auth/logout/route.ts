import { NextRequest, NextResponse } from "next/server";

import { verifyRefreshToken } from "@/lib/auth";
import { logger } from "@/lib/logger"; // Import the logger
import { getRefreshToken, revokeRefreshToken } from "@/lib/refresh-token";

export async function POST(request: NextRequest) {
  try {
    const refreshTokenCookie = request.cookies.get("refreshToken")?.value;

    if (!refreshTokenCookie) {
      logger.info("Logout attempt with no refresh token cookie present", {
        context: "Auth/Logout",
      });
      return NextResponse.json(
        { message: "No refresh token found" },
        { status: 204 },
      );
    }

    let decodedRefreshToken;
    try {
      decodedRefreshToken = verifyRefreshToken(refreshTokenCookie);
    } catch (error: unknown) {
      logger.warn(
        `Logout attempt with invalid refresh token signature: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
        { context: "Auth/Logout" },
      );
      const response = NextResponse.json(
        { message: "Logout successful" },
        { status: 204 },
      );
      response.cookies.delete("refreshToken");
      return response;
    }

    const storedRefreshToken = await getRefreshToken(
      refreshTokenCookie,
      decodedRefreshToken.userId,
    );

    if (
      storedRefreshToken &&
      storedRefreshToken.userId === decodedRefreshToken.userId
    ) {
      await revokeRefreshToken(refreshTokenCookie);
      logger.info(
        `User successfully logged out for userId: ${decodedRefreshToken.userId}`,
        { context: "Auth/Logout", userId: decodedRefreshToken.userId },
      );
    } else {
      logger.warn(
        `Logout attempt for non-existent or revoked token for userId: ${decodedRefreshToken.userId}`,
        { context: "Auth/Logout", userId: decodedRefreshToken.userId },
      );
    }

    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 204 },
    );
    response.cookies.delete("refreshToken");
    return response;
  } catch (error: unknown) {
    logger.error(
      `Logout error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      {
        context: "Auth/Logout",
        error: error instanceof Error ? error.message : "Unknown error type",
      },
    );
    return NextResponse.json(
      { message: "Something went wrong during logout" },
      { status: 500 },
    );
  }
}
