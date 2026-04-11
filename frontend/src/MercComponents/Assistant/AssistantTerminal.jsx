import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import OrderMessagesTab from "./OrderMessagesTab";

import { T, NAV, MOBILE_NAV } from "./Tokens";
import Sidebar        from "./Sidebar";
import InboxTabss     from "./InboxTabs";
import QueueTab       from "./QueueTab";
import OrdersTab      from "./OrdersTab";
import AnalyticsTab   from "./AnalyticsTab";
import AdminChannel from "../Shared/AdminChannels.jsx";
import ChatHistoryTab from "./ChatHistoryTab";
import PushModal      from "./PushModal";
import ReviewInbox    from "../Shared/ReviewInbox";
import ReviewAnalytics from "../Shared/ReviewAnalytics";

/* ─── GLOBAL STYLES ──────────────────────────────────────────── */
const STYLES = `
  *{box-sizing:border-box;}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(236,91,19,0.3);border-radius:99px}
  @keyframes pd{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @keyframes slideInR{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}
  .vault-agent-name-input{color:#000!important;background:#fff!important;}
  .at-bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:60;background:rgba(8,8,8,0.97);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:stretch;padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -8px 32px rgba(0,0,0,0.6);}
  .at-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:10px 4px 8px;border:none;background:transparent;cursor:pointer;position:relative;transition:all 150ms;-webkit-tap-highlight-color:transparent;min-height:58px;}
  .at-nav-item.active .at-nav-icon{color:#ec5b13;}
  .at-nav-item.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:32px;height:2px;background:linear-gradient(90deg,transparent,#ec5b13,transparent);border-radius:0 0 4px 4px;}
  .at-nav-icon{font-size:21px!important;color:rgba(255,255,255,0.25);transition:color 200ms;}
  .at-nav-label{font-family:'JetBrains Mono',monospace;font-size:5.5px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.22);transition:color 200ms;white-space:nowrap;}
  .at-nav-item.active .at-nav-label{color:rgba(236,91,19,0.65);}
  .at-badge{position:absolute;top:6px;right:calc(50% - 17px);min-width:15px;height:15px;border-radius:999px;background:#ef4444;color:white;font-family:'JetBrains Mono',monospace;font-size:7px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;border:1.5px solid #080808;box-shadow:0 2px 8px rgba(239,68,68,0.5);}
  .at-order-card{background:#0d0d0d;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:16px;margin-bottom:10px;cursor:pointer;transition:border-color 180ms,background 180ms;animation:fadeUp 0.3s ease both;-webkit-tap-highlight-color:transparent;}
  .at-order-card:active{background:#111;border-color:rgba(236,91,19,0.28);}
  @keyframes onlinePulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 7px rgba(34,197,94,0)}}
  @keyframes offlinePulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes initFadeIn{from{opacity:0;transform:scale(0.96) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes initCheckIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
  @media(max-width:1023px){button{-webkit-tap-highlight-color:transparent;}}
`;

/* ─── INITIALIZE MODAL ───────────────────────────────────────── */
/* Shown every login when support is offline.
   Compulsory — no close button. Must click Go Live.             */
