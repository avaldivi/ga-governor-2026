import { Candidate } from "../types";
import { CandidateCard } from "./candidate-card";

export function PartySection({ title, count, party, candidates, visible }: {
  title: string; count: string; party: "dem" | "rep";
  candidates: Candidate[]; visible: boolean;
}) {
  if (!visible) return null;
  const accent = party === "rep" ? "#d95c4a" : "#4a90d9";
  const sectionId = `${party}-section-heading`;
  return (
    <section aria-labelledby={sectionId} style={{ marginBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <h2 id={sectionId} style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: accent, margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "#777", padding: "4px 14px", border: "1px solid #2a2a2a", borderRadius: 100 }}>{count} candidates</span>
        <div aria-hidden="true" style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, alignItems: "start" }}>
        {candidates.map(c => <CandidateCard key={c.id} candidate={c} party={party} />)}
      </div>
    </section>
  );
}
