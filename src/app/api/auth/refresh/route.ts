import { NextRequest, NextResponse } from "next/server";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "@/lib/refresh-token";
import { LoginResponse } from "@/lib/types/auth";
import { ApiErrorResponse } from "@/lib/types/common";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<LoginResponse | ApiErrorResponse>> {
  try {
    const refreshTokenCookie = request.cookies.get("refreshToken")?.value;

    if (!refreshTokenCookie) {
      logger.warn("Refresh token request missing refresh token cookie", {
        context: "Auth/Refresh",
      });
      return NextResponse.json(
        { message: "Refresh token missing" },
        { status: 403 },
      );
    }

    let decodedRefreshToken;
    try {
      decodedRefreshToken = verifyRefreshToken(refreshTokenCookie);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(
        `Invalid refresh token signature for token: ${refreshTokenCookie} - ${message}`,
        { context: "Auth/Refresh" },
      );
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 },
      );
    }

    const storedRefreshToken = await getRefreshToken(
      refreshTokenCookie,
      decodedRefreshToken.userId,
    );

    if (
      !storedRefreshToken ||
      storedRefreshToken.userId !== decodedRefreshToken.userId
    ) {
      logger.warn(
        `Refresh token reuse attempt or invalid token for userId: ${decodedRefreshToken.userId}`,
        { context: "Auth/Refresh", userId: decodedRefreshToken.userId },
      );
      if (decodedRefreshToken.userId) {
        // Invalidate all refresh tokens for this user for security
        await prisma.refreshToken.updateMany({
          where: { userId: decodedRefreshToken.userId },
          data: { isRevoked: true },
        });
        logger.info(
          `Invalidated all refresh tokens for userId: ${decodedRefreshToken.userId} due to suspicious activity`,
          { context: "Auth/Refresh", userId: decodedRefreshToken.userId },
        );
      }
      return NextResponse.json(
        { message: "Invalid or revoked refresh token" },
        { status: 403 },
      );
    }

    await revokeRefreshToken(refreshTokenCookie); // Revoke the old refresh token
    logger.info(
      `Old refresh token revoked for userId: ${decodedRefreshToken.userId}`,
      { context: "Auth/Refresh", userId: decodedRefreshToken.userId },
    );

    const user = await prisma.user.findUnique({
      where: { id: decodedRefreshToken.userId },
    });

    if (!user) {
      logger.warn(
        `Refresh token used for non-existent userId: ${decodedRefreshToken.userId}`,
        { context: "Auth/Refresh", userId: decodedRefreshToken.userId },
      );
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const newAccessToken = generateAccessToken(decodedRefreshToken.userId);
    const newRefreshToken = generateRefreshToken(decodedRefreshToken.userId);

    const newRefreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    await createRefreshToken(
      decodedRefreshToken.userId,
      newRefreshToken,
      newRefreshTokenExpiresAt,
    );
    logger.info(
      `New refresh token created for userId: ${decodedRefreshToken.userId}`,
      { context: "Auth/Refresh", userId: decodedRefreshToken.userId },
    );

    const response = NextResponse.json(
      { accessToken: newAccessToken, user },
      { status: 200 },
    );

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    logger.info(
      `Access token refreshed successfully for userId: ${decodedRefreshToken.userId}`,
      { context: "Auth/Refresh", userId: decodedRefreshToken.userId },
    );
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Token refresh error: ${message}`, {
      context: "Auth/Refresh",
      error: message,
    });
    return NextResponse.json(
      { message: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
