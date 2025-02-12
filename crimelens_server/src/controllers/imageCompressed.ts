import fs from "fs";
import { Hono } from "hono";
import multer from "multer";
import path from "path";
import sharp from "sharp";

const imageCompressed = new Hono();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function compressAndProcessImage(
  imageBuffer: Buffer,
  outputFilename: string,
  compressionLevel: string
) {
  let quality: number;

  switch (compressionLevel) {
    case "low":
      quality = 50;
      break;
    case "medium":
      quality = 70;
      break;
    case "high":
      quality = 90;
      break;
    default:
      quality = 70;
  }

  let compressedImage = sharp(imageBuffer);
  if (imageBuffer.toString("base64").includes("image/jpeg")) {
    compressedImage = compressedImage.jpeg({ quality });
  } else if (imageBuffer.toString("base64").includes("image/png")) {
    compressedImage = compressedImage.png({ quality });
  }

  const compressedBuffer = await compressedImage.toBuffer();

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
  await sharp(compressedBuffer)
    .composite([{ input: watermarkBuffer, gravity: "southeast" }])
    .toFile(outputPath);

  return {
    outputPath,
    originalSize: imageBuffer.length,
    compressedSize: compressedBuffer.length,
  };
}

imageCompressed.post("/upload", upload.single("image"), async (c) => {
  try {
    const file = c.req.file();
    if (!file) {
      return c.json({ error: "No image uploaded" }, 400);
    }

    const imageBuffer = file.buffer;

    const compressionLevel = c.req.body?.compressionLevel || "medium";
    const outputFilename = `compressed-watermarked-${Date.now()}.png`;

    const { outputPath, originalSize, compressedSize } =
      await compressAndProcessImage(
        imageBuffer,
        outputFilename,
        compressionLevel
      );

    return c.json({
      message: "Image uploaded, compressed, and watermarked successfully!",
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      compressedSize: `${(compressedSize / 1024).toFixed(2)} KB`,
      imageUrl: outputPath,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return c.json({ error: "Error processing image" }, 500);
  }
});

export default imageCompressed;
