import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ChatBot from "./ChatBot";
import LiveAssistantChat from "./LiveAssistantChat";
import Swal from "sweetalert2";

/* ══════════════════════════════════════════════════════
   OFFLINE MODAL
   Premium full-screen overlay shown when the assistant
   is not online and the user tries to escalate.
   ══════════════════════════════════════════════════════ */
const OfflineModal = ({ onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* Slight tick so the enter animation fires */
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 350);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      opacity: visible ? 1 : 0,
      transition: "opacity 350ms ease",
    }}>
      <style>{`
        @keyframes offlineCardIn {
          from { opacity:0; transform:scale(0.94) translateY(16px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        @keyframes offlineDotBlink {
          0%,100% { opacity:1; } 50% { opacity:0.2; }
        }
        @keyframes offlineOrbit {
          from { transform:rotate(0deg) translateX(36px) rotate(0deg); }
          to   { transform:rotate(360deg) translateX(36px) rotate(-360deg); }
        }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 440,
        background: "linear-gradient(160deg,#111111,#0b0b0b)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 32,
        overflow: "hidden",
        boxShadow: "0 60px 140px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03) inset",
        animation: visible ? "offlineCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both" : "none",
        position: "relative",
      }}>

        {/* Top colour band */}
        <div style={{
          height: 3,
          background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.6),transparent)",
        }} />

        <div style={{ padding: "44px 36px 40px", textAlign: "center" }}>

          {/* Animated icon cluster */}
          <div style={{
            position: "relative",
            width: 88, height: 88,
            margin: "0 auto 32px",
          }}>
            {/* Outer ring */}
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(239,68,68,0.12)",
            }} />
            {/* Middle ring */}
            <div style={{
              position: "absolute", inset: 10,
              borderRadius: "50%",
              border: "1px solid rgba(239,68,68,0.18)",
            }} />
            {/* Core */}
            <div style={{
              position: "absolute", inset: 20,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 24, color: "#ef4444",
              }}>
                support_agent
              </span>
            </div>
            {/* Orbiting dot */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 8, height: 8,
              marginTop: -4, marginLeft: -4,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.5)",
              animation: "offlineOrbit 3s linear infinite",
            }} />
          </div>

          {/* Status badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 999,
            marginBottom: 20,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#ef4444",
              animation: "offlineDotBlink 1.8s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(239,68,68,0.75)",
            }}>
              Support Offline
            </span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 26, fontStyle: "italic",
            color: "#fff", margin: "0 0 10px",
          }}>
            No Agents Available
          </h2>

          {/* Body */}
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13, lineHeight: 1.75,
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 8px",
          }}>
            Our support team is currently <strong style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>offline</strong> and not taking live sessions at this time.
          </p>
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13, lineHeight: 1.75,
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 36px",
          }}>
            The automated assistant is still available and can help with orders, returns, and common questions. Try again during working hours.
          </p>

          {/* Divider */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)",
            margin: "0 0 28px",
          }} />

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Primary: back to bot */}
            <button
              onClick={handleClose}
              style={{
                width: "100%",
                background: "linear-gradient(135deg,#1a1a1a,#141414)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 14,
                padding: "15px 0",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer", transition: "all 200ms",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>smart_toy</span>
              Continue with Bot
            </button>

            {/* Secondary: dismiss */}
            <button
              onClick={handleClose}
              style={{
                background: "transparent", border: "none",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.18)",
                cursor: "pointer", padding: "4px 0",
                transition: "color 200ms",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.18)"}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   BOT HINT BANNER
   ══════════════════════════════════════════════════════ */
const BotHintBanner = ({ onEscalate }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{
      marginBottom: 10,
      borderRadius: 16,
      background: "rgba(236,91,19,0.06)",
      border: "1px solid rgba(236,91,19,0.16)",
      padding: "12px 14px",
      animation: "hintIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
      position: "relative",
      flexShrink: 0,
    }}>
      <style>{`
        @keyframes hintIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
        <span className="material-symbols-outlined" style={{ fontSize:15, color:"#ec5b13", flexShrink:0 }}>smart_toy</span>
        <span style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:8, letterSpacing:"0.22em",
          textTransform:"uppercase", color:"#ec5b13", fontWeight:700,
        }}>Scripted Bot — Not AI</span>
        <button
          onClick={() => setVisible(false)}
          style={{
            marginLeft:"auto", background:"none", border:"none",
            cursor:"pointer", padding:0, color:"rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", lineHeight:1,
            transition:"color 150ms",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
        >
          <span className="material-symbols-outlined" style={{ fontSize:15 }}>close</span>
        </button>
      </div>

      <p style={{
        fontFamily:"'DM Sans',sans-serif",
        fontSize:12, lineHeight:1.6,
        color:"rgba(255,255,255,0.45)",
        margin:"0 0 10px",
      }}>
        This assistant follows a <strong style={{ color:"rgba(255,255,255,0.65)", fontWeight:600 }}>fixed script</strong> — it can handle orders, sizing and returns, but it won't understand open-ended questions the way a real person would. If it can't help you, connect to the team directly.
      </p>

      <button
        onClick={onEscalate}
        style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"6px 13px", borderRadius:8,
          background:"transparent",
          border:"1px solid rgba(236,91,19,0.28)",
          cursor:"pointer", transition:"all 180ms",
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:8, letterSpacing:"0.18em",
          textTransform:"uppercase", color:"#ec5b13",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(236,91,19,0.1)";
          e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(236,91,19,0.28)";
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize:13 }}>support_agent</span>
        Talk to Support
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   AGENT ONLINE BANNER
   Slides up from the bottom when support goes live
   while the client is still on the bot screen.
   ══════════════════════════════════════════════════════ */
