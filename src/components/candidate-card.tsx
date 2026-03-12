import { useState, useEffect } from "react";
import { Candidate, FundingData } from "../types";
import { ApiKeyModal } from "./api-key-modal";
import { BadgeChip } from "./badge-chip";
import { SESSION_KEY, SESSION_MODEL } from "../services/session";
import { callAnthropic } from "../services/llm";

const API_BASE = import.meta.env.DEV ? "http://localhost:3001" : "";

function getSessionKey(): string | null { return sessionStorage.getItem(SESSION_KEY); }
function getSessionModel(): string { return sessionStorage.getItem(SESSION_MODEL) ?? "claude-sonnet-4-6"; }

async function saveToCache(candidateId: string, text: string, cachedAt: string): Promise<void> {
  await fetch(`${API_BASE}/api/cache`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId, text, cachedAt }),
  });
}

export function CandidateCard({ candidate, party }: { candidate: Candidate; party: "dem" | "rep" }) {
  const [expanded, setExpanded] = useState(false);
  const [fundingData, setFundingData] = useState<FundingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isRep = party === "rep";
  const accent = isRep ? "#d95c4a" : "#4a90d9";
  const accentGlow = isRep ? "rgba(217,92,74,0.12)" : "rgba(74,144,217,0.12)";
  const accentBorder = isRep ? "rgba(217,92,74,0.35)" : "rgba(74,144,217,0.35)";
  const detailsId = `candidate-details-${candidate.id}`;

  useEffect(() => {
    if (candidate.photo) {
      setPhotoUrl(candidate.photo);
      return;
    }
    if (!candidate.wiki) return;
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${candidate.wiki}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const pages = data?.query?.pages;
        if (!pages) return;
        const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
        if (page?.thumbnail?.source) setPhotoUrl(page.thumbnail.source);
      })
      .catch(() => {});
  }, [candidate.wiki, candidate.photo]);

  const runFetch = async (apiKey: string, model: string) => {
    setShowModal(false);
    setLoading(true);
    setFundingData(null);
    try {
      const text = await callAnthropic(apiKey, model, candidate.name, party);
      const cachedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      await saveToCache(candidate.id, text, cachedAt);
      setFundingData({ text, fromCache: false, cachedAt });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setFundingData({ text: `Error: ${msg}`, fromCache: false, cachedAt: null });
    }
    setLoading(false);
  };

  const handleFunding = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    setFundingData(null);
    try {
      const res = await fetch(`${API_BASE}/api/funding/${candidate.id}`);
      const data = await res.json();
      if (data.text) {
        setFundingData({ text: data.text, fromCache: data.fromCache, cachedAt: data.cachedAt });
        setLoading(false);
        return;
      }
    } catch {
      // cache check failed, fall through
    }
    setLoading(false);
    const existingKey = getSessionKey();
    if (existingKey) {
      await runFetch(existingKey, getSessionModel());
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      {showModal && (
        <ApiKeyModal
          onSubmit={(key, model) => runFetch(key, model)}
          onCancel={() => setShowModal(false)}
        />
      )}
      <article
        style={{
          background: "#181818",
          border: `1px solid ${expanded ? accentBorder : "#2a2a2a"}`,
          borderRadius: 16, overflow: "hidden",
          transition: "all 0.2s",
          boxShadow: expanded ? `0 8px 32px ${accentGlow}` : "none",
        }}
      >
        {/* Toggle button wraps the header + poll bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          style={{
            display: "block", width: "100%", background: "none", border: "none",
            padding: 0, cursor: "pointer", textAlign: "left", color: "inherit",
            font: "inherit",
          }}
        >
          {/* Card Header */}
          <div style={{ display: "flex", gap: 14, padding: "20px 20px 16px", alignItems: "flex-start" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${accentBorder}`, overflow: "hidden",
              background: accentGlow, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={candidate.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                  onError={() => setPhotoUrl(null)}
                />
              ) : (
                <span aria-hidden="true" style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: accent }}>
                  {candidate.initials}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginBottom: 3 }}>
                {candidate.name}
              </div>
              <div style={{ fontSize: 11, color: "#999", letterSpacing: "0.3px", lineHeight: 1.4 }}>
                {candidate.title}
              </div>
              {candidate.badges.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {candidate.badges.map(b => <BadgeChip key={b.label} {...b} />)}
                </div>
              )}
            </div>
            <div
              aria-hidden="true"
              style={{
                fontSize: 18, color: "#555", transition: "transform 0.2s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0, marginTop: 4,
              }}
            >▾</div>
          </div>

          {/* Poll bar */}
          <div style={{ padding: "0 20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: accent, lineHeight: 1, minWidth: 60 }}>
                {candidate.poll !== null ? `${candidate.poll}%` : "—"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 5 }}>{candidate.pollNote}</div>
                <div
                  role="progressbar"
                  aria-valuenow={candidate.poll ?? 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${candidate.name} polling at ${candidate.poll ?? 0}%`}
                  style={{ height: 5, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}
                >
                  <div style={{ height: "100%", width: `${candidate.poll ?? 1}%`, background: accent, borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div id={detailsId} style={{ borderTop: "1px solid #222" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #222" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Background</div>
              <div style={{ fontSize: 13, color: "#b0ada6", lineHeight: 1.65 }}>{candidate.background}</div>
            </div>

            <div style={{ padding: "16px 20px", borderBottom: "1px solid #222" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Campaigning On</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {candidate.platform.map(p => (
                  <span key={p} style={{
                    fontSize: 12, padding: "4px 12px", background: "#222",
                    border: "1px solid #2e2e2e", borderRadius: 100, color: "#999",
                  }}>{p}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent }}>Funding</div>
                <button
                  onClick={handleFunding}
                  disabled={loading}
                  aria-label={loading ? "Checking funding data…" : `Check latest funding data for ${candidate.name}`}
                  aria-busy={loading}
                  style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
                    padding: "5px 14px", borderRadius: 100, cursor: loading ? "not-allowed" : "pointer",
                    border: `1px solid ${accentBorder}`, background: accentGlow, color: accent,
                    transition: "all 0.2s", opacity: loading ? 0.6 : 1,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {loading ? "⟳ Checking..." : "⚡ Check Latest"}
                </button>
              </div>

              <div style={{ fontSize: 13, color: "#b0ada6", lineHeight: 1.65, marginBottom: 8 }}>
                {candidate.funding}
              </div>
              <div
                role="progressbar"
                aria-valuenow={candidate.fundingPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${candidate.name} funding at ${candidate.fundingPct}% of leader`}
                style={{ height: 4, background: "#2a2a2a", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}
              >
                <div style={{ height: "100%", width: `${candidate.fundingPct}%`, background: accent, borderRadius: 2 }} />
              </div>

              <div aria-live="polite" aria-atomic="true">
                {fundingData && (
                  <div style={{
                    fontSize: 13, color: "#d0cdc6", lineHeight: 1.7,
                    padding: "12px 14px", background: "#1e1e1e",
                    border: `1px solid ${accentBorder}`, borderRadius: 10, marginTop: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: accent }}>
                        ⚡ AI Lookup Result
                      </div>
                      <div style={{ fontSize: 10, color: "#777", letterSpacing: "0.5px" }}>
                        {fundingData.fromCache
                          ? `📦 Cached today at ${fundingData.cachedAt}`
                          : `🟢 Fresh · fetched at ${fundingData.cachedAt}`}
                      </div>
                    </div>
                    {fundingData.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
