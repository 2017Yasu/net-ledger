---
description: "Task list template for feature implementation in a Next.js project."
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions.

## Path Conventions

- **Single project**: `src/`
- **Tests**: `tests/unit`, `tests/e2e`
- Paths shown below assume the standard Next.js App Router structure.
- **Next.js Proxy**: Use `src/proxy.ts` for proxy (formerly middleware) functionality.
- **Client Components**: All components in `src/app/(pages)` MUST be client components (`'use client'`).
- **Auth Handling**: Ensure protected pages prompt the user to login again if unauthorized.

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2...)
  - The technical design from plan.md

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [ ] T001 Initialize Next.js project structure per the implementation plan.
- [ ] T002 Configure ESLint, Prettier, and TypeScript settings (`tsconfig.json`).
- [ ] T003 Install and configure core dependencies like Material-UI and Zustand (if needed).
- [ ] T004 Set up Jest and Playwright testing environments.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T005 Set up database schema and migrations (e.g., using Prisma).
- [ ] T006 Implement authentication/authorization using NextAuth.js.
- [ ] T007 Create shared layout components in `app/(components)/layout/`.
- [ ] T008 Configure a shared logging service and error handling framework.

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]
**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (Constitution-Mandated) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation.**

- [ ] T010 [P] [US1] Unit test for `<ComponentName>` in `tests/unit/components.test.tsx`.
- [ ] T011 [P] [US1] E2E test for the complete user flow in `tests/e2e/user-story-1.spec.ts`.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create UI component `<ComponentName>` in `app/(components)/ui/Component.tsx`.
- [ ] T013 [US1] Create feature page at `app/(pages)/feature-name/page.tsx`.
- [ ] T014 [US1] Implement state management logic for the feature.
- [ ] T015 [US1] Implement data fetching logic (e.g., using React Query or SWR).
- [ ] T016 [US1] Add accessibility (a11y) props and perform validation with `axe-core`.
- [ ] T017 [US1] Add required logging and instrumentation for observability.

**Checkpoint**: At this point, User Story 1 should be fully functional and passing all its tests independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] TXXX [P] Documentation updates for new components.
- [ ] TXXX Code cleanup and refactoring based on review feedback.
- [ ] TXXX Performance review and optimization.
- [ ] TXXX Final security and accessibility audit.
- [ ] TXXX [P] Run `pnpm format` to ensure style consistency.
- [ ] TXXX [P] Run `pnpm check` to verify linting, types, and tests pass.

---

## Implementation Strategy

1.  **Complete Phase 1 & 2**: The foundational setup is critical and blocks all feature work.
2.  **Implement User Story 1**:
    - Write failing tests for the user story.
    - Implement the feature until tests pass.
    - Conduct a peer review.
3.  **Validate MVP**: Test the first user story independently and deploy/demo if ready.
4.  **Iterate**: Continue with the next user stories, following the same test-first process.
