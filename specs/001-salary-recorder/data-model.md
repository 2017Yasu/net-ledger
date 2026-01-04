# Data Model: Salary Recorder

This document defines the key data entities for the Salary Recorder feature, based on `spec.md`.

## Entity: User

Represents a registered user of the application.

**Fields**:

| Name | Type | Description | Constraints |
|---|---|---|---|
| `id` | UUID | Unique identifier for the user. | Primary Key |
| `username` | String | The user's chosen username. | Required, Unique, Min 3 chars |
| `password` | String | The user's hashed password. | Required, Min 8 chars |
| `createdAt` | DateTime | Timestamp of when the user was created. | Required |
| `updatedAt` | DateTime | Timestamp of when the user was last updated. | Required |

**Relationships**:
- A `User` has a one-to-many relationship with `SalaryRecord`.

## Entity: SalaryRecord

Represents the complete salary details for a specific user for a specific month and year.

**Fields**:

| Name | Type | Description | Constraints |
|---|---|---|---|
| `id` | UUID | Unique identifier for the salary record. | Primary Key |
| `userId` | UUID | Foreign key linking to the `User` entity. | Required, Indexed |
| `month` | Integer | The month of the salary record (1-12). | Required |
| `year` | Integer | The year of the salary record. | Required |
| `daysWorked` | Float | Optional. | |
| `regularOvertimeHours` | Float | Optional. | |
| `lateNightOvertimeHours` | Float | Optional. | |
| `workingHours` | Float | Optional. | |
| `baseSalary` | Decimal | Required. | |
| `overtimeAllowance` | Decimal | Required. | |
| `commutingAllowance` | Decimal | Required. | |
| `otherAllowances` | Decimal | Optional. | |
| `grossEarnings` | Decimal | Required. | |
| `totalSocialInsuranceContributions` | Decimal | Optional. | |
| `taxableAmount` | Decimal | Optional. | |
| `incomeTax` | Decimal | Optional. | |
| `residentTax` | Decimal | Optional. | |
| `otherTaxes` | Decimal | Optional. | |
| `totalDeductions` | Decimal | Optional. | |
| `yearEndTaxAdjustment` | Decimal | Optional. | |
- **Total** - Year-End Tax Adjustment (Optional)
| `netPay` | Decimal | Required. | |
| `paidTimeOffDaysUsed` | Float | Optional. | |
| `paidTimeOffRemainingDays` | Float | Optional. | |
| `createdAt` | DateTime | Timestamp of when the record was created. | Required |
| `updatedAt` | DateTime | Timestamp of when the record was last updated. | Required |

**Relationships**:
- A `SalaryRecord` belongs to one `User`.

## State Transitions

- A `SalaryRecord` is created in a `draft` state.
- When the user saves the record, it moves to a `finalized` state.
- A `finalized` record can be updated, which moves it back to a `draft` state until saved again.
- This is a soft-state managed in the UI; the database will only store the latest version of the record.
