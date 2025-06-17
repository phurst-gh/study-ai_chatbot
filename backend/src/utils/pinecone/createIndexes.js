import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const createIndexes = async (contextName) => {
  try {
    const { indexes: existingIndexes } = await pinecone.listIndexes();

    if (existingIndexes.includes(contextName)) {
      console.log(`Index "${contextName}" already exists. Skipping...`);
      return;
    }

    await pinecone.createIndex({
      name: contextName,
      dimension: 768,
      metric: "cosine",
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
