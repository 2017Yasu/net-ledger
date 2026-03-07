import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";

import ErrorDisplay from "@/components/ErrorDisplay";

describe("ErrorDisplay", () => {
  it("renders the default error message when no code is provided", () => {
    render(<ErrorDisplay />);
    expect(
      screen.getByText("An unexpected error occurred"),
    ).toBeInTheDocument();
  });

  it("renders the specific message for a 500 error", () => {
    render(<ErrorDisplay code="500" />);
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
  });

  it("renders the specific message for a 403 error", () => {
    render(<ErrorDisplay code={403} />);
    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });

  it("renders a link to the dashboard", () => {
    render(<ErrorDisplay />);
    const link = screen.getByRole("link", { name: /back to dashboard/i });
    expect(link).toHaveAttribute("href", "/dashboard");
  });
});
