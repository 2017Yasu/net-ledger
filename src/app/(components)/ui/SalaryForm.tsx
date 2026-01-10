"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { SalaryRecord } from "@prisma/client";

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
    baseSalary: 0,
    grossEarnings: 0,
    netPay: 0,
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
    if (formData.baseSalary === undefined || formData.baseSalary < 0) {
      errors.baseSalary = "Base Salary is required and cannot be negative";
    }
    if (formData.grossEarnings === undefined || formData.grossEarnings < 0) {
      errors.grossEarnings =
        "Gross Earnings is required and cannot be negative";
    }
    if (formData.netPay === undefined || formData.netPay < 0) {
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
          <Grid container spacing={2}>
            {/* Month and Year */}
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>

            {/* Attendance */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="attendanceDays"
                label="Attendance Days"
                type="number"
                fullWidth
                value={formData.attendanceDays ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="daysWorked"
                label="Days Worked"
                type="number"
                fullWidth
                value={formData.daysWorked ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="workingHours"
                label="Working Hours"
                type="number"
                fullWidth
                value={formData.workingHours ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Earnings */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Earnings
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="baseSalary"
                label="Base Salary"
                type="number"
                required
                fullWidth
                value={formData.baseSalary ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.baseSalary}
                helperText={formErrors.baseSalary}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="overtimeAllowance"
                label="Overtime Allowance"
                type="number"
                fullWidth
                value={formData.overtimeAllowance ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="commutingAllowance"
                label="Commuting Allowance"
                type="number"
                fullWidth
                value={formData.commutingAllowance ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="otherAllowances"
                label="Other Allowances"
                type="number"
                fullWidth
                value={formData.otherAllowances ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="grossEarnings"
                label="Gross Earnings"
                type="number"
                required
                fullWidth
                value={formData.grossEarnings ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.grossEarnings}
                helperText={formErrors.grossEarnings}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            {/* Deductions */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Deductions
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="socialInsuranceContributions"
                label="Total Social Insurance Contributions"
                type="number"
                fullWidth
                value={formData.socialInsuranceContributions ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="taxableAmount"
                label="Taxable Amount"
                type="number"
                fullWidth
                value={formData.taxableAmount ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="incomeTax"
                label="Income Tax"
                type="number"
                fullWidth
                value={formData.incomeTax ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="residentTax"
                label="Resident Tax"
                type="number"
                fullWidth
                value={formData.residentTax ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="otherTaxes"
                label="Other Taxes"
                type="number"
                fullWidth
                value={formData.otherTaxes ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="totalDeductions"
                label="Total Deductions"
                type="number"
                fullWidth
                value={formData.totalDeductions ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            {/* Net Pay */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Net Pay
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="netPay"
                label="Net Pay"
                type="number"
                required
                fullWidth
                value={formData.netPay ?? ""}
                onChange={handleNumericChange}
                error={!!formErrors.netPay}
                helperText={formErrors.netPay}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            {/* Year-End Tax Adjustment */}
            <Grid item xs={12}>
              <TextField
                name="yearEndTaxAdjustment"
                label="Year-End Tax Adjustment"
                type="number"
                fullWidth
                value={formData.yearEndTaxAdjustment ?? ""}
                onChange={handleNumericChange}
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            {/* Paid Time Off */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Paid Time Off
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="paidTimeOffDaysUsed"
                label="Days Used"
                type="number"
                fullWidth
                value={formData.paidTimeOffDaysUsed ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.5" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="paidTimeOffDaysRemaining"
                label="Remaining Days"
                type="number"
                fullWidth
                value={formData.paidTimeOffDaysRemaining ?? ""}
                onChange={handleNumericChange}
                inputProps={{ min: 0, step: "0.5" }}
              />
            </Grid>
          </Grid>
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
