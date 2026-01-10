"use client";

import { useEffect } from "react";
import { Typography, Container, Box, Button } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography component="h1" variant="h4" color="error" gutterBottom>
          Something went wrong!
        </Typography>
        <Typography variant="body1" paragraph>
          We&apos;re sorry, but an unexpected error occurred.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {error.message}
        </Typography>
        <Button
          variant="contained"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          sx={{ mt: 3 }}
        >
          Try again
        </Button>
      </Box>
    </Container>
  );
}
