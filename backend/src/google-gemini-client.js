import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
export const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
