import express from "express";
import { RegisterUser } from "./application/RegisterUser";
import { HttpRegisterUser } from "./adapters/inbound/HttpRegisterUser";
import { InMemoryUserRepository } from "./adapters/outbound/InMemoryUserRepository";

const app = express();
app.use(express.json());

const userRepo = new InMemoryUserRepository();
const registerUser = new RegisterUser(userRepo);
const httpRegisterUser = new HttpRegisterUser(registerUser);

app.post("/users", (req, res) => httpRegisterUser.handle(req, res));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
