The general development workflow involves:

1.  Running the development server: `npm run dev` (or `pnpm dev`)
2.  Building the project: `npm run build`
3.  Starting the production server: `npm run start`
4.  Generating Prisma client: `npm run prisma:generate`
5.  Running Prisma migrations: `npm run prisma:migrate`
6.  Running tests: `npm run test`
7.  Running type checks: `npm run typecheck`
8.  Linting and formatting: `npm run lint`, `npm run format:prettier`, `npm run lint:fix`, `npm run format`
9.  After completing a task, ensure code quality by running `pnpm typecheck && pnpm format` and executing tests (`npm run test`).
