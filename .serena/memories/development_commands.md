# Development Commands

## Common Commands

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts a production server.

## Code Quality

- `pnpm lint`: Lints the code using ESLint.
- `pnpm lint:fix`: Fixes linting errors automatically.
- `pnpm format:prettier`: Formats code using Prettier.
- `pnpm format`: Runs both formatting and lint fixing.
- `pnpm typecheck`: Runs TypeScript type checking.

## Testing

- `pnpm test`: Runs unit and integration tests with Jest.
- To run E2E tests, use Playwright commands (see `playwright.config.ts`).

## Database

- `pnpm prisma:generate`: Generates the Prisma client based on the schema.
- `pnpm prisma:migrate`: Applies new database migrations.
