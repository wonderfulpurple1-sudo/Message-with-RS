import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { toolDeclarations, SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
// NOTE: API Key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToCoordinator = async (userMessage: string): Promise<GenerateContentResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 0.1, // Low temperature for deterministic tool selection
      }
    });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};