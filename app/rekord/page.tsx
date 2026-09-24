"use client";

import { useEffect, useMemo, useState } from "react";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRAXxwepsRlEzuR8GJ_-YEx_FbktEV4IojiHjhalKcd6knuvnIDrKca-fVa8RCrYREdWv3xn5pdx6jB/pub?gid=1638446153&single=true&output=csv";

const BP_LOGO =
  "https://lh3.googleusercontent.com/d/1MHq5fYm4qg0_fNR3JUV0aWTGZsulXaNm";

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

function toNumber(value: any) {
  const cleaned = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

type RecordRow = {
  division: string;
  sasong: string;
  lag: string;
  logga: string;
  spelare: string;
  lic: string;
  bp: number;
  ts: number;
  hs: number;
  p300: number;
  p1000: number;
};

type Category = {
  key: keyof Pick<RecordRow, "bp" | "ts" | "hs" | "p300" | "p1000">;
  title: string;
  subtitle: string;
  label: string;
  icon: string;
};

const categories: Category[] = [
  {
    key: "bp",
    title: "Flest BP",
    subtitle: "En säsong",
    label: "BP",
    icon: "🏆",
  },
  {
    key: "ts",
    title: "Högst totalslagning",
    subtitle: "En säsong",
    label: "TS",
    icon: "💥",
  },
  {
    key: "p300",
    title: "Flest 300",
    subtitle: "En säsong",
    label: "300",
    icon: "🎳",
  },
  {
    key: "p1000",
    title: "Flest 1000+",
    subtitle: "En säsong",
    label: "1000+",
    icon: "🔥",
  },
  {
    key: "hs",
    title: "Högsta High Score",
    subtitle: "En match",
    label: "HS",
    icon: "🚀",
  },
];

export default function RekordPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [division, setDivision] = useState("Elitserien (H)");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        const data = parseCSV(text);

        if (!data.length) return;

        const headers = data[0].map((h) => h.trim());

        const body: RecordRow[] = data
          .slice(1)
          .filter((row) => row[headers.indexOf("Spelare")])
          .map((row) => ({
            division: row[headers.indexOf("Division")] || "",
            sasong: row[headers.indexOf("Säsong")] || "",
            lag: row[headers.indexOf("Lag")] || "",
            logga: row[headers.indexOf("Logga")] || "",
            spelare: row[headers.indexOf("Spelare")] || "",
            lic: row[headers.indexOf("LIC_ID")] || "",
            bp: toNumber(row[headers.indexOf("BP")]),
            ts: toNumber(
              row[
                headers.indexOf("TS") >= 0
                  ? headers.indexOf("TS")
                  : headers.indexOf("Total Score")
              ]
            ),
            hs: toNumber(row[headers.indexOf("HS")]),
            p300: toNumber(row[headers.indexOf("300")]),
            p1000: toNumber(row[headers.indexOf("1000")]),
          }));

        setRows(body);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const divisions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.division)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "sv")),
    [rows]
  );

  const divisionRows = useMemo(
    () => rows.filter((r) => r.division === division),
    [rows, division]
  );

  function getTop8(category: Category) {
    return [...divisionRows]
      .filter((r) => toNumber(r[category.key]) > 0)
      .sort((a, b) => {
        const diff =
          toNumber(b[category.key]) - toNumber(a[category.key]);

        if (diff !== 0) return diff;

        if (b.bp !== a.bp) return b.bp - a.bp;

        return a.spelare.localeCompare(b.spelare, "sv");
      })
      .slice(0, 8);
  }

  function formatValue(category: Category, value: number) {
    if (category.key === "ts") {
      return value.toLocaleString("sv-SE");
    }

    return value.toLocaleString("sv-SE", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="record-page" style={pageStyle}>
      <style>{`
        @media (max-width: 700px) {
          .record-page {
            padding: 8px !important;
          }

          .record-hero {
            padding: 16px !important;
            border-radius: 18px !important;
          }

          .record-brand {
            gap: 10px !important;
          }

          .record-logo {
            width: 52px !important;
            height: 52px !important;
          }

          .record-title {
            font-size: 27px !important;
            margin-top: 5px !important;
          }

          .record-subtitle {
            font-size: 12px !important;
          }

          .record-controls {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            margin-top: 16px !important;
          }

          .record-controls a,
          .record-controls select {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .record-controls a {
            text-align: center !important;
          }

          .record-intro {
            margin-top: 18px !important;
            margin-bottom: 10px !important;
          }

          .record-section-title {
            font-size: 20px !important;
          }

          .record-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }

          .record-card {
            border-radius: 14px !important;
          }

          .record-card-header {
            padding: 12px !important;
          }

          .record-category-icon {
            width: 34px !important;
            height: 34px !important;
            font-size: 17px !important;
          }

          .record-list {
            padding: 4px 8px 8px !important;
          }

          .record-row {
            gap: 6px !important;
            padding: 9px 4px !important;
          }

          .record-first {
            padding: 10px 7px !important;
          }

          .record-rank {
            width: 29px !important;
            font-size: 11px !important;
          }

          .record-player {
            font-size: 12px !important;
          }

          .record-meta {
            font-size: 9px !important;
          }

          .record-value {
            font-size: 16px !important;
          }

          .record-value-label {
            font-size: 8px !important;
          }
        }
      `}</style>

      <div style={glowOne} />
      <div style={glowTwo} />

      <header className="record-hero" style={heroStyle}>
        <div className="record-brand" style={brandRowStyle}>
          <img
            src={BP_LOGO}
            alt="BP Stats"
            className="record-logo"
            style={logoStyle}
            referrerPolicy="no-referrer"
          />

          <div>
            <div style={badgeStyle}>BP STATS</div>

            <h1 className="record-title" style={titleStyle}>
              Rekordboken
            </h1>

            <p className="record-subtitle" style={subtitleStyle}>
              De främsta prestationerna sedan statistiken började.
            </p>
          </div>
        </div>

        <div className="record-controls" style={controlsStyle}>
          <a href="/" style={backButtonStyle}>
            ← Poängligan
          </a>

          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            style={selectStyle}
          >
            {divisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div style={messageStyle}>Laddar rekord...</div>
      ) : (
        <>
          <section className="record-intro" style={introStyle}>
            <div>
              <div style={eyebrowStyle}>ALL TIME</div>

              <h2
                className="record-section-title"
                style={sectionTitleStyle}
              >
                {division}
              </h2>
            </div>

            <div style={historyStyle}>
              Säsongsresultat • Topp 8
            </div>
          </section>

          <section className="record-grid" style={recordGridStyle}>
            {categories.map((category) => {
              const top8 = getTop8(category);

              return (
                <article
                  key={category.key}
                  className="record-card"
                  style={cardStyle}
                >
                  <div
                    className="record-card-header"
                    style={cardHeaderStyle}
                  >
                    <div
                      className="record-category-icon"
                      style={categoryIconStyle}
                    >
                      {category.icon}
                    </div>

                    <div>
                      <div style={cardTitleStyle}>
                        {category.title}
                      </div>

                      <div style={cardSubtitleStyle}>
                        {category.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="record-list" style={listStyle}>
                    {top8.length === 0 ? (
                      <div style={emptyStyle}>
                        Ingen statistik ännu
                      </div>
                    ) : (
                      top8.map((r, index) => (
                        <a
                          className={
                            index === 0
                              ? "record-row record-first"
                              : "record-row"
                          }
                          key={`${category.key}-${r.lic}-${r.sasong}-${index}`}
                          href={
                            r.lic
                              ? `/spelare/${encodeURIComponent(r.lic)}`
                              : "#"
                          }
                          style={{
                            ...recordRowStyle,
                            ...(index === 0 ? firstPlaceStyle : {}),
                          }}
                        >
                          <div
                            className="record-rank"
                            style={rankStyle}
                          >
                            {index === 0
                              ? "🥇"
                              : `#${index + 1}`}
                          </div>

                          <div style={playerAreaStyle}>
                            <div style={playerTopStyle}>
                              {r.logga && (
                                <img
                                  src={r.logga}
                                  alt=""
                                  style={teamLogoStyle}
                                />
                              )}

                              <span
                                className="record-player"
                                style={playerStyle}
                              >
                                {r.spelare}
                              </span>
                            </div>

                            <div
                              className="record-meta"
                              style={metaStyle}
                            >
                              {r.lag}
                              {r.sasong
                                ? ` • ${r.sasong}`
                                : ""}
                            </div>
                          </div>

                          <div style={valueAreaStyle}>
                            <div
                              className="record-value"
                              style={valueStyle}
                            >
                              {formatValue(
                                category,
                                toNumber(r[category.key])
                              )}
                            </div>

                            <div
                              className="record-value-label"
                              style={valueLabelStyle}
                            >
                              {category.label}
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}

const pageStyle = {
  position: "relative" as const,
  minHeight: "100vh",
  padding: "16px",
  background: "#000",
  color: "white",
  fontFamily: "Arial",
  overflowX: "clip" as const,
};

const glowOne = {
  position: "absolute" as const,
  top: "-160px",
  left: "50%",
  width: "700px",
  height: "420px",
  background: "rgba(250,204,21,0.18)",
  filter: "blur(130px)",
  transform: "translateX(-50%)",
  pointerEvents: "none" as const,
};

const glowTwo = {
  position: "absolute" as const,
  bottom: "-200px",
  right: "-120px",
  width: "500px",
  height: "500px",
  background: "rgba(250,204,21,0.08)",
  filter: "blur(120px)",
  pointerEvents: "none" as const,
};

const heroStyle = {
  position: "relative" as const,
  zIndex: 1,
  maxWidth: "1250px",
  margin: "0 auto",
  padding: "24px",
  borderRadius: "26px",
  border: "1px solid rgba(250,204,21,0.25)",
  background:
    "linear-gradient(135deg, rgba(24,24,27,0.96), rgba(2,6,23,0.96))",
  boxShadow: "0 0 60px rgba(250,204,21,0.10)",
};

const brandRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const logoStyle = {
  width: "70px",
  height: "70px",
  objectFit: "contain" as const,
  mixBlendMode: "multiply" as const,
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.30)",
  color: "#facc15",
  fontWeight: 900,
  fontSize: "11px",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: "7px 0 3px",
  fontSize: "clamp(28px, 6vw, 42px)",
  fontWeight: 950,
};

const subtitleStyle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px",
};

const controlsStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "22px",
  flexWrap: "wrap" as const,
};

const selectStyle = {
  padding: "11px 14px",
  borderRadius: "10px",
  background: "#1e293b",
  border: "1px solid #334155",
  color: "white",
  fontWeight: 700,
  fontSize: "14px",
};

const backButtonStyle = {
  padding: "11px 14px",
  borderRadius: "10px",
  background: "#facc15",
  color: "#000",
  textDecoration: "none",
  fontWeight: 900,
};

const introStyle = {
  position: "relative" as const,
  zIndex: 1,
  maxWidth: "1250px",
  margin: "28px auto 14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: "15px",
  flexWrap: "wrap" as const,
};

const eyebrowStyle = {
  color: "#facc15",
  fontSize: "11px",
  fontWeight: 950,
  letterSpacing: "1.4px",
};

const sectionTitleStyle = {
  margin: "5px 0 0",
  fontSize: "24px",
};

const historyStyle = {
  color: "#64748b",
  fontSize: "12px",
};

const recordGridStyle = {
  position: "relative" as const,
  zIndex: 1,
  maxWidth: "1250px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(330px, 1fr))",
  gap: "14px",
};

const cardStyle = {
  border: "1px solid rgba(250,204,21,0.15)",
  borderRadius: "20px",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(2,6,23,0.96))",
  overflow: "hidden",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "16px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const categoryIconStyle = {
  width: "40px",
  height: "40px",
  display: "grid",
  placeItems: "center",
  borderRadius: "12px",
  background: "rgba(250,204,21,0.10)",
  fontSize: "20px",
};

const cardTitleStyle = {
  fontSize: "17px",
  fontWeight: 950,
};

const cardSubtitleStyle = {
  marginTop: "2px",
  color: "#64748b",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: ".6px",
};

const listStyle = {
  padding: "5px 12px 12px",
};

const recordRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 6px",
  borderBottom: "1px solid rgba(255,255,255,0.055)",
  textDecoration: "none",
  color: "white",
};

const firstPlaceStyle = {
  marginTop: "6px",
  marginBottom: "3px",
  padding: "12px 9px",
  borderRadius: "12px",
  background: "rgba(250,204,21,0.075)",
  border: "1px solid rgba(250,204,21,0.16)",
};

const rankStyle = {
  width: "35px",
  flexShrink: 0,
  color: "#facc15",
  fontWeight: 950,
  fontSize: "13px",
};

const playerAreaStyle = {
  flex: 1,
  minWidth: 0,
};

const playerTopStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  minWidth: 0,
};

const playerStyle = {
  fontWeight: 850,
  fontSize: "13px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

const teamLogoStyle = {
  width: "18px",
  height: "18px",
  objectFit: "contain" as const,
  borderRadius: "3px",
  background: "white",
  padding: "1px",
  flexShrink: 0,
};

const metaStyle = {
  marginTop: "3px",
  color: "#64748b",
  fontSize: "10px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

const valueAreaStyle = {
  textAlign: "right" as const,
  flexShrink: 0,
};

const valueStyle = {
  color: "#facc15",
  fontWeight: 950,
  fontSize: "18px",
};

const valueLabelStyle = {
  marginTop: "1px",
  color: "#64748b",
  fontSize: "9px",
  fontWeight: 900,
};

const emptyStyle = {
  padding: "25px 8px",
  color: "#64748b",
  textAlign: "center" as const,
};

const messageStyle = {
  maxWidth: "1250px",
  margin: "30px auto",
  color: "#94a3b8",
  textAlign: "center" as const,
};
