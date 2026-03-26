import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Flashcard } from "../types";

// Lazy initialization to prevent app crash on load if env is missing
let aiInstance: GoogleGenAI | null = null;

const getApiKey = (): string => {
  try {
    // Priority 1: Check window polyfill (defined in index.html)
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
      return (window as any).process.env.API_KEY;
    }
    // Priority 2: Check standard process.env (for bundlers like Vite/Webpack that replace this)
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing environment variables:", e);
  }
  return '';
};

const getAI = () => {
  if (!aiInstance) {
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        console.warn("API Key is missing. AI features may not work.");
      }
      aiInstance = new GoogleGenAI({ apiKey: apiKey });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      throw new Error("AI service initialization failed. Please check your configuration.");
    }
  }
  return aiInstance;
};

// Helper to clean JSON string from Markdown code blocks
const cleanJsonString = (text: string): string => {
  if (!text) return "[]";
  // Remove ```json and ``` fences
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
};

// 1. Advanced Chatbot (Unified Powerful Tutor)
export const sendMessageToTutor = async (
  history: ChatMessage[], 
  message: string,
  options: { location?: {lat: number, lng: number} }
): Promise<{ text: string; sources?: Array<{ title: string; uri: string }> }> => {
  
  const ai = getAI();

  // Convert history to API format
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }],
  }));

  // Add the new user message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  // Upgrade to gemini-3-flash-preview for better stability and permission handling
  const model = 'gemini-3-flash-preview';

  const config: any = {
    systemInstruction: "You are an expert academic tutor. Be encouraging, clear, and concise. Use Markdown for formatting. You have access to Google Search—use it proactively to provide real-time data.",
    tools: [{ 
      googleSearch: {} 
    }]
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: config,
  });

  // Manually extract text
  let text = '';
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.text) {
      text += part.text;
    }
  }

  if (!text) {
    text = "I couldn't generate a response.";
  }
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .map((chunk: any) => chunk.web || chunk.maps)
    .filter((source: any) => source && (source.uri || source.googleMapsUri) && source.title)
    .map((source: any) => ({
      title: source.title,
      uri: source.uri || source.googleMapsUri
    }));

  return { text, sources };
};

// 2. High Quality Image Generation
export const generateProImage = async (
  prompt: string,
  options: { aspectRatio: string; resolution: string }
): Promise<{ imageBase64: string }> => {
  const ai = getAI();
  
  // Use gemini-3-pro-image-preview for high quality generation
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', 
    contents: {
      parts: [{ text: `Generate an image of: ${prompt}` }]
    },
    config: {
      imageConfig: {
        aspectRatio: options.aspectRatio,
        imageSize: options.resolution
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return { imageBase64: part.inlineData.data };
    }
  }
  
  throw new Error("Image generation failed or model permissions denied.");
};

// 3. Image Editing
export const editImage = async (
  prompt: string,
  imageBase64: string
): Promise<{ imageBase64: string }> => {
  const ai = getAI();

  // Use gemini-2.5-flash-image for multimodal editing tasks
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        },
        { text: `Edit this image: ${prompt}` }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return { imageBase64: part.inlineData.data };
    }
  }
  
  throw new Error("Failed to edit image");
};

// 4. Research
export const researchTopic = async (query: string) => {
  const ai = getAI();
  // Use gemini-3-flash-preview
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No results found.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources = groundingChunks
    .map((chunk: any) => chunk.web)
    .filter((web: any) => web && web.uri && web.title)
    .map((web: any) => ({
      title: web.title,
      uri: web.uri
    }));

  return { text, sources };
};

// 5. Study Spots
export const findStudySpots = async (query: string, latitude: number, longitude: number) => {
  const ai = getAI();
  // Use gemini-3-flash-preview + Google Search
  const prompt = `Find study spots near ${latitude}, ${longitude} matching "${query}". Provide a list with details.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    },
  });

  const text = response.text || "No places found.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  const cleanPlaces = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
            title: c.web.title,
            uri: c.web.uri,
        }));

  return { text, places: cleanPlaces };
};

// 6. Fast Flashcards
export const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
  const ai = getAI();
  const prompt = `Create 5 study flashcards for the topic: "${topic}". Return JSON only.`;
  
  // Use gemini-3-flash-preview
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ['id', 'front', 'back']
        }
      }
    }
  });

  try {
    const cleanText = cleanJsonString(response.text || "[]");
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse flashcards", e);
    return [];
  }
};