import {
  hashPassword,
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  verifyToken, // This is now verifyAccessToken
  verifyRefreshToken,
  hashRefreshToken,
  compareHashedRefreshTokens,
} from "@/lib/auth";
import jwt from "jsonwebtoken";

// JWT_SECRET is set in jest.setup.ts globally
const TEST_JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const TEST_REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret";

describe("Auth Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "mySecretPassword";
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe("comparePasswords", () => {
    it("should return true for matching passwords", async () => {
      const password = "mySecretPassword";
      const hashedPassword = await hashPassword(password);
      const match = await comparePasswords(password, hashedPassword);
      expect(match).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      const password = "mySecretPassword";
      const wrongPassword = "wrongPassword";
      const hashedPassword = await hashPassword(password);
      const match = await comparePasswords(wrongPassword, hashedPassword);
      expect(match).toBe(false);
    });
  });

  describe("generateAccessToken", () => {
    it("should generate a valid access token", () => {
      const userId = "testUserId";
      const token = generateAccessToken(userId);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWTs have 3 parts
    });

    it("should contain the correct userId in the access token payload", () => {
      const userId = "testUserId";
      const token = generateAccessToken(userId);
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      expect(decoded.userId).toBe(userId);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const userId = "testUserId";
      const token = generateRefreshToken(userId);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWTs have 3 parts
    });

    it("should contain the correct userId in the refresh token payload", () => {
      const userId = "testUserId";
      const token = generateRefreshToken(userId);
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      expect(decoded.userId).toBe(userId);
    });
  });

  describe("verifyToken (Access Token)", () => {
    it("should successfully verify a valid access token", () => {
      const userId = "testUserId";
      const token = generateAccessToken(userId);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
    });

    it("should throw an error for an invalid access token", () => {
      const invalidToken = "invalid.jwt.token";
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it("should throw an error for an expired access token", () => {
      const userId = "testUserId";
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const trulyExpiredToken = jwt.sign(
        { userId, exp: pastTime },
        TEST_JWT_SECRET,
      );

      expect(() => verifyToken(trulyExpiredToken)).toThrow(
        jwt.TokenExpiredError,
      );
    });
  });

  describe("verifyRefreshToken", () => {
    it("should successfully verify a valid refresh token", () => {
      const userId = "testUserId";
      const token = generateRefreshToken(userId);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(userId);
    });

    it("should throw an error for an invalid refresh token", () => {
      const invalidToken = "invalid.jwt.refresh.token";
      expect(() => verifyRefreshToken(invalidToken)).toThrow();
    });

    it("should throw an error for an expired refresh token", () => {
      const userId = "testUserId";
      const pastTime = Math.floor(Date.now() / 1000) - 7 * 24 * 3600; // 7 days ago
      const trulyExpiredRefreshToken = jwt.sign(
        { userId, exp: pastTime },
        TEST_REFRESH_TOKEN_SECRET,
      );

      expect(() => verifyRefreshToken(trulyExpiredRefreshToken)).toThrow(
        jwt.TokenExpiredError,
      );
    });
  });

  describe("hashRefreshToken", () => {
    it("should hash a refresh token successfully", async () => {
      const token = "mySecretRefreshToken";
      const hashedToken = await hashRefreshToken(token);
      expect(hashedToken).toBeDefined();
      expect(hashedToken).not.toEqual(token);
      expect(hashedToken.length).toBeGreaterThan(0);
    });
  });

  describe("compareHashedRefreshTokens", () => {
    it("should return true for matching refresh tokens", async () => {
      const token = "mySecretRefreshToken";
      const hashedToken = await hashRefreshToken(token);
      const match = await compareHashedRefreshTokens(token, hashedToken);
      expect(match).toBe(true);
    });

    it("should return false for non-matching refresh tokens", async () => {
      const token = "mySecretRefreshToken";
      const wrongToken = "wrongRefreshToken";
      const hashedToken = await hashRefreshToken(token);
      const match = await compareHashedRefreshTokens(wrongToken, hashedToken);
      expect(match).toBe(false);
    });
  });
});
