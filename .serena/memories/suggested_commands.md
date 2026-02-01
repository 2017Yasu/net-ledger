Here are some essential commands for developing in the net-ledger project:

**Project Management:**

- `npm install` or `pnpm install`: Install dependencies.

**Development Server:**

- `npm run dev`: Start the Next.js development server.

**Build & Start:**

- `npm run build`: Build the project for production.
- `npm run start`: Start the production server.

**Database (Prisma):**

- `npm run prisma:generate`: Generate the Prisma client.
- `npm run prisma:migrate`: Run database migrations.

**Testing:**

- `npm run test`: Run Jest unit and integration tests.
- `npx playwright test`: Run Playwright end-to-end tests. (Based on `playwright.config.ts` and `tests/e2e/`)

**Code Quality:**

- `npm run lint`: Run ESLint to check for code style issues.
- `npm run lint:fix`: Run ESLint and automatically fix issues.
- `npm run format:prettier`: Run Prettier to format code.
- `npm run format`: Run both Prettier and ESLint fix.
- `npm run typecheck`: Run TypeScript compiler to check for type errors.

**General Utilities (Darwin/Unix):**

- `git status`: Check the status of the Git repository.
- `git add .`: Stage all changes for commit.
- `git commit -m "Your message"`: Commit staged changes.
- `ls -la`: List directory contents, including hidden files.
- `cd <directory>`: Change current directory.
- `grep "pattern" <file>`: Search for a pattern in a file.
- `find . -name "*.ts"`: Find TypeScript files in the current directory and subdirectories.
