# AI Frontend Toolkit

A small React application exploring three common AI-powered frontend patterns, backed by a thin Express proxy that talks to three free-tier LLM APIs — Groq, Google Gemini and OpenRouter:

- **Streaming chat interface** — tokens are streamed from the LLM to the browser over Server-Sent Events (SSE) and rendered as they arrive.
- **AI-driven content recommendations** — a user's free-text interests are matched against a small content catalog by asking the model to return structured JSON rankings with a reason for each pick.
- **Intelligent natural-language search** — a plain-language question is matched against a small internal "knowledge base" by meaning rather than keywords, with a synthesized summary answer (a lightweight RAG-style workflow).

Groq (`openai/gpt-oss-120b`), Gemini (`gemini-flash-latest`) and OpenRouter (`openrouter/free`) are swappable at runtime from the UI. All three expose an OpenAI-compatible API, so the server uses the `openai` SDK for every provider and only changes the base URL, key and model. None of them need a credit card.

## Why this project exists

This was built as a portfolio/reference project to demonstrate practical, production-shaped patterns for integrating LLMs into a frontend: streaming UX, structured output, provider abstraction, and keeping API keys off the client.

## Architecture

```
client (Vite + React + TypeScript + Tailwind)
   │  fetch() ── proxied "/api/*" in dev via vite.config.ts
   ▼
server (Express + TypeScript)
   │  translates OpenAI-compatible responses into SSE / JSON
   ▼
Groq  ·  Gemini  ·  OpenRouter   (all via the openai SDK)
```

The frontend never holds an API key. All calls to the LLM providers happen on the server; the client only talks to `/api/*`.

Chat streaming uses `fetch()` with a manually parsed `text/event-stream` body rather than the browser's `EventSource`, because `EventSource` cannot send a POST body (needed here to send the conversation history). See [`client/src/api/streamChat.ts`](client/src/api/streamChat.ts).

## Project structure

```
ai-frontend-toolkit/
├── client/           Vite + React + TypeScript frontend
│   └── src/
│       ├── api/          fetch wrappers (streamChat, recommend, search)
│       ├── components/   ChatPanel, RecommendationsPanel, SearchPanel, ...
│       └── App.tsx
└── server/           Express + TypeScript backend
    └── src/
        ├── routes/       chat.ts (SSE), recommend.ts, search.ts
        ├── lib/          provider clients + shared JSON-completion helper
        └── data/         mock catalog + mock search dataset
```

## Getting started

Requires Node 20+.

```bash
git clone <your-repo-url>
cd ai-frontend-toolkit
npm run install:all
cp server/.env.example server/.env
```

Edit `server/.env` and add at least one key (all free, no credit card):

```
AFT_GQ_TOKEN=gsk_...         # https://console.groq.com/keys
AFT_GM_TOKEN=...           # https://aistudio.google.com/apikey
AFT_OR_TOKEN=sk-or-... # https://openrouter.ai/settings/keys
```

Default models can be overridden with `AFT_GQ_MODEL`, `AFT_GM_MODEL` and `AFT_OR_MODEL`.

You only need one provider's key — the UI lets you pick which provider to use, and any request to a provider without a configured key returns a clear error instead of crashing the server.

Then run both the client and server together:

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:8787

## Deploying

In production the Express server also serves the built React app, so the whole project runs as **one web service** on one URL (no CORS or proxy setup needed).

**Render (free):**

1. Push this repo to GitHub.
2. On [render.com](https://render.com), choose **New → Blueprint** and select the repo. It reads [`render.yaml`](render.yaml).
3. When prompted, paste your `AFT_GQ_TOKEN`, `AFT_GM_TOKEN` and/or `AFT_OR_TOKEN`. Leave unused ones empty.
4. Deploy. Your app will be at `https://<service-name>.onrender.com`.

**Frontend on Netlify + backend on Render:** Netlify can't run the Express server, so deploy the backend to Render as above, then:

1. On Netlify, import the repo. [`netlify.toml`](netlify.toml) builds `client/` and publishes `client/dist`.
2. In Netlify → **Site configuration → Environment variables**, add `VITE_API_URL` = your Render URL (e.g. `https://ai-frontend-toolkit.onrender.com`), then redeploy.
3. On Render, make sure `CLIENT_ORIGIN` is your Netlify URL (e.g. `https://spark-prompt.netlify.app`) so the browser is allowed to call the API.

**Any other Node host** (Railway, Fly.io, a VPS…): build with `npm run install:all && npm run build`, start with `npm start`, and set the API keys as environment variables in the host's dashboard. The host's `PORT` is picked up automatically.

API keys live only in the server's environment — never in the repo (`server/.env` is gitignored) and never in the browser bundle. Each visitor IP is limited to 20 API requests per minute (`AFT_RATE_LIMIT`) so a public deployment can't drain your free quotas.

## Notes on the mock data

The recommendations and search features run against small hand-written JSON datasets (`server/src/data/catalog.json`, `server/src/data/searchDataset.json`) rather than a real database, so the project can be cloned and run without any external services beyond the LLM API itself. Swapping these for a real database or vector store would be a natural next step (e.g. adding embeddings + a vector DB for the search feature).

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Node.js · Express · Groq · Gemini · OpenRouter · Server-Sent Events
