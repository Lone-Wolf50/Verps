import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useCart } from "../Cartoptions/CartContext";
import { ArrowLeft, RefreshCw, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   Inline Return Modal
───────────────────────────────────────────────────────────── */
const ReturnModal = ({ order, metrics, onClose, onSuccess }) => {
  const [reason, setReason]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);
  const [visible, setVisible]       = useState(false);

  // Detect mobile (≤640px) and tablet (641–1024px) for device-specific animations
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
  const isTablet = typeof window !== "undefined" && window.innerWidth > 640 && window.innerWidth <= 1024;

  useEffect(() => {
    // Tiny delay so CSS transition kicks in
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 340);
  };

  const submit = async () => {
    if (reason.trim().length < 10) { setError("Please write at least 10 characters."); return; }
    setError(""); setSubmitting(true);
    const userEmail = localStorage.getItem("userEmail");
    const payload = {
      order_id: order.id,
      order_number: order.order_number || null,
      customer_email: userEmail,
      customer_name: localStorage.getItem("userName") || userEmail,
      reason: reason.trim(),
      total_amount: order.total_amount,
      status: "pending",
      items_snapshot: order.items || [],
    };
    try {
      const { error: insertError } = await supabase.from("verp_return_requests").insert([payload]).select();
      if (insertError) throw insertError;
      await supabase.from("verp_orders").update({ status:"returned", return_reason:reason.trim() }).eq("id", order.id);
      setDone(true);
      setTimeout(() => { onSuccess(); handleClose(); }, 2400);
    } catch(e) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // Device-specific sheet/modal positioning
  const sheetStyle = isMobile
    ? {
        // Mobile: slides up from bottom like a native sheet
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }
    : {
        // Tablet & desktop: centered modal fades + scales in
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      };

  const cardTransform = isMobile
    ? (visible ? "translateY(0)" : "translateY(100%)")
    : isTablet
      ? (visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)")
      : (visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(20px)");

  const cardStyle = isMobile
    ? {
        width: "100%", maxWidth: "100%",
        background: "#0c0c0c",
        border: "1px solid rgba(236,91,19,0.18)",
        borderRadius: "28px 28px 0 0",
        overflow: "hidden",
        boxShadow: "0 -20px 80px rgba(0,0,0,0.9)",
        transform: cardTransform,
        transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
        maxHeight: "90svh",
        overflowY: "auto",
      }
    : {
        width: "100%", maxWidth: isTablet ? 500 : 540,
        background: "#0c0c0c",
        border: "1px solid rgba(236,91,19,0.2)",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03)",
        transform: cardTransform,
        opacity: visible ? 1 : 0,
        transition: "transform 0.36s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease",
      };

  return (
    <div style={{ ...sheetStyle }} onClick={handleClose}>
      {/* Backdrop blur layer */}
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", opacity:visible?1:0, transition:"opacity 0.3s ease", zIndex:-1 }} />

      {/* Mobile drag handle */}
      {isMobile && (
        <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", width:36, height:4, borderRadius:999, background:"rgba(255,255,255,0.12)" }} />
      )}

      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: isMobile ? "28px 24px 18px" : "28px 32px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(236,91,19,0.7)", marginBottom:8 }}>
              ORDER {order.order_number||order.id?.slice(0,8)} · {metrics?.timeLeft}
            </p>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:isMobile?22:26, color:"white", fontWeight:400, lineHeight:1.1, margin:0 }}>
              Request a Return
            </h3>
          </div>
          <button onClick={handleClose} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50%", width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,0.35)", flexShrink:0, transition:"all 200ms" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"; e.currentTarget.style.color="white"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        {done ? (
          <div style={{ padding:"52px 32px", textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12L10 18L20 6" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h4 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:20, fontWeight:800, color:"white", marginBottom:12 }}>Request Submitted</h4>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.4)", lineHeight:1.7 }}>Our team will review your return and reach out within 24 hours.</p>
          </div>
        ) : (
          <div style={{ padding: isMobile ? "22px 24px 36px" : "26px 32px 34px" }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.75, marginBottom:24 }}>
              Tell us why you'd like to return this order. Our team reviews every request within 24 hours.
            </p>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(236,91,19,0.7)", marginBottom:12 }}>
                Reason for Return
              </label>
              <div style={{ position:"relative" }}>
                <textarea value={reason} onChange={e => { setReason(e.target.value); if(error) setError(""); }}
                  placeholder="e.g. Wrong size delivered, item arrived damaged..." rows={5}
                  style={{ width:"100%", background:"rgba(255,255,255,0.03)", border:error?"1px solid rgba(239,68,68,0.5)":reason.length>0?"1px solid rgba(236,91,19,0.4)":"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"16px 18px", fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.7, color:"rgba(255,255,255,0.85)", resize:"none", outline:"none", boxSizing:"border-box", transition:"border-color 200ms, box-shadow 200ms" }}
                  onFocus={e => { if(!error) e.currentTarget.style.borderColor="rgba(236,91,19,0.5)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(236,91,19,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.boxShadow="none"; if(!error&&reason.length===0) e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }} />
                <span style={{ position:"absolute", bottom:12, right:14, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:reason.length<10?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.2)" }}>
                  {reason.length} / 500
                </span>
              </div>
              {error && <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:"0.18em", color:"rgba(239,68,68,0.8)", marginTop:10, textTransform:"uppercase" }}>{error}</p>}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={handleClose}
                style={{ flex:1, padding:"14px 0", background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", cursor:"pointer", transition:"all 200ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"; e.currentTarget.style.color="rgba(255,255,255,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.3)"; }}>Cancel</button>
              <button onClick={submit} disabled={submitting||reason.trim().length<10}
                style={{ flex:2, padding:"14px 0", background:submitting||reason.trim().length<10?"rgba(236,91,19,0.28)":"#ec5b13", border:"none", borderRadius:14, fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:submitting||reason.trim().length<10?"rgba(0,0,0,0.4)":"#000", cursor:submitting||reason.trim().length<10?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 200ms, box-shadow 200ms" }}
                onMouseEnter={e => { if(!submitting&&reason.trim().length>=10) e.currentTarget.style.boxShadow="0 8px 28px rgba(236,91,19,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; }}>
                {submitting
                  ? <><div style={{ width:15, height:15, border:"2px solid rgba(0,0,0,0.35)", borderTopColor:"#000", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Submitting…</>
                  : <><Send size={14} />Submit Request</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Items Modal — premium per-device presentation
   Mobile   → bottom sheet slides up (native feel)
   Tablet   → side drawer slides in from right
   Desktop  → centered lightbox with large grid
───────────────────────────────────────────────────────────── */
const ITEMS_MODAL_STYLES = `
  @keyframes itemSheetIn  { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes itemDrawerIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes itemLightIn  { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes itemBdIn     { from{opacity:0} to{opacity:1} }
`;

const ItemsModal = ({ items, orderNumber, onClose }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 16); return () => clearTimeout(t); }, []);

  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  const isMobile = w <= 640;
  const isTablet = w > 640 && w <= 1024;

  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

  /* ── backdrop ── */
  const backdropStyle = {
    position:"fixed", inset:0, zIndex:9998,
    background:"rgba(0,0,0,0.82)",
    backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
    animation:"itemBdIn 0.25s ease both",
  };

  /* ── panel ── */
  const panelBase = {
    background:"#0b0b0b",
    boxSizing:"border-box",
    overflowY:"auto",
  };

  let wrapperStyle, panelStyle;

  if (isMobile) {
    // Bottom sheet
    wrapperStyle = { position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"flex-end" };
    panelStyle = {
      ...panelBase,
      width:"100%", maxHeight:"88svh",
      borderRadius:"24px 24px 0 0",
      border:"1px solid rgba(236,91,19,0.18)",
      boxShadow:"0 -24px 80px rgba(0,0,0,0.9)",
      animation: visible ? "itemSheetIn 0.36s cubic-bezier(0.32,0.72,0,1) both" : "none",
      transform: visible ? "translateY(0)" : "translateY(100%)",
      padding:"0 0 env(safe-area-inset-bottom,0)",
    };
  } else if (isTablet) {
    // Right-side drawer
    wrapperStyle = { position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"stretch", justifyContent:"flex-end" };
    panelStyle = {
      ...panelBase,
      width:"min(480px, 90vw)", height:"100%",
      borderLeft:"1px solid rgba(236,91,19,0.15)",
      boxShadow:"-32px 0 80px rgba(0,0,0,0.8)",
      animation: visible ? "itemDrawerIn 0.34s cubic-bezier(0.22,1,0.36,1) both" : "none",
    };
  } else {
    // Desktop lightbox
    wrapperStyle = { position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:32 };
    panelStyle = {
      ...panelBase,
      width:"100%", maxWidth:720, maxHeight:"82vh",
      borderRadius:24,
      border:"1px solid rgba(236,91,19,0.18)",
      boxShadow:"0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)",
      animation: visible ? "itemLightIn 0.32s cubic-bezier(0.22,1,0.36,1) both" : "none",
    };
  }

  return (
    <>
      <style>{ITEMS_MODAL_STYLES}</style>
      {/* Backdrop — click closes */}
      <div style={backdropStyle} onClick={handleClose} />
      <div style={wrapperStyle}>
        <div style={panelStyle} onClick={e => e.stopPropagation()}>
          {/* Drag handle — mobile only */}
          {isMobile && (
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:999, background:"rgba(255,255,255,0.12)" }} />
            </div>
          )}

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "16px 20px 14px" : "22px 28px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)", position:"sticky", top:0, background:"#0b0b0b", zIndex:1 }}>
            <div>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, letterSpacing:"0.35em", textTransform:"uppercase", color:"rgba(236,91,19,0.7)", marginBottom:5 }}>
                ORDER {orderNumber} · {items.length} ITEMS
              </p>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize: isMobile ? 20 : 24, color:"white", fontWeight:400, lineHeight:1.1, margin:0 }}>
                Full Order Details
              </h3>
            </div>
            <button onClick={handleClose}
              style={{ width:38, height:38, borderRadius:"50%", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,0.4)", transition:"all 200ms", flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; e.currentTarget.style.color="white"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}>
              <X size={15} />
            </button>
          </div>

          {/* Items grid */}
          <div style={{ padding: isMobile ? "16px 20px 28px" : "22px 28px 32px" }}>
            {/* Desktop: 2-col grid. Tablet/Mobile: single col list */}
            <div style={{
              display:"grid",
              gridTemplateColumns: isTablet || isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: isMobile ? 10 : 12,
            }}>
              {items.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, transition:"border-color 200ms" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="rgba(236,91,19,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}>
                  {/* Large image */}
                  <div style={{ width:54, height:54, borderRadius:10, overflow:"hidden", flexShrink:0, border:"1px solid rgba(255,255,255,0.08)" }}>
                    <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.88)", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em" }}>QTY {item.quantity}</span>
                      {item.size && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em" }}>· {item.size}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:16, color:"rgba(255,255,255,0.85)", lineHeight:1 }}>
                      GH₵{Number(item.price||0).toLocaleString()}
                    </p>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.2)", marginTop:3 }}>each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals footer */}
            <div style={{ marginTop:18, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)" }}>
                {items.reduce((s, i) => s + i.quantity, 0)} TOTAL UNITS
              </span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:20, color:"rgba(255,255,255,0.9)" }}>
                GH₵{items.reduce((s, i) => s + (i.price||0) * i.quantity, 0).toLocaleString()}
              </span>
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
const NAVBAR_H = 68; // must match Navbar fixed height

const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [activeTab, setActiveTab]     = useState("active");
  const [now, setNow]                 = useState(new Date());
  const [returnModal, setReturnModal] = useState(null);
  const [itemsModal, setItemsModal]   = useState(null); // { items, orderNumber }
  const [returnStatuses, setReturnStatuses] = useState({});
  const { addToCart } = useCart();

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    const userEmail = localStorage.getItem("userEmail");
    let query = supabase.from("verp_orders").select("*").order("created_at", { ascending:false });
    if (userEmail) query = query.eq("customer_email", userEmail.toLowerCase());
    const { data, error } = await query;
    if (!error) setOrders(data||[]);
    if (userEmail) {
      const { data: retData } = await supabase
        .from("verp_return_requests")
        .select("order_id, status")
        .eq("customer_email", userEmail);
      if (retData) {
        const map = {};
        retData.forEach(r => { if (r.order_id) map[r.order_id] = r.status; });
        setReturnStatuses(map);
      }
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => setNow(new Date()), 30000);
    // Realtime: re-fetch when orders OR return_requests change
    const chan = supabase.channel("order-page-realtime")
      .on("postgres_changes", { event:"*", schema:"public", table:"verp_orders" }, fetchOrders)
      .on("postgres_changes", { event:"*", schema:"public", table:"verp_return_requests" }, fetchOrders)
      .subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(chan); };
  }, [fetchOrders]);

  const handleReacquire = (items) => {
    items.forEach(item => addToCart({ id:item.id, name:item.name, price:item.price, image:item.image, quantity:item.quantity }));
  };

  const getReturnMetrics = (deliveredAt) => {
    if (!deliveredAt) return { timeLeft:"WINDOW PENDING", expired:false, progress:1, ratio:1 };
    const exp = new Date(deliveredAt).getTime() + 48*3600000;
    const remaining = exp - now.getTime();
    if (remaining <= 0) return { timeLeft:"EXPIRED", expired:true, progress:0, ratio:0 };
    const ratio = remaining / (48*3600000);
    const h = Math.floor(remaining/3600000), m = Math.floor((remaining%3600000)/60000);
    return { timeLeft:h>0?`${h}H ${m}M LEFT`:`${m}M LEFT`, expired:false, progress:ratio, ratio };
  };

  const STATUS_CONFIG = {
    ordered:    { color:"#a78bfa", bg:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.25)" },
    pending:    { color:"#facc15", bg:"rgba(250,204,21,0.07)",  border:"rgba(250,204,21,0.2)"  },
    processing: { color:"#38bdf8", bg:"rgba(56,189,248,0.07)",  border:"rgba(56,189,248,0.2)"  },
    shipped:    { color:"#34d399", bg:"rgba(52,211,153,0.07)",  border:"rgba(52,211,153,0.2)"  },
    delivered:  { color:"#ec5b13", bg:"rgba(236,91,19,0.07)",   border:"rgba(236,91,19,0.22)"  },
    returned:   { color:"#fb923c", bg:"rgba(251,146,60,0.06)",  border:"rgba(251,146,60,0.18)" },
    cancelled:  { color:"rgba(255,255,255,0.15)", bg:"rgba(255,255,255,0.02)", border:"rgba(255,255,255,0.06)" },
  };

  const RETURN_PILL = {
    pending:   { color:"#facc15", label:"RETURN · PENDING"   },
    reviewing: { color:"#38bdf8", label:"RETURN · REVIEWING" },
    approved:  { color:"#22c55e", label:"RETURN · APPROVED"  },
    rejected:  { color:"#ef4444", label:"RETURN · REJECTED"  },
    completed: { color:"#a78bfa", label:"RETURN · COMPLETED" },
  };

  const getBurnColor = (ratio) => {
    if (ratio > 0.6) return { primary:"#ec5b13", secondary:"#ff7a20", glow:"rgba(236,91,19,0.6)" };
    if (ratio > 0.3) return { primary:"#f97316", secondary:"#ef4444", glow:"rgba(249,115,22,0.65)" };
    return { primary:"#ef4444", secondary:"#dc2626", glow:"rgba(239,68,68,0.7)" };
  };

  const TABS = ["active","delivered","returned","all"];
  const filteredOrders = orders.filter(o => {
    const s = o.status?.toLowerCase();
    if (activeTab==="active")    return ["ordered","pending","processing","shipped"].includes(s);
    if (activeTab==="delivered") return s==="delivered";
    if (activeTab==="returned")  return ["returned","cancelled"].includes(s);
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#ec5b13] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060606] text-white grain" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
 @keyframes burnFlicker{0%,100%{opacity:1;}50%{opacity:0.88;}75%{opacity:0.96;}}
        @keyframes emberGlow{0%,100%{box-shadow:0 0 6px 2px rgba(236,91,19,0.5),0 0 12px 4px rgba(236,20,0,0.25);}50%{box-shadow:0 0 10px 3px rgba(255,120,20,0.7),0 0 20px 8px rgba(236,60,0,0.35);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fade-up{from{opacity:0;transform:translateY(15px);}to{opacity:1;transform:translateY(0);}}
        @keyframes status-pulse{0%,100%{opacity:1;filter:brightness(1.2);}50%{opacity:0.4;filter:brightness(0.8);}}
        .burn-bar-fill{animation:burnFlicker 1.8s ease-in-out infinite,emberGlow 2.2s ease-in-out infinite;}
        .burn-tip{animation:emberGlow 1.5s ease-in-out infinite;}
        .fade-up{animation:fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both;}
        .status-dot-pulse{animation:status-pulse 2.2s ease-in-out infinite;}
        .vault-mono{font-family:'JetBrains Mono',monospace;}
        .vault-display{font-family:'Playfair Display',serif;font-style:italic;}
        .tab-panel{animation:fade-up 0.35s ease both;}
        .order-card{transition:transform 0.25s ease,box-shadow 0.25s ease;}
        .order-card:hover{transform:translateY(-1px);box-shadow:0 8px 40px rgba(0,0,0,0.4);}
        .grain::after{content:"";position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:5;opacity:0.5;}
      `}</style>

      {returnModal && <ReturnModal order={returnModal.order} metrics={returnModal.metrics} onClose={() => setReturnModal(null)} onSuccess={fetchOrders} />}
      {itemsModal && <ItemsModal items={itemsModal.items} orderNumber={itemsModal.orderNumber} onClose={() => setItemsModal(null)} />}

      {/* ── Page wrapper — paddingTop equals navbar height so content is never hidden ── */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-20" style={{ paddingTop: NAVBAR_H + 32 }}>

        {/* ── Header ── */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#ec5b13]/50 transition-all">
              <ArrowLeft className="w-3.5 h-3.5 text-white/40 group-hover:text-[#ec5b13] transition-colors" />
            </div>
            <span className="vault-mono text-[8px] uppercase tracking-[0.25em] text-white/30 group-hover:text-white/60 transition-colors">Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ width:24, height:1, background:"#ec5b13" }} />
            <span className="vault-mono text-[7px] uppercase tracking-[0.4em] text-[#ec5b13] font-bold">Your Orders</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="vault-display text-3xl md:text-5xl tracking-tight">Order <span style={{color:"#ec5b13"}}>Archive</span></h1>
            <button onClick={fetchOrders} disabled={refreshing} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#ec5b13]/40 transition-all">
              <RefreshCw className={`w-3 h-3 text-white/30 ${refreshing?"animate-spin":""}`} />
              <span className="vault-mono text-[7px] uppercase tracking-[0.2em] text-white/30">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04] w-fit">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="relative px-4 py-1.5 rounded-lg vault-mono text-[7px] uppercase tracking-wider transition-colors"
                style={{ color:activeTab===tab?"#000":"rgba(255,255,255,0.35)", fontWeight:700 }}>
                {activeTab===tab && <div className="absolute inset-0 bg-[#ec5b13] rounded-lg z-0 shadow-[0_0_14px_rgba(236,91,19,0.3)]" />}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders ── */}
        <div key={activeTab} className="tab-panel space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl">
              <p className="vault-mono text-[8px] text-white/10 uppercase tracking-widest">No orders in this category</p>
            </div>
          ) : filteredOrders.map((order, idx) => {
            const statusKey       = order.status?.toLowerCase() || "ordered";
            const conf            = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ordered;
            const isActive        = ["ordered","pending","processing","shipped"].includes(statusKey);
            const isDelivered     = statusKey === "delivered";
            const isReturned      = statusKey === "returned";
            const returnReqStatus = returnStatuses[order.id];
            const returnApproved  = returnReqStatus === "approved";
            const returnPill      = returnReqStatus ? RETURN_PILL[returnReqStatus] : null;
            const metrics         = isDelivered && !returnApproved ? getReturnMetrics(order.delivered_at) : null;

            return (
              <div key={order.id} className="order-card fade-up rounded-2xl border overflow-hidden"
                style={{ animationDelay:`${idx*0.04}s`, background:`linear-gradient(135deg,${conf.bg} 0%,rgba(255,255,255,0.01) 100%)`, borderColor:conf.border }}>

                {/* ── TOP BAR: status + id + date ── */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-black/20" style={{ borderColor:`${conf.color}25` }}>
                      <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isActive&&!returnApproved?"status-dot-pulse":""}`} style={{ backgroundColor:conf.color }} />
                      <span className="vault-mono text-[10px] font-bold uppercase tracking-wider" style={{ color:conf.color }}>{order.status}</span>
                    </div>
                    <span className="vault-mono text-[9px] px-2 py-0.5 rounded border" style={{ color:conf.color, borderColor:`${conf.color}30`, backgroundColor:`${conf.color}10` }}>
                      {order.order_number || "PENDING"}
                    </span>
                    {returnPill && (
                      <span style={{ display:"inline-flex", padding:"2px 7px", borderRadius:999, background:`${returnPill.color}14`, border:`1px solid ${returnPill.color}40`, fontFamily:"'JetBrains Mono',monospace", fontSize:6.5, color:returnPill.color, textTransform:"uppercase", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>
                        {returnPill.label}
                      </span>
                    )}
                  </div>
                  <span className="vault-mono text-[10px] text-white/30">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                {/* ── BODY: items list + right panel (price + actions) ── */}
                <div className="flex gap-0">

                  {/* Items — show first 2, rest behind premium modal */}
<div className="flex-1 p-4 min-w-0">
  {(() => {
    const allItems   = order.items || [];
    const visible    = allItems.slice(0, 2);
    const extraCount = allItems.length - 2;
    return (
      <>
        <div className="flex flex-col gap-2">
          {visible.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.04]">
              <div style={{ width:36, height:36, borderRadius:8, overflow:"hidden", flexShrink:0, border:"1px solid rgba(255,255,255,0.08)" }}>
                <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="vault-mono text-[11px] font-bold uppercase truncate text-white/80">{item.name}</p>
                <p className="vault-mono text-[9px] text-white/35 mt-0.5">QTY {item.quantity}</p>
              </div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:13, color:"rgba(255,255,255,0.5)", flexShrink:0 }}>
                GH₵{Number(item.price||0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        {/* "View All" button — shown when order has more than 2 items */}
        {extraCount > 0 && (
          <button
            onClick={() => setItemsModal({ items: allItems, orderNumber: order.order_number || order.id?.slice(0,8) })}
            style={{ marginTop:10, width:"100%", padding:"9px 0", background:"transparent", border:"1px dashed rgba(236,91,19,0.3)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", transition:"all 200ms" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(236,91,19,0.06)"; e.currentTarget.style.borderColor="rgba(236,91,19,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(236,91,19,0.3)"; }}>
            {/* Stacked avatars of remaining items */}
            <div style={{ display:"flex", alignItems:"center" }}>
              {allItems.slice(2, 5).map((item, i) => (
                <div key={i} style={{ width:20, height:20, borderRadius:"50%", overflow:"hidden", border:"1.5px solid #0c0c0c", marginLeft:i>0?-6:0, flexShrink:0 }}>
                  <img src={item.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
              ))}
            </div>
            <span className="vault-mono text-[9px] uppercase tracking-wider" style={{ color:"rgba(236,91,19,0.8)" }}>
              +{extraCount} more item{extraCount>1?"s":""} · View all
            </span>
            <span style={{ fontSize:11, color:"rgba(236,91,19,0.6)" }}>↗</span>
          </button>
        )}
      </>
    );
  })()}
</div>
                  {/* Right panel — price + actions, fixed width, left border */}
                  <div className="flex-shrink-0 w-44 border-l p-4 flex flex-col justify-between" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                    {/* Price */}
                    <div className="mb-3">
                      <p className="vault-mono text-[9px] text-white/20 uppercase tracking-widest mb-0.5">Total</p>
                      <p className="vault-display text-2xl text-white/90 leading-tight">GH&#8373;{Number(order.total_amount).toLocaleString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1.5">
                      {/* ── Burn bar — only when active window ── */}
                      {metrics && !metrics.expired && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="vault-mono text-[8px] text-white/25 uppercase tracking-wide">Burn Window™</span>
                            <span className="vault-mono text-[8px] font-bold uppercase" style={{ color:getBurnColor(metrics.ratio).primary }}>{metrics.timeLeft}</span>
                          </div>
                          <div style={{ position:"relative", height:3, borderRadius:999, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                            <div className="burn-bar-fill" style={{ position:"absolute", left:0, top:0, bottom:0, width:`${metrics.progress*100}%`, borderRadius:999, background:`linear-gradient(to left,${getBurnColor(metrics.ratio).secondary},${getBurnColor(metrics.ratio).primary} 60%,rgba(255,200,80,0.8))` }} />
                          </div>
                        </div>
                      )}

                      {/* ── Button logic ── */}
                      {returnApproved ? (
                        <>
                          <div className="py-2 px-2.5 rounded-lg border text-center" style={{ background:"rgba(34,197,94,0.05)", borderColor:"rgba(34,197,94,0.18)" }}>
                            <p className="vault-mono text-[6px] text-[#22c55e]/70 uppercase tracking-wide">Return Approved</p>
                          </div>
                          <button disabled className="w-full py-2 rounded-lg vault-mono text-[7px] uppercase tracking-wider border" style={{ color:"rgba(255,255,255,0.1)", borderColor:"rgba(255,255,255,0.05)", background:"transparent", cursor:"not-allowed" }}>↩ Approved</button>
                        </>
                      ) : isDelivered && !isReturned ? (
                        <>
                          {returnReqStatus ? (
                            <>
                              <div className="py-2 px-2.5 rounded-lg border text-center" style={{ background:`${RETURN_PILL[returnReqStatus]?.color}08`, borderColor:`${RETURN_PILL[returnReqStatus]?.color}25` }}>
                                <p className="vault-mono text-[6px] uppercase tracking-wide" style={{ color:RETURN_PILL[returnReqStatus]?.color }}>
                                  {returnReqStatus === "rejected" ? "Return Rejected" : `Return ${returnReqStatus.charAt(0).toUpperCase()+returnReqStatus.slice(1)}`}
                                </p>
                              </div>
                              <button disabled className="w-full py-2 rounded-lg vault-mono text-[7px] uppercase tracking-wider border" style={{ color:"rgba(255,255,255,0.1)", borderColor:"rgba(255,255,255,0.05)", background:"transparent", cursor:"not-allowed" }}>↩ {returnReqStatus}</button>
                              <button onClick={() => handleReacquire(order.items)} className="w-full py-2 rounded-lg vault-mono text-[7px] uppercase tracking-wider border border-white/10 hover:bg-white/5 transition-all" style={{ background:"transparent", color:"rgba(255,255,255,0.35)", cursor:"pointer" }}>↺ Re-Order</button>
                            </>
                          ) : (
                            <>
                              <button disabled={metrics?.expired} onClick={() => setReturnModal({ order, metrics })}
                                className="w-full py-2 rounded-lg vault-mono text-[10px] uppercase tracking-wider transition-all duration-200"
                                style={{ color:metrics?.expired?"rgba(255,255,255,0.1)":"#ec5b13", border:metrics?.expired?"1px solid rgba(255,255,255,0.05)":"1px solid rgba(236,91,19,0.35)", background:"transparent", cursor:metrics?.expired?"not-allowed":"pointer", opacity:metrics?.expired?0.3:1 }}
                                onMouseEnter={e => { if (!metrics?.expired) { e.currentTarget.style.background="#ec5b13"; e.currentTarget.style.color="#000"; } }}
                                onMouseLeave={e => { if (!metrics?.expired) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#ec5b13"; } }}>
                                {metrics?.expired ? "Window Closed" : "↩ Return"}
                              </button>
                              <button onClick={() => handleReacquire(order.items)}
                                className="w-full py-2 rounded-lg vault-mono text-[7px] uppercase tracking-wider border border-white/10 hover:bg-white/5 transition-all"
                                style={{ background:"transparent", color:"rgba(255,255,255,0.35)", cursor:"pointer" }}>↺ Re-Order</button>
                            </>
                          )}
                        </>
                      ) : isReturned ? (
                        <>
                          <div className="py-2 px-2.5 rounded-lg border text-center border-white/[0.04] bg-white/[0.01]">
                            <p className="vault-mono text-[6px] text-white/25 uppercase tracking-wide">Under Review</p>
                          </div>
                          <button disabled className="w-full py-2 rounded-lg vault-mono text-[7px] uppercase tracking-wider border" style={{ color:"rgba(255,255,255,0.1)", borderColor:"rgba(255,255,255,0.05)", background:"transparent", cursor:"not-allowed" }}>↩ Pending</button>
                          <button disabled className="w-full py-2 rounded-lg vault-mono text-[7px] uppercase tracking-wider border" style={{ color:"rgba(255,255,255,0.1)", borderColor:"rgba(255,255,255,0.05)", background:"transparent", cursor:"not-allowed" }}>↺ Unavailable</button>
                        </>
                      ) : (
                        <div className="py-2 px-2.5 rounded-lg border border-white/[0.03] bg-white/[0.01] text-center">
                          <p className="vault-mono text-[7px] text-white/20 uppercase tracking-wide">{isActive?"Monitoring":"Finalized"}</p>
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