const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { summariseOldMessages } = require('./summarise');
const fs = require('fs');

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const MAX_MESSAGES = 10;
// System prompt to guide the ai (into polite conversation) when using muti-turn conversations
const systemPrompt = "System: You are a helpful and creative chatbot. Continue the conversation naturally.";

app.post('/chat', async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { messages, context } = req.body;
    // If there are more than MAX_MESSAGES, summarise the older messages
    let summarisedMessages = '';
    if (messages.length > MAX_MESSAGES) {
      summarisedMessages = await summariseOldMessages(messages, MAX_MESSAGES, model);
    }
    // If the user clicks a context button, load the context from a file
    let contextSnippet = '';
    if (context) {
      try {
        contextSnippet = fs.readFileSync(`./context/${context}.txt`, 'utf-8');
      } catch (err) {
        console.log('Error loading context file:', err);
      }
    }

    // Reduce usage of tokens by limiting the 'memory' to the last 10 messages (true memory will need a DB)
    const last10Messages = messages.slice(-MAX_MESSAGES);
    const formattedConversation = last10Messages
    .map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`)
    .join('\n');

    // Build prompt: include the system-prompt/summary/formatted conversation/context
    let prompt = `${systemPrompt}\n`;

    if (contextSnippet !== '') {
      prompt += `Here is some context to help you answer:\n${contextSnippet}\n`;
    }

    if (summarisedMessages !== '') {
      prompt += `Summary of earlier conversation: ${summarisedMessages}\n`;
    }
    prompt += `${formattedConversation}\n`;

    // Tracking the convo memory
    console.log('================== Summarised Messages ==================');
    console.log(summarisedMessages);
    console.log('================== Total Memory (prompt) ==================');
    console.log(prompt);

    // Send prompt
    const result = await model.generateContent(prompt);

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
});

app.listen(port, async () => {
  console.log(`Backend running on http://localhost:${port}`);
});


// ----------------------------------------------------------------
// Example 1: prompt variable rather than a user input
// async function generateResponse() {
//   const prompt = "Describe the entrancd to a grim, dark dungeon for a Dungeons & Dragons campaign.";
//   const result = await model.generateContent(prompt);
//   console.log(result.response.text()); 
// };