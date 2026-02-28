/**
 * @jest-environment jsdom
 */
// tests/integration/dashboard.test.ts
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "@/app/(pages)/dashboard/page";
import prisma from "@/lib/prisma"; // Use the globally mocked prisma
import { getUserIdFromRequest } from "@/lib/server-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, SalaryRecord } from "@prisma/client"; // Import Prisma types
import { Prisma } from "@prisma/client";

jest.mock("@/lib/server-auth", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("redirect called");
  }),
}));

const mockGetUserIdFromRequest = getUserIdFromRequest as jest.Mock;
const mockCookies = cookies as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

describe("DashboardPage Integration", () => {
  const mockUser: User = {
    id: "user-123",
    username: "test@example.com", // Changed from email to username
    passwordHash: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset mocks on the global prisma client
    (prisma.salaryRecord.findFirst as jest.Mock).mockReset();
    (prisma.salaryRecord.findMany as jest.Mock).mockReset();
    (prisma.user.findUnique as jest.Mock).mockReset(); // Also reset user mock if used

    mockGetUserIdFromRequest.mockReset();
    mockCookies.mockReset();
    mockRedirect.mockReset();

    mockCookies.mockReturnValue({
      get: jest.fn(() => ({ value: "mock-token" })),
    });
  });

  it("redirects to login if user is not authenticated", async () => {
    mockGetUserIdFromRequest.mockReturnValueOnce(null);
    // Suppress console.error from next/navigation redirect in test output
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      await DashboardPage();
    } catch (e) {
      expect((e as Error).message).toBe("redirect called");
    }

    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
    consoleErrorSpy.mockRestore();
  });

  it("displays the latest salary record when available", async () => {
    mockGetUserIdFromRequest.mockReturnValueOnce(mockUser.id);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser); // Mock user for context
    const mockSalaryRecord: SalaryRecord = {
      userId: mockUser.id,
      month: 10,
      year: 2023,
      baseSalary: new Prisma.Decimal("5000"),
      grossEarnings: new Prisma.Decimal("5500"),
      netPay: new Prisma.Decimal("4500"),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add other required fields from Prisma schema as null or default values if they are optional
      attendanceDays: null,
      daysWorked: null,
      regularOvertimeHours: null,
      lateNightOvertimeHours: null,
      workingHours: null,
      overtimeAllowance: null,
      commutingAllowance: null,
      otherAllowances: null,
      socialInsuranceContributions: null,
      taxableAmount: null,
      incomeTax: null,
      residentTax: null,
      otherTaxes: null,
      totalDeductions: null,
      yearEndTaxAdjustment: null,
      paidTimeOffDaysUsed: null,
      paidTimeOffDaysRemaining: null,
      id: "salary-1", // Add id to mock record
    };
    (prisma.salaryRecord.findFirst as jest.Mock).mockResolvedValueOnce(
      mockSalaryRecord,
    );
    (prisma.salaryRecord.findMany as jest.Mock).mockResolvedValueOnce([]); // Mock findMany for the chart test

    render(await DashboardPage());

    await waitFor(() => {
      expect(screen.getByText("Latest Salary Summary")).toBeInTheDocument();
      expect(screen.getByText("Gross Pay: $5500.00")).toBeInTheDocument();
      expect(screen.getByText("Net Pay: $4500.00")).toBeInTheDocument();
      expect(screen.getByText("Pay Date: October 2023")).toBeInTheDocument();
    });
  });

  it("displays message when no salary records are found", async () => {
    mockGetUserIdFromRequest.mockReturnValueOnce(mockUser.id);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser); // Mock user for context
    (prisma.salaryRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.salaryRecord.findMany as jest.Mock).mockResolvedValueOnce([]); // Mock findMany for the chart test

    render(await DashboardPage());

    await waitFor(() => {
      expect(
        screen.getByText(
          "No salary records found. Please record your salary to see a summary.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders SalaryTrendChart with no data message when no history records are found", async () => {
    mockGetUserIdFromRequest.mockReturnValueOnce(mockUser.id);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser); // Mock user for context
    const mockSalaryRecord: SalaryRecord = {
      // Just need a valid record for findFirst
      id: "salary-latest",
      userId: mockUser.id,
      month: 12,
      year: 2023,
      baseSalary: new Prisma.Decimal("5000"),
      grossEarnings: new Prisma.Decimal("5500"),
      netPay: new Prisma.Decimal("4500"),
      createdAt: new Date(),
      updatedAt: new Date(),
      attendanceDays: null,
      daysWorked: null,
      regularOvertimeHours: null,
      lateNightOvertimeHours: null,
      workingHours: null,
      overtimeAllowance: null,
      commutingAllowance: null,
      otherAllowances: null,
      socialInsuranceContributions: null,
      taxableAmount: null,
      incomeTax: null,
      residentTax: null,
      otherTaxes: null,
      totalDeductions: null,
      yearEndTaxAdjustment: null,
      paidTimeOffDaysUsed: null,
      paidTimeOffDaysRemaining: null,
    };
    (prisma.salaryRecord.findFirst as jest.Mock).mockResolvedValueOnce(
      mockSalaryRecord,
    );
    (prisma.salaryRecord.findMany as jest.Mock).mockResolvedValueOnce([]); // No history records

    render(await DashboardPage());

    await waitFor(() => {
      expect(
        screen.getByText("Salary Trend (Last 12 Months)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "No salary data available for the last 12 months to display trend.",
        ),
      ).toBeInTheDocument();
    });
  });
});
