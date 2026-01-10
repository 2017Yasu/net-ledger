import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { Decimal } from "@prisma/client/runtime/library";
import { validateSalaryRecordData } from "@/lib/validation"; // Import the new validation utility

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      month,
      year,
      attendanceDays,
      daysWorked,
      regularOvertimeHours,
      lateNightOvertimeHours,
      workingHours,
      baseSalary,
      overtimeAllowance,
      commutingAllowance,
      otherAllowances,
      grossEarnings,
      socialInsuranceContributions,
      taxableAmount,
      incomeTax,
      residentTax,
      otherTaxes,
      totalDeductions,
      netPay,
      yearEndTaxAdjustment,
      paidTimeOffDaysUsed,
      paidTimeOffDaysRemaining,
    } = body;

    const validationErrors = validateSalaryRecordData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { message: validationErrors.join(" ") },
        { status: 400 },
      );
    }

    // Check if a salary record already exists for the given month and year for this user
    const existingRecord = await prisma.salaryRecord.findFirst({
      where: {
        userId,
        month,
        year,
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          message:
            "Salary record for this month and year already exists. Please update the existing record.",
        },
        { status: 409 },
      );
    }

    const salaryRecord = await prisma.salaryRecord.create({
      data: {
        userId,
        month,
        year,
        attendanceDays,
        daysWorked,
        regularOvertimeHours,
        lateNightOvertimeHours,
        workingHours,
        baseSalary: new Decimal(baseSalary),
        overtimeAllowance: overtimeAllowance
          ? new Decimal(overtimeAllowance)
          : null,
        commutingAllowance: commutingAllowance
          ? new Decimal(commutingAllowance)
          : null,
        otherAllowances: otherAllowances ? new Decimal(otherAllowances) : null,
        grossEarnings: new Decimal(grossEarnings),
        socialInsuranceContributions: socialInsuranceContributions
          ? new Decimal(socialInsuranceContributions)
          : null,
        taxableAmount: taxableAmount ? new Decimal(taxableAmount) : null,
        incomeTax: incomeTax ? new Decimal(incomeTax) : null,
        residentTax: residentTax ? new Decimal(residentTax) : null,
        otherTaxes: otherTaxes ? new Decimal(otherTaxes) : null,
        totalDeductions: totalDeductions ? new Decimal(totalDeductions) : null,
        netPay: new Decimal(netPay),
        yearEndTaxAdjustment: yearEndTaxAdjustment
          ? new Decimal(yearEndTaxAdjustment)
          : null,
        paidTimeOffDaysUsed,
        paidTimeOffDaysRemaining,
      },
    });

    return NextResponse.json(salaryRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating salary record:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

interface SalaryWhereClause {
  userId: string;
  month?: number;
  year?: number;
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: SalaryWhereClause = { userId };
    if (month) {
      where.month = parseInt(month, 10);
    }
    if (year) {
      where.year = parseInt(year, 10);
    }

    const salaryRecords = await prisma.salaryRecord.findMany({
      where,
      orderBy: {
        year: "desc",
      },
    });

    if (!salaryRecords || salaryRecords.length === 0) {
      return NextResponse.json(
        { message: "No salary records found" },
        { status: 404 },
      );
    }

    return NextResponse.json(salaryRecords, { status: 200 });
  } catch (error) {
    console.error("Error fetching salary records:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
