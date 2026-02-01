# Net-Ledger Project Overview

## Purpose

`net-ledger` is a Next.js application designed for personal finance tracking. Key features include:

- **Salary Recorder:** Allows users to record and track their monthly salary, including attendance, earnings, and deductions.
- **User Dashboard:** Provides users with a dashboard to visualize their financial data.

## Tech Stack

- **Framework:** Next.js, React
- **Language:** TypeScript
- **Backend:** Node.js
- **UI:** Material-UI, recharts
- **Database:** PostgreSQL with Prisma ORM
- **Testing:** Jest, React Testing Library, Playwright
- **Linting & Formatting:** ESLint, Prettier

## Project Structure

The project follows a standard Next.js application structure:

- `src/`: Contains all the source code.
  - `app/`: The main application code, following the Next.js App Router structure.
  - `components/`: Reusable React components.
  - `lib/`: Shared libraries and utility functions.
- `tests/`: Contains all tests, categorized into `e2e`, `integration`, and `unit`.
- `prisma/`: Contains the Prisma schema and database migrations.
- `specs/`: Contains project specifications and design documents.
