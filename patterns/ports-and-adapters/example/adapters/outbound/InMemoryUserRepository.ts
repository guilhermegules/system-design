import { User } from "../../domain/User";
import { UserRepository } from "../../domain/UserRepository";

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async existsByEmail(email: string): Promise<boolean> {
    return this.users.some((u) => u.email === email);
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}
