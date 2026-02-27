import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const slides = [
  { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop", label: "The Craft",    caption: "Precision in every stitch" },
  { url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop", label: "The Material", caption: "Heavyweight. Honest. Yours." },
  { url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop", label: "The Standard", caption: "Built for those who notice" },
];

const values = [
  { num: "01", title: "Authenticity", desc: "Every piece we release is deliberate. No filler, no noise — only garments we'd wear ourselves.",                link: "/support",    linkLabel: "Talk to Us"     },
  { num: "02", title: "Precision",    desc: "From the weight of the fabric to the finish on the seam — we obsess over details most brands overlook.",        link: "/categories", linkLabel: "See the Work"   },
  { num: "03", title: "Community",    desc: "Verp isn't just worn — it's shared. Built for a community of people who lead, not follow.",                      link: "/reviews",    linkLabel: "Client Verdicts" },
];

const stats = [
  { value: "2023", label: "Founded"          },
  { value: "GH",   label: "Proudly Ghanaian" },
  { value: "48H",  label: "Returns Window"   },
  { value: "∞",    label: "Standard"         },
];

const NAVBAR_H = 68;

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY]           = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#080808", color: "white", minHeight: "100vh", overflowX: "hidden"}}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        .abt-in      { animation: fadeUp 0.85s cubic-bezier(0.16,1,0.3,1) both; }
        .val-card    { position:relative; padding:40px 32px; background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.05); border-radius:24px; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); overflow:hidden; cursor:default; }
        .val-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(236,91,19,0.05) 0%,transparent 65%); opacity:0; transition:opacity 0.4s; }
        .val-card:hover { border-color:rgba(236,91,19,0.28); transform:translateY(-4px); }
        .val-card:hover::before { opacity:1; }
        .explore-link { display:inline-flex; align-items:center; gap:10px; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.25em; text-transform:uppercase; color:#ec5b13; text-decoration:none; transition:gap 200ms; }
        .explore-link:hover { gap:16px; }
        .val-link     { display:inline-flex; align-items:center; gap:6px; font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.2); text-decoration:none; transition:color 200ms,gap 200ms; }
        .val-link:hover { color:#ec5b13; gap:10px; }
        .slide-dot    { height:2px; border:none; cursor:pointer; padding:0; border-radius:2px; transition:all 0.4s ease; }
        .abt-hero     { height: 72vh; min-height: 540px; }
        @media(min-width:769px) and (max-width:1280px){ .abt-hero { height:65vh !important; min-height:480px !important; } }
        @media(max-width:768px){ .abt-grid{grid-template-columns:1fr!important} .abt-stats{grid-template-columns:repeat(2,1fr)!important} .abt-vals{grid-template-columns:1fr!important} .abt-hero{height:80vh!important;} }
      `}</style>

      {/* ── Hero ── */}
      <div className="abt-hero" style={{ position: "relative", overflow: "hidden" }}>
        {slides.map((s, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, opacity: i === currentSlide ? 1 : 0, transition: "opacity 1.2s ease", zIndex: i === currentSlide ? 1 : 0 }}>
            <img src={s.url} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(20%) contrast(1.08)", transform: `translateY(${scrollY * 0.15}px)` }} />
          </div>
        ))}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(to bottom,rgba(8,8,8,0.5) 0%,rgba(8,8,8,0.05) 40%,rgba(8,8,8,0.88) 85%,#080808 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(to right,rgba(8,8,8,0.55) 0%,transparent 60%)" }} />

        {/* ── Back button — tight to navbar ── */}
        <div style={{ position: "absolute", top: 16, left: 32, zIndex: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "10px 20px 10px 14px", cursor: "pointer", color: "white", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", transition: "all 200ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.55)"; e.currentTarget.style.color = "#ec5b13"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'wght' 700" }}>arrow_back</span>
            <span style={{ fontWeight: 900 }}>Back</span>
          </button>
        </div>

        {/* ── Hero copy ── */}
        <div style={{ position: "absolute", bottom: 48, left: 48, zIndex: 10, maxWidth: 640 }}>
          <div className="abt-in" style={{ animationDelay: "0.05s", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 28, height: 1, background: "#ec5b13" }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.4em", color: "#ec5b13", textTransform: "uppercase", fontWeight: 700 }}>Est. 2023 · Accra, Ghana</span>
          </div>
          <h1
            className="abt-in"
            style={{ animationDelay: "0.12s", fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(38px,5.5vw,78px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.9, textTransform: "uppercase", margin: 0 }}
          >
            Built for
            <br />
            <em style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 400, color: "#ec5b13", fontSize: "clamp(38px,5.5vw,78px)" }}>Bold Ones</em>
          </h1>
          <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
            {slides.map((_, i) => (
              <button key={i} className="slide-dot" onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 28 : 8, background: i === currentSlide ? "#ec5b13" : "rgba(255,255,255,0.25)" }} />
            ))}
          </div>
        </div>

        {/* Caption — bottom right */}
        <div style={{ position: "absolute", bottom: 48, right: 48, zIndex: 10 }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textAlign: "right" }}>
            {slides[currentSlide].caption}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "88px 48px 120px" }}>

        {/* Manifesto + image */}
        <div className="abt-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 72, alignItems: "center", marginBottom: 120 }}>
          <div className="abt-in" style={{ animationDelay: "0.2s" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 300, lineHeight: 1.65, color: "rgba(255,255,255,0.72)", marginBottom: 24, letterSpacing: "-0.01em" }}>
              Verp was born from a simple conviction: that premium clothing shouldn't require a European postcode to feel legitimate.
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.38)", marginBottom: 20 }}>
              We build from Ghana — for the world. Every collection starts with a question: what would someone who actually cares about quality want to wear? The answer isn't trend-chasing. It's silence and structure. Heavyweight fabrics. Honest cuts. Garments that don't apologise for taking up space.
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.22)", marginBottom: 44 }}>
              We don't do drops for the sake of it. We don't chase clout. We make things that survive laundry, time, and taste.
            </p>
            <Link to="/categories" className="explore-link">
              Explore the Collection
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_flat</span>
            </Link>
          </div>

          {/* Side image */}
          <div className="abt-in" style={{ animationDelay: "0.3s", position: "relative" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
              {slides.map((s, i) => (
                <div key={i} style={{ position: "absolute", inset: 0, opacity: i === currentSlide ? 1 : 0, transition: "opacity 1s ease", zIndex: i === currentSlide ? 1 : 0 }}>
                  <img src={s.url} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(25%) contrast(1.05)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(8,8,8,0.65) 0%,transparent 55%)" }} />
                  <p style={{ position: "absolute", bottom: 20, left: 22, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", zIndex: 2 }}>{s.label}</p>
                </div>
              ))}
              <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10, background: "#ec5b13", borderRadius: 10, padding: "8px 14px", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#000", boxShadow: "0 8px 24px rgba(236,91,19,0.45)" }}>
                Premium
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="abt-in abt-stats" style={{ animationDelay: "0.35s", display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, overflow: "hidden", marginBottom: 120 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "44px 24px", textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(236,91,19,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 40, color: "#ec5b13", marginBottom: 10, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values header */}
        <div className="abt-in" style={{ animationDelay: "0.4s", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 28, height: 1, background: "#ec5b13" }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.4em", color: "#ec5b13", textTransform: "uppercase", fontWeight: 700 }}>Our Principles</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(24px,3.5vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", textTransform: "uppercase", lineHeight: 1, margin: 0 }}>
            What We{" "}
            <em style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 400, color: "#ec5b13" }}>Stand For</em>
          </h2>
        </div>

        {/* Values cards */}
        <div className="abt-vals" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 100 }}>
          {values.map((v, i) => (
            <div key={i} className="abt-in val-card" style={{ animationDelay: `${0.44 + i * 0.08}s` }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", fontWeight: 700, marginBottom: 24 }}>{v.num}</p>
              <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 14, color: "white" }}>{v.title}</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>{v.desc}</p>
              <Link to={v.link} className="val-link">
                {v.linkLabel}
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>north_east</span>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="abt-in" style={{ animationDelay: "0.55s", padding: "64px 48px", background: "rgba(236,91,19,0.04)", border: "1px solid rgba(236,91,19,0.12)", borderRadius: 32, textAlign: "center" }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.4em", color: "#ec5b13", textTransform: "uppercase", marginBottom: 20 }}>Ready When You Are</p>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", textTransform: "uppercase", marginBottom: 32 }}>Wear What You Mean</h2>
          <Link
            to="/categories"
            style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#ec5b13", color: "#000", padding: "16px 36px", borderRadius: 999, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 12px 40px rgba(236,91,19,0.35)", transition: "box-shadow 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 16px 52px rgba(236,91,19,0.55)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(236,91,19,0.35)"}
          >
            Shop Collection
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default About;