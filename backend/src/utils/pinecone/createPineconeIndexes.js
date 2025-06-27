import { pinecone } from "../../pinecone-client.js";

// Initialise index creation: https://docs.pinecone.io/reference/api/2025-01/control-plane/create_index
export const createPineconeIndexes = async (contextName) => {
  try {
    const { indexes: existingIndexes } = await pinecone.listIndexes();

    if (existingIndexes.includes(contextName)) {
      console.log(`Index "${contextName}" already exists. Skipping...`);
      return;
    }

    await pinecone.createIndex({
      name: contextName,
      dimension: 768, // vector length
      metric: "cosine", // similarity metric (cosine): measures angle between vectors (how similar in direction)
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    console.log(`✅ Index "${contextName}" created successfully.`);
    return true;
  } catch (error) {
    console.error("❌ Error in createIndexes:", error);
    return false;
  }
};
