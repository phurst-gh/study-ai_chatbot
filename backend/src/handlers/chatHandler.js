import { summariseOldMessages } from '../utils/summarise.js';
import { getPineconeContext } from '../utils/pinecone/getPineconeContext.js';
import { chatModel } from '../google-gemini-client.js';

const MAX_MESSAGES = 10;
// System prompt to guide the ai (into polite conversation) when using muti-turn conversations
const systemPrompt = "You are a helpful and creative chatbot. Continue the conversation naturally.";

export const chatHandler = async (req, res) => {
  try {
    const { messages, context } = req.body;
    console.log('================== Clicked button context ==================');
    console.log(context);

    // If there are more than MAX_MESSAGES
    let summarisedMessages = '';
    if (messages.length > MAX_MESSAGES) {
      summarisedMessages = await summariseOldMessages(messages, MAX_MESSAGES);
    }

    // If the user clicks a context button
    let pineconeContextSnippet = '';
    if (context) {
      const latestUserMessage = messages[messages.length - 1].text;
      pineconeContextSnippet = await getPineconeContext(context, latestUserMessage);
    }

    // Reduce usage of tokens by limiting the 'memory' to the last 10 messages
    const last10Messages = messages.slice(-MAX_MESSAGES);
    const formattedConversation = last10Messages
    .map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`)
    .join('\n');

    // Build prompt
    let prompt = `${systemPrompt}\n`;
    if (pineconeContextSnippet !== '') {
      prompt += `Here is some context to help you answer:\n${pineconeContextSnippet}\n`;
    }
    if (summarisedMessages !== '') {
      prompt += `Summary of earlier conversation: ${summarisedMessages}\n`;
    }
    prompt += `${formattedConversation}\n`; // inc: systemPrompt/summarisedMessages/last10Messages/pineconeContextSnippet/formattedConversation

    console.log('================== Prompt pieces ==================');
    console.log('systemPrompt', systemPrompt);
    console.log('summarisedMessages', summarisedMessages);
    console.log('last10Messages', last10Messages);
    console.log('pineconeContextSnippet', pineconeContextSnippet);
    console.log('================== Final prompt (prompt) ==================');
    console.log(prompt);

    // Send prompt
    const result = await chatModel.generateContent(prompt);

    // Strip out the "Bot:" prefix if it exists
    let botResponse = result.response.text().trim();
    if (botResponse.startsWith("Bot:")) {
      botResponse = botResponse.slice(4).trim();
    }

    res.json({ reply: botResponse });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
