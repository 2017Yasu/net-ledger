import { DomainError } from "@/domain/shared/DomainError";
import { ValueObject } from "@/domain/shared/ValueObject";

/**
 * Period of a salary record (month and year).
 */
export interface SalaryPeriodProps {
  month: number;
  year: number;
}

export class SalaryPeriod extends ValueObject<SalaryPeriodProps> {
  private constructor(props: SalaryPeriodProps) {
    super(props);
  }

  get month(): number {
    return this.props.month;
  }

  get year(): number {
    return this.props.year;
  }

  /**
   * Factory method for creating SalaryPeriod.
   */
  public static create(year: number, month: number): SalaryPeriod {
    if (month < 1 || month > 12) {
      throw new DomainError("Invalid month (1-12)");
    }
    return new SalaryPeriod({ year, month });
  }

  /**
   * Compare two periods.
   */
  public isBefore(other: SalaryPeriod): boolean {
    if (this.year < other.year) {
      return true;
    }
    if (this.year === other.year && this.month < other.month) {
      return true;
    }
    return false;
  }
}
