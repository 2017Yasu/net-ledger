// src/components/SalarySummaryCard.tsx
import React from "react";

interface SalarySummaryCardProps {
  grossPay: number | null;
  netPay: number | null;
  payDate: string | null; // This can be formatted from month/year or passed directly
}

const SalarySummaryCard: React.FC<SalarySummaryCardProps> = ({
  grossPay,
  netPay,
  payDate,
}) => {
  return (
    <div className="salary-summary-card">
      <h3>Latest Salary Summary</h3>
      <p>Gross Pay: ${grossPay ? grossPay.toFixed(2) : "N/A"}</p>
      <p>Net Pay: ${netPay ? netPay.toFixed(2) : "N/A"}</p>
      <p>Pay Date: {payDate || "N/A"}</p>
    </div>
  );
};

export default SalarySummaryCard;
