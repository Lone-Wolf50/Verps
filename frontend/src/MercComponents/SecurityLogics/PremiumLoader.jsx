import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════
   PremiumLoader
   Shown briefly after login before redirecting to homepage.
   Image: /loader.jpg from public folder
   ════════════════════════════════════════════════════════════ */
const PremiumLoader = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=fade-in, 1=show, 2=fade-out
  const userName = localStorage.getItem("userName") || "";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => navigate("/"), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  const opacity = phase === 0 ? 0 : phase === 1 ? 1 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=JetBrains+Mono:wght@700&display=swap');
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes scan{0%{top:-30%}100%{top:110%}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes loaderGlow{0%,100%{filter:drop-shadow(0 0 30px rgba(236,91,19,0.4))}50%{filter:drop-shadow(0 0 60px rgba(236,91,19,0.8))}}
        @keyframes ringExpand{0%{transform:scale(0.85);opacity:0}50%{opacity:0.3}100%{transform:scale(1.4);opacity:0}}
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden", transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1)", opacity, background: "#000" }}>
        {/* Background image from public */}
        <img src="/loader.jpg" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
          onError={e => { e.currentTarget.src = "/login.jpg"; e.currentTarget.onerror = null; }} />
        {/* Dark vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.88) 100%)" }} />
        {/* Scan line */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.5), transparent)", animation: "scan 2s linear infinite", pointerEvents: "none" }} />
        {/* Subtle grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(236,91,19,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(236,91,19,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        {/* Center content */}
        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          {/* Logo mark with rings */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Expanding rings */}
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(236,91,19,0.3)", animation: "ringExpand 2s ease-out infinite" }} />
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(236,91,19,0.2)", animation: "ringExpand 2s ease-out 0.5s infinite" }} />
            <div style={{ animation: "float 3s ease-in-out infinite, loaderGlow 3s ease-in-out infinite" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 88, fontStyle: "italic", color: "#ec5b13", lineHeight: 1, display: "block" }}>V</span>
            </div>
          </div>

          {/* Greeting */}
          {userName && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>WELCOME BACK</p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,3vw,28px)", fontStyle: "italic", fontWeight: 400, background: "linear-gradient(90deg, #fff 0%, rgba(236,91,19,0.9) 50%, #fff 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 2s linear infinite" }}>
                {userName}
              </p>
            </div>
          )}

          {/* Loading indicator */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec5b13", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>

          {/* Tagline */}
          <p style={{ position: "absolute", bottom: 40, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
            VAULT · SERIES 2026
          </p>
        </div>
      </div>
    </>
  );
};

export default PremiumLoader;
