"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { SalaryRecord } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SalaryDetailView from "@/components/SalaryDetailView";
import SalaryForm from "@/components/SalaryForm";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ApiErrorResponse } from "@/lib/types/common";

interface SalaryDetailPageProps {
  recordId: string;
}

export default function SalaryDetailPage({
  params,
}: {
  params: Promise<SalaryDetailPageProps>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [salaryRecord, setSalaryRecord] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParams() {
      const resolvedParams = await params;
      console.log("Resolved params:", resolvedParams);
      setRecordId(resolvedParams.recordId);
    }
    fetchParams();
  }, [params]);

  useEffect(() => {
    async function fetchSalaryRecord() {
      console.log("Fetching salary record for ID:", recordId);
      if (!recordId) {
        setLoading(false);
        setError("Salary record ID is missing.");
        return;
      }

      try {
        const response = await apiClient.get<SalaryRecord>(
          `/api/salary/${recordId}`,
        );
        setSalaryRecord(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          const data = err.response.data as ApiErrorResponse;
          setError(data.message || "Failed to fetch salary record.");
          setSalaryRecord(null);
          return;
        }
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
    return () => {
      setSalaryRecord(null);
      setError(null);
      setLoading(true);
      setIsEditing(false);
    };
  }, [user, recordId]);

  const handleUpdate = async (formData: Partial<SalaryRecord>) => {
    if (!recordId) {
      setError("Salary record ID is missing for update.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put<SalaryRecord>(
        `/api/salary/${recordId}`,
        formData,
      );
      setSalaryRecord(response.data); // Update local state with the new record
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorResponse;
        setError(data.message || "Failed to update salary record.");
        return;
      }
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
