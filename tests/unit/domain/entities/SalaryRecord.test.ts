import { SalaryRecord } from "@/domain/entities/SalaryRecord";
import { Money } from "@/domain/value-objects/Money";
import { SalaryPeriod } from "@/domain/value-objects/SalaryPeriod";

describe("SalaryRecord Entity", () => {
  const userId = "550e8400-e29b-41d4-a716-446655440001";
  const period = SalaryPeriod.create(2026, 1);
  const baseSalary = Money.create(300000);
  const grossEarnings = Money.create(350000);
  const netPay = Money.create(280000);
  const totalDeductions = Money.create(70000);

  it("should create a new SalaryRecord", () => {
    const record = SalaryRecord.create({
      userId,
      period,
      baseSalary,
      grossEarnings,
      netPay,
      totalDeductions,
    });

    expect(record.id).toBeDefined();
    expect(record.userId).toBe(userId);
    expect(record.period.equals(period)).toBe(true);
    expect(record.baseSalary.equals(baseSalary)).toBe(true);
  });

  it("should throw error if netPay + totalDeductions != grossEarnings", () => {
    const invalidNetPay = Money.create(200000);
    expect(() =>
      SalaryRecord.create({
        userId,
        period,
        baseSalary,
        grossEarnings,
        netPay: invalidNetPay,
        totalDeductions,
      }),
    ).toThrow(
      "Invariant failed: netPay + totalDeductions must equal grossEarnings",
    );
  });

  it("should reconstitute a SalaryRecord", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const record = SalaryRecord.reconstitute(
      {
        userId,
        period,
        baseSalary,
        grossEarnings,
        netPay,
        totalDeductions,
      },
      id,
    );

    expect(record.id).toBe(id);
    expect(record.userId).toBe(userId);
  });
});
