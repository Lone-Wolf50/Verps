import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	ember: "#ec5b13",
	live: "#22c55e",
	waiting: "#f59e0b",
	shipped: "#38bdf8",
	violet: "#a78bfa",
	returned: "#fb923c",
	cancelled: "#ef4444",
	border: "1px solid rgba(255,255,255,0.06)",
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

const STATUS_COLOR = {
	ordered: "#a78bfa",
	pending: "#f59e0b",
	processing: "#38bdf8",
	shipped: "#38bdf8",
	delivered: "#22c55e",
	returned: "#fb923c",
	cancelled: "#ef4444",
};

/* ─── STATUS BADGE ───────────────────────────────────────────── */
const Badge = ({ status = "" }) => {
	const c = STATUS_COLOR[status.toLowerCase()] || "rgba(255,255,255,0.3)";
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
				whiteSpace: "nowrap",
			}}
		>
			{status.toUpperCase()}
		</span>
	);
};

/* ─── MAIN ───────────────────────────────────────────────────── */
const ClientRequests = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useState("incoming");
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [newStatus, setNewStatus] = useState("");
	const [saving, setSaving] = useState(false);

	const INCOMING = ["ordered", "pending", "processing", "shipped"];
	const OUTGOING = ["delivered", "returned", "cancelled"];

	const fetchOrders = async () => {
		const { data } = await supabase
			.from("verp_orders")
			.select("*")
			.order("created_at", { ascending: false });
		if (data) setOrders(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchOrders();
		const i = setInterval(fetchOrders, 15000);
		return () => clearInterval(i);
	}, []);

	const filtered = orders.filter((o) =>
		view === "incoming"
			? INCOMING.includes(o.status?.toLowerCase())
			: OUTGOING.includes(o.status?.toLowerCase()),
	);

	const openManifest = (order) => {
		setSelectedOrder(order);
		setNewStatus(order.status || "ordered");
	};

	/* ── Status update only (no private message to client) ── */
	const handleUpdate = async () => {
		if (!selectedOrder) return;
		setSaving(true);

		await supabase
			.from("verp_orders")
			.update({ status: newStatus })
			.eq("id", selectedOrder.id);

		/* Alert admin via email */
		try {
			await fetch("/api/alert-staff", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "NEW_ORDER",
					clientId: selectedOrder.client_email || selectedOrder.email,
					orderNumber: selectedOrder.order_number,
					orderValue: selectedOrder.total_amount,
					orderStatus: newStatus,
				}),
			});
		} catch (_) {
			/* non-critical */
		}

		setOrders((prev) =>
			prev.map((o) =>
				o.id === selectedOrder.id ? { ...o, status: newStatus } : o,
			),
		);
		setSaving(false);
		setSelectedOrder(null);

		Swal.fire({
			title: "Updated!",
			background: "#0d0d0d",
			color: "#fff",
			icon: "success",
			timer: 1600,
			showConfirmButton: false,
		});
	};

	if (loading)
		return (
			<div className="flex items-center justify-center py-32">
				<div className="w-8 h-8 border-2 border-t-[#ec5b13] border-white/10 rounded-full animate-spin" />
			</div>
		);

	return (
		<div className="space-y-6 px-4 md:px-0">
			{/* ── HEADER + TOGGLE ── */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
						Order{" "}
						<span className="font-serif italic" style={{ color: T.ember }}>
							Flow
						</span>
					</h2>
					<p className="text-xs text-white/40 mt-2 tracking-wide">
						{filtered.length} order{filtered.length !== 1 ? "s" : ""} in this
						view
					</p>
				</div>
				<div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 w-full sm:w-auto">
					{["incoming", "outgoing"].map((v) => (
						<button
							key={v}
							onClick={() => setView(v)}
							className={`flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl text-[10px] font-bold uppercase transition-all tracking-wider ${
								view === v
									? "bg-white text-black shadow-lg"
									: "text-white/40 hover:text-white/60"
							}`}
						>
							{v}
						</button>
					))}
				</div>
			</div>

			{/* ── DESKTOP TABLE ── */}
			<div className="hidden lg:block relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
							<tr>
								<th className="p-5 font-bold">Client</th>
								<th className="p-5 font-bold">Order ID</th>
								<th className="p-5 font-bold">Value</th>
								<th className="p-5 font-bold">Status</th>
								<th className="p-5 font-bold text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filtered.length === 0 && (
								<tr>
									<td
										colSpan={5}
										className="p-10 text-center text-white/20 text-xs uppercase tracking-widest"
									>
										No orders
									</td>
								</tr>
							)}
							{filtered.map((order) => (
								<tr
									key={order.id}
									className="hover:bg-white/[0.02] transition-colors group"
								>
									<td className="p-5">
										<p className="font-medium text-sm text-white">
											{order.client_email || order.email || "—"}
										</p>
										<p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
											{new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
										</p>
										{/* Product image strip */}
										{(() => {
											let items = [];
											try { items = typeof order.items === "string" ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []); } catch (_) {}
											if (!items.length) return null;
											return (
												<div className="flex gap-1 mt-2 flex-wrap">
													{items.slice(0, 4).map((item, i) => (
														<div key={i} className="relative flex-shrink-0">
															{item.image ? (
																<img src={item.image} alt={item.name || "item"} title={item.name || ""}
																	className="w-9 h-9 object-cover rounded-lg"
																	style={{ border: "1px solid rgba(255,255,255,0.08)" }}
																	onError={e => { e.currentTarget.style.display = "none"; }} />
															) : (
																<div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
																	<span className="material-symbols-outlined text-white/20" style={{ fontSize: 13 }}>image</span>
																</div>
															)}
															{(item.quantity || 1) > 1 && (
																<span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ec5b13] text-black text-[7px] font-bold flex items-center justify-center">{item.quantity}</span>
															)}
														</div>
													))}
													{items.length > 4 && <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[8px] text-white/30 font-mono" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>+{items.length - 4}</div>}
												</div>
											);
										})()}
									</td>
									<td className="p-5">
										<span className="text-xs text-white/50 font-mono">
											{order.order_number || "—"}
										</span>
									</td>
									<td className="p-5">
										<span
											className="text-sm font-bold"
											style={{ color: T.ember }}
										>
											GH₵ {Number(order.total_amount || 0).toLocaleString()}
										</span>
									</td>
									<td className="p-5">
										<Badge status={order.status} />
									</td>
									<td className="p-5 text-right">
										<button
											onClick={() => openManifest(order)}
											className="text-[10px] font-medium text-white/60 border border-white/10 px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider"
											style={{}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = T.ember;
												e.currentTarget.style.borderColor = T.ember;
												e.currentTarget.style.color = "#000";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = "";
												e.currentTarget.style.borderColor = "";
												e.currentTarget.style.color = "";
											}}
										>
											Manage
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* ── MOBILE CARDS ── */}
			<div className="lg:hidden space-y-4">
				{filtered.length === 0 && (
					<div className="text-center py-16 text-white/20 text-xs uppercase tracking-widest">
						No orders
					</div>
				)}
				{filtered.map((order) => (
					<div
						key={order.id}
						className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-5 space-y-4"
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-medium text-sm text-white">
									{order.client_email || order.email || "—"}
								</h3>
								<p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
									{new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
								</p>
								{/* Product images strip */}
								{(() => {
									let items = [];
									try { items = typeof order.items === "string" ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []); } catch (_) {}
									if (!items.length) return null;
									return (
										<div className="flex gap-1 mt-2 flex-wrap">
											{items.slice(0, 4).map((item, i) => (
												<div key={i} className="relative flex-shrink-0">
													{item.image ? (
														<img src={item.image} alt={item.name || ""} className="w-9 h-9 object-cover rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.08)" }} onError={e => { e.currentTarget.style.display = "none"; }} />
													) : (
														<div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
															<span className="material-symbols-outlined text-white/20" style={{ fontSize: 13 }}>image</span>
														</div>
													)}
													{(item.quantity || 1) > 1 && (
														<span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ec5b13] text-black text-[7px] font-bold flex items-center justify-center">{item.quantity}</span>
													)}
												</div>
											))}
											{items.length > 4 && <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[8px] text-white/30 font-mono" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>+{items.length - 4}</div>}
										</div>
									);
								})()}
							</div>
							<Badge status={order.status} />
						</div>
						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
									Order ID
								</p>
								<p className="text-xs text-white/60 font-mono">
									{order.order_number || "—"}
								</p>
							</div>
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
									Value
								</p>
								<p className="text-sm font-bold" style={{ color: T.ember }}>
									GH₵ {Number(order.total_amount || 0).toLocaleString()}
								</p>
							</div>
						</div>
						<button
							onClick={() => openManifest(order)}
							className="w-full text-[10px] font-medium text-white/60 border border-white/10 px-5 py-3 rounded-xl transition-all uppercase tracking-wider"
							onMouseEnter={(e) => {
								e.currentTarget.style.background = T.ember;
								e.currentTarget.style.borderColor = T.ember;
								e.currentTarget.style.color = "#000";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "";
								e.currentTarget.style.borderColor = "";
								e.currentTarget.style.color = "";
							}}
						>
							Manage Order
						</button>
					</div>
				))}
			</div>

			{/* ── MANIFEST MODAL (status update only) ── */}
			{selectedOrder && (
				<div
					className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6"
					style={{
						background: "rgba(0,0,0,0.9)",
						backdropFilter: "blur(16px)",
					}}
				>
					<div className="bg-[#0a0a0a] border-t md:border border-white/10 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-6 md:p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
						{/* Close */}
						<button
							onClick={() => setSelectedOrder(null)}
							className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
						>
							<span className="material-symbols-outlined text-2xl">close</span>
						</button>

						{/* Title */}
						<div className="mb-8 pr-10">
							<h3 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2">
								Order{" "}
								<span className="font-serif italic" style={{ color: T.ember }}>
									{selectedOrder.order_number}
								</span>
							</h3>
							<p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
								{selectedOrder.client_email || selectedOrder.email}
							</p>
						</div>

						<div className="space-y-6">
							{/* Summary */}
							<div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">
											Current Value
										</p>
										<p className="text-xl font-bold" style={{ color: T.ember }}>
											GH₵{" "}
											{Number(selectedOrder.total_amount || 0).toLocaleString()}
										</p>
									</div>
									<Badge status={selectedOrder.status} />
								</div>
								<p className="text-[10px] text-white/30 mt-3">
									{new Date(selectedOrder.created_at).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {new Date(selectedOrder.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
								</p>
								{/* Product images in modal */}
								{(() => {
									let items = [];
									try { items = typeof selectedOrder.items === "string" ? JSON.parse(selectedOrder.items) : (Array.isArray(selectedOrder.items) ? selectedOrder.items : []); } catch (_) {}
									if (!items.length) return null;
									return (
										<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
											{items.map((item, i) => (
												<div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-1.5 border border-white/[0.05]">
													{item.image ? (
														<img src={item.image} alt={item.name || ""} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" onError={e => { e.currentTarget.style.display = "none"; }} />
													) : (
														<div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
															<span className="material-symbols-outlined text-white/20" style={{ fontSize: 14 }}>image</span>
														</div>
													)}
													<div className="min-w-0 pr-1">
														<p className="text-[9px] font-medium text-white/60 truncate max-w-[90px]">{item.name || "Item"}</p>
														<p className="text-[8px] text-white/30 font-mono">×{item.quantity || 1}</p>
													</div>
												</div>
											))}
										</div>
									);
								})()}
							</div>

							{/* Status selector */}
							<div className="space-y-3">
								<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									Update Status
								</label>
								<div className="relative">
									<select
										value={newStatus}
										onChange={(e) => setNewStatus(e.target.value)}
										className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm uppercase outline-none focus:border-[#ec5b13]/50 transition-all appearance-none cursor-pointer font-bold tracking-widest"
										style={{ color: T.ember }}
									>
										{ORDER_STATUSES.map((s) => (
											<option key={s} value={s}>
												{s.toUpperCase()}
											</option>
										))}
									</select>
									<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-lg">
										expand_more
									</span>
								</div>
							</div>

							{/* Actions */}
							<div className="flex flex-col sm:flex-row gap-3 pt-2">
								<button
									onClick={handleUpdate}
									disabled={saving}
									className="flex-1 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] transition-all active:scale-[0.98] disabled:opacity-50"
									style={{
										background: `linear-gradient(135deg, ${T.ember}, #d94e0f)`,
										color: "#fff",
									}}
								>
									{saving ? "SAVING..." : "UPDATE STATUS"}
								</button>
								<button
									onClick={() => setSelectedOrder(null)}
									className="flex-1 sm:flex-none px-8 py-4 bg-white/5 border border-white/10 text-white/50 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-white/10 hover:text-white transition-all"
								>
									Cancel
								</button>
							</div>

							{/* Info note */}
							<p className="text-center text-[8px] text-white/20 tracking-widest uppercase">
								To message a client, use Broadcast in Analytics
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientRequests;
