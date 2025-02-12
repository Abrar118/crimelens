import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import userController from "./controllers/userController.js";

const app = new Hono().basePath("/api/v1");
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.route("/user", userController);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
