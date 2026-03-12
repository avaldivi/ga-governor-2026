import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheEntry {
  text: string;
  cachedAt: string;
}

function getTTL(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

// GET /api/funding/[candidateId] — cache check only
// POST /api/funding — cache write (called by frontend after Anthropic call)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const today = new Date().toISOString().slice(0, 10);

  if (req.method === "GET") {
    const candidateId = Array.isArray(req.query.candidateId)
      ? req.query.candidateId[0]
      : req.query.candidateId;

    if (!candidateId) return res.status(400).json({ error: "Missing candidateId" });

    const cacheKey = `funding:${candidateId}:${today}`;
    const cached = await redis.get<CacheEntry>(cacheKey);

    if (cached) {
      return res.json({ text: cached.text, fromCache: true, cachedAt: cached.cachedAt });
    }

    if (process.env.MOCK_FUNDING === "true") {
      const text = `[MOCK] ${candidateId} raised $1.23M last quarter. Cash on hand: $456K.`;
      const cachedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      await redis.set(cacheKey, { text, cachedAt }, { ex: getTTL() });
      return res.json({ text, fromCache: false, cachedAt });
    }

    return res.json({ cacheMiss: true });
  }

  if (req.method === "POST") {
    const { candidateId, text, cachedAt } = req.body as {
      candidateId: string;
      text: string;
      cachedAt: string;
    };
    if (!candidateId || !text || !cachedAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const cacheKey = `funding:${candidateId}:${today}`;
    await redis.set(cacheKey, { text, cachedAt }, { ex: getTTL() });
    return res.json({ ok: true });
  }

  return res.status(405).end();
}