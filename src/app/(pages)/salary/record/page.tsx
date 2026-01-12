"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SalaryForm from "@/components/SalaryForm";
import { useAuth } from "@/lib/auth-context";
import { Alert, Container, Box, Button } from "@mui/material";
import { SalaryRecord } from "@prisma/client";
import { apiClient } from "@/lib/api-client";
import axios from "axios";
import { ApiErrorResponse } from "@/lib/types/common";

export default function RecordSalaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: Partial<SalaryRecord>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post<SalaryRecord>("/api/salary", formData);
      setSuccess("Salary record created successfully!");
      // Optionally redirect or clear form
      // router.push('/history')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorResponse;
        setError(data.message || "Failed to record salary.");
        return;
      }
      setError("Network error or server unavailable.");
      console.error("Record salary client-side error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning">Please log in to record your salary.</Alert>
          <Button
            onClick={() => router.push("/auth/login")}
            sx={{ mt: 2 }}
            variant="contained"
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <SalaryForm onSubmit={handleSubmit} loading={loading} error={error} />
    </>
  );
}