const AgentOnlineBanner = ({ onConnect, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const dismiss = () => { setVisible(false); setTimeout(onDismiss, 380); };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 8500,
      display: "flex", justifyContent: "center",
      padding: "0 16px 28px",
      transform: visible ? "translateY(0)" : "translateY(120%)",
      transition: "transform 420ms cubic-bezier(0.16,1,0.3,1)",
      pointerEvents: visible ? "auto" : "none",
    }}>
      <style>{`
        @keyframes agentPulseRing {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          60%      { box-shadow: 0 0 0 9px rgba(34,197,94,0); }
        }
      `}</style>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "linear-gradient(160deg,#0d1a0d,#090f09)",
        border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: 20,
        padding: "16px 18px",
        boxShadow: "0 20px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(34,197,94,0.07) inset",
        display: "flex", alignItems: "center", gap: 13,
      }}>
        {/* Pulsing icon */}
        <div style={{
          flexShrink: 0, width: 38, height: 38, borderRadius: "50%",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "agentPulseRing 1.8s ease-in-out infinite",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#22c55e" }}>support_agent</span>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(34,197,94,0.8)", margin: "0 0 3px",
          }}>Agent Online</p>
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 12, lineHeight: 1.4,
            color: "rgba(255,255,255,0.5)", margin: 0,
          }}>A live support agent is now available.</p>
        </div>

        {/* Connect CTA */}
        <button
          onClick={() => { dismiss(); onConnect(); }}
          style={{
            flexShrink: 0,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            border: "none", borderRadius: 10,
            padding: "9px 15px",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#000", cursor: "pointer", transition: "filter 200ms",
          }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.12)"}
          onMouseLeave={e => e.currentTarget.style.filter = "none"}
        >Connect</button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          style={{
            flexShrink: 0, background: "none", border: "none",
            cursor: "pointer", padding: 4, lineHeight: 1,
            color: "rgba(255,255,255,0.2)", display: "flex",
            alignItems: "center", transition: "color 150ms",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   SUPPORT PAGE
   ══════════════════════════════════════════════════════ */

/* ── tiny sound helper — silently fails if browser blocks autoplay ── */
const playSound = () => {
  try {
    const audio = new Audio("/notify.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (_) {}
};

const SupportPage = () => {
  const navigate = useNavigate();
  const [sessionStatus,   setSessionStatus]   = useState("bot");
  const [chatId,          setChatId]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [supportOnline,   setSupportOnline]   = useState(false);
  const [showOffline,     setShowOffline]     = useState(false);
  const [agentJustOnline, setAgentJustOnline] = useState(false);
  const channelRef    = useRef(null);
  const prevOnlineRef = useRef(null);
  const prevStatusRef = useRef("bot");

  useEffect(() => {
    const check = async () => {
      const userEmail = localStorage.getItem("userEmail");

      /* Check support status in parallel */
      const [sessionRes, statusRes] = await Promise.all([
        userEmail
          ? supabase
              .from("verp_support_sessions")
              .select("*")
              .eq("client_email", userEmail)
              .neq("status", "resolved")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("verp_support_status")
          .select("is_online")
          .eq("id", 1)
          .maybeSingle(),
      ]);

      if (sessionRes.data) {
        setChatId(sessionRes.data.id);
        setSessionStatus(sessionRes.data.status);
      }
      setSupportOnline(statusRes.data?.is_online ?? false);
      prevOnlineRef.current = statusRes.data?.is_online ?? false;
      setLoading(false);
    };
    check();
  }, []);

  /* Realtime: keep support-status in sync */
  useEffect(() => {
    const channel = supabase
      .channel("sp_support_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verp_support_status", filter: "id=eq.1" },
        (payload) => {
          const newOnline = payload.new?.is_online ?? false;
          // Only show banner if we transition false → true (and client is still on bot screen)
          if (prevOnlineRef.current === false && newOnline === true) {
            setAgentJustOnline(true);
            playSound(); // 🔔 client hears agent come online
          }
          prevOnlineRef.current = newOnline;
          setSupportOnline(newOnline);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!chatId) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const channel = supabase
      .channel(`sp-session-${chatId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public",
        table: "verp_support_sessions", filter: `id=eq.${chatId}`,
      }, (payload) => {
          const newStatus = payload.new.status;
          if (prevStatusRef.current !== "live" && newStatus === "live") {
            playSound(); // ✅ client hears session connected
          }
          prevStatusRef.current = newStatus;
          setSessionStatus(newStatus);
        })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [chatId]);

  useEffect(() => {
    if (!chatId || sessionStatus === "resolved" || sessionStatus === "bot") return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from("verp_support_sessions")
        .select("status").eq("id", chatId).maybeSingle();
      if (data && data.status !== sessionStatus) setSessionStatus(data.status);
    }, 5000);
    return () => clearInterval(interval);
  }, [chatId, sessionStatus]);

  /* Fallback poll for support status every 10s (safety net if realtime drops) */
  useEffect(() => {
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from("verp_support_status")
        .select("is_online")
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        const newOnline = data.is_online ?? false;
        if (prevOnlineRef.current === false && newOnline === true && sessionStatus === "bot") {
          setAgentJustOnline(true);
          playSound(); // 🔔 fallback: client hears agent come online
        }
        if (prevOnlineRef.current !== newOnline) {
          prevOnlineRef.current = newOnline;
          setSupportOnline(newOnline);
        }
      }
    }, 10000);
    return () => clearInterval(poll);
  }, [sessionStatus]);

  const handleEscalate = async () => {
    /* Gate: check if support is online first */
    if (!supportOnline) {
      setShowOffline(true);
      return;
    }

    let userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      const { value: email } = await Swal.fire({
        title: "IDENTIFICATION REQUIRED",
        html: `<p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.2em;margin-bottom:8px;text-transform:uppercase">ENTER YOUR EMAIL TO CONNECT</p>`,
        input: "email",
        inputPlaceholder: "your@email.com",
        background: "#0d0d0d", color: "#fff",
        confirmButtonColor: "#ec5b13", showCancelButton: true,
        customClass: { popup: "swal-vault" },
      });
      if (!email) return;
      userEmail = email;
      localStorage.setItem("userEmail", email);
    }
    const { data, error } = await supabase.from("verp_support_sessions")
      .insert([{ client_email: userEmail, status: "waiting" }])
      .select().single();
    if (data) { setChatId(data.id); setSessionStatus("waiting"); }
    else Swal.fire({ title:"CONNECTION FAILED", text: error?.message || "Could not reach the Vault.", background:"#0d0d0d", color:"#fff", icon:"error", confirmButtonColor:"#ec5b13" });
  };

  const handleSessionEnded = () => setSessionStatus("resolved");

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(236,91,19,0.15)",borderTopColor:"#ec5b13",animation:"spin 1.1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.4em",color:"rgba(236,91,19,0.5)",textTransform:"uppercase"}}>SYNCING</p>
    </div>
  );

  return (
    <>
      <style>{`
        .swal-vault{border:1px solid rgba(255,255,255,0.08)!important;border-radius:20px!important;}
        @keyframes spinW{to{transform:rotate(360deg)}}
        @keyframes pulseW{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes backBtnIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* Offline modal */}
      {showOffline && <OfflineModal onClose={() => setShowOffline(false)} />}

      {/* Agent just came online — slide-up banner (only while on bot screen) */}
      {agentJustOnline && sessionStatus === "bot" && (
        <AgentOnlineBanner
          onConnect={() => { setAgentJustOnline(false); handleEscalate(); }}
          onDismiss={() => setAgentJustOnline(false)}
        />
      )}

      {/* Full-screen chat surface */}
      <div style={{
        position:"fixed", inset:0, background:"#080808", zIndex:200,
        display:"flex", flexDirection:"column",
      }}>

        {/* ── Header ── */}
        <div style={{
          height:64, flexShrink:0,
          display:"flex", alignItems:"center",
          padding:"0 24px",
          borderBottom:"1px solid rgba(255,255,255,0.04)",
          background:"rgba(8,8,8,0.9)",
          backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display:"flex", alignItems:"center", gap:10,
              background:"transparent",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:999,
              padding:"7px 16px 7px 12px",
              cursor:"pointer",
              color:"rgba(255,255,255,0.5)",
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:8, letterSpacing:"0.25em", textTransform:"uppercase",
              transition:"all 200ms",
              animation:"backBtnIn 0.4s ease both",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)";
              e.currentTarget.style.color = "#ec5b13";
              e.currentTarget.querySelector(".back-icon").style.transform = "translateX(-3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              e.currentTarget.querySelector(".back-icon").style.transform = "translateX(0)";
            }}
          >
            <span className="material-symbols-outlined back-icon" style={{fontSize:16, transition:"transform 200ms"}}>
              arrow_back
            </span>
            Back
          </button>

          <div style={{ position:"absolute",left:"50%",transform:"translateX(-50%)", textAlign:"center" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontStyle:"italic", color:"rgba(255,255,255,0.8)", margin:0 }}>
              VERP SUPPORT
            </p>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, letterSpacing:"0.3em", color:"rgba(255,255,255,0.2)", textTransform:"uppercase", margin:"2px 0 0" }}>
              {sessionStatus === "bot"      && (supportOnline ? "Automated Assistant" : "Automated Assistant · Support Offline")}
              {sessionStatus === "waiting"  && "Connecting..."}
              {sessionStatus === "live"     && "● Live Session"}
              {sessionStatus === "resolved" && "Session Ended"}
            </p>
          </div>
        </div>

        {/* ── Chat area ── */}
        <div style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center",
          padding:"16px 20px 20px", overflow:"hidden",
        }}>
          <div style={{width:"100%", maxWidth:480, height:"100%", maxHeight:640, display:"flex", flexDirection:"column"}}>

            {sessionStatus === "bot" && (
              <>
                <BotHintBanner onEscalate={handleEscalate} />
                <ChatBot onEscalate={handleEscalate} chatId={chatId} supportOnline={supportOnline} />
              </>
            )}

            {sessionStatus === "waiting" && (
              <div style={{height:"100%",background:"#0d0d0d",border:"1px solid rgba(255,255,255,0.06)",borderRadius:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28}}>
                <div style={{position:"relative",width:60,height:60}}>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(236,91,19,0.1)"}}/>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid transparent",borderTopColor:"#ec5b13",animation:"spinW 1.1s linear infinite"}}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span className="material-symbols-outlined" style={{fontSize:22,color:"#ec5b13",opacity:0.5}}>support_agent</span>
                  </div>
                </div>
                <div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:8}}>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontStyle:"italic",color:"white"}}>Awaiting Agent</h2>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.3em",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",animation:"pulseW 2s ease-in-out infinite"}}>
                    ESTABLISHING SECURE LINK...
                  </p>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.15)",letterSpacing:"0.2em"}}>
                    Session will begin automatically
                  </p>
                </div>
                <button onClick={async()=>{
                  if(chatId){await supabase.from("verp_support_sessions").update({status:"resolved"}).eq("id",chatId);}
                  setChatId(null); setSessionStatus("bot");
                }} style={{background:"transparent",border:"1px solid rgba(239,68,68,0.3)",color:"rgba(239,68,68,0.6)",fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",padding:"8px 20px",borderRadius:999,cursor:"pointer",transition:"all 200ms"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  Leave Queue
                </button>
              </div>
            )}

            {(sessionStatus==="live"||sessionStatus==="escalated"||sessionStatus==="full_push") && chatId && (
              <LiveAssistantChat chatId={chatId} role="client" onSessionEnded={handleSessionEnded}/>
            )}

            {sessionStatus==="resolved" && (
              <ChatBot
                mode="rating"
                chatId={chatId}
                onFinishedRating={() => {
                  setChatId(null); setSessionStatus("bot");
                  localStorage.removeItem("vault_chat_history");
                  localStorage.removeItem("vault_awaiting_order");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;