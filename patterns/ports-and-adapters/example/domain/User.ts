export class User {
  constructor(public readonly id: string, public readonly email: string) {}

  static create(id: string, email: string): User {
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }
    return new User(id, email);
  }
}
