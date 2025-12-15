import { User } from "../domain/User";
import { UserRepository } from "../domain/UserRepository";

export interface RegisterUserCommand {
  id: string;
  email: string;
}

export class RegisterUser {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const exists = await this.userRepo.existsByEmail(command.email);

    if (exists) {
      throw new Error("User already exists");
    }

    const user = User.create(command.id, command.email);
    await this.userRepo.save(user);
  }
}
