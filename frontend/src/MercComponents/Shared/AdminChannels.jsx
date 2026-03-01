/*
  AdminChannel.jsx — SHARED COMPONENT
  ─────────────────────────────────────────────────────────────────────────────
  Previously this file existed in two locations with near-identical code:
    • src/Administration/AdminChannel.jsx   (admin POV, sender = "admin")
    • src/Assistant/AdminChannel.jsx        (assistant POV, sender = "assistant")

  This caused a Lighthouse "Duplicated JavaScript" warning (10 KiB wasted).

  SOLUTION: One file, one prop — `role` — controls the perspective.

  USAGE:
    // In Administration/AdminDashBoard or wherever admin sees it:
    import AdminChannel from "../shared/AdminChannel.jsx";
    <AdminChannel role="admin" />

    // In Assistant/AssistantTerminal or wherever assistant sees it:
    import AdminChannel from "../shared/AdminChannel.jsx";
    <AdminChannel role="assistant" />

  Place this file at:  src/shared/AdminChannel.jsx
  ─────────────────────────────────────────────────────────────────────────────
*/

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

/* ── Design tokens (inline so this file is self-contained) ── */
const T = {
  void:     "#080808",
  obsidian: "#0d0d0d",
  ember:    "#ec5b13",
  shipped:  "#38bdf8",
  border:   "1px solid rgba(255,255,255,0.06)",
  sub:      "1px solid rgba(255,255,255,0.03)",
};

/*
  role: "admin" | "assistant"
  - "admin"     → sender label is "admin",     their bubble is T.shipped (blue)
  - "assistant" → sender label is "assistant", their bubble is T.ember   (orange)
*/
const AdminChannel = ({ role = "admin" }) => {
  const isAdmin = role === "admin";
  const myColor = isAdmin ? T.shipped : T.ember;

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const scrollRef               = useRef(null);
  const isNearBottomRef         = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const sync = useCallback(async () => {
    const { data, error } = await supabase
      .from("verp_private_channel")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setMessages(data);
  }, []);

  useEffect(() => {
    sync();
    const i = setInterval(sync, isAdmin ? 4000 : 5000);
    return () => clearInterval(i);
  }, [sync, isAdmin]);

  /* ── Admin: mark assistant messages read when opened ── */
  useEffect(() => {
    if (!isAdmin || messages.length === 0) return;
    const unread = messages.filter((m) => m.sender === "assistant" && !m.read_at);
    if (unread.length === 0) return;
    const now = new Date().toISOString();
    supabase
      .from("verp_private_channel")
      .update({ read_at: now })
      .in("id", unread.map((m) => m.id))
      .then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender === "assistant" && !m.read_at ? { ...m, read_at: now } : m
          )
        );
      });
  }, [messages.length, isAdmin]);

  /* ── Scroll to bottom only when near bottom or first load ── */
  useEffect(() => {
    if (scrollRef.current && isNearBottomRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: role, content, created_at: new Date().toISOString(), read_at: null },
    ]);
    await supabase.from("verp_private_channel").insert([{ sender: role, content }]);
    setSending(false);
  };

  return (
    <>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.35);border-radius:99px }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", height:"100%", background: T.void, fontFamily:"'DM Sans',sans-serif" }}>

        {/* HEADER */}
        <div style={{ padding:"16px 22px", background: T.obsidian, borderBottom: T.sub, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18, color: T.shipped }}>lock</span>
                </div>
                <div style={{ position:"absolute", bottom:1, right:1, width:8, height:8, borderRadius:"50%", background: T.ember, animation:"pulseDot 2s ease-in-out infinite", border:"1.5px solid #080808" }} />
              </div>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(16px,2.5vw,22px)", fontStyle:"italic", fontWeight:400, color:"white" }}>
                  {isAdmin ? "Admin" : "Assistant"} <span style={{ color: T.shipped }}>Channel</span>
                </h2>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(255,255,255,0.22)", marginTop:2 }}>
                  SECURE · ADMIN ↔ ASSISTANT ONLY · SESSION VERIFIED
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[
                { color: T.shipped, label: isAdmin ? "You (Admin)" : "Admin"     },
                { color: T.ember,   label: isAdmin ? "Assistant"  : "You (Asst)" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background: color }} />
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ flex:1, overflowY:"auto", padding:"18px 22px", display:"flex", flexDirection:"column", justifyContent:"flex-end", gap:14, scrollbarWidth:"thin", scrollbarColor:"rgba(56,189,248,0.3) transparent" }}
        >
          {messages.length === 0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, opacity:0.12, padding:"60px 0" }}>
              <span className="material-symbols-outlined" style={{ fontSize:40 }}>lock</span>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, letterSpacing:"0.3em", textTransform:"uppercase" }}>NO MESSAGES YET</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center", maxWidth:280, lineHeight:1.6 }}>
                {isAdmin
                  ? "The assistant will message here when they need your guidance."
                  : "Send a message to the admin for private guidance."}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMine = msg.sender === role;
            const color  = isMine ? myColor : (isAdmin ? T.ember : T.shipped);
            return (
              <div
                key={msg.id || idx}
                style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start", animation:`fadeUp 0.25s ${Math.min(idx*0.03,0.3)}s both` }}
              >
                <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems: isMine ? "flex-end" : "flex-start", gap:4 }}>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, letterSpacing:"0.22em", textTransform:"uppercase", color:`${color}70` }}>
                    {isMine ? (isAdmin ? "YOU (ADMIN)" : "YOU (ASST)") : (isAdmin ? "ASSISTANT" : "ADMIN")}
                  </p>
                  <div style={{ padding:"12px 16px", background: color, borderRadius: isMine ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#000", lineHeight:1.65, fontWeight:500, wordBreak:"break-word" }}>
                    {msg.content}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6, color:"rgba(255,255,255,0.15)", letterSpacing:"0.1em" }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                    </p>
                    {isMine && isAdmin && (
                      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6, letterSpacing:"0.08em", color: msg.read_at ? "rgba(56,189,248,0.6)" : "rgba(255,255,255,0.12)" }}>
                        {msg.read_at ? "✓ READ" : "SENT"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INPUT */}
        <div style={{ borderTop: T.sub, background: T.obsidian, padding:"14px 18px", flexShrink:0 }}>
          <form onSubmit={send} style={{ display:"flex", gap:8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder={isAdmin ? "REPLY TO ASSISTANT — PRIVATE & SECURE..." : "MESSAGE ADMIN (PRIVATE)..."}
              style={{ flex:1, background: isAdmin ? "rgba(56,189,248,0.04)" : "#111", border: isAdmin ? "1px solid rgba(56,189,248,0.18)" : T.border, borderRadius:12, padding:"11px 16px", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.85)", outline:"none", transition:"border-color 200ms" }}
              onFocus={(e)  => (e.currentTarget.style.borderColor = isAdmin ? "rgba(56,189,248,0.4)" : "rgba(236,91,19,0.4)")}
              onBlur={(e)   => (e.currentTarget.style.borderColor = isAdmin ? "rgba(56,189,248,0.18)" : T.border)}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{ background: myColor, border:"none", borderRadius:12, padding:"11px 22px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#000", opacity: sending || !input.trim() ? 0.45 : 1, transition:"all 200ms" }}
            >
              SEND
            </button>
          </form>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:6, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.1)", textAlign:"center", marginTop:10 }}>
            END-TO-END PRIVATE · ADMIN & ASSISTANT ONLY · SESSION VERIFIED
          </p>
        </div>

      </div>
    </>
  );
};

export default AdminChannel;