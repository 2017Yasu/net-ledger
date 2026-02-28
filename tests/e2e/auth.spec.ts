import { expect, test } from "@playwright/test";

test.describe("Authentication Flow Redirection", () => {
  const username = `testuser-${Date.now()}`; // Unique username for each test run
  const password = "Password123!";

  test.beforeAll(async ({ request }) => {
    // Register user once before all tests in this describe block
    // This is an API call so it's not subject to redirection rules like UI navigation
    await request.post("/api/auth/register", {
      data: {
        username: username,
        password: password,
        confirmPassword: password,
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    // Ensure we start from a clean state (logged out) for each test
    await page.context().clearCookies();
    // Navigate to a non-protected page to ensure no lingering state
    await page.goto("/");
  });

  test("T010: should allow a user to login and redirect to dashboard", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Login")');

    // Verify successful login and dashboard redirection
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome to your Dashboard")).toBeVisible();
  });

  test("T011: should redirect authenticated users from /auth/login and /auth/register to /dashboard", async ({
    page,
  }) => {
    // First, log in the user
    await page.goto("/auth/login");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("/dashboard"); // Ensure logged in

    // Attempt to access /auth/login
    await page.goto("/auth/login");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome to your Dashboard")).toBeVisible();

    // Attempt to access /auth/register
    await page.goto("/auth/register");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome to your Dashboard")).toBeVisible();
  });

  test("should redirect unauthenticated users from protected routes to /auth/login", async ({
    page,
  }) => {
    // Ensure user is logged out (handled by beforeEach clearCookies)
    await page.goto("/dashboard"); // Attempt to access protected route
    // Expect redirection to login with redirectTo param
    await expect(page).toHaveURL(/auth\/login\?redirectTo=\/dashboard/);
  });

  test("T012: should redirect to /error?code=dashboard-unavailable if authenticated user's session is broken when accessing /dashboard", async ({
    page,
  }) => {
    // 1. Log in normally to get valid tokens
    await page.goto("/auth/login");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("/dashboard");

    // 2. Invalidate refresh token cookie to simulate a broken session
    //    proxy.ts logic for T006 depends on `authenticatedUserId` being null when accessing /dashboard
    //    after all token checks fail (including refresh).
    //    Clearing cookies ensures no refresh token is sent, forcing the proxy to determine `authenticatedUserId` as null.
    await page.context().clearCookies();

    // 3. Attempt to access dashboard again with a broken session
    await page.goto("/dashboard");

    // Expect redirection to the dashboard unavailable error page
    await expect(page).toHaveURL(/error\?code=dashboard-unavailable/);
  });

  test("should handle / route redirection for authenticated users", async ({
    page,
  }) => {
    // First, log in the user
    await page.goto("/auth/login");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("/dashboard"); // Ensure logged in

    // Navigate to the root route
    await page.goto("/");
    // Expect redirection to /dashboard
    await expect(page).toHaveURL("/dashboard");
  });
});
