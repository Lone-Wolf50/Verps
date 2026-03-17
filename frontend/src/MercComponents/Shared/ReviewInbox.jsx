/**
 * ReviewInbox.jsx
 *
 * Shared moderation panel — works for both admin and assistant.
 * Pass role="admin" or role="assistant" as a prop.
 *
 * Admin:    sees all reviews, can Accept / Decline + full action suite.
 * Assistant: sees all reviews, can add/edit their note, flag or clear flag.
 *            Cannot Accept/Decline — those buttons are admin-only.
 *
 * Flows implemented:
 *   ASSISTANT TRIAGE  → assistant adds a note + optional flag, saves it.
 *   ADMIN ACCEPT      → review goes live (status = "accepted"), tagged.
 *   ADMIN DECLINE     → modal: Discard | Save to Data (+tag +optional note).
 *   OVERRIDE          → admin overrides assistant flag and accepts anyway.
 *
 * All data stays in verp_product_reviews.
 * Email notification to admin + assistant fires via /api/alert-staff (NEW_REVIEW).
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

const SERVER_URL      = import.meta.env.VITE_SERVER_URL      || "https://verp-server.onrender.com";
const INTERNAL_SECRET = import.meta.env.VITE_INTERNAL_SECRET || "";

/* ── design tokens ───────────────────────────────────────────── */
const T = {
  void:     "#080808",
  obsidian: "#0d0d0d",
  ember:    "#ec5b13",
  blue:     "#38bdf8",
  green:    "#22c55e",
  red:      "#ef4444",
  amber:    "#f59e0b",
  purple:   "#a78bfa",
  border:   "1px solid rgba(255,255,255,0.06)",
  sub:      "1px solid rgba(255,255,255,0.03)",
};

/* ── review tags ──────────────────────────────────────────────── */
const REVIEW_TAGS = [
  { id: "product_praise",     label: "Product Praise",     color: T.green  },
  { id: "product_quality",    label: "Product Quality",    color: T.amber  },
  { id: "delivery_issue",     label: "Delivery Issue",     color: T.blue   },
  { id: "pricing",            label: "Pricing",            color: T.purple },
  { id: "packaging",          label: "Packaging",          color: T.ember  },
  { id: "wrong_item",         label: "Wrong Item",         color: T.red    },
  { id: "aggressive_false",   label: "Aggressive / False", color: T.red    },
  { id: "spam",               label: "Spam",               color: "rgba(255,255,255,0.3)" },
  { id: "other",              label: "Other",              color: "rgba(255,255,255,0.5)" },
];

const tagMeta = (id) => REVIEW_TAGS.find((t) => t.id === id) || { label: id, color: "rgba(255,255,255,0.3)" };

/* ── star renderer ───────────────────────────────────────────── */
const Stars = ({ n }) => (
  <span style={{ color: T.ember, fontSize: 13, letterSpacing: 2 }}>
    {"★".repeat(n)}
    <span style={{ color: "rgba(255,255,255,0.12)" }}>{"★".repeat(5 - n)}</span>
  </span>
);

/* ── status pill ─────────────────────────────────────────────── */
const Pill = ({ label, color }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 9px",
      borderRadius: 99,
      background: `${color}18`,
      border: `1px solid ${color}45`,
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: 7,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color,
    }}
  >
    {label}
  </span>
);

