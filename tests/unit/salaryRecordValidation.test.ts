import { Prisma } from "@prisma/client";

import { validateSalaryRecordData } from "@/lib/validation";

describe("SalaryRecord Validation", () => {
  it("should return no errors for valid data", () => {
    const validData = {
      month: 1,
      year: 2023,
      baseSalary: new Prisma.Decimal(1000),
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
      attendanceDays: 20,
      overtimeAllowance: new Prisma.Decimal(100),
    };
    const errors = validateSalaryRecordData(validData);
    expect(errors).toEqual([]);
  });

  it("should return errors for missing required fields", () => {
    const data = {
      month: 1,
      year: 2023,
      baseSalary: new Prisma.Decimal(1000),
      // missing grossEarnings and netPay
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toContain(
      "Missing required fields: month, year, baseSalary, grossEarnings, netPay.",
    );
    expect(errors.length).toBe(1); // Only one message for all missing fields
  });

  it("should return errors for invalid month", () => {
    const data = {
      month: 0, // Invalid
      year: 2023,
      baseSalary: new Prisma.Decimal(1000),
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toContain("Month must be between 1 and 12.");
  });

  it("should return errors for invalid year", () => {
    const data = {
      month: 1,
      year: 1899, // Invalid
      baseSalary: new Prisma.Decimal(1000),
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toContain("Year must be a valid year (e.g., 1900-2100).");
  });

  it("should return errors for negative decimal fields", () => {
    const data = {
      month: 1,
      year: 2023,
      baseSalary: new Prisma.Decimal(-100), // Invalid
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
      overtimeAllowance: new Prisma.Decimal(-50), // Invalid
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toContain("baseSalary cannot be negative.");
    expect(errors).toContain("overtimeAllowance cannot be negative.");
  });

  it("should return errors for negative float fields", () => {
    const data = {
      month: 1,
      year: 2023,
      baseSalary: new Prisma.Decimal(1000),
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
      attendanceDays: -5, // Invalid
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toContain("attendanceDays cannot be negative.");
  });

  it("should handle undefined optional fields without errors", () => {
    const data = {
      month: 1,
      year: 2023,
      baseSalary: new Prisma.Decimal(1000),
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
      // All other optional fields are undefined
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toEqual([]);
  });

  it("should handle null optional fields without errors if they are allowed to be null", () => {
    const data = {
      month: 1,
      year: 2023,
      baseSalary: new Prisma.Decimal(1000),
      grossEarnings: new Prisma.Decimal(1200),
      netPay: new Prisma.Decimal(800),
      overtimeAllowance: null,
      paidTimeOffDaysUsed: null,
    };
    const errors = validateSalaryRecordData(data);
    expect(errors).toEqual([]);
  });
});
