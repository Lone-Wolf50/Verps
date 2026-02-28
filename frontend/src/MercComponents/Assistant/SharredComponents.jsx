import React from "react";
import { T, STATUS_CFG, ORDER_COLOR } from "./Tokens";

/* ─── SESSION STATUS BADGE ───────────────────────────────────── */
export const Badge = ({ status }) => {
	const cfg = STATUS_CFG[status] || {
		color: T.resolved,
		label: (status || "").toUpperCase(),
		pulse: false,
	};
	return (
		<span style={{
			display: "inline-flex", alignItems: "center", gap: 5,
			padding: "3px 10px", borderRadius: 999,
			background: `${cfg.color}14`, border: `1px solid ${cfg.color}40`,
			fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700,
			letterSpacing: "0.15em", textTransform: "uppercase",
			color: cfg.color, whiteSpace: "nowrap",
		}}>
			<span style={{
				width: 5, height: 5, borderRadius: "50%", background: cfg.color,
				flexShrink: 0,
				animation: cfg.pulse ? "pd 2s ease-in-out infinite" : "none",
			}} />
			{cfg.label}
		</span>
	);
};

/* ─── ORDER STATUS BADGE ─────────────────────────────────────── */
export const OrderBadge = ({ status = "" }) => {
	const c = ORDER_COLOR[status.toLowerCase()] || T.resolved;
	return (
		<span style={{
			display: "inline-flex", padding: "3px 10px", borderRadius: 999,
			background: `${c}14`, border: `1px solid ${c}40`,
			fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700,
			letterSpacing: "0.12em", textTransform: "uppercase", color: c,
		}}>
			{status.toUpperCase()}
		</span>
	);
};

/* ─── STAT CARD ──────────────────────────────────────────────── */
export const StatCard = ({ label, value, sub, subColor }) => (
	<div style={{ background: T.obsidian, border: T.border, borderRadius: 18, padding: "18px 20px" }}>
		<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
			{label}
		</p>
		<p style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontStyle: "italic", color: "white", lineHeight: 1 }}>
			{value}
		</p>
		{sub && (
			<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: subColor || "rgba(255,255,255,0.3)", marginTop: 6 }}>
				{sub}
			</p>
		)}
	</div>
);