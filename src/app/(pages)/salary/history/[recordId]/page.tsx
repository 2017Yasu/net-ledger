"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import SalaryDetailView from "@/components/SalaryDetailView";
import SalaryForm from "@/components/SalaryForm";
import { SalaryRecord } from "@prisma/client";

interface SalaryDetailPageProps {
  params: { recordId: string };
}

export default function SalaryDetailPage({ params }: SalaryDetailPageProps) {
  const { recordId } = params;
  const { token, user } = useAuth();
  const router = useRouter();
  const [salaryRecord, setSalaryRecord] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchSalaryRecord() {
      if (!token) {
        setLoading(false);
        setError("Authentication token not found. Please log in.");
        return;
      }
      if (!recordId) {
        setLoading(false);
        setError("Salary record ID is missing.");
        return;
      }

      try {
        const response = await fetch(`/api/salary/${recordId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch salary record.");
          setSalaryRecord(null);
          return;
        }

        const data: SalaryRecord = await response.json();
        setSalaryRecord(data);
      } catch (err) {
        setError("Network error or server unavailable.");
        console.error("Fetch salary record client-side error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchSalaryRecord();
    } else {
      setLoading(false);
      setError("Please log in to view salary details.");
    }
  }, [token, user, recordId]);

  const handleUpdate = async (formData: Partial<SalaryRecord>) => {
    if (!token) {
      setError("You must be logged in to update salary.");
      return;
    }
    if (!recordId) {
      setError("Salary record ID is missing for update.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/salary/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update salary record.");
        return;
      }

      setSalaryRecord(data); // Update local state with the new record
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      setError("Network error or server unavailable.");
      console.error("Update salary record client-side error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography>Loading salary record...</Typography>
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

  if (!salaryRecord) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="info">No salary record found for this ID.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {isEditing ? (
          <SalaryForm
            initialData={salaryRecord}
            onSubmit={handleUpdate}
            loading={loading}
            error={error}
            isEdit={true}
          />
        ) : (
          <>
            <SalaryDetailView salaryRecord={salaryRecord} />
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{ mt: 3, mr: 2 }}
            >
              Edit Record
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/salary/history")}
              sx={{ mt: 3 }}
            >
              Back to History
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
