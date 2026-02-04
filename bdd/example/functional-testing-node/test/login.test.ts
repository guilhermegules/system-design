import request, { Response } from "supertest";
import { Application } from "express";
import { createApp } from "../src/app";

// Given
const givenAnApplication = (): Application => createApp();

// When
const whenUserLogsIn = (
  app: Application,
  credentials: { email: string; password: string }
) => request(app).post("/login").send(credentials);

// Then
const thenResponseShouldMatch = async (
  responsePromise: Promise<Response>,
  assertions: (response: Response) => void
) => {
  const response = await responsePromise;
  assertions(response);
};

describe("Login behavior", () => {
  test("returns a token when credentials are valid", async () => {
    const app = givenAnApplication();

    await thenResponseShouldMatch(
      whenUserLogsIn(app, {
        email: "user@test.com",
        password: "123456",
      }),
      (res) => {
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
      }
    );
  });

  test("returns 401 when credentials are invalid", async () => {
    const app = givenAnApplication();

    await thenResponseShouldMatch(
      whenUserLogsIn(app, {
        email: "wrong@test.com",
        password: "wrong",
      }),
      (res) => {
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Invalid credentials");
      }
    );
  });
});
