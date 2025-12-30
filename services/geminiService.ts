import { GoogleGenAI } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ModificationResult {
    data: string;
    mimeType: string;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve(''); // Should not happen with readAsDataURL
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const dataUrlToGenerativePart = (dataUrl: string) => {
    const [header, data] = dataUrl.split(',');
    if (!header || !data) {
        throw new Error("Invalid data URL format");
    }
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
        inlineData: { data, mimeType },
    };
};

export const applyModification = async (imageData: File | string, prompt: string): Promise<ModificationResult | null> => {
    console.log(`Applying modification with prompt: "${prompt}"`);
    
    // Using the recommended model name for image generation tasks
    const model = 'gemini-2.5-flash-image';

    try {
        let imagePart;
        if (imageData instanceof File) {
            imagePart = await fileToGenerativePart(imageData);
        } else {
            imagePart = dataUrlToGenerativePart(imageData);
        }

        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [imagePart, textPart],
            },
        });
        
        console.log("Gemini API Response:", response);

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    console.log("Image part found in response.");
                    return {
                        data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType,
                    };
                }
            }
        }
        
        console.warn("No image part found in the Gemini response.");
        return null;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
};