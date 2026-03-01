# Implementation Plan: Create a Standalone Domain Layer

**Branch**: `005-domain-layer` | **Date**: 2026-03-01 | **Spec**: [specs/005-domain-layer/spec.md](specs/005-domain-layer/spec.md)
**Input**: Feature specification from `specs/005-domain-layer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.gemini/commands/speckit.plan.toml` for the execution workflow.

## Summary

Establish a dedicated "Domain" layer (`src/domain`) containing core business logic (Entities, Value Objects, Repository Interfaces) in pure TypeScript. This layer will be strictly decoupled from external frameworks (Next.js, Prisma, React) to improve testability, maintainability, and architectural clarity.

## Technical Context

**Language/Version**: TypeScript (latest), Node.js (LTS)
**Primary Dependencies**: None (Pure TypeScript for Domain Layer). `uuid` (or native `crypto`) for ID generation.
**Storage**: Persistence Agnostic (Repository Interfaces only)
**Testing**: Jest (Unit)
**Target Platform**: Node.js / Web (Universal)
**Project Type**: Architectural Foundation
**Performance Goals**: Zero runtime overhead from frameworks in domain logic.
**Constraints**: strictly NO imports from `react`, `next`, `prisma` in `src/domain`.
**Scale/Scope**: Architectural Refactoring / Foundation.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **[x] I. Code Quality**: Plan enforces strict TypeScript, no `any`, and automated formatting/linting via `pnpm format` and `pnpm check`.
- **[x] II. Testing**: Plan includes creating pure unit tests for Entities and Value Objects using Jest.
- **[x] III. UX Consistency**: N/A (Backend/Architecture feature), but lays groundwork for consistent business logic usage in UI.
- **[x] IV. Performance**: Domain layer is pure logic; no rendering strategy needed.
- **[x] V. Git Practices**: Work will be broken down into logical commits (Entities, Value Objects, Repositories).
- **[x] VI. Next.js Platform Specifics**: Strictly isolates domain logic from Next.js specifics, aligning with the goal of decoupling.

## Project Structure

### Documentation (this feature)

```text
specs/005-domain-layer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checkists/           # Quality checklists
```

### Source Code (repository root)

```text
src/
├── domain/              # NEW: Core Domain Layer
│   ├── entities/        # Domain Entities (User, SalaryRecord)
│   ├── value-objects/   # Domain Value Objects (Email, Money, etc.)
│   ├── repositories/    # Repository Interfaces
│   └── shared/          # Base classes (Entity, ValueObject, DomainError)
├── app/                 # Existing Next.js App Router
├── lib/                 # Existing shared utilities (will be refactored later)
└── ...
```

**Structure Decision**: A new top-level `src/domain` directory will be created to enforce physical separation from infrastructure code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :-------- | :--------- | :----------------------------------- |
| None      | N/A        | N/A                                  |
