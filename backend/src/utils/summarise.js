import { chatModel } from '../google-gemini-client.js';

export const summariseOldMessages = async (messages, MAX_MESSAGES) => {
  const oldMessages = messages.slice(0, -MAX_MESSAGES);
  const oldConversation = oldMessages
    .map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`)
    .join('\n');

  const summaryPrompt = `Provide a concise summary of the following conversation:\n${oldConversation}`;
  const summaryResult = await chatModel.generateContent(summaryPrompt);
  const summarisedOldMessages = summaryResult.response.text().trim();

  return summarisedOldMessages;
}