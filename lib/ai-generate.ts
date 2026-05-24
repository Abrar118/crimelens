import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateImageDescription(base64Data: string, mimeType: string): Promise<string> {
  const result = await model.generateContent([
    "Describe what is in this image. Focus on any criminal activity, damage, or suspicious elements visible.",
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
  ]);
  return result.response.text();
}
