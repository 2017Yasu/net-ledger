"use client";

import { Backdrop, CircularProgress } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

import { apiClient, authTokenStore } from "@/lib/api-client";
import { AuthContext } from "@/lib/auth-context";
import { LoginResponse } from "@/lib/types/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null,
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const updateAccessToken = useCallback((newAccessToken: string | null) => {
    setAccessToken(newAccessToken);
    authTokenStore.set(newAccessToken);
  }, []);

  const login = useCallback(
    (
      newAccessToken: string,
      newUser: { id: string; username: string },
      redirectTo?: string,
    ) => {
      updateAccessToken(newAccessToken);
      setUser(newUser);
      router.push(redirectTo ?? "/dashboard");
    },
    [router, updateAccessToken],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout"); // Call logout API
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Even if API call fails, clear client-side state for UX
    } finally {
      updateAccessToken(null);
      setUser(null);
      router.push("/auth/login");
    }
  }, [router, updateAccessToken]);

  useEffect(() => {
    // Check if refresh token exists and try to refresh access token
    async function initializeAuth() {
      const storedToken = authTokenStore.get();
      if (!storedToken) {
        try {
          const response = await axios.post<LoginResponse>("/api/auth/refresh");

          updateAccessToken(response.data.accessToken);
          setUser(response.data.user);
        } catch (error) {
          console.error("Failed to refresh access token:", error);
          updateAccessToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Backdrop
        open={true}
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
