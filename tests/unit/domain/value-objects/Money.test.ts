import { Money } from "@/domain/value-objects/Money";

describe("Money Value Object", () => {
  it("should create a Money object with integer amount", () => {
    const money = Money.create(1000);
    expect(money.amount).toBe(1000);
    expect(money.currency).toBe("JPY");
  });

  it("should throw error if amount is not an integer", () => {
    expect(() => Money.create(10.5)).toThrow(
      "Amount must be an integer (minor units)",
    );
  });

  it("should add two Money objects with same currency", () => {
    const m1 = Money.create(1000);
    const m2 = Money.create(500);
    const sum = m1.add(m2);
    expect(sum.amount).toBe(1500);
  });

  it("should subtract two Money objects with same currency", () => {
    const m1 = Money.create(1000);
    const m2 = Money.create(400);
    const diff = m1.subtract(m2);
    expect(diff.amount).toBe(600);
  });

  it("should return true for equality when amounts match", () => {
    const m1 = Money.create(1000);
    const m2 = Money.create(1000);
    expect(m1.equals(m2)).toBe(true);
  });

  it("should return false for equality when amounts do not match", () => {
    const m1 = Money.create(1000);
    const m2 = Money.create(500);
    expect(m1.equals(m2)).toBe(false);
  });
});
