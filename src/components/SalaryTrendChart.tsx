"use client";

// src/components/SalaryTrendChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalaryTrendChartProps {
  salaryData: Array<{
    month: number;
    year: number;
    grossEarnings: number;
  }>;
}

const SalaryTrendChart: React.FC<SalaryTrendChartProps> = ({ salaryData }) => {
  const formattedData = salaryData
    .sort((a, b) => a.year - b.year || a.month - b.month) // Sort data chronologically
    .map((data) => ({
      name: `${data.month}/${data.year}`, // Format as "M/YYYY"
      "Gross Earnings": data.grossEarnings,
    }));

  return (
    <div className="salary-trend-chart">
      <h3>Salary Trend (Last 12 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number | undefined) =>
              value !== undefined ? `$${value.toFixed(2)}` : ""
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Gross Earnings"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {formattedData.length === 0 && (
        <p>No salary data available for the last 12 months to display trend.</p>
      )}
    </div>
  );
};

export default SalaryTrendChart;
