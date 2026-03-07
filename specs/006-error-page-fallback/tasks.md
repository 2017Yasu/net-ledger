# Tasks: Global Error Page Fallback

## Phase 1: Setup

- [x] T001 Create error page directory in `src/app/(pages)/error`
- [x] T002 Initialize `src/app/(pages)/error/page.tsx` as a Client Component per NFR-005
- [x] T003 Create `src/components/ErrorDisplay.tsx` for shared error UI

## Phase 2: Foundational

- [x] T004 Implement `ErrorDisplay` using Material-UI components with a minimal text-only layout in `src/components/ErrorDisplay.tsx`
- [x] T005 Add "Back to Dashboard" button logic in `ErrorDisplay.tsx` using Next.js `Link` or `router.push('/dashboard')`
- [x] T006 Implement error message mapping logic (400, 401, 403, 500) in `ErrorDisplay.tsx` or a helper utility
- [x] T020 [P] Create unit tests for `ErrorDisplay` component and message mapping in `tests/unit/ErrorDisplay.test.tsx`

## Phase 3: User Story 1 - Graceful Error Handling [US1] (Priority: P1)

**Story Goal**: Redirect unhandled server-side page rendering errors to `/error`.
**Independent Test**: Trigger a runtime error in any page and verify redirection to `/error`.

- [x] T007 [P] [US1] Create `src/app/error.tsx` as a client-side error boundary
- [x] T008 [US1] Implement `useEffect` in `src/app/error.tsx` to redirect to `/error?code=500` upon catching an error
- [x] T009 [P] [US1] Create `src/app/global-error.tsx` to catch errors in the root layout
- [x] T010 [US1] Implement redirection logic in `src/app/global-error.tsx` similar to `error.tsx`

## Phase 4: User Story 2 - Error Code Display [US2] (Priority: P2)

**Story Goal**: Display meaningful messages based on the `code` parameter.
**Independent Test**: Navigate to `/error?code=403` and verify "Forbidden" message is displayed.

- [x] T011 [US2] Update `src/app/(pages)/error/page.tsx` to read `code` from `useSearchParams`
- [x] T012 [US2] Integrate `ErrorDisplay` component into `src/app/(pages)/error/page.tsx` passing the `code` parameter
- [x] T013 [US2] Implement default "Unexpected Error" message for missing or unknown codes in `ErrorDisplay.tsx`

## Phase 5: User Story 3 - API Error Isolation [US3] (Priority: P1)

**Story Goal**: Ensure API errors return JSON and do not trigger HTML redirection.
**Independent Test**: Call an API that returns 500 and verify JSON response and no browser redirect.

- [x] T014 [US3] Verify that `src/app/api` routes are not intercepted by the global `error.tsx` redirection (Next.js default behavior check)
- [x] T021 [US3] Verify that 404 errors continue to trigger `not-found.tsx` and are NOT intercepted by the global error boundary
- [x] T015 [US3] Add a manual test case in `tests/e2e/error-handling.spec.ts` (if Playwright is used) to verify API error isolation

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T016 [P] Add internal logging for error events in `src/app/error.tsx` and `global-error.tsx` per NFR-004
- [x] T022 [P] Perform accessibility audit (WCAG 2.1 AA) for the error page using automated tools and manual keyboard navigation check
- [x] T017 Ensure no sensitive details are leaked in the error page per NFR-003
- [x] T018 Run `pnpm format` to ensure code style consistency
- [x] T019 Run `pnpm check` to validate types, linting, and tests

## Dependency Graph

- US1 (Foundational) -> US2 (Refinement)
- US3 (Isolation) is independent of UI stories.

## Parallel Execution Examples

- US1 and US3 implementation can start in parallel after Phase 1.
- T007, T009, and T016 can be worked on concurrently as they involve different files.
- UI development (Phase 2) can happen while US1 redirection logic is being implemented.

## Implementation Strategy

1. **MVP**: Implement `error.tsx` with a basic redirect to a skeleton `/error` page.
2. **Incremental**: Add `ErrorDisplay` with full message mapping and "Back to Dashboard" button.
3. **Verify**: Use the methods described in `quickstart.md` to validate each story.