const InitializeModal = ({ onInitialized }) => {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleGoLive = async () => {
    setLoading(true);
    await supabase
      .from("verp_support_status")
      .upsert({ id: 1, is_online: true, updated_at: new Date().toISOString() }, { onConflict: "id" });
    setDone(true);
    setLoading(false);
    setTimeout(() => onInitialized(), 1000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.9)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "linear-gradient(160deg,#111,#0a0a0a)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 28,
        padding: "48px 36px 40px",
        boxShadow: "0 48px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03) inset",
        animation: "initFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 120,
          background: done ? "radial-gradient(ellipse,rgba(34,197,94,0.15),transparent 70%)"
                           : "radial-gradient(ellipse,rgba(236,91,19,0.12),transparent 70%)",
          pointerEvents: "none", transition: "background 600ms",
        }} />

        {/* Icon ring */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          margin: "0 auto 28px",
          background: done ? "rgba(34,197,94,0.08)" : "rgba(236,91,19,0.07)",
          border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(236,91,19,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 500ms",
          animation: done ? "onlinePulse 1.2s ease-out" : "none",
        }}>
          <span className="material-symbols-outlined" style={{
            fontSize: 32,
            color: done ? "#22c55e" : "#ec5b13",
            transition: "color 400ms",
            animation: done ? "initCheckIn 0.4s cubic-bezier(0.16,1,0.3,1) both" : "none",
          }}>
            {done ? "check_circle" : "support_agent"}
          </span>
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 26, fontStyle: "italic",
          color: "#fff", margin: "0 0 8px",
        }}>
          {done ? "You're Live" : "Initialize Live Support"}
        </h2>

        {/* Sub-label */}
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
          color: done ? "rgba(34,197,94,0.65)" : "rgba(255,255,255,0.22)",
          margin: "0 0 24px",
          transition: "color 500ms",
        }}>
          {done ? "CLIENTS CAN NOW REACH YOU" : "REQUIRED TO ACCESS TERMINAL"}
        </p>

        {!done && (
          <>
            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13, lineHeight: 1.7,
              color: "rgba(255,255,255,0.38)",
              margin: "0 0 10px",
            }}>
              Clients currently see an <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>offline</strong> status and cannot request live assistance.
            </p>
            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13, lineHeight: 1.7,
              color: "rgba(255,255,255,0.38)",
              margin: "0 0 36px",
            }}>
              Activate live support to open the queue and begin receiving sessions.
            </p>

            <button
              onClick={handleGoLive}
              disabled={loading}
              style={{
                width: "100%",
                background: loading
                  ? "rgba(34,197,94,0.12)"
                  : "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
                border: loading ? "1px solid rgba(34,197,94,0.25)" : "none",
                borderRadius: 14,
                padding: "17px 0",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 11, fontWeight: 800,
                letterSpacing: "0.24em", textTransform: "uppercase",
                color: loading ? "rgba(34,197,94,0.6)" : "#000",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 250ms",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: loading ? "none" : "0 8px 24px rgba(34,197,94,0.25)",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = "brightness(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 15, height: 15, borderRadius: "50%",
                    border: "2px solid rgba(34,197,94,0.25)",
                    borderTopColor: "#22c55e",
                    animation: "pd 0.9s linear infinite",
                  }} />
                  Activating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>wifi_tethering</span>
                  Go Live
                </>
              )}
            </button>

            {/* Fine print */}
            <p style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.12)",
              margin: "20px 0 0",
            }}>
              Support will auto-close when you log out
            </p>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ASSISTANT TERMINAL
   ═══════════════════════════════════════════════════════════════ */
const AssistantTerminal = () => {
	const navigate = useNavigate();
	const [tab, setTab]                   = useState("inbox");
	const [sidebarOpen, setSidebarOpen]   = useState(false);
	const [sessions, setSessions]         = useState([]);
	const [selectedChat, setSelectedChat] = useState(null);
	const [isMobile, setIsMobile]         = useState(window.innerWidth < 1024);
	const [pushModal, setPushModal]       = useState(null);

  /* ── Live-support state ── */
  const [supportOnline,   setSupportOnline]   = useState(false);
  const [supportChecked,  setSupportChecked]  = useState(false);
  const [showInitModal,   setShowInitModal]    = useState(false);
  const [togglingSupport, setTogglingSupport] = useState(false);

	useEffect(() => {
		const h = () => setIsMobile(window.innerWidth < 1024);
		window.addEventListener("resize", h);
		return () => window.removeEventListener("resize", h);
	}, []);

	const prevWaitingCountRef = React.useRef(0);

	const fetchSessions = useCallback(async () => {
		const { data } = await supabase
			.from("verp_support_sessions")
			.select("*")
			.order("updated_at", { ascending: false });
		if (data) {
			const newWaiting = data.filter(s => s.status === "waiting").length;
			// 👤 Play sound if a new client joined the queue
			if (newWaiting > prevWaitingCountRef.current) {
				try {
					const audio = new Audio("/notify.mp3");
					audio.volume = 0.5;
					audio.play().catch(() => {});
				} catch (_) {}
			}
			prevWaitingCountRef.current = newWaiting;
			setSessions(data);
		}
	}, []);

	useEffect(() => {
		fetchSessions();
		const i = setInterval(fetchSessions, 5000);
		return () => clearInterval(i);
	}, [fetchSessions]);

	const waitingCount    = sessions.filter((s) => s.status === "waiting").length;
	const fullPushCount   = sessions.filter((s) => s.status === "full_push").length;
	const liveSessions    = sessions.filter((s) => s.status === "live" || s.status === "escalated");
	const waitingSessions = sessions.filter((s) => s.status === "waiting");

	const [reviewCount, setReviewCount] = useState(0);

	const fetchReviewCount = useCallback(async () => {
		const { count } = await supabase
			.from("verp_product_reviews")
			.select("id", { count: "exact", head: true })
			.eq("status", "pending");
		if (count !== null) setReviewCount(count);
	}, []);

	useEffect(() => {
		fetchReviewCount();
		const channel = supabase
			.channel("at_review_badge")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "verp_product_reviews" },
				() => { fetchReviewCount(); }
			)
			.subscribe();
		return () => { supabase.removeChannel(channel); };
	}, [fetchReviewCount]);

  /* ── Fetch support status on mount ── */
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("verp_support_status")
        .select("is_online")
        .eq("id", 1)
        .maybeSingle();
      const online = data?.is_online ?? false;
      setSupportOnline(online);
      setSupportChecked(true);
      if (!online) setShowInitModal(true);
    };
    fetchStatus();
  }, []);

  /* ── Toggle support pill ── */
  const handleToggleSupport = async () => {
    setTogglingSupport(true);
    const next = !supportOnline;
    await supabase
      .from("verp_support_status")
      .upsert({ id: 1, is_online: next, updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSupportOnline(next);
    setTogglingSupport(false);
    /* If they toggle back offline mid-session, show modal again on next toggle-on? No — only on login. */
  };

	const handleStaffLogout = async () => {
    /* Always set support offline on logout */
    await supabase
      .from("verp_support_status")
      .upsert({ id: 1, is_online: false, updated_at: new Date().toISOString() }, { onConflict: "id" });
		localStorage.removeItem("staffRole_assistant");
		localStorage.removeItem("staffEmail_assistant");
		sessionStorage.removeItem("staffRole_assistant");
		sessionStorage.removeItem("staffEmail_assistant");
		localStorage.removeItem("staffRole");
		localStorage.removeItem("staffEmail");
		sessionStorage.removeItem("staffRole");
		sessionStorage.removeItem("staffEmail");
		console.log("%c🚪 Assistant logged out — all auth keys cleared", "color:#38bdf8;font-weight:bold");
		navigate("/sys/console/login?from=assistant", { replace: true });
	};

	const updateStatus = async (id, newStatus) => {
		await supabase
			.from("verp_support_sessions")
			.update({ status: newStatus, updated_at: new Date().toISOString() })
			.eq("id", id);
		setSelectedChat(null);
		fetchSessions();
	};

	const switchTab = (t) => { setTab(t); setSelectedChat(null); setSidebarOpen(false); };

  /* ── Support status pill ── */
  const SupportStatusPill = () => (
    <button
      onClick={handleToggleSupport}
      disabled={togglingSupport || !supportChecked}
      title={supportOnline ? "Click to go offline" : "Click to go online"}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "5px 12px 5px 9px",
        background: supportOnline ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.06)",
        border: supportOnline
          ? "1px solid rgba(34,197,94,0.22)"
          : "1px solid rgba(239,68,68,0.22)",
        borderRadius: 999,
        cursor: togglingSupport ? "not-allowed" : "pointer",
        opacity: togglingSupport ? 0.55 : 1,
        transition: "all 250ms",
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: supportOnline ? "#22c55e" : "#ef4444",
        animation: supportOnline ? "onlinePulse 2s ease-in-out infinite" : "offlinePulse 2s ease-in-out infinite",
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase",
        color: supportOnline ? "rgba(34,197,94,0.7)" : "rgba(239,68,68,0.65)",
        whiteSpace: "nowrap",
      }}>
        {togglingSupport ? "···" : supportOnline ? "Live" : "Offline"}
      </span>
    </button>
  );

	return (
		<>
			<style>{STYLES}</style>

      {/* Compulsory initialize modal */}
      {showInitModal && (
        <InitializeModal onInitialized={() => {
          setSupportOnline(true);
          setShowInitModal(false);
        }} />
      )}

			{pushModal && (
				<PushModal
					session={pushModal.session}
					type={pushModal.type}
					onClose={() => setPushModal(null)}
					onDone={() => {
						setPushModal(null);
						if (pushModal.type === "full") setSelectedChat(null);
						fetchSessions();
					}}
				/>
			)}

			<div style={{ display: "flex", height: "100vh", background: T.void, overflow: "hidden", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>
				{/* Mobile backdrop */}
				{isMobile && sidebarOpen && (
					<div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 40 }} />
				)}

				{/* Sidebar */}
				<div style={{ width: 220, flexShrink: 0, background: "#0a0a0a", borderRight: T.borderSub, position: isMobile ? "fixed" : "relative", top: 0, left: 0, height: "100vh", zIndex: 50, transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)", transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
					<Sidebar tab={tab} isMobile={isMobile} waitingCount={waitingCount} fullPushCount={fullPushCount} reviewCount={reviewCount} onTabSwitch={switchTab} onClose={() => setSidebarOpen(false)} onLogout={handleStaffLogout} />
				</div>

				{/* Main */}
				<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, paddingBottom: isMobile ? 58 : 0 }}>

					{/* Mobile top bar */}
					{isMobile && (
						<div style={{ height: 56, background: "rgba(10,10,10,0.98)", borderBottom: T.borderSub, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}>
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontStyle: "italic", color: T.ember, lineHeight: 1 }}>V</span>
								<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
									<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
										{NAV.find((n) => n.id === tab)?.label || "Terminal"}
									</span>
									{waitingCount > 0 && (
										<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, letterSpacing: "0.15em", color: T.escalated }}>{waitingCount} WAITING</span>
									)}
								</div>
							</div>
              <SupportStatusPill />
							<button onClick={handleStaffLogout} style={{ marginLeft: "auto", background: "transparent", border: T.borderSub, borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>
								<span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
							</button>
						</div>
					)}

          {/* Desktop thin status bar */}
          {!isMobile && (
            <div style={{
              height: 40, flexShrink: 0,
              background: "rgba(8,8,8,0.95)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center",
              padding: "0 22px", justifyContent: "flex-end", gap: 10,
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
              }}>
                Live Support
              </span>
              <SupportStatusPill />
            </div>
          )}

					{/* ── Tab panels ── */}
					{tab === "inbox" && (
						<InboxTabss
							liveSessions={liveSessions}
							selectedChat={selectedChat}
							isMobile={isMobile}
							onSelect={setSelectedChat}
							onClearSelected={() => setSelectedChat(null)}
							onEscalate={(s) => setPushModal({ session: s, type: "partial" })}
							onFullPush={(s) => setPushModal({ session: s, type: "full" })}
							onResolve={(id) => updateStatus(id, "resolved")}
						/>
					)}
					{tab === "queue"          && <QueueTab waitingSessions={waitingSessions} onRefresh={fetchSessions} />}
					{tab === "orders"         && <OrdersTab />}
					{tab === "order-messages" && <OrderMessagesTab />}
					{tab === "analytics"      && <AnalyticsTab />}
					{tab === "admin"          && <AdminChannel role="assistant" />}
					{tab === "history"        && <ChatHistoryTab />}
					{tab === "reviews"        && <ReviewInbox role="assistant" />}
					{tab === "review-analytics" && <ReviewAnalytics />}
				</div>
			</div>

		{/* Mobile bottom nav */}
		{isMobile && (
			<nav className="at-bottom-nav">
				{MOBILE_NAV.map((n) => {
					const badge  = n.id === "queue" ? waitingCount : n.id === "inbox" ? fullPushCount : 0;
					const active = tab === n.id;
					return (
						<button key={n.id} className={`at-nav-item${active ? " active" : ""}`} onClick={() => switchTab(n.id)}>
							{badge > 0 && <span className="at-badge">{badge}</span>}
							<span className="material-symbols-outlined at-nav-icon">{n.icon}</span>
							<span className="at-nav-label">{n.label}</span>
						</button>
					);
				})}
				{(() => {
					const isSecondaryActive = !MOBILE_NAV.some((n) => n.id === tab);
					return (
						<button
							className={`at-nav-item${isSecondaryActive ? " active" : ""}`}
							onClick={() => setSidebarOpen(true)}
						>
							{reviewCount > 0 && (
								<span className="at-badge" style={{ background: "#ec5b13" }}>
									{reviewCount}
								</span>
							)}
							<span className="material-symbols-outlined at-nav-icon">more_horiz</span>
							<span className="at-nav-label">More</span>
						</button>
					);
				})()}
			</nav>
		)}
	</>
	);
};

export default AssistantTerminal;