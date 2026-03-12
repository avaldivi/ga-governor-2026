import express, { Request, Response } from "express";
import cors from "cors";
import { Redis } from "@upstash/redis";

const app = express();
app.use(cors());
app.use(express.json());

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheEntry {
  text: string;
  cachedAt: string;
}

interface FundingResponse {
  text: string;
  fromCache: boolean;
  cachedAt: string | null;
  cacheMiss?: boolean;
}

function getTTL(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function todayKey(candidateId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `funding:${candidateId}:${today}`;
}

// GET /api/funding/:candidateId — check cache only, no API call
app.get("/api/funding/:candidateId", async (req: Request, res: Response) => {
  const { candidateId } = req.params;
  const cacheKey = todayKey(Array.isArray(candidateId) ? candidateId[0] : candidateId);

  console.log(`[cache] checking key: ${cacheKey}`);
  const cached = await redis.get<CacheEntry>(cacheKey);

  if (cached) {
    console.log(`[cache] HIT`);
    return res.json({ text: cached.text, fromCache: true, cachedAt: cached.cachedAt } as FundingResponse);
  }

  console.log(`[cache] MISS`);

  // Mock mode for testing
  if (process.env.MOCK_FUNDING === "true") {
    const text = `[MOCK] ${candidateId} raised $1.23M last quarter. Cash on hand: $456K. Funded primarily by small donors.`;
    const cachedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    await redis.set(cacheKey, { text, cachedAt }, { ex: getTTL() });
    console.log(`[cache] SET (mock) key: ${cacheKey}`);
    return res.json({ text, fromCache: false, cachedAt } as FundingResponse);
  }

  return res.json({ cacheMiss: true } as FundingResponse);
});

// POST /api/cache — frontend calls this after getting a result from Anthropic directly
app.post("/api/cache", async (req: Request, res: Response) => {
  const { candidateId, text, cachedAt } = req.body as {
    candidateId: string;
    text: string;
    cachedAt: string;
  };

  if (!candidateId || !text || !cachedAt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const cacheKey = todayKey(candidateId);
  await redis.set(cacheKey, { text, cachedAt }, { ex: getTTL() });
  console.log(`[cache] SET key: ${cacheKey}`);
  res.json({ ok: true });
});

app.listen(3001, () => console.log("API server running on http://localhost:3001"));