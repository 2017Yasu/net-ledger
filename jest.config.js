/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/tests/unit/**/*.test.ts",
    "**/tests/integration/**/*.test.ts"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/lib/prisma$": "<rootDir>/__mocks__/lib/prisma.ts", // Redirect @/lib/prisma to our mock
    // Mock Prisma Client directly to prevent actual database connections during tests
    // Ensure this doesn't conflict with our @/lib/prisma mock which imports the actual @prisma/client
    "@prisma/client": "<rootDir>/__mocks__/@prisma/client.ts", // Keep this for direct @prisma/client imports if any
    "^@prisma/client/runtime/library$": "<rootDir>/__mocks__/@prisma/client/runtime/library.ts",
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!@prisma/client)",
  ],
};
