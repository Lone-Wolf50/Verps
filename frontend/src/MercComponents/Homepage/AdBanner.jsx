

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useCart } from "../Cartoptions/CartContext";

/* ── session helpers ─────────────────────────────────────────── */
const SEEN_KEY = "vrp_seen_ads";
const getSeenSet = () => {
  try { return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]")); }
  catch { return new Set(); }
};
const markSeen = (id) => {
  try {
    const s = getSeenSet(); s.add(id);
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
  } catch { /* non-fatal */ }
};

/* ── countdown helpers ───────────────────────────────────────── */
const pad2 = (n) => String(n).padStart(2, "0");
const calcTimeLeft = (endsAt) => {
  if (!endsAt) return null;
  const diff = new Date(endsAt) - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hrs:  Math.floor((totalSec % 86400) / 3600),
    mins: Math.floor((totalSec % 3600) / 60),
    secs: totalSec % 60,
  };
};

/* ── auth helper ─────────────────────────────────────────────── */
const isLoggedIn = () => !!localStorage.getItem("userEmail");

/* ── how many reviews to show per product in the modal ──────── */
const REVIEWS_LIMIT = 3;   /* ← change this number to show more or fewer */


/* ══════════════════════════════════════════════════════════════
   LOGIN GATE MODAL
   Shown when a guest tries to open the product modal or add to cart.
══════════════════════════════════════════════════════════════ */
const LoginGate = ({ onClose, onLogin }) => {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 320);
  };

  return (
    <>
      <style>{`
        @keyframes gate-bd-in  { from{opacity:0} to{opacity:1} }
        @keyframes gate-bd-out { from{opacity:1} to{opacity:0} }
        @keyframes gate-up-in  { from{opacity:0;transform:translate(-50%,-46%) scale(0.96)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes gate-up-out { from{opacity:1;transform:translate(-50%,-50%) scale(1)} to{opacity:0;transform:translate(-50%,-46%) scale(0.96)} }
        @keyframes gate-mob-in  { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes gate-mob-out { from{transform:translateY(0)} to{transform:translateY(100%)} }
        @keyframes gate-shimmer { 0%{transform:translateX(-120%) skewX(-15deg)} 100%{transform:translateX(230%) skewX(-15deg)} }
        @media(min-width:480px){
          .gate-sheet {
            position:fixed !important;
            top:50% !important; left:50% !important;
            bottom:auto !important; right:auto !important;
            transform:translate(-50%,-50%) !important;
            width:min(420px,92vw) !important;
            border-radius:24px !important;
            animation:${closing ? "gate-up-out" : "gate-up-in"} 0.36s cubic-bezier(0.16,1,0.3,1) both !important;
          }
          .gate-drag { display:none !important; }
        }
        .gate-login-btn { transition:transform 200ms,box-shadow 200ms !important; }
        .gate-login-btn:hover { transform:translateY(-2px) !important; box-shadow:0 12px 36px rgba(212,175,53,0.38) !important; }
        .gate-close-x { transition:background 150ms,transform 150ms,border-color 150ms !important; }
        .gate-close-x:hover { background:rgba(212,175,53,0.1) !important; border-color:rgba(212,175,53,0.45) !important; transform:scale(1.08) !important; }
      `}</style>

      {/* backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(4,4,4,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 10000,
          animation: `${closing ? "gate-bd-out" : "gate-bd-in"} 0.28s ease both`,
        }}
      />

      {/* sheet */}
      <div
        className="gate-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 10100,
          background: "linear-gradient(160deg,#0e0c0a 0%,#080808 100%)",
          border: "1px solid rgba(212,175,53,0.2)",
          borderTop: "1px solid rgba(212,175,53,0.4)",
          borderRadius: "28px 28px 0 0",
          overflow: "hidden",
          fontFamily: "'DM Sans',sans-serif",
          animation: `${closing ? "gate-mob-out" : "gate-mob-in"} 0.38s cubic-bezier(0.16,1,0.3,1) both`,
          boxShadow: "0 -2px 50px rgba(212,175,53,0.1)",
        }}
      >
        {/* gold top line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(212,175,53,0.65) 30%,rgba(212,175,53,0.65) 70%,transparent)",
          pointerEvents: "none",
        }} />

        {/* drag handle — mobile */}
        <div className="gate-drag" style={{ display: "flex", justifyContent: "center", padding: "14px 0 2px" }}>
          <div style={{ width: 34, height: 4, borderRadius: 99, background: "rgba(212,175,53,0.22)" }} />
        </div>

        {/* close */}
        <button
          className="gate-close-x"
          onClick={handleClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer", color: "rgba(255,255,255,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, zIndex: 5,
          }}
        >✕</button>

        {/* content */}
        <div style={{ padding: "clamp(28px,5vw,40px) clamp(24px,5vw,36px) clamp(28px,5vw,36px)", textAlign: "center" }}>

          {/* icon */}
          <div style={{
            width: 58, height: 58, borderRadius: "50%",
            background: "rgba(212,175,53,0.08)",
            border: "1px solid rgba(212,175,53,0.28)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#d4af35" }}>lock</span>
          </div>

          {/* heading */}
          <h3 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(20px,3vw,26px)",
            fontWeight: 700, color: "white",
            letterSpacing: "-0.02em", lineHeight: 1.15,
            marginBottom: 10,
          }}>
            Members Only
          </h3>

          {/* sub */}
          <p style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 9, letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.7, marginBottom: 28,
          }}>
            Log in to view product details<br />and add items to your cart
          </p>

          {/* gold rule */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(212,175,53,0.25) 30%,rgba(212,175,53,0.25) 70%,transparent)",
            marginBottom: 24,
          }} />

          {/* login button */}
          <button
            className="gate-login-btn"
            onClick={onLogin}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 14,
              border: "1px solid rgba(212,175,53,0.5)",
              background: "linear-gradient(135deg,#d4af35 0%,#b8962e 50%,#c9a227 100%)",
              color: "#0a0a0a",
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 800, fontSize: 11,
              letterSpacing: "0.25em", textTransform: "uppercase",
              cursor: "pointer", position: "relative", overflow: "hidden",
              boxShadow: "0 4px 20px rgba(212,175,53,0.22)",
              marginBottom: 12,
            }}
          >
            <span style={{
              position: "absolute", top: 0, left: 0,
              width: "40%", height: "100%",
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
              animation: "gate-shimmer 2.8s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            Login to Continue
          </button>

          {/* signup link */}
          <p style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 8.5, letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}>
            No account?{" "}
            <span
              onClick={() => { handleClose(); setTimeout(() => onLogin("signup"), 350); }}
              style={{ color: "#d4af35", cursor: "pointer", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Join Verp
            </span>
          </p>
        </div>
      </div>
    </>
  );
};


/* ══════════════════════════════════════════════════════════════
   LUXURY PRODUCT MODAL
══════════════════════════════════════════════════════════════ */
const ProductModal = ({ product, onClose, onAddToCart, adEndsAt }) => {
  const [reviews,      setReviews]      = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [adding,       setAdding]       = useState(false);
  const [added,        setAdded]        = useState(false);
  const [imgLoaded,    setImgLoaded]    = useState(false);
  const [closing,      setClosing]      = useState(false);
  const [timeLeft,     setTimeLeft]     = useState(calcTimeLeft(adEndsAt));
  const [showGate,     setShowGate]     = useState(false);
  const navigate = useNavigate();

  /* lock body scroll */
  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [product]);

  /* fetch reviews + total count for this product */
  useEffect(() => {
    if (!product) return;

    /* fetch the display slice */
    supabase
      .from("verp_product_reviews")
      .select("rating, review_text, customer_email, created_at")
      .eq("status", "accepted")
      .ilike("product_name", product.name)
      .order("created_at", { ascending: false })
      .limit(REVIEWS_LIMIT)
      .then(({ data }) => setReviews(data || []));

    /* fetch total count separately */
    supabase
      .from("verp_product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .ilike("product_name", product.name)
      .then(({ count }) => setTotalReviews(count || 0));
  }, [product]);

  /* live countdown inside modal */
  useEffect(() => {
    if (!adEndsAt) return;
    const id = setInterval(() => {
      const t = calcTimeLeft(adEndsAt);
      setTimeLeft(t);
      if (!t) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [adEndsAt]);

  if (!product) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 380);
  };

  /* auth-gated add to cart */
  const handleAdd = () => {
    if (!isLoggedIn()) { setShowGate(true); return; }
    if (adding || added) return;
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => { setAdding(false); setAdded(true); }, 500);
    setTimeout(() => setAdded(false), 3000);
  };

  const goToLogin   = (dest = "login")  => { handleClose(); setTimeout(() => navigate(`/${dest}`), 400); };

  const timeUnits = timeLeft
    ? [
        ...(timeLeft.days > 0 ? [{ v: timeLeft.days, u: "Days" }] : []),
        { v: timeLeft.hrs,  u: "Hrs"  },
        { v: timeLeft.mins, u: "Min"  },
        { v: timeLeft.secs, u: "Sec"  },
      ]
    : [];

  return (
    <>
      <style>{`
        @keyframes lux-bd-in    { from{opacity:0}  to{opacity:1}  }
        @keyframes lux-bd-out   { from{opacity:1}  to{opacity:0}  }
        @keyframes lux-rise-in  {
          from { opacity:0; transform:translate(-50%,-47%) scale(0.96); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1);    }
        }
        @keyframes lux-rise-out {
          from { opacity:1; transform:translate(-50%,-50%) scale(1);    }
          to   { opacity:0; transform:translate(-50%,-47%) scale(0.96); }
        }
        @keyframes lux-mob-in   { from{transform:translateY(100%)} to{transform:translateY(0)}   }
        @keyframes lux-mob-out  { from{transform:translateY(0)}    to{transform:translateY(100%)} }
        @keyframes lux-img-ken  { from{transform:scale(1.07)} to{transform:scale(1)} }
        @keyframes lux-shimmer  {
          0%   { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(230%)  skewX(-18deg); }
        }
        @keyframes lux-tick {
          0%,49%  { opacity:1; }
          50%,99% { opacity:0; }
        }
        @keyframes lux-gold-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,175,53,0); }
          50%     { box-shadow: 0 0 0 6px rgba(212,175,53,0.18); }
        }
        @keyframes lux-fade-up {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @media(min-width:768px){
          .lux-sheet {
            position:fixed !important;
            top:50% !important; left:50% !important;
            bottom:auto !important; right:auto !important;
            transform:translate(-50%,-50%) !important;
            width:min(940px,95vw) !important;
            max-height:92vh !important;
            border-radius:28px !important;
            animation:${closing ? "lux-rise-out" : "lux-rise-in"} 0.42s cubic-bezier(0.16,1,0.3,1) both !important;
          }
          .lux-layout  { flex-direction:row !important; }
          .lux-img-col { width:46% !important; min-height:560px !important; aspect-ratio:auto !important; flex-shrink:0 !important; }
          .lux-drag    { display:none !important; }
          .lux-mob-reviews-toggle { display:none !important; }
          .lux-reviews-body { display:flex !important; max-height:none !important; overflow:visible !important; }
        }
        @media(max-width:767px){
          .lux-img-col { aspect-ratio: 4/3 !important; max-height: 52vw !important; min-height: 100px !important; }
          .lux-reviews-body { overflow:hidden; transition: max-height 0.35s ease; }
        }
        .lux-close-x {
          transition: background 160ms, transform 160ms, border-color 160ms !important;
        }
        .lux-close-x:hover {
          background: rgba(212,175,53,0.12) !important;
          border-color: rgba(212,175,53,0.5) !important;
          transform: scale(1.08) !important;
        }
        .lux-cart-btn {
          transition: transform 220ms, box-shadow 220ms, background 220ms !important;
        }
        .lux-cart-btn:hover:not(:disabled) {
          transform: translateY(-3px) !important;
          box-shadow: 0 16px 44px rgba(212,175,53,0.35) !important;
        }
      `}</style>

      {/* backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(4,4,4,0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          zIndex: 9800,
          animation: `${closing ? "lux-bd-out" : "lux-bd-in"} 0.3s ease both`,
        }}
      />

      {/* modal sheet */}
      <div
        className="lux-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 9900,
          background: "linear-gradient(160deg,#0e0c0a 0%,#080808 100%)",
          border: "1px solid rgba(212,175,53,0.18)",
          borderTop: "1px solid rgba(212,175,53,0.35)",
          borderRadius: "32px 32px 0 0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "96svh",
          fontFamily: "'DM Sans',sans-serif",
          animation: `${closing ? "lux-mob-out" : "lux-mob-in"} 0.42s cubic-bezier(0.16,1,0.3,1) both`,
          boxShadow: "0 -2px 60px rgba(212,175,53,0.08), 0 -1px 0 rgba(212,175,53,0.15)",
        }}
      >
        {/* gold top-edge accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(212,175,53,0.6) 30%,rgba(212,175,53,0.6) 70%,transparent)",
          pointerEvents: "none", zIndex: 5,
        }} />

        {/* drag handle — mobile */}
        <div className="lux-drag" style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(212,175,53,0.25)" }} />
        </div>

        {/* close button */}
        <button
          className="lux-close-x"
          onClick={handleClose}
          style={{
            position: "absolute", top: 18, right: 18,
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer",
            color: "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 300,
            zIndex: 20,
          }}
        >
          ✕
        </button>

        {/* scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
          <div className="lux-layout" style={{ display: "flex", flexDirection: "column" }}>

            {/* ════ IMAGE COLUMN ════ */}
            <div
              className="lux-img-col"
              style={{
                width: "100%",
                aspectRatio: "1/1",
                position: "relative",
                overflow: "hidden",
                background: "#080808",
                flexShrink: 0,
              }}
            >
              {product.image_url ? (
                <>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    onLoad={() => setImgLoaded(true)}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                      opacity: imgLoaded ? 1 : 0,
                      transition: "opacity 600ms",
                      animation: imgLoaded ? "lux-img-ken 1.2s cubic-bezier(0.16,1,0.3,1) both" : "none",
                    }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom,rgba(8,8,8,0.12) 0%,transparent 35%,transparent 55%,rgba(8,8,8,0.72) 100%)",
                    pointerEvents: "none",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right,transparent 50%,rgba(8,8,8,0.55) 100%)",
                    pointerEvents: "none",
                  }} />
                </>
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(ellipse at center,#1a1508 0%,#080808 100%)",
                }}>
                  <span style={{ fontSize: 48, opacity: 0.15 }}>✦</span>
                </div>
              )}

              {/* category chip */}
              <div style={{
                position: "absolute", top: 18, left: 18,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(212,175,53,0.3)",
                padding: "5px 14px", borderRadius: 999,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 7.5, letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(212,175,53,0.85)",
                animation: "lux-fade-up 0.5s 0.3s both",
              }}>
                {product.category || "Verp Collection"}
              </div>

              {/* countdown badge on image — bottom RIGHT */}
              {timeLeft && timeUnits.length > 0 && (
                <div style={{
                  position: "absolute", bottom: 14, right: 14,
                  background: "rgba(0,0,0,0.68)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(212,175,53,0.32)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  animation: "lux-fade-up 0.5s 0.5s both",
                }}>
                  <p style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 6.5, letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(212,175,53,0.65)",
                    marginBottom: 5,
                  }}>
                    ⚡ Offer ends in
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                    {timeUnits.map(({ v, u }, i) => (
                      <React.Fragment key={u}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 18, fontWeight: 700,
                            color: "#d4af35", lineHeight: 1,
                            animation: u === "Sec" ? "lux-gold-pulse 1s ease infinite" : "none",
                          }}>
                            {pad2(v)}
                          </div>
                          <div style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 6, letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.3)",
                            marginTop: 2,
                          }}>
                            {u}
                          </div>
                        </div>
                        {i < timeUnits.length - 1 && (
                          <span style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 14, color: "rgba(212,175,53,0.4)",
                            paddingBottom: 10,
                            animation: "lux-tick 1s step-end infinite",
                          }}>:</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ════ DETAILS COLUMN ════ */}
            <div style={{
              flex: 1,
              padding: "clamp(24px,4vw,40px) clamp(22px,4vw,38px) clamp(28px,4vw,44px)",
              display: "flex", flexDirection: "column",
            }}>

              {/* provenance rule */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 18,
                animation: "lux-fade-up 0.45s 0.1s both",
              }}>
                <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(212,175,53,0.35),transparent)" }} />
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7, letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "rgba(212,175,53,0.5)",
                }}>
                  Verp Exclusive
                </span>
                <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg,transparent,rgba(212,175,53,0.35))" }} />
              </div>

              {/* product name */}
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(26px,4vw,38px)",
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: 14,
                animation: "lux-fade-up 0.45s 0.15s both",
              }}>
                {product.name}
              </h2>

              {/* star rating */}
              {avgRating && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 16,
                  animation: "lux-fade-up 0.45s 0.2s both",
                }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} style={{
                        fontSize: 13,
                        color: s <= Math.round(Number(avgRating)) ? "#d4af35" : "rgba(255,255,255,0.08)",
                      }}>★</span>
                    ))}
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 8.5, color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.12em",
                  }}>
                    {avgRating} · {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* price */}
              <div style={{ marginBottom: 18, animation: "lux-fade-up 0.45s 0.22s both" }}>
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 8, letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)",
                  display: "block", marginBottom: 4,
                }}>
                  Price
                </span>
                <p style={{
                  fontFamily: "'Playfair Display',serif",
                  fontStyle: "italic",
                  fontSize: "clamp(30px,5vw,44px)",
                  color: "#d4af35",
                  lineHeight: 1,
                  textShadow: "0 0 30px rgba(212,175,53,0.22)",
                }}>
                  GH₵ {Number(product.price).toLocaleString()}
                </p>
              </div>

              {/* gold rule */}
              <div style={{
                height: 1,
                background: "linear-gradient(90deg,rgba(212,175,53,0.3),rgba(212,175,53,0.05) 70%,transparent)",
                marginBottom: 18,
                animation: "lux-fade-up 0.45s 0.25s both",
              }} />

              {/* description */}
              {product.description && (
                <p style={{
                  fontSize: "clamp(12px,1.5vw,13.5px)",
                  color: "rgba(255,255,255,0.42)",
                  lineHeight: 1.8,
                  marginBottom: 24,
                  paddingLeft: 14,
                  borderLeft: "2px solid rgba(212,175,53,0.25)",
                  animation: "lux-fade-up 0.45s 0.28s both",
                }}>
                  {product.description}
                </p>
              )}

              {/* add to cart — taps auth gate if not logged in */}
              <button
                className="lux-cart-btn"
                onClick={handleAdd}
                disabled={adding}
                style={{
                  width: "100%",
                  padding: "17px 0",
                  borderRadius: 16,
                  border: added
                    ? "1px solid rgba(34,197,94,0.4)"
                    : "1px solid rgba(212,175,53,0.5)",
                  cursor: adding ? "default" : "pointer",
                  background: added
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : adding
                      ? "rgba(212,175,53,0.08)"
                      : "linear-gradient(135deg,#d4af35 0%,#b8962e 50%,#c9a227 100%)",
                  color: added ? "#fff" : adding ? "rgba(212,175,53,0.5)" : "#0a0a0a",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  position: "relative",
                  overflow: "hidden",
                  transition: "background 300ms, border-color 300ms, color 300ms",
                  marginBottom: 10,
                  animation: "lux-fade-up 0.45s 0.32s both",
                }}
              >
                {!added && !adding && (
                  <span style={{
                    position: "absolute", top: 0, left: 0,
                    width: "40%", height: "100%",
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
                    animation: "lux-shimmer 3s ease-in-out infinite",
                    pointerEvents: "none",
                  }} />
                )}
                {added ? "✓  Added to Cart" : adding ? "Adding…" : isLoggedIn() ? "Add to Cart" : "Login to Add to Cart"}
              </button>

              {/* flash-sale urgency nudge */}
              {timeLeft && (
                <p style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 8, letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(212,175,53,0.4)",
                  textAlign: "center",
                  marginBottom: 20,
                  animation: "lux-fade-up 0.45s 0.35s both",
                }}>
                  ⚡ Flash sale price — limited time only
                </p>
              )}

              {/* ── reviews section ── */}
              {totalReviews > 0 ? (
                <div style={{ animation: "lux-fade-up 0.45s 0.4s both" }}>
                  {/* header with count */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 7, letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.18)",
                      }}>
                        Client Reviews
                      </span>
                      {/* total count badge */}
                      <span style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 7, fontWeight: 700,
                        padding: "2px 7px", borderRadius: 999,
                        background: "rgba(212,175,53,0.1)",
                        border: "1px solid rgba(212,175,53,0.28)",
                        color: "#d4af35",
                        letterSpacing: "0.1em",
                      }}>
                        {totalReviews}
                      </span>
                    </div>
                    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
                  </div>

                  {/* review cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {reviews.map((r, i) => (
                      <div key={i} style={{
                        padding: "13px 16px",
                        background: "rgba(212,175,53,0.03)",
                        border: "1px solid rgba(212,175,53,0.1)",
                        borderRadius: 12,
                        borderLeft: "2px solid rgba(212,175,53,0.3)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ display: "flex", gap: 3 }}>
                            {[1,2,3,4,5].map((s) => (
                              <span key={s} style={{
                                fontSize: 11,
                                color: s <= r.rating ? "#d4af35" : "rgba(255,255,255,0.07)",
                              }}>★</span>
                            ))}
                          </div>
                          <span style={{
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 7, color: "rgba(255,255,255,0.15)",
                          }}>
                            {r.customer_email?.split("@")[0].slice(0, 3)}***
                          </span>
                        </div>
                        {r.review_text && (
                          <p style={{
                            fontSize: 12, color: "rgba(255,255,255,0.42)",
                            lineHeight: 1.65, fontStyle: "italic",
                          }}>
                            "{r.review_text}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* "showing X of Y" hint when there are more */}
                  {totalReviews > REVIEWS_LIMIT && (
                    <p style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 7.5, letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.18)",
                      textAlign: "center",
                      marginTop: 10,
                    }}>
                      Showing {REVIEWS_LIMIT} of {totalReviews} reviews
                    </p>
                  )}
                </div>
              ) : (
                /* no reviews yet */
                <div style={{
                  textAlign: "center",
                  padding: "18px 0 4px",
                  animation: "lux-fade-up 0.45s 0.4s both",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 7, letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.18)",
                    }}>
                      Client Reviews
                    </span>
                    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
                  </div>
                  <p style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 8, letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.2)",
                  }}>
                    No reviews yet — be the first
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* login gate — rendered on top of the product modal */}
      {showGate && (
        <LoginGate
          onClose={() => setShowGate(false)}
          onLogin={goToLogin}
        />
      )}
    </>
  );
};


