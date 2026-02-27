import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

/* ─── DESIGN TOKENS (mirrored from AssistantTerminal) ─────────── */
const T = {
  void:        "#080808",
  obsidian:    "#0d0d0d",
  smoke:       "#1c1c1c",
  ember:       "#ec5b13",
  emberDim:    "rgba(236,91,19,0.10)",
  emberBorder: "rgba(236,91,19,0.35)",
  border:      "1px solid rgba(255,255,255,0.06)",
  borderSub:   "1px solid rgba(255,255,255,0.03)",
};

const MONO  = "'JetBrains Mono', monospace";
const SANS  = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

/* ─── ORDER MESSAGES TAB ─────────────────────────────────────── */
const OrderMessagesTab = () => {
  const [messages,  setMessages]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [readIds,   setReadIds]   = useState(new Set()); // local read tracking
  const [filter,    setFilter]    = useState("all");     // all | unread | read
  const [reply,     setReply]     = useState("");
  const [busy,      setBusy]      = useState(false);
  const [loading,   setLoading]   = useState(true);

  /* ── fetch ── */
  const loadMessages = async () => {
    const { data } = await supabase
      .from("verp_inbox_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 12000);
    return () => clearInterval(interval);
  }, []);

  /* ── mark as read locally when selected ── */
  useEffect(() => {
    if (!selected) return;
    setReadIds((prev) => new Set([...prev, selected.id]));
  }, [selected?.id]);

  const isRead = (msg) => readIds.has(msg.id);

  /* ── send reply ── */
  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("verp_inbox_messages").insert([
      {
        to_email:  selected.from_email || selected.to_email,
        from_role: "assistant",
        subject:   `Re: ${selected.subject || "Your Message"}`,
        body:      reply.trim(),
      },
    ]);
    setBusy(false);
    if (error) {
      Swal.fire({ title: "Error", text: error.message, icon: "error", background: T.obsidian, color: "#fff" });
      return;
    }
    setReply("");
    Swal.fire({
      title: "Sent!",
      text: "Reply delivered to client inbox.",
      icon: "success",
      background: T.obsidian,
      color: "#fff",
      timer: 2000,
      showConfirmButton: false,
    });
    loadMessages();
  };

  /* ── delete message ── */
  const deleteMessage = async (id) => {
    const result = await Swal.fire({
      title: "Delete message?",
      text: "This cannot be undone.",
      icon: "warning",
      background: T.obsidian,
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: T.ember,
      cancelButtonColor: "#333",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    await supabase.from("verp_inbox_messages").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setReadIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  /* ── filtered list ── */
  const filtered = messages.filter((m) => {
    if (filter === "unread") return !isRead(m);
    if (filter === "read")   return  isRead(m);
    return true;
  });

  const unreadCount = messages.filter((m) => !isRead(m)).length;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: "column" }}>

      {/* ── HEADER BAR ── */}
      <div style={{
        height: 52, background: T.obsidian, borderBottom: T.borderSub,
        display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
          ORDER MESSAGES
        </span>

        {unreadCount > 0 && (
          <span style={{
            background: T.ember, color: "#000", borderRadius: 999,
            fontFamily: MONO, fontSize: 7, fontWeight: 700,
            padding: "2px 7px", letterSpacing: "0.1em",
          }}>
            {unreadCount} NEW
          </span>
        )}

        <div style={{
          display: "inline-flex", background: "#111", border: T.border,
          borderRadius: 999, padding: 3, gap: 2, marginLeft: "auto",
        }}>
          {["all", "unread", "read"].map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                background: filter === v ? T.ember : "transparent",
                color: filter === v ? "#000" : "rgba(255,255,255,0.35)",
                fontFamily: SANS, fontSize: 9, fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 200ms",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, opacity: 0.2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>hourglass_empty</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 180, flexDirection: "column", gap: 10, opacity: 0.15,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>mark_email_read</span>
              <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                NO MESSAGES
              </p>
            </div>
          )}

          {filtered.map((msg, idx) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className="at-order-card"
              style={{
                display: "block",
                animationDelay: `${idx * 0.04}s`,
                background:  selected?.id === msg.id ? "rgba(236,91,19,0.05)" : !isRead(msg) ? "rgba(236,91,19,0.03)" : "",
                borderColor: selected?.id === msg.id ? "rgba(236,91,19,0.3)"  : !isRead(msg) ? "rgba(236,91,19,0.15)" : "",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                  <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: isRead(msg) ? 400 : 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.to_email || "—"}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 2, letterSpacing: "0.08em" }}>
                    {msg.from_role?.toUpperCase() || "SYSTEM"}  ·  {new Date(msg.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                  background:  isRead(msg) ? "rgba(255,255,255,0.1)" : T.ember,
                  boxShadow:   isRead(msg) ? "none" : `0 0 6px ${T.ember}`,
                }} />
              </div>

              <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                {msg.subject || "(no subject)"}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {msg.body || ""}
              </p>
            </div>
          ))}

          <div style={{ height: 24 }} />
        </div>

        {/* ── DETAIL PANEL ── */}
        {selected && (
          <div style={{
            width: 320, background: T.obsidian, borderLeft: T.borderSub,
            display: "flex", flexDirection: "column", flexShrink: 0,
            animation: "slideInR 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{
              padding: "18px 18px 14px", borderBottom: T.borderSub,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
                <p style={{ fontFamily: MONO, fontSize: 8, color: T.ember, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  {selected.from_role || "system"}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: 15, fontStyle: "italic", color: "white", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selected.to_email || "—"}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "transparent", border: T.border, borderRadius: 8,
                  width: 30, height: 30, cursor: "pointer", color: "rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <p style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 5 }}>
                  {new Date(selected.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(selected.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  {selected.subject || "(no subject)"}
                </p>
              </div>

              <div style={{ background: "#111", border: T.border, borderRadius: 11, padding: "14px 16px" }}>
                <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {selected.body || "(empty)"}
                </p>
              </div>

              <div>
                <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                  REPLY
                </p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Write a reply..."
                  style={{
                    width: "100%", background: "#111", border: T.border, borderRadius: 11,
                    padding: "10px 14px", fontFamily: SANS, fontSize: 12,
                    color: "rgba(255,255,255,0.8)", outline: "none", resize: "none",
                    lineHeight: 1.6, boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={busy || !reply.trim()}
                  style={{
                    marginTop: 8, width: "100%", padding: "10px",
                    background: T.ember, border: "none", borderRadius: 11, cursor: "pointer",
                    fontFamily: SANS, fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.15em", textTransform: "uppercase", color: "#000",
                    opacity: busy || !reply.trim() ? 0.4 : 1, transition: "all 200ms",
                  }}
                >
                  {busy ? "SENDING..." : "SEND REPLY"}
                </button>
              </div>

              <button
                onClick={() => deleteMessage(selected.id)}
                style={{
                  width: "100%", padding: "9px",
                  background: "transparent", border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 11, cursor: "pointer",
                  fontFamily: SANS, fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "rgba(248,113,113,0.5)", transition: "all 200ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(248,113,113,0.6)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)"; e.currentTarget.style.color = "rgba(248,113,113,0.5)"; }}
              >
                DELETE MESSAGE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderMessagesTab;