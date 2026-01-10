# Tasks: Salary Recorder Feature Implementation

**Feature Name**: Salary Recorder
**Branch**: `001-salary-recorder`
**Date**: 2026-01-05
**Input**: `plan.md`, `spec.md`, `data-model.md`, `contracts/openapi.yml`, `research.md`, `quickstart.md`

## Summary

This document outlines the sequential and parallelizable tasks required to implement the Salary Recorder feature, organized by development phase and user story. The implementation follows a phased approach, prioritizing core functionalities and ensuring test coverage at each stage.

## Phases

### Phase 1: Setup

_Goal_: Initialize project structure, development tools, and database configuration.

- [x] T001 Create project structure as per `plan.md` and `quickstart.md` (`src/app/`, `tests/` directories).
- [x] T002 Configure ESLint, Prettier, and TypeScript per `constitution.md` and `plan.md` (e.g., `.eslintrc.js`, `prettier.config.js`, `tsconfig.json`).
- [x] T003 Set up Docker Compose for PostgreSQL database in `docker/compose.yml`.
- [x] T004 Configure Prisma ORM by creating `prisma/schema.prisma` with initial `User` and `SalaryRecord` models.
- [x] T005 Create initial Prisma migration for `User` and `SalaryRecord` models (`prisma/migrations/`).
- [x] T006 Configure environment variables (`.env`, `.env.example`).

### Phase 2: Foundational

_Goal_: Establish core database connection and authentication utilities as prerequisites for all user stories.

- [x] T007 Implement database connection utility in `src/lib/prisma.ts`.
- [x] T008 Implement authentication service/utility (e.g., JWT token handling, password hashing) in `src/lib/auth.ts`.

### Phase 3: User Story 1 - Secure User Authentication (Priority: P1)

_Story Goal_: As a user, I want to securely log in to the application using my username and password so that I can access my personal salary information.
_Independent Test Criteria_: A user can register, log in, and log out. An unauthorized user cannot access any salary data.

- [x] T009 [US1] Define Prisma `User` model with attributes (`id`, `username`, `passwordHash`, `createdAt`, `updatedAt`) in `prisma/schema.prisma`.
- [x] T010 [P] [US1] Create API route for user registration (`POST /api/auth/register`) in `src/app/api/auth/register/route.ts`.
- [x] T011 [P] [US1] Create API route for user login (`POST /api/auth/login`) in `src/app/api/auth/login/route.ts`.
- [x] T012 [P] [US1] Create API route for user logout (`POST /api/auth/logout`) in `src/app/api/auth/logout/route.ts`.
- [x] T013 [P] [US1] Implement `LoginForm` component using Material-UI in `src/app/(components)/ui/LoginForm.tsx`.
- [x] T014 [P] [US1] Implement `RegistrationForm` component using Material-UI in `src/app/(components)/ui/RegistrationForm.tsx`.
- [x] T015 [P] [US1] Create authentication pages for login and registration in `src/app/(pages)/auth/login/page.tsx` and `src/app/(pages)/auth/register/page.tsx`.
- [x] T016 [US1] Implement authentication context/state management (e.g., Zustand/React Context) in `src/lib/auth-context.ts`.
- [x] T017 [US1] Implement client-side authentication logic and API integration for `LoginForm` and `RegistrationForm`.
- [x] T018 [US1] Implement route protection middleware for authenticated routes in `src/middleware.ts`.
- [x] T019 [US1] Write unit tests for authentication utilities in `tests/unit/auth.test.ts`.
- [x] T020 [US1] Write integration tests for API authentication routes in `tests/integration/api/auth.test.ts`.
- [x] T021 [US1] Write E2E tests for user registration, login, and logout flows in `tests/e2e/auth.spec.ts`.

### Phase 4: User Story 2 - Record Monthly Salary Information (Priority: P1)

_Story Goal_: As a logged-in user, I want to create or update my salary information for a specific month so that I have an accurate record of my earnings and deductions.
_Independent Test Criteria_: A user can fill out and save the salary form for a given month. The saved data is retrieved accurately when the user revisits the form.

