# ChatRoom server (Socket.io)

```bash
cp .env.example .env
npm install
npm run dev    # http://localhost:4200
npm test       # 5 tests with real sockets
```

## Events
| Client → server | Payload |
|---|---|
| `room:join` | `roomId` |
| `message:send` | `{ id, roomId, text, image?, createdAt }` (server replaces `user` and `createdAt`) |
| `typing` | `{ roomId, isTyping }` (volatile) |
| `reaction:toggle` | `{ roomId, messageId, emoji }` |
| `history` | `{ roomId, before?, limit? }` + ack callback → `{ messages, hasMore }` |

Server → client: `chat:event` with `{ type: 'message' | 'typing' | 'presence' | 'reaction', ... }` and `chat:error`.

The user is sent in the handshake (`auth.user`) and validated with Zod. This demo has no passwords — a real app would send a JWT (e.g. from Supabase Auth) and verify it in `io.use()`.

## Deploy (free)
Render → New Web Service → root directory `server`, build `npm install && npm run build`, start `npm start`, env `CLIENT_ORIGIN=https://davidgeorgeconstantin-spec.github.io`.
