// tests/unit/SalarySummaryCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SalarySummaryCard from "@/components/SalarySummaryCard";

describe("SalarySummaryCard", () => {
  it("renders correctly with provided data", () => {
    const grossPay = 5000.0;
    const netPay = 4000.0;
    const payDate = "2023-10-26";

    render(
      <SalarySummaryCard
        grossPay={grossPay}
        netPay={netPay}
        payDate={payDate}
      />,
    );

    expect(screen.getByText("Latest Salary Summary")).toBeInTheDocument();
    expect(
      screen.getByText(`Gross Pay: $${grossPay.toFixed(2)}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Net Pay: $${netPay.toFixed(2)}`),
    ).toBeInTheDocument();
    expect(screen.getByText(`Pay Date: ${payDate}`)).toBeInTheDocument();
  });

  it('displays "N/A" for missing grossPay', () => {
    const netPay = 4000.0;
    const payDate = "2023-10-26";

    render(
      <SalarySummaryCard grossPay={null} netPay={netPay} payDate={payDate} />,
    );

    expect(screen.getByText("Gross Pay: N/A")).toBeInTheDocument();
  });

  it('displays "N/A" for missing netPay', () => {
    const grossPay = 5000.0;
    const payDate = "2023-10-26";

    render(
      <SalarySummaryCard grossPay={grossPay} netPay={null} payDate={payDate} />,
    );

    expect(screen.getByText("Net Pay: N/A")).toBeInTheDocument();
  });

  it('displays "N/A" for missing payDate', () => {
    const grossPay = 5000.0;
    const netPay = 4000.0;

    render(
      <SalarySummaryCard grossPay={grossPay} netPay={netPay} payDate={null} />,
    );

    expect(screen.getByText("Pay Date: N/A")).toBeInTheDocument();
  });
});
