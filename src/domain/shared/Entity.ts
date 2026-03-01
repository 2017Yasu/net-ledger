import { randomUUID } from "crypto";

/**
 * Base class for all Entities.
 * Entities are defined by their identity rather than their attributes.
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id ? id : randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  /**
   * Check for identity equality between two entities.
   */
  public equals(other?: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }
}
