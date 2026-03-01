import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useCart } from "../Cartoptions/CartContext";
import { ArrowLeft, RefreshCw, X, Send, Package, Clock, CheckCircle, RotateCcw, Truck, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   Server URL — single place to change if backend moves
───────────────────────────────────────────────────────────── */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://verp-server.onrender.com";

/* ─────────────────────────────────────────────────────────────
   Global styles — injected once
───────────────────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("_order_page_kf")) {
  const s = document.createElement("style");
  s.id = "_order_page_kf";
  s.textContent = `
    @font-face {}
    @keyframes op-spin    { to { transform: rotate(360deg); } }
    @keyframes op-fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes op-pulse   { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
    @keyframes op-burn    { 0%,100%{opacity:1;} 50%{opacity:0.82;} }
    @keyframes op-sheetIn { from{transform:translateY(100%)} to{transform:translateY(0)} }
    @keyframes op-drawIn  { from{transform:translateX(100%)} to{transform:translateX(0)} }
    @keyframes op-scaleIn { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes op-bdIn    { from{opacity:0} to{opacity:1} }
    @keyframes op-itemIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
    .op-fade-up    { animation: op-fadeUp   0.55s cubic-bezier(0.16,1,0.3,1) both; }
    .op-pulse      { animation: op-pulse    2.2s ease-in-out infinite; }
    .op-burn-fill  { animation: op-burn     1.8s ease-in-out infinite; }
    .op-mono       { font-family:'JetBrains Mono',monospace; }
    .op-serif      { font-family:'Playfair Display',serif; font-style:italic; }
    .op-card       { transition: transform 0.22s ease, box-shadow 0.22s ease; }
    .op-card:hover { transform: translateY(-1px); }
    .op-tab-btn    { transition: all 0.2s ease; }
    @media(max-width:640px){ .op-order-body{ flex-direction:column!important; } .op-right-panel{ width:100%!important; border-left:none!important; border-top:1px solid rgba(255,255,255,0.05)!important; } }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  ordered:    { color: "#a78bfa", glow: "rgba(167,139,250,0.15)", label: "Ordered",    icon: ShoppingBag },
  pending:    { color: "#facc15", glow: "rgba(250,204,21,0.12)",  label: "Pending",    icon: Clock       },
  processing: { color: "#38bdf8", glow: "rgba(56,189,248,0.12)",  label: "Processing", icon: Package     },
  shipped:    { color: "#34d399", glow: "rgba(52,211,153,0.12)",  label: "Shipped",    icon: Truck       },
  delivered:  { color: "#ec5b13", glow: "rgba(236,91,19,0.12)",   label: "Delivered",  icon: CheckCircle },
  returned:   { color: "#fb923c", glow: "rgba(251,146,60,0.1)",   label: "Returned",   icon: RotateCcw   },
  cancelled:  { color: "rgba(255,255,255,0.2)", glow: "rgba(255,255,255,0.03)", label: "Cancelled", icon: X },
};

const RETURN_PILL = {
  pending:   { color: "#facc15", label: "Pending"   },
  reviewing: { color: "#38bdf8", label: "Reviewing" },
  approved:  { color: "#22c55e", label: "Approved"  },
  rejected:  { color: "#ef4444", label: "Rejected"  },
  completed: { color: "#a78bfa", label: "Completed" },
};

const getBurnColor = (ratio) => {
  if (ratio > 0.6) return { primary: "#ec5b13", secondary: "#ff7a20" };
  if (ratio > 0.3) return { primary: "#f97316", secondary: "#ef4444" };
  return { primary: "#ef4444", secondary: "#dc2626" };
};

const NAVBAR_H = 68;

/* ─────────────────────────────────────────────────────────────
   updateOrderStatus — calls backend, stamps delivered_at server-side
───────────────────────────────────────────────────────────── */
export const updateOrderStatus = async (orderId, status) => {
  const adminEmail = localStorage.getItem("adminEmail") || "";
  const adminPass  = localStorage.getItem("adminPass")  || "";
  const credentials = btoa(`${adminEmail}:${adminPass}`);

  const res = await fetch(`${SERVER_URL}/api/update-order-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${credentials}`,
    },
    body: JSON.stringify({ orderId, status }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update order status");
  return data.order;
};

/* ─────────────────────────────────────────────────────────────
   Return Modal
───────────────────────────────────────────────────────────── */
const ReturnModal = ({ order, metrics, onClose, onSuccess }) => {
  const [reason, setReason]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);
  const [visible, setVisible]       = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 340); };

  const submit = async () => {
    if (reason.trim().length < 10) { setError("Please write at least 10 characters."); return; }
    setError(""); setSubmitting(true);
    const userEmail = localStorage.getItem("userEmail");
    try {
      const { error: insertError } = await supabase.from("verp_return_requests").insert([{
        order_id: order.id, order_number: order.order_number || null,
        customer_email: userEmail, customer_name: localStorage.getItem("userName") || userEmail,
        reason: reason.trim(), total_amount: order.total_amount, status: "pending", items_snapshot: order.items || [],
      }]).select();
      if (insertError) throw insertError;
      await supabase.from("verp_orders").update({ status: "returned", return_reason: reason.trim() }).eq("id", order.id);
      setDone(true);
      setTimeout(() => { onSuccess(); handleClose(); }, 2400);
    } catch { setError("Something went wrong. Please try again."); setSubmitting(false); }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 24 }}
      onClick={handleClose}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", animation: "op-bdIn 0.25s ease both", zIndex: -1 }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: isMobile ? "100%" : 520,
          background: "linear-gradient(160deg, #131313 0%, #0c0c0c 100%)",
          border: "1px solid rgba(236,91,19,0.2)",
          borderRadius: isMobile ? "28px 28px 0 0" : 24,
          overflow: "hidden",
          boxShadow: isMobile ? "0 -24px 80px rgba(0,0,0,0.9)" : "0 48px 120px rgba(0,0,0,0.9)",
          maxHeight: isMobile ? "88svh" : "90vh",
          overflowY: "auto",
          transform: visible ? (isMobile ? "translateY(0)" : "scale(1)") : (isMobile ? "translateY(100%)" : "scale(0.96)"),
          opacity: visible ? 1 : (isMobile ? 1 : 0),
          transition: "transform 0.36s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease",
        }}
      >
        {isMobile && <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}><div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.14)" }} /></div>}
        <div style={{ padding: "26px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="op-mono" style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(236,91,19,0.65)", marginBottom: 8 }}>
              ORDER {order.order_number || order.id?.slice(0, 8)}
            </p>
            <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 900, color: "white", letterSpacing: "-0.02em", margin: 0, textTransform: "uppercase" }}>
              Request Return
            </h3>
          </div>
          <button onClick={handleClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.35)", flexShrink: 0, transition: "all 200ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
            <X size={14} />
          </button>
        </div>
        {done ? (
          <div style={{ padding: "52px 28px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12L10 18L20 6" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 800, color: "white", marginBottom: 10 }}>Request Submitted</h4>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>Our team will review and reach out within 24 hours.</p>
          </div>
        ) : (
          <div style={{ padding: "24px 28px 32px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 22 }}>
              Tell us why you'd like to return. Our team reviews every request within 24 hours.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label className="op-mono" style={{ display: "block", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(236,91,19,0.65)", marginBottom: 10 }}>Reason for Return</label>
              <div style={{ position: "relative" }}>
                <textarea value={reason} onChange={e => { setReason(e.target.value); if (error) setError(""); }}
                  placeholder="e.g. Wrong size, arrived damaged…" rows={5}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: error ? "1px solid rgba(239,68,68,0.5)" : reason.length > 0 ? "1px solid rgba(236,91,19,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.82)", resize: "none", outline: "none", boxSizing: "border-box", transition: "border-color 200ms" }}
                  onFocus={e => { if (!error) e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)"; }}
                  onBlur={e => { if (!error && reason.length === 0) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                <span className="op-mono" style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: reason.length < 10 ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.18)" }}>{reason.length}/500</span>
              </div>
              {error && <p className="op-mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "rgba(239,68,68,0.8)", marginTop: 8, textTransform: "uppercase" }}>{error}</p>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleClose}
                style={{ flex: 1, padding: "13px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 200ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
                Cancel
              </button>
              <button onClick={submit} disabled={submitting || reason.trim().length < 10}
                style={{ flex: 2, padding: "13px 0", background: submitting || reason.trim().length < 10 ? "rgba(236,91,19,0.25)" : "#ec5b13", border: "none", borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: submitting || reason.trim().length < 10 ? "rgba(0,0,0,0.35)" : "#000", cursor: submitting || reason.trim().length < 10 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 200ms" }}>
                {submitting ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "op-spin 0.7s linear infinite" }} />Submitting…</> : <><Send size={13} />Submit</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Items Modal
───────────────────────────────────────────────────────────── */
const ItemsModal = ({ items, orderNumber, onClose }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 16); return () => clearTimeout(t); }, []);
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const isMobile = w <= 640;
  const isTablet = w > 640 && w <= 1024;
  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };
  const subtotal   = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 1), 0);
  const totalUnits = items.reduce((s, i) => s + (i.quantity || 1), 0);

  let wrapperStyle, panelStyle;
  if (isMobile) {
    wrapperStyle = { position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end" };
    panelStyle = { width: "100%", maxHeight: "92svh", background: "linear-gradient(160deg,#131313 0%,#0a0a0a 100%)", borderRadius: "28px 28px 0 0", border: "1px solid rgba(236,91,19,0.15)", borderBottom: "none", boxShadow: "0 -32px 80px rgba(0,0,0,0.95)", overflowY: "auto", boxSizing: "border-box", animation: visible ? "op-sheetIn 0.38s cubic-bezier(0.32,0.72,0,1) both" : "none" };
  } else if (isTablet) {
    wrapperStyle = { position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "stretch", justifyContent: "flex-end" };
    panelStyle = { width: "min(520px,90vw)", height: "100%", background: "linear-gradient(160deg,#131313 0%,#0a0a0a 100%)", borderLeft: "1px solid rgba(236,91,19,0.12)", boxShadow: "-40px 0 80px rgba(0,0,0,0.9)", overflowY: "auto", boxSizing: "border-box", animation: visible ? "op-drawIn 0.36s cubic-bezier(0.22,1,0.36,1) both" : "none" };
  } else {
    wrapperStyle = { position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" };
    panelStyle = { width: "100%", maxWidth: 760, maxHeight: "80vh", background: "linear-gradient(160deg,#131313 0%,#0a0a0a 100%)", borderRadius: 24, border: "1px solid rgba(236,91,19,0.18)", boxShadow: "0 60px 120px rgba(0,0,0,0.95)", overflowY: "auto", boxSizing: "border-box", opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.97)", transition: "opacity 0.28s ease, transform 0.34s cubic-bezier(0.22,1,0.36,1)" };
  }

  return (
    <>
      <style>{`@keyframes op-sheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes op-drawIn{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes op-itemIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", animation: "op-bdIn 0.22s ease both" }} onClick={handleClose} />
      <div style={wrapperStyle} onClick={e => e.stopPropagation()}>
        <div style={panelStyle}>
          {isMobile && <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}><div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.14)" }} /></div>}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: isMobile ? "18px 22px 16px" : "26px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "linear-gradient(160deg,#131313 0%,#0a0a0a 100%)", zIndex: 1 }}>
            <div>
              <p className="op-mono" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(236,91,19,0.6)", marginBottom: 7 }}>
                Order {orderNumber} · {items.length} {items.length === 1 ? "Item" : "Items"}
              </p>
              <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "white", letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}>Order Contents</h3>
            </div>
            <button onClick={handleClose}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", transition: "all 200ms", flexShrink: 0, marginTop: 2 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ padding: isMobile ? "16px 20px" : "22px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "repeat(2,1fr)", gap: 10 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, transition: "border-color 200ms, background 200ms", animation: `op-itemIn 0.3s ${i * 0.04}s both` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.25)"; e.currentTarget.style.background = "rgba(236,91,19,0.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase" }}>{item.name}</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="op-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>QTY {item.quantity || 1}</span>
                      {item.size && <span className="op-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>· {item.size}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p className="op-serif" style={{ fontSize: 16, color: "rgba(255,255,255,0.82)", lineHeight: 1 }}>GH₵{Number(item.price || 0).toLocaleString()}</p>
                    <p className="op-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>each</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, padding: "16px 20px", background: "rgba(236,91,19,0.04)", border: "1px solid rgba(236,91,19,0.12)", borderRadius: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="op-mono" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", display: "block", marginBottom: 2 }}>{totalUnits} Unit{totalUnits !== 1 ? "s" : ""} · {items.length} Product{items.length !== 1 ? "s" : ""}</span>
                <span className="op-mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>Subtotal (excl. fee)</span>
              </div>
              <span className="op-serif" style={{ fontSize: isMobile ? 22 : 26, color: "white" }}>GH₵{subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main OrderPage
───────────────────────────────────────────────────────────── */
const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [activeTab, setActiveTab]             = useState("active");
  const [now, setNow]                         = useState(new Date());
  const [returnModal, setReturnModal]         = useState(null);
  const [itemsModal, setItemsModal]           = useState(null);
  const [returnStatuses, setReturnStatuses]   = useState({});
  const { addToCart } = useCart();

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    const userEmail = localStorage.getItem("userEmail");
    let query = supabase.from("verp_orders").select("*").order("created_at", { ascending: false });
    if (userEmail) query = query.eq("customer_email", userEmail.toLowerCase());
    const { data, error } = await query;
    if (!error) setOrders(data || []);
    if (userEmail) {
      const { data: retData } = await supabase.from("verp_return_requests").select("order_id, status").eq("customer_email", userEmail);
      if (retData) {
        const map = {};
        retData.forEach(r => { if (r.order_id) map[r.order_id] = r.status; });
        setReturnStatuses(map);
      }
    }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => setNow(new Date()), 1000);
    const chan = supabase.channel("order-page-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "verp_orders" }, fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "verp_return_requests" }, fetchOrders)
      .subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(chan); };
  }, [fetchOrders]);

  const handleReacquire = (items) => {
    items.forEach(item => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: item.quantity }));
  };

  const getReturnMetrics = (order) => {
    // Use delivered_at if set; fall back to created_at for old orders
    const anchor = order.delivered_at || order.created_at;
    if (!anchor) return { expired: true, progress: 0, ratio: 0, remainingMs: 0 };
    const exp = new Date(anchor).getTime() + 48 * 3600000;
    const remaining = exp - now.getTime();
    if (remaining <= 0) return { expired: true, progress: 0, ratio: 0, remainingMs: 0 };
    const ratio = remaining / (48 * 3600000);
    return { expired: false, progress: ratio, ratio, remainingMs: remaining };
  };

  const TABS = ["active", "delivered", "returned", "all"];
  const filteredOrders = orders.filter(o => {
    const s = o.status?.toLowerCase();
    if (activeTab === "active")    return ["ordered", "pending", "processing", "shipped"].includes(s);
    if (activeTab === "delivered") return s === "delivered";
    if (activeTab === "returned")  return ["returned", "cancelled"].includes(s);
    return true;
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "2px solid rgba(236,91,19,0.25)", borderTopColor: "#ec5b13", borderRadius: "50%", animation: "op-spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "white", fontFamily: "'DM Sans',sans-serif" }}>

      {returnModal && <ReturnModal order={returnModal.order} metrics={returnModal.metrics} onClose={() => setReturnModal(null)} onSuccess={fetchOrders} />}
      {itemsModal  && <ItemsModal items={itemsModal.items} orderNumber={itemsModal.orderNumber} onClose={() => setItemsModal(null)} />}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: `${NAVBAR_H + 16}px 24px 80px` }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 24, height: 1, background: "#ec5b13" }} />
            <span className="op-mono" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(236,91,19,0.7)", fontWeight: 700 }}>Your Orders</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate(-1)}
              style={{ display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "9px 18px 9px 13px", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", transition: "all 200ms", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.45)"; e.currentTarget.style.color = "#ec5b13"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
            >
              <ArrowLeft size={13} />
              Back
            </button>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", textTransform: "uppercase", color: "white", margin: 0, lineHeight: 1 }}>
              Order <span style={{ color: "#ec5b13" }}>Archive</span>
            </h1>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={fetchOrders} disabled={refreshing}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, background: "transparent", cursor: refreshing ? "not-allowed" : "pointer", color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", transition: "all 200ms" }}
              onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.borderColor = "rgba(236,91,19,0.35)"; e.currentTarget.style.color = "#ec5b13"; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              <RefreshCw size={11} style={{ animation: refreshing ? "op-spin 0.9s linear infinite" : "none" }} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 28, paddingBottom: 2 }}>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, width: "fit-content", minWidth: "100%" }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="op-tab-btn"
                style={{
                  position: "relative", padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: activeTab === tab ? "#ec5b13" : "transparent",
                  color: activeTab === tab ? "#000" : "rgba(255,255,255,0.3)",
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase",
                  boxShadow: activeTab === tab ? "0 4px 16px rgba(236,91,19,0.35)" : "none",
                  flex: 1, whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }} key={activeTab}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 20 }}>
              <p className="op-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.3em" }}>No orders in this category</p>
            </div>
          ) : filteredOrders.map((order, idx) => {
            const statusKey       = order.status?.toLowerCase() || "ordered";
            const conf            = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ordered;
            const isActive        = ["ordered", "pending", "processing", "shipped"].includes(statusKey);
            const isDelivered     = statusKey === "delivered";
            const isReturned      = statusKey === "returned";
            const returnReqStatus = returnStatuses[order.id];
            const returnApproved  = returnReqStatus === "approved";
            const returnPill      = returnReqStatus ? RETURN_PILL[returnReqStatus] : null;
            const metrics         = isDelivered && !returnApproved ? getReturnMetrics(order) : null;
            const displayConf     = returnPill ? { color: returnPill.color, glow: `${returnPill.color}12` } : conf;
            const displayLabel    = returnPill ? returnPill.label : conf.label;
            const displayPulse    = isActive && !returnApproved && !returnPill;
            const allItems        = order.items || [];
            const visibleItems    = allItems.slice(0, 2);
            const extraCount      = allItems.length - 2;

            return (
              <div
                key={order.id}
                className="op-card op-fade-up"
                style={{
                  animationDelay: `${idx * 0.05}s`,
                  background: `linear-gradient(135deg, ${displayConf.glow} 0%, rgba(255,255,255,0.01) 60%)`,
                  border: `1px solid ${displayConf.color}22`,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {/* ── Top bar ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "nowrap", gap: 6, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999, background: `${displayConf.color}12`, border: `1px solid ${displayConf.color}28`, flexShrink: 0 }}>
                      <div className={displayPulse ? "op-pulse" : ""} style={{ width: 5, height: 5, borderRadius: "50%", background: displayConf.color, flexShrink: 0 }} />
                      <span className="op-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: displayConf.color, whiteSpace: "nowrap" }}>{displayLabel}</span>
                    </div>
                    <span className="op-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                      {order.order_number || "—"}
                    </span>
                  </div>
                  <span className="op-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* ── Body ── */}
                <div className="op-order-body" style={{ display: "flex" }}>
                  {/* Items section */}
                  <div style={{ flex: 1, padding: "16px 18px", minWidth: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {visibleItems.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}>
                            <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p className="op-mono" style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                            <p className="op-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>QTY {item.quantity}</p>
                          </div>
                          <p className="op-serif" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>GH₵{Number(item.price || 0).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    {extraCount > 0 && (
                      <button
                        onClick={() => setItemsModal({ items: allItems, orderNumber: order.order_number || order.id?.slice(0, 8) })}
                        style={{ marginTop: 8, width: "100%", padding: "9px 0", background: "transparent", border: "1px dashed rgba(236,91,19,0.28)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transition: "all 200ms" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(236,91,19,0.05)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.28)"; }}
                      >
                        <div style={{ display: "flex" }}>
                          {allItems.slice(2, 5).map((item, i) => (
                            <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #0c0c0c", marginLeft: i > 0 ? -6 : 0 }}>
                              <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          ))}
                        </div>
                        <span className="op-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(236,91,19,0.75)" }}>
                          +{extraCount} more · View all
                        </span>
                      </button>
                    )}
                  </div>

                  {/* ── Right panel ── */}
                  <div
                    className="op-right-panel"
                    style={{ flexShrink: 0, width: 160, borderLeft: "1px solid rgba(255,255,255,0.05)", padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}
                  >
                    {/* Price */}
                    {(() => {
                      const base = Number(order.total_amount) || 0;
                      const chargeGHS = Math.ceil((base / (1 - 0.0195)) * 100) / 100;
                      const feeGHS    = +(chargeGHS - base).toFixed(2);
                      return (
                        <div>
                          <p className="op-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: 4 }}>Total Paid</p>
                          <p className="op-serif" style={{ fontSize: 22, color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>GH₵{chargeGHS.toLocaleString()}</p>
                          <p className="op-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", marginTop: 3 }}>incl. GH₵{feeGHS.toFixed(2)} fee</p>
                        </div>
                      );
                    })()}

                    {/* ── Return Window countdown ── */}
                    {metrics && !metrics.expired && (() => {
                      const bc = getBurnColor(metrics.ratio);
                      const hoursLeft = metrics.remainingMs / 3600000;
                      return (
                        <div style={{
                          background: `linear-gradient(145deg, rgba(0,0,0,0.6) 0%, ${bc.primary}0a 100%)`,
                          border: `1px solid ${bc.primary}20`,
                          borderRadius: 14,
                          padding: "11px 12px 10px",
                          position: "relative",
                          overflow: "hidden",
                        }}>
                          <div style={{ position: "absolute", top: -10, right: -10, width: 70, height: 70, background: `radial-gradient(circle, ${bc.primary}1a, transparent 65%)`, pointerEvents: "none" }} />
                          <p className="op-mono" style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 5, position: "relative" }}>
                            Return window
                          </p>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, marginBottom: 4, position: "relative" }}>
                            <span className="op-mono" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, color: bc.primary, textShadow: `0 0 28px ${bc.primary}50`, fontVariantNumeric: "tabular-nums" }}>
                              {hoursLeft.toFixed(1)}
                            </span>
                            <div style={{ paddingBottom: 5 }}>
                              <span className="op-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: `${bc.primary}80`, display: "block", lineHeight: 1.1 }}>hrs</span>
                              <span className="op-mono" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", display: "block", lineHeight: 1.2 }}>to return</span>
                            </div>
                          </div>
                          <div style={{ marginTop: 8, position: "relative" }}>
                            <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${metrics.ratio * 100}%`, borderRadius: 999, background: `linear-gradient(to right, ${bc.secondary}, ${bc.primary})`, boxShadow: `0 0 10px ${bc.primary}70`, transition: "width 1s linear, background 2s ease" }} />
                            </div>
                            <div style={{ position: "absolute", top: "50%", left: `calc(${metrics.ratio * 100}% - 5px)`, transform: "translateY(-50%)", width: 10, height: 10, borderRadius: "50%", background: bc.primary, boxShadow: `0 0 8px ${bc.primary}, 0 0 16px ${bc.primary}80`, transition: "left 1s linear, background 2s ease", pointerEvents: "none" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                            <span className="op-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>NOW</span>
                            <span className="op-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>48H</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {returnApproved ? (
                        <>
                          <div style={{ padding: "7px 10px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)", textAlign: "center" }}>
                            <p className="op-mono" style={{ fontSize: 10, color: "rgba(34,197,94,0.7)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Approved</p>
                          </div>
                          <button disabled style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", background: "transparent", cursor: "not-allowed", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.1)", textTransform: "uppercase", letterSpacing: "0.15em" }}>↩ Approved</button>
                        </>
                      ) : isDelivered && !isReturned ? (
                        <>
                          {returnReqStatus ? (
                            <>
                              <div style={{ padding: "7px 10px", borderRadius: 10, background: `${RETURN_PILL[returnReqStatus]?.color}08`, border: `1px solid ${RETURN_PILL[returnReqStatus]?.color}25`, textAlign: "center" }}>
                                <p className="op-mono" style={{ fontSize: 10, color: RETURN_PILL[returnReqStatus]?.color, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                  {returnReqStatus === "rejected" ? "Rejected" : returnReqStatus.charAt(0).toUpperCase() + returnReqStatus.slice(1)}
                                </p>
                              </div>
                              <button onClick={() => handleReacquire(order.items)}
                                style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", transition: "all 200ms" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
                                ↺ Re-Order
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                disabled={metrics?.expired}
                                onClick={() => setReturnModal({ order, metrics })}
                                style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: metrics?.expired ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(236,91,19,0.4)", background: "transparent", cursor: metrics?.expired ? "not-allowed" : "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: metrics?.expired ? "rgba(255,255,255,0.1)" : "#ec5b13", textTransform: "uppercase", letterSpacing: "0.15em", opacity: metrics?.expired ? 0.3 : 1, transition: "all 200ms" }}
                                onMouseEnter={e => { if (!metrics?.expired) { e.currentTarget.style.background = "#ec5b13"; e.currentTarget.style.color = "#000"; } }}
                                onMouseLeave={e => { if (!metrics?.expired) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ec5b13"; } }}
                              >
                                {metrics?.expired ? "Closed" : "↩ Return"}
                              </button>
                              <button onClick={() => handleReacquire(order.items)}
                                style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "transparent", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", transition: "all 200ms" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
                                ↺ Re-Order
                              </button>
                            </>
                          )}
                        </>
                      ) : isReturned ? (
                        <>
                          <div style={{ padding: "7px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                            <p className="op-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Under Review</p>
                          </div>
                          <button disabled style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", background: "transparent", cursor: "not-allowed", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.1)", textTransform: "uppercase", letterSpacing: "0.15em" }}>↺ Unavailable</button>
                        </>
                      ) : (
                        <div style={{ padding: "7px 10px", borderRadius: 10, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                          <p className="op-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.15em" }}>{isActive ? "Monitoring" : "Finalized"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;