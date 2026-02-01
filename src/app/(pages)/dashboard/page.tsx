// src/app/(pages)/dashboard/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/server-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SalarySummaryCard from "@/components/SalarySummaryCard";
import SalaryTrendChart from "@/components/SalaryTrendChart";
import { logger } from "@/lib/logger"; // Import the logger

interface FormattedSalaryRecord {
  month: number;
  year: number;
  grossEarnings: number;
}

const DashboardPage = async () => {
  const cookieStore = await cookies();
  const userId = getUserIdFromRequest({ cookies: cookieStore });

  if (!userId) {
    logger.info("Unauthorized access to dashboard", {
      context: "DashboardPage",
      ip: cookieStore.get("ip")?.value,
    }); // Log unauthorized access
    redirect("/auth/login");
  }

  logger.info("User accessing dashboard", { context: "DashboardPage", userId }); // Log successful dashboard view

  let latestSalaryRecord = null;
  let salaryHistory: FormattedSalaryRecord[] = [];

  try {
    // Fetch latest salary record for SalarySummaryCard
    latestSalaryRecord = await prisma.salaryRecord.findFirst({
      where: { userId },
      orderBy: { year: "desc", month: "desc" },
    });

    if (!latestSalaryRecord) {
      logger.info("No latest salary record found for user", {
        context: "DashboardPage",
        userId,
      });
    }

    // Prepare data for SalarySummaryCard, handling cases where no record is found or fields are null
    // Values are directly used in SalarySummaryCard below

    // Fetch salary records for the last 12 months for SalaryTrendChart
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

    const rawSalaryHistory = await prisma.salaryRecord.findMany({
      where: {
        userId,
        // filter by year and month instead of payDate due to type issues
        // or filter after fetching if payDate filter is still problematic
        // For now, removing payDate from where clause
      },
      orderBy: { year: "asc", month: "asc" },
      select: {
        month: true,
        year: true,
        grossEarnings: true /* removed payDate: true */,
      },
    });

    // Client-side filtering if payDate filter was removed from Prisma query
    const filteredSalaryHistory = rawSalaryHistory.filter((record) => {
      const recordDate = new Date(record.year, record.month - 1, 1);
      return recordDate >= twelveMonthsAgo;
    });

    salaryHistory = filteredSalaryHistory.map((record) => ({
      month: record.month,
      year: record.year,
      grossEarnings: record.grossEarnings.toNumber(),
    }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error fetching dashboard data", {
        context: "DashboardPage",
        userId,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("Unknown error fetching dashboard data", {
        context: "DashboardPage",
        userId,
        error: String(error),
      });
    }
    // Depending on error handling strategy, you might want to display a user-friendly error message
    // or redirect to an error page here. For now, we'll let the component render with empty data.
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {latestSalaryRecord ? (
        <SalarySummaryCard
          grossPay={latestSalaryRecord.grossEarnings?.toNumber() || null}
          netPay={latestSalaryRecord.netPay?.toNumber() || null}
          payDate={
            latestSalaryRecord.month && latestSalaryRecord.year
              ? new Date(
                  latestSalaryRecord.year,
                  latestSalaryRecord.month - 1,
                  1,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })
              : null
          }
        />
      ) : (
        <p>
          No salary records found. Please record your salary to see a summary.
        </p>
      )}

      <hr />

      <SalaryTrendChart salaryData={salaryHistory} />
    </div>
  );
};

export default DashboardPage;
