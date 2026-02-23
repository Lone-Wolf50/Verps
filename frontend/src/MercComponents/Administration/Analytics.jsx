import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

const T = {
	ember: "#ec5b13",
	obsidian: "#0d0d0d",
	border: "1px solid rgba(255,255,255,0.06)",
	live: "#22c55e",
	shipped: "#38bdf8",
	delivered: "#a78bfa",
	waiting: "#f59e0b",
	escalated: "#ef4444",
};
const CHART_COLORS = [
	"#ec5b13",
	"#38bdf8",
	"#a78bfa",
	"#22c55e",
	"#f59e0b",
	"#f87171",
	"#fb923c",
];

/* ─── STAT CARD ─────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, subColor }) => (
	<div
		className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5"
		style={{ borderTop: `2px solid ${accent || T.ember}` }}
	>
		<p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/30 mb-2">
			{label}
		</p>
		<p
			style={{
				fontFamily: "'Playfair Display',serif",
				fontSize: 32,
				fontStyle: "italic",
				color: "white",
				lineHeight: 1,
			}}
		>
			{value}
		</p>
		{sub && (
			<p
				className="text-[10px] mt-2"
				style={{ color: subColor || "rgba(255,255,255,0.3)" }}
			>
				{sub}
			</p>
		)}
	</div>
);

/* ─── MULTI-PERIOD BAR CHART ─────────────────────────────────── */
const PeriodBarChart = ({ data, title, period, onPeriodChange }) => {
	const max = Math.max(...data.map((d) => d.value), 1);
	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
			{/* Header + period toggle */}
			<div className="flex items-center justify-between mb-6 flex-wrap gap-3">
				<p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/30">
					{title}
				</p>
				<div className="flex gap-1 bg-black/30 rounded-xl p-1">
					{["day", "week", "month", "year"].map((p) => (
						<button
							key={p}
							onClick={() => onPeriodChange(p)}
							className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${period === p ? "bg-[#ec5b13] text-black" : "text-white/30 hover:text-white/60"}`}
						>
							{p}
						</button>
					))}
				</div>
			</div>
			<div className="flex items-end gap-1.5" style={{ height: 140 }}>
				{data.map((d, i) => {
					const pct = (d.value / max) * 100;
					const color = CHART_COLORS[i % CHART_COLORS.length];
					const isActive = d.isActive;
					return (
						<div
							key={i}
							className="flex-1 flex flex-col items-center gap-2"
							style={{ height: "100%" }}
						>
							<div className="flex-1 w-full flex items-end">
								<div
									style={{
										width: "100%",
										height: `${Math.max(pct, 3)}%`,
										background: isActive ? color : `${color}38`,
										border: `1px solid ${color}40`,
										borderBottom: "none",
										borderRadius: "3px 3px 0 0",
										position: "relative",
										transition: "height 500ms cubic-bezier(0.16,1,0.3,1)",
										cursor: "default",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = color)
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = isActive
											? color
											: `${color}38`)
									}
								>
									{d.value > 0 && (
										<span
											style={{
												position: "absolute",
												top: -17,
												left: "50%",
												transform: "translateX(-50%)",
												fontFamily: "'JetBrains Mono',monospace",
												fontSize: 7,
												fontWeight: 600,
												color: isActive ? color : "rgba(255,255,255,0.3)",
												whiteSpace: "nowrap",
											}}
										>
											{d.valueLabel || d.value}
										</span>
									)}
								</div>
							</div>
							<span
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 6,
									color: isActive ? color : "rgba(255,255,255,0.2)",
									letterSpacing: "0.06em",
									textAlign: "center",
									lineHeight: 1.2,
								}}
							>
								{d.label}
							</span>
						</div>
					);
				})}
			</div>
			<div className="mt-2 border-t border-white/[0.04]" />
		</div>
	);
};

/* ─── BROADCAST PANEL ───────────────────────────────────────── */
const BroadcastPanel = () => {
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [sending, setSending] = useState(false);
	const [recentSent, setRecentSent] = useState([]);

	useEffect(() => {
		supabase
			.from("verp_inbox_messages")
			.select("*")
			.eq("from_role", "admin")
			.order("created_at", { ascending: false })
			.limit(5)
			.then(({ data }) => {
				if (data) setRecentSent(data);
			});
	}, []);

	const sendBroadcast = async () => {
		if (!subject.trim() || !body.trim()) return;
		setSending(true);
		const { data: sessions } = await supabase
			.from("verp_support_sessions")
			.select("client_email")
			.neq("client_email", null);
		const emails = [
			...new Set((sessions || []).map((s) => s.client_email).filter(Boolean)),
		];
		if (emails.length) {
			await supabase
				.from("verp_inbox_messages")
				.insert(
					emails.map((e) => ({
						to_email: e,
						from_role: "admin",
						subject,
						body,
					})),
				);
		}
		// Email alert via backend
		try {
			await fetch(`${import.meta.env.VITE_SERVER_URL || ""}/api/alert-staff`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "BROADCAST",
					clientId: "ALL_CLIENTS",
					note: subject,
				}),
			});
		} catch (_) {}
		setRecentSent((prev) => [
			{ id: Date.now(), subject, body, created_at: new Date().toISOString() },
			...prev,
		]);
		setSubject("");
		setBody("");
		setSending(false);
		Swal.fire({
			title: "Broadcast Sent!",
			background: T.obsidian,
			color: "#fff",
			icon: "success",
			confirmButtonColor: T.ember,
			timer: 1800,
			showConfirmButton: false,
		});
	};

	return (
		<div className="space-y-4">
			<div
				className="relative overflow-hidden rounded-3xl p-6 md:p-8"
				style={{ background: `linear-gradient(135deg,${T.ember},#d94e0f)` }}
			>
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(circle at 70% 30%,rgba(255,255,255,0.08),transparent 50%)",
					}}
				/>
				<div className="relative">
					<div className="flex items-center gap-3 mb-5">
						<span className="material-symbols-outlined text-black/70 text-3xl">
							campaign
						</span>
						<div>
							<h3 className="text-xl font-light text-black tracking-tight">
								Vault <span className="italic font-serif">Broadcast</span>
							</h3>
							<p className="text-[10px] font-bold uppercase tracking-wider text-black/50">
								Sends to all registered clients
							</p>
						</div>
					</div>
					<input
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Subject..."
						className="w-full bg-black/15 border border-black/10 rounded-xl px-4 py-3 text-sm placeholder:text-black/40 mb-3 outline-none focus:bg-black/25 transition-all text-black font-medium"
					/>
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Write your announcement..."
						rows={4}
						className="w-full bg-black/15 border border-black/10 rounded-xl px-4 py-3 text-sm placeholder:text-black/40 mb-4 outline-none focus:bg-black/25 transition-all resize-none text-black font-light"
					/>
					<button
						onClick={sendBroadcast}
						disabled={sending || !subject.trim() || !body.trim()}
						className="w-full bg-black text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-40"
					>
						{sending ? "SENDING..." : "SEND BROADCAST"}
					</button>
				</div>
			</div>
			{/* Recent broadcasts */}
			{recentSent.length > 0 && (
				<div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-4 space-y-3">
					<p className="text-[8px] font-bold uppercase tracking-[0.28em] text-white/20">
						RECENT BROADCASTS
					</p>
					{recentSent.slice(0, 4).map((m, i) => (
						<div
							key={i}
							className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
						>
							<span className="material-symbols-outlined text-[#ec5b13]/60 text-base mt-0.5">
								mark_email_read
							</span>
							<div className="min-w-0">
								<p className="text-xs font-medium text-white/70 truncate">
									{m.subject}
								</p>
								<p className="text-[9px] text-white/30 mt-0.5">
									{new Date(m.created_at).toLocaleDateString()}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

/* ─── DATA HELPERS ───────────────────────────────────────────── */
const fmt = (n) => {
	if (n >= 1000000) return `₵${(n / 1000000).toFixed(1)}M`;
	if (n >= 1000) return `₵${(n / 1000).toFixed(1)}K`;
	return `₵${n.toLocaleString()}`;
};

const buildRevenueChart = (orders, period) => {
	const now = new Date();
	if (period === "day") {
		return Array.from({ length: 24 }, (_, h) => {
			const val = orders
				.filter((o) => {
					const d = new Date(o.created_at);
					return d.toDateString() === now.toDateString() && d.getHours() === h;
				})
				.reduce((a, b) => a + Number(b.total_amount || 0), 0);
			return {
				label: `${h}h`,
				value: val,
				valueLabel: val ? fmt(val) : "",
				isActive: h === now.getHours(),
			};
		});
	}
	if (period === "week") {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(now);
			d.setDate(now.getDate() - now.getDay() + i);
			const val = orders
				.filter(
					(o) => new Date(o.created_at).toDateString() === d.toDateString(),
				)
				.reduce((a, b) => a + Number(b.total_amount || 0), 0);
			return {
				label: days[i],
				value: val,
				valueLabel: val ? fmt(val) : "",
				isActive: i === now.getDay(),
			};
		});
	}
	if (period === "month") {
		const daysInMonth = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
		).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => {
			const day = i + 1;
			const val = orders
				.filter((o) => {
					const d = new Date(o.created_at);
					return (
						d.getFullYear() === now.getFullYear() &&
						d.getMonth() === now.getMonth() &&
						d.getDate() === day
					);
				})
				.reduce((a, b) => a + Number(b.total_amount || 0), 0);
			return {
				label: `${day}`,
				value: val,
				valueLabel: val ? fmt(val) : "",
				isActive: day === now.getDate(),
			};
		});
	}
	if (period === "year") {
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		return months.map((m, i) => {
			const val = orders
				.filter((o) => {
					const d = new Date(o.created_at);
					return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
				})
				.reduce((a, b) => a + Number(b.total_amount || 0), 0);
			return {
				label: m,
				value: val,
				valueLabel: val ? fmt(val) : "",
				isActive: i === now.getMonth(),
			};
		});
	}
	return [];
};

const buildSessionChart = (sessions, period) => {
	const now = new Date();
	if (period === "day") {
		return Array.from({ length: 24 }, (_, h) => {
			return {
				label: `${h}h`,
				value: sessions.filter((s) => {
					const d = new Date(s.created_at);
					return d.toDateString() === now.toDateString() && d.getHours() === h;
				}).length,
				isActive: h === now.getHours(),
			};
		});
	}
	if (period === "week") {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(now);
			d.setDate(now.getDate() - now.getDay() + i);
			return {
				label: days[i],
				value: sessions.filter(
					(s) => new Date(s.created_at).toDateString() === d.toDateString(),
				).length,
				isActive: i === now.getDay(),
			};
		});
	}
	if (period === "month") {
		const daysInMonth = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
		).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => {
			const day = i + 1;
			return {
				label: `${day}`,
				value: sessions.filter((s) => {
					const d = new Date(s.created_at);
					return (
						d.getFullYear() === now.getFullYear() &&
						d.getMonth() === now.getMonth() &&
						d.getDate() === day
					);
				}).length,
				isActive: day === now.getDate(),
			};
		});
	}
	if (period === "year") {
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		return months.map((m, i) => {
			return {
				label: m,
				value: sessions.filter((s) => {
					const d = new Date(s.created_at);
					return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
				}).length,
				isActive: i === now.getMonth(),
			};
		});
	}
	return [];
};

