import { Hono } from 'hono';
import { exec } from 'child_process';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Create an instance of Hono
const fakeDetectionController = new Hono();

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'da8v9ysli',
  api_key: '712141289138259',
  api_secret: 'Slb6_vuK-aQoBEaQphOGbRwEMQc',
  secure: true,
});

// POST endpoint to detect deepfake from an uploaded image file
fakeDetectionController.post('/detect-deepfake', async (c) => {
  // Get the formData from the request body
  const formData = await c.req.formData();

  // Get the uploaded file from the formData
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({ error: 'No image file uploaded' }, 400);
  }

  try {
    // Create a temporary path to store the uploaded image
    const tempFilePath = path.join("./", 'uploads', file.name);

    // Save the file locally
    const fileBuffer = await file.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(fileBuffer));

    // Upload the image to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: 'auto', // Automatically detect image type (jpeg, png, etc.)
    });

    const imageUrl = cloudinaryResult.secure_url;  // Get the URL of the uploaded image

    // Call the Python script for deepfake detection
    exec(`python3 Scripts/model.py ${imageUrl}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return c.json({ error: 'Failed to process the image' }, 500);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return c.json({ error: 'Error processing image' }, 500);
      }

      // Parse the JSON output from the Python script
      const result = JSON.parse(stdout);

      // Process the result (label and score)
      const label = result[0]?.label;  // "Real" or "Fake"
      const score = result[0]?.score;  // Confidence score

      // Flag the report if confidence score is low
      const isFlagged = score < 0.5;

      // Clean up the uploaded image file from local storage
      fs.unlinkSync(tempFilePath);

      // Return the analysis result
      return c.json({
        message: 'Image analyzed',
        label,
        confidenceScore: score,
        flagged: isFlagged,
      });
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return c.json({ error: 'Error analyzing the image' }, 500);
  }
});

export default fakeDetectionController;
