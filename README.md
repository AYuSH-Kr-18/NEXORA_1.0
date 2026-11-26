# NEXORA 1.0: Technogaming fest website

GTA-themed website for the college Technogaming fest: events, schedule, venue, prize pool, registration, UPI payment (proof upload) and a Mission Pass.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

- All event details live in `src/data/event.js` (placeholders marked TODO).
- Backend hook-up: `src/api/index.js` only (currently saves to the browser).
- Where to change what: see `EDITING.md`.

Credits: fonts Anton, Yellowtail, JetBrains Mono, Inter Tight (SIL OFL). "Mission passed" artwork uses Pricedown (Typodermic) as outlined graphics only. Fan-made theme, not affiliated with Rockstar Games.
