# Implementation Plan: Salary Recorder

**Branch**: `001-salary-recorder` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/nakayamayasuaki/workplace/apps/net-ledger/specs/001-salary-recorder/spec.md`

## Summary

This plan outlines the technical approach for building the Salary Recorder application. The primary goal is to create a secure, user-friendly application for users to log in and record their monthly salary information. The plan includes research for setting up the development environment, a data model design, API contracts, and a quickstart guide.

## Technical Context

**Language/Version**: TypeScript (latest), Node.js (LTS)
**Primary Dependencies**: Next.js, React, @mui/material, @emotion/react, @emotion/styled, Prettier, ESLint
**Storage**: PostgreSQL
**Testing**: Jest (Unit), React Testing Library (Unit/Integration), Playwright (E2E)
**Target Platform**: Web (Modern Browsers)
**Project Type**: Web Application
**Performance Goals**: Core Web Vitals (LCP < 2.5s), Lighthouse Score > 90
**Constraints**: Must follow WCAG 2.1 AA accessibility standards. Bundle size increase requires justification.
**Scale/Scope**: Initial launch for ~1000 users.
**Project Management**: pnpm
**Code Quality**: [NEEDS CLARIFICATION: Proper configuration for ESLint and Prettier, and scripts for type-checking and formatting in package.json]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **[ ] I. Code Quality**: Does the plan account for strict TypeScript, ESLint, and Prettier standards?
- **[ ] II. Testing**: Does the plan include tasks for unit, integration, and E2E tests for the feature?
- **[ ] III. UX Consistency**: Does the plan leverage the existing Material-UI component library for all UI development?
- **[ ] IV. Performance**: Has the appropriate Next.js rendering strategy (SSR, SSG, ISR) been chosen and justified for new pages?
- **[ ] V. Git Practices**: Is the work broken down into small, logical PRs suitable for Conventional Commits?

## Project Structure

### Documentation (this feature)

```text
specs/001-salary-recorder/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Standard Next.js App Router Structure
app/
├── (api)/               # API Routes
├── (components)/        # UI Components (Server & Client)
│   ├── layout/
│   └── ui/
├── (features)/          # Feature-specific modules
└── (pages)/             # Main page routes
    └── [feature-name]/
        ├── page.tsx
        └── layout.tsx

tests/
├── e2e/                 # Playwright E2E tests
├── integration/         # Integration tests
└── unit/                # Jest/RTL unit tests
```

**Structure Decision**: The project will follow the standard Next.js App Router structure, co-locating components, features, and pages as shown.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| | | |
| | | |
