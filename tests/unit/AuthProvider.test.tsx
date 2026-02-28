import { act, render, screen } from "@testing-library/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

import { AuthProvider } from "@/components/AuthProvider";
import { AuthContext } from "@/lib/auth-context";

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock apiClient and axios for refresh token logic
jest.mock("@/lib/api-client");
import { apiClient, authTokenStore } from "@/lib/api-client";

// Setup the mock implementation
(authTokenStore.get as jest.Mock) = jest.fn(() => null);
(authTokenStore.set as jest.Mock) = jest.fn();

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  post: jest.fn(() => Promise.reject(new Error("Refresh failed"))), // Default to refresh failed
}));

describe("AuthProvider", () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    jest.clearAllMocks();
  });

  it("should redirect to /dashboard after successful login if no redirectTo is provided", async () => {
    const TestComponent = () => {
      const context = useContext(AuthContext);
      return (
        <button
          onClick={() =>
            context?.login("test-token", { id: "1", username: "test" })
          }
        >
          Login
        </button>
      );
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    const loginButton = screen.getByRole("button", { name: "Login" });
    await act(async () => {
      loginButton.click();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should redirect to the specified redirectTo path after successful login", async () => {
    const TestComponent = () => {
      const context = useContext(AuthContext);
      return (
        <button
          onClick={() =>
            context?.login(
              "test-token",
              { id: "1", username: "test" },
              "/protected",
            )
          }
        >
          Login
        </button>
      );
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    const loginButton = screen.getByRole("button", { name: "Login" });
    await act(async () => {
      loginButton.click();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/protected");
  });

  it("should redirect to /auth/login after logout", async () => {
    // Simulate being logged in initially
    (authTokenStore.get as jest.Mock).mockReturnValue("initial-token");
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: {
        accessToken: "refreshed-token",
        user: { id: "1", username: "test" },
      },
    });

    const TestComponent = () => {
      const context = useContext(AuthContext);
      // Simulate login for this test to ensure logout works from an authenticated state
      useEffect(() => {
        context?.login("initial-token", { id: "1", username: "test" });
      }, [context]);
      return <button onClick={() => context?.logout()}>Logout</button>;
    };

    const { getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Ensure initial push from login is cleared
    mockPush.mockClear();

    const logoutButton = getByRole("button", { name: "Logout" });
    await act(async () => {
      logoutButton.click();
    });

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/logout");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});
