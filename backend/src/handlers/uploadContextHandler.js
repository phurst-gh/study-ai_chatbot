import { createIndexes } from '../utils/pinecone/createIndexes.js';
import { uploadChunks } from '../utils/pinecone/uploadChunks.js';

export const uploadContextHandler = async (req, res) => {
  const { context } = req.body;

  if (!context) {
    return res.status(400).json({ error: 'No context provided' });
  }

  try {
    const indexesCreated = await createIndexes(context);
    if (!indexesCreated) {
      return res.status(200).json({
        botResponse: `⚠️ Context "${context}" already exists. Skipped uploading.`
      });
    }
    await uploadChunks(context);

    let confirmationMessage = '';
    if (context === 'pokemon') {
      confirmationMessage = "Great! I've got access to the original 151 Pokemon statistics now, let's discuss.";
    }
    if (context === 'the-book-of-five-rings') {
      confirmationMessage = "I now have The Book of Five Rings for philosophical discussions.";
    }

    console.log(`✅ Context "${context}" uploaded and indexed!`);

    res.json({
      botResponse: confirmationMessage
    });
  } catch (error) {
    console.error('Error uploading context:', error);
    res.status(500).json({ error: 'Failed to upload context' });
  }
};