/* ── decline modal ───────────────────────────────────────────── */
const DeclineModal = ({ review, onClose, onDone }) => {
  const [disposition, setDisposition] = useState(null);   // 'discard' | 'save_to_data'
  const [tag, setTag]                 = useState("");
  const [note, setNote]               = useState("");
  const [saving, setSaving]           = useState(false);

  const confirm = async () => {
    if (!disposition) return;
    setSaving(true);

    const update = {
      status:      "declined",
      disposition,
      reviewed_at: new Date().toISOString(),
    };
    if (disposition === "save_to_data") {
      update.tag        = tag || null;
      update.admin_note = note.trim() || null;
    }

    await supabase.from("verp_product_reviews").update(update).eq("id", review.id);
    onDone();
  };

  return (
    <>
      <style>{`@keyframes dm-in{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)", zIndex: 9100, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 20,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(480px,100%)",
            background: T.obsidian,
            border: `1px solid rgba(239,68,68,0.3)`,
            borderTop: `2px solid ${T.red}`,
            borderRadius: 20,
            padding: "28px 28px 24px",
            animation: "dm-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: T.red, marginBottom: 10 }}>
            Decline Review
          </p>
          <p style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
            What do you want to do with this review?
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 22, lineHeight: 1.55 }}>
            Even discarded reviews leave a footprint in analytics — nothing is truly invisible.
          </p>

          {/* disposition buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {[
              { id: "discard",      label: "🗑️  Discard",          sub: "Pure spam, nothing useful",     border: T.red    },
              { id: "save_to_data", label: "📊  Save to Data",      sub: "Has signal worth keeping",      border: T.blue   },
            ].map(({ id, label, sub, border }) => (
              <button
                key={id}
                onClick={() => setDisposition(id)}
                style={{
                  flex: 1,
                  padding: "14px 10px",
                  borderRadius: 14,
                  border: `1px solid ${disposition === id ? border : "rgba(255,255,255,0.08)"}`,
                  background: disposition === id ? `${border}12` : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 180ms",
                }}
              >
                <p style={{ color: disposition === id ? border : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{label}</p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, lineHeight: 1.4 }}>{sub}</p>
              </button>
            ))}
          </div>

          {/* tag + note — only when saving to data */}
          {disposition === "save_to_data" && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                Tag this review
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {REVIEW_TAGS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTag(t.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: `1px solid ${tag === t.id ? t.color : "rgba(255,255,255,0.08)"}`,
                      background: tag === t.id ? `${t.color}18` : "transparent",
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 7,
                      color: tag === t.id ? t.color : "rgba(255,255,255,0.35)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      transition: "all 150ms",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                placeholder="Optional note (e.g. 'mentions specific batch issue')..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  resize: "none",
                  outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  minHeight: 64,
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12,
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={!disposition || saving}
              style={{
                flex: 2, padding: "12px 0", borderRadius: 12,
                background: disposition ? T.red : "rgba(255,255,255,0.04)",
                border: "none",
                color: disposition ? "#000" : "rgba(255,255,255,0.2)",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: disposition ? "pointer" : "default",
                transition: "all 200ms", opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Confirm Decline"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── assistant note modal ────────────────────────────────────── */
const AssistantNoteModal = ({ review, onClose, onDone }) => {
  const [note, setNote]     = useState(review.assistant_note || "");
  const [flag, setFlag]     = useState(review.assistant_flag || null);
  const [reason, setReason] = useState(review.assistant_flag_reason || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("verp_product_reviews").update({
      assistant_note:        note.trim() || null,
      assistant_flag:        flag,
      assistant_flag_reason: flag ? reason.trim() || null : null,
    }).eq("id", review.id);
    onDone();
  };

  return (
    <>
      <style>{`@keyframes an-in{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)", zIndex: 9100, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 20,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(440px,100%)",
            background: T.obsidian,
            border: `1px solid rgba(56,189,248,0.2)`,
            borderTop: `2px solid ${T.blue}`,
            borderRadius: 20,
            padding: "28px 28px 24px",
            animation: "an-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: T.blue, marginBottom: 10 }}>
            Assistant Note
          </p>
          <p style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 18 }}>
            Add your triage note for admin
          </p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={400}
            placeholder="e.g. 'Genuine review, recommend accepting' or 'Contains aggressive language, recommend declining'..."
            style={{
              width: "100%",
              background: "rgba(56,189,248,0.04)",
              border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 12,
              padding: "11px 14px",
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              resize: "none",
              outline: "none",
              fontFamily: "'DM Sans',sans-serif",
              minHeight: 80,
              boxSizing: "border-box",
              marginBottom: 16,
            }}
          />

          {/* flag toggle */}
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Flag for admin attention?
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: flag ? 14 : 0 }}>
            {[
              { id: null,      label: "✅  No flag",     color: T.green },
              { id: "flagged", label: "🚨  Flag it",     color: T.red   },
            ].map(({ id, label, color }) => (
              <button
                key={String(id)}
                onClick={() => setFlag(id)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 12,
                  border: `1px solid ${flag === id ? color : "rgba(255,255,255,0.08)"}`,
                  background: flag === id ? `${color}14` : "transparent",
                  cursor: "pointer",
                  color: flag === id ? color : "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 11, fontWeight: 700,
                  transition: "all 180ms",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {flag === "flagged" && (
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              placeholder="Brief reason for flagging (optional)..."
              style={{
                width: "100%",
                marginTop: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                outline: "none",
                fontFamily: "'DM Sans',sans-serif",
                boxSizing: "border-box",
              }}
            />
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              style={{
                flex: 2, padding: "12px 0", borderRadius: 12,
                background: T.blue, border: "none",
                color: "#000", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: "pointer", opacity: saving ? 0.6 : 1,
                transition: "all 200ms",
              }}
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── review card ─────────────────────────────────────────────── */
const ReviewCard = ({ review, role, onRefresh }) => {
  const [showDeclineModal,   setShowDeclineModal]   = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [accepting, setAccepting]                   = useState(false);

  const isFlagged  = review.assistant_flag === "flagged";
  const isPending  = review.status === "pending";
  const isAccepted = review.status === "accepted";
  const isDeclined = review.status === "declined";

  /* tag chip */
  const tm = review.tag ? tagMeta(review.tag) : null;

  /* status color */
  const statusColor = isAccepted ? T.green : isDeclined ? T.red : T.amber;

  const accept = async () => {
    setAccepting(true);
    await supabase.from("verp_product_reviews").update({
      status:      "accepted",
      reviewed_at: new Date().toISOString(),
    }).eq("id", review.id);
    onRefresh();
    setAccepting(false);
  };

  return (
    <>
      <div
        style={{
          background: T.obsidian,
          border: isFlagged && isPending
            ? `1px solid rgba(239,68,68,0.35)`
            : T.border,
          borderLeft: isFlagged && isPending
            ? `3px solid ${T.red}`
            : isAccepted
            ? `3px solid ${T.green}`
            : isDeclined
            ? `3px solid rgba(255,255,255,0.08)`
            : `3px solid ${T.amber}`,
          borderRadius: 16,
          padding: "18px 20px",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <Stars n={review.rating} />
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
              {review.product_name || "Product"}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <Pill label={review.status} color={statusColor} />
            {isFlagged && isPending && (
              <Pill label="⚠️ Flagged" color={T.red} />
            )}
            {tm && <Pill label={tm.label} color={tm.color} />}
          </div>
        </div>

        {/* review text */}
        {review.review_text && (
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.65, marginBottom: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, borderLeft: "2px solid rgba(255,255,255,0.08)" }}>
            "{review.review_text}"
          </p>
        )}

        {/* assistant note */}
        {review.assistant_note && (
          <div style={{ marginBottom: 12, padding: "9px 13px", background: "rgba(56,189,248,0.05)", borderRadius: 10, border: "1px solid rgba(56,189,248,0.12)" }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: T.blue, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
              📝 Assistant Note
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>
              {review.assistant_note}
            </p>
            {review.assistant_flag_reason && (
              <p style={{ color: T.red, fontSize: 11, marginTop: 4 }}>
                Flag reason: {review.assistant_flag_reason}
              </p>
            )}
          </div>
        )}

        {/* admin note (declined reviews) */}
        {review.admin_note && (
          <div style={{ marginBottom: 12, padding: "9px 13px", background: "rgba(239,68,68,0.05)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.1)" }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: T.red, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
              Admin Note
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.5 }}>
              {review.admin_note}
            </p>
          </div>
        )}

        {/* meta row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>
            {review.customer_email} · {new Date(review.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
          </p>

          {/* action buttons */}
          <div style={{ display: "flex", gap: 7 }}>
            {/* assistant: add/edit note */}
            {role === "assistant" && (
              <button
                onClick={() => setShowAssistantModal(true)}
                style={{
                  padding: "6px 14px", borderRadius: 9,
                  background: "rgba(56,189,248,0.08)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  color: T.blue, fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {review.assistant_note ? "Edit Note" : "Add Note"}
              </button>
            )}

            {/* admin: accept / decline / override */}
            {role === "admin" && isPending && (
              <>
                {/* ── Gate: block until assistant has added a note ── */}
                {!review.assistant_note ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "6px 14px", borderRadius: 9,
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.18)",
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: T.amber,
                      animation: "ri-pulse 2s ease-in-out infinite",
                      flexShrink: 0,
                    }} />
                    <style>{`@keyframes ri-pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8, fontWeight: 700,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      color: T.amber,
                    }}>
                      Awaiting assistant note
                    </span>
                  </div>
                ) : (
                  <>
                    {isFlagged && (
                      <button
                        onClick={accept}
                        disabled={accepting}
                        style={{
                          padding: "6px 14px", borderRadius: 9,
                          background: "rgba(34,197,94,0.08)",
                          border: "1px solid rgba(34,197,94,0.25)",
                          color: T.green, fontSize: 9, fontWeight: 700,
                          letterSpacing: "0.15em", textTransform: "uppercase",
                          cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        Override & Accept
                      </button>
                    )}
                    {!isFlagged && (
                      <button
                        onClick={accept}
                        disabled={accepting}
                        style={{
                          padding: "6px 14px", borderRadius: 9,
                          background: "rgba(34,197,94,0.08)",
                          border: "1px solid rgba(34,197,94,0.25)",
                          color: T.green, fontSize: 9, fontWeight: 700,
                          letterSpacing: "0.15em", textTransform: "uppercase",
                          cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {accepting ? "..." : "✓ Accept"}
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeclineModal(true)}
                      style={{
                        padding: "6px 14px", borderRadius: 9,
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: T.red, fontSize: 9, fontWeight: 700,
                        letterSpacing: "0.15em", textTransform: "uppercase",
                        cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      ✕ Decline
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showDeclineModal && (
        <DeclineModal
          review={review}
          onClose={() => setShowDeclineModal(false)}
          onDone={() => { setShowDeclineModal(false); onRefresh(); }}
        />
      )}
      {showAssistantModal && (
        <AssistantNoteModal
          review={review}
          onClose={() => setShowAssistantModal(false)}
          onDone={() => { setShowAssistantModal(false); onRefresh(); }}
        />
      )}
    </>
  );
};

/* ── main component ──────────────────────────────────────────── */
const ReviewInbox = ({ role = "admin" }) => {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [filter, setFilter]         = useState("pending");

  const fetch_ = useCallback(async () => {
    setFetchError(null);
    let q = supabase
      .from("verp_product_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") q = q.eq("status", filter);

    const { data, error } = await q;
    if (error) {
      console.error("[ReviewInbox] fetch error:", error.message, error.code);
      setFetchError(error.message);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  }, [filter]);

  /* stable ref so the realtime callback always calls the latest fetch_ */
  const fetch_Ref = useRef(fetch_);
  useEffect(() => { fetch_Ref.current = fetch_; }, [fetch_]);

  useEffect(() => {
    setLoading(true);
    fetch_();
  }, [fetch_]);

  /* ── Realtime subscription — stable channel, never torn down on filter change ── */
  useEffect(() => {
    const channel = supabase
      .channel("verp_product_reviews_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verp_product_reviews" },
        () => { fetch_Ref.current(); }   // always calls latest fetch_
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // ← empty deps: channel created once, lives for component lifetime

  /* counts for tab badges */
  const [counts, setCounts] = useState({ pending: 0, accepted: 0, declined: 0 });
  useEffect(() => {
    const getCounts = async () => {
      const { data } = await supabase
        .from("verp_product_reviews")
        .select("status");
      if (data) {
        setCounts({
          pending:  data.filter((r) => r.status === "pending").length,
          accepted: data.filter((r) => r.status === "accepted").length,
          declined: data.filter((r) => r.status === "declined").length,
        });
      }
    };
    getCounts();
  }, [reviews]);

  const FILTERS = [
    { id: "pending",  label: "Pending",  color: T.amber },
    { id: "accepted", label: "Live",     color: T.green },
    { id: "declined", label: "Declined", color: T.red   },
    { id: "all",      label: "All",      color: T.blue  },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: T.void,
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* header */}
      <div
        style={{
          padding: "20px 24px 0",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 7,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)",
            marginBottom: 6,
          }}
        >
          {role === "admin" ? "Admin · Review Moderation" : "Assistant · Review Triage"}
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(18px,3vw,26px)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "white",
            marginBottom: 20,
          }}
        >
          Product <span style={{ color: T.ember }}>Reviews</span>
        </h2>

        {/* filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "7px 16px",
                borderRadius: 99,
                border: `1px solid ${filter === f.id ? f.color : "rgba(255,255,255,0.08)"}`,
                background: filter === f.id ? `${f.color}14` : "transparent",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: filter === f.id ? f.color : "rgba(255,255,255,0.3)",
                transition: "all 180ms",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {f.label}
              {f.id !== "all" && counts[f.id] > 0 && (
                <span
                  style={{
                    background: f.color,
                    color: "#000",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 7,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 99,
                  }}
                >
                  {counts[f.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${T.ember}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>⚠️</p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.red, marginBottom: 8 }}>
              Database Error
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", maxWidth: 320, margin: "0 auto 12px", lineHeight: 1.6 }}>
              {fetchError}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.18)", letterSpacing: "0.15em" }}>
              Check RLS policies — SELECT must be allowed on verp_product_reviews
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "rgba(255,255,255,0.15)" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" }}>
              No {filter === "all" ? "" : filter} reviews
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} role={role} onRefresh={fetch_} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewInbox;