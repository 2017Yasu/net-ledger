import { Email } from "@/domain/value-objects/Email";

describe("Email Value Object", () => {
  it("should create a valid Email", () => {
    const email = Email.create("test@example.com");
    expect(email.value).toBe("test@example.com");
  });

  it("should throw error for invalid email format", () => {
    expect(() => Email.create("invalid-email")).toThrow("Invalid email format");
    expect(() => Email.create("@example.com")).toThrow("Invalid email format");
    expect(() => Email.create("test@")).toThrow("Invalid email format");
  });

  it("should return true for equality when values match", () => {
    const e1 = Email.create("test@example.com");
    const e2 = Email.create("test@example.com");
    expect(e1.equals(e2)).toBe(true);
  });

  it("should return false for equality when values do not match", () => {
    const e1 = Email.create("test@example.com");
    const e2 = Email.create("other@example.com");
    expect(e1.equals(e2)).toBe(false);
  });
});
