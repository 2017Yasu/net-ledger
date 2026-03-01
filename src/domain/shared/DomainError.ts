/**
 * Base class for all domain errors.
 */
export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = "DOMAIN_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype); // maintain prototype chain
  }
}
