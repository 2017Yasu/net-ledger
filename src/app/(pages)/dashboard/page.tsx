"use client";

import { Alert, Box, CircularProgress, Container, Divider, Typography } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import SalarySummaryCard from "@/components/SalarySummaryCard";
import SalaryTrendChart from "@/components/SalaryTrendChart";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { logger } from "@/lib/logger";
import { ApiErrorResponse } from "@/lib/types/common";

interface FormattedSalaryRecord {
  month: number;
  year: number;
  grossEarnings: number;
}

const DashboardPage = () => {
  const { accessToken, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestSalaryRecord, setLatestSalaryRecord] = useState<any | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<FormattedSalaryRecord[]>([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!accessToken && !loading) {
      router.push("/auth/login?redirectTo=/dashboard");
    }
  }, [accessToken, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<any[]>("/api/salary");
        const records = response.data;

        if (records && records.length > 0) {
          // Sort to find the latest record (by year and then month desc)
          const sortedRecords = [...records].sort((a, b) =>
            b.year - a.year || b.month - a.month
          );
          setLatestSalaryRecord(sortedRecords[0]);

          // Filter for last 12 months for history
          const today = new Date();
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

          const historyData = records
            .filter((record) => {
              const recordDate = new Date(record.year, record.month - 1, 1);
              return recordDate >= twelveMonthsAgo;
            })
            .map((record) => ({
              month: record.month,
              year: record.year,
              grossEarnings: typeof record.grossEarnings === 'string' ? parseFloat(record.grossEarnings) : Number(record.grossEarnings),
            }));

          setSalaryHistory(historyData);
          logger.info("Dashboard data fetched successfully", { context: "DashboardPage", userId: user?.id });
        } else {
          logger.info("No salary records found for user", { context: "DashboardPage", userId: user?.id });
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            // 404 is returned when no records are found, which is a valid state
            setLatestSalaryRecord(null);
            setSalaryHistory([]);
          } else {
            const data = err.response?.data as ApiErrorResponse;
            setError(data?.message || "Failed to fetch dashboard data.");
            logger.error("Error fetching dashboard data", { context: "DashboardPage", error: data?.message });
          }
        } else {
          setError("An unexpected error occurred.");
          logger.error("Error fetching dashboard data", { context: "DashboardPage", error: String(err) });
        }
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchDashboardData();
    } else {
      // If no access token, we stop loading (redirection handled by other useEffect)
      setLoading(false);
    }
  }, [accessToken, user?.id]);

  if (!accessToken && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading dashboard data...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Welcome to your Dashboard, {user?.username || "authenticated user"}!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {latestSalaryRecord ? (
          <SalarySummaryCard
            grossPay={typeof latestSalaryRecord.grossEarnings === 'string' ? parseFloat(latestSalaryRecord.grossEarnings) : Number(latestSalaryRecord.grossEarnings)}
            netPay={typeof latestSalaryRecord.netPay === 'string' ? parseFloat(latestSalaryRecord.netPay) : Number(latestSalaryRecord.netPay)}
            payDate={
              new Date(
                latestSalaryRecord.year,
                latestSalaryRecord.month - 1,
                1,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            }
          />
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            No salary records found. Please record your salary to see a summary.
          </Alert>
        )}

        <Divider sx={{ my: 4 }} />

        <SalaryTrendChart salaryData={salaryHistory} />
      </Box>
    </Container>
  );
};

export default DashboardPage;
