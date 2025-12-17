export class UserValidator {
  validate(email: string, password: string): void {
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }

    if (password.length < 8) {
      throw new Error("Password too short");
    }
  }
}

export class UserRepository {
  save(user: { email: string; password: string }): void {
    console.log("Saving user to database", user);
  }
}

export class EmailService {
  sendWelcomeEmail(email: string): void {
    console.log(`Sending welcome email to ${email}`);
  }
}

export class UserRegistrationService {
  constructor(
    private validator: UserValidator,
    private repository: UserRepository,
    private emailService: EmailService
  ) {}

  register(email: string, password: string): void {
    this.validator.validate(email, password);
    this.repository.save({ email, password });
    this.emailService.sendWelcomeEmail(email);
  }
}
