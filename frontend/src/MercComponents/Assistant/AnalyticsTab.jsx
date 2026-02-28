import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "./Tokens";
import { StatCard } from "./SharredComponents";

/* ─── BAR CHART ──────────────────────────────────────────────── */
const BarChart = ({ data }) => {
	const max = Math.max(...data.map((d) => d.value), 1);
	return (
		<div style={{ background: T.obsidian, border: T.border, borderRadius: 18, padding: "22px 24px" }}>
			<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
				DAILY SESSIONS — LAST 7 DAYS
			</p>
			<div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
				{data.map((d, i) => {
					const pct = (d.value / max) * 100;
					return (
						<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
							<div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
								<div
									style={{ width: "100%", height: `${Math.max(pct, 3)}%`, background: d.isToday ? T.ember : "rgba(236,91,19,0.28)", borderRadius: "4px 4px 0 0", position: "relative", transition: "height 600ms cubic-bezier(0.16,1,0.3,1)", cursor: "default" }}
									onMouseEnter={(e) => (e.currentTarget.style.background = d.isToday ? "#ff6a20" : "rgba(236,91,19,0.55)")}
									onMouseLeave={(e) => (e.currentTarget.style.background = d.isToday ? T.ember : "rgba(236,91,19,0.28)")}
								>
									<span style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 600, color: d.isToday ? T.ember : "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
										{d.value}
									</span>
								</div>
							</div>
							<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: d.isToday ? T.ember : "rgba(255,255,255,0.22)", letterSpacing: "0.1em" }}>
								{d.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/* ─── ANALYTICS TAB ──────────────────────────────────────────── */
const AnalyticsTab = () => {
	const [sessions, setSessions] = useState([]);

	useEffect(() => {
		supabase.from("verp_support_sessions").select("*")
			.then(({ data }) => { if (data) setSessions(data); });
	}, []);

	const resolved = sessions.filter((s) => s.status === "resolved").length;
	const rated = sessions.filter((s) => s.rating);
	const avg = rated.length
		? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1)
		: "—";

	const days7 = Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (6 - i));
		return {
			label: d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2).toUpperCase(),
			value: sessions.filter((s) => s.created_at?.slice(0, 10) === d.toISOString().slice(0, 10)).length,
			isToday: i === 6,
		};
	});

	const ratingRows = [5, 4, 3, 2, 1].map((s) => ({
		star: s,
		count: sessions.filter((x) => x.rating === s).length,
	}));
	const maxR = Math.max(...ratingRows.map((r) => r.count), 1);

	return (
		<div style={{ padding: "20px", overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
				<StatCard label="Total Sessions" value={sessions.length} />
				<StatCard label="Resolved" value={resolved} sub={`${sessions.length ? Math.round((resolved / sessions.length) * 100) : 0}% rate`} subColor={T.live} />
				<StatCard label="Avg Rating" value={avg} sub="out of 5" subColor={T.ember} />
				<StatCard label="Live Now" value={sessions.filter((s) => s.status === "live").length} subColor={T.waiting} sub="active sessions" />
			</div>

			<BarChart data={days7} />

			<div style={{ background: T.obsidian, border: T.border, borderRadius: 18, padding: "20px 22px" }}>
				<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
					SATISFACTION
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{ratingRows.map((r) => (
						<div key={r.star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: T.ember, width: 22, textAlign: "right" }}>{r.star}★</span>
							<div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 99, overflow: "hidden" }}>
								<div style={{ height: "100%", width: `${(r.count / maxR) * 100}%`, background: `rgba(236,91,19,${0.3 + (r.star / 5) * 0.7})`, borderRadius: 99, transition: "width 800ms cubic-bezier(0.16,1,0.3,1)" }} />
							</div>
							<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", width: 18 }}>{r.count}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default AnalyticsTab;