- [x] T022 [US2] Define Prisma `SalaryRecord` model with all specified attributes in `prisma/schema.prisma`.
- [x] T023 [P] [US2] Create API route for `POST /api/salary` (create salary record) in `src/app/api/salary/route.ts`.
- [x] T024 [P] [US2] Create API route for `PUT /api/salary/{recordId}` (update salary record) in `src/app/api/salary/[recordId]/route.ts`.
- [x] T025 [P] [US2] Implement `SalaryForm` component using Material-UI in `src/app/(components)/ui/SalaryForm.tsx`.
- [x] T026 [P] [US2] Create "Record Salary" page in `src/app/(pages)/salary/record/page.tsx`.
- [x] T027 [US2] Implement client-side logic for `SalaryForm` submission and data fetching.
- [x] T028 [US2] Implement server-side validation for `SalaryRecord` creation/update (e.g., non-negative values, month/year range).
- [x] T029 [US2] Write unit tests for `SalaryRecord` model validation logic.
- [x] T030 [US2] Write integration tests for `SalaryRecord` API routes in `tests/integration/api/salary.test.ts`.
- [x] T031 [US2] Write E2E tests for creating and updating salary records in `tests/e2e/salary-record.spec.ts`.

### Phase 5: User Story 3 - View Historical Salary Data (Priority: P2)

_Story Goal_: As a logged-in user, I want to view a list of my past salary records and inspect the details of each one so that I can track my earnings over time.
_Independent Test Criteria_: A user can see a list of months for which they have recorded salary and can click on one to view the full details.

- [x] T032 [P] [US3] Create API route for `GET /api/salary` (list salary records) in `src/app/api/salary/route.ts`.
- [x] T033 [P] [US3] Create API route for `GET /api/salary/{recordId}` (get single salary record) in `src/app/api/salary/[recordId]/route.ts`.
- [x] T034 [P] [US3] Implement `SalaryHistoryList` component using Material-UI in `src/app/(components)/ui/SalaryHistoryList.tsx`.
- [x] T035 [P] [US3] Implement `SalaryDetailView` component using Material-UI in `src/app/(components)/ui/SalaryDetailView.tsx`.
- [x] T036 [P] [US3] Create "History" page in `src/app/(pages)/salary/history/page.tsx`.
- [x] T037 [P] [US3] Create "Salary Detail" page in `src/app/(pages)/salary/history/[recordId]/page.tsx`.
- [x] T038 [US3] Implement data fetching for historical records (SSR/CSR as per `research.md`).
- [x] T039 [US3] Write E2E tests for viewing historical salary data in `tests/e2e/salary-history.spec.ts`.

### Final Phase: Polish & Cross-Cutting Concerns

_Goal_: Address non-functional requirements, optimize, and finalize documentation.

- [x] T040 [P] Implement global error handling (e.g., `src/app/error.tsx`).
- [x] T041 [P] Implement logging for key events (e.g., user login, record creation, updates) in `src/lib/logger.ts`.
- [x] T042 [P] Ensure all UI components adhere to WCAG 2.1 AA accessibility standards.
- [x] T043 [P] Review and optimize application for performance (e.g., bundle size, data fetching).
- [x] T044 Final documentation updates and `README.md` (`README.md`).

## Dependencies

- Phase 1 (Setup) -> Phase 2 (Foundational) -> Phase 3 (US1) -> Phase 4 (US2) -> Phase 5 (US3) -> Final Phase
- Within each User Story phase, tasks generally follow: Model/API -> UI Components -> Pages -> Client-side Logic -> Tests.
- Parallelizable tasks (`[P]`) within a phase can be worked on concurrently if they don't have direct file-based dependencies.

## Parallel Execution Examples

- **Phase 3 (US1)**: T010, T011, T012 (API routes) can be developed in parallel with T013, T014 (UI components).
- **Phase 4 (US2)**: T023, T024 (API routes) can be developed in parallel with T025 (UI component).
- **Phase 5 (US3)**: T032, T033 (API routes) can be developed in parallel with T034, T035 (UI components).

## Implementation Strategy

The implementation will follow an MVP-first approach, delivering each user story incrementally. User Story 1 (Secure User Authentication) is the initial MVP, providing a functional core for subsequent features. User Story 2 (Record Monthly Salary Information) builds upon this, followed by User Story 3 (View Historical Salary Data). Cross-cutting concerns and polish will be addressed in the final phase.
