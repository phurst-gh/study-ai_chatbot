import dotenv from "dotenv";

import { embeddingModel } from "./googleGeminiClient.js";
import { pinecone } from "./pinecone/client.js";

dotenv.config();

export const getPineconeContext = async (contextName, userQuery) => {
  try {
    const embeddingResult = await embeddingModel.embedContent({
      content: {
        parts: [{ text: userQuery }],
      },
    });
    const queryVector = embeddingResult.embedding.values;
    const index = pinecone.index(contextName);
    const searchResult = await index.query({
      topK: 3, // Get top 3 relevant chunks
      vector: queryVector, // embed the user query
      includeMetadata: true // Without this Id only get vector IDs and similarity scores — no actual text to show
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
