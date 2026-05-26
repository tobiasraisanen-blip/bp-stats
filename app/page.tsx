"use client";

import { useEffect, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAXxwepsRlEzuR8GJ_-YEx_FbktEV4IojiHjhalKcd6knuvnIDrKca-fVa8RCrYREdWv3xn5pdx6jB/pub?gid=1638446153&single=true&output=csv";

const BP_LOGO =
  "https://lh3.googleusercontent.com/d/1MHq5fYm4qg0_fNR3JUV0aWTGZsulXaNm";

const MILESTONES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAXxwepsRlEzuR8GJ_-YEx_FbktEV4IojiHjhalKcd6knuvnIDrKca-fVa8RCrYREdWv3xn5pdx6jB/pub?gid=1315497922&single=true&output=csv";

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

function getMilestoneGroupsFromEvents(events: any[]) {
  const iconByType: any = {
    BP: "🏆",
    MS: "🎳",
    TS: "💥",
  };

  const makeGroup = (type: string, title: string, subtitle: string) => ({
    type,
    title,
    subtitle,
    items: events
  .filter((e: any) => e.type === type)
  .sort((a: any, b: any) => {
    return new Date(b.datum).getTime() - new Date(a.datum).getTime();
  })
.reduce((acc: any[], e: any) => {
  const key = String(e.lic || e.spelare);
  const existing = acc.find((x: any) => String(x.lic || x.spelare) === key);

  if (!existing) {
    acc.push(e);
  } else if (Number(e.value) > Number(existing.value)) {
    Object.assign(existing, e);
  }

  return acc;
}, [])
.sort((a: any, b: any) => Number(b.value) - Number(a.value))
.slice(0, 5)
  .map((e: any) => ({
        type: e.type,
        icon: iconByType[e.type] || "⭐",
        value: e.value,
        text: e.text,
        lic: e.lic,
        player: {
          lag: e.lag,
          spelare: e.spelare,
        },
      })),
  });

  return [
    makeGroup("BP", "Senaste BP-milstolpar", "Banpoäng"),
    makeGroup("MS", "Senaste MS-milstolpar", "Matcher spelade"),
    makeGroup("TS", "Senaste TS-milstolpar", "Total score"),
  ];
}
export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
const [milestoneRows, setMilestoneRows] = useState<any[]>([]);
  const [division, setDivision] = useState("Alla");
  const [sasong, setSasong] = useState("Alla");
  const [lag, setLag] = useState("Alla");
  const [mode, setMode] = useState("Säsong");
  const [heroIndex, setHeroIndex] = useState(0);
  const [search, setSearch] = useState("");
const [activeMilestoneGroup, setActiveMilestoneGroup] = useState(0);
const milestoneGroups = getMilestoneGroupsFromEvents(milestoneRows);
const currentMilestoneGroup = milestoneGroups[activeMilestoneGroup];

useEffect(() => {
  const interval = setInterval(() => {
    setActiveMilestoneGroup((prev) => (prev + 1) % 3);
  }, 12000);

  return () => clearInterval(interval);
}, []);



  const toNumber = (value: any) =>
    Number(String(value || "0").replace(/\s/g, "").replace(",", "."));

  useEffect(() => {
    async function loadData() {
      const res = await fetch(CSV_URL);
      const text = await res.text();
      const data = parseCSV(text);
      const headers = data[0].map((h) => h.trim());

      const body = data.slice(1).map((row) => ({
        division: row[headers.indexOf("Division")],
        sasong: row[headers.indexOf("Säsong")],
        lag: row[headers.indexOf("Lag")],
        logga: row[headers.indexOf("Logga")],
        rank: row[headers.indexOf("Rank")],
        spelare: row[headers.indexOf("Spelare")],
        alder: row[headers.indexOf("Ålder")],
        ms: row[headers.indexOf("MS")],
        ser: row[headers.indexOf("SER")],
        bp: row[headers.indexOf("BP")],
        bps: row[headers.indexOf("BP/s")],
        hs: row[headers.indexOf("HS")],
        ts:
          row[
            headers.indexOf("TS") >= 0
              ? headers.indexOf("TS")
              : headers.indexOf("Total Score")
          ],
        avg: row[headers.indexOf("AVG")],
        p300: row[headers.indexOf("300")],
        p1000: row[headers.indexOf("1000")],
        trend: row[headers.indexOf("Trend")],
        lic: row[headers.indexOf("LIC_ID")],
      }));

      setRows(body);
const milestoneRes = await fetch(MILESTONES_CSV_URL);
const milestoneText = await milestoneRes.text();
const milestoneData = parseCSV(milestoneText);
const milestoneHeaders = milestoneData[0].map((h) => h.trim());

const milestoneBody = milestoneData.slice(1).map((row) => ({
  datum: row[milestoneHeaders.indexOf("Datum")],
  type: row[milestoneHeaders.indexOf("Typ")],
  lic: row[milestoneHeaders.indexOf("Lic")],
  spelare: row[milestoneHeaders.indexOf("Spelare")],
  lag: row[milestoneHeaders.indexOf("Lag")],
  value: Number(
  row[milestoneHeaders.indexOf("Värde")] || 0
),
  text: row[milestoneHeaders.indexOf("Text")],
}));

setMilestoneRows(milestoneBody);
    }

    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const divisions = [
    "Alla",
    ...Array.from(new Set(rows.map((r) => r.division))).filter(Boolean),
  ];

  const sasonger = [
  "Alla",
  ...Array.from(new Set(rows.map((r) => r.sasong)))
    .filter(Boolean)
    .sort((a, b) => {
      const aYear = Number(String(a).match(/\d+/)?.[0] || 0);
      const bYear = Number(String(b).match(/\d+/)?.[0] || 0);

      return bYear - aYear;
    }),
];
  const lagOptions = [
    "Alla",
    ...Array.from(
      new Set(
        rows
          .filter((r) => division === "Alla" || r.division === division)
          .filter((r) => sasong === "Alla" || r.sasong === sasong)
          .map((r) => r.lag)
      )
    ).filter(Boolean),
  ];

  const filteredRows = rows
  .filter((r) => {
  const aktivDivision = division === "Alla" ? "Elitserien (H)" : division;
  return r.division === aktivDivision;
})
  .filter((r) => {
    const aktivSasong = sasong === "Alla" ? "Säsong 25/26" : sasong;
    return r.sasong === aktivSasong;
  })
  .filter((r) => lag === "Alla" || r.lag === lag)
  .filter((r) =>
    String(r.spelare || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const allTimeRows = Object.values(
    rows
      .filter((r) => division === "Alla" || r.division === division)
      .filter((r) => lag === "Alla" || r.lag === lag)
      .reduce((acc: any, r: any) => {
        const key = r.lic || r.spelare;

       if (!acc[key]) {
  acc[key] = {
    ...r,
    teams: [{ lag: r.lag, logo: r.logo }],
    ms: 0,
    ser: 0,
    bp: 0,
    hs: 0,
    ts: 0,
  };
}
        const teamExists = acc[key].teams.some(
  (t: any) => t.lag === r.lag
);

if (!teamExists) {
  acc[key].teams.push({
    lag: r.lag,
    logo: r.logo,
  });
}
        acc[key].ms += toNumber(r.ms);
        acc[key].ser += toNumber(r.ser);
        acc[key].bp += toNumber(r.bp);
        acc[key].ts += toNumber(r.ts);
        acc[key].hs = Math.max(toNumber(acc[key].hs), toNumber(r.hs));

        return acc;
      }, {})
  )
    .map((r: any) => ({
      ...r,
      bps: r.ser > 0 ? (r.bp / r.ser).toFixed(2) : "0.00",
      avg: r.ser > 0 ? (r.ts / r.ser).toFixed(2) : "0.00",
    }))
    .filter((r: any) =>
      String(r.spelare || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => Number(b.bp) - Number(a.bp))
    .map((r: any, i: number) => ({ ...r, rank: i + 1 }));

  const heroDivisions = ["Elitserien (H)", "Elitserien (D)"];
  const activeHeroDivision = heroDivisions[heroIndex];

  const heroRows = rows
    .filter((r) => r.sasong === "Säsong 25/26")
    .filter((r) => r.division === activeHeroDivision);

  const displayRows = mode === "All Time" ? allTimeRows : filteredRows;
  const top3 = heroRows.length > 0 ? heroRows.slice(0, 3) : displayRows.slice(0, 3);

  const topHS = [...heroRows]
    .sort((a: any, b: any) => toNumber(b.hs) - toNumber(a.hs))
    .slice(0, 3);

  const MIN_SERIES_FOR_AVG = 20;

  const topAVG = [...heroRows]
    .filter((r: any) => toNumber(r.ser) >= MIN_SERIES_FOR_AVG)
    .sort((a: any, b: any) => toNumber(b.avg) - toNumber(a.avg))
    .slice(0, 3);

  const topTS = [...heroRows]
    .filter((r: any) => toNumber(r.ts) > 0)
    .sort((a: any, b: any) => toNumber(b.ts) - toNumber(a.ts))
    .slice(0, 3);

  const careerMilestoneRows = Object.values(
    rows.reduce((acc: any, r: any) => {
      const key = r.lic || r.spelare;

      if (!acc[key]) {
        acc[key] = {
          ...r,
          bp: 0,
          ts: 0,
          ms: 0,
          p300: 0,
          p1000: 0,
        };
      }

      acc[key].bp += toNumber(r.bp);
      acc[key].ts += toNumber(r.ts);
      acc[key].ms += toNumber(r.ms);
      acc[key].p300 += toNumber(r.p300);
      acc[key].p1000 += toNumber(r.p1000);

      return acc;
    }, {})
  );

  const milestoneTypes = [
    { key: "bp", label: "BP", step: 50, closeWithin: 5 },
    { key: "ts", label: "TS", step: 20000, closeWithin: 1000 },
    { key: "ms", label: "matcher", step: 25, closeWithin: 2 },
    { key: "p300", label: "300-serier", step: 1, closeWithin: 1 },
    { key: "p1000", label: "1000+", step: 5, closeWithin: 1 },
  ];


  return (
    <main style={pageStyle}>
  <style>{`
    @keyframes milestoneSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}</style>
      <div style={glowOne} />
      <div style={glowTwo} />

      <section style={heroGridStyle}>
        <div style={heroStyle}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={brandRowStyle}>
              <img
                src={BP_LOGO}
                alt="BP Stats"
                style={mainLogoStyle}
                referrerPolicy="no-referrer"
              />

              <div style={badgeStyle}>BP STATS</div>
            </div>

            <h1 style={titleStyle}>
              Statistik baserad på{" "}
              <span style={{ color: "#facc15" }}>banpoäng</span>
            </h1>

            <p style={subtitleStyle}>
              Följ poängligor, form och spelare som faktiskt tar poäng för sitt lag.
            </p>

            <div
              style={{
                marginTop: "28px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 18px",
                border: "1px solid rgba(250,204,21,0.25)",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.03)",
                color: "#d1d5db",
                fontSize: "14px",
                fontWeight: 500,
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ color: "#facc15", fontWeight: 700 }}>
                2012/13 →
              </span>
              All-time statistik & spelarhistorik
            </div>
          </div>
        </div>

        <div style={leaderPanelStyle}>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            Aktuell ledare • {activeHeroDivision}
          </div>

          <div style={leaderListStyle}>
            {top3.map((r: any) => (
              <a
                key={r.lic || r.spelare}
                href={`/spelare/${encodeURIComponent(r.lic)}`}
                style={{ ...leaderRowStyle, textDecoration: "none", color: "white" }}
              >
                <div style={leaderRankStyle}>#{r.rank}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={leaderPlayerNameStyle}>{r.spelare}</div>
                  <div style={leaderTeamStyle}>{r.lag}</div>
                </div>

                <div style={leaderStatsRightStyle}>
                  <div>
                    <span style={leaderBpStyle}>{r.bp}</span>
                    <span style={leaderBpLabelStyle}> BP</span>
                  </div>

                  <div style={leaderBpsStyle}>
                    {String(r.bps).replace(".", ",")} BP/s
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

  

      <section style={categoryGrid}>
        <div style={categoryCard}>
          <div style={categoryTitle}>Top 3 HS</div>

          {topHS.map((r: any, i: number) => (
            <a
              key={(r.lic || r.spelare) + "hs"}
              href={`/spelare/${encodeURIComponent(r.lic)}`}
              style={{ ...categoryRow, textDecoration: "none", color: "white" }}
            >
              <div style={categoryRank}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={categoryPlayer}>{r.spelare}</div>
                <div style={categoryTeam}>{r.lag}</div>
              </div>
              <div style={categoryValue}>{r.hs}</div>
            </a>
          ))}
        </div>

        <div style={categoryCard}>
          <div style={categoryTitle}>Top 3 AVG</div>

          {topAVG.map((r: any, i: number) => (
            <a
              key={(r.lic || r.spelare) + "avg"}
              href={`/spelare/${encodeURIComponent(r.lic)}`}
              style={{ ...categoryRow, textDecoration: "none", color: "white" }}
            >
              <div style={categoryRank}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={categoryPlayer}>{r.spelare}</div>
                <div style={categoryTeam}>{r.lag}</div>
              </div>
              <div style={categoryValue}>{r.avg}</div>
            </a>
          ))}

          <div style={categoryFooter}>Minst 20 serier spelade</div>
        </div>

        <div style={categoryCard}>
          <div style={categoryTitle}>Top 3 TS</div>

          {topTS.map((r: any, i: number) => (
            <a
              key={(r.lic || r.spelare) + "ts"}
              href={`/spelare/${encodeURIComponent(r.lic)}`}
              style={{ ...categoryRow, textDecoration: "none", color: "white" }}
            >
              <div style={categoryRank}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={categoryPlayer}>{r.spelare}</div>
                <div style={categoryTeam}>{r.lag}</div>
              </div>
              <div style={categoryValue}>{r.ts}</div>
            </a>
          ))}
        </div>
      </section>

<section style={rotatingmilestoneSectionStyle}>
  <div style={milestoneHeaderStyle}>
    <div>
      <div style={milestoneTitleStyle}>
        {currentMilestoneGroup.title}
      </div>

      <div style={milestoneSubtitleStyle}>
        {currentMilestoneGroup.subtitle} • byter automatiskt
      </div>
    </div>

    <div style={milestoneTabsStyle}>
      {milestoneGroups.map((g, index) => (
        <button
          key={g.type}
          onClick={() => setActiveMilestoneGroup(index)}
          style={{
            ...milestoneTabStyle,
            ...(activeMilestoneGroup === index
              ? milestoneTabActiveStyle
              : {}),
          }}
        >
          {g.type}
        </button>
      ))}
    </div>
  </div>

<div
  key={currentMilestoneGroup.type + activeMilestoneGroup}
  style={milestoneListStyle}
>
  {currentMilestoneGroup.items.length === 0 ? (
    <div style={milestoneEmptyStyle}>
      Inga {currentMilestoneGroup.type}-milstolpar hittades
    </div>
  ) : (
    currentMilestoneGroup.items.map((m: any, i: number) => (
      <a
        key={`${m.type}-${m.lic}-${m.value}`}
        href={`/spelare/${encodeURIComponent(m.lic)}`}
        style={milestoneNoticeStyle}
      >
        <div style={milestoneIconStyle}>{m.icon}</div>

        <div style={{ flex: 1 }}>
          <div style={milestoneTextStyle}>
  {String(m.text).replace(/\d{4,}/g, (num) =>
    Number(num).toLocaleString("sv-SE")
  )}
</div>
          <div style={milestoneMetaStyle}>
            {m.player.lag || m.player.Lag || ""} • {m.type}
          </div>
        </div>

        <div style={milestoneNewStyle}>#{i + 1}</div>
      </a>
    ))
  )}
</div>
</section>

      <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
        <button onClick={() => setMode("Säsong")} style={buttonStyle(mode === "Säsong")}>
          Säsong
        </button>

        <button
          onClick={() => {
            setMode("All Time");
            setSasong("Alla");
          }}
          style={buttonStyle(mode === "All Time")}
        >
          All Time
        </button>
      </div>

      <h2 style={{ fontSize: "22px", marginTop: "28px" }}>
        Poängliga – {mode}
      </h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "16px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        {mode === "Säsong" && (
          <select
            value={sasong}
            onChange={(e) => setSasong(e.target.value)}
            style={selectStyle}
          >
            {sasonger.map((s) => (
              <option key={s} value={s}>
                {s === "Alla" ? "Säsong" : s}
              </option>
            ))}
          </select>
        )}

        <select
          value={division}
          onChange={(e) => {
            setDivision(e.target.value);
            setLag("Alla");
          }}
          style={selectStyle}
        >
          {divisions.map((d) => (
            <option key={d} value={d}>
              {d === "Alla" ? "Division" : d}
            </option>
          ))}
        </select>

        <select value={lag} onChange={(e) => setLag(e.target.value)} style={selectStyle}>
          {lagOptions.map((l) => (
            <option key={l} value={l}>
              {l === "Alla" ? "Lag" : l}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Sök spelare..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={selectStyle}
        />
      </div>

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr style={theadRow}>
              <th>Rank</th>
              <th>Spelare</th>
              <th>Ålder</th>
              <th>Lag</th>
              <th>MS</th>
              <th>SER</th>
              <th>BP</th>
              <th>BP/s</th>
              <th>HS</th>
<th>TS</th>
              <th>AVG</th>
            </tr>
          </thead>

          <tbody>
            {displayRows.map((r: any, i: number) => (
              <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={td}>{r.rank}</td>
                <td style={{ ...td, fontWeight: "bold" }}>
                  <a href={`/spelare/${encodeURIComponent(r.lic)}`} style={playerLink}>
                    {r.spelare}
                  </a>
                </td>
                <td style={td}>{r.alder}</td>
                <td style={td}>
  {mode === "All Time" && r.teams ? (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
      {r.teams.map((team: any) => (
        <img
          key={team.lag}
          src={team.logo}
          alt={team.lag}
          title={team.lag}
          style={logoStyle}
        />
      ))}
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {r.logga && <img src={r.logga} alt={r.lag} style={logoStyle} />}
      <span>{r.lag}</span>
    </div>
  )}
</td>
                <td style={td}>{r.ms}</td>
                <td style={td}>{r.ser}</td>
                <td style={{ ...td, color: "#facc15", fontWeight: 900 }}>{r.bp}</td>
                <td style={td}>{r.bps}</td>
                <td style={td}>{r.hs}</td>
<td>
  {Number((r?.ts || "").toString().replace(/\s/g, "") || 0).toLocaleString("sv-SE")}
</td>
                <td style={td}>{r.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const pageStyle = {
  position: "relative" as const,
  padding: "16px",
  minHeight: "100vh",
  color: "white",
  fontFamily: "Arial",
  background: "#000",
  overflowX: "hidden" as const,
};

const glowOne = {
  position: "absolute" as const,
  top: "-140px",
  left: "50%",
  width: "700px",
  height: "400px",
  background: "rgba(250,204,21,0.20)",
  filter: "blur(120px)",
  transform: "translateX(-50%)",
};

const glowTwo = {
  position: "absolute" as const,
  bottom: "-180px",
  right: "-120px",
  width: "500px",
  height: "500px",
  background: "rgba(250,204,21,0.10)",
  filter: "blur(120px)",
};

const heroStyle = {
  position: "relative" as const,
  overflow: "hidden",
  borderRadius: "28px",
  border: "1px solid rgba(250,204,21,0.28)",
  background:
    "linear-gradient(135deg, rgba(24,24,27,0.95), rgba(2,6,23,0.96))",
  padding: "26px",
  boxShadow: "0 0 70px rgba(250,204,21,0.12)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.35)",
  color: "#facc15",
  fontWeight: 900,
  fontSize: "13px",
  letterSpacing: "1px",
};

const titleStyle = {
  fontSize: "clamp(30px, 8vw, 38px)",
  maxWidth: "520px",
  lineHeight: 1,
  margin: "18px 0 12px",
  fontWeight: 950,
};

const subtitleStyle = {
  color: "#94a3b8",
  fontSize: "15px",
  maxWidth: "600px",
};

const buttonStyle = (active: boolean) => ({
  padding: "10px 16px",
  borderRadius: "10px",
  background: active ? "#facc15" : "#1e293b",
  color: active ? "#000" : "#fff",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
});

const selectStyle = {
  padding: "12px 14px",
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  borderRadius: "10px",
  fontSize: "16px",
};

const tableWrap = {
  overflowX: "auto" as const,
  background: "rgba(15,23,42,0.8)",
  borderRadius: "16px",
  boxShadow: "0 0 40px rgba(234,179,8,0.08)",
  border: "1px solid rgba(234,179,8,0.15)",
  padding: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  minWidth: "900px",
};

const theadRow = {
  color: "#94a3b8",
  textAlign: "left" as const,
  borderBottom: "1px solid #334155",
};

const td = {
  padding: "14px 8px",
};

const playerLink = {
  color: "white",
  textDecoration: "none",
};

const logoStyle = {
  width: "28px",
  height: "28px",
  objectFit: "contain" as const,
  borderRadius: "4px",
  background: "white",
  padding: "2px",
};

const heroGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "18px",
  alignItems: "stretch",
};

const leaderPanelStyle = {
  position: "relative" as const,
  borderRadius: "28px",
  border: "1px solid rgba(250,204,21,0.22)",
  background: "rgba(15,23,42,0.82)",
  padding: "22px",
  boxShadow: "0 0 50px rgba(250,204,21,0.08)",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  gap: "18px",
};

const leaderListStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
};

const leaderRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between" as const,
  gap: "12px",
  padding: "12px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
};

const leaderRankStyle = {
  width: "52px",
  color: "#facc15",
  fontSize: "28px",
  fontWeight: 950,
  lineHeight: 1,
};

const leaderPlayerNameStyle = {
  color: "#fff",
  fontSize: "15px",
  fontWeight: 900,
  lineHeight: 1.15,
  whiteSpace: "normal" as const,
};

const leaderTeamStyle = {
  marginTop: "5px",
  color: "#94a3b8",
  fontSize: "13px",
};

const leaderStatsRightStyle = {
  minWidth: "82px",
  textAlign: "right" as const,
};

const leaderBpStyle = {
  color: "#facc15",
  fontSize: "24px",
  fontWeight: 950,
  lineHeight: 1,
};

const leaderBpLabelStyle = {
  color: "#facc15",
  fontSize: "18px",
  fontWeight: 900,
};

const leaderBpsStyle = {
  marginTop: "8px",
  color: "#94a3b8",
  fontSize: "18px",
  fontWeight: 500,
};

const brandRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  marginBottom: "18px",
};

const mainLogoStyle = {
  width: "clamp(54px, 16vw, 74px)",
  height: "clamp(54px, 16vw, 74px)",
  objectFit: "contain" as const,
  mixBlendMode: "multiply" as const,
  filter: "drop-shadow(0 0 18px rgba(250,204,21,0.35))",
};

const categoryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px",
  marginTop: "18px",
};

const categoryCard = {
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(250,204,21,0.14)",
  borderRadius: "22px",
  padding: "18px",
};

const categoryTitle = {
  color: "#facc15",
  fontSize: "18px",
  fontWeight: 900,
  marginBottom: "16px",
};

const categoryRow = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const categoryRank = {
  color: "#facc15",
  fontWeight: 900,
  width: "42px",
};

const categoryPlayer = {
  fontWeight: 800,
  fontSize: "15px",
};

const categoryTeam = {
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "2px",
};

const categoryValue = {
  marginLeft: "auto",
  fontWeight: 900,
  fontSize: "20px",
  color: "#fff",
};

const categoryFooter = {
  marginTop: "14px",
  paddingTop: "12px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  color: "#64748b",
  fontSize: "12px",
};


const milestoneHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap" as const,
  gap: "12px",
  marginBottom: "14px",
};


const milestoneTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 950,
  textTransform: "uppercase" as const,
};

const rotatingmilestoneSectionStyle = {
  marginTop: 24,
  border: "1px solid rgba(250, 204, 21, 0.25)",
  background: "rgba(24, 24, 27, 0.75)",
  borderRadius: 24,
  padding: 18,
  boxShadow: "0 0 40px rgba(234,179,8,0.08)",
};

const rotatingmilestoneHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
};

const rotatingmilestoneTitleStyle = {
  color: "white",
  fontWeight: 900,
  fontSize: 18,
};

const milestoneSubtitleStyle = {
  marginTop: 4,
  color: "rgba(255,255,255,0.55)",
  fontSize: 12,
};

const milestoneTabsStyle = {
  display: "flex",
  gap: 6,
};

const milestoneTabStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.65)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
};

const milestoneTabActiveStyle = {
  background: "rgba(250,204,21,0.16)",
  border: "1px solid rgba(250,204,21,0.45)",
  color: "#facc15",
  boxShadow: "0 0 18px rgba(250,204,21,0.20)",
};

const milestoneListStyle = {
  display: "flex",
  gap: 12,
  overflowX: "auto" as const,
  paddingBottom: 4,
  animation: "milestoneSlideIn 420ms ease-out",
};

const milestoneNoticeStyle = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(250,204,21,0.18)",
  textDecoration: "none",
  color: "white",
  minWidth: "min(340px, 82vw)",
};

const milestoneIconStyle = {
  width: 38,
  height: 38,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "rgba(250,204,21,0.12)",
  fontSize: 20,
};

const milestoneTextStyle = {
  fontWeight: 800,
  fontSize: 14,
};

const milestoneMetaStyle = {
  marginTop: 3,
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
};

const milestoneNewStyle = {
  fontSize: 11,
  fontWeight: 900,
  color: "#facc15",
  border: "1px solid rgba(250,204,21,0.35)",
  borderRadius: 999,
  padding: "4px 8px",
};

const milestoneEmptyStyle = {
  color: "rgba(255,255,255,0.55)",
  fontSize: 14,
  padding: "14px 0",
};
