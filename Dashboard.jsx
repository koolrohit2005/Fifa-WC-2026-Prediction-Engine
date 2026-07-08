import React, { useState, useMemo, useRef, useCallback } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from "recharts";

/* ---------------- data ---------------- */

const CSV = `Team,ELO,RF,LR,Climate,Final_Combined
Spain,0.1086,0.0632,0.151,0.121,0.11095
Argentina,0.1116,0.06,0.1666,0.1002,0.1096
Morocco,0.0564,0.1062,0.0764,0.0672,0.07655
France,0.0554,0.0596,0.0802,0.0572,0.0631
Brazil,0.0516,0.046,0.066,0.0504,0.0535
Portugal,0.0494,0.0476,0.0456,0.0452,0.04695
Japan,0.0424,0.0474,0.05,0.047,0.0467
Mexico,0.0374,0.0606,0.047,0.0348,0.04495
England,0.0386,0.0492,0.0326,0.0418,0.04055
Netherlands,0.0288,0.0624,0.023,0.0292,0.03585
Germany,0.0402,0.0244,0.0432,0.0336,0.03535
Colombia,0.0358,0.039,0.0266,0.0272,0.03215
South Korea,0.0272,0.0308,0.02,0.0256,0.0259
Ecuador,0.0216,0.0244,0.024,0.0288,0.0247
Belgium,0.0206,0.0286,0.0116,0.023,0.02095
Iran,0.0212,0.0182,0.0174,0.0228,0.0199
Canada,0.0186,0.0214,0.0188,0.0192,0.0195
Senegal,0.0166,0.0316,0.0102,0.0192,0.0194
Algeria,0.0224,0.0218,0.0122,0.021,0.01935
Croatia,0.0226,0.0254,0.008,0.0212,0.0193
Turkey,0.02,0.0236,0.0094,0.0188,0.01795
Switzerland,0.0192,0.0136,0.0114,0.0188,0.01575
Uruguay,0.0146,0.0226,0.0062,0.018,0.01535
Australia,0.0146,0.015,0.0064,0.011,0.01175
Ivory Coast,0.0132,0.0124,0.0084,0.0114,0.01135
Norway,0.0136,0.0128,0.005,0.0094,0.0102
Austria,0.0128,0.0104,0.004,0.013,0.01005
United States,0.014,0.0062,0.006,0.0134,0.0099
Egypt,0.0098,0.0046,0.0042,0.013,0.0079
Uzbekistan,0.0076,0.0032,0.0042,0.0072,0.00555
Paraguay,0.0084,0.001,0.001,0.0058,0.00405
Panama,0.0056,0.0014,0.0014,0.0054,0.00345
Iraq,0.0044,0.0004,0.0002,0.003,0.002
DR Congo,0.0022,0.0004,0.0004,0.0036,0.00165
Scotland,0.0018,0.0002,0.0006,0.0032,0.00145
South Africa,0.0014,0.002,0.0002,0.0014,0.00125
Sweden,0.0018,0.0018,0.0002,0.0008,0.00115
Tunisia,0.0018,0,0.0002,0.0024,0.0011
Jordan,0.0016,0.0002,0.0002,0.0012,0.0008
Saudi Arabia,0.001,0.0004,0,0.0012,0.00065
Cape Verde,0.0016,0,0,0.0006,0.00055
Qatar,0.001,0,0,0.0004,0.00035
Bosnia and Herzegovina,0.0004,0,0,0.0004,0.0002
Haiti,0.0002,0,0,0.0006,0.0002
Ghana,0.0002,0,0,0.0004,0.00015
Czechia,0.0002,0,0,0,0.00005`;

