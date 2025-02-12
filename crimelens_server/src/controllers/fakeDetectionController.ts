import { exec } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { Hono } from "hono";
import path from "path";

const fakeDetectionController = new Hono();

cloudinary.config({
  cloud_name: "da8v9ysli",
  api_key: "712141289138259",
  api_secret: "Slb6_vuK-aQoBEaQphOGbRwEMQc",
  secure: true,
});

fakeDetectionController.post("/detect-deepfake", async (c) => {
  const formData = await c.req.formData();

  const file = formData.get("file") as File;

  if (!file) {
    return c.json({ error: "No image file uploaded" }, 400);
  }

  try {
    const tempFilePath = path.join("./", "uploads", file.name);

    const fileBuffer = await file.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(fileBuffer));

    const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "auto", 
    });

    const imageUrl = cloudinaryResult.secure_url; // Get the URL of the uploaded image
    exec(`python3 Scripts/model.py ${imageUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return c.json({ error: "Failed to process the image" }, 500);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return c.json({ error: "Error processing image" }, 500);
      }

      const result = JSON.parse(stdout);

      const label = result[0]?.label; 
      const score = result[0]?.score; 

      const isFlagged = score < 0.5;

      fs.unlinkSync(tempFilePath);

      return c.json({
        message: "Image analyzed",
        label,
        confidenceScore: score,
        flagged: isFlagged,
      });
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return c.json({ error: "Error analyzing the image" }, 500);
  }
});

export default fakeDetectionController;
