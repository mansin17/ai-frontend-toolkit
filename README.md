# AI Frontend Toolkit

A small React application exploring three common AI-powered frontend patterns, backed by a thin Express proxy that talks to both the OpenAI and Anthropic APIs:

- **Streaming chat interface** — tokens are streamed from the LLM to the browser over Server-Sent Events (SSE) and rendered as they arrive.
- **AI-driven content recommendations** — a user's free-text interests are matched against a small content catalog by asking the model to return structured JSON rankings with a reason for each pick.
- **Intelligent natural-language search** — a plain-language question is matched against a small internal "knowledge base" by meaning rather than keywords, with a synthesized summary answer (a lightweight RAG-style workflow).

Both OpenAI (`gpt-4o-mini`) and Anthropic (`claude-sonnet-5`) are supported and swappable at runtime from the UI, so the same code paths demonstrate provider-agnostic integration.

## Why this project exists

This was built as a portfolio/reference project to demonstrate practical, production-shaped patterns for integrating LLMs into a frontend: streaming UX, structured output, provider abstraction, and keeping API keys off the client.

## Architecture

```
client (Vite + React + TypeScript + Tailwind)
   │  fetch() ── proxied "/api/*" in dev via vite.config.ts
   ▼
server (Express + TypeScript)
   │  translates provider SDK responses into SSE / JSON
   ▼
OpenAI SDK  ·  Anthropic SDK
```

The frontend never holds an API key. All calls to OpenAI/Anthropic happen on the server; the client only talks to `/api/*`.

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

Edit `server/.env` and add at least one key:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

You only need one provider's key — the UI lets you pick which provider to use, and any request to a provider without a configured key returns a clear error instead of crashing the server.

Then run both the client and server together:

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:8787

## Notes on the mock data

The recommendations and search features run against small hand-written JSON datasets (`server/src/data/catalog.json`, `server/src/data/searchDataset.json`) rather than a real database, so the project can be cloned and run without any external services beyond the LLM API itself. Swapping these for a real database or vector store would be a natural next step (e.g. adding embeddings + a vector DB for the search feature).

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Node.js · Express · OpenAI API · Anthropic API · Server-Sent Events
