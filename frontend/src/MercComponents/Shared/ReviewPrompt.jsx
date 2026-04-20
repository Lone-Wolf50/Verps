/**
 * ReviewPrompt.jsx
 *
 * Drop this inside your client-facing layout (e.g. Homepage or a global wrapper).
 * It quietly checks if the logged-in user has a delivered order with no review yet.
 * If yes, it floats a non-intrusive bottom prompt on their NEXT visit after delivery.
 *
 * Supabase table required:
 *   verp_product_reviews (
 *     id            uuid primary key default gen_random_uuid(),
 *     order_id      uuid references verp_orders(id),
 *     product_id    uuid references verp_products(id),
 *     user_email    text not null,
 *     product_name  text,
 *     rating        int check (rating between 1 and 5),
 *     review_text   text,
 *     status        text default 'pending',   -- pending | accepted | declined
 *     disposition   text,                     -- null | 'discard' | 'save_to_data'
 *     tag           text,
 *     admin_note    text,
 *     assistant_note text,
 *     assistant_flag text,                    -- null | 'flagged'
 *     assistant_flag_reason text,
 *     created_at    timestamptz default now(),
 *     reviewed_at   timestamptz
 *   )
 *
 * No loops: we fetch once on mount, show at most ONE prompt at a time.
 */

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://verp-server.onrender.com";
const INTERNAL_SECRET = import.meta.env.VITE_INTERNAL_SECRET || "";

/* ── helpers ─────────────────────────────────────────────────── */
const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const StarRow = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        onClick={() => onChange(s)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 26,
          color: s <= value ? "#ec5b13" : "rgba(255,255,255,0.15)",
          transition: "color 150ms, transform 150ms",
          transform: s <= value ? "scale(1.15)" : "scale(1)",
          padding: 0,
          lineHeight: 1,
        }}
      >
        ★
      </button>
    ))}
    {value > 0 && (
      <span
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 9,
          color: "#ec5b13",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          alignSelf: "center",
          marginLeft: 4,
        }}
      >
        {STAR_LABELS[value]}
      </span>
    )}
  </div>
);

/* ── session helpers — survive remounts, reset on tab close ─── */
const SESSION_KEY = "vrp_reviewed_orders"; // set of order IDs already reviewed
const SHOWN_KEY   = "vrp_prompt_shown";    // order ID currently shown this session

const getReviewedSet = () => {
  try { return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]")); }
  catch { return new Set(); }
};
const addReviewed = (orderId) => {
  try {
    const s = getReviewedSet();
    s.add(orderId);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...s]));
  } catch { /* non-fatal */ }
};
const getShownOrderId = () => {
  try { return sessionStorage.getItem(SHOWN_KEY) || null; }
  catch { return null; }
};
const setShownOrderId = (id) => {
  try { if (id) sessionStorage.setItem(SHOWN_KEY, id); else sessionStorage.removeItem(SHOWN_KEY); }
  catch { /* non-fatal */ }
};

