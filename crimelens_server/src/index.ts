import { serve } from "@hono/node-server";
import { Hono } from "hono";
import userController from "./controllers/userController.js";
import fakeDetectionController from "./controllers/fakeDetectionController.ts";
import generateDescriptionController from './controllers/imageToText.ts';

const app = new Hono();

app.route("/user", userController);
app.route("/user", fakeDetectionController);
app.route('/', generateDescriptionController);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});


const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
