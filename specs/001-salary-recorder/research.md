# Research Notes: Salary Recorder Feature

**Date**: 2026-01-05
**Feature Branch**: `001-salary-recorder`

## 1. Storage: Database Choice and ORM/Client

### Decision: PostgreSQL with Prisma ORM

**Rationale**:
- **PostgreSQL**: A robust, open-source relational database known for its reliability, feature set, and strong support for structured data. It's a common and well-supported choice for modern web applications.
- **Prisma ORM**: A modern, type-safe ORM that integrates seamlessly with TypeScript. It provides a powerful schema definition, migrations, and a client that offers excellent developer experience, auto-completion, and query building. Its integration with Next.js is well-documented.

**Alternatives Considered**:
- **MongoDB (with Mongoose)**: While flexible, the structured nature of salary records and relationships (User to SalaryRecord) lends itself better to a relational database. MongoDB would introduce more complexity in managing data integrity for this specific use case.
- **TypeORM/Sequelize**: These are mature ORMs for Node.js, but Prisma's strong type-safety and developer experience with TypeScript are generally preferred for new Next.js projects.

## 2. Scale/Scope

### Decision: Initial implementation targets typical small-to-medium application scale.

**Rationale**:
- The feature specification does not provide explicit requirements for the number of concurrent users, data volume, or transaction rates.
- The chosen technology stack (Next.js, React, PostgreSQL) is well-suited for scaling to medium-sized applications. Further optimizations and architectural changes can be introduced if specific high-scale requirements emerge.

**Assumptions for initial scale**:
- Up to 1,000 active users.
- Up to 10,000 salary records.
- Average concurrent users: 50.

**Alternatives Considered**:
- Architecting for massive scale (e.g., microservices, sharding, advanced caching) from the outset was considered but deemed premature and over-engineering given the lack of explicit requirements. Such an approach would introduce unnecessary complexity and development overhead for an initial release.

## 3. Next.js Rendering Strategy

### Decision: Hybrid approach using Server-Side Rendering (SSR) and Client-Side Rendering (CSR).

**Rationale**:
- **SSR for initial data loads (Dashboard/History pages)**: Pages displaying existing salary records (e.g., the user dashboard, historical data list, and detailed record view) will benefit from SSR. This allows for faster initial page load times with pre-fetched user-specific data, improving perceived performance and providing a better user experience for data-intensive views.
- **CSR for interactive forms (Salary Record Form)**: The salary record creation/update form involves significant user interaction, validation, and potential partial updates. Using CSR for these components (within a larger SSR-rendered page or as dedicated client components) provides a highly responsive and dynamic user experience without requiring full page reloads for every interaction.
- **Authentication pages (Login/Registration)**: These will primarily be CSR for form handling, but the page shell could be SSR for faster initial load of the UI structure.

**Specific Implementation**:
- Pages like `/dashboard`, `/history`, and `/history/[monthId]` will use SSR to fetch user-specific salary data.
- Interactive forms for creating or updating salary records will be implemented as Client Components within these pages or as separate routes using CSR where appropriate.

**Alternatives Considered**:
- **Static Site Generation (SSG)**: Not suitable for highly dynamic, user-specific data like salary records, as each user's content is unique and changes frequently.
- **Full Client-Side Rendering (CSR)**: While simpler to implement for forms, it would lead to slower initial loads for data-rich pages and poorer user experience, especially on slower networks. The hybrid approach balances performance and interactivity.