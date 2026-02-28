// jest.setup.ts
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for Node.js environment to support pg library
// TextEncoder and TextDecoder are required by the pg library
if (typeof global.TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextEncoder = TextEncoder as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.TextDecoder = TextDecoder as any;
}

// Set environment variables for tests
process.env.JWT_SECRET = "supersecretjwtkeyfor_tests";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/test_db"; // Mock DB URL

// Optionally, mock global objects or setup other test utilities here
