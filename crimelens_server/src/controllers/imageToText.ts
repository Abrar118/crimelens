import { Hono } from 'hono';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary'; 
const genAI = new GoogleGenerativeAI('AIzaSyBihDGaxdjotrVUJOIBmaAh4myyv-Sixv8');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Set up multer for handling file uploads
const upload = multer({ dest: '../../uploads/' }); // Destination directory for uploaded files

// Create the Hono imageToText
const imageToText = new Hono();

// Helper function to get the mime type from base64 string
function getMimeType(base64: string): string {
  const mimeTypeRegex = /^data:(image\/[a-zA-Z]*);base64,/;
  const match = base64.match(mimeTypeRegex);
  return match ? match[1] : 'image/jpeg';
}

// Function to fetch image from URL and convert to base64 (for external image URLs)
async function fetchImageBase64(imageUrl: string): Promise<string | null> {
  try {
    console.log(`Fetching image from URL: ${imageUrl}`);
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    console.error('Error fetching the image:', error.message);
    return null;
  }
}


imageToText.post('/generate-image-description', upload.single('file'), async (c) => {
  console.log("Received image upload request.");


  const file = c.req.file();
  
  if (!file) {
    console.log("No file uploaded.");
    return c.json({ error: 'No image file uploaded' }, 400);
  }

  console.log(`File uploaded: ${file.originalname}, Size: ${file.size} bytes`);

  try {
    
    const tempFilePath = path.join(__dirname, 'uploads', file.originalname);
    console.log(`Saving the file to ${tempFilePath}`);
    fs.writeFileSync(tempFilePath, Buffer.from(file.buffer));

   
    console.log("Uploading image to Cloudinary...");
    const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: 'auto', 
    });

    const imageUrl = cloudinaryResult.secure_url; 
    console.log(`Image successfully uploaded to Cloudinary. Image URL: ${imageUrl}`);

   
    const prompt = 'Describe what is in this image.';
    const base64Image = await fetchImageBase64(imageUrl);

    if (!base64Image) {
      console.log("Failed to convert image to base64.");
      return c.json({ error: 'Failed to fetch image for analysis' }, 500);
    }

    console.log("Image fetched and converted to base64. Generating description...");

    const mimeType = getMimeType(base64Image);
    const image = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType, 
      },
    };

    try {
      console.log("Calling Google Generative AI model...");
      const result = await model.generateContent([prompt, image]);
      const description = await result.response.text();

      console.log("Description generated: ", description);

     
      fs.unlinkSync(tempFilePath);
      console.log("Temporary file deleted.");

      return c.json({ description });
    } catch (error) {
      console.error('Error generating content from Google AI:', error.message);
      return c.json({ error: 'Error generating content' }, 500);
    }

  } catch (error) {
    console.error('Error analyzing image:', error);
    return c.json({ error: 'Error analyzing the image' }, 500);
  }
});

export default imageToText;
