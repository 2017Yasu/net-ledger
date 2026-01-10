import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth"; // Remove generateAccessToken
import { NextRequest } from "next/server";
// Remove import jwt from "jsonwebtoken";

// Mock prisma client
jest.mock("@/lib/prisma", () => {
  const { Decimal } = jest.requireActual("@prisma/client/runtime/library"); // Use actual Decimal for type, or mock it fully if needed
  return {
    __esModule: true, // This is important for ESM modules
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      // Keep other models if they exist and are used in auth tests
      refreshToken: {
        // Add refreshToken mock
        create: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
      },
      Decimal: Decimal, // Expose Decimal here
    },
  };
});

// Mock JWT_SECRET for testing
process.env.JWT_SECRET = "test_secret_for_integration";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret_for_integration"; // Mock refresh token secret

// Helper to create a mock NextRequest
const createMockRequest = (
  method: string,
  body?: Record<string, unknown>,
  token?: string, // This will be for Authorization header
  refreshTokenCookie?: string, // This will be for refresh token cookie
  urlPath?: string,
): NextRequest => {
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (body) {
    headers.set("Content-Type", "application/json");
  }

  const cookies = {
    get: (name: string) => {
      if (name === "refreshToken" && refreshTokenCookie) {
        return { value: refreshTokenCookie, name: "refreshToken" };
      }
      return undefined;
    },
    delete: jest.fn(),
    set: jest.fn(),
  };

  return {
    method: method,
    headers: headers,
    json: async () => body,
    cookies: cookies,
    url: `http://localhost${urlPath || "/api/auth/login"}`,
    nextUrl: new URL(`http://localhost${urlPath || "/api/auth/login"}`),
  } as unknown as NextRequest; // Cast to unknown then NextRequest to satisfy TS
};

describe("Auth API Integration Tests", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-uuid-123",
        username: "testuser",
        passwordHash: "hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const mockRequest = createMockRequest(
        "POST",
        { username: "testuser", password: "password123" },
        undefined,
        undefined,
        "/api/auth/register",
      );

      const response = await registerPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ username: "testuser" }),
        }),
      );
      expect(data).toHaveProperty("accessToken"); // Changed from 'token'
      expect(data.user.username).toBe("testuser");
      expect(response.cookies.set).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(String),
        expect.any(Object),
      );
    });

    it("should return 409 if username already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
      });

      const mockRequest = createMockRequest(
        "POST",
        { username: "testuser", password: "password123" },
        undefined,
        undefined,
        "/api/auth/register",
      );

      const response = await registerPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe("Username already taken");
    });

    it("should return 400 if username or password are missing", async () => {
      const mockRequest = createMockRequest(
        "POST",
        { username: "testuser" },
        undefined,
        undefined,
        "/api/auth/register",
      );

      const response = await registerPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe("Username and password are required");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in a user successfully", async () => {
      const password = "password123";
      const hashedPassword = await hashPassword(password);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-uuid-123",
        username: "testuser",
        passwordHash: hashedPassword,
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const mockRequest = createMockRequest(
        "POST",
        { username: "testuser", password: password },
        undefined,
        undefined,
        "/api/auth/login",
      );

      const response = await loginPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("accessToken"); // Changed from 'token'
      expect(data.user.username).toBe("testuser");
      expect(response.cookies.set).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(String),
        expect.any(Object),
      );
    });

    it("should return 401 for invalid credentials (user not found)", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockRequest = createMockRequest(
        "POST",
        { username: "nonexistent", password: "password123" },
        undefined,
        undefined,
        "/api/auth/login",
      );

      const response = await loginPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe("Invalid credentials");
    });

    it("should return 401 for invalid credentials (wrong password)", async () => {
      const password = "password123";
      const hashedPassword = await hashPassword(password);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-uuid-123",
        username: "testuser",
        passwordHash: hashedPassword,
      });

      const mockRequest = createMockRequest(
        "POST",
        { username: "testuser", password: "wrongpassword" },
        undefined,
        undefined,
        "/api/auth/login",
      );

      const response = await loginPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe("Invalid credentials");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return 204 for successful logout", async () => {
      // Mock verifyRefreshToken to decode successfully
      jest.mock("@/lib/auth", () => ({
        ...jest.requireActual("@/lib/auth"),
        verifyRefreshToken: jest.fn(() => ({ userId: "user-uuid-123" })),
      }));
      // Mock getRefreshToken to return a valid token
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        userId: "user-uuid-123",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Not expired
      });
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const mockRequest = createMockRequest(
        "POST",
        {},
        undefined,
        "mockRefreshTokenValue", // Simulate refresh token cookie
        "/api/auth/logout",
      );
      const response = await logoutPOST(mockRequest);

      expect(response.status).toBe(204);
      expect(mockRequest.cookies.delete).toHaveBeenCalledWith("refreshToken");
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: expect.any(String), isRevoked: false },
        data: { isRevoked: true },
      });
    });

    it("should return 204 even if no refresh token cookie is present", async () => {
      const mockRequest = createMockRequest(
        "POST",
        {},
        undefined,
        undefined, // No refresh token cookie
        "/api/auth/logout",
      );
      const response = await logoutPOST(mockRequest);

      expect(response.status).toBe(204);
      expect(mockRequest.cookies.delete).not.toHaveBeenCalled(); // No cookie to delete
    });
  });
});
