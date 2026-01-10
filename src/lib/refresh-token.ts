import prisma from "@/lib/prisma";
import { compareHashedRefreshTokens, hashRefreshToken } from "./auth"; // Import the hashing utility

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
  userId: string,
): Promise<Awaited<ReturnType<typeof prisma.refreshToken.findUnique>> | null> {
  const refreshTokens = await prisma.refreshToken.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(), // Ensure it's not expired
      },
    },
  });
  for (const storedToken of refreshTokens) {
    if (await compareHashedRefreshTokens(token, storedToken.token)) {
      return storedToken;
    }
  }
  return null;
}
