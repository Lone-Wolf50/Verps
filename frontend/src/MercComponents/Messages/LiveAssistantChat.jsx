import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

/* ─── BUBBLE ─────────────────────────────────────────────────── */
const ChatBubble = ({ msg, viewerRole, isNew }) => {
  const isMe = msg.sender_role === viewerRole;
  return (
    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", animation: isNew ? (isMe ? "msgUser 0.25s cubic-bezier(0.16,1,0.3,1) both" : "msgBot 0.25s cubic-bezier(0.16,1,0.3,1) both") : "none" }}>
      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 4 }}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.25em", textTransform: "uppercase", color: isMe ? "rgba(236,91,19,0.55)" : "rgba(255,255,255,0.22)", paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0 }}>
          {isMe ? "YOU" : msg.sender_role === "assistant" ? "VAULT SUPPORT" : msg.sender_role === "admin" ? "ASSISTANT" : "CLIENT"}
        </p>
        <div style={{ padding: "12px 16px", background: isMe ? "#ec5b13" : "linear-gradient(135deg,#1a1a1a,#141414)", border: isMe ? "none" : "1px solid rgba(255,255,255,0.07)", borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.65, color: isMe ? "#000" : "rgba(255,255,255,0.8)", fontWeight: isMe ? 500 : 400 }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
};

/* ─── PARTIAL PUSH HOLD SCREEN (for client) ──────────────────── */
const PartialPushHold = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "40px 24px", textAlign: "center" }}>
    {/* Animated spinner */}
    <div style={{ position: "relative", width: 56, height: 56 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(236,91,19,0.1)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid transparent", borderTopColor: "#ec5b13", animation: "holdSpin 1.1s linear infinite" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#ec5b13", opacity: 0.6 }}>hourglass_top</span>
      </div>
    </div>
    <div>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontStyle: "italic", color: "white", marginBottom: 8 }}>Brief Review in Progress</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", lineHeight: 1.8, animation: "holdPulse 2s ease-in-out infinite" }}>
        YOUR AGENT IS CONSULTING A SPECIALIST<br />TO BEST ASSIST YOU
      </p>
    </div>
    <div style={{ padding: "14px 20px", background: "rgba(236,91,19,0.06)", border: "1px solid rgba(236,91,19,0.15)", borderRadius: 14, maxWidth: 320 }}>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
        We're reviewing your case to ensure you get the best possible solution. This usually takes just a moment — please stay connected.
      </p>
    </div>
    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", animation: "holdPulse 2s ease-in-out infinite" }}>
      DO NOT CLOSE THIS WINDOW
    </p>
  </div>
);

