---
description: "Task list for implementing the Salary Recorder feature."
---

# Tasks: Salary Recorder

**Input**: Design documents from `/specs/001-salary-recorder/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions.

## Path Conventions

- **Source**: `app/`
- **Tests**: `tests/unit`, `tests/e2e`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure the development environment and install dependencies.

- [ ] T001 Create a `docker/compose.yml` file for the PostgreSQL container.
- [ ] T002 Create `eslint.config.mjs` with the configuration from `research.md`.
- [ ] T003 Create `.prettierrc.json` with the configuration from `research.md`.
- [ ] T004 Update `package.json` with the scripts for linting, formatting, and type-checking from `research.md`.
- [ ] T005 Run `pnpm install` to ensure all dependencies from `plan.md` are installed.
- [ ] T006 Set up Jest and Playwright testing environments.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T007 [P] Initialize Prisma and create the initial schema in `prisma/schema.prisma` based on `data-model.md`, connecting to the PostgreSQL container.
- [ ] T008 Run `pnpm prisma migrate dev` to create the initial database migration.
- [ ] T009 [P] Configure NextAuth.js for authentication in `app/api/auth/[...nextauth]/route.ts`.
- [ ] T010 [P] Create shared layout components in `app/(components)/layout/`.
- [ ] T011 [P] Configure a shared logging service.

---

## Phase 3: User Story 1 - Secure User Authentication (Priority: P1) 🎯 MVP

**Goal**: Allow users to securely register and log in.
**Independent Test**: A new user can create an account, log in, and see a welcome message. An existing user can log in.

### Tests for User Story 1
- [ ] T012 [P] [US1] Unit test for the `LoginForm` component in `tests/unit/LoginForm.test.tsx`.
- [ ] T013 [P] [US1] E2E test for the registration and login flow in `tests/e2e/auth.spec.ts`.

### Implementation for User Story 1
- [ ] T014 [P] [US1] Create the `User` model in the `prisma/schema.prisma` file if not already present.
- [ ] T015 [US1] Implement the `POST /api/auth/register` endpoint in `app/api/auth/register/route.ts`.
- [ ] T016 [US1] Implement the `POST /api/auth/login` endpoint logic within the NextAuth.js configuration.
- [ ] T017 [P] [US1] Create the `RegistrationForm` component in `app/(components)/ui/RegistrationForm.tsx`.
- [ ] T018 [P] [US1] Create the `LoginForm` component in `app/(components)/ui/LoginForm.tsx`.
- [ ] T019 [US1] Create the registration page at `app/(pages)/register/page.tsx`.
- [ ] T020 [US1] Create the login page at `app/(pages)/login/page.tsx`.

---

## Phase 4: User Story 2 - Record Monthly Salary Information (Priority: P1)

**Goal**: Allow users to create and update their monthly salary records.
**Independent Test**: A logged-in user can fill out and save the salary form.

### Tests for User Story 2
- [ ] T021 [P] [US2] Unit test for the `SalaryForm` component in `tests/unit/SalaryForm.test.tsx`.
- [ ] T022 [P] [US2] E2E test for creating and updating a salary record in `tests/e2e/salary.spec.ts`.

### Implementation for User Story 2
- [ ] T023 [P] [US2] Create the `SalaryRecord` model in the `prisma/schema.prisma` file.
- [ ] T024 [US2] Implement the `POST /api/salary` endpoint in `app/api/salary/route.ts`.
- [ ] T025 [US2] Implement the `PUT /api/salary/{recordId}` endpoint in `app/api/salary/[recordId]/route.ts`.
- [ ] T026 [P] [US2] Create the `SalaryForm` component in `app/(components)/ui/SalaryForm.tsx`.
- [ ] T027 [US2] Create the salary recording page at `app/(pages)/salary/record/page.tsx`.

---

## Phase 5: User Story 3 - View Historical Salary Data (Priority: P2)

**Goal**: Allow users to view their past salary records.
**Independent Test**: A logged-in user can view a list of their past records and see the details of a single record.

### Tests for User Story 3
- [ ] T028 [P] [US3] Unit test for the `SalaryHistoryList` component in `tests/unit/SalaryHistoryList.test.tsx`.
- [ ] T029 [P] [US3] E2E test for viewing the salary history in `tests/e2e/history.spec.ts`.

### Implementation for User Story 3
- [ ] T030 [US3] Implement the `GET /api/salary` endpoint in `app/api/salary/route.ts`.
- [ ] T031 [US3] Implement the `GET /api/salary/{recordId}` endpoint in `app/api/salary/[recordId]/route.ts`.
- [ ] T032 [P] [US3] Create the `SalaryHistoryList` component in `app/(components)/ui/SalaryHistoryList.tsx`.
- [ ] T033 [P] [US3] Create the `SalaryDetailView` component in `app/(components)/ui/SalaryDetailView.tsx`.
- [ ] T034 [US3] Create the history page at `app/(pages)/salary/history/page.tsx`.

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T035 [P] Add documentation for all new components.
- [ ] T036 Refactor code based on peer review feedback.
- [ ] T037 Perform a final accessibility audit.
- [ ] T038 Perform a performance review of the application.

---

## Implementation Strategy

1.  **Complete Phase 1 & 2**: The foundational setup is critical and blocks all feature work.
2.  **Implement User Story 1**: Write failing tests, then implement the feature until tests pass.
3.  **Validate MVP**: Test User Story 1 independently. This is the MVP.
4.  **Iterate**: Continue with User Stories 2 and 3, following the same test-first process.
