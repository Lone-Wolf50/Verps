import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import hero1 from "../../public/hero1.jpg";
import hero2 from "../../public/hero2.jpg";
import hero3 from "../../public/hero3.jpg";
import hero4 from "../../public/hero4.jpg";

if (typeof document !== "undefined" && !document.getElementById("_hero_kf")) {
  const s = document.createElement("style");
  s.id = "_hero_kf";
  s.textContent = `
    @keyframes heroFadeIn  { from{opacity:0;transform:scale(1.04);} to{opacity:1;transform:scale(1);}  }
    @keyframes heroFadeOut { from{opacity:1;transform:scale(1);}    to{opacity:0;transform:scale(0.98);} }
    @keyframes heroTextIn  { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
    @keyframes scrollBounce {
      0%,100%{ transform:translateX(-50%) translateY(0);   opacity:.5;  }
      50%    { transform:translateX(-50%) translateY(7px);  opacity:.18; }
    }
    .hero-img-in      { animation: heroFadeIn   0.9s cubic-bezier(0.16,1,0.3,1) both; }
    .hero-img-out     { animation: heroFadeOut  0.9s cubic-bezier(0.16,1,0.3,1) both; }
    .hero-text-in     { animation: heroTextIn   0.8s cubic-bezier(0.16,1,0.3,1) both; }
    .scroll-indicator { animation: scrollBounce 2.6s ease-in-out infinite; }

    /* Mobile: compact hero — 85svh, never taller than 680px */
    @media (max-width: 768px) {
      .hero-root {
        height: 85svh !important;
        min-height: 520px !important;
        max-height: 680px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

const slides = [
  { img: hero1, label: "SS 2026",  index: "01", hasButtons: true,  headline: ["REDEFINING","ESSENTIAL"], sub: "Premium streetwear for those who move through the world differently. Built for the bold." },
  { img: hero2, label: "FORM",     index: "02", hasButtons: false, headline: ["BEYOND THE","ORDINARY"],  sub: "Every silhouette is a statement. Every piece a commitment to craft over compromise." },
  { img: hero3, label: "IDENTITY", index: "03", hasButtons: false, headline: ["WEAR WHAT","YOU MEAN"],   sub: "Verp is not a brand you wear. It's a conviction you carry — stitched into every seam." },
  { img: hero4, label: "MOTION",   index: "04", hasButtons: false, headline: ["BUILT TO","MOVE"],        sub: "From pavement to elevation. Performance fabrics wrapped in a premium shell." },
];

const NAVBAR_H = 68;

const Hero = () => {
  const [current, setCurrent]     = useState(0);
  const [prev,    setPrev]        = useState(null);
  const [transitioning, setTrans] = useState(false);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    if (transitioning || idx === current) return;
    setTrans(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setTrans(false); }, 900);
  };
  const next = () => goTo((current + 1) % slides.length);
  const back = () => goTo((current - 1 + slides.length) % slides.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [current, transitioning]);

  const slide = slides[current];

  return (
    <header className="hero-root relative w-full bg-[#080808]" style={{ height: "100vh", minHeight: 600 }}>

      {/* Stacked images */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 ${i === current ? "hero-img-in z-10" : i === prev ? "hero-img-out z-10" : "opacity-0 z-0"}`}
          style={{ overflow: "hidden" }}
        >
          <img
            src={s.img} alt={s.label}
            className="w-full h-full object-cover"
            style={{ filter: i === 0 ? "grayscale(20%)" : "grayscale(60%) contrast(1.05)", objectPosition: "center 20%" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(8,8,8,0.32) 0%,rgba(8,8,8,0.04) 30%,rgba(8,8,8,0.65) 70%,rgba(8,8,8,1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(8,8,8,0.55) 0%,transparent 60%)" }} />
        </div>
      ))}

      {/* ── Slide dots — top right (desktop) ── */}
      <div className="absolute z-30 hidden md:flex flex-col items-end gap-1" style={{ top: NAVBAR_H + 20, right: 40 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
          {slide.index} / 0{slides.length}
        </span>
        <div className="flex gap-2 mt-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              style={{ height: 2, width: i === current ? 28 : 10, background: i === current ? "#ec5b13" : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", transition: "all 0.5s ease", borderRadius: 2, padding: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        className="absolute inset-0 z-20 flex flex-col justify-end px-6 md:px-16 max-w-5xl"
        style={{ paddingTop: NAVBAR_H + 20, paddingBottom: "clamp(80px, 12vh, 120px)" }}
      >
        {/* Label */}
        <div key={`label-${current}`} className="hero-text-in flex items-center gap-3 mb-4" style={{ animationDelay: "0.1s" }}>
          <div style={{ width: 24, height: 1, background: "#ec5b13" }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.4em", color: "#ec5b13", textTransform: "uppercase", fontWeight: 700 }}>
            {slide.label}
          </span>
        </div>

        {/* Headline */}
        <div key={`headline-${current}`}>
          {slide.headline.map((line, i) => (
            <h1
              key={i}
              className="hero-text-in"
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "clamp(32px, 6vw, 90px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                color: "white",
                textTransform: "uppercase",
                animationDelay: `${0.15 + i * 0.08}s`,
              }}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* Subtext — shorter on mobile */}
        <p
          key={`sub-${current}`}
          className="hero-text-in mt-4 max-w-xs md:max-w-sm"
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "clamp(11px, 1.4vw, 13px)",
            fontWeight: 400,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.4)",
            animationDelay: "0.35s",
            display: "-webkit-box",
            WebkitLineClamp: 2,          /* max 2 lines on mobile to save space */
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {slide.sub}
        </p>

        {/* CTA buttons — only on slide 0 */}
        {slide.hasButtons && (
          <div
            key={`cta-${current}`}
            className="hero-text-in flex flex-col sm:flex-row gap-3 mt-6"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              to="/categories"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#ec5b13", color: "#000", padding: "13px 26px", borderRadius: 999, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 8px 28px rgba(236,91,19,0.35)", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(236,91,19,0.55)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(236,91,19,0.35)"}
            >
              Shop Collection
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
            </Link>

            <Link
              to="/categories"
              state={{ scrollTo: "bestsellers" }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", color: "white", padding: "13px 26px", borderRadius: 999, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              View Lookbook
            </Link>
          </div>
        )}
      </div>

      {/* ── Bottom bar: dots (mobile) + nav arrows ── */}
      <div
        className="absolute z-30 flex items-center justify-between w-full px-6 md:px-12"
        style={{ bottom: 28 }}
      >
        {/* Mobile dots — left side */}
        <div className="flex items-center gap-3 md:hidden">
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)" }}>
            {slide.index} / 0{slides.length}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  height: 2,
                  width: i === current ? 22 : 8,
                  background: i === current ? "#ec5b13" : "rgba(255,255,255,0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.5s ease",
                  borderRadius: 2,
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Spacer on desktop (dots are top-right) */}
        <div className="hidden md:block" />

        {/* Nav arrows — right side, both mobile & desktop */}
        <div className="flex gap-2">
          {[{ fn: back, icon: "arrow_back" }, { fn: next, icon: "arrow_forward" }].map(({ fn, icon }, i) => (
            <button
              key={i}
              onClick={fn}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 200ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(236,91,19,0.2)"; e.currentTarget.style.borderColor = "#ec5b13"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator — desktop only so it doesn't crowd mobile */}
      <div
        className="scroll-indicator absolute z-30 hidden md:flex flex-col items-center gap-1"
        style={{ bottom: 30, left: "50%" }}
      >
        <div style={{ width: 1, height: 24, background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.3))" }} />
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1.5 1.5L8 8L14.5 1.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

    </header>
  );
};

export default Hero;