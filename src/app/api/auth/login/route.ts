import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { createRefreshToken } from "@/lib/refresh-token";
import { logger } from "@/lib/logger";
import { authRateLimiter, AuthRateLimitOptions } from "@/lib/rate-limiter";
import { LoginResponse } from "@/lib/types/auth";
import { ApiErrorResponse } from "@/lib/types/common";

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse | ApiErrorResponse>> {
  // Changed Request to NextRequest
  // Apply rate limiting
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  try {
    authRateLimiter.checkNext(request, 5); // 5 requests per minute
  } catch {
    logger.warn(`Rate limit exceeded for login attempt from IP: ${ip}`, {
      context: "Auth/RateLimit",
    });
    const retryAfter = AuthRateLimitOptions.interval / 1000;
    return NextResponse.json(
      {
        message: `Too many requests. Please try again after ${retryAfter} seconds.`,
      },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      logger.warn("Login attempt with missing username or password", {
        context: "Auth",
      });
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      logger.warn(
        `Login attempt with invalid credentials for username: ${username}`,
        { context: "Auth" }
      );
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await comparePasswords(password, user.passwordHash);

    if (!passwordMatch) {
      logger.warn(
        `Login attempt with invalid credentials for username: ${username}`,
        { context: "Auth" }
      );
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await createRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);

    const userResponse = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response = NextResponse.json(
      { accessToken, user: userResponse },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    logger.info(`User logged in successfully: ${user.username}`, {
      context: "Auth",
      userId: user.id,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Login error: ${message}`, {
      context: "Auth",
      error: message,
    });
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
