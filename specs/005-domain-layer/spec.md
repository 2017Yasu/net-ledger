# Specification: Domain Layer Implementation

**Feature**: Create a Standalone Domain Layer (Pure TypeScript)
**Status**: Draft
**Created**: 2026-02-28
**Owner**: Development Team

## 1. Executive Summary

Establish a dedicated "Domain" layer within the application architecture. This layer will contain the core business logic, including Entities, Value Objects, and Repository Interfaces, written in pure TypeScript. It will be strictly decoupled from external frameworks, libraries, and infrastructure concerns (such as databases, ORMs, or UI frameworks).

## Clarifications

### Session 2026-02-28

- Q: How should domain validation errors be handled (e.g., in Value Object constructors)?
  - A: Throw standard or custom Exceptions (e.g., `new Error("Invalid email")`).
- Q: How should Domain Entities be converted to/from persistence models?
  - A: Use manual mapping functions (e.g., `static toDomain(raw: unknown): Entity`) to keep layers decoupled.
- Q: How should entity identity be represented?
  - A: Use an abstract `Entity<T>` base class that handles identity and equality checks (e.g., `id`).
- Q: What type of ID format should be used for Entities?
  - A: UUID v4 strings (allows decentralized generation before DB insert).
- Q: Should the Entity base class strictly validate the ID format?
  - A: Yes, constructors should throw an error if the provided ID is not a valid UUID v4.

### Session 2026-03-01

- Q: Should we explicitly distinguish between "creating new" and "loading existing" entities?
  - A: Yes, use a `static create()` method for new entities (handles defaults/ID generation) and a `static reconstitute()` method for loading existing data from storage. The constructor should be `protected`.
- Q: How should we handle money precision?
  - A: Represent the amount as an integer in minor units (e.g., cents/yen) to avoid floating-point errors.
- Q: Should month and year in SalaryRecord be grouped?
  - A: Yes, use a `SalaryPeriod` Value Object to encapsulate and validate the month/year combination.
- Q: Is SalaryRecord an Aggregate Root?
  - A: Yes, it is treated as an independent Aggregate Root with its own repository, as it has its own lifecycle and is often queried directly.

## 2. Problem Statement

Currently, the application's business logic is likely tightly coupled with infrastructure concerns, such as Prisma ORM models and Next.js API routes. This coupling makes it difficult to:

- Test business rules in isolation (unit testing often requires mocking the database).
- Switch or upgrade infrastructure components without rewriting business logic.
- Clearly understand the core business rules amidst infrastructure code.
- Enforce strict typing and validation rules that are independent of the database schema.

## 3. Goals & Objectives

- **Decouple Business Logic:** Isolate core business rules from infrastructure and UI.
- **Improve Testability:** Enable fast, pure unit tests for all domain logic.
- **Enhance Maintainability:** Create a clear, self-documenting structure for business concepts.
- **Standardize Data Access:** Define strict interfaces for data access that infrastructure layers must implement.

## 4. User Scenarios

Since this is an architectural feature, the "users" are primarily developers.

### Scenario 1: Defining a New Business Rule

**Actor:** Backend Developer
**Action:** Needs to add a rule that "Salary amount cannot be negative."
**Flow:**

1.  Developer opens `src/domain/value-objects/Money.ts` (or similar).
2.  Developer adds validation logic in the constructor/factory method.
3.  Developer writes a unit test in `src/domain/value-objects/Money.spec.ts`.
    **Outcome:** The rule is enforced centrally and tested without spinning up a database.

### Scenario 2: Implementing a Repository

**Actor:** Backend Developer
**Action:** Needs to fetch user data from the database.
**Flow:**

1.  Developer inspects `src/domain/repositories/UserRepository.ts` to understand the required methods (e.g., `findById`).
2.  Developer creates (or updates) an infrastructure class `src/infrastructure/repositories/PrismaUserRepository.ts` that implements this interface.
3.  The TypeScript compiler ensures the implementation matches the domain contract exactly.

### Scenario 3: Reviewing Domain Logic

**Actor:** Lead Architect
**Action:** Reviews the core business model.
**Flow:**

1.  Architect navigates to `src/domain`.
2.  They see clear Entity definitions (e.g., `User`, `SalaryRecord`) describing _what_ the data is and _how_ it behaves.
3.  They see no `@Prisma` decorators, `react` hooks, or HTTP handling logic.

## 5. Functional Requirements

### 5.1. Directory Structure

- Create a root-level or source-level directory `src/domain`.
- Organize subdirectories for `entities`, `value-objects`, and `repositories`.

### 5.2. Base Abstractions

- **Entity:** Implement an abstract `Entity<T>` base class that enforces unique identity using strictly validated UUID v4 strings (throw error on invalid format) and provides `equals()` methods for entity comparison.
- **Value Object:** Define a base class or type for Value Objects, ensuring structural equality and immutability (readonly properties).

### 5.3. Core Domain Elements

- **Entities:** Define core entities such as `User` and `SalaryRecord` as pure TypeScript classes/types.
  - **Encapsulation:** State changes MUST be performed through named domain methods (e.g., `changeEmail()`) rather than direct property assignment to protect invariants.
- **Value Objects:** Define value objects for complex attributes (e.g., `Email`, `Money`, `SalaryPeriod`) where validation is required.
  - **Immutability:** All properties MUST be `readonly`.
- **Repository Interfaces:** Define interfaces for `UserRepository` and `SalaryRecordRepository`.
  - Methods should include standard CRUD operations (e.g., `save`, `findById`, `findAll`).
  - Method signatures must use Domain Entities, not ORM types.

### 5.4. Decoupling Rules

- **No External Frameworks:** Files in `src/domain` MUST NOT import from `prisma`, `@prisma/client`, `react`, `next`, `express`, or similar libraries.
- **Pure TypeScript:** Logic must rely solely on standard TypeScript/JavaScript features and internal domain definitions.

## 6. Technical Considerations

- **Mapping:** Use manual, pure mapping functions (e.g., `toDomain` / `toPersistence`) to convert between "Domain Entities" and "Database Models". Avoid leaking Prisma types into Entity constructors.
- **Validation:** Domain objects should validate themselves upon creation (e.g., "invalid email format" should throw an error in the `Email` value object constructor).
- **Error Handling:** Use standard `Error` or custom domain-specific error classes for validation failures (e.g., `DomainValidationError`). Do not use Result/Either patterns to keep dependencies zero.

## 7. Success Criteria

- [ ] **Directory Created:** `src/domain` exists with the specified subdirectories.
- [ ] **Zero Dependencies:** A check of `package.json` or imports confirms no runtime dependencies are used within the `src/domain` folder (dev dependencies like testing libs are allowed in test files).
- [ ] **Core Definitions:** `User` and `SalaryRecord` entities are defined with appropriate properties and validation.
- [ ] **Interfaces Defined:** `UserRepository` and `SalaryRecordRepository` interfaces are defined and exportable.
- [ ] **Unit Tests:** At least one unit test exists for a Domain Entity or Value Object proving it can be instantiated and validated in isolation.

## 8. Assumptions

- The project uses TypeScript.
- Existing features (Auth, Dashboard) will eventually be refactored to use this layer, but that full refactoring is outside the scope of _this_ specific specification (unless this spec is defining the start of that refactoring). This spec focuses on _establishing_ the layer.
