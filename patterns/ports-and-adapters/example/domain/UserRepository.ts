import { User } from "./User";

export interface UserRepository {
  save(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
