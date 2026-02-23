import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import LiveAssistantChat from "../Messages/LiveAssistantChat";
import Swal from "sweetalert2";

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	smoke: "#1c1c1c",
	ember: "#ec5b13",
	emberDim: "rgba(236,91,19,0.10)",
	emberBorder: "rgba(236,91,19,0.35)",
	live: "#22c55e",
	waiting: "#f59e0b",
	resolved: "#6b7280",
	escalated: "#ef4444",
	shipped: "#38bdf8",
	delivered: "#a78bfa",
	returned: "#fb923c",
	cancelled: "#f87171",
	border: "1px solid rgba(255,255,255,0.06)",
	borderSub: "1px solid rgba(255,255,255,0.03)",
};
const STATUS_CFG = {
	waiting: { color: T.waiting, label: "WAITING", pulse: true },
	live: { color: T.live, label: "LIVE", pulse: true },
	resolved: { color: T.resolved, label: "RESOLVED", pulse: false },
	escalated: { color: T.escalated, label: "ESCALATED", pulse: true },
	full_push: { color: "#a78bfa", label: "ADMIN TAKEOVER", pulse: true },
};
const ORDER_STATUSES = [
	"ordered",
	"pending",
	"processing",
	"shipped",
	"delivered",
	"returned",
	"cancelled",
];
const ORDER_COLOR = {
	ordered: "#a78bfa",
	pending: T.waiting,
	processing: T.shipped,
	shipped: T.shipped,
	delivered: T.ember,
	returned: T.returned,
	cancelled: T.cancelled,
};
const NAV = [
	{ id: "inbox", icon: "chat_bubble", label: "Live Inbox" },
	{ id: "queue", icon: "group_add", label: "Queue" },
	{ id: "orders", icon: "inventory_2", label: "Orders" },
	{ id: "analytics", icon: "bar_chart", label: "Analytics" },
	{ id: "admin", icon: "admin_panel_settings", label: "Admin Channel" },
	{ id: "history", icon: "history", label: "Chat History" },
];

/* ─── MINI COMPONENTS ────────────────────────────────────────── */
const Badge = ({ status }) => {
	const cfg = STATUS_CFG[status] || {
		color: T.resolved,
		label: (status || "").toUpperCase(),
		pulse: false,
	};
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				padding: "3px 10px",
				borderRadius: 999,
				background: `${cfg.color}14`,
				border: `1px solid ${cfg.color}40`,
				fontFamily: "'JetBrains Mono',monospace",
				fontSize: 8,
				fontWeight: 700,
				letterSpacing: "0.15em",
				textTransform: "uppercase",
				color: cfg.color,
				whiteSpace: "nowrap",
			}}
		>
			<span
				style={{
					width: 5,
					height: 5,
					borderRadius: "50%",
					background: cfg.color,
					flexShrink: 0,
					animation: cfg.pulse ? "pd 2s ease-in-out infinite" : "none",
				}}
			/>
			{cfg.label}
		</span>
	);
};
const OrderBadge = ({ status = "" }) => {
	const c = ORDER_COLOR[status.toLowerCase()] || T.resolved;
	return (
		<span
			style={{
				display: "inline-flex",
				padding: "3px 10px",
				borderRadius: 999,
				background: `${c}14`,
				border: `1px solid ${c}40`,
				fontFamily: "'JetBrains Mono',monospace",
				fontSize: 8,
				fontWeight: 700,
				letterSpacing: "0.12em",
				textTransform: "uppercase",
				color: c,
			}}
		>
			{status.toUpperCase()}
		</span>
	);
};
const StatCard = ({ label, value, sub, subColor }) => (
	<div
		style={{
			background: T.obsidian,
			border: T.border,
			borderRadius: 18,
			padding: "18px 20px",
		}}
	>
		<p
			style={{
				fontFamily: "'JetBrains Mono',monospace",
				fontSize: 8,
				letterSpacing: "0.28em",
				textTransform: "uppercase",
				color: "rgba(255,255,255,0.3)",
				marginBottom: 10,
			}}
		>
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
				style={{
					fontFamily: "'DM Sans',sans-serif",
					fontSize: 10,
					color: subColor || "rgba(255,255,255,0.3)",
					marginTop: 6,
				}}
			>
				{sub}
			</p>
		)}
	</div>
);

