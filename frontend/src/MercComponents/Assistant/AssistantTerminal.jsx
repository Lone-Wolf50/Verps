import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import OrderMessagesTab from "./OrderMessagesTab";

import { T, NAV }   from "./Tokens";
import Sidebar       from "./Sidebar";
import InboxTabss     from "./InboxTabs";
import QueueTab      from "./QueueTab";
import OrdersTab     from "./OrdersTab";
import AnalyticsTab  from "./AnalyticsTab";
import AdminChannel  from "./AdminChannel";
import ChatHistoryTab from "./ChatHistoryTab";
import PushModal     from "./PushModal";

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
  @media(max-width:1023px){button{-webkit-tap-highlight-color:transparent;}}
`;

/* ═══════════════════════════════════════════════════════════════
   ASSISTANT TERMINAL — orchestrator only, ~120 lines
   All heavy UI lives in ./AssistantTerminal/
   ═══════════════════════════════════════════════════════════════ */
const AssistantTerminal = () => {
	const navigate = useNavigate();
	const [tab, setTab]                   = useState("inbox");
	const [sidebarOpen, setSidebarOpen]   = useState(false);
	const [sessions, setSessions]         = useState([]);
	const [selectedChat, setSelectedChat] = useState(null);
	const [isMobile, setIsMobile]         = useState(window.innerWidth < 1024);
	const [pushModal, setPushModal]       = useState(null); // { session, type }

	useEffect(() => {
		const h = () => setIsMobile(window.innerWidth < 1024);
		window.addEventListener("resize", h);
		return () => window.removeEventListener("resize", h);
	}, []);

	const fetchSessions = useCallback(async () => {
		const { data } = await supabase
			.from("verp_support_sessions")
			.select("*")
			.order("updated_at", { ascending: false });
		if (data) setSessions(data);
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

	const handleStaffLogout = () => {
		// Clear namespaced keys (new format)
		localStorage.removeItem("staffRole_assistant");
		localStorage.removeItem("staffEmail_assistant");
		sessionStorage.removeItem("staffRole_assistant");
		sessionStorage.removeItem("staffEmail_assistant");
		// Clear legacy keys (old format) just in case
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

	return (
		<>
			<style>{STYLES}</style>

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
					<Sidebar tab={tab} isMobile={isMobile} waitingCount={waitingCount} fullPushCount={fullPushCount} onTabSwitch={switchTab} onClose={() => setSidebarOpen(false)} onLogout={handleStaffLogout} />
				</div>

				{/* Main */}
				<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, paddingBottom: isMobile ? 58 : 0 }}>
					{/* Mobile top bar */}
					{isMobile && (
						<div style={{ height: 56, background: "rgba(10,10,10,0.98)", borderBottom: T.borderSub, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}>
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
							<button onClick={handleStaffLogout} style={{ marginLeft: "auto", background: "transparent", border: T.borderSub, borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>
								<span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
							</button>
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
					{tab === "admin"          && <AdminChannel />}
					{tab === "history"        && <ChatHistoryTab />}
				</div>
			</div>

			{/* Mobile bottom nav */}
			{isMobile && (
				<nav className="at-bottom-nav">
					{NAV.map((n) => {
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
				</nav>
			)}
		</>
	);
};

export default AssistantTerminal;