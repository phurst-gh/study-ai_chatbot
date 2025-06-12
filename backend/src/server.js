import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { chatHandler } from './handlers/chatHandler.js';
import { uploadContextHandler } from './handlers/uploadContextHandler.js';

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/chat', chatHandler);
app.post('/upload-context', uploadContextHandler);

app.listen(port, async () => {
  console.log(`Backend running on http://localhost:${port}`);
});
