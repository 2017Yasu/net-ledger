import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { Decimal } from "@prisma/client/runtime/library";
import { validateSalaryRecordData } from "@/lib/validation"; // Import the new validation utility

export async function GET(
  request: Request,
  { params }: { params: { recordId: string } },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { recordId } = params;
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
  request: Request,
  { params }: { params: { recordId: string } },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { recordId } = params;
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
          baseSalary !== undefined ? new Decimal(baseSalary) : undefined,
        overtimeAllowance:
          overtimeAllowance !== undefined
            ? new Decimal(overtimeAllowance)
            : undefined,
        commutingAllowance:
          commutingAllowance !== undefined
            ? new Decimal(commutingAllowance)
            : undefined,
        otherAllowances:
          otherAllowances !== undefined
            ? new Decimal(otherAllowances)
            : undefined,
        grossEarnings:
          grossEarnings !== undefined ? new Decimal(grossEarnings) : undefined,
        socialInsuranceContributions:
          socialInsuranceContributions !== undefined
            ? new Decimal(socialInsuranceContributions)
            : undefined,
        taxableAmount:
          taxableAmount !== undefined ? new Decimal(taxableAmount) : undefined,
        incomeTax: incomeTax !== undefined ? new Decimal(incomeTax) : undefined,
        residentTax:
          residentTax !== undefined ? new Decimal(residentTax) : undefined,
        otherTaxes:
          otherTaxes !== undefined ? new Decimal(otherTaxes) : undefined,
        totalDeductions:
          totalDeductions !== undefined
            ? new Decimal(totalDeductions)
            : undefined,
        netPay: netPay !== undefined ? new Decimal(netPay) : undefined,
        yearEndTaxAdjustment:
          yearEndTaxAdjustment !== undefined
            ? new Decimal(yearEndTaxAdjustment)
            : undefined,
        paidTimeOffDaysUsed,
        paidTimeOffDaysRemaining,
      },
    });

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error("Error updating salary record:", error);
    if (error.code === "P2002") {
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
  request: Request,
  { params }: { params: { recordId: string } },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { recordId } = params;
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
