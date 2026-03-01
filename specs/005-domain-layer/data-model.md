# Data Model: Domain Layer

## Entities

### User

Represents a registered user in the system.

| Field       | Type            | Description               |
| :---------- | :-------------- | :------------------------ |
| `id`        | `string` (UUID) | Unique identifier.        |
| `username`  | `string`        | Unique username.          |
| `createdAt` | `Date`          | Timestamp of creation.    |
| `updatedAt` | `Date`          | Timestamp of last update. |

### SalaryRecord

Represents a monthly salary record for a user.

| Field             | Type            | Description                                             |
| :---------------- | :-------------- | :------------------------------------------------------ |
| `id`              | `string` (UUID) | Unique identifier.                                      |
| `userId`          | `string` (UUID) | ID of the user this record belongs to.                  |
| `period`          | `SalaryPeriod`  | The month and year of the salary.                       |
| `baseSalary`      | `Money`         | Base salary amount.                                     |
| `grossEarnings`   | `Money`         | Total earnings before deductions.                       |
| `netPay`          | `Money`         | Final take-home pay.                                    |
| `totalDeductions` | `Money`         | Total deductions (tax, insurance).                      |
| ...               | ...             | (Other fields from schema as needed, mapped to `Money`) |

## Value Objects

### Money

Immutable object representing a monetary value in minor units.

| Field      | Type               | Description                                      |
| :--------- | :----------------- | :----------------------------------------------- |
| `amount`   | `number` (Integer) | The monetary value in minor units (e.g., cents). |
| `currency` | `string`           | Currency code (default 'JPY').                   |

**Methods:**

- `add(other: Money): Money`
- `subtract(other: Money): Money`
- `equals(other: Money): boolean`

### SalaryPeriod

Immutable object representing a specific month and year.

| Field   | Type            | Description |
| :------ | :-------------- | :---------- |
| `month` | `number` (1-12) | The month.  |
| `year`  | `number`        | The year.   |

**Methods:**

- `isBefore(other: SalaryPeriod): boolean`
- `equals(other: SalaryPeriod): boolean`

## Repository Interfaces

### UserRepository

- `findById(id: string): Promise<User | null>`
- `findByUsername(username: string): Promise<User | null>`
- `save(user: User): Promise<void>`

### SalaryRecordRepository

- `findById(id: string): Promise<SalaryRecord | null>`
- `findByUserId(userId: string): Promise<SalaryRecord[]>`
- `save(record: SalaryRecord): Promise<void>`
