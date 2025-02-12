import fs from "fs";
import { Hono } from "hono";
import multer from "multer";
import path from "path";
import sharp from "sharp";


const imageWaterMark = new Hono();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function addWatermark(
  imageBuffer: Buffer,
  outputFilename: string
): Promise<string> {
  const watermarkText = "Binti"; 

 
  const watermarkBuffer = await sharp({
    create: {
      width: 125,
      height: 40,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0.5 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="125" height="40">
            <text x="50%" y="50%" font-size="20" font-family="Arial" font-style="italic" fill="rgba(0, 0, 0, 0.9)" text-anchor="middle" dominant-baseline="middle">
              ${watermarkText}
            </text>
          </svg>`
        ),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();

  const outputPath = path.join(outputDir, outputFilename);

  
  await sharp(imageBuffer)
    .composite([{ input: watermarkBuffer, gravity: "southeast" }])
    .toFile(outputPath);

  return outputPath;
}


imageWaterMark.post(
  "/upload",
  upload.single("image"),
  async (c) => {
    try {
      
      const file = c.req.file("image");
      if (!file) {
        return c.json({ error: "No image uploaded" }, 400);
      }

      const imageBuffer = file.buffer;

  
      const outputFilename = `watermarked-${Date.now()}.png`;

      
      const outputPath = await addWatermark(imageBuffer, outputFilename);

      
      return c.res.sendFile(outputPath);
    } catch (error) {
      console.error("Error processing image:", error);
      return c.json({ error: "Error processing image" }, 500);
    }
  }
);
export default imageWaterMark;