/* ── main component ──────────────────────────────────────────── */
const ReviewPrompt = ({ userEmail }) => {
  const [pendingOrder, setPendingOrder] = useState(null);
  const [visible, setVisible]           = useState(false);
  const [rating, setRating]             = useState(0);
  const [text, setText]                 = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [done, setDone]                 = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!userEmail || hasFetched.current) return;
    hasFetched.current = true;

    const check = async () => {
      /* 1. find delivered orders for this user */
      const { data: orders, error: oErr } = await supabase
        .from("verp_orders")
        .select("id, order_number, items, delivered_at")
        .eq("customer_email", userEmail.toLowerCase())
        .eq("status", "delivered")
        .not("delivered_at", "is", null)
        .order("delivered_at", { ascending: false })
        .limit(10);

      if (oErr || !orders?.length) return;

      /* 2. which ones already have a review in the DB */
      const orderIds = orders.map((o) => o.id);
      const { data: existing } = await supabase
        .from("verp_product_reviews")
        .select("order_id")
        .eq("customer_email", userEmail.toLowerCase())
        .in("order_id", orderIds);

      /* also exclude any dismissed/reviewed this session */
      const reviewedInDB      = new Set((existing || []).map((r) => r.order_id));
      const reviewedThisSession = getReviewedSet();
      const allReviewed = new Set([...reviewedInDB, ...reviewedThisSession]);

      /* 3. pick the first genuinely unreviewed one */
      const unreviewed = orders.find((o) => !allReviewed.has(o.id));
      if (!unreviewed) return;

      /* if this same order was already shown this session, skip — user dismissed it */
      if (getShownOrderId() === unreviewed.id) return;

      const items = unreviewed.items || [];
      const displayName = items.length === 1
        ? items[0].name
        : items.length > 1
        ? `${items[0].name} + ${items.length - 1} more`
        : `Order ${unreviewed.order_number || unreviewed.id?.slice(0, 8)}`;

      const storedProductName = items.length > 0
        ? items[0].name
        : `Order ${unreviewed.order_number || unreviewed.id?.slice(0, 8)}`;

      /* mark as shown so remounts don't re-trigger it */
      setShownOrderId(unreviewed.id);

      setPendingOrder({
        id:               unreviewed.id,
        order_number:     unreviewed.order_number,
        productName:      displayName,
        storedProductName,
        items,
      });
      setTimeout(() => setVisible(true), 2200);
    };

    check();
  }, [userEmail]);

  const dismiss = () => {
    /* mark as shown this session so it won't reappear until next login */
    if (pendingOrder) setShownOrderId(pendingOrder.id);
    setVisible(false);
  };

  const submit = async () => {
    if (!rating || !pendingOrder) return;
    setSubmitting(true);

    /* basic keyword flag check (lightweight, no AI) */
    const deliveryWords = ["late", "slow", "delay", "took long", "didn't arrive", "not delivered"];
    const flag = deliveryWords.some((w) => text.toLowerCase().includes(w))
      ? "flagged"
      : null;
    const flagReason = flag ? "Possible delivery complaint detected" : null;

    const { error } = await supabase.from("verp_product_reviews").insert([
      {
        order_id:              pendingOrder.id,
        customer_email:        userEmail.toLowerCase(),
        product_name:          pendingOrder.storedProductName, // exact product name for matching
        rating,
        review_text:           text.trim() || null,
        status:                "pending",
        assistant_flag:        flag,
        assistant_flag_reason: flagReason,
      },
    ]);

    if (!error) {
      /* mark this order as fully reviewed — won't prompt again this session
         and DB check will prevent it on future sessions */
      addReviewed(pendingOrder.id);
      setShownOrderId(null); // clear shown tracker

      /* notify staff — fire-and-forget, non-fatal */
      try {
        await fetch(`${SERVER_URL}/api/alert-staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": INTERNAL_SECRET,
          },
          body: JSON.stringify({
            type:        "NEW_REVIEW",
            clientId:    userEmail,
            note:        `${rating}★ for "${pendingOrder.storedProductName}"${flag ? " — ⚠️ flagged" : ""}`,
            orderNumber: pendingOrder.order_number || pendingOrder.id,
          }),
        });
      } catch (_) { /* non-fatal */ }

      setDone(true);
      setTimeout(() => setVisible(false), 2600);
    }

    setSubmitting(false);
  };

  if (!visible || !pendingOrder) return null;

  return (
    <>
      <style>{`
        @keyframes rp-floatUp {
          from { opacity:0; transform:translateX(-50%) translateY(20px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0);    }
        }
      `}</style>

      {/* Single floating card — same on mobile and desktop */}
      <div
        style={{
          position:  "fixed",
          bottom:    24,
          left:      "50%",
          transform: "translateX(-50%)",
          width:     "min(400px, calc(100vw - 32px))",
          zIndex:    9000,
          animation: "rp-floatUp 0.45s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div
          style={{
            background:   "var(--bg-panel)",
            border:       "1px solid rgba(236,91,19,0.2)",
            borderTop:    "2px solid #ec5b13",
            borderRadius: 20,
            padding:      "20px 22px",
            boxShadow:    "0 20px 80px rgba(0,0,0,0.85), 0 0 0 1px var(--overlay-3)",
            fontFamily:   "'DM Sans',sans-serif",
          }}
        >
          {done ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
              <p style={{ color: "#ec5b13", fontWeight: 700, fontSize: 14 }}>Thank you!</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>
                Your review has been submitted.
              </p>
            </div>
          ) : (
            <>
              {/* header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "#ec5b13",
                      marginBottom: 5,
                    }}
                  >
                    Quick Review
                  </p>
                  <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                    How was your{" "}
                    <span style={{ color: "#ec5b13" }}>{pendingOrder.productName}</span>?
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 18,
                    lineHeight: 1,
                    padding: 2,
                    marginTop: -2,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* stars */}
              <StarRow value={rating} onChange={setRating} />

              {/* text */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={400}
                placeholder="Tell us more (optional)..."
                style={{
                  width: "100%",
                  marginTop: 14,
                  background: "var(--overlay-2)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 16, /* 16px prevents iOS zoom on focus on all devices */
                  resize: "none",
                  outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  lineHeight: 1.55,
                  minHeight: 72,
                  boxSizing: "border-box",
                }}
              />

              {/* submit */}
              <button
                onClick={submit}
                disabled={!rating || submitting}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "12px 0",
                  background: rating ? "#ec5b13" : "var(--overlay-4)",
                  border: "none",
                  borderRadius: 12,
                  color: rating ? "#000" : "rgba(255,255,255,0.2)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: rating ? "pointer" : "default",
                  transition: "all 200ms",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  marginTop: 10,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7,
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.12)",
                  textTransform: "uppercase",
                }}
              >
                Takes 30 seconds · Helps us improve
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewPrompt;