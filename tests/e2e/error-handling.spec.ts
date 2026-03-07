import { expect,test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("should show the error page for a server-side error", async ({
    page,
  }) => {
    // This route is designed to fail for testing purposes.
    // You would need to create a test-only page route that throws an error.
    await page.goto("/test/error");
    await expect(page.locator("h1")).toHaveText("Internal Server Error");
  });

  test("should return JSON for an API error", async ({ request }) => {
    const response = await request.get("/api/test/error");
    expect(response.status()).toBe(500);
    const json = await response.json();
    expect(json).toHaveProperty("error", "Internal Server Error");
  });

  test("should show the not-found page for a 404 error", async ({ page }) => {
    await page.goto("/a-page-that-does-not-exist");
    // Assuming you have a not-found page with this text
    await expect(page.locator("h1")).toHaveText("Page Not Found");
  });
});

// To make this test pass, you would need to create:
// 1. A page at `src/app/test/error/page.tsx` that throws an error.
// 2. An API route at `src/app/api/test/error/route.ts` that returns a 500 error.
// 3. A `not-found.tsx` file in `src/app`.
