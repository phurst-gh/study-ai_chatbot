import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedContext, setSelectedContext] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post("http://localhost:3000/chat", {
        messages: newMessages,
        context: selectedContext
      });
      setMessages([...newMessages, { sender: "bot", text: response.data.reply }]);
      setSelectedContext("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const uploadContext = async (contextName) => {
    try {
      await axios.post('http://localhost:3000/upload-context', { context: contextName });
      
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Great! I've loaded the context for ${contextName}. Let's discuss.` },
      ]);
    } catch (err) {
      console.error('Error uploading context:', err);
    }
  };

  return (
    <div>
      <h1>AI Chatbot</h1>
      <div className="chat-container">
        {messages.map((message, index) => {
          const { sender, text } = message;

          return (
          <div
            key={index}
            className={
              sender === "user" ? "user-message" : "bot-message"
            }
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {`${sender === "user" ? "**You**" : "**Bot**"}: ${text}`}
            </ReactMarkdown>
          </div>
        )})}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="input-field"
        />

        <div className="context-buttons-container">
          <button onClick={() => uploadContext("the-book-of-five-rings")}>The Book of 5 Rings</button>
          <button onClick={() => uploadContext("pokemon")}>Pokedex - Original 151</button>
        </div>
      </div>
    </div>
  );
}

export default App;
