import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken } from "@/lib/auth";
import { revokeRefreshToken, getRefreshToken } from "@/lib/refresh-token";
import { logger } from "@/lib/logger"; // Import the logger

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
    } catch (error: any) {
      logger.warn(
        `Logout attempt with invalid refresh token signature: ${error.message}`,
        { context: "Auth/Logout" },
      );
      const response = NextResponse.json(
        { message: "Logout successful" },
        { status: 204 },
      );
      response.cookies.delete("refreshToken");
      return response;
    }

    const storedRefreshToken = await getRefreshToken(refreshTokenCookie);

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
  } catch (error: any) {
    logger.error(`Logout error: ${error.message}`, {
      context: "Auth/Logout",
      error: error.message,
    });
    return NextResponse.json(
      { message: "Something went wrong during logout" },
      { status: 500 },
    );
  }
}
