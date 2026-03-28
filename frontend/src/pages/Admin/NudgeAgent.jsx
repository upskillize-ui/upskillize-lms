import { useState, useEffect } from "react";
import { Bot, RefreshCw } from "lucide-react";

const T = {
  navy: "#1a2744", navyLight: "#2c3e6b", gold: "#b8960b",
  white: "#ffffff", bg: "#f7f8fc", border: "#e8e9f0",
  muted: "#72706b", green: "#2d6a2d", greenSoft: "#edf7ed",
};

const AGENT_URL = "https://upskill25-nudge-ai.hf.space";
const API_KEY = import.meta.env.VITE_NUDGE_API_KEY || "";

export default function NudgeAgent() {
  const [loaded, setLoaded] = useState(false);
  const dashUrl = API_KEY ? `${AGENT_URL}/?key=${API_KEY}` : AGENT_URL;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: 0 }}>Nudge AI Agent</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>Student reminders, attendance tracking & risk alerts</p>
        </div>
        <button onClick={() => { setLoaded(false); setTimeout(() => setLoaded(true), 100); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T.navy, cursor: "pointer" }}>
          <RefreshCw size={13} /> Reload
        </button>
      </div>

      <div style={{ background: T.greenSoft, borderRadius: 8, padding: "8px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.green, fontWeight: 600 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} /> Agent Connected & Running
      </div>

      <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, background: T.white, position: "relative" }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg, zIndex: 2 }}>
            <Bot size={36} style={{ color: T.navy, marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 13, color: T.muted }}>Loading Nudge AI Dashboard...</p>
          </div>
        )}
        <iframe
          src={dashUrl}
          onLoad={() => setLoaded(true)}
          style={{ width: "100%", height: "calc(100vh - 200px)", border: "none", display: "block" }}
          title="Nudge AI Dashboard"
        />
      </div>
    </div>
  );
}
