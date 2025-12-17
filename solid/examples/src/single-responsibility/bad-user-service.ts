class UserService {
  register(email: string, password: string): void {
    // Validation
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }

    if (password.length < 8) {
      throw new Error("Password too short");
    }

    // Persistence
    console.log("Saving user to database");

    // Email notification
    console.log("Sending welcome email");
  }
}
