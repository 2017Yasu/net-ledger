import { Prisma, SalaryRecord } from "@prisma/client";

export function validateSalaryRecordData(data: Partial<SalaryRecord>) {
  const errors: string[] = [];

  if (
    !data.month ||
    !data.year ||
    data.baseSalary === undefined ||
    data.grossEarnings === undefined ||
    data.netPay === undefined
  ) {
    errors.push(
      "Missing required fields: month, year, baseSalary, grossEarnings, netPay.",
    );
  }
  if (data.month !== undefined && (data.month < 1 || data.month > 12)) {
    errors.push("Month must be between 1 and 12.");
  }
  if (data.year !== undefined && (data.year < 1900 || data.year > 2100)) {
    // Arbitrary but reasonable year range
    errors.push("Year must be a valid year (e.g., 1900-2100).");
  }

  // Validate non-negative values for Decimal fields
  const decimalFields: (keyof SalaryRecord)[] = [
    "baseSalary",
    "overtimeAllowance",
    "commutingAllowance",
    "otherAllowances",
    "grossEarnings",
    "socialInsuranceContributions",
    "taxableAmount",
    "incomeTax",
    "residentTax",
    "otherTaxes",
    "totalDeductions",
    "netPay",
    "yearEndTaxAdjustment",
  ];
  decimalFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && !(value instanceof Date)) {
      const decimalValue = new Prisma.Decimal(value);
      if (decimalValue.lessThan(0)) {
        errors.push(`${String(field)} cannot be negative.`);
      }
    }
  });

  // Validate non-negative values for Float fields
  const floatFields: (keyof SalaryRecord)[] = [
    "attendanceDays",
    "daysWorked",
    "regularOvertimeHours",
    "lateNightOvertimeHours",
    "workingHours",
    "paidTimeOffDaysUsed",
    "paidTimeOffDaysRemaining",
  ];
  floatFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && (value as number) < 0) {
      errors.push(`${String(field)} cannot be negative.`);
    }
  });

  return errors;
}
