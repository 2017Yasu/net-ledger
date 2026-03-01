import { DomainError } from "@/domain/shared/DomainError";
import { Entity } from "@/domain/shared/Entity";
import { Money } from "@/domain/value-objects/Money";
import { SalaryPeriod } from "@/domain/value-objects/SalaryPeriod";

export interface SalaryRecordProps {
  userId: string;
  period: SalaryPeriod;
  baseSalary: Money;
  grossEarnings: Money;
  netPay: Money;
  totalDeductions: Money;
}

export class SalaryRecord extends Entity<SalaryRecordProps> {
  private constructor(props: SalaryRecordProps, id?: string) {
    super(props, id);
    this.validateInvariants();
  }

  get userId(): string {
    return this.props.userId;
  }

  get period(): SalaryPeriod {
    return this.props.period;
  }

  get baseSalary(): Money {
    return this.props.baseSalary;
  }

  get grossEarnings(): Money {
    return this.props.grossEarnings;
  }

  get netPay(): Money {
    return this.props.netPay;
  }

  get totalDeductions(): Money {
    return this.props.totalDeductions;
  }

  /**
   * Factory method for creating a NEW SalaryRecord.
   */
  public static create(props: SalaryRecordProps): SalaryRecord {
    return new SalaryRecord(props);
  }

  /**
   * Reconstitution from persistence.
   */
  public static reconstitute(
    props: SalaryRecordProps,
    id: string,
  ): SalaryRecord {
    return new SalaryRecord(props, id);
  }

  private validateInvariants(): void {
    const sum = this.props.netPay.add(this.props.totalDeductions);
    if (!sum.equals(this.props.grossEarnings)) {
      throw new DomainError(
        "Invariant failed: netPay + totalDeductions must equal grossEarnings",
      );
    }
  }

  /**
   * Map domain entity to persistence model (DTO).
   */
  public toPersistence() {
    return {
      id: this._id,
      userId: this.userId,
      periodMonth: this.period.month,
      periodYear: this.period.year,
      baseSalary: this.baseSalary.amount,
      grossEarnings: this.grossEarnings.amount,
      netPay: this.netPay.amount,
      totalDeductions: this.totalDeductions.amount,
      currency: this.baseSalary.currency,
    };
  }
}
