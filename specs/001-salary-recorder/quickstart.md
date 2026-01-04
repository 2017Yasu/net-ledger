# Quickstart: Salary Recorder

This guide provides the steps to set up and run the Salary Recorder application locally.

## Prerequisites

- Node.js (LTS version)
- pnpm
- A running PostgreSQL database

## 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd net-ledger
pnpm install
```

## 2. Environment Configuration

Create a `.env.local` file in the root of the project and add the following environment variables:

```
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-a-secret>"
```

- Replace the `DATABASE_URL` with the connection string for your PostgreSQL database.
- Generate a secret for `NEXTAUTH_SECRET` (e.g., using `openssl rand -hex 32`).

## 3. Database Migration

Manually execute migration SQL scripts.

## 4. Running the Application

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 5. Running Linters and Formatters

To check for code quality and formatting issues:

```bash
# Check for linting errors
pnpm lint

# Fix linting errors
pnpm lint:fix

# Check formatting
pnpm format:check

# Fix formatting
pnpm format

# Check for TypeScript errors
pnpm type-check
```
