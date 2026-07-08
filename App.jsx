import React, { useState, useRef, useEffect, useMemo } from "react";

// ============================================================
// FIFA 2026 PREDICTION ENGINE — Rohit Maha Balaji
// Headline forecast: 4-model ensemble (ELO + RF + LR + Climate)
// trained on 15,817 international matches, 10,000-run Monte Carlo
// Live simulator below runs the ELO layer in-browser on the
// real tournament group draw.
// ============================================================

// forecast = Final_Combined win probability from the Python ensemble
// elo values marked (est.) are display estimates for the browser demo;
// starred ones are actual ratings from the ELO engine.
const TEAM_DATA = {
  "Spain":                  { elo: 1949, flag: "🇪🇸", forecast: 0.11095 }, // *
  "Argentina":              { elo: 1956, flag: "🇦🇷", forecast: 0.10960 }, // *
  "Morocco":                { elo: 1879, flag: "🇲🇦", forecast: 0.07655 }, // *
  "France":                 { elo: 1891, flag: "🇫🇷", forecast: 0.06310 }, // *
  "Brazil":                 { elo: 1874, flag: "🇧🇷", forecast: 0.05350 },
  "Portugal":               { elo: 1868, flag: "🇵🇹", forecast: 0.04695 },
  "Japan":                  { elo: 1852, flag: "🇯🇵", forecast: 0.04670 },
  "Mexico":                 { elo: 1838, flag: "🇲🇽", forecast: 0.04495 },
  "England":                { elo: 1842, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", forecast: 0.04055 },
  "Netherlands":            { elo: 1824, flag: "🇳🇱", forecast: 0.03585 }, // *
  "Germany":                { elo: 1846, flag: "🇩🇪", forecast: 0.03535 },
  "Colombia":               { elo: 1848, flag: "🇨🇴", forecast: 0.03215 }, // *
  "South Korea":            { elo: 1812, flag: "🇰🇷", forecast: 0.02590 },
  "Ecuador":                { elo: 1794, flag: "🇪🇨", forecast: 0.02470 },
  "Belgium":                { elo: 1790, flag: "🇧🇪", forecast: 0.02095 },
  "Iran":                   { elo: 1792, flag: "🇮🇷", forecast: 0.01990 },
  "Canada":                 { elo: 1778, flag: "🇨🇦", forecast: 0.01950 },
  "Senegal":                { elo: 1768, flag: "🇸🇳", forecast: 0.01940 },
  "Algeria":                { elo: 1796, flag: "🇩🇿", forecast: 0.01935 },
  "Croatia":                { elo: 1798, flag: "🇭🇷", forecast: 0.01930 },
  "Turkey":                 { elo: 1786, flag: "🇹🇷", forecast: 0.01795 },
  "Switzerland":            { elo: 1782, flag: "🇨🇭", forecast: 0.01575 },
  "Uruguay":                { elo: 1756, flag: "🇺🇾", forecast: 0.01535 },
  "Australia":              { elo: 1756, flag: "🇦🇺", forecast: 0.01175 },
  "Ivory Coast":            { elo: 1748, flag: "🇨🇮", forecast: 0.01135 },
  "Norway":                 { elo: 1750, flag: "🇳🇴", forecast: 0.01020 },
  "Austria":                { elo: 1744, flag: "🇦🇹", forecast: 0.01005 },
  "United States":          { elo: 1752, flag: "🇺🇸", forecast: 0.00990 },
  "Egypt":                  { elo: 1722, flag: "🇪🇬", forecast: 0.00790 },
  "Uzbekistan":             { elo: 1704, flag: "🇺🇿", forecast: 0.00555 },
  "Paraguay":               { elo: 1712, flag: "🇵🇾", forecast: 0.00405 },
  "Panama":                 { elo: 1682, flag: "🇵🇦", forecast: 0.00345 },
  "Iraq":                   { elo: 1668, flag: "🇮🇶", forecast: 0.00200 },
  "DR Congo":               { elo: 1632, flag: "🇨🇩", forecast: 0.00165 },
  "Scotland":               { elo: 1620, flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", forecast: 0.00145 },
  "South Africa":           { elo: 1608, flag: "🇿🇦", forecast: 0.00125 },
  "Sweden":                 { elo: 1620, flag: "🇸🇪", forecast: 0.00115 },
  "Tunisia":                { elo: 1618, flag: "🇹🇳", forecast: 0.00110 },
  "Jordan":                 { elo: 1610, flag: "🇯🇴", forecast: 0.00080 },
  "Saudi Arabia":           { elo: 1592, flag: "🇸🇦", forecast: 0.00065 },
  "Cape Verde":             { elo: 1612, flag: "🇨🇻", forecast: 0.00055 },
  "Qatar":                  { elo: 1592, flag: "🇶🇦", forecast: 0.00035 },
  "Bosnia and Herzegovina": { elo: 1560, flag: "🇧🇦", forecast: 0.00020 },
  "Haiti":                  { elo: 1540, flag: "🇭🇹", forecast: 0.00020 },
  "Ghana":                  { elo: 1540, flag: "🇬🇭", forecast: 0.00015 },
  "Czechia":                { elo: 1538, flag: "🇨🇿", forecast: 0.00005 },
  "New Zealand":            { elo: 1520, flag: "🇳🇿", forecast: 0 },
  "Curacao":                { elo: 1500, flag: "🇨🇼", forecast: 0 },
};

// the actual tournament group draw used in the Python simulation
const GROUP_DRAW = {
  A: ["Mexico", "South Korea", "Czechia", "South Africa"],
  B: ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"],
  C: ["Brazil", "Morocco", "Scotland", "Haiti"],
  D: ["United States", "Australia", "Turkey", "Paraguay"],
  E: ["Germany", "Ivory Coast", "Ecuador", "Curacao"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Uruguay", "Saudi Arabia", "Cape Verde"],
  I: ["France", "Senegal", "Norway", "Iraq"],
  J: ["Argentina", "Austria", "Algeria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

const TEAMS = Object.entries(TEAM_DATA).map(([name, d], i) => ({ id: i, name, ...d }));
const BY_NAME = Object.fromEntries(TEAMS.map((t) => [t.name, t]));
const GROUPS = Object.values(GROUP_DRAW).map((names) => names.map((n) => BY_NAME[n].id));

const OFFICIAL_TOP5 = [...TEAMS].sort((a, b) => b.forecast - a.forecast).slice(0, 5);

// ---- core ELO win expectancy ----
const expScore = (ra, rb) => 1 / (1 + Math.pow(10, (rb - ra) / 400));

function playGroupMatch(a, b) {
  const e = expScore(a.elo, b.elo);
  const pDraw = Math.max(0.08, 0.27 - 0.36 * Math.abs(e - 0.5));
  if (Math.random() < pDraw) return 0;
  return Math.random() < e ? 1 : -1;
}
const playKO = (a, b) => (Math.random() < expScore(a.elo, b.elo) ? a : b);

function simulateTournament(stats) {
  const winners = [], runners = [], thirds = [];
  for (const group of GROUPS) {
    const pts = new Map(group.map((id) => [id, 0]));
    for (let i = 0; i < 4; i++)
      for (let j = i + 1; j < 4; j++) {
        const A = TEAMS[group[i]], B = TEAMS[group[j]];
        const res = playGroupMatch(A, B);
        if (res === 1) pts.set(A.id, pts.get(A.id) + 3);
        else if (res === -1) pts.set(B.id, pts.get(B.id) + 3);
        else { pts.set(A.id, pts.get(A.id) + 1); pts.set(B.id, pts.get(B.id) + 1); }
      }
    const ranked = [...group].sort(
      (x, y) => pts.get(y) - pts.get(x) || TEAMS[y].elo - TEAMS[x].elo + (Math.random() - 0.5) * 40
    );
    winners.push(ranked[0]); runners.push(ranked[1]);
    thirds.push({ id: ranked[2], pts: pts.get(ranked[2]) });
  }
  thirds.sort((a, b) => b.pts - a.pts || Math.random() - 0.5);
  const best3rds = thirds.slice(0, 8).map((t) => t.id);

  // group winners paired against runners-up / best thirds
  const seeded = shuffle([...winners]);
  const unseeded = shuffle([...runners, ...best3rds]);
  let alive = [];
  for (let i = 0; i < 12; i++) alive.push(TEAMS[seeded[i]], TEAMS[unseeded[i]]);
  for (let i = 12; i < 16; i++) alive.push(TEAMS[unseeded[i]], TEAMS[unseeded[i + 4]]);

  while (alive.length > 1) {
    const next = [];
    for (let i = 0; i < alive.length; i += 2) next.push(playKO(alive[i], alive[i + 1]));
    alive = next;
    if (alive.length === 16) alive.forEach((t) => stats[t.id].r16++);
    if (alive.length === 8) alive.forEach((t) => stats[t.id].qf++);
    if (alive.length === 4) alive.forEach((t) => stats[t.id].sf++);
    if (alive.length === 2) alive.forEach((t) => stats[t.id].final++);
  }
  stats[alive[0].id].champ++;
  return alive[0];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const freshStats = () => TEAMS.map(() => ({ r16: 0, qf: 0, sf: 0, final: 0, champ: 0 }));

// ============================================================
// UI
// ============================================================
const C = {
  bg: "#0A1020", panel: "#101A30", panel2: "#16233F", line: "#1F2E4D",
  green: "#00E68C", cyan: "#4CC3FF", gold: "#FFC53D",
  text: "#E8EFFA", muted: "#7E93B8", dim: "#4E617F",
};

export default function PredictionEngine() {
  const [total, setTotal] = useState(10000);
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState(freshStats);
  const [ticker, setTicker] = useState(null);
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(1);
  const runRef = useRef({ cancel: false });

  const run = () => {
    if (running) { runRef.current.cancel = true; setRunning(false); return; }
    const s = freshStats();
    runRef.current = { cancel: false };
    setStats(s); setDone(0); setRunning(true);
    let n = 0;
    const CHUNK = 200;
    const step = () => {
      if (runRef.current.cancel) return;
      let last = null;
      for (let i = 0; i < CHUNK && n < total; i++, n++) last = simulateTournament(s);
      setDone(n);
      setStats(s.map((x) => ({ ...x })));
      if (last) setTicker({ n, team: last });
      if (n < total) setTimeout(step, 0);
      else setRunning(false);
    };
    setTimeout(step, 0);
  };

  useEffect(() => () => { runRef.current.cancel = true; }, []);

  const ranked = useMemo(() => {
    return TEAMS.map((t, i) => ({ ...t, ...stats[i] }))
      .sort((a, b) => b.champ - a.champ || b.elo - a.elo);
  }, [stats]);

  const maxChamp = Math.max(1, ranked[0]?.champ || 1);
  const pct = (v) => (done ? (100 * v) / done : 0);

  const A = TEAMS[teamA], B = TEAMS[teamB];
  const eA = expScore(A.elo, B.elo);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'Archivo', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .display { font-family:'Archivo',sans-serif; font-variation-settings:'wdth' 115; }
        .bar-fill { transition: width 220ms ease-out; }
        select, button { font-family: inherit; }
        select:focus-visible, button:focus-visible { outline: 2px solid ${C.green}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .bar-fill { transition: none; } }
        .runbtn:hover { filter: brightness(1.12); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        .live-dot { animation: pulse 1.2s infinite; }
        @media (prefers-reduced-motion: reduce) { .live-dot { animation: none; } }
      `}</style>

      {/* ---------- header ---------- */}
      <header style={{ maxWidth: 1060, margin: "0 auto", padding: "44px 24px 8px" }}>
        <div className="mono" style={{ color: C.green, fontSize: 12, letterSpacing: 3 }}>
          // FIFA WORLD CUP 2026 · PRE-TOURNAMENT MODEL
        </div>
        <h1 className="display" style={{
          fontSize: "clamp(38px, 7vw, 74px)", fontWeight: 900, lineHeight: 0.95,
          margin: "10px 0 12px", letterSpacing: "-0.01em",
        }}>
          PREDICTION ENGINE<span style={{ color: C.green }}>_</span>
        </h1>
        <p style={{ color: C.muted, maxWidth: 660, fontSize: 15.5, lineHeight: 1.55, margin: 0 }}>
          A 4-model ensemble — ELO ratings, Random Forest, Logistic Regression, and a
          climate-similarity feature — trained on 15,817 international matches and run through
          10,000 Monte Carlo tournament simulations. Built in Python by Rohit Balaji.
        </p>
      </header>

      <main style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 24px 80px", display: "grid", gap: 22 }}>

        {/* ---------- official ensemble forecast ---------- */}
        <section style={{
          background: C.panel, border: `1px solid ${C.gold}44`, borderRadius: 14, padding: 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <h2 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              OFFICIAL MODEL FORECAST
            </h2>
            <span className="mono" style={{ fontSize: 11.5, color: C.dim }}>
              final combined ensemble · pre-tournament
            </span>
          </div>
          <div style={{
            marginTop: 16, display: "grid", gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          }}>
            {OFFICIAL_TOP5.map((t, i) => (
              <div key={t.name} style={{
                background: C.panel2, borderRadius: 10, padding: "14px 16px",
                border: i === 0 ? `1px solid ${C.gold}` : `1px solid transparent`,
              }}>
                <div style={{ fontSize: 26 }}>{t.flag}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{t.name}</div>
                <div className="mono" style={{
                  fontSize: 20, marginTop: 4, fontWeight: 600,
                  color: i === 0 ? C.gold : C.green,
                }}>
                  {(t.forecast * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          <p className="mono" style={{ color: C.dim, fontSize: 11.5, margin: "14px 0 0" }}>
            The Morocco call at 7.7% — third overall — is the ensemble's boldest divergence
            from consensus, driven by the Random Forest layer.
          </p>
        </section>

        {/* ---------- simulation console ---------- */}
        <section style={{
          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <h2 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              LIVE SIMULATOR
            </h2>
            <span className="mono" style={{ fontSize: 11.5, color: C.dim }}>
              in-browser ELO layer · real 12-group tournament draw
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginTop: 16 }}>
            <button className="runbtn" onClick={run} style={{
              background: running ? "transparent" : C.green,
              color: running ? C.green : "#04120B",
              border: `2px solid ${C.green}`, borderRadius: 8, cursor: "pointer",
              padding: "12px 26px", fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
            }}>
              {running ? "STOP" : done > 0 ? "RUN AGAIN" : "RUN SIMULATION"}
            </button>

            <label className="mono" style={{ color: C.muted, fontSize: 12.5, display: "flex", gap: 8, alignItems: "center" }}>
              runs
              <select
                value={total} disabled={running}
                onChange={(e) => setTotal(+e.target.value)}
                style={{
                  background: C.panel2, color: C.text, border: `1px solid ${C.line}`,
                  borderRadius: 6, padding: "7px 10px", fontSize: 13,
                }}>
                {[1000, 5000, 10000, 25000].map((v) => (
                  <option key={v} value={v}>{v.toLocaleString()}</option>
                ))}
              </select>
            </label>

            <div className="mono" style={{ marginLeft: "auto", fontSize: 12.5, color: C.muted, minWidth: 220, textAlign: "right" }}>
              {running && <span className="live-dot" style={{ color: C.green, marginRight: 8 }}>●&nbsp;LIVE</span>}
              {done > 0
                ? <>sim <span style={{ color: C.text }}>{done.toLocaleString()}</span> / {total.toLocaleString()}</>
                : "idle — press run"}
            </div>
          </div>

          <div style={{ height: 5, background: C.panel2, borderRadius: 3, marginTop: 16, overflow: "hidden" }}>
            <div className="bar-fill" style={{
              height: "100%", width: `${(100 * done) / total}%`,
              background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`,
            }} />
          </div>

          <div className="mono" style={{ marginTop: 12, fontSize: 12.5, color: C.dim, minHeight: 18 }}>
            {ticker
              ? <>tournament #{ticker.n.toLocaleString()}: <span style={{ color: C.gold }}>{ticker.team.flag} {ticker.team.name}</span> lift the trophy</>
              : <>each run: 72 group matches → best-third ranking → 5 knockout rounds</>}
          </div>
        </section>

        {/* ---------- results race ---------- */}
        <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <h2 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              SIMULATED CHAMPIONSHIP PROBABILITY
            </h2>
            <span className="mono" style={{ fontSize: 11.5, color: C.dim }}>
              share of simulated tournaments won · top 12
            </span>
          </div>

          <div style={{ marginTop: 18, display: "grid", gap: 9 }}>
            {ranked.slice(0, 12).map((t, i) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "170px 1fr 62px", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span className="mono" style={{ color: C.dim, fontSize: 11, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                  {t.flag} {t.name}
                </div>
                <div style={{ height: 20, background: C.panel2, borderRadius: 4, overflow: "hidden" }}>
                  <div className="bar-fill" style={{
                    height: "100%", borderRadius: 4,
                    width: done ? `${(100 * t.champ) / maxChamp}%` : "0%",
                    background: i === 0 ? C.gold : i < 3 ? C.green : C.cyan,
                    opacity: i < 3 ? 1 : 0.75,
                  }} />
                </div>
                <div className="mono" style={{ fontSize: 13, color: i === 0 ? C.gold : C.text, textAlign: "right" }}>
                  {done ? pct(t.champ).toFixed(1) + "%" : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- two-up: stage table + head-to-head ---------- */}
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22 }}>
            <h2 className="display" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>ROAD TO THE FINAL</h2>
            <p className="mono" style={{ fontSize: 11.5, color: C.dim, margin: "6px 0 14px" }}>
              % of simulations reaching each stage
            </p>
            <div style={{ overflowX: "auto" }}>
              <table className="mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ color: C.dim, textAlign: "right" }}>
                    <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: 500 }}>team</th>
                    {["R16", "QF", "SF", "FINAL", "🏆"].map((h) => (
                      <th key={h} style={{ padding: "6px 4px", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.slice(0, 8).map((t) => (
                    <tr key={t.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td style={{ padding: "7px 4px", color: C.text }}>{t.flag} {t.name}</td>
                      {["r16", "qf", "sf", "final", "champ"].map((k) => (
                        <td key={k} style={{
                          padding: "7px 4px", textAlign: "right",
                          color: k === "champ" ? C.gold : C.muted,
                        }}>
                          {done ? pct(t[k]).toFixed(0) + "%" : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22 }}>
            <h2 className="display" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>HEAD-TO-HEAD</h2>
            <p className="mono" style={{ fontSize: 11.5, color: C.dim, margin: "6px 0 16px" }}>
              knockout win expectancy from the ELO gap
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
              {[{ v: teamA, set: setTeamA }, null, { v: teamB, set: setTeamB }].map((slot, i) =>
                slot === null ? (
                  <div key="vs" className="mono" style={{ color: C.dim, fontSize: 12 }}>vs</div>
                ) : (
                  <select key={i} value={slot.v} onChange={(e) => slot.set(+e.target.value)} style={{
                    background: C.panel2, color: C.text, border: `1px solid ${C.line}`,
                    borderRadius: 6, padding: "9px 8px", fontSize: 13, width: "100%",
                  }}>
                    {TEAMS.map((t) => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
                  </select>
                )
              )}
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                <span style={{ color: C.green }}>{A.name} {Math.round(eA * 100)}%</span>
                <span style={{ color: C.cyan }}>{Math.round((1 - eA) * 100)}% {B.name}</span>
              </div>
              <div style={{ display: "flex", height: 22, borderRadius: 5, overflow: "hidden", marginTop: 8 }}>
                <div className="bar-fill" style={{ width: `${eA * 100}%`, background: C.green }} />
                <div className="bar-fill" style={{ width: `${(1 - eA) * 100}%`, background: C.cyan }} />
              </div>
              <div className="mono" style={{ marginTop: 12, fontSize: 12, color: C.dim, lineHeight: 1.7 }}>
                E = 1 / (1 + 10^((R<sub>b</sub>−R<sub>a</sub>)/400))<br />
                {A.name} {A.elo} · {B.name} {B.elo} · gap {A.elo - B.elo > 0 ? "+" : ""}{A.elo - B.elo}
              </div>
            </div>
          </section>
        </div>

        {/* ---------- methodology ---------- */}
        <section style={{
          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22,
        }}>
          <h2 className="display" style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800 }}>HOW THE ENGINE WORKS</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {[
              ["01 · RATE", "15,817 matches since 2010 build a dynamic ELO rating for every national team, updated after every result."],
              ["02 · LEARN", "Random Forest and Logistic Regression train on ELO features to predict win/draw/loss — LR hit 59.1% accuracy, 0.887 log loss."],
              ["03 · SIMULATE", "Monte Carlo plays the full 48-team tournament 10,000 times — 72 group matches, best-third ranking, five knockout rounds per run."],
              ["04 · COMBINE", "Four models' outputs blend into the final forecast, so no single model's blind spot decides the answer."],
            ].map(([h, d]) => (
              <div key={h} style={{ background: C.panel2, borderRadius: 10, padding: 16 }}>
                <div className="mono" style={{ color: C.green, fontSize: 11.5, letterSpacing: 1.5, marginBottom: 8 }}>{h}</div>
                <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
          <p className="mono" style={{ color: C.dim, fontSize: 11.5, marginTop: 16, marginBottom: 0 }}>
            Model, analysis & forecast: Rohit Balaji (Python / scikit-learn / Jupyter).
            Interactive frontend built with AI assistance. The live simulator above runs the
            ELO layer client-side; official forecast numbers come from the full 4-model ensemble.
          </p>
        </section>
      </main>
    </div>
  );
}
