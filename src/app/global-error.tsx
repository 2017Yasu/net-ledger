"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import ErrorDisplay from "@/components/ErrorDisplay";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error); // Placeholder for actual logging service
    // Redirect to the custom error page
    router.push("/error?code=500");
  }, [error, router]);

  // Fallback rendering while redirecting
  return (
    <html>
      <body>
        <ErrorDisplay code="500" />
      </body>
    </html>
  );
}
