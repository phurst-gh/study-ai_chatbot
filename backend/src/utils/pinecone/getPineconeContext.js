import dotenv from "dotenv";

import { getPineconeEmbedding } from "./getPineconeEmbedding.js";
import { pinecone } from "../../pinecone-client.js";

dotenv.config();

export const getPineconeContext = async (contextName, userQuery) => {
  try {
    const queryVector = await getPineconeEmbedding(userQuery);
    const index = pinecone.index(contextName);
    const searchResult = await index.query({
      topK: 3, // Get top 3 relevant chunks
      vector: queryVector, // embedded user query
      includeMetadata: true // Actual text is stored here (uploadChunks). Without this Id only get vector IDs and similarity scores
    });

    console.log('================ Retrieved Context from Pinecone ================');
    console.log(searchResult);

    // Join top 3 relevant chunks
    return searchResult.matches
      .map((match) => match.metadata.text)
      .join("\n\n");
  } catch (err) {
    console.log("Error querying Pinecone:", err);
  }
};
