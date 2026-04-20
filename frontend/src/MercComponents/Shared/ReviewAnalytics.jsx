/**
 * ReviewAnalytics.jsx
 *
 * Review analytics panel — works for both admin and assistant (same data, same view).
 * Shows three intelligence streams:
 *   1. Live published reviews  → product ratings trend
 *   2. Saved declined reviews  → operational issues
 *   3. Discarded reviews       → spam/suspicious activity volume
 *
 * Drop into AdminDashBoard (analytics tab extended) and AssistantTerminal (analytics tab).
 */

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

/* ── tokens ──────────────────────────────────────────────────── */
const T = {
  void:     "var(--bg-dark)",
  obsidian: "var(--bg-panel)",
  ember:    "#ec5b13",
  blue:     "#38bdf8",
  green:    "#22c55e",
  red:      "#ef4444",
  amber:    "#f59e0b",
  purple:   "#a78bfa",
  border:   "1px solid var(--overlay-4)",
};

const CHART_COLORS = [T.ember, T.blue, T.purple, T.green, T.amber, T.red];

const REVIEW_TAGS = [
  { id: "product_praise",   label: "Product Praise",     color: T.green  },
  { id: "product_quality",  label: "Product Quality",    color: T.amber  },
  { id: "delivery_issue",   label: "Delivery Issue",     color: T.blue   },
  { id: "pricing",          label: "Pricing",            color: T.purple },
  { id: "packaging",        label: "Packaging",          color: T.ember  },
  { id: "wrong_item",       label: "Wrong Item",         color: T.red    },
  { id: "aggressive_false", label: "Aggressive / False", color: T.red    },
  { id: "spam",             label: "Spam",               color: "rgba(255,255,255,0.3)" },
  { id: "other",            label: "Other",              color: "rgba(255,255,255,0.5)" },
];

/* ── helpers ─────────────────────────────────────────────────── */
const mono = { fontFamily: "'JetBrains Mono',monospace" };
const serif = { fontFamily: "'Playfair Display',serif", fontStyle: "italic" };

