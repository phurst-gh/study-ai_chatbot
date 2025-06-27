import fs from "fs";
import path from "path";

import { waitForPineconeIndexReady } from "./waitForPineconeIndexReady.js";
import { getPineconeEmbedding } from "./getPineconeEmbedding.js";
import { pinecone } from "../../pinecone-client.js";

const contextFolderPath = "./src/context";

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

    await waitForPineconeIndexReady(context);

    const indexList = await pinecone.listIndexes();
    const indexInfo = indexList.indexes.find(idx => idx.name.toLowerCase() === context.toLowerCase());
    if (!indexInfo || !indexInfo.host) {
      throw new Error(`No host found for index: ${context}`);
    }

    const fileText = fs.readFileSync(filePath, "utf-8");
    const chunks = fileText
      .split("\n\n")
      .filter((chunk) => chunk.trim() !== "");

    console.log(`Uploading ${chunks.length} chunks to index: ${context}`);

    const indexHandle = pinecone.Index(context, indexInfo.host);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const id = `${context}-chunk-${i.toString().padStart(4, "0")}`;
      const embedding = await getPineconeEmbedding(chunk);

      const record = {
        id,
        values: embedding,
        metadata: {
          text: chunk,
          source: fullFileName,
        },
      };

      await indexHandle.upsert([record]);
      console.log(`Uploaded: ${id}`);
    }

    console.log(`✅ Context "${context}" uploaded and indexed!`);
  } catch (error) {
    console.error("❌ Error in uploadChunks:", error);
    throw error;
  }
};
