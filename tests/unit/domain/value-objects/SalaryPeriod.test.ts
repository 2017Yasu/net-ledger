import { SalaryPeriod } from "@/domain/value-objects/SalaryPeriod";

describe("SalaryPeriod Value Object", () => {
  it("should create a valid SalaryPeriod", () => {
    const period = SalaryPeriod.create(2026, 1);
    expect(period.month).toBe(1);
    expect(period.year).toBe(2026);
  });

  it("should throw error for invalid month", () => {
    expect(() => SalaryPeriod.create(2026, 0)).toThrow("Invalid month (1-12)");
    expect(() => SalaryPeriod.create(2026, 13)).toThrow("Invalid month (1-12)");
  });

  it("should return true for equality when month and year match", () => {
    const p1 = SalaryPeriod.create(2026, 1);
    const p2 = SalaryPeriod.create(2026, 1);
    expect(p1.equals(p2)).toBe(true);
  });

  it("should return false for equality when month or year do not match", () => {
    const p1 = SalaryPeriod.create(2026, 1);
    const p2 = SalaryPeriod.create(2026, 2);
    const p3 = SalaryPeriod.create(2025, 1);
    expect(p1.equals(p2)).toBe(false);
    expect(p1.equals(p3)).toBe(false);
  });

  it("should return true for isBefore when period is earlier", () => {
    const p1 = SalaryPeriod.create(2026, 1);
    const p2 = SalaryPeriod.create(2026, 2);
    const p3 = SalaryPeriod.create(2025, 12);
    expect(p1.isBefore(p2)).toBe(true);
    expect(p3.isBefore(p1)).toBe(true);
  });

  it("should return false for isBefore when period is same or later", () => {
    const p1 = SalaryPeriod.create(2026, 2);
    const p2 = SalaryPeriod.create(2026, 1);
    expect(p1.isBefore(p2)).toBe(false);
    expect(p1.isBefore(p1)).toBe(false);
  });
});
