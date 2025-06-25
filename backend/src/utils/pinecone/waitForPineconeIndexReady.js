import { setTimeout } from 'timers/promises';
import { pinecone } from "../../pinecone-client.js";

// Fucntion to avoid race condition with createIndexes and uploadChunks
// Although createIndexes is done asynchronously, it may still be in a state of 'initialising'
// Waiting for status.ready = true recommended: https://docs.pinecone.io/troubleshooting/wait-for-index-creation?utm_source=chatgpt.com
export async function waitForPineconeIndexReady(indexName, timeout = 60000, interval = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const status = await pinecone.describeIndex(indexName); // up-to-date status
    if (status.status.ready) {
      console.log("✅ Index is ready.");
      return;
    }
    console.log("⏳ Index not ready yet. Waiting...");
    await setTimeout(interval);
  }
  throw new Error("⛔ Index did not become ready in time.");
}
