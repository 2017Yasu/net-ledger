import { SalaryRecord } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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
  const decimalFields = [
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
    if (data[field] !== undefined && data[field] !== null) {
      const value = new Decimal(data[field]);
      if (value.lessThan(0)) {
        errors.push(`${field} cannot be negative.`);
      }
    }
  });

  // Validate non-negative values for Float fields
  const floatFields = [
    "attendanceDays",
    "daysWorked",
    "regularOvertimeHours",
    "lateNightOvertimeHours",
    "workingHours",
    "paidTimeOffDaysUsed",
    "paidTimeOffDaysRemaining",
  ];
  floatFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && data[field] < 0) {
      errors.push(`${field} cannot be negative.`);
    }
  });

  return errors;
}
