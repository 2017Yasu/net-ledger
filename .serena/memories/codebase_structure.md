The codebase is structured as follows:

- `src/`: Contains the main application source code.
  - `src/app/`: Next.js application routes and API routes.
  - `src/components/`: Reusable React components.
  - `src/lib/`: Utility functions, API clients, authentication logic, Prisma client, etc.
- `tests/`: Contains all tests.
  - `tests/e2e/`: Playwright end-to-end tests.
  - `tests/integration/`: Integration tests.
  - `tests/unit/`: Unit tests.
- `prisma/`: Prisma schema and database migrations.
- `public/`: Static assets.
- `specs/`: Feature specifications, quickstarts, and API contracts.
- `docker/`: Docker related files.
- `docs/`: Project documentation.
