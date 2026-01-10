"use client";

import { verifyToken } from "@/lib/auth";
import { AuthContext } from "@/lib/auth-context";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fn = () => {
      const storedToken = Cookies.get("token"); // Get token from cookies
      if (storedToken) {
        try {
          const decoded = verifyToken(storedToken);
          setUser({ id: decoded.userId, username: decoded.userId }); // Assuming userId is username for now
          setToken(storedToken);
        } catch (error) {
          console.error("Token verification failed:", error);
          Cookies.remove("token"); // Remove invalid token
        }
      }
      setLoading(false);
    };

    fn();
  }, []);

  const login = (
    newToken: string,
    newUser: { id: string; username: string },
  ) => {
    Cookies.set("token", newToken, { expires: 7 }); // Store token in cookies, expires in 7 days
    setToken(newToken);
    setUser(newUser);
    router.push("/dashboard");
  };

  const logout = () => {
    Cookies.remove("token"); // Remove token from cookies
    setToken(null);
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
