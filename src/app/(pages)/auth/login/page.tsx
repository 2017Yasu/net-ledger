"use client";

import { useState } from "react";
import LoginForm from "@/app/(components)/ui/LoginForm";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth(); // Use the login function from AuthContext

  const handleLogin = async (credentials: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Use the login function from AuthContext to store token and user
      login(data.token, data.user);
      // Redirection is handled by the login function in AuthContext
    } catch (err) {
      setError("Network error or server unavailable");
      console.error("Login client-side error:", err);
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />;
}
