import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY in environment.");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});