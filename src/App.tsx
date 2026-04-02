import { useState } from "react";
import { CANDIDATES } from "./constants";
import { PartySection } from "./components/party-section";

export default function App() {
  const [filter, setFilter] = useState<"all" | "dem" | "rep">("all");

  const NavBtn = ({ id, label }: { id: "all" | "dem" | "rep"; label: string }) => {
    const active = filter === id;
    const activeColor = id === "dem" ? "#4a90d9" : id === "rep" ? "#d95c4a" : "#c9a84c";
    return (
      <button
        onClick={() => setFilter(id)}
        aria-pressed={active}
        style={{
          background: active ? `${activeColor}1a` : "none",
          border: `1px solid ${active ? `${activeColor}80` : "transparent"}`,
          color: active ? activeColor : "#999",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
          letterSpacing: "1px", textTransform: "uppercase",
          padding: "7px 18px", borderRadius: 100, cursor: "pointer", transition: "all 0.2s",
        }}
      >{label}</button>
    );
  };

  return (
    <div style={{ background: "#0f0f0f", margin: "auto", minHeight: "100vh", color: "#f0ece4", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Skip link */}
      <a
        href="#main-content"
        style={{
          position: "absolute", top: -40, left: 8, zIndex: 9999,
          background: "#c9a84c", color: "#0f0f0f", padding: "8px 16px",
          borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: "none",
          transition: "top 0.2s",
        }}
        onFocus={e => { (e.target as HTMLAnchorElement).style.top = "8px"; }}
        onBlur={e => { (e.target as HTMLAnchorElement).style.top = "-40px"; }}
      >
        Skip to main content
      </a>

      {/* Voter Registration Deadline Banner */}
      <div
        role="alert"
        style={{
          background: "linear-gradient(90deg, #c9a84c22, #c9a84c11)",
          borderBottom: "1px solid #c9a84c44",
          padding: "10px 24px",
          textAlign: "center",
          fontSize: 13,
          color: "#e8d9a0",
          fontWeight: 500,
        }}
      >
        🗳️ <strong style={{ color: "#c9a84c" }}>Voter Registration Deadline: April 20, 2026</strong> — Register to vote in the May 19 primary at{" "}
        <a
          href="https://mvp.sos.ga.gov/s/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#c9a84c", fontWeight: 700, textDecoration: "underline" }}
        >
          My Voter Page
        </a>
      </div>

      {/* Hero */}
      <header style={{
        textAlign: "center", padding: "60px 24px 48px", borderBottom: "1px solid #1e1e1e",
        background: "radial-gradient(ellipse 60% 40% at 20% 50%, rgba(74,144,217,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(217,92,74,0.06) 0%, transparent 60%), #0f0f0f",
        position: "relative", overflow: "hidden",
      }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(60px,15vw,200px)",
            fontWeight: 900, color: "rgba(255,255,255,0.02)", whiteSpace: "nowrap", pointerEvents: "none",
          }}>GEORGIA</div>
        <div aria-hidden="true" style={{ fontSize: 40, marginBottom: 16 }}>🍑</div>
        <div style={{ fontSize: 11, letterSpacing: "4px", textTransform: "uppercase", color: "#777", marginBottom: 12 }}>2026 Gubernatorial Race</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,60px)", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 24 }}>
          Know Your <span style={{ color: "#c9a84c" }}>Candidates</span>
        </h1>
        <div style={{ display: "inline-flex", gap: 24, flexWrap: "wrap", justifyContent: "center", background: "#181818", border: "1px solid #2a2a2a", borderRadius: 100, padding: "10px 28px", fontSize: 12, color: "#888" }}>
          <span>🗳️ Primary: <strong style={{ color: "#f0ece4" }}>May 19, 2026</strong></span>
          <span>📍 <strong style={{ color: "#f0ece4" }}>Georgia</strong></span>
          <span>🏛️ Open Seat — <strong style={{ color: "#f0ece4" }}>Kemp Term-Limited</strong></span>
        </div>
      </header>

      {/* Nav */}
      <nav
        aria-label="Filter candidates"
        style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(15,15,15,0.95)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e1e1e",
          display: "flex", justifyContent: "center", gap: 6, padding: "12px 24px", flexWrap: "wrap",
        }}
      >
        <NavBtn id="all" label="All Candidates" />
        <NavBtn id="dem" label="🔵 Democrats" />
        <NavBtn id="rep" label="🔴 Republicans" />
      </nav>

      {/* Instructions */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 0" }}>
        <p style={{ fontSize: 12, color: "#888", textAlign: "center", padding: "10px 0", margin: 0 }}>
          Click any card to expand · Use <span style={{ color: "#c9a84c" }}>⚡ Check Latest</span> to query live funding data via AI
        </p>
      </div>

      {/* Content */}
      <main id="main-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>
        <PartySection title="Democrats" count="7" party="dem" candidates={CANDIDATES.dem} visible={filter === "all" || filter === "dem"} />

        {filter === "all" && (
          <div role="separator" aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 24, margin: "20px 0 48px" }}>
            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
            <span style={{ fontSize: 10, letterSpacing: "4px", textTransform: "uppercase", color: "#666" }}>Republican Primary</span>
            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
          </div>
        )}

        <PartySection title="Republicans" count="9" party="rep" candidates={CANDIDATES.rep} visible={filter === "all" || filter === "rep"} />

        {/* Disclaimer */}
        <div style={{
          marginTop: 40, padding: "20px 24px", background: "#141414",
          border: "1px solid #1e1e1e", borderRadius: 12,
          fontSize: 11, color: "#777", lineHeight: 1.8, textAlign: "center",
        }}>
          <strong style={{ color: "#999" }}>📋 About This Page</strong><br />
          Nonpartisan voter information resource. Polling data from Emerson College/Nexstar (March 2026) and other noted sources. Static funding figures reflect public disclosures as of early 2026.
          The ⚡ Check Latest button queries Claude AI for more recent data — results are cached daily and shared across all visitors.
          For authoritative filings visit the <a href="https://ethics.ga.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c" }}>Georgia Ethics Commission</a> or <a href="https://www.transparencyusa.org/ga" target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c" }}>Transparency USA</a>.<br /><br />
          <strong style={{ color: "#999" }}>🗳️ Key Dates</strong><br />
          <em>Voter Registration Deadline: April 20, 2026 · Primary: May 19, 2026 · Runoff (if needed): June 16, 2026 · General Election: November 3, 2026</em>
        </div>
      </main>
    </div>
  );
}