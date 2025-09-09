
import { GoogleGenAI } from "@google/genai";

const apiKey = (window as any).GEMINI_API_KEY;

// A user-friendly check to ensure the API key is configured.
if (!apiKey) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; padding: 2rem; text-align: center; color: #ffcccc; background-color: #330000; border: 1px solid #ff4444; border-radius: 8px; margin: 2rem auto; max-width: 600px;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Configuration Error</h1>
        <p>The Gemini API key is missing.</p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #ff9999;">Please configure it using Netlify's <strong>Site configuration > Build & deploy > Snippet injection</strong> feature in your site settings.</p>
      </div>
    `;
  }
  throw new Error("API_KEY not found. Please configure it using Netlify's Snippet Injection.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export async function translateText(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following Spanish text to German. Only return the translated text, with no additional explanation or context: "${text}"`,
      config: {
        // Disable thinking for ultra-low latency, crucial for real-time translation
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.2, // Lower temperature for more deterministic translation
      },
    });

    const translatedText = response.text.trim();
    if (!translatedText) {
        throw new Error("Received an empty translation from the API.");
    }
    return translatedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("The provided API key is invalid. Please check your Netlify Snippet Injection settings.");
    }
    throw new Error("Failed to translate text. Please check the API key and network connection.");
  }
}