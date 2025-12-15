import { Request, Response } from "express";
import { RegisterUser } from "../../application/RegisterUser";

export class HttpRegisterUser {
  constructor(private readonly registerUser: RegisterUser) {}

  async handle(req: Request, res: Response) {
    try {
      await this.registerUser.execute({
        id: crypto.randomUUID(),
        email: req.body.email,
      });

      res.status(201).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