/* ── stat card ───────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, subColor }) => (
  <div
    style={{
      background: T.obsidian,
      border: T.border,
      borderTop: `2px solid ${accent || T.ember}`,
      borderRadius: 18,
      padding: "20px 22px",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle,${accent || T.ember}12,transparent 70%)`,
        borderRadius: "0 0 0 100%",
      }}
    />
    <p style={{ ...mono, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
      {label}
    </p>
    <p style={{ ...serif, fontSize: 34, color: "var(--text-primary)", lineHeight: 1 }}>
      {value}
    </p>
    {sub && (
      <p style={{ ...mono, fontSize: 9, color: subColor || "rgba(255,255,255,0.3)", marginTop: 8 }}>
        {sub}
      </p>
    )}
  </div>
);

/* ── horizontal bar ──────────────────────────────────────────── */
const HBar = ({ label, value, max, color, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ ...mono, fontSize: 9, color, width: 110, flexShrink: 0, letterSpacing: "0.08em" }}>
      {label}
    </span>
    <div style={{ flex: 1, height: 6, background: "var(--overlay-3)", borderRadius: 99, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${max > 0 ? (value / max) * 100 : 0}%`,
          background: color,
          borderRadius: 99,
          transition: "width 700ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
    <span style={{ ...mono, fontSize: 8, color: "rgba(255,255,255,0.25)", width: 20, textAlign: "right" }}>
      {count}
    </span>
  </div>
);

/* ── vertical bar chart ──────────────────────────────────────── */
const BarChart = ({ data, height = 120, title }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      {title && (
        <p style={{ ...mono, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>
          {title}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height }}>
        {data.map((d, i) => {
          const pct   = (d.value / max) * 100;
          const color = d.color || CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(pct, 3)}%`,
                    background: d.isActive ? color : `${color}35`,
                    border: `1px solid ${color}40`,
                    borderBottom: "none",
                    borderRadius: "4px 4px 0 0",
                    position: "relative",
                    transition: "height 600ms cubic-bezier(0.16,1,0.3,1)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = color)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = d.isActive ? color : `${color}35`)}
                >
                  {d.value > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        ...mono,
                        fontSize: 7,
                        color: d.isActive ? color : "rgba(255,255,255,0.3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.value}
                    </span>
                  )}
                </div>
              </div>
              <span
                style={{
                  ...mono,
                  fontSize: 6,
                  color: d.isActive ? color : "rgba(255,255,255,0.2)",
                  letterSpacing: "0.06em",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── last 30 days helper ─────────────────────────────────────── */
const buildLast30Days = (reviews) => {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const ds = d.toISOString().slice(0, 10);
    return {
      label:    i % 5 === 0 ? `${d.getDate()}` : "",
      value:    reviews.filter((r) => r.created_at?.slice(0, 10) === ds).length,
      isActive: i === 29,
    };
  });
};

/* ── main component ──────────────────────────────────────────── */
const ReviewAnalytics = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    const { data, error } = await supabase
      .from("verp_product_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch_();
    const iv = setInterval(fetch_, 30000);
    return () => clearInterval(iv);
  }, [fetch_]);

  /* streams */
  const accepted = reviews.filter((r) => r.status === "accepted");
  const declined = reviews.filter((r) => r.status === "declined");
  const pending  = reviews.filter((r) => r.status === "pending");
  const saved    = declined.filter((r) => r.disposition === "save_to_data");
  const discard  = declined.filter((r) => r.disposition === "discard");

  /* avg rating (live only) */
  const ratedAccepted = accepted.filter((r) => r.rating);
  const avgRating = ratedAccepted.length
    ? (ratedAccepted.reduce((a, b) => a + b.rating, 0) / ratedAccepted.length).toFixed(1)
    : "—";

  /* star distribution (live) */
  const starDist = [5, 4, 3, 2, 1].map((s) => ({
    star:  s,
    count: accepted.filter((r) => r.rating === s).length,
  }));
  const maxStar = Math.max(...starDist.map((s) => s.count), 1);

  /* tag breakdown (saved declined) */
  const tagBreakdown = REVIEW_TAGS.map((t) => ({
    ...t,
    count: saved.filter((r) => r.tag === t.id).length,
  })).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);
  const maxTag = tagBreakdown.length ? tagBreakdown[0].count : 1;

  /* volume trend — last 30 days all reviews */
  const volumeData = buildLast30Days(reviews);

  /* top products by accepted reviews */
  const productMap = {};
  accepted.forEach((r) => {
    if (!r.product_name) return;
    if (!productMap[r.product_name]) productMap[r.product_name] = { count: 0, totalRating: 0 };
    productMap[r.product_name].count++;
    productMap[r.product_name].totalRating += r.rating || 0;
  });
  const topProducts = Object.entries(productMap)
    .map(([name, d]) => ({ name, count: d.count, avg: d.count ? (d.totalRating / d.count).toFixed(1) : "—" }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingTop: 80 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${T.ember}`, borderTopColor: "transparent", animation: "ra-spin 0.8s linear infinite" }} />
        <style>{`@keyframes ra-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowY: "auto",
        height: "100%",
        padding: "24px 24px 40px",
        background: T.void,
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* section label */}
      <p style={{ ...mono, fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginBottom: 6 }}>
        Review Intelligence
      </p>
      <h2 style={{ ...serif, fontSize: "clamp(18px,3vw,26px)", color: "var(--text-primary)", marginBottom: 24 }}>
        Review <span style={{ color: T.ember }}>Analytics</span>
      </h2>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Reviews"   value={reviews.length}  accent={T.blue}   sub="all time"           subColor={T.blue}   />
        <StatCard label="Live Reviews"    value={accepted.length} accent={T.green}  sub="on product pages"   subColor={T.green}  />
        <StatCard label="Pending"         value={pending.length}  accent={T.amber}  sub="awaiting action"    subColor={T.amber}  />
        <StatCard label="Avg Rating"      value={avgRating}       accent={T.ember}  sub="live reviews only"  subColor={T.ember}  />
        <StatCard label="Saved to Data"   value={saved.length}    accent={T.purple} sub="operational intel"  subColor={T.purple} />
        <StatCard label="Discarded"       value={discard.length}  accent="rgba(255,255,255,0.2)" sub="spam / invalid" subColor="rgba(255,255,255,0.25)" />
      </div>

      {/* three-column grid on large screens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18, marginBottom: 18 }}>

        {/* stream 1: star distribution */}
        <div style={{ background: T.obsidian, border: T.border, borderTop: `2px solid ${T.ember}`, borderRadius: 18, padding: "22px 24px" }}>
          <p style={{ ...mono, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
            Stream 1 · Live Reviews
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 18, lineHeight: 1.5 }}>
            Published on product pages
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {starDist.map((s) => (
              <HBar
                key={s.star}
                label={`${"★".repeat(s.star)}${"☆".repeat(5 - s.star)}`}
                value={s.count}
                max={maxStar}
                color={s.star >= 4 ? T.green : s.star === 3 ? T.amber : T.red}
                count={s.count}
              />
            ))}
          </div>
          {accepted.length > 0 && (
            <p style={{ ...mono, fontSize: 9, color: T.ember, marginTop: 16 }}>
              Avg {avgRating} ★ across {accepted.length} live review{accepted.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* stream 2: saved declined — tag breakdown */}
        <div style={{ background: T.obsidian, border: T.border, borderTop: `2px solid ${T.blue}`, borderRadius: 18, padding: "22px 24px" }}>
          <p style={{ ...mono, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
            Stream 2 · Declined → Saved
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 18, lineHeight: 1.5 }}>
            Operational issues & patterns
          </p>
          {tagBreakdown.length === 0 ? (
            <p style={{ ...mono, fontSize: 8, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>
              NO DATA YET
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tagBreakdown.map((t) => (
                <HBar key={t.id} label={t.label} value={t.count} max={maxTag} color={t.color} count={t.count} />
              ))}
            </div>
          )}
        </div>

        {/* stream 3: discard volume */}
        <div style={{ background: T.obsidian, border: T.border, borderTop: `2px solid rgba(255,255,255,0.12)`, borderRadius: 18, padding: "22px 24px" }}>
          <p style={{ ...mono, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
            Stream 3 · Discarded
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 18, lineHeight: 1.5 }}>
            Spam & suspicious activity
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--overlay-2)", borderRadius: 10 }}>
              <span style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>Total Discarded</span>
              <span style={{ ...mono, fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{discard.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--overlay-2)", borderRadius: 10 }}>
              <span style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>This Month</span>
              <span style={{ ...mono, fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                {discard.filter((r) => {
                  const d = new Date(r.created_at);
                  const n = new Date();
                  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
                }).length}
              </span>
            </div>
            {discard.length >= 10 && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.06)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.15)" }}>
                <p style={{ ...mono, fontSize: 8, color: T.red, letterSpacing: "0.15em" }}>
                  ⚠️ HIGH DISCARD VOLUME — possible coordinated spam
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* volume trend */}
      <div style={{ background: T.obsidian, border: T.border, borderRadius: 18, padding: "22px 24px", marginBottom: 18 }}>
        <BarChart data={volumeData} height={110} title="REVIEW VOLUME — LAST 30 DAYS" />
      </div>

      {/* top products */}
      {topProducts.length > 0 && (
        <div style={{ background: T.obsidian, border: T.border, borderRadius: 18, padding: "22px 24px" }}>
          <p style={{ ...mono, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>
            Top Reviewed Products
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {topProducts.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: i < topProducts.length - 1 ? "1px solid var(--overlay-3)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ ...mono, fontSize: 9, color: T.ember, width: 16 }}>{i + 1}</span>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ ...mono, fontSize: 9, color: T.amber }}>★ {p.avg}</span>
                  <span style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{p.count} review{p.count !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewAnalytics;