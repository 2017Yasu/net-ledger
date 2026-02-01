# Tasks: User Dashboard

**Input**: Design documents from `/specs/003-user-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions.

## Path Conventions

- **Single project**: `src/`
- **Tests**: `tests/unit`, `tests/e2e`, `tests/integration`
- Paths shown below assume the standard Next.js App Router structure.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies for the feature.

- [x] T001 Install `recharts` and its types (`@types/recharts`) for the salary trend chart.

---

## Phase 2: User Stories 1 & 2 - MVP Dashboard (Priority: P1) 🎯 MVP

**Goal**: A logged-in user is redirected to a dashboard page at `/dashboard` where they can see a summary of their most recent salary information.
**Independent Test**: After a successful login, the user lands on the dashboard and sees a card displaying their Gross Pay, Net Pay, and Pay Date from their latest salary record.

### Implementation for User Stories 1 & 2

- [x] T002 [US1] Create the dashboard page file at `src/app/(pages)/dashboard/page.tsx`.
- [x] T003 [US1] Implement redirection logic to send logged-in users from the root `/` to the `/dashboard` page. This may involve updates to `src/app/page.tsx` or middleware.
- [x] T004 [P] [US2] Create the UI component `SalarySummaryCard` in `src/components/SalarySummaryCard.tsx`. This component will display Gross Pay, Net Pay, and Pay Date.
- [x] T005 [P] [US2] Write unit tests for the `SalarySummaryCard` component in `tests/unit/SalarySummaryCard.test.tsx`.
- [x] T006 [US2] In `src/app/(pages)/dashboard/page.tsx`, implement the server-side data fetching logic to retrieve the most recent `SalaryRecord` for the logged-in user using Prisma.
- [x] T007 [US2] Integrate the `SalarySummaryCard` component into the dashboard page, passing the fetched salary data as props.
- [x] T008 [US2] Implement the UI for the case where no salary records are found, as per FR-005 (display a message and a call-to-action).
- [x] T009 [US2] Implement the UI to display "N/A" for null or missing salary fields, as per FR-008.

### Tests for User Stories 1 & 2

- [x] T010 [US1, US2] Write an integration test for the dashboard page in `tests/integration/dashboard.test.ts` to verify data fetching and component rendering.
- [x] T011 [US1, US2] Write an E2E test in `tests/e2e/dashboard.spec.ts` that covers the user logging in and being redirected to the dashboard, verifying the salary summary is displayed.

**Checkpoint**: At this point, User Stories 1 and 2 should be fully functional and passing all tests independently.

---

## Phase 3: User Story 3 - Salary Trend Chart (Priority: P2)

**Goal**: The user can see a visual trend chart of their salary over the last 12 months.
**Independent Test**: On the dashboard, a chart is visible displaying the `Gross Pay` for each of the last 12 months for which data is available.

### Implementation for User Story 3

- [x] T012 [P] [US3] Create the UI component `SalaryTrendChart` in `src/components/SalaryTrendChart.tsx` using `recharts`.
- [x] T013 [P] [US3] Write unit tests for the `SalaryTrendChart` component in `tests/unit/SalaryTrendChart.test.tsx`.
- [x] T014 [US3] In `src/app/(pages)/dashboard/page.tsx`, extend the server-side data fetching to retrieve salary records from the last 12 months.
- [x] T015 [US3] Integrate the `SalaryTrendChart` component into the dashboard page, passing the fetched salary history as props.

### Tests for User Story 3

- [x] T016 [US3] Update the integration test in `tests/integration/dashboard.test.ts` to verify the `SalaryTrendChart` component renders correctly with data.
- [x] T017 [US3] Update the E2E test in `tests/e2e/dashboard.spec.ts` to assert that the chart is visible on the dashboard.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T018 [P] Ensure all new components and pages adhere to WCAG 2.1 AA accessibility standards.
- [x] T019 [P] Add required logging for dashboard views and data fetching errors as per NFR-004.
- [x] T020 Review and optimize the performance of the dashboard page, ensuring it meets the LCP goal (< 2.5s).
- [x] T021 Perform a final code cleanup and refactoring based on review feedback.

---

## Dependencies & Parallel Execution

- **Dependencies**:
  - `Phase 3 (US3)` depends on the completion of `Phase 2 (US1, US2)`.
- **Parallel Opportunities**:
  - Within each phase, tasks marked with **[P]** can be executed in parallel. For example, in Phase 2, `T004` (SalarySummaryCard component) and `T005` (unit tests for it) can be worked on concurrently with the page creation and data fetching logic (`T002`, `T006`).

## Implementation Strategy

1.  **Complete Phase 1**: Install the new dependency.
2.  **Implement Phase 2 (MVP)**: Focus on completing all tasks for User Stories 1 and 2. This delivers the core value of the feature.
    - Write failing tests first where applicable.
    - Implement the feature until tests pass.
3.  **Validate MVP**: The dashboard should be fully functional and testable as an independent increment.
4.  **Implement Phase 3**: Add the salary trend chart.
5.  **Final Polish**: Address cross-cutting concerns before finalizing the feature.
