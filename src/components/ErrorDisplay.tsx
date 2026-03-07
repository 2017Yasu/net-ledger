"use client";

import { Box, Button,Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

interface ErrorDisplayProps {
  code?: string | number;
}

const errorMessages: { [key: string]: { title: string; message: string } } = {
  "400": {
    title: "Bad Request",
    message: "The server could not understand the request.",
  },
  "401": {
    title: "Unauthorized",
    message: "You need to be logged in to view this page.",
  },
  "403": {
    title: "Forbidden",
    message: "You do not have permission to access this page.",
  },
  "500": {
    title: "Internal Server Error",
    message: "Something went wrong on our end.",
  },
  default: {
    title: "An unexpected error occurred",
    message: "Please try again later or contact support.",
  },
};

const ErrorDisplay = ({ code }: ErrorDisplayProps) => {
  const codeStr = code?.toString();
  const error =
    codeStr && errorMessages[codeStr]
      ? errorMessages[codeStr]
      : errorMessages.default;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        {error.title}
      </Typography>
      <Typography variant="h5" component="p" sx={{ mb: 3 }}>
        {error.message}
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default ErrorDisplay;
