import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "./Tokens";

const ChatHistoryTab = () => {
	const [sessions, setSessions]     = useState([]);
	const [loading, setLoading]       = useState(true);
	const [search, setSearch]         = useState("");
	const [selected, setSelected]     = useState(null);
	const [messages, setMessages]     = useState([]);
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
		return !q || s.client_email?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q);
	});

	const msgFiltered = messages.filter((m) => {
		const q = search.toLowerCase();
		return !selected || !q || m.content?.toLowerCase().includes(q);
	});

	const Spinner = () => (
		<div style={{ display: "flex", justifyContent: "center", padding: 30 }}>
			<div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.1)", borderTopColor: T.ember, animation: "pd 1s linear infinite" }} />
		</div>
	);

	return (
		<div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
			{/* ── Session list ── */}
			<div style={{ width: 260, background: "#0a0a0a", borderRight: T.borderSub, display: "flex", flexDirection: "column", flexShrink: 0 }}>
				<div style={{ padding: "14px 14px 10px", borderBottom: T.borderSub }}>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>RESOLVED SESSIONS</p>
					<div style={{ position: "relative" }}>
						<span className="material-symbols-outlined" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "rgba(255,255,255,0.2)", pointerEvents: "none" }}>search</span>
						<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or message…" style={{ width: "100%", background: "#111", border: T.border, borderRadius: 10, padding: "9px 12px 9px 34px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", outline: "none", boxSizing: "border-box" }} />
					</div>
				</div>
				<div style={{ flex: 1, overflowY: "auto" }}>
					{loading && <Spinner />}
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

			{/* ── Chat pane ── */}
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
							{loadingMsgs && <Spinner />}
							{!loadingMsgs && msgFiltered.length === 0 && (
								<div style={{ textAlign: "center", padding: "40px 0", opacity: 0.2 }}>
									<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em" }}>NO MESSAGES</p>
								</div>
							)}
							{msgFiltered.map((msg, idx) => {
								const isStaff = msg.sender_role === "assistant" || msg.sender_role === "admin";
								return (
									<div key={msg.id || idx} style={{ display: "flex", justifyContent: isStaff ? "flex-end" : "flex-start" }}>
										<div style={{ maxWidth: "74%", minWidth: 0, display: "flex", flexDirection: "column", alignItems: isStaff ? "flex-end" : "flex-start", gap: 4 }}>
											<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: isStaff ? "rgba(236,91,19,0.5)" : "rgba(255,255,255,0.2)" }}>
												{isStaff ? (msg.sender_role === "admin" ? "ADMIN" : "ASSISTANT") : "CLIENT"} · {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
											</p>
											<div style={{ padding: "11px 15px", background: isStaff ? T.ember : "#1a1a1a", border: isStaff ? "none" : T.border, borderRadius: isStaff ? "15px 4px 15px 15px" : "4px 15px 15px 15px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: isStaff ? "#000" : "rgba(255,255,255,0.8)", lineHeight: 1.6, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
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

export default ChatHistoryTab;