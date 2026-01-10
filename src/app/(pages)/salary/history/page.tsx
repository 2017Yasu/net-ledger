"use client";

import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Alert, Button } from "@mui/material";
import SalaryHistoryList from "@/components/SalaryHistoryList";
import { useAuth } from "@/lib/auth-context";
import { SalaryRecord } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function SalaryHistoryPage() {
  const { accessToken, user } = useAuth();
  const router = useRouter();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalaryRecords() {
      if (!accessToken) {
        setLoading(false);
        setError("Authentication token not found. Please log in.");
        return;
      }

      try {
        const response = await fetch("/api/salary", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch salary records.");
          setSalaryRecords([]);
          return;
        }

        const data: SalaryRecord[] = await response.json();
        setSalaryRecords(data);
      } catch (err) {
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
  }, [accessToken, user]);

  const handleDelete = async (recordId: string) => {
    if (!accessToken) {
      setError(
        "Authentication token not found. Please log in to delete records.",
      );
      return;
    }
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        const response = await fetch(`/api/salary/${recordId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to delete salary record.");
          return;
        }

        // Remove the deleted record from the list
        setSalaryRecords((prevRecords) =>
          prevRecords.filter((record) => record.id !== recordId),
        );
      } catch (err) {
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
