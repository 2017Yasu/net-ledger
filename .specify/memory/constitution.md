<!--
## Sync Impact Report

Version Change: 1.2.0 → 1.3.0 (Minor: added mandatory post-implementation validation)
Added Sections: None
Modified Principles:
- I. Code Quality and Consistency (added Validation bullet)
- Development Workflow (added Validation step)
Removed Sections: None
Templates Requiring Updates:
- ✅ .specify/memory/constitution.md
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .gemini/commands/speckit.implement.toml
Follow-up TODOs: None
-->

# net-ledger Constitution

## Core Principles

### I. Code Quality and Consistency

All code MUST adhere to a strict set of quality standards. This includes:

- **Typing**: Full TypeScript adoption is mandatory. The `any` type is disallowed; use `unknown` for gradual typing and type guards. All new code must have strict type coverage.
- **Linting**: ESLint, configured with the recommended rules for TypeScript, React (`eslint-plugin-react-hooks`), and Next.js, is enforced across the entire codebase. All code MUST be free of linting errors before being merged.
- **Formatting**: Prettier is used for non-negotiable, automated code formatting to ensure a uniform style and prevent debates on code layout.
- **Validation**: Developers MUST run `pnpm format` and `pnpm check` (which includes linting, type-checking, and testing) after completing any implementation and before opening a Pull Request. This ensures the codebase remains clean and functional at all times.

### II. Rigorous and Automated Testing

Quality is ensured through a multi-layered, automated testing strategy.

- **Unit Tests**: All new components, hooks, and utility functions MUST be accompanied by comprehensive unit tests using Jest and React Testing Library. Test coverage targets must be met for every pull request.
- **Integration Tests**: Key user flows and API integrations MUST be covered by integration tests to ensure that different parts of the application work together correctly.
- **End-to-End (E2E) Tests**: Critical user paths, such as authentication and core feature workflows, MUST be validated with an E2E testing framework (Playwright) to guarantee real-world functionality.

### III. Consistent and Accessible User Experience

The user interface MUST be consistent, predictable, and accessible to all users.

- **Component-Based Design**: Build the UI using a centralized component library (Material-UI). New UI patterns MUST be encapsulated as reusable, documented components. Avoid one-off styles or components.
- **Accessibility (a11y)**: All components and features MUST adhere to WCAG 2.1 Level AA standards. Automated accessibility checks and manual testing are a required part of the development workflow.
- **State Management**: Use React's built-in state management (e.g., `useState`, `useReducer`, Context API) for local and simple component state. For global or complex state, a single, dedicated library (e.g., Zustand, Redux Toolkit) MUST be used consistently across the application.

### IV. Performance by Default

The application MUST be fast, responsive, and efficient. Performance is a core feature.

- **Next.js Optimizations**: Actively and correctly utilize Next.js performance features, including `next/image` for image optimization, `next/font` for font loading, and `next/script` for third-party scripts.
- **Rendering Strategy**: The choice of rendering strategy (SSR, SSG, ISR, CSR) for each page MUST be deliberate and justified based on its data requirements and volatility.
- **Bundle Size**: The application's bundle size must be regularly monitored. Introducing heavy dependencies requires explicit justification and approval.

### V. Clear and Intentional Git Practices

Version control history MUST be clean, understandable, and serve as a reliable project log.

- **Conventional Commits**: All commit messages MUST follow the Conventional Commits specification to enable automated versioning and clear changelogs.
- **Branching Strategy**: A consistent branching model (e.g., GitHub Flow) is required. Feature branches MUST be short-lived and rebased on the main branch before merging to maintain a linear history. Branch names should follow the rules below:
  - `feature/*`: Branch for adding a feature.
  - `refactor/*`: Branch for only refactoring.
  - `fix/*`: Branch for fixing trivial bugs.
- **Pull Requests**: All code changes MUST be submitted via a Pull Request. A PR requires at least one approval from another team member and must pass all automated CI checks (linting, testing, builds) before it can be merged.

### VI. Next.js Platform Specifics

Leverage Next.js features according to their intended purpose and current best practices.

- **Proxy Functionality**: Starting with Next.js 16, Middleware is now called Proxy. Use `src/proxy.ts` for all proxy-related functionality. The functionality remains the same as previous Middleware.
- **Client Components in Pages**: All page components within `src/app/(pages)` MUST be defined as Client Components (`'use client'`). This ensures consistency in how pages handle state and interactivity.
- **Unauthorized Access Handling**: When an unauthorized user attempts to access a protected page, the application MUST intercept the request and prompt the user to log in again, typically by redirecting to the login page with an appropriate message or state.

## Development Workflow

The development process follows a structured workflow to ensure quality and predictability.

- **Specification**: New features begin with a clear specification that outlines the user requirements, technical approach, and acceptance criteria.
- **Implementation**: Code is developed on feature branches, strictly adhering to the principles outlined in this constitution.
- **Validation**: After implementation and before code review, `pnpm format` and `pnpm check` MUST be successfully executed to guarantee adherence to project standards.
- **Code Review**: All Pull Requests undergo a mandatory peer review to verify correctness, style, and adherence to constitutional principles.
- **Deployment**: Merges to the `main` branch trigger automated, idempotent deployments to a staging environment for final verification before a controlled release to production.

## Governance

This constitution is the foundational law of the project, ensuring long-term quality and maintainability.

- **Compliance**: All code contributions are measured against these principles. Pull Requests that violate the constitution WILL be rejected until they are brought into compliance.
- **Amendments**: Changes to this constitution require a team discussion and a formal proposal via a Pull Request. The PR must provide a clear rationale for the change and document its potential impact.
- **Versioning**: The constitution follows Semantic Versioning (Major.Minor.Patch) to track its evolution.

**Version**: 1.3.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-02-28
