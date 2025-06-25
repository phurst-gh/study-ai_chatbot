import fs from "fs";
import path from "path";

import { waitForPineconeIndexReady } from "./waitForPineconeIndexReady.js";
import { embeddingModel } from "../googleGeminiClient.js";
import { pinecone } from "../../pinecone-client.js";

const contextFolderPath = "./src/context";

export async function getEmbedding(text) {
  try {
    const result = await embeddingModel.embedContent({
      content: {
        parts: [{ text }]
      },
    });
    return result.embedding.values;
  } catch (err) {
    console.error("❌ Failed to embed chunk:", err.message);
    return [];
  }
}

export const uploadPineconeChunks = async (context) => {
  try {
    const fullFileName = context.endsWith(".txt")
      ? context
      : context + ".txt";
    const filePath = path.join(contextFolderPath, fullFileName);

    if (!fs.existsSync(filePath)) {
      console.error(
        `❌ Context file "${fullFileName}" does not exist at path: ${filePath}`
      );
      return;
    }

    const indexName = path.basename(fullFileName, ".txt");
    await waitForPineconeIndexReady(indexName);

    const indexList = await pinecone.listIndexes();
    const indexInfo = indexList.indexes.find(idx => idx.name.toLowerCase() === indexName.toLowerCase());
    if (!indexInfo || !indexInfo.host) {
      throw new Error(`No host found for index: ${indexName}`);
    }
    // console.log('================== Pinecone indexInfo.host ==================');
    // console.log(indexInfo.host);
    // console.log('================== Pinecone Index ==================');
    // console.log(index);

    const fileText = fs.readFileSync(filePath, "utf-8");
    const chunks = fileText
      .split("\n\n")
      .filter((chunk) => chunk.trim() !== "");

    console.log(`Uploading ${chunks.length} chunks to index: ${indexName}`);

    const index = pinecone.Index(indexName, indexInfo.host);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const id = `${indexName}-chunk-${i.toString().padStart(4, "0")}`;
      const embedding = await getEmbedding(chunk);

      const record = {
        id,
        values: embedding,
        metadata: {
          text: chunk,
          source: fullFileName,
        },
      };

      await index.upsert([record]);
      console.log(`Uploaded: ${id}`);
    }

    console.log(`✅ Context "${indexName}" uploaded and indexed!`);
  } catch (error) {
    console.error("❌ Error in uploadChunks:", error);
    throw error;
  }
};
