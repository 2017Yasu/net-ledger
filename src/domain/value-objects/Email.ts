import { DomainError } from "@/domain/shared/DomainError";
import { ValueObject } from "@/domain/shared/ValueObject";

/**
 * Validated email address.
 */
export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Factory method for creating Email.
   */
  public static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new DomainError("Invalid email format");
    }
    return new Email({ value: email.toLowerCase() });
  }

  private static isValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
