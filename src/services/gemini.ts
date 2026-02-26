import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export const getGeminiAI = () => {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export async function generateEmbedding(text: string) {
  const ai = getGeminiAI();
  try {
    const result = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ parts: [{ text }] }],
    });
    
    if (result && result.embeddings && result.embeddings[0] && result.embeddings[0].values) {
      return result.embeddings[0].values;
    }
    // Handle single embedding response if it's not an array
    if ((result as any).embedding && (result as any).embedding.values) {
      return (result as any).embedding.values;
    }
    throw new Error("Invalid embedding response structure");
  } catch (error: any) {
    console.error("Embedding failed:", error.message || error);
    
    // Fallback: Create a deterministic vector based on the text content
    const vector = new Array(768).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    
    words.forEach((word, wordIdx) => {
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        const pos = (charCode + i + wordIdx) % 768;
        vector[pos] += charCode / 255;
      }
    });

    const normalized = vector.map(v => Math.tanh(v));
    normalized[0] = 0.999; // Special flag for fallback detection
    return normalized;
  }
}

export async function getAnswerFromContext(query: string, context: string) {
  const ai = getGeminiAI();
  const prompt = `
    You are a highly capable Semantic Search Assistant.
    
    INSTRUCTIONS:
    1. Answer the user's question based ONLY on the provided context.
    2. If the answer is not explicitly in the context, but can be reasonably inferred, do so.
    3. If the answer is absolutely not found, say: "Answer not found in the uploaded documents."
    4. Be concise but thorough.
    5. Always maintain a professional and helpful tone.
    
    CONTEXT:
    ${context}
    
    USER QUESTION: ${query}
    
    ANSWER:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Use gemini-3-flash-preview as recommended
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text;
  } catch (error: any) {
    console.error("Answer generation failed:", error.message || error);
    return "I encountered an error while processing your request. Please try again or check your documents.";
  }
}
