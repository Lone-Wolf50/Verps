import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PremiumLoader = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=hidden, 1=visible, 2=fade-out
  const userName = localStorage.getItem("userName") || "";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 2600);
    const t3 = setTimeout(() => navigate("/"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  const opacity = phase === 0 ? 0 : phase === 1 ? 1 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@400;700&display=swap');

        /* ── Keyframes ── */
        @keyframes shimmer {
          0%   { background-position: -300% center }
          100% { background-position:  300% center }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg) }
          50%       { transform: translateY(-10px) rotate(1deg) }
        }
        @keyframes scan {
          0%   { top: -4px; opacity: 0 }
          5%   { opacity: 1 }
          95%  { opacity: 1 }
          100% { top: 100%; opacity: 0 }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85) }
          50%       { opacity: 1;   transform: scale(1)    }
        }
        @keyframes loaderGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(236,91,19,0.35)) drop-shadow(0 0 60px rgba(236,91,19,0.12)) }
          50%       { filter: drop-shadow(0 0 40px rgba(236,91,19,0.75)) drop-shadow(0 0 100px rgba(236,91,19,0.25)) }
        }
        @keyframes ringExpand {
          0%   { transform: scale(0.6); opacity: 0 }
          30%  { opacity: 0.5 }
          100% { transform: scale(2.2); opacity: 0 }
        }
        @keyframes ringExpand2 {
          0%   { transform: scale(0.6); opacity: 0 }
          30%  { opacity: 0.3 }
          100% { transform: scale(1.8); opacity: 0 }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes revealLine {
          from { transform: scaleX(0) }
          to   { transform: scaleX(1) }
        }
        @keyframes orbDrift1 {
          0%   { transform: translate(0, 0) scale(1) }
          33%  { transform: translate(60px, -40px) scale(1.15) }
          66%  { transform: translate(-30px, 50px) scale(0.9) }
          100% { transform: translate(0, 0) scale(1) }
        }
        @keyframes orbDrift2 {
          0%   { transform: translate(0, 0) scale(1) }
          33%  { transform: translate(-50px, 30px) scale(0.85) }
          66%  { transform: translate(40px, -60px) scale(1.1) }
          100% { transform: translate(0, 0) scale(1) }
        }
        @keyframes orbDrift3 {
          0%   { transform: translate(0, 0) scale(1) }
          50%  { transform: translate(30px, 40px) scale(1.2) }
          100% { transform: translate(0, 0) scale(1) }
        }
        @keyframes particleFall {
          0%   { transform: translateY(-10px) translateX(0); opacity: 0 }
          10%  { opacity: 0.6 }
          90%  { opacity: 0.2 }
          100% { transform: translateY(110vh) translateX(var(--drift)); opacity: 0 }
        }
        @keyframes noiseDrift {
          0%   { transform: translate(0,0) }
          25%  { transform: translate(-2px, 2px) }
          50%  { transform: translate(2px, -1px) }
          75%  { transform: translate(-1px, -2px) }
          100% { transform: translate(0,0) }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50% }
          50%  { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        .loader-letter {
          animation: float 4s ease-in-out infinite, loaderGlow 3s ease-in-out infinite;
        }
        .loader-ring-1 {
          animation: ringExpand 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .loader-ring-2 {
          animation: ringExpand2 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) 0.6s infinite;
        }
        .loader-ring-3 {
          animation: ringExpand 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) 1.2s infinite;
        }
        .dot-1 { animation: pulse 1.4s ease-in-out 0s infinite }
        .dot-2 { animation: pulse 1.4s ease-in-out 0.2s infinite }
        .dot-3 { animation: pulse 1.4s ease-in-out 0.4s infinite }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden",
        transition: "opacity 600ms cubic-bezier(0.16,1,0.3,1)",
        opacity,
        background: "#000",
        fontFamily: "'JetBrains Mono', monospace",
      }}>

        {/* ── BACKGROUND IMAGE ── */}
        <img
          src="/loader.jpg"
          alt=""
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.28, filter:"saturate(0.6) contrast(1.1)" }}
          onError={(e) => { e.currentTarget.src = "/login.jpg"; e.currentTarget.onerror = null; }}
        />

        {/* ── ANIMATED GRADIENT MESH ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(236,91,19,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 20%, rgba(120,30,0,0.22) 0%, transparent 55%), radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.5) 30%, transparent 70%)",
        }} />

        {/* ── FLOATING ORB BLOBS ── */}
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(236,91,19,0.10) 0%, transparent 70%)", top:"10%", left:"60%", animation:"orbDrift1 12s ease-in-out infinite", filter:"blur(40px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(180,50,0,0.12) 0%, transparent 70%)", top:"50%", left:"5%", animation:"orbDrift2 16s ease-in-out infinite", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(236,91,19,0.07) 0%, transparent 70%)", top:"70%", left:"45%", animation:"orbDrift3 10s ease-in-out infinite", filter:"blur(30px)", pointerEvents:"none" }} />

        {/* ── DEEP VIGNETTE ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%)",
          pointerEvents: "none",
        }} />

        {/* ── GRAIN / NOISE OVERLAY ── */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04, pointerEvents:"none", animation:"noiseDrift 0.15s steps(1) infinite" }}>
          <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* ── FINE GRID ── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(236,91,19,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(236,91,19,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* ── SCAN LINE ── */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2, pointerEvents:"none",
          background: "linear-gradient(90deg, transparent 0%, rgba(236,91,19,0.06) 20%, rgba(236,91,19,0.55) 50%, rgba(236,91,19,0.06) 80%, transparent 100%)",
          boxShadow: "0 0 20px rgba(236,91,19,0.3), 0 0 60px rgba(236,91,19,0.1)",
          animation: "scan 3s cubic-bezier(0.4,0,0.6,1) infinite",
        }} />

        {/* ── FALLING PARTICLES ── */}
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            top: `-${Math.random() * 20}%`,
            left: `${(i / 18) * 100 + Math.random() * 4}%`,
            width: i % 3 === 0 ? 2 : 1,
            height: i % 3 === 0 ? 2 : 1,
            borderRadius: "50%",
            background: "#ec5b13",
            ["--drift"]: `${(Math.random() - 0.5) * 80}px`,
            animation: `particleFall ${6 + Math.random() * 8}s linear ${Math.random() * 6}s infinite`,
            pointerEvents: "none",
          }} />
        ))}

        {/* ══════════════════════════════════════════
            CENTER CONTENT
            ══════════════════════════════════════════ */}
        <div style={{
          position: "relative", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 0,
        }}>

          {/* Top micro-label */}
          <div style={{ animation:"fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both", marginBottom: 28, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:24, height:1, background:"linear-gradient(90deg,transparent,rgba(236,91,19,0.5))" }} />
            <span style={{ fontSize:8, letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)", fontWeight:700 }}>Verp · Est. 2026</span>
            <div style={{ width:24, height:1, background:"linear-gradient(90deg,rgba(236,91,19,0.5),transparent)" }} />
          </div>

          {/* Logo mark */}
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", marginBottom: 24 }}>
            {/* Triple expanding rings */}
            <div className="loader-ring-1" style={{ position:"absolute", width:110, height:110, borderRadius:"50%", border:"1px solid rgba(236,91,19,0.4)", pointerEvents:"none" }} />
            <div className="loader-ring-2" style={{ position:"absolute", width:110, height:110, borderRadius:"50%", border:"1px solid rgba(236,91,19,0.25)", pointerEvents:"none" }} />
            <div className="loader-ring-3" style={{ position:"absolute", width:110, height:110, borderRadius:"50%", border:"1px solid rgba(236,91,19,0.12)", pointerEvents:"none" }} />

            {/* Static inner circle */}
            <div style={{
              position: "absolute", width: 76, height: 76, borderRadius: "50%",
              border: "1px solid rgba(236,91,19,0.2)",
              background: "radial-gradient(circle at 40% 35%, rgba(236,91,19,0.08), transparent 65%)",
            }} />

            {/* The Letter */}
            <div className="loader-letter">
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 100, fontStyle: "italic", fontWeight: 300,
                color: "#ec5b13", lineHeight: 1, display: "block",
                letterSpacing: "-0.04em",
              }}>V</span>
            </div>
          </div>

          {/* Brand name */}
          <div style={{ animation:"fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both", marginBottom: 6 }}>
            <p style={{
              fontSize: 11, letterSpacing: "0.55em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)", fontWeight: 700,
            }}>VERP </p>
          </div>

          {/* Reveal line */}
          <div style={{ animation:"fadeUp 0.8s ease 0.6s both", marginBottom: userName ? 20 : 28 }}>
            <div style={{
              width: 48, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.8), transparent)",
              animation: "revealLine 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both",
              transformOrigin: "left",
            }} />
          </div>

          {/* Greeting */}
          {userName && (
            <div style={{ textAlign:"center", animation:"fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.75s both", marginBottom: 28 }}>
              <p style={{
                fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)", marginBottom: 8,
              }}>Welcome back</p>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(22px, 3.5vw, 32px)", fontStyle: "italic", fontWeight: 300,
                background: "linear-gradient(100deg, rgba(255,255,255,0.9) 0%, #ec5b13 40%, rgba(255,255,255,0.95) 70%, #ec5b13 100%)",
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 2.5s linear infinite",
                letterSpacing: "0.02em",
              }}>{userName}</p>
            </div>
          )}

          {/* Loading dots */}
          <div style={{ display:"flex", gap:7, animation:"fadeUp 0.8s ease 0.9s both" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={`dot-${i+1}`} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i === 1 ? "#ec5b13" : "rgba(236,91,19,0.4)",
              }} />
            ))}
          </div>

          {/* Bottom status line */}
          <div style={{
            position: "absolute", bottom: 36, left: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
            animation: "fadeUp 1s ease 1.1s both",
          }}>
            <div style={{ width:60, height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }} />
            <span style={{ fontSize:7, letterSpacing:"0.5em", textTransform:"uppercase", color:"rgba(255,255,255,0.12)" }}>
              Series · 2026 · Accra
            </span>
            <div style={{ width:60, height:1, background:"linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
          </div>

          {/* Corner accents */}
          {[
            { top:20, left:20, borderTop:"1px solid rgba(236,91,19,0.25)", borderLeft:"1px solid rgba(236,91,19,0.25)" },
            { top:20, right:20, borderTop:"1px solid rgba(236,91,19,0.25)", borderRight:"1px solid rgba(236,91,19,0.25)" },
            { bottom:20, left:20, borderBottom:"1px solid rgba(236,91,19,0.25)", borderLeft:"1px solid rgba(236,91,19,0.25)" },
            { bottom:20, right:20, borderBottom:"1px solid rgba(236,91,19,0.25)", borderRight:"1px solid rgba(236,91,19,0.25)" },
          ].map((s, i) => (
            <div key={i} style={{ position:"absolute", width:20, height:20, ...s, opacity:0.6 }} />
          ))}
        </div>
      </div>
    </>
  );
};

export default PremiumLoader;