# Research: Domain Layer Implementation

## Decisions

### 1. Entity Identity & Generation

- **Decision**: Use `crypto.randomUUID()` (Node.js standard library) for ID generation.
- **Rationale**:
  - Meets the "Zero Dependencies" requirement (no external `uuid` package needed).
  - Supported in Node.js LTS (v20) and modern browsers.
  - Generates standard UUID v4.
- **Alternatives**:
  - `uuid` package: Rejected to keep domain layer dependency-free.
  - Custom random string generator: Rejected as UUID is the industry standard for unique IDs.

### 2. Base Classes (Entity & Value Object)

- **Decision**: Implement abstract base classes `Entity<T>` and `ValueObject<T>`.
  - `Entity<T>`: Holds a unique `readonly id: string`. Implements `equals(other: Entity<T>)` based on ID.
  - `ValueObject<T>`: Holds immutable properties. Implements `equals(other: ValueObject<T>)` based on structural equality (deep comparison of properties).
- **Rationale**:
  - Enforces DDD patterns.
  - `Entity` equality by identity is crucial for tracking lifecycle.
  - `ValueObject` equality by value is crucial for interchangeable data.
- **Alternatives**:
  - Interfaces only: Rejected because we need shared behavior (validation, equality checks) which classes provide better.

### 3. Money Value Object

- **Decision**: Implement a `Money` value object.
  - Internal representation: `amount: number` as an integer representing **minor units** (e.g., cents or yen).
  - Rationale: Prevents floating-point precision errors (e.g., 0.1 + 0.2).
  - Validation: Ensure no negative values.
  - Currency: Default to 'JPY' (no minor units needed for JPY, but the logic should support it).

### 4. SalaryPeriod Value Object

- **Decision**: Implement a `SalaryPeriod` value object.
  - Fields: `month` (1-12) and `year`.
  - Rationale: Encapsulates validation and provides a clear business concept for a "billing month".
  - Methods: `isBefore(other: SalaryPeriod)`, `equals(other: SalaryPeriod)`.

### 5. Repository Interfaces

- **Decision**: Define pure TypeScript interfaces for Repositories.
  - Return types must be Domain Entities (e.g., `Promise<User | null>`), NOT database models.
  - Input types for `save()` must be Domain Entities.
- **Rationale**:
  - Dependency Inversion Principle: The domain defines the contract; infrastructure implements it.
  - Allows mocking repositories for unit tests without a database.

### 5. Error Handling

- **Decision**: Use custom `DomainError` class extending built-in `Error`.
- **Rationale**: allows catching domain-specific errors (validation, rule violations) separately from system errors.

## Unknowns Resolved

- **ID Generation**: Confirmed `crypto` module in Node.js LTS is sufficient.
- **Validation**: Will use standard `throw new Error` or `DomainError` in constructors.
