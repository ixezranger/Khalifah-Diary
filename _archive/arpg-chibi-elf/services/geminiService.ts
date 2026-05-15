import { GoogleGenAI } from "@google/genai";
import { Item } from '../types';

let genAI: GoogleGenAI | null = null;

try {
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize Gemini Client:", error);
}

export const generateItemLore = async (item: Item): Promise<string> => {
  if (!genAI) return "The spirits are silent (API Key missing).";

  try {
    const prompt = `
      Write a short, gritty, high-fantasy lore description (max 2 sentences) for a Dragon-themed ARPG item.
      Item Name: ${item.name}
      Type: ${item.type}
      Rarity: ${item.rarity}
      Stats: ${JSON.stringify(item.stats)}
      Context: A world ruled by ancient dragons and dark magic. The item is ancient, powerful, and perhaps cursed.
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "The ancient texts are illegible.";
  }
};