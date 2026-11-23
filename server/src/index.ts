import { createServer } from 'node:http';
import express from 'express';
import { createChatServer } from './chatServer.js';

const app = express();
app.get('/health', (_req, res) => res.json({ ok: true }));

const http = createServer(app);
createChatServer(http, { origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' });

const port = Number(process.env.PORT ?? 4200);
http.listen(port, () => console.log(`ChatRoom Socket.io server on http://localhost:${port}`));
