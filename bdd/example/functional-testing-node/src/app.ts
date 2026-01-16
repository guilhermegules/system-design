import express, { Application, Request, Response } from "express";

type LoginRequestBody = {
  email: string;
  password: string;
};

export const createApp = (): Application => {
  const app = express();
  app.use(express.json());

  app.post(
    "/login",
    (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
      const { email, password } = req.body;

      if (email === "user@test.com" && password === "123456") {
        return res.status(200).json({
          token: "fake-jwt-token",
        });
      }

      return res.status(401).json({
        error: "Invalid credentials",
      });
    }
  );

  return app;
};
