import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
  void: "#080808",
  obsidian: "#0d0d0d",
  ember: "#ec5b13",
  shipped: "#38bdf8",
  violet: "#a78bfa",
  border: "1px solid rgba(255,255,255,0.06)",
  sub: "1px solid rgba(255,255,255,0.03)",
};

const getOrigin = (msg) => {
  const sub = (msg.subject || "").toLowerCase();
  const role = msg.from_role;
  if (role === "admin") return { label: "Home", path: "/", icon: "campaign" };
  if (sub.includes("order")) return { label: "My Orders", path: "/orderpage", icon: "inventory_2" };
  if (sub.includes("return") || sub.includes("refund")) return { label: "Support", path: "/support", icon: "support_agent" };
  return { label: "Support", path: "/support", icon: "support_agent" };
};

const fromConfig = (role) => {
  switch (role) {
    case "admin": return { label: "VERP TEAM", color: T.ember, icon: "groups" };
    case "assistant": return { label: "SUPPORT AGENT", color: T.shipped, icon: "support_agent" };
    default: return { label: role?.toUpperCase() || "VAULT", color: T.violet, icon: "mail" };
  }
};

/* ─── ORDER IMAGES STRIP ─────────────────────────────────────── */
const OrderImagesStrip = ({ orderNumber, toEmail }) => {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchOrderItems = async () => {
      // Try to match by order_number extracted from subject or email
      const { data } = await supabase
        .from("verp_orders")
        .select("items, order_number")
        .or(`customer_email.eq.${toEmail},order_number.eq.${orderNumber || ""}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.items) {
        const parsed = Array.isArray(data.items) ? data.items : JSON.parse(data.items || "[]");
        setItems(parsed.slice(0, 5)); // show up to 5 product images
      }
      setLoaded(true);
    };
    if (toEmail) fetchOrderItems();
  }, [toEmail, orderNumber]);

  if (!loaded || items.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ position: "relative" }}>
          <img
            src={item.image}
            alt={item.name}
            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
          {item.quantity > 1 && (
            <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: T.ember, color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.quantity}
            </span>
          )}
        </div>
      ))}
      {items.length > 0 && (
        <div style={{ padding: "6px 0", display: "flex", alignItems: "center" }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {items.length} ITEM{items.length !== 1 ? "S" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

/* ─── MESSAGE CARD ───────────────────────────────────────────── */
const MessageCard = ({ msg, onRead, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const isUnread = !msg.read_at;
  const from = fromConfig(msg.from_role);
  const origin = getOrigin(msg);

  // Extract order number from subject if present
  const orderNumberMatch = (msg.subject || "").match(/Order\s+([\w-]+)/i);
  const orderNumber = orderNumberMatch ? orderNumberMatch[1] : null;

  const handleExpand = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && isUnread) await onRead(msg.id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setRemoving(true);
    setTimeout(() => onDelete(msg.id), 300);
  };

  const isOrderMessage = from.label === "SUPPORT AGENT" && (msg.subject || "").toLowerCase().includes("order");

  return (
    <div onClick={handleExpand}
      style={{ borderRadius: 18, border: isUnread ? `1px solid rgba(236,91,19,0.22)` : T.border, background: isUnread ? "rgba(236,91,19,0.025)" : "rgba(255,255,255,0.012)", overflow: "hidden", cursor: "pointer", transition: "all 250ms cubic-bezier(0.16,1,0.3,1)", boxShadow: isUnread ? "0 0 0 1px rgba(236,91,19,0.08), 0 4px 20px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.2)", opacity: removing ? 0 : 1, transform: removing ? "translateX(30px) scale(0.98)" : "none" }}>
      {/* CARD HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px" }}>
        {/* Unread dot */}
        <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: isUnread ? T.ember : "transparent", border: isUnread ? "none" : "1px solid rgba(255,255,255,0.1)", animation: isUnread ? "unreadPulse 2s ease-in-out infinite" : "none" }} />
        {/* Sender avatar */}
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${from.color}12`, border: `1px solid ${from.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: from.color }}>{from.icon}</span>
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: from.color }}>{from.label}</span>
            {isUnread && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.15em", textTransform: "uppercase", color: T.ember, background: "rgba(236,91,19,0.1)", border: "1px solid rgba(236,91,19,0.22)", padding: "2px 7px", borderRadius: 999 }}>NEW</span>
            )}
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: isUnread ? 600 : 400, color: isUnread ? "white" : "rgba(255,255,255,0.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.subject || "(no subject)"}</p>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", marginTop: 4, letterSpacing: "0.1em" }}>
            {new Date(msg.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.2)", transition: "transform 200ms", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>expand_more</span>
          <button onClick={handleDelete} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", color: "rgba(239,68,68,0.3)", transition: "color 200ms" }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(239,68,68,0.3)"}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
          </button>
        </div>
      </div>

      {/* EXPANDED BODY */}
      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: T.sub, paddingTop: 14 }}>
          {/* Order images for assistant private messages about orders */}
          {isOrderMessage && (
            <OrderImagesStrip orderNumber={orderNumber} toEmail={msg.to_email} />
          )}

          {/* Message body */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: T.sub, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
              {msg.body || "(empty message)"}
            </p>
          </div>

          {/* Origin link */}
          <Link to={origin.path} onClick={e => e.stopPropagation()}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", padding: "7px 16px", background: "rgba(236,91,19,0.07)", border: "1px solid rgba(236,91,19,0.22)", borderRadius: 999, transition: "all 200ms" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(236,91,19,0.14)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(236,91,19,0.07)"}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: T.ember }}>{origin.icon}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: T.ember }}>Go to {origin.label}</span>
          </Link>
        </div>
      )}
    </div>
  );
};

/* ─── INBOX PAGE ─────────────────────────────────────────────── */
const InboxPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const userEmail = localStorage.getItem("userEmail");

  const fetchMessages = useCallback(async () => {
    if (!userEmail) { setLoading(false); return; }
    const { data } = await supabase
      .from("verp_inbox_messages")
      .select("*")
      .eq("to_email", userEmail)
      .order("created_at", { ascending: false });
    if (data) { setMessages(data); setUnreadCount(data.filter(m => !m.read_at).length); }
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    fetchMessages();
    const i = setInterval(fetchMessages, 30000);
    return () => clearInterval(i);
  }, [fetchMessages]);

  const handleRead = async (id) => {
    const now = new Date().toISOString();
    await supabase.from("verp_inbox_messages").update({ read_at: now }).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read_at: now } : m));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDelete = async (id) => {
    const msg = messages.find(m => m.id === id);
    await supabase.from("verp_inbox_messages").delete().eq("id", id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (msg && !msg.read_at) setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!userEmail) return;
    const now = new Date().toISOString();
    await supabase.from("verp_inbox_messages").update({ read_at: now }).eq("to_email", userEmail).is("read_at", null);
    setMessages(prev => prev.map(m => ({ ...m, read_at: m.read_at || now })));
    setUnreadCount(0);
  };

  const broadcastMessages = messages.filter(m => m.from_role === "admin");
	const filtered = messages.filter(m => {
		if (filter === "broadcasts") return m.from_role === "admin";
		if (filter === "all") return true;
		if (filter === "unread") return !m.read_at;
		return !!m.read_at;
	});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes unreadPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(236,91,19,0.35);border-radius:99px }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.void, paddingTop: 88, paddingBottom: 80, fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
          {/* PAGE HEADER */}
          <div style={{ marginBottom: 36, animation: "fadeUp 0.55s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,6vw,48px)", fontStyle: "italic", fontWeight: 400, color: "white", lineHeight: 1.1 }}>
                Vault <span style={{ color: T.ember }}>Inbox</span>
              </h1>
              {unreadCount > 0 && (
                <span style={{ background: T.ember, color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", padding: "5px 12px", borderRadius: 999, animation: "unreadPulse 2s ease-in-out infinite" }}>
                  {unreadCount} NEW
                </span>
              )}
            </div>
            {userEmail && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>{userEmail}</p>}
          </div>

          {/* CONTROLS */}
          {userEmail && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { k: "all", l: "All", c: messages.length },
                  { k: "broadcasts", l: "Broadcasts", c: broadcastMessages.length },
                  { k: "unread", l: "Unread", c: unreadCount },
                  { k: "read", l: "Read", c: messages.length - unreadCount },
                ].map(({ k, l, c }) => (
                  <button key={k} onClick={() => setFilter(k)}
                    style={{ padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer", transition: "all 200ms", background: filter === k ? T.ember : "rgba(255,255,255,0.06)", color: filter === k ? "#000" : "rgba(255,255,255,0.42)", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {l} · {c}
                  </button>
                ))}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  style={{ background: "transparent", border: T.border, borderRadius: 999, padding: "7px 16px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)", transition: "all 200ms" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.3)"; e.currentTarget.style.color = T.ember; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.32)"; }}>
                  MARK ALL READ
                </button>
              )}
            </div>
          )}

          {/* MESSAGES LIST */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(236,91,19,0.2)", borderTopColor: T.ember, animation: "spin 1s linear infinite" }} />
            </div>
          ) : !userEmail ? (
            <div style={{ textAlign: "center", padding: "60px 0", opacity: 0.3 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: T.ember }}>lock</span>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", color: "white", marginTop: 16, textTransform: "uppercase" }}>AUTHENTICATION REQUIRED</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", opacity: 0.2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48 }}>all_inbox</span>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", marginTop: 16, textTransform: "uppercase" }}>
                {filter === "unread" ? "NO UNREAD MESSAGES" : filter === "broadcasts" ? "NO BROADCASTS YET" : "INBOX CLEAR"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((msg, idx) => (
                <div key={msg.id} style={{ animation: `fadeUp 0.45s ${idx * 0.06}s both` }}>
                  <MessageCard msg={msg} onRead={handleRead} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InboxPage;
