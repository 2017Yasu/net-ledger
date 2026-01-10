"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { accessToken, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.push("/auth/login");
    }
  }, [accessToken, loading, router]);

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  if (!accessToken) {
    return null; // or a redirect message
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {user?.username || "authenticated user"}!</p>
      <p>This content is only visible to authenticated users.</p>
      {/* Add more protected content here */}
    </div>
  );
}
