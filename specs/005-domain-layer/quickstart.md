# Quickstart: Domain Layer

## Importing Entities

```typescript
import { User } from "@/domain/entities/User";
import { SalaryRecord } from "@/domain/entities/SalaryRecord";
import { Money } from "@/domain/value-objects/Money";
```

## Creating Entities

```typescript
// Create a new User (ID is auto-generated)
const newUser = User.create({
  username: "new_employee",
});

// Reconstitute a User from storage (e.g., from DB)
const existingUser = User.reconstitute({
  id: "existing-uuid-v4",
  username: "existing_employee",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date(),
});

// Create a Salary Record
const salary = SalaryRecord.create({
  userId: newUser.id,
  period: new SalaryPeriod(2026, 4),
  baseSalary: Money.fromMajor(500000), // Helper for major units
  grossEarnings: new Money(600000), // Raw minor units (Yen)
  netPay: new Money(450000),
  // ... other required fields
});
```

## Using Value Objects

```typescript
const base = Money.fromMajor(500000); // 500,000 JPY
const bonus = Money.fromMajor(100000); // 100,000 JPY
const total = base.add(bonus); // Returns new Money(600000)

const period = new SalaryPeriod(2026, 4);
if (period.equals(new SalaryPeriod(2026, 4))) {
  console.log("Same month");
}
```

## Using Repositories

Repositories are defined as interfaces in the domain layer. Implementations (Infrastructure) must be injected.

```typescript
import { UserRepository } from "@/domain/repositories/UserRepository";

async function registerUser(repo: UserRepository, username: string) {
  const existing = await repo.findByUsername(username);
  if (existing) {
    throw new Error("Username taken");
  }

  const newUser = User.create({ username });
  await repo.save(newUser);
  return newUser;
}
```
