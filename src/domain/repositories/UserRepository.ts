import { User } from "@/domain/entities/User";

/**
 * Interface for User persistence operations.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
