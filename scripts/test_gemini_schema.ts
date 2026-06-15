import { GoogleGenAI, Type } from "@google/genai";

async function testModelSchema(model: string) {
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  console.log(`\nTesting model: ${model}...`);
  const ai = new GoogleGenAI({ apiKey: key });
  
  const startTime = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: "Generate a list of 2 top games of June 2026. Return in JSON format matching the schema.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["games"],
          properties: {
            games: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "genre"],
                properties: {
                  name: { type: Type.STRING },
                  genre: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    console.log(`[SUCCESS] ${model} completed in ${Date.now() - startTime}ms`);
    console.log("Output:", response.text);
    return true;
  } catch (error: any) {
    console.error(`[FAILED] ${model} failed in ${Date.now() - startTime}ms. Error:`, error.message || error);
    return false;
  }
}

async function main() {
  // Test experimental gemini-3.5-flash
  await testModelSchema("gemini-3.5-flash");
  
  // Test stable gemini-2.5-flash
  await testModelSchema("gemini-2.5-flash");
  
  // Test fallback gemini-1.5-flash
  await testModelSchema("gemini-1.5-flash");
}

main().catch(console.error);
