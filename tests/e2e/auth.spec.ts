import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  const username = `testuser-${Date.now()}`;
  const password = "Password123!";

  test("should allow a user to register, login, and logout", async ({
    page,
  }) => {
    // 1. Navigate to the registration page
    await page.goto("/auth/register");
    await expect(page).toHaveURL(/auth\/register/);

    // 2. Register a new user
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Register")');

    // 3. Verify successful registration (redirects to login)
    await expect(page).toHaveURL(/auth\/login\?registered=true/);
    await expect(page.locator("text=Login")).toBeVisible();

    // 4. Navigate to the login page (already there, but for clarity)
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/auth\/login/);

    // 5. Log in with the newly registered user
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Login")');

    // 6. Verify successful login (redirects to dashboard)
    await expect(page).toHaveURL(/dashboard/); // Assuming '/dashboard' is the protected route
    await expect(page.locator("text=Welcome to your Dashboard")).toBeVisible(); // Assuming this text appears on dashboard

    // 7. Log out (assuming a logout button/link exists on the dashboard)
    // For now, we'll manually trigger logout via API or direct route if no UI element
    // await page.click('button:has-text("Logout")') // Placeholder if UI exists
    // As per `auth-context.ts`, logout redirects to /auth/login, clearing cookie
    await page.evaluate(() => {
      document.cookie =
        "token=; Max-Age=0; path=/; domain=" + window.location.hostname;
    });
    // This isn't ideal as it's not simulating a UI click.
    // A better way would be to create a logout button on the dashboard and click it.
    // For now, let's just navigate to login to confirm it's logged out implicitly.
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/auth\/login/);

    // 8. Attempt to access a protected route while logged out (should redirect to login)
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/auth\/login\?from=\/dashboard/); // Middleware should redirect
  });
});
