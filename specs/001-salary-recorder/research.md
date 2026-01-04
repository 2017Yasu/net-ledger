# Research: ESLint, Prettier, and package.json Scripts

This document outlines the decisions made for configuring the development environment for the Salary Recorder application, based on the `plan.md`'s request for clarification.

## Decision 1: ESLint and Prettier Configuration

**Decision**: ESLint and Prettier will be configured to work together to enforce code quality and a consistent format. Prettier will handle formatting, and ESLint will handle code-quality rules. `eslint-config-prettier` will be used to disable any ESLint rules that conflict with Prettier.

**Rationale**: This is a standard best practice in modern web development. It automates formatting and catches potential bugs early, which aligns with the "Code Quality and Consistency" principle in the project constitution.

**Configuration Files**:

*   **`eslint.config.mjs`**:
    ```js
    import { defineConfig, globalIgnores } from 'eslint/config'
    import nextVitals from 'eslint-config-next/core-web-vitals'
    import prettier from 'eslint-config-prettier/flat'
     
    const eslintConfig = defineConfig([
      ...nextVitals,
      prettier,
      // Override default ignores of eslint-config-next.
      globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
      ]),
    ])
     
    export default eslintConfig
    ```
*   **`.prettierrc.json`**:
    ```json
    {
      "singleQuote": true,
      "semi": true,
      "tabWidth": 2,
      "trailingComma": "all",
      "printWidth": 100
    }
    ```

## Decision 2: `package.json` Scripts

**Decision**: The following scripts will be added to `package.json` to standardize linting, formatting, and type-checking.

**Rationale**: These scripts provide simple, memorable commands for common development tasks, which improves developer experience and makes it easier to automate these checks in a CI/CD pipeline.

**Scripts**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

## Alternatives Considered

*   **Using only ESLint for formatting**: This is possible but not recommended. Prettier is a more specialized and powerful tool for code formatting. Using both, with `eslint-config-prettier` to resolve conflicts, is the industry standard.
*   **Not having scripts**: This would require developers to remember the full commands and would make automation more difficult. Standardized scripts are a clear win for consistency.

