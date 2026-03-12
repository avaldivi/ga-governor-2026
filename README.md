# Georgia Governor 2026 — Voter Guide

A nonpartisan voter information site for the 2026 Georgia gubernatorial race. Profiles all 15 declared candidates (6 Democrats, 8 Republicans) with polling data, platform summaries, and AI-powered live campaign finance lookups.

**Live site:** https://ga-governor-2026.vercel.app

---

## Local Setup

**Prerequisites:** Node.js 18+

```bash
npm install
cp .env.example .env   # then fill in your values (see below)
npm run dev
```

`npm run dev` starts two processes concurrently:
- Vite dev server (frontend) on `http://localhost:5173`
- Express API server on `http://localhost:3001`

Other scripts:
```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Optional — only needed for mock mode during development
MOCK_FUNDING=false
```

| Variable | Required | Description |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Yes | REST endpoint for your Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Auth token for Upstash Redis |
| `MOCK_FUNDING` | No | Set to `true` to return fake funding data without hitting any APIs |

> **Note:** `ANTHROPIC_API_KEY` is **not** a server-side variable — users supply their own key through the in-browser modal. It is stored only in `sessionStorage` and is never sent to this server.

### Getting Upstash credentials

1. Create a free database at [upstash.com](https://upstash.com)
2. Copy the **REST URL** and **REST Token** from the database dashboard

---

## How Caching Works

The funding lookup is the most expensive operation on the site — it calls the Claude API with web search to find recent campaign finance data. To avoid redundant calls and share results across all visitors, responses are cached in Upstash Redis.

### Flow

```
User clicks "⚡ Check Latest"
        │
        ▼
GET /api/funding/:candidateId
        │
   Cache hit? ──Yes──▶ Return cached data  (fromCache: true)
        │
       No
        │
        ▼
Prompt user for Anthropic API key
        │
        ▼
Browser calls Anthropic API directly
        │
        ▼
POST /api/cache  ──▶  Save result to Redis
        │
        ▼
Display result  (fromCache: false)
```

### Cache key format

```
funding:{candidateId}:{YYYY-MM-DD}
```

Each candidate gets one cache entry per calendar day. The TTL is calculated as seconds remaining until midnight UTC, so the cache automatically resets daily.

### What's stored

```ts
{
  text: string;      // The AI-generated funding summary
  cachedAt: string;  // Human-readable time, e.g. "2:45 PM"
}
```

The UI indicates whether data came from cache (`📦 Cached today at 2:45 PM`) or was freshly fetched (`🟢 Fresh · fetched at 2:45 PM`).

### Mock mode

Set `MOCK_FUNDING=true` in `.env` to skip Redis and return placeholder text. Useful for UI development without needing real API credentials.

---

## Project Structure

```
├── api/
│   └── funding.ts          # Vercel serverless function (GET + POST cache endpoints)
│
├── src/
│   ├── App.tsx             # Root layout: hero, nav, party sections
│   ├── components/
│   │   ├── candidate-card.tsx   # Expandable candidate card with funding lookup
│   │   ├── party-section.tsx    # Section wrapper for a party's candidate grid
│   │   ├── api-key-modal.tsx    # Modal for entering Anthropic API key + model
│   │   └── badge-chip.tsx       # Small label chip (Frontrunner, Trump-backed, etc.)
│   ├── services/
│   │   ├── llm.ts          # Calls Anthropic API from the browser
│   │   └── session.ts      # Persists API key + model choice in sessionStorage
│   ├── constants/
│   │   ├── candidates.ts   # All 15 candidate profiles (polling, funding, platform)
│   │   ├── models.ts       # Claude model options shown in the modal
│   │   └── badge-styles.ts # Color themes for badge chips
│   └── types/              # TypeScript interfaces
│
├── server.ts               # Express server used in local development only
├── vercel.json             # SPA rewrite rule for Vercel
└── index.html              # HTML entry point with meta/OG tags
```

---

## Deploying to Vercel

The project is configured for Vercel. `vercel.json` contains a catch-all rewrite so client-side routing works:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The `api/funding.ts` file is automatically deployed as a Vercel Serverless Function, replacing the local Express server in production.

### Steps

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in the Vercel project settings:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `MOCK_FUNDING` → `false`
4. Deploy — Vercel will build and redeploy automatically on every push to `main`

No `ANTHROPIC_API_KEY` is needed on the server; users bring their own key at runtime.
