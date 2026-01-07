import { GoogleGenerativeAI } from "@google/generative-ai";

// get your API key from .env

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

// you can export different models here if needed later
export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });