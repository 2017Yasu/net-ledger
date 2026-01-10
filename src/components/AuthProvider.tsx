"use client";

import { AuthContext } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios"; // Import axios

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null,
  );
  const [accessToken, setAccessToken] = useState<string | null>(null); // State for access token in memory
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Access token should not persist in client-side storage (cookies/localStorage)
    // On initial load, assume no active access token.
    // The presence of a valid refresh token (HTTP-only cookie) will be checked by API routes
    // and trigger a refresh if needed for seamless session.
    setLoading(false); // Set loading to false once initial check is done
  }, []);

  const login = (
    newAccessToken: string,
    newUser: { id: string; username: string },
  ) => {
    setAccessToken(newAccessToken); // Store access token in memory
    setUser(newUser);
    router.push("/dashboard");
  };

  const logout = async () => {
    // Make logout async
    try {
      await axios.post("/api/auth/logout"); // Call logout API
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Even if API call fails, clear client-side state for UX
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push("/auth/login");
    }
  };

  const updateAccessToken = (newAccessToken: string) => {
    setAccessToken(newAccessToken);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, updateAccessToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