/* ══════════════════════════════════════════════════════════════
   AD BANNER — luxury inline strip
══════════════════════════════════════════════════════════════ */
const AdBanner = ({ position }) => {
  const [ad,              setAd]        = useState(null);
  const [visible,         setVisible]   = useState(false);
  const [exiting,         setExiting]   = useState(false);
  const [featuredProduct, setFeatured]  = useState(null);
  const [modalOpen,       setModalOpen] = useState(false);
  const [hovered,         setHovered]   = useState(false);
  const [timeLeft,        setTimeLeft]  = useState(null);
  const [showGate,        setShowGate]  = useState(false);
  const hasFetched = useRef(false);
  const navigate   = useNavigate();
  const { addToCart } = useCart();

  /* fetch ad */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const now = new Date().toISOString();
    supabase
      .from("verp_ads")
      .select("*, featured_product:featured_product_id(*)")
      .eq("position", position)
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("priority", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!data?.length) return;
        const seen = getSeenSet();
        const pick = data.find((a) => !seen.has(a.id));
        if (pick) {
          setAd(pick);
          if (pick.featured_product) setFeatured(pick.featured_product);
          setTimeLeft(calcTimeLeft(pick.ends_at));
          setTimeout(() => setVisible(true), 400);
        }
      });
  }, [position]);

  /* live countdown — auto-dismiss when it hits zero */
  useEffect(() => {
    if (!ad?.ends_at) return;
    const id = setInterval(() => {
      const t = calcTimeLeft(ad.ends_at);
      setTimeLeft(t);
      if (!t) {
        /* timer expired → gracefully dismiss the banner */
        clearInterval(id);
        setExiting(true);
        setTimeout(() => setVisible(false), 440);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [ad]);

  const dismiss = () => {
    if (!ad) return;
    markSeen(ad.id);
    setExiting(true);
    setTimeout(() => setVisible(false), 440);
  };

  /* auth-gated CTA */
  const handleCTA = () => {
    if (!isLoggedIn()) {
      setShowGate(true);
      return;
    }
    if (featuredProduct) {
      setModalOpen(true);
    } else {
      markSeen(ad.id);
      navigate(ad.cta_url || "/categories");
    }
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, image: product.image_url });
  };

  const goToLogin = (dest = "login") => {
    setShowGate(false);
    navigate(`/${dest}`);
  };

  if (!visible || !ad) return null;

  /* banner countdown units */
  const bannerUnits = timeLeft
    ? [
        ...(timeLeft.days > 0 ? [{ v: timeLeft.days, u: "d" }] : []),
        { v: timeLeft.hrs,  u: "h" },
        { v: timeLeft.mins, u: "m" },
        { v: timeLeft.secs, u: "s" },
      ]
    : [];

  return (
    <>
      <style>{`
        @keyframes ab-in {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes ab-out {
          from { opacity:1; transform:scaleY(1);    max-height:260px; }
          to   { opacity:0; transform:scaleY(0.92); max-height:0;     }
        }
        @keyframes ab-gold-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,175,53,0.3); }
          50%     { box-shadow: 0 0 0 7px rgba(212,175,53,0); }
        }
        @keyframes ab-shine {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(350%)  skewX(-15deg); }
        }
        @keyframes ab-flash-blink {
          0%,100% { opacity:1;   }
          50%     { opacity:0.7; }
        }
        @keyframes ab-digit-glow {
          0%,100% { text-shadow:none; }
          50%     { text-shadow:0 0 12px rgba(212,175,53,0.6); }
        }
        .ab-cta-btn {
          transition: background 180ms, transform 210ms, box-shadow 210ms !important;
        }
        .ab-cta-btn:hover {
          background: linear-gradient(135deg,#c9a227,#a8871f) !important;
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 10px 28px rgba(212,175,53,0.4) !important;
        }
        .ab-dismiss {
          transition: background 150ms, color 150ms, transform 150ms !important;
        }
        .ab-dismiss:hover {
          background: rgba(255,255,255,0.1) !important;
          color: white !important;
          transform: scale(1.1) !important;
        }
      `}</style>

      <section
        style={{
          padding: "14px 20px",
          maxWidth: 1300,
          margin: "0 auto",
          animation: exiting
            ? "ab-out 0.44s cubic-bezier(0.16,1,0.3,1) both"
            : "ab-in 0.55s cubic-bezier(0.16,1,0.3,1) both",
          overflow: "hidden",
        }}
      >
        {/* ════ Flash Sale identity strip ════ */}
        {bannerUnits.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px 16px",
            padding: "9px 20px",
            background: "linear-gradient(90deg,rgba(212,175,53,0.1) 0%,rgba(212,175,53,0.04) 60%,transparent 100%)",
            border: "1px solid rgba(212,175,53,0.22)",
            borderBottom: "none",
            borderRadius: "16px 16px 0 0",
          }}>
            {/* Flash Sale pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 14px",
                background: "rgba(212,175,53,0.1)",
                border: "1px solid rgba(212,175,53,0.38)",
                borderRadius: 999,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 9, letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#d4af35",
                fontWeight: 700,
                animation: "ab-flash-blink 2.4s ease infinite",
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#d4af35",
                  display: "inline-block", flexShrink: 0,
                  animation: "ab-gold-pulse 2s ease infinite",
                }} />
                ⚡ Flash Sale
              </span>
            </div>

            {/* Live countdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10, letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}>
                Ends in
              </span>

              {bannerUnits.map(({ v, u }, i) => (
                <React.Fragment key={u}>
                  <div style={{
                    display: "inline-flex", flexDirection: "column", alignItems: "center",
                    background: "rgba(212,175,53,0.08)",
                    border: "1px solid rgba(212,175,53,0.25)",
                    borderRadius: 7,
                    padding: "5px 11px",
                    minWidth: 38,
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 18, fontWeight: 700,
                      color: "#d4af35", lineHeight: 1.05,
                      letterSpacing: "0.04em",
                      animation: u === "s" ? "ab-digit-glow 1s ease infinite" : "none",
                    }}>
                      {pad2(v)}
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 8, letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 2,
                    }}>
                      {u}
                    </span>
                  </div>
                  {i < bannerUnits.length - 1 && (
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 14, color: "rgba(212,175,53,0.4)",
                    }}>:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ════ Main banner card ════ */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: "relative",
            borderRadius: bannerUnits.length > 0 ? "0 0 20px 20px" : 20,
            overflow: "hidden",
            background: "#0d0d0d",
            border: `1px solid rgba(212,175,53,${hovered ? "0.35" : "0.16"})`,
            borderTop: bannerUnits.length > 0 ? "none" : undefined,
            transition: "border-color 300ms, box-shadow 300ms",
            boxShadow: hovered
              ? "0 0 0 1px rgba(212,175,53,0.1), 0 24px 64px rgba(0,0,0,0.65)"
              : "0 8px 36px rgba(0,0,0,0.45)",
            cursor: "pointer",
          }}
          onClick={handleCTA}
        >
          {/* background image */}
          {ad.image_url && (
            <>
              <img src={ad.image_url} alt="" style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                opacity: hovered ? 0.55 : 0.40,
                transition: "opacity 300ms",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg,rgba(8,8,8,0.97) 0%,rgba(8,8,8,0.75) 50%,rgba(8,8,8,0.3) 100%)",
              }} />
            </>
          )}

          {/* featured product peek — more visible */}
          {featuredProduct?.image_url && (
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0,
              width: "clamp(100px,22%,200px)",
              overflow: "hidden",
            }}>
              <img src={featuredProduct.image_url} alt="" style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                opacity: hovered ? 0.75 : 0.55,
                transition: "opacity 300ms, transform 400ms",
                transform: hovered ? "scale(1.06)" : "scale(1)",
              }} />
              {/* softer fade — product still clearly visible */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg,#0d0d0d 0%,rgba(13,13,13,0.2) 35%,transparent 65%)",
              }} />
            </div>
          )}

          {/* gold top-border accent */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: 0, height: 2,
            background: "linear-gradient(90deg,#d4af35,rgba(212,175,53,0.2) 65%,transparent)",
          }} />

          {/* gold left bar */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: "linear-gradient(to bottom,#d4af35,rgba(212,175,53,0.35))",
          }} />

          {/* content */}
          <div style={{
            position: "relative",
            padding: "clamp(18px,3vw,28px) clamp(18px,3vw,32px)",
            paddingLeft: "clamp(20px,3vw,34px)",
            paddingRight: featuredProduct?.image_url
              ? "clamp(100px,22%,185px)"
              : "clamp(50px,6%,72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            minHeight: 110,
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 7, letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "rgba(212,175,53,0.65)",
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#d4af35",
                    display: "inline-block", flexShrink: 0,
                    animation: "ab-gold-pulse 2s ease infinite",
                  }} />
                  {bannerUnits.length > 0 ? "Limited Offer" : "Exclusive Offer"}
                </span>
              </div>

              <h3 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(18px,2.8vw,27px)",
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.015em",
                lineHeight: 1.15,
                marginBottom: ad.subtitle ? 7 : 0,
              }}>
                {ad.title}
              </h3>

              {ad.subtitle && (
                <p style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "clamp(11px,1.4vw,13px)",
                  color: "rgba(255,255,255,0.42)",
                  lineHeight: 1.65,
                  maxWidth: 420,
                  marginTop: 5,
                }}>
                  {ad.subtitle}
                </p>
              )}
            </div>

            {/* CTA — gold */}
            <button
              className="ab-cta-btn"
              onClick={(e) => { e.stopPropagation(); handleCTA(); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                padding: "13px 28px",
                background: "linear-gradient(135deg,#d4af35 0%,#b8962e 100%)",
                color: "#0a0a0a",
                border: "none", borderRadius: 12,
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 800, fontSize: 10,
                letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                position: "relative", overflow: "hidden",
                boxShadow: "0 4px 20px rgba(212,175,53,0.28)",
              }}
            >
              <span style={{
                position: "absolute", top: 0, left: 0,
                width: "35%", height: "100%",
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)",
                animation: "ab-shine 2.8s ease-in-out infinite",
                pointerEvents: "none",
              }} />
              {ad.cta_label || "Shop Now"}
              <span className="material-symbols-outlined" style={{ fontSize: 15, fontWeight: 300 }}>
                {featuredProduct ? "open_in_new" : "arrow_forward"}
              </span>
            </button>
          </div>

          {/* dismiss × */}
          <button
            className="ab-dismiss"
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            aria-label="Dismiss"
            style={{
              position: "absolute", top: 10, right: 12,
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 2,
            }}
          >
            ✕
          </button>
        </div>
      </section>

      {/* luxury product modal */}
      {modalOpen && (
        <ProductModal
          product={featuredProduct}
          onClose={() => setModalOpen(false)}
          onAddToCart={handleAddToCart}
          adEndsAt={ad.ends_at}
        />
      )}

      {/* banner-level login gate (for ads without a featured product) */}
      {showGate && (
        <LoginGate
          onClose={() => setShowGate(false)}
          onLogin={goToLogin}
        />
      )}
    </>
  );
};

export default AdBanner;