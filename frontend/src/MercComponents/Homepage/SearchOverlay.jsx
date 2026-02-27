import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowUpRight, Tag, ShoppingCart, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../Cartoptions/CartContext";

/* ── inject styles once ── */
if (typeof document !== "undefined" && !document.getElementById("_search_overlay_kf")) {
  const s = document.createElement("style");
  s.id = "_search_overlay_kf";
  s.textContent = `
    @keyframes overlayIn  { from{opacity:0} to{opacity:1} }
    @keyframes panelDown  { from{opacity:0;transform:translateY(-12px) scale(0.99)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes qvIn       { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes resultFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
    ._so-panel   { animation: panelDown  0.32s cubic-bezier(0.16,1,0.3,1) both; }
    ._so-bd      { animation: overlayIn  0.25s ease both; }
    ._so-qv      { animation: qvIn       0.3s  cubic-bezier(0.16,1,0.3,1) both; }
    ._so-result  { animation: resultFade 0.28s cubic-bezier(0.16,1,0.3,1) both; }
    ._so-scroll::-webkit-scrollbar { width: 3px; }
    ._so-scroll::-webkit-scrollbar-track { background: transparent; }
    ._so-scroll::-webkit-scrollbar-thumb { background: rgba(236,91,19,0.25); border-radius: 2px; }
    ._so-input:-webkit-autofill,
    ._so-input:-webkit-autofill:hover,
    ._so-input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 1000px transparent inset !important; -webkit-text-fill-color: rgba(255,255,255,0.88) !important; transition: background-color 9999s ease-in-out 0s; }
  `;
  document.head.appendChild(s);
}

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery]               = useState("");
  const [results, setResults]           = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching]   = useState(false);
  const [quickViewProduct, setQV]       = useState(null);
  const [isDescExpanded, setDescExp]    = useState(false);
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults({ products: [], categories: [] });
      setQV(null);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults({ products: [], categories: [] }); return; }
    const t = setTimeout(performSearch, 300);
    return () => clearTimeout(t);
  }, [query]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("verp_products").select("*").or(`name.ilike.%${query}%,category.ilike.%${query}%`).limit(6),
        supabase.from("verp_categories").select("*").ilike("name", `%${query}%`).limit(6),
      ]);
      setResults({ products: prodRes.data || [], categories: catRes.data || [] });
    } catch (e) { console.error(e); }
    finally { setIsSearching(false); }
  };

  const openQV    = (p) => { setQV(p); setDescExp(false); };
  const closeQV   = () => { setQV(null); setDescExp(false); };
  const relatedItems = results.products.filter(p => p.id !== quickViewProduct?.id).slice(0, 4);

  if (!isOpen) return null;

  return (
    <>
      {/* ══ SEARCH PANEL ══ */}
      <div className="fixed inset-0 z-[300] flex items-start justify-center">
        {/* Backdrop */}
        <div
          className="_so-bd absolute inset-0"
          style={{ background: "rgba(4,4,4,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          onClick={onClose}
        />

        {/* Panel */}
        <div
          className="_so-panel relative z-10 flex flex-col w-full h-full sm:h-auto sm:max-h-[80vh] sm:max-w-xl sm:mt-20 sm:mx-4 sm:rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #121212 0%, #0c0c0c 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Search bar ── */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, paddingBottom: 14 }}
          >
            {/* Glassmorphism pill input */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 11,
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.11)",
                borderRadius: 999,
                padding: "10px 18px",
                transition: "border-color 200ms, background 200ms, box-shadow 200ms",
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = "rgba(236,91,19,0.45)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(236,91,19,0.06), inset 0 1px 0 rgba(255,255,255,0.08)";
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon or spinner */}
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isSearching
                  ? <div style={{ width: 14, height: 14, border: "1.5px solid rgba(236,91,19,0.3)", borderTopColor: "#ec5b13", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <Search style={{ width: 14, height: 14, color: "#ec5b13", opacity: 0.8 }} />
                }
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                placeholder="Search collections, products…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  fontWeight: 400,
                  fontFamily: "'DM Sans',sans-serif",
                  letterSpacing: "0.01em",
                  outline: "none",
                  border: "none",
                  minWidth: 0,
                  WebkitBoxShadow: "0 0 0 1000px transparent inset",
                  WebkitTextFillColor: "rgba(255,255,255,0.9)",
                  caretColor: "#ec5b13",
                }}
              />

              {/* ⌘K hint — only when empty */}
              {!query && (
                <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", pointerEvents: "none" }}>
                  ⌘K
                </span>
              )}
            </div>

            {/* Close overlay button — only X here, no X inside input */}
            <button
              onClick={onClose}
              style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", transition: "all 200ms" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              <X style={{ width: 13, height: 13 }} />
            </button>
          </div>

          {/* ── Results body ── */}
          <div className="_so-scroll flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
            {query.trim() === "" ? (
              <StaticMenu navigate={navigate} onClose={onClose} />
            ) : (
              <>
                {results.categories.length > 0 && (
                  <section className="space-y-3">
                    <SectionLabel text="Categories" />
                    <div className="flex flex-wrap gap-2">
                      {results.categories.map(cat => (
                        <CategoryPill key={cat.id} name={cat.name} onClick={() => {
                          const slugMap = {
                            boxers:"boxers", shoes:"shoes", slides:"slides", shirts:"shirts",
                            caps:"caps", jewelry:"jewelry", jackets:"jackets", glasses:"glasses",
                            belts:"Belts", watches:"watches", sneakers:"sneakers", socks:"socks",
                            hoodies:"hoodies", sweatshirts:"sweatshirts", bags:"bags",
                          };
                          const KNOWN_SLUGS = new Set(Object.values(slugMap));
                          const key = cat.name.toLowerCase();
                          const slug = slugMap[key] || (cat.slug && KNOWN_SLUGS.has(cat.slug) ? cat.slug : null);
                          if (slug) {
                            navigate(`/category/${slug}`);
                          } else {
                            navigate("/categories");
                          }
                          onClose();
                        }} />
                      ))}
                    </div>
                  </section>
                )}
                {results.products.length > 0 && (
                  <section className="space-y-3">
                    <SectionLabel text="Products" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {results.products.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} onClick={() => {
                          const slugMap = {
                            boxers:"boxers", shoes:"shoes", slides:"slides", shirts:"shirts",
                            caps:"caps", jewelry:"jewelry", jackets:"jackets", glasses:"glasses",
                            belts:"Belts", watches:"watches", sneakers:"sneakers", socks:"socks",
                            hoodies:"hoodies", sweatshirts:"sweatshirts", bags:"bags",
                          };
                          const key = (p.category || "").toLowerCase();
                          const slug = slugMap[key] || key;
                          if (slug) { navigate(`/category/${slug}`); onClose(); }
                          else openQV(p);
                        }} />
                      ))}
                    </div>
                  </section>
                )}
                {!isSearching && results.products.length === 0 && results.categories.length === 0 && (
                  <div className="py-16 text-center">
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                      No results for "{query}"
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══ QUICK VIEW ══ */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
            onClick={closeQV}
          />
          <div
            className="_so-qv relative w-full max-w-2xl max-h-[88vh] flex flex-col md:flex-row overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(160deg,#131313 0%,#0a0a0a 100%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 60px 120px rgba(0,0,0,0.95)" }}
          >
            {/* Close */}
            <button onClick={closeQV}
              style={{ position: "absolute", top: 14, right: 14, zIndex: 50, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", transition: "all 200ms" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ec5b13"; e.currentTarget.style.color = "#ec5b13"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >
              <X style={{ width: 13, height: 13 }} />
            </button>

            {/* Image */}
            <div className="w-full md:w-[44%] flex-shrink-0 relative overflow-hidden" style={{ height: "36vh", minHeight: 200 }}>
              <img src={quickViewProduct.image_url} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }} />
              {/* Price badge on image */}
              <div style={{ position: "absolute", bottom: 14, left: 14, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 22, color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
                ${Number(quickViewProduct.price).toLocaleString()}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header */}
              <div className="flex-shrink-0 px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div style={{ width: 18, height: 1, background: "#ec5b13" }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", color: "rgba(236,91,19,0.7)", textTransform: "uppercase", fontWeight: 700 }}>
                    Limited Release
                  </span>
                </div>
                <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", color: "white", lineHeight: 1.1, marginBottom: 10 }}>
                  {quickViewProduct.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 9px" }}>
                    <ShieldCheck style={{ width: 10, height: 10, color: "#ec5b13" }} />
                    Verified
                  </span>
                  {quickViewProduct.category && (
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {quickViewProduct.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="_so-scroll flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>Description</span>
                    <button onClick={() => setDescExp(!isDescExpanded)} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "#ec5b13", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      {isDescExpanded ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
                      {isDescExpanded ? "Less" : "More"}
                    </button>
                  </div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, lineHeight: 1.75, color: "rgba(255,255,255,0.5)", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: isDescExpanded ? "unset" : 3, overflow: "hidden" }}>
                    {quickViewProduct.description || "Archived premium selection. Handcrafted for the modern explorer with focus on durability and refined aesthetics."}
                  </p>
                </div>

                {/* Related */}
                {relatedItems.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", display: "block", marginBottom: 10 }}>From your search</span>
                    <div className="grid grid-cols-2 gap-2">
                      {relatedItems.map(item => (
                        <button key={item.id} onClick={() => { setQV(item); setDescExp(false); }}
                          className="group flex items-center gap-2.5 text-left rounded-xl p-2.5 transition-all duration-200"
                          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.3)"; e.currentTarget.style.background = "rgba(236,91,19,0.03)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                            <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 12, color: "#ec5b13" }}>${Number(item.price).toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to cart */}
              <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button
                  onClick={() => { addToCart({ ...quickViewProduct, image: quickViewProduct.image_url }); closeQV(); }}
                  className="w-full flex items-center justify-center gap-2.5 font-black uppercase transition-all duration-200 active:scale-[0.98]"
                  style={{ background: "#ec5b13", color: "#000", padding: "14px 0", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: "0.2em", border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(236,91,19,0.3)" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(236,91,19,0.55)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(236,91,19,0.3)"}
                >
                  <ShoppingCart style={{ width: 14, height: 14 }} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </>
  );
};

/* ── Sub-components ── */
const SectionLabel = ({ text }) => (
  <div className="flex items-center gap-3">
    <div style={{ width: 16, height: 1, background: "#ec5b13", opacity: 0.5 }} />
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{text}</span>
    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
  </div>
);

const CategoryPill = ({ name, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 transition-all duration-200 active:scale-95"
    style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)"; e.currentTarget.style.color = "#ec5b13"; e.currentTarget.style.background = "rgba(236,91,19,0.06)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
  >
    <Tag style={{ width: 10, height: 10 }} />
    {name}
  </button>
);

const ProductCard = ({ product, onClick, index }) => (
  <button
    onClick={onClick}
    className="_so-result group relative flex items-center gap-3.5 text-left w-full overflow-hidden rounded-xl transition-all duration-200 active:scale-[0.98]"
    style={{ animationDelay: `${index * 0.04}s`, padding: "10px 12px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.28)"; e.currentTarget.style.background = "rgba(236,91,19,0.04)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
  >
    {/* Thumbnail */}
    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {product.image_url
        ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
      }
    </div>
    {/* Info */}
    <div className="flex-1 min-w-0">
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
      {product.category && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", marginTop: 3 }}>{product.category}</p>}
      <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 15, color: "#ec5b13", marginTop: 4 }}>${product.price}</p>
    </div>
    {/* Arrow */}
    <ArrowUpRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.1)", flexShrink: 0, transition: "all 200ms" }}
      className="group-hover:text-[#ec5b13] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    />
  </button>
);

const StaticMenu = ({ navigate, onClose }) => (
  <div className="space-y-5">
    <div>
      <SectionLabel text="Trending Searches" />
      <div className="flex flex-wrap gap-2 mt-3">
        {["Outerwear", "Vault", "Essentials"].map(term => (
          <button key={term} onClick={() => { navigate(`/shop?search=${term}`); onClose(); }}
            className="transition-all duration-200 active:scale-95"
            style={{ padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", cursor: "pointer", letterSpacing: "0.01em" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.35)"; e.currentTarget.style.color = "#ec5b13"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
            {term}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default SearchOverlay;