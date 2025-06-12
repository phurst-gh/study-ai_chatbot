import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const getPineconeContext = async (contextName, userQuery) => {
  try {
    const index = pinecone.index(contextName);

    const searchResult = await index.query({
      queryRequest: {
        topK: 3, // Get top 3 relevant chunks
        vector: null, // auto-embed - converts my query into a vector
        includeMetadata: true, // Without this Id only get vector IDs and similarity scores — no actual text to show
        userQuery
      }
    });

    // Join top 3 relevant chunks
    pineconeContextSnippet = searchResult.matches
      .map(match => match.metadata.text)
      .join('\n\n');

    console.log('-------------------- pinecone context --------------------');
    console.log(pineconeContextSnippet);
  } catch (err) {
    console.log('Error querying Pinecone:', err);
  }
};
