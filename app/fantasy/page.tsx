"use client";

import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  team: string;
  logo?: string;
  price: number;
  avg: number;
  bps: number;
  ser: number;
};

// Första UI-versionen av BP Fantasy.
// Byt senare ut DEMO_PLAYERS mot data från BP Stats/Supabase.
const DEMO_PLAYERS: Player[] = [
  { id: "1", name: "Kevin Melin", team: "Demo", price: 12.5, avg: 227.33, bps: 0.58, ser: 80 },
  { id: "2", name: "Teodor Samuelsson", team: "Demo", price: 12.5, avg: 225.12, bps: 0.68, ser: 74 },
  { id: "3", name: "James Blomgren", team: "Demo", price: 12.0, avg: 226.9, bps: 0.61, ser: 72 },
  { id: "4", name: "Kevin Lindbladh", team: "Demo", price: 12.0, avg: 238.03, bps: 0.64, ser: 59 },
  { id: "5", name: "Robin Ilhammar", team: "Demo 2", price: 11.5, avg: 229.29, bps: 0.57, ser: 68 },
  { id: "6", name: "Jesper Svensson", team: "Demo 2", price: 10.5, avg: 233.48, bps: 0.7, ser: 40 },
  { id: "7", name: "Mattias Wetterberg", team: "Demo 3", price: 9.5, avg: 228.07, bps: 0.7, ser: 30 },
  { id: "8", name: "Emil Holmberg", team: "Demo 3", price: 10.0, avg: 222.39, bps: 0.54, ser: 56 },
  { id: "9", name: "Budgetspelare A", team: "Demo 4", price: 3.0, avg: 205.1, bps: 0.42, ser: 48 },
  { id: "10", name: "Budgetspelare B", team: "Demo 4", price: 2.5, avg: 201.8, bps: 0.39, ser: 35 },
  { id: "11", name: "Budgetspelare C", team: "Demo 5", price: 2.0, avg: 198.4, bps: 0.35, ser: 28 },
  { id: "12", name: "Budgetspelare D", team: "Demo 5", price: 1.5, avg: 194.2, bps: 0.31, ser: 20 },
];

const START_BUDGET = 50;
const MAX_PLAYERS = 8;
const MAX_FROM_TEAM = 2;

