# Implementation Plan: User Dashboard

**Branch**: `003-user-dashboard` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-user-dashboard/spec.md`

## Summary

This feature introduces a user dashboard that will be the first page a user sees after logging in. The dashboard will display a summary of the user's most recent salary and a trend chart showing their gross pay over the last 12 months. The implementation will be a server-rendered Next.js page, fetching data directly using Prisma.

## Technical Context

**Language/Version**: TypeScript (latest), Node.js (LTS)
**Primary Dependencies**: Next.js, React, Material-UI, Prisma, recharts
**Storage**: PostgreSQL
**Testing**: Jest (Unit), React Testing Library (Unit/Integration), Playwright (E2E)
**Target Platform**: Web (Modern Browsers)
**Performance Goals**: Core Web Vitals (LCP < 2.5s)
**Constraints**: Must follow WCAG 2.1 AA accessibility standards.
**Scale/Scope**: 1 user's data, up to 1000 salary records.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **[X] I. Code Quality**: Does the plan account for strict TypeScript, ESLint, and Prettier standards?
- **[X] II. Testing**: Does the plan include tasks for unit, integration, and E2E tests for the feature?
- **[X] III. UX Consistency**: Does the plan leverage the existing Material-UI component library for all UI development? A charting library (`recharts`) will be used.
- **[X] IV. Performance**: Has the appropriate Next.js rendering strategy (SSR, SSG, ISR) been chosen and justified for new pages? (SSR is chosen for dynamic, user-specific data).
- **[X] V. Git Practices**: Is the work broken down into small, logical PRs suitable for Conventional Commits?
- **[X] VI. Next.js Platform Specifics**: Does the plan account for Next.js 16 Proxy functionality and usage of src/proxy.ts? (Not required for this feature).

## Project Structure

### Documentation (this feature)

```text
specs/003-user-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Standard Next.js App Router Structure
src/
├── app/
│   ├── (pages)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── layout.tsx
├── components/
│   ├── SalarySummaryCard.tsx
│   └── SalaryTrendChart.tsx
...
tests/
├── e2e/
│   └── dashboard.spec.ts
├── integration/
│   └── dashboard.test.ts
└── unit/
    ├── SalarySummaryCard.test.tsx
    └── SalaryTrendChart.test.tsx
```

**Structure Decision**: The project will follow the standard Next.js App Router structure. New components will be created for the dashboard. A new page will be created at `/dashboard`.

## Complexity Tracking

No violations to the constitution.