const FLAGS = {
  Spain: "🇪🇸", Argentina: "🇦🇷", Morocco: "🇲🇦", France: "🇫🇷", Brazil: "🇧🇷",
  Portugal: "🇵🇹", Japan: "🇯🇵", Mexico: "🇲🇽", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Netherlands: "🇳🇱", Germany: "🇩🇪", Colombia: "🇨🇴", "South Korea": "🇰🇷",
  Ecuador: "🇪🇨", Belgium: "🇧🇪", Iran: "🇮🇷", Canada: "🇨🇦", Senegal: "🇸🇳",
  Algeria: "🇩🇿", Croatia: "🇭🇷", Turkey: "🇹🇷", Switzerland: "🇨🇭",
  Uruguay: "🇺🇾", Australia: "🇦🇺", "Ivory Coast": "🇨🇮", Norway: "🇳🇴",
  Austria: "🇦🇹", "United States": "🇺🇸", Egypt: "🇪🇬", Uzbekistan: "🇺🇿",
  Paraguay: "🇵🇾", Panama: "🇵🇦", Iraq: "🇮🇶", "DR Congo": "🇨🇩",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "South Africa": "🇿🇦", Sweden: "🇸🇪", Tunisia: "🇹🇳",
  Jordan: "🇯🇴", "Saudi Arabia": "🇸🇦", "Cape Verde": "🇨🇻", Qatar: "🇶🇦",
  "Bosnia and Herzegovina": "🇧🇦", Haiti: "🇭🇹", Ghana: "🇬🇭", Czechia: "🇨🇿",
};
const flag = (t) => FLAGS[t] || "🏳️";

/* ---------------- theme tokens ---------------- */

const T = {
  ink: "#0A1020",
  panel: "#101A30",
  panel2: "#0D1528",
  line: "#1F2E4D",
  text: "#E8EFFA",
  muted: "#7E93B8",
  faint: "#4E617F",
  green: "#00E68C",
  mint: "#7CF5BD",
  greenSoft: "rgba(0,230,140,0.12)",
};
const MODELS = [
  { key: "ELO", label: "ELO", color: "#00E676" },
  { key: "RF", label: "Random Forest", color: "#29B6F6" },
  { key: "LR", label: "Logistic Reg.", color: "#FFC94D" },
  { key: "Climate", label: "Climate", color: "#B388FF" },
];
const MCOLOR = Object.fromEntries(MODELS.map((m) => [m.key, m.color]));

/* ---------------- helpers ---------------- */

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function useFormatter(mode) {
  return useCallback(
    (p, big = false) => {
      if (mode === "odds") {
        if (!p || p <= 0) return "—";
        const o = 1 / p;
        return o >= 1000 ? Math.round(o).toLocaleString() : o >= 100 ? o.toFixed(0) : o.toFixed(1);
      }
      const v = p * 100;
      return (big ? v.toFixed(1) : v.toFixed(2)) + "%";
    },
    [mode]
  );
}

/* Signature element: min→max spread track with a dot per model */
function SpreadTrack({ row, domainMax, height = 26 }) {
  const vals = MODELS.map((m) => row[m.key]);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const x = (v) => `${(v / domainMax) * 100}%`;
  return (
    <svg width="100%" height={height} style={{ display: "block", overflow: "visible" }}>
      <line x1="0" y1={height / 2} x2="100%" y2={height / 2} stroke={T.line} strokeWidth="2" />
      <line x1={x(lo)} y1={height / 2} x2={x(hi)} y2={height / 2}
        stroke={T.green} strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
      {MODELS.map((m) => (
        <circle key={m.key} cx={x(row[m.key])} cy={height / 2} r="4.5"
          fill={m.color} stroke={T.ink} strokeWidth="1.5">
          <title>{`${m.label}: ${(row[m.key] * 100).toFixed(2)}%`}</title>
        </circle>
      ))}
    </svg>
  );
}

/* ---------------- recharts custom bits ---------------- */

const DarkTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: "#081120", border: `1px solid ${T.line}`, borderRadius: 10,
      padding: "10px 12px", fontSize: 13, color: T.text, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{flag(label)} {label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: p.color || T.muted }}>{p.name}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const FlagTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={4} textAnchor="end" fontSize={13} fill={T.text}
    style={{ fontFamily: "'Archivo', system-ui, sans-serif", cursor: "pointer" }}>
    {flag(payload.value)} {payload.value}
  </text>
);

/* ---------------- sections ---------------- */

function Eyebrow({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: "0.22em", color: T.green, fontWeight: 700,
      textTransform: "uppercase", marginBottom: 6,
    }}>{children}</div>
  );
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{
        margin: 0, fontFamily: "'Archivo', sans-serif", fontWeight: 600,
        fontSize: 28, letterSpacing: "0.02em", color: T.text, textTransform: "uppercase",
      }}>{title}</h2>
      {sub && <p style={{ margin: "6px 0 0", color: T.muted, fontSize: 14, maxWidth: 640 }}>{sub}</p>}
    </div>
  );
}

