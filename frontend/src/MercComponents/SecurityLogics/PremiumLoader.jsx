import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/*
  ╔══════════════════════════════════════════════════════════╗
  ║  VERP — GLITCH LOADER  v2                                ║
  ║  Longer cinematic hold · Premium gold shimmer on name    ║
  ║  Animated corner brackets · Typewriter tagline           ║
  ║  Denser glitch system · Richer scanline canvas           ║
  ╚══════════════════════════════════════════════════════════ */

const DURATION     = 4200;   // total ms before navigate
const FADE_OUT_AT  = 3500;   // ms when exit phase begins
const STATUS_INTERVAL = 620; // ms between status line steps

export default function PremiumLoader() {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem("userName") || "";

  const [phase,     setPhase]    = useState("enter");
  const [glitchOn,  setGlitch]   = useState(false);
  const [statusIdx, setStatus]   = useState(0);
  const [rgbOffset, setRgb]      = useState({ rx: 0, ry: 0, bx: 0, by: 0 });
  const [typed,     setTyped]    = useState("");        // typewriter tagline
  const [corners,   setCorners]  = useState(false);    // corner brackets visible

  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  const TAGLINE     = "LUXURY ACCESS · MEMBERS ONLY";
  const STATUS_LINES = [
    "INITIALISING VAULT…",
    "VERIFYING IDENTITY…",
    "DECRYPTING CREDENTIALS…",
    "AUTHORISING ACCESS…",
    "CLEARANCE GRANTED",
  ];

  /* ── Timeline ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("hold"),  80),
      setTimeout(() => setCorners(true),  900),
      setTimeout(() => setPhase("exit"),  FADE_OUT_AT),
      setTimeout(() => navigate("/"),     DURATION),
    ];
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  /* ── Status cycling ── */
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i < STATUS_LINES.length) setStatus(i);
      else clearInterval(id);
    }, STATUS_INTERVAL);
    return () => clearInterval(id);
  }, []);

  /* ── Typewriter tagline (starts at 1.2s) ── */
  useEffect(() => {
    let idx   = 0;
    let timer;
    const start = setTimeout(() => {
      const type = () => {
        idx++;
        setTyped(TAGLINE.slice(0, idx));
        if (idx < TAGLINE.length) timer = setTimeout(type, 42);
      };
      type();
    }, 1200);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, []);

  /* ── Glitch bursts ── */
  useEffect(() => {
    let t;
    const burst = () => {
      const rx = -(4 + Math.random() * 12);
      const ry = (Math.random() - 0.5) * 10;
      const bx =  (4 + Math.random() * 12);
      const by = (Math.random() - 0.5) * 10;
      setRgb({ rx, ry, bx, by });
      setGlitch(true);
      setTimeout(() => {
        setGlitch(false);
        setRgb({ rx: 0, ry: 0, bx: 0, by: 0 });
        // micro second burst right after — double-hit feel
        if (Math.random() < 0.35) {
          setTimeout(() => {
            setRgb({ rx: -(2 + Math.random() * 6), ry: (Math.random()-0.5)*4, bx: (2 + Math.random()*6), by: (Math.random()-0.5)*4 });
            setGlitch(true);
            setTimeout(() => { setGlitch(false); setRgb({ rx:0,ry:0,bx:0,by:0 }); }, 40 + Math.random()*50);
          }, 80);
        }
      }, 55 + Math.random() * 110);
      t = setTimeout(burst, 400 + Math.random() * 900);
    };
    t = setTimeout(burst, 600);
    return () => clearTimeout(t);
  }, []);

  /* ── Canvas: scanlines + noise + slice ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (canvas.width !== W)  canvas.width  = W;
      if (canvas.height !== H) canvas.height = H;
      ctx.clearRect(0, 0, W, H);

      // scanlines — every 3px
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

      frame++;
      if (frame % 2 === 0) {
        // orange noise
        for (let n = 0; n < 70; n++) {
          ctx.fillStyle = `rgba(236,91,19,${Math.random() * 0.28})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 3 + 1, 1);
        }
        // white noise
        for (let n = 0; n < 35; n++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
        }
        // rare blue noise (complements RGB split)
        for (let n = 0; n < 15; n++) {
          ctx.fillStyle = `rgba(24,180,255,${Math.random() * 0.06})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, Math.random()*2+1, 1);
        }
      }

      // horizontal slice glitch
      if (Math.random() < 0.04 && W > 0 && H > 0) {
        const sy  = Math.floor(Math.random() * H);
        const sh  = Math.floor(Math.random() * 6 + 1);
        const dx  = (Math.random() - 0.5) * 55;
        try {
          const slice = ctx.getImageData(0, sy, W, sh);
          ctx.putImageData(slice, dx, sy);
        } catch (_) {}
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const isExit  = phase === "exit";
  const isEnter = phase === "enter";

  return (
    <div style={{
      position:   "fixed",
      inset:       0,
      zIndex:      9999,
      background: "#040303",
      overflow:   "hidden",
      opacity:     isEnter ? 0 : isExit ? 0 : 1,
      transition:  isExit
        ? "opacity 700ms cubic-bezier(0.76,0,0.24,1)"
        : "opacity 180ms ease",
    }}>

      {/* ── BG ghost image ── */}
      <img
        src="/loader.jpg" alt=""
        onError={e => { e.currentTarget.src = "/login.jpg"; e.currentTarget.onerror = null; }}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.07,
          filter: "grayscale(1) contrast(1.2)",
        }}
      />

      {/* ── Canvas (scanlines + noise) ── */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", mixBlendMode: "screen", opacity: 0.52,
      }} />

      {/* ── Vignette ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 72% 72% at 50% 50%, transparent 18%, rgba(0,0,0,0.95) 100%)",
      }} />

      {/* ── Animated corner brackets ── */}
      {["tl","tr","bl","br"].map((pos) => {
        const isTop    = pos.startsWith("t");
        const isLeft   = pos.endsWith("l");
        return (
          <div key={pos} style={{
            position: "absolute",
            top:    isTop    ? 22 : undefined,
            bottom: !isTop   ? 22 : undefined,
            left:   isLeft   ? 22 : undefined,
            right:  !isLeft  ? 22 : undefined,
            width:  22, height: 22,
            borderTop:    isTop    ? "1px solid rgba(236,91,19,0.45)" : "none",
            borderBottom: !isTop   ? "1px solid rgba(236,91,19,0.45)" : "none",
            borderLeft:   isLeft   ? "1px solid rgba(236,91,19,0.45)" : "none",
            borderRight:  !isLeft  ? "1px solid rgba(236,91,19,0.45)" : "none",
            opacity:      corners  ? 1 : 0,
            transform:    corners
              ? "scale(1)"
              : `scale(${isTop && isLeft ? "0.4 0.4" : isTop ? "1.6 0.4" : isLeft ? "0.4 1.6" : "1.6 1.6"})`,
            transition: `opacity 500ms ease ${isTop&&isLeft?0:isTop?60:isLeft?120:180}ms,
                         transform 500ms cubic-bezier(0.16,1,0.3,1) ${isTop&&isLeft?0:isTop?60:isLeft?120:180}ms`,
          }} />
        );
      })}

      {/* ── TOP-LEFT sys tag ── */}
      <div style={{
        position: "absolute", top: 24, left: 28,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 7, letterSpacing: "0.38em",
        color: "rgba(236,91,19,0.42)",
        animation: "vg-flicker 2.5s step-end infinite",
      }}>SYS://VERP.VAULT/GATE</div>

      {/* ── TOP-RIGHT timestamp ── */}
      <div style={{
        position: "absolute", top: 24, right: 28,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 7, letterSpacing: "0.28em",
        color: "rgba(255,255,255,0.09)",
      }}>{new Date().toISOString().slice(0, 19).replace("T", " ")}</div>

      {/* ══════════════════════════════════
          CENTRE STAGE
          ══════════════════════════════════ */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>

        {/* ── RGB-SPLIT LETTER ── */}
        <div style={{ position: "relative", lineHeight: 1, userSelect: "none" }}>

          {/* RED */}
          <span aria-hidden="true" style={{
            position: "absolute",
            top: rgbOffset.ry, left: rgbOffset.rx,
            fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
            fontSize: "clamp(110px,20vw,190px)",
            fontStyle: "italic", fontWeight: 300,
            color: "rgba(255,24,24,0.6)",
            mixBlendMode: "screen", display: "block",
            transition: glitchOn ? "none" : "top 80ms, left 80ms",
          }}>V</span>

          {/* BLUE */}
          <span aria-hidden="true" style={{
            position: "absolute",
            top: rgbOffset.by, left: rgbOffset.bx,
            fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
            fontSize: "clamp(110px,20vw,190px)",
            fontStyle: "italic", fontWeight: 300,
            color: "rgba(24,180,255,0.5)",
            mixBlendMode: "screen", display: "block",
            transition: glitchOn ? "none" : "top 80ms, left 80ms",
          }}>V</span>

          {/* MAIN */}
          <span style={{
            position: "relative", zIndex: 2, display: "block",
            fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
            fontSize: "clamp(110px,20vw,190px)",
            fontStyle: "italic", fontWeight: 300,
            color:   glitchOn ? "#ec5b13" : "#ffffff",
            filter:  glitchOn
              ? "drop-shadow(0 0 26px rgba(236,91,19,1)) drop-shadow(0 0 70px rgba(236,91,19,0.45))"
              : "drop-shadow(0 0 3px rgba(255,255,255,0.12))",
            transition: "color 50ms, filter 50ms",
          }}>V</span>
        </div>

        {/* ── BRAND WORD ── */}
        <div style={{
          marginTop: -14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "clamp(8px,1.2vw,11px)",
          letterSpacing: "0.72em",
          color: "rgba(255,255,255,0.16)",
          animation: "vg-up 500ms cubic-bezier(0.16,1,0.3,1) 350ms both",
        }}>VERP</div>

        {/* ── RULE ── */}
        <div style={{
          width: "min(280px,54vw)", height: 1,
          marginTop: 28,
          background: "linear-gradient(90deg,transparent,rgba(236,91,19,0.22) 18%,rgba(236,91,19,0.9) 50%,rgba(236,91,19,0.22) 82%,transparent)",
          animation: "vg-rule 700ms cubic-bezier(0.16,1,0.3,1) 440ms both",
          transformOrigin: "center",
        }} />

        {/* ── TYPEWRITER TAGLINE ── */}
        <div style={{
          marginTop: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 7, letterSpacing: "0.42em",
          color: "rgba(255,255,255,0.13)",
          minHeight: 12,
          display: "flex", alignItems: "center", gap: 2,
        }}>
          {typed}
          {typed.length < TAGLINE.length && (
            <span style={{ animation: "vg-cursor 0.7s step-end infinite", color: "rgba(236,91,19,0.5)" }}>|</span>
          )}
        </div>

        {/* ── USERNAME — gold shimmer ── */}
        {userName && (
          <div style={{
            marginTop: 28,
            textAlign: "center",
            animation: "vg-up 600ms cubic-bezier(0.16,1,0.3,1) 700ms both",
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 7, letterSpacing: "0.48em",
              color: "rgba(255,255,255,0.16)",
              marginBottom: 9,
            }}>IDENTITY CONFIRMED</div>
            {/* gold shimmer name */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(18px,3.4vw,28px)",
              background: "linear-gradient(90deg, #c8973a 0%, #f5d07a 30%, #ec5b13 52%, #f5d07a 74%, #c8973a 100%)",
              backgroundSize: "250% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "vg-shimmer 2.4s linear infinite",
              letterSpacing: "0.04em",
            }}>{userName}</div>
          </div>
        )}

        {/* ── STATUS LINE ── */}
        <div style={{
          marginTop: userName ? 28 : 32,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 7.5, letterSpacing: "0.38em",
          color: "rgba(236,91,19,0.62)",
          textAlign: "center",
          minHeight: 13,
          animation: "vg-flicker 2.1s step-end infinite",
        }}>{STATUS_LINES[statusIdx]}</div>

        {/* ── PROGRESS TRACK ── */}
        <div style={{
          width: "min(260px,52vw)", height: 1,
          marginTop: 14,
          background: "rgba(255,255,255,0.06)",
          position: "relative", overflow: "hidden",
          animation: "vg-up 400ms ease 750ms both",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            background: "linear-gradient(90deg,transparent,rgba(236,91,19,0.45),#ec5b13,rgba(236,91,19,0.45))",
            animation: `vg-prog ${FADE_OUT_AT - 600}ms cubic-bezier(0.22,0,0.78,1) 650ms both`,
          }} />
          {glitchOn && (
            <div style={{
              position: "absolute", top: -1,
              left: `${38 + Math.random() * 44}%`,
              width: 3, height: 3, background: "#fff",
            }} />
          )}
        </div>

        {/* ── SCANLINE HORIZONTAL SLICES (glitch overlay on centre) ── */}
        {glitchOn && (
          <>
            <div style={{
              position: "absolute",
              top: `${12 + Math.random() * 58}%`,
              left: 0, right: 0,
              height: `${1 + Math.random() * 6}px`,
              background: "rgba(236,91,19,0.07)",
              transform: `translateX(${(Math.random()-0.5)*44}px)`,
              mixBlendMode: "screen", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              top: `${58 + Math.random() * 28}%`,
              left: 0, right: 0, height: "1px",
              background: "rgba(255,255,255,0.035)",
              transform: `translateX(${(Math.random()-0.5)*65}px)`,
              pointerEvents: "none",
            }} />
          </>
        )}

      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{
        position: "absolute", bottom: 26, left: 28, right: 28,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'JetBrains Mono', monospace",
        animation: "vg-up 500ms ease 1000ms both",
      }}>
        <span style={{ fontSize: 6.5, letterSpacing: "0.4em", color: "rgba(255,255,255,0.07)" }}>
          VAULT·{new Date().getFullYear()}
        </span>
        <span style={{
          fontSize: 10, color: "rgba(236,91,19,0.45)",
          animation: "vg-cursor 0.9s step-end infinite",
        }}>█</span>
        <span style={{ fontSize: 6.5, letterSpacing: "0.4em", color: "rgba(255,255,255,0.07)" }}>
          SECURE·CHANNEL
        </span>
      </div>

      <style>{`
        @keyframes vg-flicker {
          0%,18%,22%,25%,53%,57%,100% { opacity:1 }
          20%,23%,54%,56% { opacity:0.22 }
        }
        @keyframes vg-cursor {
          0%,49%{opacity:1} 50%,100%{opacity:0}
        }
        @keyframes vg-up {
          from{opacity:0;transform:translateY(13px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes vg-rule {
          from{transform:scaleX(0);opacity:0}
          to{transform:scaleX(1);opacity:1}
        }
        @keyframes vg-prog {
          0%{width:0%}
          50%{width:68%}
          78%{width:85%}
          100%{width:100%}
        }
        @keyframes vg-shimmer {
          0%{background-position:250% center}
          100%{background-position:-250% center}
        }
      `}</style>
    </div>
  );
}