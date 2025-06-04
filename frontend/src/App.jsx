import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post("http://localhost:3000/chat", { messages: newMessages });
      setMessages([...newMessages, { sender: "bot", text: response.data.reply }]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>AI Chatbot</h1>
      <div className="chat-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === "user" ? "user-message" : "bot-message"
            }
          >
            <ReactMarkdown>
              {`${message.sender === "user" ? "**You**" : "**Bot**"}: ${message.text}`}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
    </div>
  );
}

export default App;
