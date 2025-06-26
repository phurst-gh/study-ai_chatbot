import { embeddingModel } from "../../googleGeminiClient.js";


export async function getPineconeEmbedding(itemToEmbed) {
  try {
    const result = await embeddingModel.embedContent({
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
