import { proxy } from "@/proxy";
import { NextRequest, NextResponse } from "next/server";
import {
  verifyRefreshToken,
  verifyToken,
} from "@/lib/auth";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "@/lib/refresh-token";
import { logger } from "@/lib/logger";

// Mock external dependencies
jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn((url: URL) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = new Response(null, { status: 307 }) as any;
      Object.defineProperty(response, "url", {
        value: url.toString(),
        writable: true,
      });
      response.headers = new Headers();
      response.cookies = {
        delete: jest.fn(),
        set: jest.fn(),
        has: jest.fn(),
        get: jest.fn(),
        getAll: jest.fn(),
      };
      return response;
    }),
  },
  NextRequest: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  generateAccessToken: jest.fn(() => "mock-access-token"),
  generateRefreshToken: jest.fn(() => "mock-refresh-token"),
}));

jest.mock("@/lib/refresh-token", () => ({
  createRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock process.env for JWT secrets
process.env.JWT_SECRET = "test_jwt_secret";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";

describe("Proxy (Middleware) Redirection Logic", () => {
  let mockRequest: Partial<NextRequest>;
  let mockResponse: Partial<NextResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mockRequest
    mockRequest = {
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        getAll: jest.fn(),
        clear: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };

    mockResponse = {
      headers: new Headers(),
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        getAll: jest.fn(),
      },
    };

    (NextResponse.next as jest.Mock).mockReturnValue(mockResponse);
    (NextResponse.redirect as jest.Mock).mockImplementation((url: URL) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any = {
        status: 307,
        headers: new Headers(),
        url: url.toString(),
        cookies: {
          get: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
          has: jest.fn(),
          getAll: jest.fn(),
        },
      };
      return resp;
    });

    (NextRequest as jest.Mock).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(input.toString());
        return {
          url: url.toString(),
          nextUrl: url,
          headers: new Headers(init?.headers),
          cookies: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            ...mockRequest?.cookies, // Merge any specific cookie mocks
          },
          ...jest.requireActual("next/server").NextRequest, // Spread actual NextRequest properties
        } as unknown as NextRequest; // Cast as NextRequest
      },
    );
  });

  // Helper to create a mock NextRequest for a given path and authentication state
  const createTestRequest = (
    pathname: string,
    isAuthenticated: boolean,
    hasRefreshToken: boolean = false,
    isRefreshTokenValid: boolean = false,
    accessToken?: string,
  ): NextRequest => {
    const url = new URL(`http://localhost${pathname}`);
    const headers = new Headers();
    const cookies = new Map<string, { value: string }>();

    // If authenticated, ensure we have a token to send
    if (isAuthenticated && !accessToken) {
      accessToken = "mock-access-token";
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (hasRefreshToken) {
      cookies.set("refreshToken", { value: "mock-refresh-token-value" });
    }

    (verifyToken as jest.Mock).mockClear();
    (verifyRefreshToken as jest.Mock).mockClear();
    (getRefreshToken as jest.Mock).mockClear();

    if (isAuthenticated) {
      (verifyToken as jest.Mock).mockReturnValue({ userId: "user-id-123" });
    } else {
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid Token");
      });
    }

    if (hasRefreshToken && isRefreshTokenValid) {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-id-123",
      });
      (getRefreshToken as jest.Mock).mockResolvedValue({
        userId: "user-id-123",
      });
      (createRefreshToken as jest.Mock).mockResolvedValue(true);
      (revokeRefreshToken as jest.Mock).mockResolvedValue(true);
    } else if (hasRefreshToken && !isRefreshTokenValid) {
      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid Refresh Token");
      });
    }

    const req = new NextRequest(url, { headers }) as NextRequest;
    // Manually set cookies map for the mock request
    req.cookies.get = ((name: string) => {
      const cookie = cookies.get(name);
      return cookie ? { name, value: cookie.value } : undefined;
    }) as unknown as (name: string) => { name: string; value: string } | undefined;

    return req;
  };

  it("should redirect authenticated users from /auth/login to /dashboard", async () => {
    const request = createTestRequest("/auth/login", true); // Authenticated
    const response = await proxy(request);

    expect(response.url).toBe("http://localhost/dashboard");
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Authenticated user user-id-123 attempted to access /auth/login, redirecting to /dashboard",
      ),
      expect.any(Object),
    );
  });

  it("should redirect authenticated users from /auth/register to /dashboard", async () => {
    const request = createTestRequest("/auth/register", true); // Authenticated
    const response = await proxy(request);

    expect(response.url).toBe("http://localhost/dashboard");
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Authenticated user user-id-123 attempted to access /auth/register, redirecting to /dashboard",
      ),
      expect.any(Object),
    );
  });

  it("should redirect unauthenticated users accessing protected routes to /auth/login", async () => {
    const request = createTestRequest("/dashboard", false); // Unauthenticated
    const response = await proxy(request);

    expect(response.url).toBe(
      "http://localhost/auth/login?redirectTo=%2Fdashboard",
    );
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Redirecting to login for unauthenticated access to path: /dashboard",
      ),
      expect.any(Object),
    );
  });

  it("should redirect unauthenticated users accessing / to /auth/login", async () => {
    const request = createTestRequest("/", false); // Unauthenticated
    const response = await proxy(request);

    expect(response.url).toBe("http://localhost/auth/login?redirectTo=%2F");
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
  });

  it("should redirect authenticated users accessing / to /dashboard", async () => {
    const request = createTestRequest("/", true); // Authenticated
    const response = await proxy(request);

    expect(response.url).toBe("http://localhost/dashboard");
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
  });

  it("should allow public paths for unauthenticated users", async () => {
    const request = createTestRequest("/api/auth/login", false); // Unauthenticated, public API
    const response = await proxy(request);

    expect(NextResponse.next).toHaveBeenCalledTimes(1);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(response).toBe(mockResponse); // Should return the same mock response from NextResponse.next()
  });

  it("should redirect to /error?code=dashboard-unavailable if authenticatedUserId is null when accessing /dashboard (simulating broken session)", async () => {
    // Simulate a scenario where verifyToken and verifyRefreshToken fail, leading to authenticatedUserId being null
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("Expired token");
    });
    (verifyRefreshToken as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid refresh token");
    });
    (getRefreshToken as jest.Mock).mockResolvedValue(null); // Ensure refresh token check also fails

    const request = createTestRequest(
      "/dashboard",
      false, // Initially assume not authenticated via access token
      true, // Has refresh token
      false, // Refresh token is invalid
      "expired-access-token", // Has expired access token
    );
    const response = await proxy(request);

    expect(response.url).toBe(
      "http://localhost/error?code=dashboard-unavailable",
    );
    expect(NextResponse.redirect).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Attempt to access dashboard without valid authentication after token checks for path: /dashboard, redirecting to error page.",
      ),
      expect.any(Object),
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "Refresh token validation failed in middleware for path: /dashboard: Invalid Refresh Token",
      ),
      expect.any(Object),
    );
  });
});