export default function FantasyPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("Alla");

  const selected = useMemo(
    () => selectedIds.map((id) => DEMO_PLAYERS.find((p) => p.id === id)).filter(Boolean) as Player[],
    [selectedIds]
  );

  const spent = selected.reduce((sum, p) => sum + p.price, 0);
  const remaining = START_BUDGET - spent;

  const teams = ["Alla", ...Array.from(new Set(DEMO_PLAYERS.map((p) => p.team)))];

  const visiblePlayers = DEMO_PLAYERS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (teamFilter === "Alla" || p.team === teamFilter)
  ).sort((a, b) => b.price - a.price);

  function teamCount(team: string) {
    return selected.filter((p) => p.team === team).length;
  }

  function addPlayer(player: Player) {
    if (selectedIds.includes(player.id)) return;
    if (selected.length >= MAX_PLAYERS) return;
    if (player.price > remaining) return;
    if (teamCount(player.team) >= MAX_FROM_TEAM) return;
    setSelectedIds((prev) => [...prev, player.id]);
  }

  function removePlayer(id: string) {
    setSelectedIds((prev) => prev.filter((playerId) => playerId !== id));
  }

  return (
    <main style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.badge}>BP FANTASY</div>
            <h1 style={styles.h1}>Bygg ditt lag.</h1>
            <p style={styles.lead}>
              Välj 8 spelare från Elitserien. Du startar med 50,0 mkr och får välja max 2 spelare från samma klubb.
            </p>
          </div>
          <div style={styles.deadline}>
            <span style={styles.muted}>Deadline</span>
            <strong>Fredag 18:00</strong>
          </div>
        </header>

        <section style={styles.summaryGrid}>
          <Stat label="Spelare" value={`${selected.length}/8`} />
          <Stat label="Budget kvar" value={`${remaining.toFixed(1)} mkr`} yellow />
          <Stat label="Lagvärde" value={`${spent.toFixed(1)} mkr`} />
          <Stat label="Max / klubb" value="2" />
        </section>

        <div style={styles.columns}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.eyebrow}>MITT LAG</div>
                <h2 style={styles.h2}>{selected.length === 8 ? "Laget är fullt" : `Välj ${8 - selected.length} spelare till`}</h2>
              </div>
              <button onClick={() => setSelectedIds([])} style={styles.ghostButton}>Rensa</button>
            </div>

            <div style={styles.squad}>
              {Array.from({ length: MAX_PLAYERS }).map((_, index) => {
                const player = selected[index];
                return player ? (
                  <button key={player.id} onClick={() => removePlayer(player.id)} style={styles.slotFilled}>
                    <div style={styles.slotNumber}>{index + 1}</div>
                    <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                      <div style={styles.playerName}>{player.name}</div>
                      <div style={styles.playerMeta}>{player.team}</div>
                    </div>
                    <div style={styles.price}>{player.price.toFixed(1)}</div>
                    <div style={styles.remove}>×</div>
                  </button>
                ) : (
                  <div key={index} style={styles.slotEmpty}>
                    <div style={styles.slotNumber}>{index + 1}</div>
                    <span>Ledig plats</span>
                  </div>
                );
              })}
            </div>

            <div style={styles.infoBox}>
              <strong style={{ color: "#facc15" }}>Spelarvärden förändras under säsongen.</strong>
              <span> 1 Fantasy-poäng = ±10 000 kr. Spelar man inte lagets match: −50 000 kr.</span>
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.eyebrow}>TRANSFERMARKNAD</div>
                <h2 style={styles.h2}>Spelare</h2>
              </div>
            </div>

            <div style={styles.filters}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök spelare..."
                style={styles.input}
              />
              <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={styles.input}>
                {teams.map((team) => <option key={team}>{team}</option>)}
              </select>
            </div>

            <div style={styles.market}>
              {visiblePlayers.map((player) => {
                const isSelected = selectedIds.includes(player.id);
                const teamFull = teamCount(player.team) >= MAX_FROM_TEAM;
                const tooExpensive = player.price > remaining;
                const disabled = isSelected || selected.length >= MAX_PLAYERS || teamFull || tooExpensive;

                return (
                  <div key={player.id} style={styles.marketRow}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={styles.playerName}>{player.name}</div>
                      <div style={styles.playerMeta}>
                        {player.team} · AVG {player.avg.toFixed(2)} · BP/s {player.bps.toFixed(2)} · {player.ser} SER
                      </div>
                    </div>
                    <div style={styles.marketPrice}>{player.price.toFixed(1)} mkr</div>
                    <button
                      disabled={disabled}
                      onClick={() => addPlayer(player)}
                      style={{ ...styles.addButton, ...(disabled ? styles.addButtonDisabled : {}) }}
                    >
                      {isSelected ? "Vald" : "+"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div style={styles.bottomBar}>
          <div>
            <div style={styles.muted}>Ditt lag</div>
            <strong>{selected.length}/8 spelare · {remaining.toFixed(1)} mkr kvar</strong>
          </div>
          <button disabled={selected.length !== 8} style={{ ...styles.saveButton, ...(selected.length !== 8 ? styles.saveDisabled : {}) }}>
            Spara lag
          </button>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, yellow = false }: { label: string; value: string; yellow?: boolean }) {
  return (
    <div style={styles.stat}>
      <div style={styles.muted}>{label}</div>
      <div style={{ ...styles.statValue, color: yellow ? "#facc15" : "white" }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#000", color: "white", fontFamily: "Arial, sans-serif", padding: "16px", position: "relative", overflowX: "clip" },
  glow: { position: "absolute", width: 700, height: 380, top: -180, left: "50%", transform: "translateX(-50%)", background: "rgba(250,204,21,.16)", filter: "blur(120px)", pointerEvents: "none" },
  shell: { maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 1, paddingBottom: 110 },
  hero: { display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-end", padding: "28px", border: "1px solid rgba(250,204,21,.28)", borderRadius: 28, background: "linear-gradient(135deg,rgba(24,24,27,.96),rgba(2,6,23,.97))", boxShadow: "0 0 70px rgba(250,204,21,.1)", flexWrap: "wrap" },
  badge: { display: "inline-block", color: "#facc15", background: "rgba(250,204,21,.12)", border: "1px solid rgba(250,204,21,.35)", borderRadius: 999, padding: "8px 12px", fontWeight: 900, fontSize: 13, letterSpacing: 1 },
  h1: { fontSize: "clamp(34px,7vw,58px)", margin: "18px 0 8px", lineHeight: .95, fontWeight: 950 },
  lead: { color: "#94a3b8", maxWidth: 650, lineHeight: 1.5, margin: 0 },
  deadline: { display: "grid", gap: 5, padding: "14px 18px", borderRadius: 16, background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.2)" },
  muted: { color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: .5 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10, marginTop: 16 },
  stat: { background: "rgba(15,23,42,.82)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 16 },
  statValue: { fontSize: 24, fontWeight: 950, marginTop: 5 },
  columns: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16, marginTop: 16, alignItems: "start" },
  panel: { background: "rgba(15,23,42,.78)", border: "1px solid rgba(250,204,21,.14)", borderRadius: 22, padding: 18 },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  eyebrow: { color: "#facc15", fontWeight: 950, fontSize: 11, letterSpacing: 1 },
  h2: { margin: "4px 0 0", fontSize: 22 },
  ghostButton: { background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "8px 11px", cursor: "pointer" },
  squad: { display: "grid", gap: 7 },
  slotFilled: { width: "100%", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(250,204,21,.2)", background: "rgba(250,204,21,.06)", color: "white", borderRadius: 13, padding: "10px", cursor: "pointer" },
  slotEmpty: { display: "flex", alignItems: "center", gap: 10, minHeight: 47, border: "1px dashed #334155", color: "#64748b", borderRadius: 13, padding: "10px" },
  slotNumber: { width: 27, height: 27, display: "grid", placeItems: "center", borderRadius: 8, background: "#111827", color: "#facc15", fontSize: 12, fontWeight: 950, flexShrink: 0 },
  playerName: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  playerMeta: { color: "#64748b", fontSize: 11, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  price: { color: "#facc15", fontWeight: 950, fontSize: 13 },
  remove: { color: "#64748b", fontSize: 20 },
  infoBox: { marginTop: 14, padding: 13, borderRadius: 13, background: "rgba(255,255,255,.035)", color: "#94a3b8", fontSize: 12, lineHeight: 1.5 },
  filters: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 12 },
  input: { width: "100%", boxSizing: "border-box", background: "#111827", color: "white", border: "1px solid #334155", borderRadius: 11, padding: "11px 12px", outline: "none" },
  market: { display: "grid", gap: 7, maxHeight: 620, overflowY: "auto" },
  marketRow: { display: "flex", alignItems: "center", gap: 10, padding: 10, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.055)", borderRadius: 13 },
  marketPrice: { color: "#facc15", fontWeight: 950, fontSize: 13, whiteSpace: "nowrap" },
  addButton: { width: 38, height: 38, borderRadius: 11, border: 0, background: "#facc15", color: "#000", fontSize: 20, fontWeight: 950, cursor: "pointer" },
  addButtonDisabled: { background: "#1e293b", color: "#64748b", cursor: "not-allowed", fontSize: 11 },
  bottomBar: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 14, width: "min(calc(100% - 28px),900px)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 18, background: "rgba(2,6,23,.94)", backdropFilter: "blur(16px)", border: "1px solid rgba(250,204,21,.24)", boxShadow: "0 12px 50px rgba(0,0,0,.55)", zIndex: 20 },
  saveButton: { border: 0, borderRadius: 12, padding: "12px 18px", background: "#facc15", color: "#000", fontWeight: 950, cursor: "pointer" },
  saveDisabled: { background: "#1e293b", color: "#64748b", cursor: "not-allowed" },
};
