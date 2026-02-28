// tests/unit/SalaryTrendChart.test.tsx
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";

import SalaryTrendChart from "@/components/SalaryTrendChart";

describe("SalaryTrendChart", () => {
  it("renders correctly with provided data", () => {
    const salaryData = [
      { month: 1, year: 2023, grossEarnings: 3000 },
      { month: 2, year: 2023, grossEarnings: 3200 },
      { month: 3, year: 2023, grossEarnings: 3100 },
    ];

    render(<SalaryTrendChart salaryData={salaryData} />);

    expect(
      screen.getByText("Salary Trend (Last 12 Months)"),
    ).toBeInTheDocument();
    // Check for elements that would indicate the chart is rendered
    expect(screen.getByText("1/2023")).toBeInTheDocument();
    expect(screen.getByText("2/2023")).toBeInTheDocument();
    expect(screen.getByText("3/2023")).toBeInTheDocument();
    expect(screen.getByText("Gross Earnings")).toBeInTheDocument(); // Check for legend item
  });

  it("displays a message when no salary data is available", () => {
    render(<SalaryTrendChart salaryData={[]} />);

    expect(
      screen.getByText(
        "No salary data available for the last 12 months to display trend.",
      ),
    ).toBeInTheDocument();
  });
});
