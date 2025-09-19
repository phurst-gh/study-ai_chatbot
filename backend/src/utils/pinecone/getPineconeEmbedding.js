import { embeddingModel } from "../../google-gemini-client.js";


export async function getPineconeEmbedding(itemToEmbed) {
  try {
    const result = await embeddingModel.embedContent({
      model: "gemini-embedding-001",
      content: {
        parts: [{ text: itemToEmbed }]
      },
    });
    
    return result.embedding.values;
  } catch (err) {
    console.error("❌ Failed to embed chunk:", err.message);
    return [];
  }
}
