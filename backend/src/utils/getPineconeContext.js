import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const getPineconeContext = async (contextName, userQuery) => {
  try {
    const embedModel = genAI.getGenerativeModel({ model: 'embedding-001' });
    const embeddingResult = await embedModel.embedContent({ content: userQuery });
    const queryVector = embeddingResult.embedding.values;

    const index = pinecone.index(contextName);
    const searchResult = await index.query({
      queryRequest: {
        topK: 3, // Get top 3 relevant chunks
        vector: queryVector, // embed the user query
        includeMetadata: true, // Without this Id only get vector IDs and similarity scores — no actual text to show
        userQuery
      }
    });

    console.log('\n================ searchResult from Pinecone ================\n');
    console.log(searchResult);
    console.log('\n================================================================\n');

    console.log('\n================ Retrieved Context from Pinecone ================\n');
    console.log(contextText);
    console.log('\n================================================================\n');

    // Join top 3 relevant chunks
    pineconeContextSnippet = searchResult.matches
      .map(match => match.metadata.text)
      .join('\n\n');
  } catch (err) {
    console.log('Error querying Pinecone:', err);
  }
};
