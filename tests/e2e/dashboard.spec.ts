// tests/e2e/dashboard.spec.ts
import { expect, test } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test("should redirect to dashboard after login and display salary summary and chart", async ({
    page,
  }) => {
    // 1. Arrange: Navigate to login page and log in a user
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "testuser@example.com"); // Replace with a valid test user email
    await page.fill('input[name="password"]', "password123"); // Replace with a valid test user password
    await page.click('button[type="submit"]');

    // 2. Act: After successful login, verify redirection to dashboard
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");

    // 3. Assert: Verify the presence of the salary summary card and chart
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Latest Salary Summary")).toBeVisible();
    await expect(page.getByText(/Gross Pay: \$\d+\.\d{2}/)).toBeVisible();
    await expect(page.getByText(/Net Pay: \$\d+\.\d{2}/)).toBeVisible();
    await expect(
      page.getByText(
        /Pay Date: (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/,
      ),
    ).toBeVisible();

    // Assert: Verify the presence of the salary trend chart
    await expect(page.getByText("Salary Trend (Last 12 Months)")).toBeVisible();
    // Further assertions could be added here to check chart elements if needed,
    // but for now, checking the title is sufficient for visibility.
  });

  test("should display message when no salary records are found", async ({
    page,
  }) => {
    // This test assumes a user with no salary records can be logged in
    // For a real scenario, you might need to set up a specific test user or mock the API response
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', "nosalaryuser@example.com"); // Replace with a user without salary records
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");

    await expect(
      page.getByText(
        "No salary records found. Please record your salary to see a summary.",
      ),
    ).toBeVisible();
    // Ensure chart is not visible or shows its own "no data" message
    await expect(page.getByText("Salary Trend (Last 12 Months)")).toBeVisible(); // The chart component will render, but display its own "no data" message
    await expect(
      page.getByText(
        "No salary data available for the last 12 months to display trend.",
      ),
    ).toBeVisible();
  });
});
