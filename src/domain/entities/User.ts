import { Entity } from "@/domain/shared/Entity";

export interface UserProps {
  username: string;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  get username(): string {
    return this.props.username;
  }

  /**
   * Factory method for creating a NEW User.
   */
  public static create(props: UserProps): User {
    return new User(props);
  }

  /**
   * Reconstitution from persistence.
   */
  public static reconstitute(props: UserProps, id: string): User {
    return new User(props, id);
  }

  /**
   * Map domain entity to persistence model (DTO).
   */
  public toPersistence() {
    return {
      id: this._id,
      username: this.username,
    };
  }
}
