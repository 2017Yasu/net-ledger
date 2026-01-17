"use client";

import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { SalaryRecord } from "@prisma/client";
import Link from "next/link";

interface SalaryHistoryListProps {
  salaryRecords: SalaryRecord[];
  onEdit?: (recordId: string) => void;
  onDelete?: (recordId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const SalaryHistoryList: React.FC<SalaryHistoryListProps> = ({
  salaryRecords,
  onEdit,
  onDelete,
  loading,
  error,
}) => {
  if (loading) {
    return <Typography>Loading history...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!salaryRecords || salaryRecords.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 2, textAlign: "center" }}>
        <Typography variant="h6">No Salary Records Found</Typography>
        <Typography variant="body2" color="text.secondary">
          Start by adding your first salary record.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <List>
        {salaryRecords.map((record) => (
          <ListItem
            key={record.id}
            secondaryAction={
              <Box>
                {onEdit && (
                  <Tooltip title="Edit">
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => onEdit(record.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDelete(record.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
          >
            <Link href={`/salary/history/${record.id}`} passHref>
              <ListItemText
                primary={
                  <Typography variant="h6">
                    {record.month}/{record.year} - Net: $
                    {Number(record.netPay || 0).toFixed(2)}
                  </Typography>
                }
                secondary={`Gross: $${Number(record.grossEarnings || 0).toFixed(2)}, Base: $${Number(record.baseSalary || 0).toFixed(2)}`}
              />
            </Link>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SalaryHistoryList;
