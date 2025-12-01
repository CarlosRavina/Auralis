import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBookInsight = async (title: string, author: string): Promise<AIInsight> => {
  const ai = initGenAI();
  
  // Updated prompt to ask for Spanish output
  const prompt = `Proporciona un análisis conciso para el audiolibro "${title}" de ${author}. Incluye un breve resumen, una lista de temas clave y los personajes principales. Responde en español.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Un resumen conciso de la trama (máx 300 caracteres)." },
            themes: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Hasta 3 temas clave."
            },
            characters: {
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Top 3 personajes principales."
            }
          },
          required: ["summary", "themes", "characters"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No hubo respuesta de la IA");
    
    return JSON.parse(text) as AIInsight;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    throw new Error("Error al generar información.");
  }
};