import { useState, useEffect, useRef } from "react";
import { MODELS } from "../constants";
import { saveSession } from "../services/session";

export function ApiKeyModal({ onSubmit, onCancel }: {
  onSubmit: (key: string, model: string) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [customModel, setCustomModel] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  // Focus the API key input on mount
  useEffect(() => {
    apiKeyInputRef.current?.focus();
  }, []);

  // Focus trap + Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onCancel(); return; }
    if (e.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("That doesn't look like a valid Anthropic API key (should start with sk-ant-)");
      apiKeyInputRef.current?.focus();
      return;
    }
    const selectedModel = useCustom ? customModel.trim() : model;
    if (!selectedModel) { setError("Please select or enter a model."); return; }
    setError("");
    saveSession(trimmed, selectedModel);
    onSubmit(trimmed, selectedModel);
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#181818", border: "1px solid #2a2a2a", borderRadius: 20,
          padding: 32, width: "100%", maxWidth: 480,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <h2 id="modal-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 6, marginTop: 0 }}>
          ⚡ AI Funding Lookup
        </h2>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginBottom: 24, marginTop: 0 }}>
          Enter your Anthropic API key to fetch live campaign finance data.
          Your key is stored only for this browser tab and never sent to our servers.
        </p>

        {/* Inline error */}
        {error && (
          <div role="alert" style={{ fontSize: 12, color: "#f08080", background: "rgba(240,80,80,0.08)", border: "1px solid rgba(240,80,80,0.25)", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* API Key input */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="api-key-input"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#aaa", display: "block", marginBottom: 8 }}
          >
            Anthropic API Key
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="api-key-input"
              ref={apiKeyInputRef}
              type={showKey ? "text" : "password"}
              value={key}
              onChange={e => { setKey(e.target.value); if (error) setError(""); }}
              placeholder="sk-ant-..."
              autoComplete="off"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#111", border: "1px solid #555", borderRadius: 10,
                padding: "10px 44px 10px 14px", fontSize: 13, color: "#f0ece4",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(s => !s)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 14,
              }}
            >{showKey ? "🙈" : "👁️"}</button>
          </div>
          <div style={{ fontSize: 11, color: "#777", marginTop: 6 }}>
            Get yours at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c" }}>console.anthropic.com</a>
          </div>
        </div>

        {/* Model selector */}
        <fieldset style={{ border: "none", padding: 0, margin: "0 0 24px 0" }}>
          <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#aaa", display: "block", marginBottom: 8, padding: 0 }}>
            Model
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODELS.map(m => {
              const isSelected = !useCustom && model === m.id;
              return (
                <label
                  key={m.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${isSelected ? "#c9a84c66" : "#2a2a2a"}`,
                    background: isSelected ? "rgba(201,168,76,0.06)" : "#111",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="model-selection"
                    value={m.id}
                    checked={isSelected}
                    onChange={() => { setModel(m.id); setUseCustom(false); }}
                    style={{ position: "absolute", opacity: 0, width: 1, height: 1, margin: -1 }}
                  />
                  <div aria-hidden="true" style={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${isSelected ? "#c9a84c" : "#666"}`,
                    background: isSelected ? "#c9a84c" : "none",
                    transition: "all 0.15s",
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{m.note}</div>
                  </div>
                </label>
              );
            })}

            {/* Custom model */}
            <label
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${useCustom ? "#c9a84c66" : "#2a2a2a"}`,
                background: useCustom ? "rgba(201,168,76,0.06)" : "#111",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="model-selection"
                value="custom"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1, margin: -1 }}
              />
              <div aria-hidden="true" style={{
                width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${useCustom ? "#c9a84c" : "#666"}`,
                background: useCustom ? "#c9a84c" : "none",
                transition: "all 0.15s",
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Custom model ID</div>
                <input
                  type="text"
                  id="custom-model-input"
                  value={customModel}
                  onFocus={() => setUseCustom(true)}
                  onChange={e => setCustomModel(e.target.value)}
                  placeholder="e.g. claude-opus-4-5"
                  aria-label="Custom model ID"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0a0a0a", border: "1px solid #444", borderRadius: 6,
                    padding: "6px 10px", fontSize: 12, color: "#f0ece4",
                    fontFamily: "monospace",
                  }}
                />
              </div>
            </label>
          </div>
        </fieldset>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "9px 20px", borderRadius: 100, border: "1px solid #555",
              background: "none", color: "#aaa", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            }}
          >Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "9px 24px", borderRadius: 100, border: "none",
              background: "#c9a84c", color: "#0f0f0f", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            }}
          >Fetch Funding ⚡</button>
        </div>
      </div>
    </div>
  );
}