/* ---------------- main ---------------- */

export default function Dashboard() {
  const data = useMemo(() => {
    const parsed = Papa.parse(CSV, { header: true, dynamicTyping: true, skipEmptyLines: true });
    return parsed.data
      .map((r) => {
        const vals = MODELS.map((m) => r[m.key]);
        const hi = Math.max(...vals), lo = Math.min(...vals);
        const hiModel = MODELS[vals.indexOf(hi)], loModel = MODELS[vals.indexOf(lo)];
        return { ...r, spread: hi - lo, hiModel, loModel };
      })
      .sort((a, b) => b.Final_Combined - a.Final_Combined);
  }, []);

  const ranks = useMemo(() => {
    const out = {};
    const cols = [...MODELS.map((m) => m.key), "Final_Combined"];
    cols.forEach((c) => {
      [...data].sort((a, b) => b[c] - a[c]).forEach((r, i) => {
        out[r.Team] = out[r.Team] || {};
        out[r.Team][c] = i + 1;
      });
    });
    return out;
  }, [data]);

  const [mode, setMode] = useState("pct"); // 'pct' | 'odds'
  const [selected, setSelected] = useState("Morocco");
  const [query, setQuery] = useState("");
  const [sortCol, setSortCol] = useState("Final_Combined");
  const [sortDir, setSortDir] = useState("desc");
  const breakdownRef = useRef(null);
  const fmt = useFormatter(mode);

  const pick = useCallback((team) => {
    setSelected(team);
    setTimeout(() => breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const top5 = data.slice(0, 5);
  const top15 = data.slice(0, 15);
  const disagree = useMemo(() => [...data].sort((a, b) => b.spread - a.spread).slice(0, 8), [data]);
  const disagreeMax = Math.max(...disagree.map((r) => Math.max(...MODELS.map((m) => r[m.key]))));

  const sel = data.find((r) => r.Team === selected) || data[0];
  const selBars = MODELS.map((m) => ({ model: m.label, key: m.key, value: sel[m.key], color: m.color }));

  const tableRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q ? data.filter((r) => r.Team.toLowerCase().includes(q)) : [...data];
    rows.sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (sortCol === "Team") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return rows;
  }, [data, query, sortCol, sortDir]);

  const headerSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir(col === "Team" ? "asc" : "desc"); }
  };

  const unit = mode === "pct" ? "win probability" : "decimal odds";

  return (
    <div style={{
      minHeight: "100vh", background: `radial-gradient(1200px 500px at 75% -10%, rgba(0,230,140,0.07), transparent 60%), ${T.ink}`,
      color: T.text, fontFamily: "'Archivo', system-ui, -apple-system, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(0,230,140,0.35); }
        .wc-card { transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; cursor: pointer; }
        .wc-card:hover { transform: translateY(-3px); border-color: rgba(0,230,140,0.55) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
        .wc-row { transition: background .15s ease; cursor: pointer; }
        .wc-row:hover { background: rgba(0,230,140,0.07); }
        .wc-th { cursor: pointer; user-select: none; }
        .wc-th:hover { color: ${T.mint}; }
        .wc-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .wc-scroll::-webkit-scrollbar-thumb { background: rgba(126,147,184,0.28); border-radius: 4px; }
        .wc-scroll::-webkit-scrollbar-track { background: transparent; }
        input:focus { outline: 2px solid rgba(0,230,140,0.5); outline-offset: 1px; }
        button:focus-visible { outline: 2px solid rgba(0,230,140,0.7); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .wc-card, .wc-row { transition: none; } .wc-card:hover { transform: none; } }
      `}</style>

      {/* ---------- header ---------- */}
      <header style={{
        borderBottom: `1px solid ${T.line}`, padding: "26px clamp(16px,4vw,48px)",
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16,
        background: "rgba(8,17,32,0.6)",
      }}>
        <div>
          <Eyebrow>4-Model Ensemble · 15,817 matches · Monte Carlo</Eyebrow>
          <h1 style={{
            margin: 0, fontFamily: "'Archivo', sans-serif", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 36px)", letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1,
          }}>
            Forecast <span style={{ color: T.green }}>Dashboard</span>
          </h1>
        </div>
        {/* odds toggle */}
        <div role="group" aria-label="Display unit" style={{
          display: "flex", border: `1px solid ${T.line}`, borderRadius: 999, padding: 3,
          background: T.panel2,
        }}>
          {[["pct", "Probability %"], ["odds", "Decimal odds"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              background: mode === k ? T.green : "transparent",
              color: mode === k ? "#04240F" : T.muted,
            }}>{lbl}</button>
          ))}
        </div>
      </header>

      <main style={{ padding: "36px clamp(16px,4vw,48px)", maxWidth: 1240, margin: "0 auto" }}>

        {/* ---------- 1. hero: top 5 ---------- */}
        <section>
          <SectionTitle eyebrow="The Favorites" title="Top 5 to lift the trophy"
            sub={`Ensemble ${unit} from all four models. The dots show where each model lands — a wide band means the models disagree.`} />
          <div style={{
            display: "grid", gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          }}>
            {top5.map((r, i) => (
              <div key={r.Team} className="wc-card" onClick={() => pick(r.Team)}
                style={{
                  background: i === 0
                    ? `linear-gradient(160deg, rgba(0,230,140,0.16), ${T.panel} 55%)`
                    : T.panel,
                  border: `1px solid ${i === 0 ? "rgba(0,230,140,0.4)" : T.line}`,
                  borderRadius: 16, padding: "18px 18px 14px", position: "relative",
                }}>
                <div style={{
                  position: "absolute", top: 14, right: 16, fontFamily: "'Archivo', sans-serif",
                  fontSize: 15, fontWeight: 600, color: i === 0 ? T.mint : T.faint, letterSpacing: "0.08em",
                }}>#{i + 1}</div>
                <div style={{ fontSize: 40, lineHeight: 1 }}>{flag(r.Team)}</div>
                <div style={{
                  fontFamily: "'Archivo', sans-serif", fontSize: 22, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.04em", margin: "10px 0 2px",
                }}>{r.Team}</div>
                <div style={{
                  fontSize: 30, fontWeight: 700, color: T.mint, fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.01em",
                }}>{fmt(r.Final_Combined, true)}</div>
                <div style={{ fontSize: 11, color: T.faint, marginBottom: 10 }}>
                  {mode === "pct" ? "ensemble win probability" : "ensemble decimal odds"}
                </div>
                <SpreadTrack row={r} domainMax={0.17} />
              </div>
            ))}
          </div>
          {/* model legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14, fontSize: 12, color: T.muted }}>
            {MODELS.map((m) => (
              <span key={m.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: m.color, display: "inline-block" }} />
                {m.label}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- 2. top 15 bar chart ---------- */}
        <section style={{ marginTop: 56 }}>
          <SectionTitle eyebrow="The Field" title="Top 15 by ensemble probability"
            sub="Click any bar to open that team's model breakdown." />
          <div style={{ background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 16, padding: "18px 10px 8px" }}>
            <ResponsiveContainer width="100%" height={520}>
              <BarChart data={top15} layout="vertical" margin={{ top: 4, right: 64, left: 18, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke={T.line} />
                <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fill: T.faint, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="Team" width={150} tick={<FlagTick />} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,230,140,0.06)" }}
                  content={<DarkTooltip fmt={fmt} />} />
                <Bar dataKey="Final_Combined" name="Ensemble" radius={[0, 6, 6, 0]} barSize={20}
                  onClick={(d) => d && pick(d.Team)} style={{ cursor: "pointer" }}>
                  {top15.map((r) => (
                    <Cell key={r.Team}
                      fill={r.Team === selected ? T.mint : T.green}
                      fillOpacity={r.Team === selected ? 1 : 0.85} />
                  ))}
                  <LabelList dataKey="Final_Combined" position="right"
                    formatter={(v) => fmt(v)}
                    style={{ fill: T.muted, fontSize: 12, fontVariantNumeric: "tabular-nums" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ---------- 3. model breakdown ---------- */}
        <section ref={breakdownRef} style={{ marginTop: 56, scrollMarginTop: 16 }}>
          <SectionTitle eyebrow="Under the Hood" title="Model breakdown"
            sub="How each of the four models rates a team — and where they argue." />
          <div style={{
            background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22,
            display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "start",
          }}>
            {/* left: selector + facts */}
            <div>
              <label htmlFor="team-select" style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 6 }}>
                Select a team
              </label>
              <select id="team-select" value={selected} onChange={(e) => setSelected(e.target.value)}
                style={{
                  width: "100%", background: T.panel2, color: T.text, border: `1px solid ${T.line}`,
                  borderRadius: 10, padding: "10px 12px", fontSize: 15, fontFamily: "inherit",
                }}>
                {data.map((r) => (
                  <option key={r.Team} value={r.Team}>{flag(r.Team)} {r.Team}</option>
                ))}
              </select>

              <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 46, lineHeight: 1 }}>{flag(sel.Team)}</span>
                <div>
                  <div style={{
                    fontFamily: "'Archivo', sans-serif", fontSize: 26, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.03em",
                  }}>{sel.Team}</div>
                  <div style={{ fontSize: 13, color: T.muted }}>
                    Ensemble rank <strong style={{ color: T.mint }}>{ordinal(ranks[sel.Team].Final_Combined)}</strong> of {data.length}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 16, background: T.panel2, borderRadius: 12, padding: 14,
                border: `1px solid ${T.line}`, fontSize: 13.5, lineHeight: 1.55, color: T.muted,
              }}>
                <div style={{ color: T.text, fontWeight: 600, marginBottom: 4 }}>
                  Ensemble: <span style={{ color: T.mint, fontVariantNumeric: "tabular-nums" }}>{fmt(sel.Final_Combined)}</span>
                </div>
                Most bullish: <span style={{ color: sel.hiModel.color, fontWeight: 600 }}>{sel.hiModel.label}</span> ({fmt(sel[sel.hiModel.key])}).{" "}
                Most bearish: <span style={{ color: sel.loModel.color, fontWeight: 600 }}>{sel.loModel.label}</span> ({fmt(sel[sel.loModel.key])}).
                <div style={{ marginTop: 8 }}>
                  Model spread: <strong style={{ color: T.text }}>{(sel.spread * 100).toFixed(2)} pts</strong>
                  {" · "}#{[...data].sort((a, b) => b.spread - a.spread).findIndex((r) => r.Team === sel.Team) + 1} most disputed team
                </div>
              </div>

              {/* per-model ranks */}
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {MODELS.map((m) => (
                  <div key={m.key} style={{
                    border: `1px solid ${T.line}`, borderRadius: 10, padding: "8px 10px",
                    fontSize: 12, color: T.muted, background: T.panel2,
                  }}>
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.key}</span> rank{" "}
                    <span style={{ color: T.text, fontWeight: 600 }}>{ordinal(ranks[sel.Team][m.key])}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right: grouped bars */}
            <div style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={selBars} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke={T.line} />
                  <XAxis dataKey="model" tick={{ fill: T.muted, fontSize: 12.5 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                    tick={{ fill: T.faint, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,230,140,0.06)" }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div style={{
                        background: "#081120", border: `1px solid ${T.line}`, borderRadius: 10,
                        padding: "8px 12px", fontSize: 13, color: T.text,
                      }}>
                        <span style={{ color: p.color, fontWeight: 600 }}>{p.model}</span>{" "}
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(p.value)}</span>
                      </div>
                    );
                  }} />
                  <ReferenceLine y={sel.Final_Combined} stroke={T.mint} strokeDasharray="5 4"
                    label={{ value: `Ensemble ${fmt(sel.Final_Combined)}`, position: "insideTopRight", fill: T.mint, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={56}>
                    {selBars.map((b) => (
                      <Cell key={b.key} fill={b.color}
                        fillOpacity={b.key === sel.hiModel.key || b.key === sel.loModel.key ? 1 : 0.6}
                        stroke={b.key === sel.hiModel.key ? b.color : "none"} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(v) => fmt(v)}
                      style={{ fill: T.text, fontSize: 12, fontVariantNumeric: "tabular-nums" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{ fontSize: 12, color: T.faint, margin: "4px 8px 0" }}>
                Full-opacity bars mark the most bullish and most bearish models; the dashed line is the ensemble blend.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- 4. disagreement leaderboard ---------- */}
        <section style={{ marginTop: 56 }}>
          <SectionTitle eyebrow="Where the Models Argue" title="Biggest disagreements"
            sub="Spread between each team's highest and lowest model score. A long band means the ensemble is averaging a real argument, not a consensus." />
          <div style={{
            background: T.panel2, border: `1px solid ${T.line}`, borderRadius: 16,
            padding: "10px 20px",
          }}>
            {disagree.map((r, i) => (
              <div key={r.Team} className="wc-row" onClick={() => pick(r.Team)}
                style={{
                  display: "grid", gridTemplateColumns: "minmax(140px, 190px) 1fr 90px",
                  gap: 16, alignItems: "center", padding: "13px 6px",
                  borderBottom: i < disagree.length - 1 ? `1px solid ${T.line}` : "none",
                  borderRadius: 8,
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ color: T.faint, fontSize: 12, width: 16, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <span style={{ fontSize: 20 }}>{flag(r.Team)}</span>
                  <span style={{ fontWeight: 600, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.Team}</span>
                </div>
                <SpreadTrack row={r} domainMax={disagreeMax * 1.05} />
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  <div style={{ color: T.mint, fontWeight: 700, fontSize: 15 }}>{(r.spread * 100).toFixed(2)} pts</div>
                  <div style={{ fontSize: 11, color: T.faint }}>{r.hiModel.key} vs {r.loModel.key}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- 5. full table ---------- */}
        <section style={{ marginTop: 56 }}>
          <SectionTitle eyebrow="Every Contender" title={`All ${data.length} teams`}
            sub="Search, sort any column, and click a row to open its breakdown." />
          <input
            type="search" placeholder="Search teams…" value={query}
            onChange={(e) => setQuery(e.target.value)} aria-label="Search teams"
            style={{
              width: "100%", maxWidth: 340, background: T.panel2, border: `1px solid ${T.line}`,
              borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 14,
              marginBottom: 14, fontFamily: "inherit",
            }}
          />
          <div className="wc-scroll" style={{
            overflow: "auto", maxHeight: 560, border: `1px solid ${T.line}`,
            borderRadius: 16, background: T.panel2,
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 720 }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, zIndex: 2, background: "#0B1930" }}>
                  {[
                    ["Team", "Team"], ["ELO", "ELO"], ["RF", "Random Forest"], ["LR", "Logistic Reg."],
                    ["Climate", "Climate"], ["Final_Combined", "Ensemble"],
                  ].map(([col, lbl]) => (
                    <th key={col} className="wc-th" onClick={() => headerSort(col)}
                      style={{
                        textAlign: col === "Team" ? "left" : "right", padding: "12px 16px",
                        fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                        color: sortCol === col ? T.mint : T.muted, fontWeight: 700,
                        borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap",
                        ...(col === "Final_Combined" ? { color: sortCol === col ? T.mint : T.green } : {}),
                      }}>
                      {lbl} {sortCol === col ? (sortDir === "desc" ? "▾" : "▴") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.Team} className="wc-row" onClick={() => pick(r.Team)}
                    style={{
                      borderBottom: `1px solid rgba(31,46,77,0.55)`,
                      background: r.Team === selected ? "rgba(0,230,140,0.10)" : "transparent",
                    }}>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ color: T.faint, fontSize: 12, marginRight: 10, fontVariantNumeric: "tabular-nums" }}>
                        {ranks[r.Team].Final_Combined}
                      </span>
                      <span style={{ marginRight: 8 }}>{flag(r.Team)}</span>
                      <span style={{ fontWeight: 600 }}>{r.Team}</span>
                    </td>
                    {MODELS.map((m) => (
                      <td key={m.key} style={{
                        padding: "10px 16px", textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        color: m.key === r.hiModel.key ? m.color : T.muted,
                        fontWeight: m.key === r.hiModel.key ? 600 : 400,
                      }}>{fmt(r[m.key])}</td>
                    ))}
                    <td style={{
                      padding: "10px 16px", textAlign: "right", fontWeight: 700,
                      color: T.mint, fontVariantNumeric: "tabular-nums",
                    }}>{fmt(r.Final_Combined)}</td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: T.muted }}>
                    No teams match "{query}". Clear the search to see all {data.length}.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: T.faint, marginTop: 10 }}>
            The colored value in each row marks that team's most bullish model.
            {mode === "odds" && " Decimal odds = 1 ÷ probability; “—” means the model gave a 0% chance."}
          </p>
        </section>

        <footer style={{ marginTop: 60, borderTop: `1px solid ${T.line}`, paddingTop: 18, fontSize: 12, color: T.faint }}>
          ELO trained on 15,817 international matches · Random Forest · Logistic Regression · Climate similarity · Monte Carlo tournament simulation
        </footer>
      </main>
    </div>
  );
}