/* ─── BAR CHART ──────────────────────────────────────────────── */
const BarChart = ({ data }) => {
	const max = Math.max(...data.map((d) => d.value), 1);
	return (
		<div
			style={{
				background: T.obsidian,
				border: T.border,
				borderRadius: 18,
				padding: "22px 24px",
			}}
		>
			<p
				style={{
					fontFamily: "'JetBrains Mono',monospace",
					fontSize: 8,
					letterSpacing: "0.28em",
					textTransform: "uppercase",
					color: "rgba(255,255,255,0.3)",
					marginBottom: 20,
				}}
			>
				DAILY SESSIONS — LAST 7 DAYS
			</p>
			<div
				style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}
			>
				{data.map((d, i) => {
					const pct = (d.value / max) * 100;
					return (
						<div
							key={i}
							style={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 6,
								height: "100%",
							}}
						>
							<div
								style={{
									flex: 1,
									width: "100%",
									display: "flex",
									alignItems: "flex-end",
								}}
							>
								<div
									style={{
										width: "100%",
										height: `${Math.max(pct, 3)}%`,
										background: d.isToday ? T.ember : "rgba(236,91,19,0.28)",
										borderRadius: "4px 4px 0 0",
										position: "relative",
										transition: "height 600ms cubic-bezier(0.16,1,0.3,1)",
										cursor: "default",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = d.isToday
											? "#ff6a20"
											: "rgba(236,91,19,0.55)")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = d.isToday
											? T.ember
											: "rgba(236,91,19,0.28)")
									}
								>
									<span
										style={{
											position: "absolute",
											top: -18,
											left: "50%",
											transform: "translateX(-50%)",
											fontFamily: "'JetBrains Mono',monospace",
											fontSize: 8,
											fontWeight: 600,
											color: d.isToday ? T.ember : "rgba(255,255,255,0.3)",
											whiteSpace: "nowrap",
										}}
									>
										{d.value}
									</span>
								</div>
							</div>
							<span
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 7,
									color: d.isToday ? T.ember : "rgba(255,255,255,0.22)",
									letterSpacing: "0.1em",
								}}
							>
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
		supabase
			.from("verp_support_sessions")
			.select("*")
			.then(({ data }) => {
				if (data) setSessions(data);
			});
	}, []);
	const resolved = sessions.filter((s) => s.status === "resolved").length;
	const avg = sessions.filter((s) => s.rating).length
		? (
				sessions.filter((s) => s.rating).reduce((a, b) => a + b.rating, 0) /
				sessions.filter((s) => s.rating).length
			).toFixed(1)
		: "—";
	const days7 = Array.from({ length: 7 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (6 - i));
		return {
			label: d
				.toLocaleDateString("en", { weekday: "short" })
				.slice(0, 2)
				.toUpperCase(),
			value: sessions.filter(
				(s) => s.created_at?.slice(0, 10) === d.toISOString().slice(0, 10),
			).length,
			isToday: i === 6,
		};
	});
	const ratingRows = [5, 4, 3, 2, 1].map((s) => ({
		star: s,
		count: sessions.filter((x) => x.rating === s).length,
	}));
	const maxR = Math.max(...ratingRows.map((r) => r.count), 1);
	return (
		<div
			style={{
				padding: "20px",
				overflowY: "auto",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				gap: 14,
			}}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(2,1fr)",
					gap: 12,
				}}
			>
				<StatCard label="Total Sessions" value={sessions.length} />
				<StatCard
					label="Resolved"
					value={resolved}
					sub={`${sessions.length ? Math.round((resolved / sessions.length) * 100) : 0}% rate`}
					subColor={T.live}
				/>
				<StatCard
					label="Avg Rating"
					value={avg}
					sub="out of 5"
					subColor={T.ember}
				/>
				<StatCard
					label="Live Now"
					value={sessions.filter((s) => s.status === "live").length}
					subColor={T.waiting}
					sub="active sessions"
				/>
			</div>
			<BarChart data={days7} />
			<div
				style={{
					background: T.obsidian,
					border: T.border,
					borderRadius: 18,
					padding: "20px 22px",
				}}
			>
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8,
						letterSpacing: "0.28em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.3)",
						marginBottom: 16,
					}}
				>
					SATISFACTION
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{ratingRows.map((r) => (
						<div
							key={r.star}
							style={{ display: "flex", alignItems: "center", gap: 10 }}
						>
							<span
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 10,
									color: T.ember,
									width: 22,
									textAlign: "right",
								}}
							>
								{r.star}★
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
										width: `${(r.count / maxR) * 100}%`,
										background: `rgba(236,91,19,${0.3 + (r.star / 5) * 0.7})`,
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
								{r.count}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

/* ─── ORDERS TAB ─────────────────────────────────────────────── */
const OrdersTab = () => {
	const [orders, setOrders] = useState([]);
	const [view, setView] = useState("incoming");
	const [selected, setSelected] = useState(null);
	const [newStatus, setNewStatus] = useState("");
	const [privateMsg, setPrivateMsg] = useState("");
	const [busy, setBusy] = useState(false);
	const INCOMING = ["ordered", "pending", "processing", "shipped"];
	const OUTGOING = ["delivered", "returned", "cancelled"];
	useEffect(() => {
		const fetch = async () => {
			const { data } = await supabase
				.from("verp_orders")
				.select("*")
				.order("created_at", { ascending: false });
			if (data) setOrders(data);
		};
		fetch();
		const i = setInterval(fetch, 10000);
		return () => clearInterval(i);
	}, []);
	const filtered = orders.filter((o) =>
		view === "incoming"
			? INCOMING.includes(o.status?.toLowerCase())
			: OUTGOING.includes(o.status?.toLowerCase()),
	);
	const applyStatus = async () => {
		if (!selected || !newStatus) return;
		setBusy(true);
		await supabase
			.from("verp_orders")
			.update({ status: newStatus })
			.eq("id", selected.id);
		setOrders((prev) =>
			prev.map((o) => (o.id === selected.id ? { ...o, status: newStatus } : o)),
		);
		setSelected((prev) => ({ ...prev, status: newStatus }));
		setBusy(false);
	};
	const sendPrivate = async () => {
		if (!selected || !privateMsg.trim()) return;
		setBusy(true);
		// verp_orders stores the buyer's email in customer_email
		const toEmail =
			selected.customer_email ||
			selected.client_email ||
			selected.email ||
			null;
		if (!toEmail) {
			setBusy(false);
			Swal.fire({
				title: "No Email Found",
				text: "This order has no customer email on record.",
				icon: "error",
				background: T.obsidian,
				color: "#fff",
			});
			return;
		}
		const { error } = await supabase.from("verp_inbox_messages").insert([
			{
				to_email: toEmail,
				from_role: "assistant",
				subject: `Update on Order ${selected.order_number}`,
				body: privateMsg,
			},
		]);
		setPrivateMsg("");
		setBusy(false);
		if (error) {
			Swal.fire({ title: "Error", text: error.message, icon: "error", background: T.obsidian, color: "#fff" });
			return;
		}
		Swal.fire({
			title: "Sent!",
			text: "Client will see this in their Inbox.",
			background: T.obsidian,
			color: "#fff",
			icon: "success",
			timer: 2000,
			showConfirmButton: false,
		});
	};
	return (
		<div
			style={{
				display: "flex",
				height: "100%",
				overflow: "hidden",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					height: 52,
					background: T.obsidian,
					borderBottom: T.borderSub,
					display: "flex",
					alignItems: "center",
					padding: "0 20px",
					gap: 12,
					flexShrink: 0,
				}}
			>
				<span
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8,
						letterSpacing: "0.28em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.3)",
					}}
				>
					ORDER PIPELINE
				</span>
				<div
					style={{
						display: "inline-flex",
						background: "#111",
						border: T.border,
						borderRadius: 999,
						padding: 3,
						gap: 2,
						marginLeft: "auto",
					}}
				>
					{["incoming", "outgoing"].map((v) => (
						<button
							key={v}
							onClick={() => setView(v)}
							style={{
								padding: "6px 14px",
								borderRadius: 999,
								border: "none",
								cursor: "pointer",
								background: view === v ? T.ember : "transparent",
								color: view === v ? "#000" : "rgba(255,255,255,0.35)",
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 9,
								fontWeight: 700,
								letterSpacing: "0.15em",
								textTransform: "uppercase",
								transition: "all 200ms",
							}}
						>
							{v}
						</button>
					))}
				</div>
			</div>
			<div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
				<div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
					{filtered.length === 0 && (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								height: 180,
								flexDirection: "column",
								gap: 10,
								opacity: 0.15,
							}}
						>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: 32 }}
							>
								inventory_2
							</span>
							<p
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 8,
									letterSpacing: "0.3em",
									textTransform: "uppercase",
								}}
							>
								NO ORDERS
							</p>
						</div>
					)}
					{filtered.map((order, idx) => (
						<div
							key={order.id}
							onClick={() => {
								setSelected(order);
								setNewStatus(order.status || "");
							}}
							className="at-order-card"
							style={{
								display: "block",
								animationDelay: `${idx * 0.04}s`,
								background: selected?.id === order.id ? "rgba(236,91,19,0.05)" : "",
								borderColor: selected?.id === order.id ? "rgba(236,91,19,0.3)" : "",
							}}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
								<div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
									<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{order.client_email || order.email || "—"}
									</p>
									<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 2, letterSpacing: "0.08em" }}>
										{order.order_number || "—"} · {new Date(order.created_at).toLocaleDateString()}
									</p>
								</div>
								<OrderBadge status={order.status} />
							</div>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontStyle: "italic", color: T.ember }}>
									₵{Number(order.total_amount || 0).toLocaleString()}
								</span>
								<span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.2)" }}>chevron_right</span>
							</div>
						</div>
					))}
				</div>
				{selected && (
					<div
						style={{
							width: 300,
							background: T.obsidian,
							borderLeft: T.borderSub,
							display: "flex",
							flexDirection: "column",
							flexShrink: 0,
							animation: "slideInR 0.3s cubic-bezier(0.16,1,0.3,1) both",
						}}
					>
						<div
							style={{
								padding: "18px 18px 14px",
								borderBottom: T.borderSub,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<div>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 8,
										color: T.ember,
										letterSpacing: "0.22em",
									}}
								>
									{selected.order_number}
								</p>
								<p
									style={{
										fontFamily: "'Playfair Display',serif",
										fontSize: 16,
										fontStyle: "italic",
										color: "white",
										marginTop: 3,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										maxWidth: 180,
									}}
								>
									{selected.client_email || selected.email}
								</p>
							</div>
							<button
								onClick={() => setSelected(null)}
								style={{
									background: "transparent",
									border: T.border,
									borderRadius: 8,
									width: 30,
									height: 30,
									cursor: "pointer",
									color: "rgba(255,255,255,0.3)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<span
									className="material-symbols-outlined"
									style={{ fontSize: 15 }}
								>
									close
								</span>
							</button>
						</div>
						<div
							style={{
								flex: 1,
								overflowY: "auto",
								padding: 18,
								display: "flex",
								flexDirection: "column",
								gap: 18,
							}}
						>
							{/* ── ORDER DATE + PRODUCT IMAGES ── */}
							<div>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>
									{new Date(selected.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(selected.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
								</p>
								{(() => {
									let items = [];
									try { items = typeof selected.items === "string" ? JSON.parse(selected.items) : (Array.isArray(selected.items) ? selected.items : []); } catch (_) {}
									if (!items.length) return null;
									return (
										<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
											{items.slice(0, 5).map((item, i) => (
												<div key={i} style={{ position: "relative", flexShrink: 0 }}>
													{item.image ? (
														<img src={item.image} alt={item.name || "item"} title={`${item.name || ""} × ${item.quantity || 1}`}
															style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)" }}
															onError={e => { e.currentTarget.style.display = "none"; }} />
													) : (
														<div style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
															<span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.2)" }}>image</span>
														</div>
													)}
													{(item.quantity || 1) > 1 && (
														<span style={{ position: "absolute", top: -5, right: -5, width: 15, height: 15, borderRadius: "50%", background: "#ec5b13", color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.quantity}</span>
													)}
												</div>
											))}
											{items.length > 5 && (
												<div style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.3)" }}>+{items.length - 5}</div>
											)}
										</div>
									);
								})()}
							</div>
							<div>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 8,
										letterSpacing: "0.22em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.3)",
										marginBottom: 8,
									}}
								>
									UPDATE STATUS
								</p>
								<div style={{ position: "relative" }}>
									<select
										value={newStatus}
										onChange={(e) => setNewStatus(e.target.value)}
										style={{
											width: "100%",
											background: "#111",
											border: T.border,
											borderRadius: 11,
											padding: "10px 14px",
											fontFamily: "'JetBrains Mono',monospace",
											fontSize: 10,
											textTransform: "uppercase",
											color: T.ember,
											outline: "none",
											cursor: "pointer",
											appearance: "none",
										}}
									>
										{ORDER_STATUSES.map((s) => (
											<option key={s} value={s}>
												{s.toUpperCase()}
											</option>
										))}
									</select>
									<span
										className="material-symbols-outlined"
										style={{
											position: "absolute",
											right: 10,
											top: "50%",
											transform: "translateY(-50%)",
											fontSize: 15,
											color: "rgba(255,255,255,0.3)",
											pointerEvents: "none",
										}}
									>
										expand_more
									</span>
								</div>
								<button
									onClick={applyStatus}
									disabled={busy}
									style={{
										marginTop: 8,
										width: "100%",
										padding: "10px",
										background: T.ember,
										border: "none",
										borderRadius: 11,
										cursor: "pointer",
										fontFamily: "'DM Sans',sans-serif",
										fontSize: 10,
										fontWeight: 700,
										letterSpacing: "0.15em",
										textTransform: "uppercase",
										color: "#000",
										opacity: busy ? 0.5 : 1,
										transition: "all 200ms",
									}}
								>
									{busy ? "UPDATING..." : "APPLY STATUS"}
								</button>
							</div>
							<div>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 8,
										letterSpacing: "0.22em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.3)",
										marginBottom: 8,
									}}
								>
									PRIVATE MESSAGE
								</p>
								<textarea
									value={privateMsg}
									onChange={(e) => setPrivateMsg(e.target.value)}
									rows={4}
									placeholder="Write message to client..."
									style={{
										width: "100%",
										background: "#111",
										border: T.border,
										borderRadius: 11,
										padding: "10px 14px",
										fontFamily: "'DM Sans',sans-serif",
										fontSize: 12,
										color: "rgba(255,255,255,0.8)",
										outline: "none",
										resize: "none",
										lineHeight: 1.6,
										boxSizing: "border-box",
									}}
								/>
								<button
									onClick={sendPrivate}
									disabled={busy}
									style={{
										marginTop: 8,
										width: "100%",
										padding: "10px",
										background: "transparent",
										border: T.border,
										borderRadius: 11,
										cursor: "pointer",
										fontFamily: "'DM Sans',sans-serif",
										fontSize: 10,
										fontWeight: 600,
										letterSpacing: "0.15em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.5)",
										transition: "all 200ms",
										opacity: busy ? 0.5 : 1,
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor = T.emberBorder;
										e.currentTarget.style.color = "white";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor =
											"rgba(255,255,255,0.06)";
										e.currentTarget.style.color = "rgba(255,255,255,0.5)";
									}}
								>
									SEND TO CLIENT
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

/* ─── ADMIN PRIVATE CHANNEL ──────────────────────────────────── */
const AdminChannel = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const scrollRef = useRef(null);

	const sync = useCallback(async () => {
		const { data } = await supabase
			.from("verp_private_channel")
			.select("*")
			.order("created_at", { ascending: true });
		if (data) setMessages(data);
	}, []);

	useEffect(() => {
		sync();
		const i = setInterval(sync, 5000);
		return () => clearInterval(i);
	}, [sync]);

	useEffect(() => {
		if (scrollRef.current)
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages]);

	const send = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;
		const content = input.trim();
		setInput("");
		const optimistic = {
			id: Date.now(),
			sender: "assistant",
			content,
			created_at: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, optimistic]);
		await supabase
			.from("verp_private_channel")
			.insert([{ sender: "assistant", content }]);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				background: T.void,
			}}
		>
			<div
				style={{
					padding: "14px 20px",
					borderBottom: T.borderSub,
					background: T.obsidian,
					display: "flex",
					alignItems: "center",
					gap: 10,
					flexShrink: 0,
				}}
			>
				<span
					className="material-symbols-outlined"
					style={{ fontSize: 15, color: T.ember }}
				>
					lock
				</span>
				<div>
					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 9,
							letterSpacing: "0.28em",
							textTransform: "uppercase",
							color: T.ember,
						}}
					>
						SECURE CHANNEL
					</p>
					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 7,
							color: "rgba(255,255,255,0.2)",
							letterSpacing: "0.15em",
						}}
					>
						ASSISTANT ↔ ADMIN — PRIVATE
					</p>
				</div>
			</div>
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "16px 20px",
					display: "flex",
					flexDirection: "column",
					gap: 12,
					scrollbarWidth: "thin",
					scrollbarColor: "rgba(236,91,19,0.3) transparent",
				}}
			>
				{messages.length === 0 && (
					<div
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 10,
							opacity: 0.15,
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 36 }}
						>
							lock
						</span>
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 8,
								letterSpacing: "0.3em",
								textTransform: "uppercase",
							}}
						>
							NO MESSAGES YET
						</p>
					</div>
				)}
				{messages.map((msg, idx) => {
					const isMe = msg.sender === "assistant";
					return (
						<div
							key={idx}
							style={{
								display: "flex",
								justifyContent: isMe ? "flex-end" : "flex-start",
							}}
						>
							<div
								style={{
									maxWidth: "74%",
									display: "flex",
									flexDirection: "column",
									alignItems: isMe ? "flex-end" : "flex-start",
									gap: 4,
								}}
							>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 7,
										letterSpacing: "0.22em",
										textTransform: "uppercase",
										color: isMe
											? "rgba(236,91,19,0.55)"
											: "rgba(255,255,255,0.22)",
									}}
								>
									{isMe ? "YOU" : "ADMIN"}
								</p>
								<div
									style={{
										padding: "11px 15px",
										background: isMe ? "#ec5b13" : "#1a1a1a",
										border: isMe ? "none" : T.border,
										borderRadius: isMe
											? "15px 4px 15px 15px"
											: "4px 15px 15px 15px",
										fontFamily: "'DM Sans',sans-serif",
										fontSize: 13,
										color: isMe ? "#000" : "rgba(255,255,255,0.8)",
										lineHeight: 1.6,
									}}
								>
									{msg.content}
								</div>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 6,
										color: "rgba(255,255,255,0.2)",
										letterSpacing: "0.1em",
									}}
								>
									{new Date(msg.created_at).toLocaleTimeString()}
								</p>
							</div>
						</div>
					);
				})}
			</div>
			<div
				style={{
					borderTop: T.borderSub,
					background: T.obsidian,
					padding: "13px 16px",
					flexShrink: 0,
				}}
			>
				<form onSubmit={send} style={{ display: "flex", gap: 8 }}>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="MESSAGE ADMIN (PRIVATE)..."
						style={{
							flex: 1,
							background: "#111",
							border: T.border,
							borderRadius: 11,
							padding: "10px 14px",
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 13,
							color: "rgba(255,255,255,0.8)",
							outline: "none",
						}}
					/>
					<button
						type="submit"
						style={{
							background: T.ember,
							border: "none",
							borderRadius: 11,
							padding: "10px 18px",
							cursor: "pointer",
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.15em",
							textTransform: "uppercase",
							color: "#000",
						}}
					>
						SEND
					</button>
				</form>
			</div>
		</div>
	);
};

