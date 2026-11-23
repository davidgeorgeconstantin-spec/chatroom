# ChatRoom — Lecții (în română)

Proiectul 9: chat în timp real. Aici înveți ce înseamnă „real-time” și cum construiești o aplicație care nu depinde de o singură tehnologie.

## Lecția 1 — HTTP vs. WebSocket
Cu HTTP, **clientul întreabă** și serverul răspunde. Pentru chat ar trebui să întrebi la fiecare secundă „am mesaje noi?” (polling) — ineficient.
Un **WebSocket** e o conexiune deschisă permanent: serverul poate trimite oricând. **Socket.io** adaugă peste el: reconectare automată, camere (rooms), confirmări (ack).
Pe GitHub Pages nu avem server, așa că demo-ul folosește **BroadcastChannel** — un „canal” între taburile aceluiași browser.

**Exercițiu:** deschide aplicația în 2 taburi cu 2 nume și urmărește în DevTools → Application → Local Storage cum se salvează mesajele.

## Lecția 2 — Interfața `ChatTransport` (arhitectură)
UI-ul nu știe dacă vorbește cu BroadcastChannel sau cu Socket.io. Știe doar metodele: `send`, `setTyping`, `react`, `loadHistory`, `onEvent`.
Asta se numește **dependency inversion**: depinzi de o interfață, nu de o implementare. Avantaj: schimbi tehnologia fără să rescrii componentele.
Alegerea se face în `transport/index.ts`, după `VITE_SOCKET_URL`.

**Exercițiu:** creează `transport/logTransport.ts` care înfășoară alt transport și face `console.log` la fiecare mesaj trimis.

## Lecția 3 — Prezență și „X scrie…”
- **Prezență:** fiecare tab trimite un „ping” la 2,5 s. Dacă nu primim nimic de la cineva 7 s, îl considerăm offline.
- **Typing:** `useTypingEmitter` trimite „typing: true” **cel mult o dată la 2 s** (throttle) și „typing: false” după 2,5 s de pauză (debounce). Altfel am trimite un eveniment la fiecare tastă.
- **Plasa de siguranță:** dacă evenimentul „stop” se pierde, indicatorul dispare singur după 4 s.

**Exercițiu:** schimbă textul pentru 3+ persoane în „3 people are typing” (cu numărul real).

## Lecția 4 — Paginare cu cursor și scroll
Nu încărcăm toate mesajele. Cerem „ultimele 25 **mai vechi decât** primul mesaj pe care îl am” (`before = createdAt`). Asta e **paginare cu cursor** — mai sigură decât `page=2` când apar mesaje noi.
Când adăugăm mesaje sus, lista „sare”. În `MessageList` măsurăm înălțimea înainte și după (`useLayoutEffect`) și corectăm `scrollTop`.

**Exercițiu:** schimbă mărimea paginii la 10 și verifică că poziția de scroll rămâne corectă.

## Lecția 5 — Imagini și reconectare
- `resizeImage` desenează poza într-un `<canvas>` mai mic și o exportă JPEG → de la câțiva MB la ~100 KB.
- Butonul „Go offline” simulează pierderea conexiunii: mesajele intră într-o **coadă** (outbox) și se trimit la reconectare. Socket.io face asta automat (buffer + reconnect cu backoff).

**Exercițiu:** afișează în bannerul offline câte mesaje sunt în coadă.

## Lecția 6 — Securitate pe server
Niciodată nu ai încredere în client:
- identitatea (`user`) vine din handshake-ul validat, nu din mesaj;
- ora mesajului e pusă de server;
- mărimea imaginii și a textului e limitată cu Zod;
- **rate limit**: max 30 mesaje/minut per conexiune.

**Exercițiu:** în `server/`, adaugă o regulă: mesajele goale (fără text și fără imagine) sunt respinse. Scrie un test.
