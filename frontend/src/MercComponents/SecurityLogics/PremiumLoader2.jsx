import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DURATION    = 6800;
const FADE_OUT_AT = 5800;

const CIPHER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·∙▸";

function useCipher(target, delay = 0, speed = 34) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let frame = 0, t;
    const st = setTimeout(() => {
      const total = target.length * 3;
      const tick = () => {
        frame++;
        const reveal = Math.floor((frame / total) * target.length);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          if ([" ", "·", "—"].includes(target[i])) { out += target[i]; continue; }
          if (i < reveal) out += target[i];
          else if (i < reveal + 4) out += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          else out += "·";
        }
        setDisplay(out);
        if (frame < total + 6) t = setTimeout(tick, speed);
        else setDisplay(target);
      };
      tick();
    }, delay);
    return () => { clearTimeout(st); clearTimeout(t); };
  }, [target]);
  return display;
}

const STATUS = [
  "INITIALISING PROTOCOL",
  "VERIFYING CREDENTIALS",
  "DECRYPTING CLEARANCE",
  "UNLOCKING VERP",
  "ACCESS GRANTED",
];

export default function PremiumLoader2() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "";

  const [phase,     setPhase]    = useState("enter");
  const [statusIdx, setStatus]   = useState(0);
  const [revealed,  setRevealed] = useState(false);
  const [nameReady, setNameReady]= useState(false);
  const [glitch,    setGlitch]   = useState(false);

  const bgRef    = useRef(null);
  const noiseRef = useRef(null);
  const rafBg    = useRef(null);
  const rafNoise = useRef(null);

  const cipherStatus = useCipher(STATUS[statusIdx], 120, 24);
  const cipherName   = useCipher(userName ? userName.toUpperCase() : "", 1600, 30);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase("hold"),   60),
      setTimeout(() => setRevealed(true),  300),
      setTimeout(() => setNameReady(true), 1200),
      setTimeout(() => setPhase("exit"),   FADE_OUT_AT),
      setTimeout(() => navigate("/"),      DURATION),
    ];
    return () => t.forEach(clearTimeout);
  }, [navigate]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { i++; if (i < STATUS.length) setStatus(i); else clearInterval(id); }, 960);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let t;
    const burst = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 55 + Math.random() * 90);
      t = setTimeout(burst, 700 + Math.random() * 1500);
    };
    t = setTimeout(burst, 1400);
    return () => clearTimeout(t);
  }, []);

  /* ── Liquid amber BG ── */
  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    const orbs = [
      { x:0.14, y:0.22, r:0.58, c:[115,42,3],  s:0.00011 },
      { x:0.83, y:0.68, r:0.48, c:[185,80,8],  s:0.00017 },
      { x:0.50, y:0.98, r:0.40, c:[85, 28,2],  s:0.00023 },
      { x:0.04, y:0.78, r:0.30, c:[225,112,14],s:0.00015 },
      { x:0.92, y:0.14, r:0.34, c:[158,56,5],  s:0.00019 },
      { x:0.48, y:0.50, r:0.24, c:[205,92,10], s:0.00028 },
    ];
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      ctx.clearRect(0, 0, W, H);
      t++;
      orbs.forEach((o, i) => {
        const ox = (o.x + Math.sin(t * o.s * 1000 + i * 1.7) * 0.09) * W;
        const oy = (o.y + Math.cos(t * o.s * 1000 + i * 1.1) * 0.08) * H;
        const radius = o.r * Math.max(W, H);
        const pulse = 0.6 + 0.4 * Math.sin(t * o.s * 800 + i * 0.9);
        const [r, g, b] = o.c;
        const g2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        g2.addColorStop(0,   `rgba(${r},${g},${b},${0.24 * pulse})`);
        g2.addColorStop(0.35,`rgba(${r},${g},${b},${0.10 * pulse})`);
        g2.addColorStop(0.7, `rgba(${r},${g},${b},${0.03 * pulse})`);
        g2.addColorStop(1,   `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      });
      const by = (0.46 + 0.05 * Math.sin(t * 0.0004)) * H;
      const bg = ctx.createLinearGradient(0, by - 120, 0, by + 120);
      bg.addColorStop(0,   "rgba(175,90,10,0)");
      bg.addColorStop(0.5, `rgba(175,90,10,${0.028 + 0.012 * Math.sin(t * 0.0006)})`);
      bg.addColorStop(1,   "rgba(175,90,10,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      rafBg.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafBg.current);
  }, []);

  /* ── Noise + scanlines ── */
  useEffect(() => {
    const canvas = noiseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(0,0,0,0.13)";
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
      frame++;
      if (frame % 2 === 0) {
        for (let n = 0; n < 65; n++) {
          ctx.fillStyle = `rgba(215,110,14,${Math.random() * 0.15})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 2 + 1, 1);
        }
        for (let n = 0; n < 28; n++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.020})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
        }
      }
      if (Math.random() < 0.026 && W > 0 && H > 0) {
        const sy = Math.floor(Math.random() * H), sh = Math.floor(Math.random() * 4 + 1);
        const dx = (Math.random() - 0.5) * 38;
        try { const sl = ctx.getImageData(0, sy, W, sh); ctx.putImageData(sl, dx, sy); } catch (_) {}
      }
      rafNoise.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafNoise.current);
  }, []);

  const isEnter = phase === "enter";
  const isExit  = phase === "exit";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#030100", overflow:"hidden",
      opacity: isEnter ? 0 : isExit ? 0 : 1,
      transition: isExit ? "opacity 950ms cubic-bezier(0.76,0,0.24,1)" : "opacity 180ms ease",
    }}>
      <canvas ref={bgRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />

      {/* Deep vignette */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 62% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.97) 100%)",
      }} />

      {/* Micro gold grid — masked to centre */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`
          linear-gradient(rgba(198,108,10,0.016) 1px,transparent 1px),
          linear-gradient(90deg,rgba(198,108,10,0.016) 1px,transparent 1px)
        `,
        backgroundSize:"72px 72px",
        maskImage:"radial-gradient(ellipse 68% 68% at 50% 50%, black 8%, transparent 100%)",
        WebkitMaskImage:"radial-gradient(ellipse 68% 68% at 50% 50%, black 8%, transparent 100%)",
      }} />

      <canvas ref={noiseRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", mixBlendMode:"screen", opacity:0.34 }} />

      {/* Edge rules */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(205,125,14,0.10) 20%,rgba(205,125,14,0.25) 50%,rgba(205,125,14,0.10) 80%,transparent)",
        opacity: revealed ? 1 : 0, transition:"opacity 800ms ease 200ms",
      }} />
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(205,125,14,0.10) 20%,rgba(205,125,14,0.25) 50%,rgba(205,125,14,0.10) 80%,transparent)",
        opacity: revealed ? 1 : 0, transition:"opacity 800ms ease 200ms",
      }} />

      {/* Corner brackets */}
      {["tl","tr","bl","br"].map((pos) => {
        const T = pos[0]==="t", L = pos[1]==="l";
        return (
          <div key={pos} style={{
            position:"absolute",
            top: T ? 26 : undefined, bottom: !T ? 26 : undefined,
            left: L ? 26 : undefined, right: !L ? 26 : undefined,
            width:22, height:22,
            borderTop:    T  ? "1px solid rgba(208,128,16,0.44)" : "none",
            borderBottom: !T ? "1px solid rgba(208,128,16,0.44)" : "none",
            borderLeft:   L  ? "1px solid rgba(208,128,16,0.44)" : "none",
            borderRight:  !L ? "1px solid rgba(208,128,16,0.44)" : "none",
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(0.2)",
            transition:`opacity 550ms ease ${T&&L?0:T?55:L?110:165}ms, transform 550ms cubic-bezier(0.16,1,0.3,1) ${T&&L?0:T?55:L?110:165}ms`,
          }} />
        );
      })}

      {/* Centre stage */}
      <div style={{
        position:"absolute", inset:0,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>
        {/* V monogram */}
        <div style={{
          position:"relative",
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(22px)",
          transition:"opacity 700ms ease 200ms, transform 700ms cubic-bezier(0.16,1,0.3,1) 200ms",
        }}>
          <div style={{
            position:"absolute", inset:"-30px", borderRadius:"50%",
            background:`radial-gradient(ellipse at center, rgba(215,95,10,${glitch?0.20:0.11}) 0%, transparent 70%)`,
            filter:`blur(${glitch?30:22}px)`, transition:"all 80ms",
          }} />
          <span style={{
            position:"relative", display:"block",
            fontFamily:"'Cormorant Garamond','Playfair Display',Georgia,serif",
            fontSize:"clamp(105px,18vw,180px)",
            fontStyle:"italic", fontWeight:300, lineHeight:1,
            background: glitch
              ? "linear-gradient(135deg,#ec5b13 0%,#ff9500 30%,#ffd000 50%,#ff7200 70%,#ec5b13 100%)"
              : "linear-gradient(150deg,#7a3000 0%,#c85806 12%,#e88818 26%,#f5ae2e 40%,#fde070 52%,#f5ae2e 64%,#e07010 78%,#b04600 100%)",
            backgroundSize:"220% auto",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            filter: glitch
              ? "drop-shadow(0 0 42px rgba(255,138,18,1)) drop-shadow(0 0 100px rgba(228,78,8,0.9))"
              : "drop-shadow(0 0 34px rgba(215,138,16,0.88)) drop-shadow(0 0 80px rgba(175,78,5,0.44))",
            animation:"l2v 3.6s linear infinite",
            transition:"filter 55ms",
            userSelect:"none",
          }}>V</span>
        </div>

        {/* VERP wordmark */}
        <div style={{
          marginTop:-10,
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"clamp(9px,1.4vw,12px)", fontWeight:700,
          letterSpacing:"0.82em", paddingLeft:"0.82em",
          background:"linear-gradient(90deg,#b44c00,#ee9618,#ffd648,#ee9618,#b44c00)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          filter:"drop-shadow(0 0 9px rgba(242,162,24,0.88))",
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(12px)",
          transition:"opacity 600ms ease 380ms, transform 600ms cubic-bezier(0.16,1,0.3,1) 380ms",
          userSelect:"none",
        }}>VERP</div>

        {/* Divider */}
        <div style={{
          width:"min(258px,50vw)", height:"1px", margin:"26px 0",
          background:"linear-gradient(90deg,transparent,rgba(196,116,12,0.18) 12%,rgba(224,138,22,0.52) 33%,rgba(252,194,32,0.95) 50%,rgba(224,138,22,0.52) 67%,rgba(196,116,12,0.18) 88%,transparent)",
          boxShadow:"0 0 14px rgba(215,142,14,0.40)",
          opacity: revealed ? 1 : 0,
          transform: revealed ? "scaleX(1)" : "scaleX(0)",
          transition:"opacity 800ms ease 480ms, transform 800ms cubic-bezier(0.16,1,0.3,1) 480ms",
          transformOrigin:"center",
        }} />

        {/* User name */}
        {userName && (
          <div style={{
            textAlign:"center", marginBottom:28,
            opacity: nameReady ? 1 : 0,
            transform: nameReady ? "translateY(0)" : "translateY(14px)",
            transition:"opacity 700ms ease, transform 700ms cubic-bezier(0.16,1,0.3,1)",
          }}>
            <div style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:6.5, letterSpacing:"0.55em",
              color:"rgba(198,95,10,0.52)", marginBottom:10,
            }}>VAULT ACCESS — CONFIRMED</div>
            <div style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontStyle:"italic", fontWeight:300,
              fontSize:"clamp(24px,4.8vw,42px)",
              letterSpacing:"0.07em", lineHeight:1.1,
              background:"linear-gradient(112deg,#7a3000 0%,#d46008 12%,#f0a018 26%,#fcc800 42%,#fff4a0 54%,#fcc800 66%,#e09010 80%,#c05008 92%,#7a3000 100%)",
              backgroundSize:"260% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              animation:"l2name 3.2s linear infinite",
              filter:"drop-shadow(0 0 18px rgba(205,100,10,0.42))",
              minHeight:"1.2em",
            }}>{cipherName || userName.toUpperCase()}</div>
          </div>
        )}

        {/* Status line */}
        <div style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:7.5, letterSpacing:"0.40em",
          background:"linear-gradient(90deg,rgba(192,74,5,0.82),rgba(248,146,22,0.98),rgba(255,190,42,0.90),rgba(192,74,5,0.82))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          minHeight:14, textAlign:"center",
          opacity: revealed ? 1 : 0, transition:"opacity 500ms ease 600ms",
          animation:"l2flicker 2.6s step-end infinite",
        }}>{cipherStatus}</div>

        {/* Progress bar */}
        <div style={{
          width:"min(240px,48vw)", height:"1px", marginTop:18,
          background:"rgba(178,118,12,0.10)", position:"relative", overflow:"hidden",
          opacity: revealed ? 1 : 0, transition:"opacity 400ms ease 700ms",
        }}>
          <div style={{
            position:"absolute", top:0, left:0, height:"100%",
            background:"linear-gradient(90deg,transparent,rgba(185,114,12,0.55),#c49010,rgba(185,114,12,0.55))",
            boxShadow:"0 0 12px rgba(205,145,22,0.82)",
            animation:`l2prog ${FADE_OUT_AT - 750}ms cubic-bezier(0.22,0,0.78,1) 750ms both`,
          }} />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300&family=JetBrains+Mono:wght@300;400&display=swap');
        @keyframes l2v { 0%{background-position:220% center} 100%{background-position:-220% center} }
        @keyframes l2name { 0%{background-position:260% center} 100%{background-position:-260% center} }
        @keyframes l2flicker { 0%,18%,22%,25%,53%,57%,100%{opacity:1} 20%,23%,54%,56%{opacity:0.18} }
        @keyframes l2prog { 0%{width:0%} 45%{width:62%} 75%{width:82%} 100%{width:100%} }
      `}</style>
    </div>
  );
}