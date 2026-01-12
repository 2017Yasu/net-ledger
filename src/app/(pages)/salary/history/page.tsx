"use client";

import { useEffect, useState } from "react";
import { Container, Typography, Box, Alert, Button } from "@mui/material";
import SalaryHistoryList from "@/components/SalaryHistoryList";
import { useAuth } from "@/lib/auth-context";
import { SalaryRecord } from "@prisma/client";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import axios from "axios";
import { ApiErrorResponse } from "@/lib/types/common";

export default function SalaryHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalaryRecords() {
      try {
        const response = await apiClient.get<SalaryRecord[]>("/api/salary");
        setSalaryRecords(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          const data = err.response.data as ApiErrorResponse;
          setError(data.message || "Failed to fetch salary records.");
          return;
        }
        setError("Network error or server unavailable.");
        console.error("Fetch salary records client-side error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      // Only fetch if user is authenticated
      fetchSalaryRecords();
    } else {
      setLoading(false);
      setError("Please log in to view your salary history.");
    }
  }, [user]);

  const handleDelete = async (recordId: string) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        await apiClient.delete(`/api/salary/${recordId}`);
        // Remove the deleted record from the list
        setSalaryRecords((prevRecords) =>
          prevRecords.filter((record) => record.id !== recordId)
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          const data = err.response.data as ApiErrorResponse;
          setError(data.message || "Failed to delete salary record.");
          return;
        }
        setError("Network error or server unavailable.");
        console.error("Delete salary record client-side error:", err);
      }
    }
  };

  const handleEdit = (recordId: string) => {
    router.push(`/salary/history/${recordId}/edit`); // Navigate to an edit page (T037)
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography>Loading salary history...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="error">{error}</Alert>
          {!user && (
            <Button
              onClick={() => router.push("/auth/login")}
              sx={{ mt: 2 }}
              variant="contained"
            >
              Go to Login
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Salary History
        </Typography>
        <SalaryHistoryList
          salaryRecords={salaryRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>
    </Container>
  );
}