/* ─── MAIN ANALYTICS ─────────────────────────────────────────── */
const Analytics = () => {
	const [sessions, setSessions] = useState([]);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [revenuePeriod, setRevenuePeriod] = useState("month");
	const [sessionPeriod, setSessionPeriod] = useState("week");

	useEffect(() => {
		const fetch = async () => {
			const [{ data: s }, { data: o }] = await Promise.all([
				supabase.from("verp_support_sessions").select("*"),
				supabase.from("verp_orders").select("*"),
			]);
			if (s) setSessions(s);
			if (o) setOrders(o);
			setLoading(false);
		};
		fetch();
		const i = setInterval(fetch, 30000);
		return () => clearInterval(i);
	}, []);

	const resolved = sessions.filter((s) => s.status === "resolved").length;
	const escalated = sessions.filter((s) => s.status === "escalated").length;
	const avgRating = sessions.filter((s) => s.rating).length
		? (
				sessions.filter((s) => s.rating).reduce((a, b) => a + b.rating, 0) /
				sessions.filter((s) => s.rating).length
			).toFixed(1)
		: "—";
	const totalRevenue = orders.reduce(
		(a, b) => a + Number(b.total_amount || 0),
		0,
	);

	const revenueData = buildRevenueChart(orders, revenuePeriod);
	const sessionData = buildSessionChart(sessions, sessionPeriod);

	// Order status distribution (all time)
	const statusDist = [
		"ordered",
		"pending",
		"processing",
		"shipped",
		"delivered",
		"returned",
		"cancelled",
	].map((s) => ({
		label: s.slice(0, 3).toUpperCase(),
		value: orders.filter((o) => o.status?.toLowerCase() === s).length,
		isActive: ["delivered", "shipped"].includes(s),
	}));

	if (loading)
		return (
			<div className="flex items-center justify-center h-full py-40">
				<div className="w-8 h-8 border-2 border-t-[#ec5b13] border-white/10 rounded-full animate-spin" />
			</div>
		);

	return (
		<div className="space-y-6 px-4 md:px-0 pb-16 overflow-y-auto">
			{/* KPI grid */}
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
				<StatCard
					label="Total Revenue"
					value={fmt(totalRevenue)}
					accent={T.ember}
					subColor={T.ember}
					sub={`${orders.length} orders`}
				/>
				<StatCard
					label="Total Sessions"
					value={sessions.length}
					accent={T.shipped}
				/>
				<StatCard
					label="Resolved"
					value={resolved}
					accent={T.live}
					subColor={T.live}
					sub={`${sessions.length ? Math.round((resolved / sessions.length) * 100) : 0}% rate`}
				/>
				<StatCard
					label="Avg Rating"
					value={avgRating}
					accent={T.delivered}
					subColor={T.delivered}
					sub="out of 5"
				/>
				<StatCard
					label="Escalated"
					value={escalated}
					accent={T.escalated}
					subColor={T.escalated}
					sub="required admin"
				/>
				<StatCard
					label="Live Now"
					value={sessions.filter((s) => s.status === "live").length}
					accent={T.waiting}
					subColor={T.waiting}
					sub="active now"
				/>
			</div>

			{/* Charts row */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="xl:col-span-2 space-y-4">
					<PeriodBarChart
						data={revenueData}
						title="REVENUE"
						period={revenuePeriod}
						onPeriodChange={setRevenuePeriod}
					/>
					<PeriodBarChart
						data={sessionData}
						title="SUPPORT SESSIONS"
						period={sessionPeriod}
						onPeriodChange={setSessionPeriod}
					/>
					<PeriodBarChart
						data={statusDist}
						title="ORDER STATUS — ALL TIME"
						period="all"
						onPeriodChange={() => {}}
					/>
				</div>

				{/* Right column: broadcast + satisfaction */}
				<div className="space-y-6">
					<BroadcastPanel />
					{/* Rating satisfaction */}
					<div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
						<p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/30 mb-5">
							SATISFACTION
						</p>
						<div className="space-y-3">
							{[5, 4, 3, 2, 1].map((s) => {
								const count = sessions.filter((x) => x.rating === s).length;
								const maxR = Math.max(
									...[5, 4, 3, 2, 1].map(
										(x) => sessions.filter((y) => y.rating === x).length,
									),
									1,
								);
								return (
									<div key={s} className="flex items-center gap-3">
										<span
											style={{
												fontFamily: "'JetBrains Mono',monospace",
												fontSize: 10,
												color: T.ember,
												width: 22,
												textAlign: "right",
											}}
										>
											{s}★
										</span>
										<div
											style={{
												flex: 1,
												height: 5,
												background: "rgba(255,255,255,0.04)",
												borderRadius: 99,
												overflow: "hidden",
											}}
										>
											<div
												style={{
													height: "100%",
													width: `${(count / maxR) * 100}%`,
													background: `rgba(236,91,19,${0.3 + (s / 5) * 0.7})`,
													borderRadius: 99,
													transition: "width 800ms cubic-bezier(0.16,1,0.3,1)",
												}}
											/>
										</div>
										<span
											style={{
												fontFamily: "'JetBrains Mono',monospace",
												fontSize: 8,
												color: "rgba(255,255,255,0.25)",
												width: 18,
											}}
										>
											{count}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Analytics;
