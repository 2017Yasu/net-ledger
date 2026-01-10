import { test, expect } from "@playwright/test";
import { generateAccessToken, hashPassword } from "@/lib/auth"; // Updated import
import prisma from "@/lib/prisma";

// Mock environment variables for JWT secret and expiry
process.env.JWT_SECRET = "test_secret_for_e2e";
process.env.JWT_EXPIRES_IN = "1h";

test.describe("Salary History and Detail Flow", () => {
  const username = `historyuser-${Date.now()}`;
  const password = "Password123!";
  let authToken: string;
  let testUserId: string;
  let createdRecordId: string;
  let createdRecordMonth: number;
  let createdRecordYear: number;
  let secondRecordId: string;
  let secondRecordMonth: number;
  let secondRecordYear: number;

  test.beforeAll(async () => {
    // Register a user for testing
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });
    testUserId = user.id;
    authToken = generateAccessToken(testUserId);

    // Create some initial salary records for the user via direct Prisma access
    const now = new Date();
    createdRecordMonth = now.getMonth() + 1;
    createdRecordYear = now.getFullYear();
    const firstRecord = await prisma.salaryRecord.create({
      data: {
        userId: testUserId,
        month: createdRecordMonth,
        year: createdRecordYear,
        baseSalary: 2500,
        grossEarnings: 3000,
        netPay: 2000,
      },
    });
    createdRecordId = firstRecord.id;

    secondRecordMonth = (createdRecordMonth % 12) + 1;
    secondRecordYear =
      createdRecordYear + (secondRecordMonth < createdRecordMonth ? 1 : 0);
    const secondRecord = await prisma.salaryRecord.create({
      data: {
        userId: testUserId,
        month: secondRecordMonth,
        year: secondRecordYear,
        baseSalary: 2800,
        grossEarnings: 3300,
        netPay: 2300,
      },
    });
    secondRecordId = secondRecord.id;
  });

  test.beforeEach(async ({ page }) => {
    // Log in the user by setting the cookie directly
    await page.goto("/"); // Go to any page to set cookie
    await page.context().addCookies([
      {
        name: "token",
        value: authToken,
        url: "http://localhost:3000",
        path: "/",
      },
    ]);
    await page.goto("/dashboard"); // Navigate to a protected page to verify login
    await expect(page).toHaveURL(/dashboard/); // Ensure redirection to dashboard after login
  });

  test("should display salary history and navigate to detail view", async ({
    page,
  }) => {
    // 1. Navigate to the "History" page
    await page.goto("/salary/history");
    await expect(
      page.locator("h1", { hasText: "Salary History" }),
    ).toBeVisible();

    // 2. Verify that all created records are displayed in the list
    await expect(
      page.locator(`text=${createdRecordMonth}/${createdRecordYear}`),
    ).toBeVisible();
    await expect(page.locator(`text=Net: $2000.00`)).toBeVisible();
    // Make sure the second record is also visible

    await expect(
      page.locator(`text=${secondRecordMonth}/${secondRecordYear}`),
    ).toBeVisible();

    // 3. Click on a specific record in the list and verify detail view
    await page.locator(`a[href="/salary/history/${createdRecordId}"]`).click();
    await expect(page).toHaveURL(`/salary/history/${createdRecordId}`);
    await expect(
      page.locator("h2", {
        hasText: `Salary Record for ${createdRecordMonth}/${createdRecordYear}`,
      }),
    ).toBeVisible();
    await expect(page.locator("text=Base Salary")).toBeVisible();
    await expect(page.locator("text=Net Pay")).toBeVisible();
    await expect(page.locator("text=$2000.00")).toBeVisible(); // Verify a value from the record
  });

  test("should allow user to edit a salary record", async ({ page }) => {
    await page.goto(`/salary/history/${createdRecordId}`);
    await expect(
      page.locator("h2", {
        hasText: `Salary Record for ${createdRecordMonth}/${createdRecordYear}`,
      }),
    ).toBeVisible();

    // Click edit button
    await page.click('button:has-text("Edit Record")');
    await expect(
      page.locator("h1", { hasText: "Edit Salary Record" }),
    ).toBeVisible();

    // Update a field
    const newBaseSalary = "2700";
    await page.fill('input[name="baseSalary"]', newBaseSalary);
    await page.click('button:has-text("Save Changes")');

    // Verify update successful
    await expect(
      page.locator("h2", {
        hasText: `Salary Record for ${createdRecordMonth}/${createdRecordYear}`,
      }),
    ).toBeVisible(); // Back to detail view
    await expect(page.locator(`text=$${newBaseSalary}.00`)).toBeVisible(); // Check updated value
  });

  test("should allow user to delete a salary record", async ({ page }) => {
    await page.goto("/salary/history");
    await expect(
      page.locator("h1", { hasText: "Salary History" }),
    ).toBeVisible();

    // Find the record to delete and click the delete button
    // The secondRecordId is guaranteed to exist and is distinct from createdRecordId
    const listItem = page
      .locator(`a[href="/salary/history/${secondRecordId}"]`)
      .locator("..");
    await listItem.locator('[aria-label="delete"]').click();

    // Confirm deletion in the alert dialog
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain(
        "Are you sure you want to delete this salary record?",
      );
      await dialog.accept();
    });

    // Verify the record is no longer visible
    await expect(
      page.locator(`text=${secondRecordMonth}/${secondRecordYear}`),
    ).not.toBeVisible();
    await expect(page.locator("text=Net: $2300.00")).not.toBeVisible();

    // Check that the first record is still there
    await expect(
      page.locator(`text=${createdRecordMonth}/${createdRecordYear}`),
    ).toBeVisible();
  });
});
