# Tasks: Domain Layer Implementation

**Input**: Design documents from `specs/005-domain-layer/`
**Prerequisites**: plan.md, spec.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions.

## Path Conventions

- **Source**: `src/domain/`
- **Tests**: `tests/unit/domain/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [x] T001 Create domain layer directory structure in `src/domain/entities`, `src/domain/value-objects`, `src/domain/repositories`, and `src/domain/shared`.
- [x] T002 [P] Verify development environment supports `crypto.randomUUID()` and Jest is configured for TypeScript.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [x] T003 [P] Implement `DomainError` base class in `src/domain/shared/DomainError.ts`.
- [x] T004 [P] Implement `ValueObject` abstract base class for structural equality in `src/domain/shared/ValueObject.ts`.
- [x] T005 [P] Implement `Entity` abstract base class with UUID v4 identity and equality in `src/domain/shared/Entity.ts`.

---

## Phase 3: User Story 1 - Value Objects (Priority: P1) 🎯 MVP

**Goal**: Encapsulate domain primitives (like Money and Email) with validation logic and structural equality.
**Independent Test**: Instantiate `Money`, perform arithmetic, and verify equality/validation without external dependencies.

### Tests for User Story 1

- [x] T006 [P] [US1] Unit test for `Money` value object in `tests/unit/domain/value-objects/Money.test.ts`.
- [x] T007 [P] [US1] Unit test for `SalaryPeriod` in `tests/unit/domain/value-objects/SalaryPeriod.test.ts`.
- [x] T008 [P] [US1] Unit test for `Email` in `tests/unit/domain/value-objects/Email.test.ts`.

### Implementation for User Story 1

- [x] T009 [P] [US1] Implement `Money` value object with minor units integer representation in `src/domain/value-objects/Money.ts`.
- [x] T010 [P] [US1] Implement `SalaryPeriod` value object (month/year validation) in `src/domain/value-objects/SalaryPeriod.ts`.
- [x] T011 [P] [US1] Implement `Email` value object with format validation in `src/domain/value-objects/Email.ts`.

---

## Phase 4: User Story 2 - Domain Entities (Priority: P1)

**Goal**: Define core business entities (User, SalaryRecord) with unique identity and lifecycle management.
**Independent Test**: Instantiate `User` and `SalaryRecord`, verify identity equality, and ensure invariants are protected.

### Tests for User Story 2

- [x] T012 [P] [US2] Unit test for `User` entity (create vs reconstitute, toPersistence mapping) in `tests/unit/domain/entities/User.test.ts`.
- [x] T013 [P] [US2] Unit test for `SalaryRecord` entity in `tests/unit/domain/entities/SalaryRecord.test.ts`.

### Implementation for User Story 2

- [x] T014 [P] [US2] Implement `User` entity with `static create()`, `static reconstitute()`, and `toPersistence()` in `src/domain/entities/User.ts`.
- [x] T015 [P] [US2] Implement `SalaryRecord` entity using `SalaryPeriod` and `Money` in `src/domain/entities/SalaryRecord.ts`.

---

## Phase 5: User Story 3 - Repository Interfaces (Priority: P2)

**Goal**: Define the contract for data access, decoupling the domain from infrastructure.
**Independent Test**: Use interfaces in a mock service or test to verify the domain layer can define its own data needs.

### Implementation for User Story 3

- [x] T016 [P] [US3] Define `UserRepository` interface with standard operations (save, findById) in `src/domain/repositories/UserRepository.ts`.
- [x] T017 [P] [US3] Define `SalaryRecordRepository` interface with queries (save, findById, findByUserId) in `src/domain/repositories/SalaryRecordRepository.ts`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [x] T018 [P] Verify zero external dependencies (no prisma, next, react) in `src/domain` using a script or manual audit.
- [x] T019 [P] Run `pnpm format` to ensure style consistency.
- [x] T020 [P] Run `pnpm check` to verify linting, types, and tests pass. (Note: integration tests were already failing but lint/typecheck/domain unit tests pass).

---

## Implementation Strategy

1.  **Complete Phase 1 & 2**: Establish the base abstractions which all entities and value objects depend on.
2.  **Implement US1 (Value Objects)**: Core primitives like `Money` and `Email`.
3.  **Implement US2 (Entities)**: Build the core business model with lifecycle and mapping logic.
4.  **Implement US3 (Repositories)**: Define the persistence contracts.
5.  **Validate**: Ensure the domain layer is pure and testable in isolation.

## Dependencies

- Phase 2 (Foundational) blocks US1 and US2.
- US1 (Value Objects) blocks US2 (Entities) because `SalaryRecord` depends on `Money`.
- US2 (Entities) blocks US3 (Repositories) because repository interfaces return entities.
