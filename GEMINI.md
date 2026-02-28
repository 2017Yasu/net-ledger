# net-ledger Development Guidelines

Auto-generated from current project state. Last updated: 2026-02-28

## Active Technologies

- **Frontend:** Next.js 16.1.1 (App Router), React 19.2.3, TypeScript, Material UI 7.3.6, Emotion, Recharts 3.7.0
- **Backend:** Node.js, Prisma 7.2.0 (PostgreSQL), bcryptjs, jsonwebtoken, next-rate-limit
- **Testing:** Jest, React Testing Library, Playwright
- **Linting & Formatting:** ESLint 9, Prettier 3.7.4

## Project Structure

```text
src/
  app/          - Next.js App Router (Pages & API Routes)
  components/   - Shared React Components
  lib/          - Core logic, Auth, Prisma client, Types
prisma/         - Database schema and migrations
tests/
  unit/         - Unit tests for components and logic
  integration/  - API and integration tests
  e2e/          - Playwright end-to-end tests
specs/          - Feature specifications and planning documents
```

## Commands

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm format`: Format codebase (Prettier + ESLint fix)
- `pnpm typecheck`: Run TypeScript compiler check
- `pnpm test`: Run unit and integration tests
- `pnpm check`: Run all checks (lint, typecheck, test)
- `pnpm prisma:migrate`: Apply database migrations

## Code Style

- **TypeScript:** Strict typing, follow standard conventions
- **Imports:** Organized via `eslint-plugin-simple-import-sort`
- **Formatting:** Prettier with project configuration

## Recent Changes

- 004-redirect-to-dashboard: Added TypeScript (latest), Node.js (LTS) + Next.js, React, Jest, React Testing Library, Playwright, Material-UI

- 003-user-dashboard: Added TypeScript (latest), Node.js (LTS) + Next.js, React, Material-UI, Prisma, recharts

- 001-salary-recorder: Added TypeScript (latest), Node.js (LTS) + Next.js, React, Material-UI, Jest, React Testing Library, Playwright, ESLint, Prettier

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
