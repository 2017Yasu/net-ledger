"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { Prisma, SalaryRecord } from "@prisma/client";
import React, { useState } from "react";

interface SalaryFormProps {
  initialData?: Partial<SalaryRecord> | null;
  onSubmit: (data: Partial<SalaryRecord>) => void;
  loading?: boolean;
  error?: string | null;
  isEdit?: boolean;
}

const SalaryForm: React.FC<SalaryFormProps> = ({
  initialData,
  onSubmit,
  loading,
  error,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<Partial<SalaryRecord>>({
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
    baseSalary: new Prisma.Decimal(0),
    grossEarnings: new Prisma.Decimal(0),
    netPay: new Prisma.Decimal(0),
    ...initialData,
  });
  const [formErrors, setFormErrors] = useState<
    Record<string, string | undefined>
  >({});

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow empty string for optional fields, otherwise convert to number
    const numericValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: numericValue }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (
      formData.month === undefined ||
      formData.month < 1 ||
      formData.month > 12
    ) {
      errors.month = "Month must be between 1 and 12";
    }
    if (
      formData.year === undefined ||
      formData.year < 1900 ||
      formData.year > 2100
    ) {
      errors.year = "Year must be a valid year (e.g., 1900-2100)";
    }
    if (formData.baseSalary === undefined || formData.baseSalary.isNegative()) {
      errors.baseSalary = "Base Salary is required and cannot be negative";
    }
    if (
      formData.grossEarnings === undefined ||
      formData.grossEarnings.isNegative()
    ) {
      errors.grossEarnings =
        "Gross Earnings is required and cannot be negative";
    }
    if (formData.netPay === undefined || formData.netPay.isNegative()) {
      errors.netPay = "Net Pay is required and cannot be negative";
    }
    // Add validation for other fields as needed based on data-model.md
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validate()) {
      // Convert Decimal values from number to string for Prisma, or handle in API
      const dataToSend = { ...formData };
      // Assuming API expects numbers and will handle Decimal conversion
      onSubmit(dataToSend);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          {isEdit ? "Edit Salary Record" : "Create Salary Record"}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Box
            display="grid"
            gridTemplateColumns={{ sm: "1fr 1fr", xs: "1fr" }}
            gap={2}
          >
            {/* Month and Year */}
            <Box>
              <TextField
                name="month"
                label="Month"
                type="number"
                required
                fullWidth
                value={formData.month ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.month}
                helperText={formErrors.month}
                inputProps={{ min: 1, max: 12 }}
              />
            </Box>
            <Box>
              <TextField
                name="year"
                label="Year"
                type="number"
                required
                fullWidth
                value={formData.year ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.year}
                helperText={formErrors.year}
                inputProps={{ min: 1900, max: 2100 }}
              />
            </Box>

            {/* Attendance */}
            <Box>
              <TextField
                name="attendanceDays"
                label="Attendance Days"
                type="number"
                fullWidth
                value={formData.attendanceDays ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box>
              <TextField
                name="daysWorked"
                label="Days Worked"
                type="number"
                fullWidth
                value={formData.daysWorked ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box>
              <TextField
                name="workingHours"
                label="Working Hours"
                type="number"
                fullWidth
                value={formData.workingHours ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0 }}
              />
            </Box>

            {/* Earnings */}
            <Box>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Earnings
              </Typography>
            </Box>
            <Box>
              <TextField
                name="baseSalary"
                label="Base Salary"
                type="number"
                required
                fullWidth
                value={formData.baseSalary?.toNumber() ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.baseSalary}
                helperText={formErrors.baseSalary}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="overtimeAllowance"
                label="Overtime Allowance"
                type="number"
                fullWidth
                value={formData.overtimeAllowance?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="commutingAllowance"
                label="Commuting Allowance"
                type="number"
                fullWidth
                value={formData.commutingAllowance?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="otherAllowances"
                label="Other Allowances"
                type="number"
                fullWidth
                value={formData.otherAllowances?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box gridColumn="span 2">
              <TextField
                name="grossEarnings"
                label="Gross Earnings"
                type="number"
                required
                fullWidth
                value={formData.grossEarnings?.toNumber() ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.grossEarnings}
                helperText={formErrors.grossEarnings}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>

            {/* Deductions */}
            <Box gridColumn="span 2">
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Deductions
              </Typography>
            </Box>
            <Box>
              <TextField
                name="socialInsuranceContributions"
                label="Total Social Insurance Contributions"
                type="number"
                fullWidth
                value={formData.socialInsuranceContributions?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="taxableAmount"
                label="Taxable Amount"
                type="number"
                fullWidth
                value={formData.taxableAmount?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="incomeTax"
                label="Income Tax"
                type="number"
                fullWidth
                value={formData.incomeTax?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="residentTax"
                label="Resident Tax"
                type="number"
                fullWidth
                value={formData.residentTax?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box>
              <TextField
                name="otherTaxes"
                label="Other Taxes"
                type="number"
                fullWidth
                value={formData.otherTaxes?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>
            <Box gridColumn="span 2">
              <TextField
                name="totalDeductions"
                label="Total Deductions"
                type="number"
                fullWidth
                value={formData.totalDeductions?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>

            {/* Net Pay */}
            <Box gridColumn="span 2">
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Net Pay
              </Typography>
            </Box>
            <Box gridColumn="span 2">
              <TextField
                name="netPay"
                label="Net Pay"
                type="number"
                required
                fullWidth
                value={formData.netPay?.toNumber() ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.netPay}
                helperText={formErrors.netPay}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Box>

            {/* Year-End Tax Adjustment */}
            <Box gridColumn="span 2">
              <TextField
                name="yearEndTaxAdjustment"
                label="Year-End Tax Adjustment"
                type="number"
                fullWidth
                value={formData.yearEndTaxAdjustment?.toNumber() ?? ""}
                onChange={handleNumericChange}
                inputProps={{ step: "0.01" }}
              />
            </Box>

            {/* Paid Time Off */}
            <Box gridColumn="span 2">
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Paid Time Off
              </Typography>
            </Box>
            <Box>
              <TextField
                name="paidTimeOffDaysUsed"
                label="Days Used"
                type="number"
                fullWidth
                value={formData.paidTimeOffDaysUsed ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.5" }}
              />
            </Box>
            <Box>
              <TextField
                name="paidTimeOffDaysRemaining"
                label="Remaining Days"
                type="number"
                fullWidth
                value={formData.paidTimeOffDaysRemaining ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.5" }}
              />
            </Box>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {isEdit ? "Save Changes" : "Create Record"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SalaryForm;
