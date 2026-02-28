"use client";

import axios from "axios";
import { useState } from "react";

import RegistrationForm from "@/components/RegistrationForm";
import { useAuth } from "@/lib/auth-context";
import { ApiErrorResponse } from "@/lib/types/common";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleRegister = async (credentials: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/auth/register", credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      // Automatically log in after successful registration
      login(data.accessToken, data.user);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorResponse;
        setError(data.message || "Registration failed");
        return;
      }

      // Fallback for non-Axios errors
      setError("Network error or server unavailable");
      console.error("Registration client-side error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationForm
      onSubmit={handleRegister}
      loading={loading}
      error={error}
    />
  );
}
