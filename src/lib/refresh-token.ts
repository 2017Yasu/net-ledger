import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { hashRefreshToken } from "./auth"; // Import the hashing utility

export async function createRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  const hashedToken = await hashRefreshToken(token);
  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId: userId,
      expiresAt: expiresAt,
    },
  });
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const hashedToken = await hashRefreshToken(token); // Hash the incoming token to find it
  await prisma.refreshToken.updateMany({
    where: {
      token: hashedToken,
      isRevoked: false, // Only revoke if not already revoked
    },
    data: {
      isRevoked: true,
    },
  });
}

export async function getRefreshToken(
  token: string,
): Promise<Prisma.RefreshTokenGetPayload<any> | null> {
  const hashedToken = await hashRefreshToken(token);
  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      token: hashedToken,
      isRevoked: false,
      expiresAt: {
        gt: new Date(), // Ensure it's not expired
      },
    },
  });
  return refreshToken;
}
