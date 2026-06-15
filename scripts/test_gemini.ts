import { GoogleGenAI } from '@google/genai';

async function main() {
  console.log('Testing Gemini API key...');
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('No Gemini API key found in process.env!');
    process.exit(1);
  }
  
  console.log('Gemini API key prefix:', key.substring(0, 10) + '...');
  
  const ai = new GoogleGenAI({ apiKey: key });
  
  try {
    console.log('Sending request to gemini-3.5-flash...');
    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Respond with exactly one word: APPROVED.'
    });
    console.log(`Success! Time taken: ${Date.now() - startTime}ms`);
    console.log('Response text:', response.text?.trim());
  } catch (error: any) {
    console.error('Gemini API call failed with error:');
    console.error(error.message || error);
    if (error.stack) console.error(error.stack);
  }
  
  process.exit(0);
}

main().catch(console.error);
