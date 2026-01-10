# Quickstart Guide: Salary Recorder Feature Development

**Date**: 2026-01-05
**Feature Branch**: `001-salary-recorder`
**Source**: `plan.md`, `research.md`

This guide outlines the steps to set up the development environment and run the Salary Recorder feature locally.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Git**: For cloning the repository.
- **Node.js (LTS)**: JavaScript runtime environment.
- **pnpm**: Package manager (recommended over npm/yarn).
- **Docker & Docker Compose**: For running a local PostgreSQL database.

## 2. Get Started

### 2.1. Clone the Repository

First, clone the `net-ledger` repository to your local machine:

```bash
git clone git@github.com:your-org/net-ledger.git
cd net-ledger
```

Then, switch to the feature branch for the Salary Recorder:

```bash
git checkout 001-salary-recorder
```

### 2.2. Install Dependencies

Install the project dependencies using pnpm:

```bash
pnpm install
```

### 2.3. Database Setup (PostgreSQL with Prisma)

The Salary Recorder feature uses PostgreSQL as its database, managed with Prisma ORM.

1.  **Start PostgreSQL with Docker Compose**:
    Ensure Docker is running on your machine. From the project root, start the database service:

    ```bash
    docker-compose up -d postgres
    ```

    This will start a PostgreSQL container in the background. You might need a `docker/compose.yml` file in the project root with a PostgreSQL service defined.

2.  **Configure Environment Variables**:
    Create a `.env` file in the project root based on `.env.example`. Ensure the `DATABASE_URL` matches your Docker Compose setup (e.g., `postgresql://user:password@localhost:5432/netledger`).

3.  **Run Prisma Migrations**:
    Apply the database schema and generate the Prisma client:

    ```bash
    pnpm prisma migrate dev --name init
    ```

    This command will create the necessary tables in your PostgreSQL database.

### 2.4. Run the Application

Start the Next.js development server:

```bash
pnpm dev
```

The application will be accessible at `http://localhost:3000`.

### 2.5. Run Tests

To run the unit tests:

```bash
pnpm test
```

To run end-to-end tests (requires the application to be running):

```bash
pnpm playwright test
```

## 3. Post-Implementation (Handoffs)

After implementing the feature, ensure to:

- Create `tasks.md` using the `/speckit.tasks` command.
- Generate a checklist using the `/speckit.checklist` command for relevant domains (e.g., `ux`, `security`).
- Update agent context by running `.specify/scripts/bash/update-agent-context.sh`.
- Prepare a Pull Request following the project's Git Practices outlined in the `constitution.md`.
