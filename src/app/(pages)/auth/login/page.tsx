"use client";

import { useCallback, useMemo, useState } from "react";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/lib/auth-context";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { LoginResponse } from "@/lib/types/auth";
import { ApiErrorResponse } from "@/lib/types/common";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") || undefined,
    [searchParams]
  );

  const handleLogin = useCallback(
    async (credentials: { username: string; password: string }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<LoginResponse>(
          "/api/auth/login",
          credentials,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;

        // Use the login function from AuthContext to store token and user
        login(data.accessToken, data.user, redirectTo);
        // Redirection is handled by the login function in AuthContext
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          const data = err.response.data as ApiErrorResponse;
          setError(data.message || "Login failed");
          return;
        }
        setError("Network error or server unavailable");
        console.error("Login client-side error:", err);
      } finally {
        setLoading(false);
      }
    },
    [login, redirectTo]
  );

  return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />;
}
