import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64 } = req.body;

    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: "Missing data" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
      {
        text:
          prompt +
          ". Modify ONLY the specified part of the car. Keep everything else identical. Return ONLY the edited image.",
      },
    ]);

    const parts =
      result.response.candidates?.[0]?.content?.parts || [];

    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart) {
      throw new Error("No image returned by Gemini");
    }

    res.status(200).json({
      imageBase64: imagePart.inlineData.data,
    });
  } catch (error) {
    console.error("GENERATION ERROR:", error);
    res.status(500).json({ error: "Generation Failed" });
  }
}
