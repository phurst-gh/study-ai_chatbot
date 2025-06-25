import dotenv from "dotenv";

import { createPineconeIndexes } from '../utils/pinecone/createPineconeIndexes.js';
import { uploadPineconeChunks } from '../utils/pinecone/uploadPineconeChunks.js';
import { pinecone } from '../pinecone-client.js';

dotenv.config()

export const uploadContextHandler = async (req, res) => {
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ error: 'No context provided' });
  }

  try {
    const indexesCreated = await createPineconeIndexes(context);
    if (!indexesCreated) {
      return res.status(200).json({
        botResponse: `⚠️ Context "${context}" already exists. Skipped uploading.`
      });
    }

    try {
      await uploadPineconeChunks(context);
    } catch (error) {
      await pinecone.deleteIndex(context);
      console.error('Error uploading context: Index deleted due to failure:', error);
      return res.status(500).json({
        botResponse: `❌ Failed to upload chunks. Index "${context}" was deleted.`,
      });
    }

    let confirmationMessage = '';
    if (context === 'pokemon') {
      confirmationMessage = "Great! I've got access to the original 151 Pokémon statistics, let's discuss.";
    } else if (context === 'the-book-of-five-rings') {
      confirmationMessage = "Great! I've got access to The Book of Five Rings novel, let's discuss..";
    } else {
      confirmationMessage = `✅ Uploaded and indexed context: ${context} !`;
    }
    
    return res.status(200).json({ botResponse: confirmationMessage });
  } catch (error) {
    console.error('Error uploading context:', error);
    return res.status(500).json({
      botResponse: `❌ Failed to upload context: ${context}`
    });  }
};
