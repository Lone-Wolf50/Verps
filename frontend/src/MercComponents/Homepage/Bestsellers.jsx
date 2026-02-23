import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { useCart } from "../Cartoptions/CartContext";
import { ChevronRight, ChevronLeft } from "lucide-react";

/* ─── constants ─────────────────────────────────────────────── */
const VISIBLE    = 4;
const POOL_SIZE  = 40;
const PAGE_COUNT = 3;          // 3 pages × 4 cards = 12 per slot
const SLOT_SIZE  = VISIBLE * PAGE_COUNT;
const PAGE_MS    = 20000;      // desktop: advance one page every 20s
const REFRESH_MS = 15000;      // mobile: new products every 15s
const FADE_MS    = 900;
const GAP        = 20;

const pickRandom = (arr, n, excludeIds = new Set()) => {
  const filtered = arr.filter(x => !excludeIds.has(x.id));
  const source   = filtered.length >= n ? filtered : arr;
  return [...source].sort(() => Math.random() - 0.5).slice(0, Math.min(n, source.length));
};

/* ═══════════════════════════════════════════════════════════════ */
const Bestsellers = () => {
  const [pool, setPool]         = useState([]);
  const [slotA, setSlotA]       = useState([]);
  const [slotB, setSlotB]       = useState([]);
  const [activeSlot, setActive] = useState("A");
  const [pageIdx, setPageIdx]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const [quickView, setQuickView] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [cardW, setCardW]       = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [mobileSlotA, setMobileSlotA] = useState([]);
  const [mobileSlotB, setMobileSlotB] = useState([]);
  const [mobileActive, setMobileActive] = useState("A");

  const trackRef     = useRef(null);
  // All mutable state timers read lives in refs — stale closure safe
  const poolRef      = useRef([]);
  const slotARef     = useRef([]);
  const slotBRef     = useRef([]);
  const activeRef    = useRef("A");
  const pageRef      = useRef(0);
  const mobileARef   = useRef([]);
  const mobileBRef   = useRef([]);
  const mobileActRef = useRef("A");
  const isMobileRef  = useRef(isMobile);

  const { addToCart } = useCart();

  /* ── keep refs in sync ── */
  useEffect(() => { poolRef.current      = pool;        }, [pool]);
  useEffect(() => { slotARef.current     = slotA;       }, [slotA]);
  useEffect(() => { slotBRef.current     = slotB;       }, [slotB]);
  useEffect(() => { activeRef.current    = activeSlot;  }, [activeSlot]);
  useEffect(() => { pageRef.current      = pageIdx;     }, [pageIdx]);
  useEffect(() => { mobileARef.current   = mobileSlotA; }, [mobileSlotA]);
  useEffect(() => { mobileBRef.current   = mobileSlotB; }, [mobileSlotB]);
  useEffect(() => { mobileActRef.current = mobileActive;}, [mobileActive]);
  useEffect(() => { isMobileRef.current  = isMobile;   }, [isMobile]);

  /* ── responsive ── */
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── measure card width ── */
  useEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      const w = trackRef.current?.offsetWidth ?? 0;
      if (w > 0) setCardW((w - GAP * (VISIBLE - 1)) / VISIBLE);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [loading, isMobile]);

  /* ── fetch & seed — write refs IMMEDIATELY so timers see data ── */
  useEffect(() => {
    const doFetch = async () => {
      const { data, error } = await supabase
        .from("verp_products")
        .select("id, name, price, image_url, category, description, series, origin")
        .limit(POOL_SIZE);

      if (!error && data?.length) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const a    = pickRandom(shuffled, SLOT_SIZE);
        const aIds = new Set(a.map(x => x.id));
        const b    = pickRandom(shuffled, SLOT_SIZE, aIds);
        const ma   = pickRandom(shuffled, 8);
        const maIds = new Set(ma.map(x => x.id));
        const mb   = pickRandom(shuffled, 8, maIds);

        // Write refs BEFORE setLoading(false) so the timer effects
        // that fire on loading change already have data
        poolRef.current    = shuffled;
        slotARef.current   = a;
        slotBRef.current   = b;
        mobileARef.current = ma;
        mobileBRef.current = mb;

        setPool(shuffled);
        setSlotA(a);
        setSlotB(b);
        setActive("A");
        setMobileSlotA(ma);
        setMobileSlotB(mb);
        setMobileActive("A");
      }
      setLoading(false);  // triggers timer effects below
    };
    doFetch();
  }, []);

  /* ─────────────────────────────────────────────────────────────
     DESKTOP TIMER — starts once loading flips to false.
     Every PAGE_MS: advance page → crossfade at end of slot.
     Reads only refs so closure is never stale.
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (loading) return;

    const tick = () => {
      if (isMobileRef.current) return;

      const nextPage = pageRef.current + 1;

      if (nextPage >= PAGE_COUNT) {
        // Swap to fresh slot
        const cur        = activeRef.current;
        const visible    = cur === "A" ? slotARef.current : slotBRef.current;
        const excludeIds = new Set(visible.map(x => x.id));
        const newSet     = pickRandom(poolRef.current, SLOT_SIZE, excludeIds);

        if (cur === "A") {
          slotBRef.current = newSet;
          setSlotB(newSet);
          setActive("B");
          activeRef.current = "B";
        } else {
          slotARef.current = newSet;
          setSlotA(newSet);
          setActive("A");
          activeRef.current = "A";
        }
        setPageIdx(0);
        pageRef.current = 0;
      } else {
        setPageIdx(nextPage);
        pageRef.current = nextPage;
      }
    };

    const id = setInterval(tick, PAGE_MS);
    return () => clearInterval(id);
  }, [loading]); // re-runs only once when loading → false

  /* ─────────────────────────────────────────────────────────────
     MOBILE TIMER — starts once loading flips to false.
     Every REFRESH_MS: crossfade to a fresh set of 8.
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (loading) return;

    const tick = () => {
      if (!isMobileRef.current) return;

      const cur        = mobileActRef.current;
      const visible    = cur === "A" ? mobileARef.current : mobileBRef.current;
      const excludeIds = new Set(visible.map(x => x.id));
      const newSet     = pickRandom(poolRef.current, 8, excludeIds);

      if (cur === "A") {
        mobileBRef.current = newSet;
        setMobileSlotB(newSet);
        setMobileActive("B");
        mobileActRef.current = "B";
      } else {
        mobileARef.current = newSet;
        setMobileSlotA(newSet);
        setMobileActive("A");
        mobileActRef.current = "A";
      }
    };

    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, [loading]);

  /* ── manual nav (desktop) ── */
  const go = useCallback((dir) => {
    const next = pageRef.current + dir;
    if (next < 0) return;

    if (next >= PAGE_COUNT) {
      const cur        = activeRef.current;
      const visible    = cur === "A" ? slotARef.current : slotBRef.current;
      const excludeIds = new Set(visible.map(x => x.id));
      const newSet     = pickRandom(poolRef.current, SLOT_SIZE, excludeIds);

      if (cur === "A") {
        slotBRef.current = newSet;
        setSlotB(newSet);
        setActive("B");
        activeRef.current = "B";
      } else {
        slotARef.current = newSet;
        setSlotA(newSet);
        setActive("A");
        activeRef.current = "A";
      }
      setPageIdx(0);
      pageRef.current = 0;
    } else {
      setPageIdx(next);
      pageRef.current = next;
    }
  }, []);

  /* ── cart ── */
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (window.__vaultAddToCartGuard && !window.__vaultAddToCartGuard()) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url, quantity: 1 });
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 1800);
  };

  const fmt = p => {
    if (!p) return null;
    const n = Number(p);
    return isNaN(n) ? p : `GH₵ ${n.toLocaleString()}`;
  };

  const pageOffset     = cardW > 0 ? pageIdx * (VISIBLE * (cardW + GAP)) : 0;
  const cardWidthStyle = cardW > 0 ? cardW : `calc(${100 / VISIBLE}% - ${(GAP * (VISIBLE - 1)) / VISIBLE}px)`;

  /* ══════════════════════════════════════════════════════════════
     PRODUCT CARD
  ══════════════════════════════════════════════════════════════ */
  const ProductCard = ({ product, widthStyle }) => {
    const isAdded = addedIds[product.id];
    return (
      <div
        className="bs-card"
        style={{ width: widthStyle, flexShrink: 0 }}
        onClick={() => setQuickView(product)}
      >
        <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
          <img
            src={product.image_url}
            alt={product.name}
            className="bs-img"
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 3 }}>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 7, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)",
              padding: "3px 9px", borderRadius: 999,
            }}>
              {product.category || "Collection"}
            </span>
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(5,5,5,0.88) 0%,rgba(5,5,5,0.1) 52%,transparent 100%)", zIndex: 1 }} />
          <div className="bs-overlay" style={{ zIndex: 2 }}>
            <button
              className="bs-btn-primary"
              onClick={e => { e.stopPropagation(); handleAddToCart(product, e); }}
              style={{ background: isAdded ? "#22c55e" : "#ec5b13" }}
            >
              {isAdded ? "✓ Added" : "Add to Cart"}
            </button>
            <button
              className="bs-btn-ghost"
              onClick={e => { e.stopPropagation(); setQuickView(product); }}
            >
              Quick View
            </button>
          </div>
        </div>
        <div style={{ padding: "14px 16px 18px" }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.24)", marginBottom: 6 }}>
            {product.series || product.category || "Collection"}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {product.name}
            </h4>
            {fmt(product.price) && (
              <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 15, color: "#ec5b13", flexShrink: 0 }}>
                {fmt(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════
     SKELETON
  ══════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <section style={{ padding: "80px 0 60px", background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <style>{`@keyframes bsPulse{0%,100%{opacity:0.35}50%{opacity:0.8}}`}</style>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>
          <div style={{ display: "flex", gap: GAP }}>
            {[...Array(VISIBLE)].map((_, i) => (
              <div key={i} style={{ flex: 1, aspectRatio: "3/4", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", animation: `bsPulse 1.8s ${i * 0.18}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <section id="bestsellers" style={{ padding: "80px 0 100px", background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;700;800;900&display=swap');

        @keyframes bsFadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }

        .bs-card {
          position:relative; overflow:hidden; border-radius:20px;
          border:1px solid rgba(255,255,255,0.055); background:#090909;
          cursor:pointer;
          transition:border-color 0.4s ease, box-shadow 0.4s ease, transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .bs-card:hover {
          border-color:rgba(236,91,19,0.4);
          box-shadow:0 0 40px rgba(236,91,19,0.1), 0 24px 64px rgba(0,0,0,0.5);
          transform:translateY(-6px);
        }
        .bs-img {
          width:100%; height:100%; object-fit:cover;
          filter:grayscale(22%) brightness(0.9);
          transition:transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease;
        }
        .bs-card:hover .bs-img { transform:scale(1.08); filter:grayscale(0%) brightness(1); }

        .bs-overlay {
          position:absolute; inset:0; z-index:2;
          display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
          padding:16px; gap:8px;
          background:linear-gradient(to top,rgba(4,4,4,0.96) 0%,rgba(4,4,4,0.22) 55%,transparent 100%);
          opacity:0; transition:opacity 0.3s ease;
        }
        .bs-card:hover .bs-overlay { opacity:1; }

        .bs-btn-primary {
          width:100%; padding:11px 0; border:none; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:9px; font-weight:900;
          letter-spacing:0.16em; text-transform:uppercase; color:#000; cursor:pointer;
          transition:filter 0.2s ease;
        }
        .bs-btn-primary:hover { filter:brightness(1.12); }

        .bs-btn-ghost {
          width:100%; padding:9px 0;
          background:rgba(255,255,255,0.07); backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.13); border-radius:10px;
          font-family:'JetBrains Mono',monospace; font-size:8px;
          letter-spacing:0.15em; text-transform:uppercase;
          color:rgba(255,255,255,0.72); cursor:pointer;
          transition:background 0.2s ease, border-color 0.2s ease;
        }
        .bs-btn-ghost:hover { background:rgba(255,255,255,0.13); border-color:rgba(255,255,255,0.2); }

        .bs-nav {
          position:absolute; top:50%; transform:translateY(-50%);
          width:46px; height:46px; border-radius:50%;
          background:rgba(8,8,8,0.92); border:1px solid rgba(255,255,255,0.1);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:rgba(255,255,255,0.5); backdrop-filter:blur(14px);
          transition:border-color 0.22s, color 0.22s, box-shadow 0.22s, transform 0.22s;
          z-index:20; box-shadow:0 6px 28px rgba(0,0,0,0.65);
        }
        .bs-nav:hover {
          border-color:#ec5b13; color:#ec5b13;
          box-shadow:0 6px 32px rgba(236,91,19,0.3);
          transform:translateY(-50%) scale(1.1);
        }
        .bs-nav:active { transform:translateY(-50%) scale(0.94); }
        .bs-nav:disabled { opacity:0.18; pointer-events:none; }

        .bs-dot {
          height:4px; border-radius:999px; border:none; cursor:pointer; padding:0;
          background:rgba(255,255,255,0.12);
          transition:width 0.32s cubic-bezier(0.25,0.46,0.45,0.94), background 0.3s ease;
        }
        .bs-dot.active { background:#ec5b13; }

        .qs-backdrop {
          position:fixed; inset:0; z-index:999;
          background:rgba(0,0,0,0.87); backdrop-filter:blur(16px);
          display:flex; align-items:center; justify-content:center; padding:16px;
          animation:bsFadeUp 0.2s ease both;
        }
        .qs-modal {
          background:#0c0c0c; border:1px solid rgba(255,255,255,0.07);
          border-radius:28px; max-width:580px; width:100%;
          overflow:hidden; overflow-y:auto; max-height:90vh;
          box-shadow:0 40px 100px rgba(0,0,0,0.85);
          animation:bsFadeUp 0.28s cubic-bezier(0.16,1,0.3,1) both;
        }
        .qs-inner { display:flex; }
        @media(max-width:540px){
          .qs-inner { flex-direction:column !important; }
          .qs-img { width:100% !important; min-width:unset !important; height:220px !important; }
        }

        .bs-mobile-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .bs-spin { animation:spinSlow 10s linear infinite; display:inline-block; }

        /* crossfade slot — both slots are absolutely stacked */
        .bs-slot {
          position:absolute; inset:0;
          transition:opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1);
          will-change:opacity;
        }
      `}</style>

      {/* ── Quick View Modal ── */}
      {quickView && (
        <div className="qs-backdrop" onClick={() => setQuickView(null)}>
          <div className="qs-modal" onClick={e => e.stopPropagation()}>
            <div className="qs-inner">
              <div className="qs-img" style={{ width: 220, minWidth: 220, position: "relative", flexShrink: 0, overflow: "hidden" }}>
                <img src={quickView.image_url} alt={quickView.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,transparent 55%,#0c0c0c 100%)" }} />
              </div>
              <div style={{ flex: 1, padding: "36px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
                    {quickView.category || "Collection"}{quickView.origin ? ` · ${quickView.origin}` : ""}
                  </p>
                  <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.1, color: "white" }}>
                    {quickView.name}
                  </h3>
                  {quickView.series && (
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(236,91,19,0.65)", marginBottom: 14 }}>
                      {quickView.series}
                    </p>
                  )}
                  {quickView.description && (
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.36)", marginBottom: 20 }}>
                      {quickView.description}
                    </p>
                  )}
                  {fmt(quickView.price) && (
                    <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 28, color: "#ec5b13", marginBottom: 24 }}>
                      {fmt(quickView.price)}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    className="bs-btn-primary"
                    style={{ background: "#ec5b13", padding: "13px 0", borderRadius: 12, fontSize: 10, letterSpacing: "0.2em" }}
                    onClick={() => { handleAddToCart(quickView); setQuickView(null); }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(236,91,19,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="bs-btn-ghost"
                    style={{ padding: "10px 0", borderRadius: 12, fontSize: 8 }}
                    onClick={() => setQuickView(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, animation: "bsFadeUp 0.6s ease both", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 28, height: 1, background: "#ec5b13" }} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.4em", color: "#ec5b13", textTransform: "uppercase", fontWeight: 700 }}>
                Editor's Select
              </span>
            </div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(26px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.03em", textTransform: "uppercase", color: "white", lineHeight: 1 }}>
              Seasonal{" "}
              <em style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 400, color: "#ec5b13" }}>Picks</em>
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {!isMobile && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.16)", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span className="material-symbols-outlined bs-spin" style={{ fontSize: 11 }}>autorenew</span>
                Auto-refreshing
              </span>
            )}
            <Link
              to="/categories"
              style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 200ms" }}
              onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE — 2-col grid, A/B crossfade every 15s
            Both grids are position:absolute stacked; height anchor
            keeps the container sized correctly.
        ══════════════════════════════════════════════════════ */}
        {isMobile ? (
          <div style={{ position: "relative" }}>
            {/* Height anchor: invisible clone of whichever slot is active */}
            <div aria-hidden style={{ visibility: "hidden", pointerEvents: "none" }}>
              <div className="bs-mobile-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: "3/4", borderRadius: 20 }} />
                ))}
              </div>
            </div>
            {/* Slot A */}
            <div
              className="bs-slot"
              style={{ opacity: mobileActive === "A" ? 1 : 0, pointerEvents: mobileActive === "A" ? "auto" : "none" }}
              aria-hidden={mobileActive !== "A"}
            >
              <div className="bs-mobile-grid">
                {mobileSlotA.map((p, i) => (
                  <ProductCard key={`ma-${p.id}-${i}`} product={p} widthStyle="100%" />
                ))}
              </div>
            </div>
            {/* Slot B */}
            <div
              className="bs-slot"
              style={{ opacity: mobileActive === "B" ? 1 : 0, pointerEvents: mobileActive === "B" ? "auto" : "none" }}
              aria-hidden={mobileActive !== "B"}
            >
              <div className="bs-mobile-grid">
                {mobileSlotB.map((p, i) => (
                  <ProductCard key={`mb-${p.id}-${i}`} product={p} widthStyle="100%" />
                ))}
              </div>
            </div>
          </div>

        ) : slotA.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase" }}>
            COLLECTION LOADING
          </div>

        ) : (
          /* ════════════════════════════════════════════════════
             DESKTOP — A/B crossfade carousel, pages of 4
             Slot A and B are stacked; only the active one is
             visible. translateX slides the active strip by pages.
          ════════════════════════════════════════════════════ */
          <div style={{ position: "relative" }}>

            <button className="bs-nav" style={{ left: -26 }} disabled={pageIdx === 0} onClick={() => go(-1)} aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button className="bs-nav" style={{ right: -26 }} onClick={() => go(1)} aria-label="Next">
              <ChevronRight size={18} />
            </button>

            {/* Viewport */}
            <div ref={trackRef} style={{ overflow: "hidden", position: "relative", borderRadius: 6 }}>

              {/* Height anchor: invisible row of VISIBLE cards at correct size */}
              <div aria-hidden style={{ display: "flex", gap: GAP, visibility: "hidden", pointerEvents: "none" }}>
                {Array.from({ length: VISIBLE }).map((_, i) => (
                  <div key={i} style={{ width: cardWidthStyle, flexShrink: 0, aspectRatio: "3/4" }} />
                ))}
              </div>

              {/* Slot A */}
              <div
                className="bs-slot"
                style={{ opacity: activeSlot === "A" ? 1 : 0, pointerEvents: activeSlot === "A" ? "auto" : "none" }}
                aria-hidden={activeSlot !== "A"}
              >
                <div style={{ display: "flex", gap: GAP, transform: `translateX(-${pageOffset}px)`, transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)", willChange: "transform" }}>
                  {slotA.map((p, i) => <ProductCard key={`A-${p.id}-${i}`} product={p} widthStyle={cardWidthStyle} />)}
                </div>
              </div>

              {/* Slot B */}
              <div
                className="bs-slot"
                style={{ opacity: activeSlot === "B" ? 1 : 0, pointerEvents: activeSlot === "B" ? "auto" : "none" }}
                aria-hidden={activeSlot !== "B"}
              >
                <div style={{ display: "flex", gap: GAP, transform: `translateX(-${pageOffset}px)`, transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)", willChange: "transform" }}>
                  {slotB.map((p, i) => <ProductCard key={`B-${p.id}-${i}`} product={p} widthStyle={cardWidthStyle} />)}
                </div>
              </div>
            </div>

            {/* Dots — one per page */}
            <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 30 }}>
              {Array.from({ length: PAGE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  className={`bs-dot${pageIdx === i ? " active" : ""}`}
                  style={{ width: pageIdx === i ? 24 : 6 }}
                  onClick={() => { setPageIdx(i); pageRef.current = i; }}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── View All CTA ── */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link
            to="/categories"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 34px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "all 220ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ec5b13"; e.currentTarget.style.color = "#ec5b13"; e.currentTarget.style.boxShadow = "0 0 28px rgba(236,91,19,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            View All Collections
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;