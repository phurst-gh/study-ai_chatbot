const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const MAX_MESSAGES = 10;
// System prompt to guide the AI's behavior whe suing muti-turn conversations
const systemPrompt = "System: You are a helpful and creative chatbot. Continue the conversation naturally.";

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    // Reduce usage of tokens by limiting the 'memory' to the last 10 messages
    const last10Messages = messages.slice(-MAX_MESSAGES);
    const formattedConversation = last10Messages
    .map(m => `${m.sender === 'user' ? 'You' : 'Bot'}: ${m.text}`)
    .join('\n');

    // Construct the full prompt with the system message and conversation history
    const prompt = `${systemPrompt}.\n${formattedConversation}\n`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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