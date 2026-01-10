# Data Model: Salary Recorder

**Date**: 2026-01-05
**Feature Branch**: `001-salary-recorder`
**Source**: `spec.md`

## Entities

### User

Represents a registered user of the application.

| Attribute       | Type     | Constraints / Description                               |
|-----------------|----------|---------------------------------------------------------|
| `id`            | `UUID`   | Primary Key, unique identifier for the user.            |
| `username`      | `String` | Unique, required. Used for login.                       |
| `passwordHash`  | `String` | Required. Stores the hashed and salted password.        |
| `createdAt`     | `DateTime`| Required. Timestamp of user creation.                   |
| `updatedAt`     | `DateTime`| Required. Timestamp of last update.                     |

**Relationships**:
- One-to-many with `SalaryRecord` (`User` has many `SalaryRecord`s).

### SalaryRecord

Represents the complete salary details for a specific user for a specific month and year.

| Attribute                 | Type      | Optional | Constraints / Description                                           |
|---------------------------|-----------|----------|---------------------------------------------------------------------|
| `id`                      | `UUID`    | No       | Primary Key, unique identifier for the salary record.               |
| `userId`                  | `UUID`    | No       | Foreign Key, links to the `User` who owns this record.              |
| `month`                   | `Int`     | No       | Month of the salary record (1-12).                                  |
| `year`                    | `Int`     | No       | Year of the salary record (e.g., 2026).                             |
| `attendanceDays`          | `Float`   | Yes      | Number of days attended or total working days.                      |
| `daysWorked`              | `Float`   | Yes      | Number of days actually worked.                                     |
| `regularOvertimeHours`    | `Float`   | Yes      | Hours of regular overtime.                                          |
| `lateNightOvertimeHours`  | `Float`   | Yes      | Hours of late-night overtime.                                       |
| `workingHours`            | `Float`   | Yes      | Total regular working hours.                                        |
| `baseSalary`              | `Decimal` | No       | Base earnings before allowances or deductions.                      |
| `overtimeAllowance`       | `Decimal` | Yes      | Allowance for overtime.                                             |
| `commutingAllowance`      | `Decimal` | Yes      | Allowance for commuting expenses.                                   |
| `otherAllowances`         | `Decimal` | Yes      | Any other allowances.                                               |
| `grossEarnings`           | `Decimal` | No       | Calculated total earnings (Base Salary + all Allowances).           |
| `socialInsuranceContributions` | `Decimal` | Yes | Total contributions to social insurance.                          |
| `taxableAmount`           | `Decimal` | Yes      | Amount subject to income tax.                                       |
| `incomeTax`               | `Decimal` | Yes      | Income tax deduction.                                               |
| `residentTax`             | `Decimal` | Yes      | Resident tax deduction.                                             |
| `otherTaxes`              | `Decimal` | Yes      | Any other tax deductions.                                           |
| `totalDeductions`         | `Decimal` | Yes      | Calculated total deductions (all contributions and taxes).          |
| `netPay`                  | `Decimal` | No       | Calculated net pay (Gross Earnings - Total Deductions).             |
| `yearEndTaxAdjustment`    | `Decimal` | Yes      | Adjustment for year-end tax.                                        |
| `paidTimeOffDaysUsed`     | `Float`   | Yes      | Number of paid time off days used.                                  |
| `paidTimeOffDaysRemaining`| `Float`   | Yes      | Number of paid time off days remaining.                             |
| `createdAt`               | `DateTime`| No       | Timestamp of record creation.                                       |
| `updatedAt`               | `DateTime`| No       | Timestamp of last update.                                           |

**Relationships**:
- Many-to-one with `User` (`SalaryRecord` belongs to one `User`).

## Validation Rules (from `spec.md`)

- All currency fields (`Decimal` type) must be non-negative.
- `month` must be between 1 and 12.
- `year` must be a reasonable past or current year.
- `attendanceDays`, `daysWorked`, `regularOvertimeHours`, `lateNightOvertimeHours`, `workingHours`, `paidTimeOffDaysUsed`, `paidTimeOffDaysRemaining` must be non-negative.
- `username` must be unique.
- System must handle cases where a user tries to create a salary record for a month that already has one (should be an update).
- System must provide clear validation and error messages for incorrect data entry (e.g., non-numeric input in a currency field).