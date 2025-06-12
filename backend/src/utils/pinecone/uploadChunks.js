import fs from 'fs';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import { embeddingModel } from '../googleGenerativeAI.js';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const contextFolderPath= './src/context';

export async function getEmbedding(text) {
  try {
    const result = await embeddingModel.embedContent({
      model: 'embedding-001',
      content: {
        parts: [{ text }],
        role: 'user'
      }
    });
    return result.embedding.values;
  } catch (err) {
    console.error('❌ Failed to embed chunk:', err.message);
    return [];
  }
}

export const uploadChunks = async (fileName) => {
  try {
    // Ensure .txt extension
    const fullFileName = fileName.endsWith('.txt') ? fileName : fileName + '.txt';
    const filePath = path.join(contextFolderPath, fullFileName);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Context file "${fullFileName}" does not exist at path: ${filePath}`);
      return;
    }

    const fileText = fs.readFileSync(filePath, 'utf-8');
    const indexName = path.basename(fullFileName, '.txt');
    const index = pinecone.index(indexName);

    const chunks = fileText.split('\n\n').filter(chunk => chunk.trim() !== '');

    console.log(`Uploading ${chunks.length} chunks to index: ${indexName}`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const id = `${indexName}-chunk-${i.toString().padStart(4, '0')}`;
      const embedding = await getEmbedding(chunk);
      
      const record = {
        id,
        values: embedding,
        metadata: {
          text: chunk,
          source: fullFileName
        }
      };

      await index.upsert([record]);
      console.log(`Uploaded: ${id}`);
    }

    console.log(`✅ Context "${indexName}" uploaded and indexed!`);
  } catch (error) {
    console.error('❌ Error in uploadChunks:', error);
  }
};
