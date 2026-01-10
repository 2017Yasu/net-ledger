// jest.setup.ts
import "@testing-library/jest-dom";

// Set environment variables for tests
process.env.JWT_SECRET = "supersecretjwtkeyfor_tests";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/test_db"; // Mock DB URL

// Optionally, mock global objects or setup other test utilities here
