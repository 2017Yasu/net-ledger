-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "attendanceDays" DOUBLE PRECISION,
    "daysWorked" DOUBLE PRECISION,
    "regularOvertimeHours" DOUBLE PRECISION,
    "lateNightOvertimeHours" DOUBLE PRECISION,
    "workingHours" DOUBLE PRECISION,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "overtimeAllowance" DECIMAL(10,2),
    "commutingAllowance" DECIMAL(10,2),
    "otherAllowances" DECIMAL(10,2),
    "grossEarnings" DECIMAL(10,2) NOT NULL,
    "socialInsuranceContributions" DECIMAL(10,2),
    "taxableAmount" DECIMAL(10,2),
    "incomeTax" DECIMAL(10,2),
    "residentTax" DECIMAL(10,2),
    "otherTaxes" DECIMAL(10,2),
    "totalDeductions" DECIMAL(10,2),
    "netPay" DECIMAL(10,2) NOT NULL,
    "yearEndTaxAdjustment" DECIMAL(10,2),
    "paidTimeOffDaysUsed" DOUBLE PRECISION,
    "paidTimeOffDaysRemaining" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRecord_userId_month_year_key" ON "SalaryRecord"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "SalaryRecord" ADD CONSTRAINT "SalaryRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
