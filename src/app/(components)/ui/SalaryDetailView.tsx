'use client'

import React from 'react'
import {
  Paper,
  Typography,
  Grid,
  Divider,
  Box,
} from '@mui/material'
import { SalaryRecord } from '@prisma/client'

interface SalaryDetailViewProps {
  salaryRecord: SalaryRecord
}

const SalaryDetailView: React.FC<SalaryDetailViewProps> = ({ salaryRecord }) => {
  const renderDetailItem = (label: string, value: string | number | null | undefined) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">
        {value !== null && value !== undefined && value !== '' ? value.toString() : '-'}
      </Typography>
    </Grid>
  )

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Salary Record for {salaryRecord.month}/{salaryRecord.year}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Earnings
        </Typography>
        <Grid container spacing={2}>
          {renderDetailItem('Base Salary', salaryRecord.baseSalary.toFixed(2))}
          {renderDetailItem('Overtime Allowance', salaryRecord.overtimeAllowance?.toFixed(2))}
          {renderDetailItem('Commuting Allowance', salaryRecord.commutingAllowance?.toFixed(2))}
          {renderDetailItem('Other Allowances', salaryRecord.otherAllowances?.toFixed(2))}
          {renderDetailItem('Gross Earnings', salaryRecord.grossEarnings.toFixed(2))}
        </Grid>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Deductions
        </Typography>
        <Grid container spacing={2}>
          {renderDetailItem('Social Insurance Contributions', salaryRecord.socialInsuranceContributions?.toFixed(2))}
          {renderDetailItem('Taxable Amount', salaryRecord.taxableAmount?.toFixed(2))}
          {renderDetailItem('Income Tax', salaryRecord.incomeTax?.toFixed(2))}
          {renderDetailItem('Resident Tax', salaryRecord.residentTax?.toFixed(2))}
          {renderDetailItem('Other Taxes', salaryRecord.otherTaxes?.toFixed(2))}
          {renderDetailItem('Total Deductions', salaryRecord.totalDeductions?.toFixed(2))}
        </Grid>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Net Pay & Adjustments
        </Typography>
        <Grid container spacing={2}>
          {renderDetailItem('Net Pay', salaryRecord.netPay.toFixed(2))}
          {renderDetailItem('Year-End Tax Adjustment', salaryRecord.yearEndTaxAdjustment?.toFixed(2))}
        </Grid>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attendance & Time Off
        </Typography>
        <Grid container spacing={2}>
          {renderDetailItem('Attendance Days', salaryRecord.attendanceDays)}
          {renderDetailItem('Days Worked', salaryRecord.daysWorked)}
          {renderDetailItem('Regular Overtime Hours', salaryRecord.regularOvertimeHours)}
          {renderDetailItem('Late-Night Overtime Hours', salaryRecord.lateNightOvertimeHours)}
          {renderDetailItem('Working Hours', salaryRecord.workingHours)}
          {renderDetailItem('Paid Time Off Days Used', salaryRecord.paidTimeOffDaysUsed)}
          {renderDetailItem('Paid Time Off Days Remaining', salaryRecord.paidTimeOffDaysRemaining)}
        </Grid>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box>
        <Typography variant="caption" color="text.disabled">
          Created: {new Date(salaryRecord.createdAt).toLocaleString()}
        </Typography>
        <br />
        <Typography variant="caption" color="text.disabled">
          Last Updated: {new Date(salaryRecord.updatedAt).toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  )
}

export default SalaryDetailView