/* ─── PUSH MODAL ─────────────────────────────────────────────── */
/* type: "partial" | "full" */
const PushModal = ({ session, type, onClose, onDone }) => {
	const [reason, setReason] = useState("");
	const [sending, setSending] = useState(false);

	const submit = async () => {
		if (!reason.trim()) return;
		setSending(true);
		const newStatus = type === "full" ? "full_push" : "escalated";

		await supabase
			.from("verp_support_sessions")
			.update({
				status: newStatus,
				admin_note: reason,
				updated_at: new Date().toISOString(),
			})
			.eq("id", session.id);

		// Notify admin via private channel
		const label =
			type === "full"
				? "🚨 FULL ADMIN TAKEOVER REQUESTED"
				: "⚠️ PARTIAL ESCALATION";
		await supabase.from("verp_private_channel").insert([
			{
				sender: "assistant",
				content: `${label}\nClient: ${session.client_email}\nReason: ${reason}`,
			},
		]);

		// Also email admin via backend
		try {
			await fetch(`${import.meta.env.VITE_SERVER_URL || ""}/api/alert-staff`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: type === "full" ? "ADMIN_TAKEOVER" : "ESCALATION",
					clientId: session.client_email,
					note: reason,
				}),
			});
		} catch (_) {}

		setSending(false);
		onDone();
	};

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 999,
				background: "rgba(0,0,0,0.85)",
				backdropFilter: "blur(12px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 20,
			}}
		>
			<div
				style={{
					background: "#0a0a0a",
					border: type === "full" ? "1px solid rgba(239,68,68,0.3)" : T.border,
					borderRadius: 24,
					padding: "32px 28px",
					width: "100%",
					maxWidth: 480,
					animation: "slideInR 0.3s cubic-bezier(0.16,1,0.3,1) both",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						marginBottom: 24,
					}}
				>
					<div
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							background:
								type === "full" ? "rgba(239,68,68,0.1)" : "rgba(236,91,19,0.1)",
							border:
								type === "full" ? "1px solid rgba(239,68,68,0.3)" : T.border,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{
								fontSize: 22,
								color: type === "full" ? T.escalated : T.ember,
							}}
						>
							{type === "full" ? "security" : "flag"}
						</span>
					</div>
					<div>
						<h3
							style={{
								fontFamily: "'Playfair Display',serif",
								fontSize: 22,
								fontStyle: "italic",
								color: "white",
								lineHeight: 1,
							}}
						>
							{type === "full" ? "Full Admin Push" : "Escalate to Admin"}
						</h3>
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 7,
								letterSpacing: "0.22em",
								textTransform: "uppercase",
								marginTop: 4,
								color:
									type === "full"
										? "rgba(239,68,68,0.6)"
										: "rgba(236,91,19,0.6)",
							}}
						>
							{type === "full"
								? "ADMIN WILL TAKE OVER THE CLIENT CHAT"
								: "ADMIN WILL BE NOTIFIED PRIVATELY"}
						</p>
					</div>
				</div>

				{type === "full" && (
					<div
						style={{
							padding: "12px 16px",
							background: "rgba(239,68,68,0.06)",
							border: "1px solid rgba(239,68,68,0.2)",
							borderRadius: 12,
							marginBottom: 20,
						}}
					>
						<p
							style={{
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 12,
								color: "rgba(239,68,68,0.8)",
								lineHeight: 1.6,
							}}
						>
							The admin will continue this conversation from where you left off.
							Your chat becomes private between you and the admin.
						</p>
					</div>
				)}

				<div style={{ marginBottom: 16 }}>
					<label
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 8,
							letterSpacing: "0.22em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.3)",
							display: "block",
							marginBottom: 8,
						}}
					>
						STATE YOUR REASON
					</label>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={4}
						placeholder="Explain the situation clearly..."
						style={{
							width: "100%",
							background: "#111",
							border: T.border,
							borderRadius: 12,
							padding: "12px 14px",
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 13,
							color: "rgba(255,255,255,0.8)",
							outline: "none",
							resize: "none",
							lineHeight: 1.6,
							boxSizing: "border-box",
						}}
					/>
				</div>

				<div style={{ display: "flex", gap: 10 }}>
					<button
						onClick={submit}
						disabled={sending || !reason.trim()}
						style={{
							flex: 1,
							padding: "13px",
							cursor: "pointer",
							border: "none",
							borderRadius: 12,
							background: type === "full" ? T.escalated : T.ember,
							color: "white",
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.15em",
							textTransform: "uppercase",
							transition: "all 200ms",
							opacity: !reason.trim() || sending ? 0.4 : 1,
						}}
					>
						{sending
							? "SENDING..."
							: type === "full"
								? "PUSH TO ADMIN"
								: "ESCALATE"}
					</button>
					<button
						onClick={onClose}
						style={{
							padding: "13px 20px",
							cursor: "pointer",
							background: "transparent",
							border: T.border,
							borderRadius: 12,
							color: "rgba(255,255,255,0.4)",
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 8,
							letterSpacing: "0.2em",
							textTransform: "uppercase",
							transition: "all 200ms",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color = "rgba(255,255,255,0.4)")
						}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

