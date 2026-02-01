// tests/integration/dashboard.test.ts
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "@/app/(pages)/dashboard/page";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mockDeep, mockReset } from "jest-mock-extended";
import { User, SalaryRecord, PrismaClient, Decimal } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: mockDeep(),
}));

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

const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep> &
  PrismaClient;
const mockGetUserIdFromRequest = getUserIdFromRequest as jest.Mock;
const mockCookies = cookies as jest.Mock;
const mockRedirect = redirect as jest.Mock;

describe("DashboardPage Integration", () => {
  const mockUser: User = {
    id: "user-123",
    username: "test@example.com", // Changed from email to username
    passwordHash: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(mockPrisma);
    mockGetUserIdFromRequest.mockReset();
    mockCookies.mockReset();
    mockRedirect.mockReset();

    mockCookies.mockReturnValue({
      get: jest.fn(() => ({ value: "mock-token" })),
    });
  });

  it("redirects to login if user is not authenticated", async () => {
    mockGetUserIdFromRequest.mockReturnValueOnce(null);

    await DashboardPage();

    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });

  it("displays the latest salary record when available", async () => {
    mockGetUserIdFromRequest.mockReturnValueOnce(mockUser.id);
    const mockSalaryRecord: SalaryRecord = {
      userId: mockUser.id,
      month: 10,
      year: 2023,
      baseSalary: new Decimal(5000),
      grossEarnings: new Decimal(5500),
      netPay: new Decimal(4500),
      payDate: new Date("2023-10-26T00:00:00.000Z"),
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
    };
    (mockPrisma.salaryRecord.findFirst as any).mockResolvedValueOnce(
      mockSalaryRecord,
    );
    (mockPrisma.salaryRecord.findMany as any).mockResolvedValueOnce([]); // Mock findMany for the chart test

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
    (mockPrisma.salaryRecord.findFirst as any).mockResolvedValueOnce(null);
    (mockPrisma.salaryRecord.findMany as any).mockResolvedValueOnce([]); // Mock findMany for the chart test

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
    const mockSalaryRecord: SalaryRecord = {
      // Just need a valid record for findFirst
      id: "salary-latest",
      userId: mockUser.id,
      month: 12,
      year: 2023,
      baseSalary: new Decimal(5000),
      grossEarnings: new Decimal(5500),
      netPay: new Decimal(4500),
      payDate: new Date("2023-12-25T00:00:00.000Z"),
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
    (mockPrisma.salaryRecord.findFirst as any).mockResolvedValueOnce(
      mockSalaryRecord,
    );
    (mockPrisma.salaryRecord.findMany as any).mockResolvedValueOnce([]); // No history records

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
