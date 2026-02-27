import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

const T = {
	ember: "#ec5b13",
	obsidian: "#0d0d0d",
	border: "1px solid rgba(255,255,255,0.06)",
	sub: "1px solid rgba(255,255,255,0.03)",
};

const SWAL = {
	background: "#0a0a0a",
	color: "#fff",
	confirmButtonColor: "#ec5b13",
	cancelButtonColor: "#1a1a1a",
	customClass: {
		popup: "rounded-3xl border border-white/10",
		confirmButton: "rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
		cancelButton:  "rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
	},
};

const Broadcasts = () => {
	const [messages, setMessages]     = useState([]);
	const [loading, setLoading]       = useState(true);
	const [editingId, setEditingId]   = useState(null);
	const [editSubject, setEditSubject] = useState("");
	const [editBody, setEditBody]       = useState("");
	const [saving, setSaving]           = useState(false);
	const [search, setSearch]           = useState("");

	const fetch = async () => {
		setLoading(true);
		const { data } = await supabase
			.from("verp_inbox_messages")
			.select("id, subject, body, created_at, to_email")
			.eq("from_role", "admin")
			.order("created_at", { ascending: false });
		if (data) setMessages(data);
		setLoading(false);
	};

	useEffect(() => { fetch(); }, []);

	/* ── Group by subject+body+timestamp (each broadcast = one send per N emails) ── */
	const grouped = React.useMemo(() => {
		const map = new Map();
		messages.forEach((m) => {
			// key = subject + body + minute (group messages sent in same broadcast)
			const minute = m.created_at?.slice(0, 16);
			const key = `${m.subject}||${m.body}||${minute}`;
			if (!map.has(key)) {
				map.set(key, { ...m, recipients: 1, ids: [m.id] });
			} else {
				const existing = map.get(key);
				existing.recipients += 1;
				existing.ids.push(m.id);
			}
		});
		return Array.from(map.values());
	}, [messages]);

	const filtered = grouped.filter(
		(m) =>
			m.subject?.toLowerCase().includes(search.toLowerCase()) ||
			m.body?.toLowerCase().includes(search.toLowerCase()),
	);

	/* ── Edit ── */
	const startEdit = (msg) => {
		setEditingId(msg.ids[0]); // use first id as key
		setEditSubject(msg.subject);
		setEditBody(msg.body);
	};

	const saveEdit = async (msg) => {
		if (!editSubject.trim() || !editBody.trim()) return;
		setSaving(true);
		// Update all rows that share the same broadcast (same ids group)
		for (const id of msg.ids) {
			await supabase
				.from("verp_inbox_messages")
				.update({ subject: editSubject.trim(), body: editBody.trim() })
				.eq("id", id);
		}
		setMessages((prev) =>
			prev.map((m) =>
				msg.ids.includes(m.id)
					? { ...m, subject: editSubject.trim(), body: editBody.trim() }
					: m,
			),
		);
		setEditingId(null);
		setSaving(false);
		Swal.fire({ ...SWAL, title: "Updated", icon: "success", timer: 1400, showConfirmButton: false });
	};

	/* ── Delete ── */
	const handleDelete = async (msg) => {
		const result = await Swal.fire({
			...SWAL,
			title: "DELETE BROADCAST?",
			text: `This will remove the message from ${msg.recipients} recipient inbox${msg.recipients !== 1 ? "es" : ""}.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "DELETE",
			cancelButtonText: "CANCEL",
		});
		if (!result.isConfirmed) return;

		for (const id of msg.ids) {
			await supabase.from("verp_inbox_messages").delete().eq("id", id);
		}
		setMessages((prev) => prev.filter((m) => !msg.ids.includes(m.id)));
		Swal.fire({ ...SWAL, title: "DELETED", icon: "success", timer: 1400, showConfirmButton: false });
	};

	return (
		<div style={{ fontFamily: "'DM Sans',sans-serif" }}>

			{/* ── Header ── */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h2
						style={{
							fontFamily: "'Playfair Display',serif",
							fontSize: "clamp(18px,2.5vw,26px)",
							fontStyle: "italic",
							fontWeight: 400,
							color: "white",
						}}
					>
						Broadcast <span style={{ color: T.ember }}>History</span>
					</h2>
					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 8,
							letterSpacing: "0.28em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.2)",
							marginTop: 4,
						}}
					>
						{grouped.length} CAMPAIGN{grouped.length !== 1 ? "S" : ""} · {messages.length} TOTAL SENDS
					</p>
				</div>

				{/* Search */}
				<div style={{ position: "relative", flexShrink: 0 }}>
					<span
						className="material-symbols-outlined"
						style={{
							position: "absolute",
							left: 12,
							top: "50%",
							transform: "translateY(-50%)",
							fontSize: 15,
							color: "rgba(255,255,255,0.25)",
							pointerEvents: "none",
						}}
					>
						search
					</span>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search broadcasts..."
						style={{
							background: "rgba(255,255,255,0.03)",
							border: T.border,
							borderRadius: 12,
							padding: "9px 14px 9px 36px",
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 12,
							color: "rgba(255,255,255,0.7)",
							outline: "none",
							width: 220,
							transition: "border-color 200ms",
						}}
						onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)")}
						onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
					/>
				</div>
			</div>

			{/* ── Loading ── */}
			{loading && (
				<div className="flex items-center justify-center py-32">
					<div className="w-7 h-7 border-2 border-t-[#ec5b13] border-white/10 rounded-full animate-spin" />
				</div>
			)}

			{/* ── Empty ── */}
			{!loading && filtered.length === 0 && (
				<div
					className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-white/[0.06]"
					style={{ color: "rgba(255,255,255,0.15)" }}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12 }}>
						campaign
					</span>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" }}>
						{search ? "NO RESULTS" : "NO BROADCASTS YET"}
					</p>
					<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, marginTop: 8, opacity: 0.6 }}>
						{search ? "Try a different search term" : "Send your first broadcast from Analytics"}
					</p>
				</div>
			)}

			{/* ── List ── */}
			{!loading && (
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{filtered.map((msg, idx) => {
						const isEditing = editingId === msg.ids[0];
						return (
							<div
								key={msg.ids[0]}
								style={{
									background: T.obsidian,
									border: T.border,
									borderLeft: `3px solid ${T.ember}`,
									borderRadius: 16,
									padding: "18px 20px",
									animation: `fadeUp 0.25s ${Math.min(idx * 0.04, 0.4)}s both`,
								}}
							>
								<style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

								{isEditing ? (
									/* ── Edit mode ── */
									<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
										<input
											value={editSubject}
											onChange={(e) => setEditSubject(e.target.value)}
											placeholder="Subject..."
											style={{
												background: "rgba(255,255,255,0.04)",
												border: "1px solid rgba(236,91,19,0.3)",
												borderRadius: 10,
												padding: "10px 14px",
												fontFamily: "'DM Sans',sans-serif",
												fontSize: 13,
												color: "white",
												fontWeight: 600,
												outline: "none",
												width: "100%",
											}}
										/>
										<textarea
											value={editBody}
											onChange={(e) => setEditBody(e.target.value)}
											rows={4}
											style={{
												background: "rgba(255,255,255,0.04)",
												border: "1px solid rgba(236,91,19,0.3)",
												borderRadius: 10,
												padding: "10px 14px",
												fontFamily: "'DM Sans',sans-serif",
												fontSize: 13,
												color: "rgba(255,255,255,0.8)",
												outline: "none",
												resize: "vertical",
												width: "100%",
											}}
										/>
										<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
											<button
												onClick={() => setEditingId(null)}
												style={{
													background: "transparent",
													border: "1px solid rgba(255,255,255,0.1)",
													borderRadius: 9,
													padding: "8px 18px",
													cursor: "pointer",
													fontFamily: "'JetBrains Mono',monospace",
													fontSize: 8,
													letterSpacing: "0.14em",
													textTransform: "uppercase",
													color: "rgba(255,255,255,0.4)",
												}}
											>
												CANCEL
											</button>
											<button
												onClick={() => saveEdit(msg)}
												disabled={saving}
												style={{
													background: T.ember,
													border: "none",
													borderRadius: 9,
													padding: "8px 20px",
													cursor: "pointer",
													fontFamily: "'JetBrains Mono',monospace",
													fontSize: 8,
													letterSpacing: "0.14em",
													textTransform: "uppercase",
													color: "#000",
													fontWeight: 700,
													opacity: saving ? 0.5 : 1,
												}}
											>
												{saving ? "SAVING..." : "SAVE"}
											</button>
										</div>
									</div>
								) : (
									/* ── View mode ── */
									<>
										<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
											<div style={{ flex: 1, minWidth: 0 }}>
												<p
													style={{
														fontFamily: "'DM Sans',sans-serif",
														fontSize: 14,
														fontWeight: 700,
														color: "white",
														marginBottom: 4,
														wordBreak: "break-word",
													}}
												>
													{msg.subject}
												</p>
												<p
													style={{
														fontFamily: "'DM Sans',sans-serif",
														fontSize: 12,
														color: "rgba(255,255,255,0.5)",
														lineHeight: 1.6,
														wordBreak: "break-word",
													}}
												>
													{msg.body}
												</p>
											</div>

											{/* Actions */}
											<div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "flex-start" }}>
												<button
													onClick={() => startEdit(msg)}
													title="Edit broadcast"
													style={{
														background: "rgba(255,255,255,0.04)",
														border: "1px solid rgba(255,255,255,0.07)",
														borderRadius: 9,
														padding: "7px 10px",
														cursor: "pointer",
														color: "rgba(255,255,255,0.4)",
														display: "flex",
														alignItems: "center",
														transition: "all 150ms",
													}}
													onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)"; e.currentTarget.style.color = T.ember; }}
													onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
												>
													<span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
												</button>
												<button
													onClick={() => handleDelete(msg)}
													title="Delete broadcast"
													style={{
														background: "rgba(239,68,68,0.05)",
														border: "1px solid rgba(239,68,68,0.15)",
														borderRadius: 9,
														padding: "7px 10px",
														cursor: "pointer",
														color: "rgba(239,68,68,0.5)",
														display: "flex",
														alignItems: "center",
														transition: "all 150ms",
													}}
													onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444"; }}
													onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "rgba(239,68,68,0.5)"; }}
												>
													<span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
												</button>
											</div>
										</div>

										{/* Meta row */}
										<div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
											<div style={{ display: "flex", alignItems: "center", gap: 5 }}>
												<span className="material-symbols-outlined" style={{ fontSize: 12, color: T.ember }}>group</span>
												<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}>
													{msg.recipients} RECIPIENT{msg.recipients !== 1 ? "S" : ""}
												</span>
											</div>
											<div style={{ display: "flex", alignItems: "center", gap: 5 }}>
												<span className="material-symbols-outlined" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>schedule</span>
												<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
													{new Date(msg.created_at).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}
													{" · "}
													{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
												</span>
											</div>
										</div>
									</>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Broadcasts;