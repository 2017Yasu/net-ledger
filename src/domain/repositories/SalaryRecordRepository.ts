import { SalaryRecord } from "@/domain/entities/SalaryRecord";

/**
 * Interface for SalaryRecord persistence operations.
 */
export interface SalaryRecordRepository {
  findById(id: string): Promise<SalaryRecord | null>;
  findByUserId(userId: string): Promise<SalaryRecord[]>;
  save(record: SalaryRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
