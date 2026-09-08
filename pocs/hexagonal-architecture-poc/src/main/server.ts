import { app } from "../adapters/inbound/http/express/app";
import { setupDb } from "../config/database";

setupDb().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
});