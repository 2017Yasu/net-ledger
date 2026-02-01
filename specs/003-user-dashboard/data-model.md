# Data Model: User Dashboard

This feature primarily interacts with the existing `SalaryRecord` entity. No new entities are introduced.

## SalaryRecord Entity

Represents a user's salary for a specific pay period.

| Field         | Type     | Description                                              | Validation Rules                                     |
| ------------- | -------- | -------------------------------------------------------- | ---------------------------------------------------- |
| id            | String   | Unique identifier for the salary record.                 | (Primary Key)                                        |
| userId        | String   | Foreign key linking to the `User` entity.                | (Required)                                           |
| month         | Int      | The month of the salary payment.                         | (Required, 1-12)                                     |
| year          | Int      | The year of the salary payment.                          | (Required)                                           |
| baseSalary    | Decimal  | The user's base salary for the period.                   | (Required)                                           |
| grossEarnings | Decimal  | The total earnings before deductions.                    | (Required)                                           |
| netPay        | Decimal  | The final take-home pay after all deductions.            | (Required)                                           |
| payDate       | DateTime | The date the salary was paid. (Implicit from month/year) | Not a direct field, derived from `month` and `year`. |

**Note**: The dashboard will primarily display `grossEarnings` (as "Gross Pay"), `netPay` (as "Net Pay"), and a date derived from `month` and `year`. The trend chart will plot `grossEarnings` over time.