/* ─── LIVE ASSISTANT CHAT ─────────────────────────────────────── */
const LiveAssistantChat = ({
  chatId,
  role = "client", // "client" | "assistant" | "admin"
  readOnly = false,
  compact = false,
  onSessionEnded,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [resolved, setResolved] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("live");
  const [latestIdx, setLatestIdx] = useState(-1);
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  /* ── Fetch + poll ─────────────────────────────────────────── */
  const sync = async () => {
    const { data: msgs } = await supabase
      .from("verp_chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (msgs) {
      setMessages(prev => {
        if (msgs.length > prev.length) setLatestIdx(msgs.length - 1);
        return msgs;
      });
    }

    const { data: sess } = await supabase
      .from("verp_support_sessions")
      .select("status")
      .eq("id", chatId)
      .maybeSingle();

    if (sess) {
      setSessionStatus(sess.status);
      if (sess.status === "resolved" || sess.status === "completed") {
        setResolved(true);
        if (onSessionEnded) onSessionEnded();
      }
    }
  };

  useEffect(() => {
    if (!chatId || resolved) return;
    sync();
    pollRef.current = setInterval(sync, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line
  }, [chatId, resolved]);

  /* ── Auto-scroll ──────────────────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* ── Send ─────────────────────────────────────────────────── */
  const sendMessage = async (e) => {
    e.preventDefault();
    // Block client input during partial push (escalated) 
    if (!input.trim() || readOnly || resolved) return;
    if (role === "client" && sessionStatus === "escalated") return;
    const content = input.trim();
    setInput("");
    await supabase.from("verp_chat_messages").insert([{ chat_id: chatId, sender_role: role, content }]);
    setMessages(prev => {
      setLatestIdx(prev.length);
      return [...prev, { id: Date.now(), chat_id: chatId, sender_role: role, content, created_at: new Date().toISOString() }];
    });
  };

  /* ── Client terminate ─────────────────────────────────────── */
  const handleTerminate = async () => {
    const result = await Swal.fire({
      title: "END SESSION?",
      text: "This will close your live support session.",
      background: "#0d0d0d", color: "#fff",
      showCancelButton: true, confirmButtonColor: "#ec5b13", cancelButtonColor: "#1c1c1c",
      confirmButtonText: "END SESSION", cancelButtonText: "KEEP OPEN",
    });
    if (result.isConfirmed) {
      await supabase.from("verp_support_sessions").update({ status: "resolved" }).eq("id", chatId);
      setResolved(true);
      if (onSessionEnded) onSessionEnded();
    }
  };

  // Partial push = escalated — client sees hold screen instead of blank
  const isPartialPush = role === "client" && sessionStatus === "escalated";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: compact ? "100%" : "560px", width: "100%", background: "#080808", border: "1px solid rgba(255,255,255,0.06)", borderRadius: compact ? 0 : 28, overflow: "hidden", position: "relative" }}>
      {/* HEADER */}
      <div style={{ height: 52, background: "#0d0d0d", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", padding: "0 18px", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: resolved ? "#6b7280" : isPartialPush ? "#f59e0b" : "#22c55e", animation: resolved ? "none" : "pulseLive 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", color: resolved ? "rgba(107,114,128,0.8)" : isPartialPush ? "rgba(245,158,11,0.8)" : "rgba(34,197,94,0.8)", textTransform: "uppercase" }}>
            {resolved ? "SESSION ENDED" : isPartialPush ? "UNDER REVIEW" : "LIVE SESSION"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {readOnly && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.18em" }}>READ ONLY</span>}
          {role === "client" && !resolved && !readOnly && !isPartialPush && (
            <button onClick={handleTerminate}
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(239,68,68,0.75)", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 999, cursor: "pointer", transition: "all 200ms" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(239,68,68,0.75)"; }}>
              End Session
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES or PARTIAL PUSH HOLD SCREEN */}
      {isPartialPush ? (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* Show existing messages above the hold screen */}
          {messages.length > 0 && (
            <div style={{ padding: "18px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((msg, idx) => (
                <ChatBubble key={msg.id || idx} msg={msg} viewerRole={role} isNew={false} />
              ))}
            </div>
          )}
          <PartialPushHold />
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14, scrollbarWidth: "thin", scrollbarColor: "rgba(236,91,19,0.3) transparent" }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.15 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>forum</span>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase" }}>NO MESSAGES YET</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <ChatBubble key={msg.id || idx} msg={msg} viewerRole={role} isNew={idx === latestIdx} />
          ))}
        </div>
      )}

      {/* INPUT */}
      {!readOnly && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "#0d0d0d", padding: "13px 16px", flexShrink: 0 }}>
          {resolved ? (
            <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "10px 0" }}>SESSION HAS ENDED</div>
          ) : isPartialPush && role === "client" ? (
            <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(245,158,11,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "10px 0", animation: "holdPulse 2s ease-in-out infinite" }}>AGENT REVIEWING — REPLY PAUSED</div>
          ) : (
            <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="TYPE MESSAGE..."
                style={{ flex: 1, background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, padding: "10px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", outline: "none" }} />
              <button type="submit"
                style={{ background: "#ec5b13", border: "none", borderRadius: 11, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#000", transition: "filter 200ms" }}
                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                onMouseLeave={e => e.currentTarget.style.filter = "none"}>
                SEND
              </button>
            </form>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulseLive{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes msgBot{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes msgUser{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes holdSpin{to{transform:rotate(360deg)}}
        @keyframes holdPulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
    </div>
  );
};

export default LiveAssistantChat;
