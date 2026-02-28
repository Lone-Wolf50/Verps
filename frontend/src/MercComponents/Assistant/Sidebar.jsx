import React from "react";
import { T, NAV } from "./Tokens";

const Sidebar = ({ tab, isMobile, waitingCount, fullPushCount, onTabSwitch, onClose, onLogout }) => (
	<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
		{/* Brand header */}
		<div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: T.borderSub }}>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontStyle: "italic", color: T.ember }}>V</span>
				<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>ASSISTANT</span>
			</div>
			{isMobile && (
				<button onClick={onClose} style={{ background: "transparent", border: T.border, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
				</button>
			)}
		</div>

		{/* Nav links */}
		<nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
			{NAV.map((n) => {
				const badge = n.id === "queue" ? waitingCount : n.id === "inbox" ? fullPushCount : 0;
				const active = tab === n.id;
				return (
					<button key={n.id} onClick={() => onTabSwitch(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", transition: "all 200ms", width: "100%", background: active ? T.ember : "transparent", color: active ? "#000" : "rgba(255,255,255,0.4)", boxShadow: active ? "0 0 20px rgba(236,91,19,0.25)" : "none" }}>
						<span className="material-symbols-outlined" style={{ fontSize: 18 }}>{n.icon}</span>
						<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>{n.label}</span>
						{badge > 0 && (
							<span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 999, background: T.escalated, color: "white", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
								{badge}
							</span>
						)}
					</button>
				);
			})}
		</nav>

		{/* Logout */}
		<div style={{ padding: "12px 10px", borderTop: T.borderSub }}>
			<button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "transparent", border: T.border, borderRadius: 10, cursor: "pointer", color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase" }}
				onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
				onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
			>
				<span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
				Sign out
			</button>
		</div>
	</div>
);

export default Sidebar;