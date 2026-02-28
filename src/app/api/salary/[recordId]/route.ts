import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { validateSalaryRecordData } from "@/lib/validation"; // Import the new validation utility

interface RouteParams {
  recordId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  try {
    const { recordId } = await context.params; // Await params here

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!recordId) {
      return NextResponse.json(
        { message: "Record ID is required" },
        { status: 400 },
      );
    }

    const salaryRecord = await prisma.salaryRecord.findUnique({
      where: {
        id: recordId,
      },
    });

    if (!salaryRecord) {
      return NextResponse.json(
        { message: "Salary record not found" },
        { status: 404 },
      );
    }

    if (salaryRecord.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(salaryRecord, { status: 200 });
  } catch (error) {
    console.error("Error fetching salary record:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  try {
    const { recordId } = await context.params; // Await params here

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!recordId) {
      return NextResponse.json(
        { message: "Record ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const validationErrors = validateSalaryRecordData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { message: validationErrors.join(" ") },
        { status: 400 },
      );
    }

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

    // Check if the record exists and belongs to the user
    const existingRecord = await prisma.salaryRecord.findUnique({
      where: {
        id: recordId,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { message: "Salary record not found" },
        { status: 404 },
      );
    }

    if (existingRecord.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedRecord = await prisma.salaryRecord.update({
      where: {
        id: recordId,
      },
      data: {
        month,
        year,
        attendanceDays,
        daysWorked,
        regularOvertimeHours,
        lateNightOvertimeHours,
        workingHours,
        baseSalary:
          baseSalary !== undefined ? new Prisma.Decimal(baseSalary) : undefined,
        overtimeAllowance:
          overtimeAllowance !== undefined
            ? new Prisma.Decimal(overtimeAllowance)
            : undefined,
        commutingAllowance:
          commutingAllowance !== undefined
            ? new Prisma.Decimal(commutingAllowance)
            : undefined,
        otherAllowances:
          otherAllowances !== undefined
            ? new Prisma.Decimal(otherAllowances)
            : undefined,
        grossEarnings:
          grossEarnings !== undefined
            ? new Prisma.Decimal(grossEarnings)
            : undefined,
        socialInsuranceContributions:
          socialInsuranceContributions !== undefined
            ? new Prisma.Decimal(socialInsuranceContributions)
            : undefined,
        taxableAmount:
          taxableAmount !== undefined
            ? new Prisma.Decimal(taxableAmount)
            : undefined,
        incomeTax:
          incomeTax !== undefined ? new Prisma.Decimal(incomeTax) : undefined,
        residentTax:
          residentTax !== undefined
            ? new Prisma.Decimal(residentTax)
            : undefined,
        otherTaxes:
          otherTaxes !== undefined ? new Prisma.Decimal(otherTaxes) : undefined,
        totalDeductions:
          totalDeductions !== undefined
            ? new Prisma.Decimal(totalDeductions)
            : undefined,
        netPay: netPay !== undefined ? new Prisma.Decimal(netPay) : undefined,
        yearEndTaxAdjustment:
          yearEndTaxAdjustment !== undefined
            ? new Prisma.Decimal(yearEndTaxAdjustment)
            : undefined,
        paidTimeOffDaysUsed,
        paidTimeOffDaysRemaining,
      },
    });

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error("Error updating salary record:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Prisma Unique constraint violation
      return NextResponse.json(
        { message: "A salary record for this month and year already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  try {
    const { recordId } = await context.params; // Await params here

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!recordId) {
      return NextResponse.json(
        { message: "Record ID is required" },
        { status: 400 },
      );
    }

    // Check if the record exists and belongs to the user
    const existingRecord = await prisma.salaryRecord.findUnique({
      where: {
        id: recordId,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { message: "Salary record not found" },
        { status: 404 },
      );
    }

    if (existingRecord.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.salaryRecord.delete({
      where: {
        id: recordId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting salary record:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
