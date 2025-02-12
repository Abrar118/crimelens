import { serve } from "@hono/node-server";
import { Hono } from "hono";
import fakeDetectionController from "./controllers/fakeDetectionController.ts";
import imageCompressed from "./controllers/imageCompressed.ts";
import generateDescriptionController from "./controllers/imageToText.ts";
import imageWaterMark from "./controllers/imageWaterMark.ts";
import userController from "./controllers/userController.js";

const app = new Hono();

app.route("/user", userController);
app.route("/user", fakeDetectionController);
app.route("/imageToText", generateDescriptionController);
app.route("/imageWaterMark", imageWaterMark);
app.route("/imageCompressed", imageCompressed);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
