import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth"; // Updated imports
import { createRefreshToken } from "@/lib/refresh-token"; // Import createRefreshToken
import { logger } from "@/lib/logger"; // Import logger for consistency
import { LoginResponse } from "@/lib/types/auth";
import { ApiErrorResponse } from "@/lib/types/common";

export async function POST(
  request: Request,
): Promise<NextResponse<LoginResponse | ApiErrorResponse>> {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      logger.warn("Registration attempt with missing username or password", {
        context: "Auth/Register",
      });
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      logger.warn(`Registration attempt with existing username: ${username}`, {
        context: "Auth/Register",
      });
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Calculate refresh token expiration (e.g., 7 days from now)
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 days in milliseconds

    // Store refresh token in the database
    await createRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);

    // Return user data without password hash
    const userResponse = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response = NextResponse.json(
      { accessToken, user: userResponse },
      { status: 201 },
    );

    // Set refresh token as an HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    logger.info(`User registered successfully: ${user.username}`, {
      context: "Auth/Register",
      userId: user.id,
    });
    return response;
  } catch (error: unknown) {
    logger.error(
      `Registration error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
      {
        context: "Auth/Register",
        error: error instanceof Error ? error.message : "Unknown error type",
      },
    );
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
