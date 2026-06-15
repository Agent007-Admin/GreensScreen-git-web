import { GoogleGenAI } from '@google/genai';

async function main() {
  console.log('Testing Gemini API with Google Search...');
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('No Gemini API key found!');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: key });

  try {
    console.log('Sending request to gemini-3.5-flash with googleSearch tool...');
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Search for recent news about Elden Ring in June 2026.',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log(`Success! Time taken: ${Date.now() - startTime}ms`);
    console.log('Response text:', response.text?.substring(0, 300) + '...');
  } catch (error: any) {
    console.error('Gemini API search tool failed with error:');
    console.error(error.message || error);
    if (error.stack) console.error(error.stack);
  }

  process.exit(0);
}

main().catch(console.error);
