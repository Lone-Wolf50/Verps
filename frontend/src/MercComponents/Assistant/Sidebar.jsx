import React from "react";
import { T, NAV } from "./Tokens";

const Sidebar = ({ tab, isMobile, waitingCount, fullPushCount, reviewCount, onTabSwitch, onClose, onLogout }) => {
	const primaryItems   = NAV.filter((n) => n.mobileBottom);
	const secondaryItems = NAV.filter((n) => !n.mobileBottom);

	const getBadge = (id) => {
		if (id === "queue")   return waitingCount;
		if (id === "inbox")   return fullPushCount;
		if (id === "reviews") return reviewCount;
		return 0;
	};

	const renderItem = (n) => {
		const badge  = getBadge(n.id);
		const active = tab === n.id;
		return (
			<button
				key={n.id}
				onClick={() => onTabSwitch(n.id)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					padding: "11px 14px",
					borderRadius: 12,
					border: "none",
					cursor: "pointer",
					transition: "all 200ms",
					width: "100%",
					background: active ? T.ember : "transparent",
					color: active ? "#000" : "rgba(255,255,255,0.4)",
					boxShadow: active ? "0 0 20px rgba(236,91,19,0.25)" : "none",
					position: "relative",
				}}
			>
				<span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
				<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", flex: 1, textAlign: "left" }}>
					{n.label}
				</span>
				{badge > 0 && (
					<span style={{
						minWidth: 18, height: 18, borderRadius: 999,
						background: n.id === "reviews" ? T.ember : T.escalated,
						color: "white",
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8, fontWeight: 700,
						display: "flex", alignItems: "center", justifyContent: "center",
						padding: "0 3px",
					}}>
						{badge}
					</span>
				)}
			</button>
		);
	};

	return (
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

			{/* Nav — ALL items visible in drawer, both primary and secondary */}
			<nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
				{primaryItems.map(renderItem)}

				{/* Divider before secondary items */}
				<div style={{ margin: "10px 0 6px", padding: "0 4px", display: "flex", alignItems: "center", gap: 8 }}>
					<div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
					<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
						More
					</span>
					<div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
				</div>

				{secondaryItems.map(renderItem)}
			</nav>

			{/* Logout */}
			<div style={{ padding: "12px 10px", borderTop: T.borderSub }}>
				<button
					onClick={onLogout}
					style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", background: "transparent", border: T.border, borderRadius: 10, cursor: "pointer", color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase" }}
					onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
					onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
					Sign out
				</button>
			</div>
		</div>
	);
};

export default Sidebar;