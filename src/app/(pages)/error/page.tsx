"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

import ErrorDisplay from "@/components/ErrorDisplay";

const ErrorContent = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  return <ErrorDisplay code={code || undefined} />;
};

const ErrorPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
};

export default ErrorPage;