/* ─── CHAT HISTORY TAB ────────────────────────────────────────
   Shows all resolved sessions + full chat log for each,
   with a search bar to filter by email or keyword.
   ──────────────────────────────────────────────────────────── */
const ChatHistoryTab = () => {
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loadingMsgs, setLoadingMsgs] = useState(false);

	useEffect(() => {
		const load = async () => {
			const { data } = await supabase
				.from("verp_support_sessions")
				.select("*")
				.eq("status", "resolved")
				.order("updated_at", { ascending: false });
			if (data) setSessions(data);
			setLoading(false);
		};
		load();
	}, []);

	const openSession = async (s) => {
		setSelected(s);
		setLoadingMsgs(true);
		const { data } = await supabase
			.from("verp_chat_messages")
			.select("*")
			.eq("chat_id", s.id)
			.order("created_at", { ascending: true });
		setMessages(data || []);
		setLoadingMsgs(false);
	};

	const filtered = sessions.filter((s) => {
		const q = search.toLowerCase();
		return (
			!q ||
			s.client_email?.toLowerCase().includes(q) ||
			s.id?.toLowerCase().includes(q)
		);
	});

	const msgFiltered = messages.filter((m) => {
		const q = search.toLowerCase();
		return !selected || !q || m.content?.toLowerCase().includes(q);
	});

	return (
		<div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: "row" }}>
			{/* ── SESSION LIST ── */}
			<div style={{ width: 260, background: "#0a0a0a", borderRight: T.borderSub, display: "flex", flexDirection: "column", flexShrink: 0 }}>
				<div style={{ padding: "14px 14px 10px", borderBottom: T.borderSub }}>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>RESOLVED SESSIONS</p>
					<div style={{ position: "relative" }}>
						<span className="material-symbols-outlined" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}>search</span>
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search email or message…"
							style={{ width: "100%", background: "#111", border: T.border, borderRadius: 10, padding: "9px 12px 9px 34px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", outline: "none", boxSizing: "border-box" }}
						/>
					</div>
				</div>
				<div style={{ flex: 1, overflowY: "auto" }}>
					{loading && (
						<div style={{ display: "flex", justifyContent: "center", padding: 30 }}>
							<div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.1)", borderTopColor: T.ember, animation: "pd 1s linear infinite" }} />
						</div>
					)}
					{!loading && filtered.length === 0 && (
						<div style={{ textAlign: "center", padding: "40px 16px", opacity: 0.2 }}>
							<span className="material-symbols-outlined" style={{ fontSize: 32 }}>history</span>
							<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>NO RESOLVED SESSIONS</p>
						</div>
					)}
					{filtered.map((s) => {
						const isSel = selected?.id === s.id;
						const rating = s.rating ? "★".repeat(s.rating) : null;
						return (
							<div key={s.id} onClick={() => openSession(s)} style={{ padding: "12px 14px", borderBottom: T.borderSub, cursor: "pointer", background: isSel ? "rgba(236,91,19,0.06)" : "transparent", borderLeft: isSel ? `2px solid ${T.ember}` : "2px solid transparent", transition: "all 150ms" }}>
								<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{s.client_email}</p>
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)" }}>
										{new Date(s.updated_at || s.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
									</p>
									{rating && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: T.ember }}>{rating}</span>}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* ── CHAT PANE ── */}
			<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
				{!selected ? (
					<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, opacity: 0.15 }}>
						<span className="material-symbols-outlined" style={{ fontSize: 40 }}>history</span>
						<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase" }}>SELECT A SESSION TO VIEW HISTORY</p>
					</div>
				) : (
					<>
						<div style={{ height: 48, background: T.obsidian, borderBottom: T.borderSub, display: "flex", alignItems: "center", padding: "0 18px", gap: 10, flexShrink: 0 }}>
							<span className="material-symbols-outlined" style={{ fontSize: 16, color: T.ember }}>history</span>
							<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{selected.client_email}</p>
							{selected.rating && <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: T.ember }}>{"★".repeat(selected.rating)}</span>}
						</div>
						<div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14, scrollbarWidth: "thin", scrollbarColor: "rgba(236,91,19,0.3) transparent" }}>
							{loadingMsgs && <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.1)", borderTopColor: T.ember, animation: "pd 1s linear infinite" }} /></div>}
							{!loadingMsgs && msgFiltered.length === 0 && (
								<div style={{ textAlign: "center", padding: "40px 0", opacity: 0.2 }}>
									<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em" }}>NO MESSAGES</p>
								</div>
							)}
							{msgFiltered.map((msg, idx) => {
								const isAssistant = msg.sender_role === "assistant" || msg.sender_role === "admin";
								return (
									<div key={msg.id || idx} style={{ display: "flex", justifyContent: isAssistant ? "flex-end" : "flex-start" }}>
										<div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", alignItems: isAssistant ? "flex-end" : "flex-start", gap: 4 }}>
											<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: isAssistant ? "rgba(236,91,19,0.5)" : "rgba(255,255,255,0.2)" }}>
												{isAssistant ? (msg.sender_role === "admin" ? "ADMIN" : "ASSISTANT") : "CLIENT"} · {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
											</p>
											<div style={{ padding: "11px 15px", background: isAssistant ? "#ec5b13" : "#1a1a1a", border: isAssistant ? "none" : T.border, borderRadius: isAssistant ? "15px 4px 15px 15px" : "4px 15px 15px 15px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: isAssistant ? "#000" : "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
												{msg.content}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

/* ─── MAIN ASSISTANT TERMINAL ────────────────────────────────── */
const AssistantTerminal = () => {
	const navigate = useNavigate();
	const [tab, setTab] = useState("inbox");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sessions, setSessions] = useState([]);
	const [selectedChat, setSelectedChat] = useState(null);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
	const [pushModal, setPushModal] = useState(null); // {session, type}

	const handleStaffLogout = () => {
		localStorage.removeItem("staffRole");
		localStorage.removeItem("staffEmail");
		navigate("/staff-login?from=assistant", { replace: true });
	};

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

	const waitingCount = sessions.filter((s) => s.status === "waiting").length;
	const fullPushCount = sessions.filter((s) => s.status === "full_push").length;
	// Include both live and escalated so assistant keeps seeing the chat on partial push
	const liveSessions = sessions.filter((s) => s.status === "live" || s.status === "escalated");
	const waitingSessions = sessions.filter((s) => s.status === "waiting");

	const updateStatus = async (id, newStatus) => {
		await supabase
			.from("verp_support_sessions")
			.update({ status: newStatus, updated_at: new Date().toISOString() })
			.eq("id", id);
		setSelectedChat(null);
		fetchSessions();
	};

	const switchTab = (t) => {
		setTab(t);
		setSelectedChat(null);
		setSidebarOpen(false);
	};

	/* ── SIDEBAR ─────────────────────────────────────────────── */
	const SidebarContent = () => (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<div
				style={{
					padding: "20px 16px 16px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottom: T.borderSub,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<span
						style={{
							fontFamily: "'Playfair Display',serif",
							fontSize: 24,
							fontStyle: "italic",
							color: T.ember,
						}}
					>
						V
					</span>
					<span
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 7,
							letterSpacing: "0.25em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.25)",
						}}
					>
						ASSISTANT
					</span>
				</div>
				{isMobile && (
					<button
						onClick={() => setSidebarOpen(false)}
						style={{
							background: "transparent",
							border: T.border,
							borderRadius: 8,
							width: 32,
							height: 32,
							cursor: "pointer",
							color: "rgba(255,255,255,0.4)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 16 }}
						>
							close
						</span>
					</button>
				)}
			</div>
			<nav
				style={{
					flex: 1,
					padding: "12px 10px",
					display: "flex",
					flexDirection: "column",
					gap: 4,
				}}
			>
				{NAV.map((n) => {
					const badge = n.id === "queue" ? waitingCount : n.id === "inbox" ? fullPushCount : 0;
					const active = tab === n.id;
					return (
						<button
							key={n.id}
							onClick={() => switchTab(n.id)}
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
							}}
						>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: 18 }}
							>
								{n.icon}
							</span>
							<span
								style={{
									fontFamily: "'DM Sans',sans-serif",
									fontSize: 10,
									fontWeight: 600,
									letterSpacing: "0.15em",
									textTransform: "uppercase",
								}}
							>
								{n.label}
							</span>
							{badge > 0 && (
								<span
									style={{
										marginLeft: "auto",
										minWidth: 18,
										height: 18,
										borderRadius: 999,
										background: T.escalated,
										color: "white",
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 8,
										fontWeight: 700,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										padding: "0 3px",
									}}
								>
									{badge}
								</span>
							)}
						</button>
					);
				})}
			</nav>
			<div style={{ padding: "12px 10px", borderTop: T.borderSub }}>
				<button
					onClick={handleStaffLogout}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
						padding: "10px 0",
						background: "transparent",
						border: T.border,
						borderRadius: 10,
						cursor: "pointer",
						color: "rgba(255,255,255,0.35)",
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 7,
						letterSpacing: "0.18em",
						textTransform: "uppercase",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "rgba(255,255,255,0.04)";
						e.currentTarget.style.color = "rgba(255,255,255,0.5)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "transparent";
						e.currentTarget.style.color = "rgba(255,255,255,0.35)";
					}}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
					Sign out
				</button>
			</div>
		</div>
	);

	/* ── SESSION LIST ─────────────────────────────────────────── */
	const SessionList = ({ list, title }) => (
		<div
			style={{
				width: isMobile ? "100%" : 250,
				background: "#0a0a0a",
				borderRight: T.borderSub,
				display: "flex",
				flexDirection: "column",
				flexShrink: 0,
				height: isMobile && selectedChat ? "0" : "100%",
				overflow: isMobile && selectedChat ? "hidden" : "visible",
			}}
		>
			<div
				style={{
					height: 48,
					borderBottom: T.borderSub,
					display: "flex",
					alignItems: "center",
					padding: "0 16px",
					justifyContent: "space-between",
					flexShrink: 0,
				}}
			>
				<span
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8,
						letterSpacing: "0.25em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.3)",
					}}
				>
					{title}
				</span>
				<span
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 9,
						color: T.ember,
					}}
				>
					{list.length}
				</span>
			</div>
			<div style={{ flex: 1, overflowY: "auto" }}>
				{list.length === 0 && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							height: 160,
							gap: 8,
							opacity: 0.15,
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 28 }}
						>
							inbox
						</span>
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 7,
								letterSpacing: "0.2em",
								textTransform: "uppercase",
							}}
						>
							EMPTY
						</p>
					</div>
				)}
				{list.map((s) => {
					const cfg = STATUS_CFG[s.status] || STATUS_CFG.resolved;
					const isSel = selectedChat?.id === s.id;
					return (
						<div
							key={s.id}
							onClick={() => setSelectedChat(s)}
							style={{
								padding: "13px 14px",
								borderBottom: T.borderSub,
								cursor: "pointer",
								background: isSel ? "rgba(236,91,19,0.06)" : "transparent",
								borderLeft: isSel
									? `2px solid ${T.ember}`
									: "2px solid transparent",
								transition: "all 150ms",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									marginBottom: 5,
								}}
							>
								<div
									style={{
										width: 7,
										height: 7,
										borderRadius: "50%",
										background: cfg.color,
										flexShrink: 0,
										animation: cfg.pulse
											? "pd 2s ease-in-out infinite"
											: "none",
									}}
								/>
								<Badge status={s.status} />
							</div>
							<p
								style={{
									fontFamily: "'DM Sans',sans-serif",
									fontSize: 11,
									fontWeight: 500,
									color: "rgba(255,255,255,0.75)",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{s.client_email}
							</p>
							<p
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 7,
									color: "rgba(255,255,255,0.2)",
									marginTop: 3,
								}}
							>
								{new Date(s.created_at).toLocaleTimeString()}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);

	return (
		<>
			<style>{`
       *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(236,91,19,0.3);border-radius:99px}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInR{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideInUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        .vault-agent-name-input{color:#000 !important;background:#fff !important;}

        /* ── Premium Mobile Bottom Navigation ── */
        .at-bottom-nav {
          position:fixed; bottom:0; left:0; right:0; z-index:60;
          background:rgba(8,8,8,0.97);
          backdrop-filter:blur(24px) saturate(180%);
          -webkit-backdrop-filter:blur(24px) saturate(180%);
          border-top:1px solid rgba(255,255,255,0.06);
          display:flex; align-items:stretch;
          padding-bottom:env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -8px 32px rgba(0,0,0,0.6);
        }
        .at-nav-item {
          flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:3px; padding:10px 4px 8px; border:none; background:transparent; cursor:pointer;
          position:relative; transition:all 150ms; -webkit-tap-highlight-color:transparent;
          min-height:58px;
        }
        .at-nav-item.active .at-nav-icon { color:#ec5b13; }
        .at-nav-item.active::before {
          content:''; position:absolute; top:0; left:50%; transform:translateX(-50%);
          width:32px; height:2px; background:linear-gradient(90deg,transparent,#ec5b13,transparent);
          border-radius:0 0 4px 4px;
        }
        .at-nav-icon { font-size:21px !important; color:rgba(255,255,255,0.25); transition:color 200ms; }
        .at-nav-label { font-family:'JetBrains Mono',monospace; font-size:5.5px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.22); transition:color 200ms; white-space:nowrap; }
        .at-nav-item.active .at-nav-label { color:rgba(236,91,19,0.65); }
        .at-badge {
          position:absolute; top:6px; right:calc(50% - 17px);
          min-width:15px; height:15px; border-radius:999px;
          background:#ef4444; color:white;
          font-family:'JetBrains Mono',monospace; font-size:7px; font-weight:700;
          display:flex; align-items:center; justify-content:center; padding:0 4px;
          border:1.5px solid #080808;
          box-shadow:0 2px 8px rgba(239,68,68,0.5);
        }

        /* Mobile orders — card view */
        .at-order-card {
          background:#0d0d0d; border:1px solid rgba(255,255,255,0.05); border-radius:16px;
          padding:16px; margin-bottom:10px; cursor:pointer;
          transition:border-color 180ms, background 180ms;
          animation:fadeUp 0.3s ease both;
          -webkit-tap-highlight-color:transparent;
        }
        .at-order-card:active { background:#111; border-color:rgba(236,91,19,0.28); }

        /* Mobile press feedback */
        @media(max-width:1023px){
          button { -webkit-tap-highlight-color:transparent; }
        }
      `}</style>

			{pushModal && (
				<PushModal
					session={pushModal.session}
					type={pushModal.type}
					onClose={() => setPushModal(null)}
					onDone={() => {
						setPushModal(null);
						// Only clear selected chat on full push (admin takes over); on partial push assistant keeps the chat
						if (pushModal.type === "full") setSelectedChat(null);
						fetchSessions();
					}}
				/>
			)}

			<div
				style={{
					display: "flex",
					height: "100vh",
					background: T.void,
					overflow: "hidden",
					fontFamily: "'DM Sans',sans-serif",
					position: "relative",
				}}
			>
				{/* Mobile overlay */}
				{isMobile && sidebarOpen && (
					<div
						onClick={() => setSidebarOpen(false)}
						style={{
							position: "fixed",
							inset: 0,
							background: "rgba(0,0,0,0.75)",
							backdropFilter: "blur(4px)",
							zIndex: 40,
						}}
					/>
				)}

					{/* Sidebar — desktop only */}
				<div
					style={{
						width: 220,
						flexShrink: 0,
						background: "#0a0a0a",
						borderRight: T.borderSub,
						position: isMobile ? "fixed" : "relative",
						top: 0,
						left: 0,
						height: "100vh",
						zIndex: 50,
						transform: isMobile
							? sidebarOpen
								? "translateX(0)"
								: "translateX(-100%)"
							: "translateX(0)",
						transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)",
					}}
				>
					<SidebarContent />
				</div>

				{/* Main */}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						minWidth: 0,
						paddingBottom: isMobile ? 58 : 0,
					}}
				>
					{/* Mobile top bar — premium header */}
					{isMobile && (
						<div
							style={{
								height: 56,
								background: "rgba(10,10,10,0.98)",
								borderBottom: T.borderSub,
								display: "flex",
								alignItems: "center",
								padding: "0 16px",
								gap: 12,
								flexShrink: 0,
								backdropFilter: "blur(16px)",
								WebkitBackdropFilter: "blur(16px)",
								position: "sticky",
								top: 0,
								zIndex: 30,
								boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
							}}
						>
							{/* Brand mark */}
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontStyle: "italic", color: T.ember, lineHeight: 1 }}>V</span>
								<div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
									<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
										{NAV.find((n) => n.id === tab)?.label || "Terminal"}
									</span>
									{waitingCount > 0 && (
										<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, letterSpacing: "0.15em", color: T.escalated }}>
											{waitingCount} WAITING
										</span>
									)}
								</div>
							</div>
							{/* Logout right side */}
							<button
								onClick={handleStaffLogout}
								style={{ marginLeft: "auto", background: "transparent", border: T.border, borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}
							>
								<span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
							</button>
						</div>
					)}

					{/* ── INBOX TAB ── */}
					{tab === "inbox" && (
						<div
							style={{
								display: "flex",
								height: "100%",
								overflow: "hidden",
								flexDirection: isMobile ? "column" : "row",
							}}
						>
							<SessionList list={liveSessions} title="LIVE SESSIONS" />
							<div
								style={{
									flex: 1,
									display: "flex",
									flexDirection: "column",
									overflow: "hidden",
								}}
							>
								{selectedChat ? (
									<>
										{/* Action bar */}
										<div
											style={{
												height: 52,
												background: T.obsidian,
												borderBottom: T.borderSub,
												display: "flex",
												alignItems: "center",
												padding: "0 16px",
												justifyContent: "space-between",
												flexShrink: 0,
												gap: 8,
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 8,
													minWidth: 0,
												}}
											>
												{isMobile && (
													<button
														onClick={() => setSelectedChat(null)}
														style={{
															background: "transparent",
															border: "none",
															cursor: "pointer",
															color: "rgba(255,255,255,0.4)",
															flexShrink: 0,
														}}
													>
														<span
															className="material-symbols-outlined"
															style={{ fontSize: 20 }}
														>
															arrow_back
														</span>
													</button>
												)}
												<Badge status={selectedChat.status} />
												<span
													style={{
														fontFamily: "'DM Sans',sans-serif",
														fontSize: 12,
														fontWeight: 500,
														color: "rgba(255,255,255,0.75)",
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
														maxWidth: isMobile ? 100 : 200,
													}}
												>
													{selectedChat.client_email}
												</span>
											</div>
											<div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
												{/* PARTIAL PUSH */}
												<button
													onClick={() =>
														setPushModal({
															session: selectedChat,
															type: "partial",
														})
													}
													style={{
														background: "rgba(236,91,19,0.08)",
														border: `1px solid ${T.emberBorder}`,
														color: "rgba(236,91,19,0.85)",
														borderRadius: 9,
														padding: "7px 10px",
														cursor: "pointer",
														fontFamily: "'JetBrains Mono',monospace",
														fontSize: 7,
														letterSpacing: "0.16em",
														textTransform: "uppercase",
														transition: "all 200ms",
														whiteSpace: "nowrap",
													}}
													title="Notify admin of this situation (you keep the chat)"
												>
													Escalate
												</button>
												{/* FULL PUSH */}
												<button
													onClick={() =>
														setPushModal({
															session: selectedChat,
															type: "full",
														})
													}
													style={{
														background: "rgba(239,68,68,0.08)",
														border: "1px solid rgba(239,68,68,0.3)",
														color: "rgba(239,68,68,0.85)",
														borderRadius: 9,
														padding: "7px 10px",
														cursor: "pointer",
														fontFamily: "'JetBrains Mono',monospace",
														fontSize: 7,
														letterSpacing: "0.16em",
														textTransform: "uppercase",
														transition: "all 200ms",
														whiteSpace: "nowrap",
													}}
													title="Hand full control of this chat to admin"
												>
													Full Push
												</button>
												{/* RESOLVE */}
												<button
													onClick={() =>
														updateStatus(selectedChat.id, "resolved")
													}
													style={{
														background: "rgba(34,197,94,0.08)",
														border: "1px solid rgba(34,197,94,0.3)",
														color: "rgba(34,197,94,0.8)",
														borderRadius: 9,
														padding: "7px 10px",
														cursor: "pointer",
														fontFamily: "'JetBrains Mono',monospace",
														fontSize: 7,
														letterSpacing: "0.16em",
														textTransform: "uppercase",
														transition: "all 200ms",
													}}
												>
													Resolve
												</button>
											</div>
										</div>
										<div style={{ flex: 1, overflow: "hidden" }}>
											<LiveAssistantChat
												chatId={selectedChat.id}
												role="assistant"
												compact
											/>
										</div>
									</>
								) : (
									<div
										style={{
											flex: 1,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexDirection: "column",
											gap: 12,
											opacity: 0.15,
										}}
									>
										<span
											className="material-symbols-outlined"
											style={{ fontSize: 40 }}
										>
											forum
										</span>
										<p
											style={{
												fontFamily: "'JetBrains Mono',monospace",
												fontSize: 8,
												letterSpacing: "0.35em",
												textTransform: "uppercase",
											}}
										>
											SELECT A SESSION
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* ── QUEUE TAB ── */}
					{tab === "queue" && (
						<div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
							<p
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 8,
									letterSpacing: "0.3em",
									textTransform: "uppercase",
									color: "rgba(255,255,255,0.3)",
									marginBottom: 14,
								}}
							>
								CLEARANCE REQUESTS
							</p>
							{waitingSessions.length === 0 && (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										height: 200,
										gap: 12,
										opacity: 0.15,
									}}
								>
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 36 }}
									>
										done_all
									</span>
									<p
										style={{
											fontFamily: "'Playfair Display',serif",
											fontSize: 22,
											fontStyle: "italic",
											color: "white",
										}}
									>
										All Clear
									</p>
								</div>
							)}
							{waitingSessions.map((s, idx) => (
								<div
									key={s.id}
									style={{
										background: T.obsidian,
										border: T.border,
										borderRadius: 15,
										padding: "16px 20px",
										marginBottom: 8,
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										flexWrap: "wrap",
										gap: 12,
										animation: `fadeUp 0.3s ${idx * 0.06}s both`,
									}}
								>
									<div
										style={{ display: "flex", flexDirection: "column", gap: 4 }}
									>
										<Badge status="waiting" />
										<p
											style={{
												fontFamily: "'DM Sans',sans-serif",
												fontSize: 13,
												fontWeight: 500,
												color: "white",
												marginTop: 4,
											}}
										>
											{s.client_email}
										</p>
										<p
											style={{
												fontFamily: "'JetBrains Mono',monospace",
												fontSize: 7,
												color: "rgba(255,255,255,0.2)",
												letterSpacing: "0.1em",
											}}
										>
											{new Date(s.created_at).toLocaleTimeString()}
										</p>
									</div>
									<button
										onClick={async () => {
											const { value: agentName } = await Swal.fire({
												title: "Enter your name",
												html: `<p style="font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:12px;">So the client knows who they're talking to.</p>`,
												input: "text",
												inputPlaceholder: "e.g. Ama",
												inputAttributes: { "aria-label": "Your name" },
												background: "#0a0a0a",
												color: "#fff",
												showCancelButton: true,
												confirmButtonColor: "#ec5b13",
												cancelButtonColor: "#1c1c1c",
												confirmButtonText: "Start session",
												customClass: { popup: "rounded-2xl border border-white/10", input: "vault-agent-name-input" },
											});
											if (!agentName || !agentName.trim()) return;
											const name = agentName.trim();
											await supabase
												.from("verp_support_sessions")
												.update({ status: "live", updated_at: new Date().toISOString() })
												.eq("id", s.id);
											const greeting = `Hello, my name is ${name} from Verp support. How can I help you today?`;
											await supabase.from("verp_chat_messages").insert([
												{ chat_id: s.id, sender_role: "assistant", content: greeting },
											]);
											fetchSessions();
										}}
										style={{
											background: T.ember,
											border: "none",
											borderRadius: 11,
											padding: "10px 22px",
											cursor: "pointer",
											fontFamily: "'DM Sans',sans-serif",
											fontSize: 10,
											fontWeight: 700,
											letterSpacing: "0.15em",
											textTransform: "uppercase",
											color: "#000",
											transition: "filter 200ms",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.filter = "brightness(1.1)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.filter = "none")
										}
									>
										GRANT ACCESS
									</button>
								</div>
							))}
						</div>
					)}

					{tab === "orders" && <OrdersTab />}
					{tab === "analytics" && <AnalyticsTab />}
					{tab === "admin" && <AdminChannel />}
					{tab === "history" && <ChatHistoryTab />}
				</div>
			</div>

			{/* ── Mobile Bottom Navigation ── */}
			{isMobile && (
				<nav className="at-bottom-nav">
					{NAV.map((n) => {
						const badge = n.id === "queue" ? waitingCount : n.id === "inbox" ? fullPushCount : 0;
						const active = tab === n.id;
						return (
							<button
								key={n.id}
								className={`at-nav-item${active ? " active" : ""}`}
								onClick={() => switchTab(n.id)}
							>
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