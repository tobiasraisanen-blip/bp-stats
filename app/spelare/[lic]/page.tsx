"use client";

import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAXxwepsRlEzuR8GJ_-YEx_FbktEV4IojiHjhalKcd6knuvnIDrKca-fVa8RCrYREdWv3xn5pdx6jB/pub?gid=1638446153&single=true&output=csv";

function parseCSV(text: string) {
  return text
    .replace(/\r/g, "")
    .trim()
    .split("\n")
    .map((row) =>
      row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((cell) =>
          cell.replace(/^"|"$/g, "").replace(/\uFEFF/g, "").trim()
        )
    );
}

function getCell(row: string[], headers: string[], name: string) {
  const index = headers.indexOf(name);
  return index >= 0 ? row[index] : "";
}

function toNumber(value: any) {
  return Number(
    String(value || "0")
      .replace(/\s/g, "")
      .replace(/\u00A0/g, "")
      .replace(",", ".")
  );
}

export default function PlayerPage({ params }: any) {
  const [player, setPlayer] = useState<any>(null);
 const [careerRows, setCareerRows] = useState<any[]>([]);
const [careerRank, setCareerRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("Elitserien");

  useEffect(() => {
    async function load() {
      const res = await fetch(CSV_URL);
      const text = await res.text();
      const data = parseCSV(text);

      const headers = data[0];
      const rows = data.slice(1);

      const players = rows.map((row) => ({
        division: getCell(row, headers, "Division"),
  rank: getCell(row, headers, "Rank"),
  sasong: getCell(row, headers, "Säsong"),
  spelare: getCell(row, headers, "Spelare"),
  alder: getCell(row, headers, "Ålder"),
  nat: getCell(row, headers, "Nat"),
  lag: getCell(row, headers, "Lag"),
  logo: getCell(row, headers, "Logga"),
  ms: getCell(row, headers, "MS"),
  ser: getCell(row, headers, "SER"),
  bp: getCell(row, headers, "BP"),
  bps: getCell(row, headers, "BP/s"),
  hs: getCell(row, headers, "HS"),
  ts: getCell(row, headers, "TS"),
  avg: getCell(row, headers, "AVG"),
  trehundra: getCell(row, headers, "300"),
  tusen: getCell(row, headers, "1000"),
  trend: getCell(row, headers, "Trend"),
  lic: getCell(row, headers, "LIC_ID"),
}));

const nearMilestones = players
  .map((p: any) => {
    const bp = Number(p.bp || 0);
    const nextBP = Math.floor(bp / 50) * 50 + 50;
    const remaining = nextBP - bp;

    return {
      ...p,
      nextBP,
      remaining,
    };
  })
  .filter((p: any) => p.remaining <= 5 && p.remaining > 0)
  .sort((a: any, b: any) => a.remaining - b.remaining)
  .slice(0, 3);


      const licFromUrl = decodeURIComponent(params.lic || "")
        .trim()
        .toUpperCase();

      const found = players.find((p) => {
        const licFromSheet = String(p.lic || "").trim().toUpperCase();
        return licFromSheet === licFromUrl;
      });

      const career = players
  .filter((p) => {
    const licFromSheet = String(p.lic || "").trim().toUpperCase();
    const division = String(p.division || "").toLowerCase();

    if (licFromSheet !== licFromUrl) return false;

    if (selectedLeague === "Elitserien") {
      return division.includes("elitserien");
    }

    if (selectedLeague === "Nordallsvenskan") {
      return division.includes("nordallsvenskan");
    }

    if (selectedLeague === "Mellanallsvenskan") {
      return division.includes("mellanallsvenskan");
    }

    if (selectedLeague === "Sydallsvenskan") {
      return division.includes("sydallsvenskan");
    }

    if (selectedLeague === "Total Allsvenskan") {
      return division.includes("allsvenskan");
    }

    if (selectedLeague === "Total karriär") {
      return true;
    }

    return division.includes("elitserien");
  })
  .sort((a, b) => String(b.sasong).localeCompare(String(a.sasong)));

setCareerRows(career);

const filteredPlayers = players.filter((p: any) => {
  const division = String(p.division || "").toLowerCase();

  if (selectedLeague === "Elitserien") {
    return division.includes("elitserien");
  }

  if (selectedLeague === "Nordallsvenskan") {
    return division.includes("nordallsvenskan");
  }

  if (selectedLeague === "Mellanallsvenskan") {
    return division.includes("mellanallsvenskan");
  }

  if (selectedLeague === "Sydallsvenskan") {
    return division.includes("sydallsvenskan");
  }

  if (selectedLeague === "Total Allsvenskan") {
    return division.includes("allsvenskan");
  }

  if (selectedLeague === "Total karriär") {
    return true;
  }

  return division.includes("elitserien");
});

const allTime = filteredPlayers.reduce((acc: any, p: any) => {
  const lic = String(p.lic || "").trim().toUpperCase();
  if (!lic) return acc;

  if (!acc[lic]) {
    acc[lic] = {
      lic,
      spelare: p.spelare,
      bp: 0,
      ser: 0,
    };
  }

  acc[lic].bp += toNumber(p.bp);
  acc[lic].ser += toNumber(p.ser);

  return acc;
}, {});

const allTimeList = Object.values(allTime).sort((a: any, b: any) => {
  if (b.bp !== a.bp) return b.bp - a.bp;
  return b.ser > 0 && a.ser > 0
    ? b.bp / b.ser - a.bp / a.ser
    : 0;
});

const rankIndex = allTimeList.findIndex(
  (p: any) => String(p.lic).trim().toUpperCase() === licFromUrl
);

setCareerRank(rankIndex >= 0 ? rankIndex + 1 : null);
setPlayer(found);
setLoading(false);
    }

    load();
  }, [selectedLeague, params.lic]);

  if (loading) {
    return <div className="min-h-screen bg-black p-10 text-white">Laddar...</div>;
  }

 if (!player) {
  return <div className="min-h-screen bg-black p-10 text-white">Ingen spelare</div>;
}

const careerTotal = careerRows.reduce(
  (acc: any, r: any) => {
    acc.ms += toNumber(r.ms);
    acc.ser += toNumber(r.ser);
    acc.bp += toNumber(r.bp);
    acc.ts += toNumber(r.ts);
    acc.hs = Math.max(acc.hs, toNumber(r.hs));
    acc.trehundra += toNumber(r.trehundra);
    acc.tusen += toNumber(r.tusen);
    return acc;
  },
  { ms: 0, ser: 0, bp: 0, ts: 0, hs: 0, trehundra: 0, tusen: 0 }
);

careerTotal.bps =
  careerTotal.ser > 0 ? (careerTotal.bp / careerTotal.ser).toFixed(2) : "0.00";

careerTotal.avg =
  careerTotal.ser > 0 ? (careerTotal.ts / careerTotal.ser).toFixed(2) : "0.00";


  return (
  <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-yellow-950 text-white">
    <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 bg-yellow-500/20 blur-[180px]" />
    <div className="pointer-events-none absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 bg-yellow-400/10 blur-[160px]" />

    <div className="relative mx-auto max-w-7xl px-6 py-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-zinc-950/80 p-10 shadow-[0_0_60px_rgba(234,179,8,0.12)]">
          <div className="relative z-10">
            <div className="text-lg font-bold text-yellow-400">
              #{player.rank} • BP STATS
            </div>

            <h1 className="mt-6 text-4xl font-black uppercase tracking-tight md:text-5xl leading-none">
              {player.spelare}
            </h1>

            <div className="mt-3">
              <div className="flex items-center gap-3 text-xl text-zinc-300">
                {player.logo && (
                  <img
                    src={player.logo}
                    alt={player.lag}
                    className="h-12 w-12 object-contain drop-shadow-[0_0_12px_rgba(234,179,8,0.35)]"
                  />
                )}

                <span>{player.lag}</span>
              </div>
<div className="mt-6 mb-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">
    Säsong
  </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <HeroMiniStat label="Rank" value={`#${player.rank}`} />
                <HeroMiniStat label="MS" value={player.ms} />
                <HeroMiniStat label="SER" value={player.ser} />
                <HeroMiniStat label="BP" value={player.bp} highlight />
                <HeroMiniStat label="BP/s" value={player.bps} />
                <HeroMiniStat label="AVG" value={player.avg} />
                <HeroMiniStat label="HS" value={player.hs} />
                <HeroMiniStat label="TS" value={player.ts} />
                <HeroMiniStat label="300" value={player.trehundra} />
                <HeroMiniStat label="1000" value={player.tusen} />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">
                All Time
              </div>

              <div className="flex flex-wrap gap-2">
                <HeroMiniStat
                  label="Rank"
                  value={careerRank ? `#${careerRank}` : "-"}
                />
                <HeroMiniStat label="MS" value={careerTotal.ms} />
                <HeroMiniStat label="SER" value={careerTotal.ser} />
                <HeroMiniStat
  label="BP"
  value={careerTotal.bp.toLocaleString("sv-SE")}
  highlight
/>
                <HeroMiniStat label="BP/s" value={careerTotal.bps} />
                <HeroMiniStat label="AVG" value={careerTotal.avg} />
                <HeroMiniStat label="HS" value={careerTotal.hs.toLocaleString("sv-SE")}
/>
                <HeroMiniStat
  label="TS"
  value={careerTotal.ts.toLocaleString("sv-SE")}
/>
<HeroMiniStat label="300" value={careerTotal.trehundra} />
<HeroMiniStat
  label="1000"
  value={careerTotal.tusen.toLocaleString("sv-SE")}
/>
              </div>
            </div>
          </div>
        </div>

        {/* MILSTOLPAR */}
<div className="space-y-6 rounded-3xl border border-yellow-500/25 bg-zinc-950/80 p-6">
  <h2 className="text-xl font-bold text-yellow-300">Milstolpar</h2>

  <Milestone label="BP" current={careerTotal.bp} />
<Milestone label="TS" current={careerTotal.ts} />
<Milestone label="Matcher" current={careerTotal.ms} />
  
</div>
        </section>

        

<section className="mt-6 rounded-3xl border border-yellow-500/30 bg-zinc-950 p-6">
  <h2 className="mb-6 text-2xl font-bold text-yellow-300">
    Karriäröversikt
</h2>

<div className="mb-6">
  <label className="mb-2 block text-sm text-zinc-400">
    Visa statistik för
  </label>

  <select
    value={selectedLeague}
    onChange={(e) => setSelectedLeague(e.target.value)}
    className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
  >
    <option>Elitserien</option>
    <option>Nordallsvenskan</option>
    <option>Mellanallsvenskan</option>
    <option>Sydallsvenskan</option>
    <option>Total Allsvenskan</option>
    <option>Total karriär</option>
  </select>
</div>

  <div className="overflow-x-auto">
    <table className="w-full border-separate border-spacing-y-2 text-left">
      <thead>
        <tr className="text-sm text-zinc-500">
          <th className="px-4 py-2">Säsong</th>
          <th className="px-4 py-2">Lag</th>
          <th className="px-4 py-2">MS</th>
          <th className="px-4 py-2">SER</th>
          <th className="px-4 py-2 text-yellow-300">BP</th>
          <th className="px-4 py-2">BP/s</th>
          <th className="px-4 py-2">AVG</th>
          <th className="px-4 py-2">HS</th>
          <th className="px-4 py-2">TS</th>
<th className="px-4 py-2">300</th>
<th className="px-4 py-2">1000</th>
        </tr>
      </thead>

      <tbody>
        {careerRows.length === 0 && (
  <tr>
    <td
      colSpan={11}
      className="rounded-xl bg-zinc-900/80 px-4 py-8 text-center text-zinc-400"
    >
      Ingen statistik hittad för {selectedLeague}
    </td>
  </tr>
)}

  <tr className="bg-yellow-500/10 text-white">
    <td className="rounded-l-xl px-4 py-4 font-bold text-yellow-300">
      Totalt
    </td>

    <td className="px-4 py-4 text-zinc-400">
      Alla säsonger
    </td>

    <td className="px-4 py-4 font-bold">{careerTotal.ms}</td>
    <td className="px-4 py-4 font-bold">{careerTotal.ser}</td>

    <td className="px-4 py-4 font-black text-yellow-300">
      {careerTotal.bp}
    </td>

    <td className="px-4 py-4 font-bold">{careerTotal.bps}</td>
    <td className="px-4 py-4 font-bold">{careerTotal.avg}</td>

    <td className="px-4 py-4 font-bold">
      {careerTotal.hs.toLocaleString("sv-SE")}
    </td>

    <td className="px-4 py-4 font-bold">
      {careerTotal.ts.toLocaleString("sv-SE")}
    </td>

    <td className="px-4 py-4 font-bold">
      {careerTotal.trehundra}
    </td>

    <td className="rounded-r-xl px-4 py-4 font-bold">
      {careerTotal.tusen}
    </td>
  </tr>

  {careerRows.map((r: any) => (
    <tr key={r.sasong + r.lag} className="bg-zinc-900/80 text-white">
      <td className="rounded-l-xl px-4 py-4">{r.sasong}</td>
      <td className="px-4 py-4">{r.lag}</td>
      <td className="px-4 py-4">{r.ms}</td>
      <td className="px-4 py-4">{r.ser}</td>

      <td className="px-4 py-4 font-bold text-yellow-300">
        {r.bp}
      </td>

      <td className="px-4 py-4">{r.bps}</td>
      <td className="px-4 py-4">{r.avg}</td>
      <td className="px-4 py-4">{r.hs}</td>
      <td className="px-4 py-4">{r.ts}</td>
      <td className="px-4 py-4">{r.trehundra}</td>

      <td className="rounded-r-xl px-4 py-4">
        {r.tusen}
      </td>
    </tr>
  ))}

</tbody>
    </table>
  </div>
</section>

</div>
</main>
  );
}

function SeasonStat({ label, value, highlight }: any) {
  return (
    <div
      className={`rounded-xl p-4 ${
        highlight ? "bg-yellow-500/10" : "bg-zinc-900"
      }`}
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-yellow-300" : ""}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function HeroMiniStat({ label, value, highlight }: any) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        highlight
          ? "border-yellow-500/40 bg-yellow-500/10"
          : "border-white/10 bg-zinc-900/70"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>

      <div
        className={`text-sm font-black ${
          highlight ? "text-yellow-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Milestone({ label, current }: any) {
  const safeCurrent = Number(current || 0);

  let milestones: number[] = [];

  if (label === "BP") {
    milestones = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  }

  if (label === "TS") {
    milestones = [25000, 50000, 100000, 150000, 200000, 250000];
  }

  if (label === "Matcher") {
    milestones = [25, 50, 100, 200, 300, 400, 500];
  }

  const next =
    milestones.find((m) => safeCurrent < m) ||
    milestones[milestones.length - 1];

  const prev =
    [...milestones].reverse().find((m) => safeCurrent >= m) || 0;

  const progress =
    next > prev
      ? ((safeCurrent - prev) / (next - prev)) * 100
      : 100;

  return (
    <div>
      <div className="flex justify-between text-sm text-zinc-400">
        <span>{label}</span>

        <span>{safeCurrent.toLocaleString("sv-SE")}</span>
      </div>

      <p className="text-2xl font-black text-yellow-300">
        {next.toLocaleString("sv-SE")}
      </p>

      <div className="mt-2 h-2 rounded-full bg-zinc-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-yellow-700 to-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.6)]"
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        />
      </div>

      <p className="mt-1 text-xs text-zinc-500">
        {(next - safeCurrent).toLocaleString("sv-SE")} kvar
      </p>
    </div>
  );
}
