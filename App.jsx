import React, { useState } from "react";
import Simulator from "./Simulator.jsx";
import Dashboard from "./Dashboard.jsx";

// ============================================================
// FIFA 2026 PREDICTION ENGINE — Rohit Maha Balaji
// App shell: tab navigation between the Live Simulator
// (in-browser ELO Monte Carlo) and the Forecast Dashboard
// (full 4-model ensemble output for all 46 teams).
// ============================================================

const C = {
  bg: "#0A1020", line: "#1F2E4D", green: "#00E68C",
  text: "#E8EFFA", dim: "#4E617F",
};

const TABS = [
  { id: "sim", label: "Live Simulator" },
  { id: "dash", label: "Forecast Dashboard" },
];

export default function App() {
  const [tab, setTab] = useState("sim");

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .tab-btn { transition: color .15s ease, border-color .15s ease; }
        .tab-btn:hover { color: ${C.text} !important; }
        .tab-btn:focus-visible { outline: 2px solid rgba(0,230,140,0.7); outline-offset: 2px; border-radius: 4px; }
      `}</style>

      <nav aria-label="Site sections" style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(7,11,22,0.88)", backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", alignItems: "stretch", justifyContent: "space-between",
        gap: 12, padding: "0 clamp(14px,3vw,32px)", flexWrap: "wrap",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
          letterSpacing: "0.18em", color: C.dim, padding: "14px 0",
          whiteSpace: "nowrap",
        }}>
          WC2026 · <span style={{ color: C.green, marginLeft: 6 }}>PREDICTION ENGINE</span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Archivo', sans-serif", fontWeight: 700,
                  fontSize: 13.5, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: active ? C.green : C.dim,
                  padding: "16px 14px 13px",
                  borderBottom: `3px solid ${active ? C.green : "transparent"}`,
                }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {tab === "sim" ? <Simulator /> : <Dashboard />}
    </div>
  );
}
