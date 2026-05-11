import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// Initialize the Google Gen AI SDK
// Note: We're calling this client-side for the prototype but typically this should be backend to protect the key.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateLearningMaterial(fileData: string, mimeType: string, fileName: string) {
  // We use gemini-3.1-pro-preview for complex reasoning tasks (summarization, structured quiz gen)
  const model = "gemini-3.1-pro-preview";
  
  const contents = {
    parts: [
      {
        text: `Analyze the attached file "${fileName}". 
1. Provide a comprehensive markdown summary of the main topics.
2. Outline key concepts that a student needs to learn.
Make the tone engaging and slightly RPG-themed (refer to the user as an adventurer or scholar).`
      },
      {
        inlineData: {
          data: fileData,
          mimeType: mimeType
        }
      }
    ]
  };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: "You are a wise RPG game mentor analyzing artifacts for an adventurer. Your markdown should be clean and readable.",
    }
  });

  return response.text;
}

export async function generateQuiz(fileData: string, mimeType: string): Promise<any[]> {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: "Generate a 5-question multiple choice quiz based on this content. Formulate the questions as 'encounters' or 'challenges'." },
        { inlineData: { data: fileData, mimeType } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct option" },
            explanation: { type: Type.STRING, description: "Why the answer is correct." }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  });

  let text = response.text || "[]";
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    return [];
  }
}

export async function answerQuestion(fileData: string, mimeType: string, question: string) {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: `Based on the attached document, answer this question: ${question}` },
        { inlineData: { data: fileData, mimeType } }
      ]
    },
    config: {
      systemInstruction: "You are the Lorekeeper, an RPG NPC who helps scholars. Answer clearly based ONLY on the provided text.",
    }
  });

  return response.text;
}
