import { DomainError } from "@/domain/shared/DomainError";
import { ValueObject } from "@/domain/shared/ValueObject";

/**
 * Monetary value object.
 * Always represents the amount in minor units (e.g. cents, yen).
 */
export interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  /**
   * Factory method for creating Money.
   * Default currency is 'JPY'.
   */
  public static create(amount: number, currency: string = "JPY"): Money {
    if (!Number.isInteger(amount)) {
      throw new DomainError("Amount must be an integer (minor units)");
    }
    return new Money({ amount, currency });
  }

  /**
   * Addition of two Money objects.
   * Currency must match.
   */
  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError("Cannot add money with different currencies");
    }
    return new Money({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  /**
   * Subtraction of two Money objects.
   * Currency must match.
   */
  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError("Cannot subtract money with different currencies");
    }
    return new Money({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }
}
