export class PrismaClient {
  user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  salaryRecord = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  // Add other models and methods as needed for your tests
  $connect = jest.fn();
  $disconnect = jest.fn();
}

// Mock Decimal for Prisma
export class Decimal {
  private value: number | string;

  constructor(value: number | string | Decimal) {
    if (value instanceof Decimal) {
      this.value = value.value;
    } else {
      this.value = value;
    }
  }

  plus(other: Decimal | number | string): Decimal {
    const sum =
      parseFloat(this.value.toString()) + parseFloat(other.toString());
    return new Decimal(sum);
  }

  minus(other: Decimal | number | string): Decimal {
    const diff =
      parseFloat(this.value.toString()) - parseFloat(other.toString());
    return new Decimal(diff);
  }

  times(other: Decimal | number | string): Decimal {
    const prod =
      parseFloat(this.value.toString()) * parseFloat(other.toString());
    return new Decimal(prod);
  }

  dividedBy(other: Decimal | number | string): Decimal {
    const div =
      parseFloat(this.value.toString()) / parseFloat(other.toString());
    return new Decimal(div);
  }

  lessThan(other: Decimal | number | string): boolean {
    return parseFloat(this.value.toString()) < parseFloat(other.toString());
  }

  greaterThan(other: Decimal | number | string): boolean {
    return parseFloat(this.value.toString()) > parseFloat(other.toString());
  }

  toNumber(): number {
    return parseFloat(this.value.toString());
  }

  toString(): string {
    return this.value.toString();
  }
}
