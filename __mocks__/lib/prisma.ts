// __mocks__/lib/prisma.ts

// This is our mock Decimal class, as defined in __mocks__/@prisma/client.ts
// We're just moving it here for direct use in the mock factory below.
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
      parseFloat(this.value.toString()) +
      parseFloat(new Decimal(other).toString());
    return new Decimal(sum);
  }

  minus(other: Decimal | number | string): Decimal {
    const diff =
      parseFloat(this.value.toString()) -
      parseFloat(new Decimal(other).toString());
    return new Decimal(diff);
  }

  times(other: Decimal | number | string): Decimal {
    const prod =
      parseFloat(this.value.toString()) *
      parseFloat(new Decimal(other).toString());
    return new Decimal(prod);
  }

  dividedBy(other: Decimal | number | string): Decimal {
    const div =
      parseFloat(this.value.toString()) /
      parseFloat(new Decimal(other).toString());
    return new Decimal(div);
  }

  lessThan(other: Decimal | number | string): boolean {
    return this.toNumber() < new Decimal(other).toNumber();
  }

  greaterThan(other: Decimal | number | string): boolean {
    return this.toNumber() > new Decimal(other).toNumber();
  }

  toNumber(): number {
    return parseFloat(this.value.toString());
  }

  toString(): string {
    return this.value.toString();
  }
}

const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  salaryRecord: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  // We expose the Decimal constructor here as well, as it's often accessed via prisma.Decimal
  Decimal: Decimal,
};

export default mockPrismaClient;
