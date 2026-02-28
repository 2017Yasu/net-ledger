"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Import useState

import { useAuth } from "@/lib/auth-context";

export default function ProtectedPage() {
  const { accessToken, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Introduce local loading state

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/login");
    }
    setIsLoading(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [accessToken, router]); // Remove 'loading' from dependencies

  if (isLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!accessToken) {
    return null; // or a redirect message, though router.push should handle this
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
