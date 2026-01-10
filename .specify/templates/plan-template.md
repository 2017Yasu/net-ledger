# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript (latest), Node.js (LTS)
**Primary Dependencies**: Next.js, React, Jest, React Testing Library, Playwright, Material-UI
**Storage**: PostgreSQL
**Testing**: Jest (Unit), React Testing Library (Unit/Integration), Playwright (E2E)
**Target Platform**: Web (Modern Browsers)
**Project Type**: Web Application
**Performance Goals**: Core Web Vitals (LCP < 2.5s), Lighthouse Score > 90
**Constraints**: Must follow WCAG 2.1 AA accessibility standards. Bundle size increase requires justification.
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **[ ] I. Code Quality**: Does the plan account for strict TypeScript, ESLint, and Prettier standards?
- **[ ] II. Testing**: Does the plan include tasks for unit, integration, and E2E tests for the feature?
- **[ ] III. UX Consistency**: Does the plan leverage the existing Material-UI component library for all UI development?
- **[ ] IV. Performance**: Has the appropriate Next.js rendering strategy (SSR, SSG, ISR) been chosen and justified for new pages?
- [ ] V. Git Practices: Is the work broken down into small, logical PRs suitable for Conventional Commits?
- [ ] VI. Next.js Platform Specifics: Does the plan account for Next.js 16 Proxy functionality and usage of src/proxy.ts?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
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

| Violation                          | Why Needed                                  | Simpler Alternative Rejected Because       |
| ---------------------------------- | ------------------------------------------- | ------------------------------------------ |
| [e.g., Deviating from Material-UI] | [e.g., A custom chart library is required]  | [e.g., Material-UI charts lack feature X]  |
| [e.g., Disabling a lint rule]      | [e.g., A third-party library has conflicts] | [e.g., Fixing the library is out of scope] |
