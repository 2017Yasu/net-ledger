import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

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
      Decimal: Decimal, // Expose Decimal here
    },
  };
});

// Mock JWT_SECRET for testing
process.env.JWT_SECRET = "test_secret_for_integration";

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

      const mockRequest = {
        json: async () => ({ username: "testuser", password: "password123" }),
      } as Request;

      const response = await registerPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ username: "testuser" }),
        }),
      );
      expect(data).toHaveProperty("token");
      expect(data.user.username).toBe("testuser");
    });

    it("should return 409 if username already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
      });

      const mockRequest = {
        json: async () => ({ username: "testuser", password: "password123" }),
      } as Request;

      const response = await registerPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe("Username already taken");
    });

    it("should return 400 if username or password are missing", async () => {
      const mockRequest = {
        json: async () => ({ username: "testuser" }),
      } as Request;

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

      const mockRequest = {
        json: async () => ({ username: "testuser", password: password }),
      } as Request;

      const response = await loginPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("token");
      expect(data.user.username).toBe("testuser");
    });

    it("should return 401 for invalid credentials (user not found)", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const mockRequest = {
        json: async () => ({
          username: "nonexistent",
          password: "password123",
        }),
      } as Request;

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

      const mockRequest = {
        json: async () => ({ username: "testuser", password: "wrongpassword" }),
      } as Request;

      const response = await loginPOST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe("Invalid credentials");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return 204 for successful logout", async () => {
      const response = await logoutPOST();

      expect(response.status).toBe(204);
    });
  });
});
