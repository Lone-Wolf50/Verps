import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	ember: "#ec5b13",
	shipped: "#38bdf8",
	border: "1px solid rgba(255,255,255,0.06)",
	sub: "1px solid rgba(255,255,255,0.03)",
};

/* ══════════════════════════════════════════════════════════════
   CHILD 1 — AssistantInbox_Message
   Single message bubble
   ════════════════════════════════════════════════════════════ */
const AssistantInbox_Message = ({ msg, idx }) => {
	const isAdmin = msg.sender === "admin";
	const color = isAdmin ? T.shipped : T.ember;
	return (
		<div
			style={{
				display: "flex",
				justifyContent: isAdmin ? "flex-end" : "flex-start",
				animation: `fadeUp 0.22s ${Math.min(idx * 0.025, 0.25)}s both`,
			}}
		>
			<div
				style={{
					maxWidth: "72%",
					display: "flex",
					flexDirection: "column",
					alignItems: isAdmin ? "flex-end" : "flex-start",
					gap: 4,
				}}
			>
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 7,
						letterSpacing: "0.22em",
						textTransform: "uppercase",
						color: `${color}70`,
					}}
				>
					{isAdmin ? "YOU (ADMIN)" : "ASSISTANT"}
				</p>
				<div
					style={{
						padding: "12px 16px",
						background: color,
						borderRadius: isAdmin ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
						fontFamily: "'DM Sans',sans-serif",
						fontSize: 13,
						color: "#000",
						lineHeight: 1.65,
						fontWeight: 500,
						wordBreak: "break-word",
					}}
				>
					{msg.content}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 6,
							color: "rgba(255,255,255,0.15)",
							letterSpacing: "0.1em",
						}}
					>
						{new Date(msg.created_at).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</p>
					{isAdmin && (
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 6,
								letterSpacing: "0.08em",
								color: msg.read_at
									? "rgba(56,189,248,0.65)"
									: "rgba(255,255,255,0.12)",
							}}
						>
							{msg.read_at ? "✓ READ" : "SENT"}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

/* ══════════════════════════════════════════════════════════════
   PARENT — AssistantInbox  (was AdminChannel)
   Admin sees messages from assistant, can freely reply
   ════════════════════════════════════════════════════════════ */
const AssistantInbox = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const scrollRef = useRef(null);

	/* ── Fetch messages (no auth gate — dashboard handles that) ── */
	const sync = useCallback(async () => {
		const { data, error } = await supabase
			.from("verp_private_channel")
			.select("*")
			.order("created_at", { ascending: true });
		if (!error && data) {
			setMessages(data);
			// Mark assistant messages as read when admin views
			const unread = data.filter((m) => m.sender === "assistant" && !m.read_at);
			if (unread.length > 0) {
				const now = new Date().toISOString();
				supabase
					.from("verp_private_channel")
					.update({ read_at: now })
					.in(
						"id",
						unread.map((m) => m.id),
					)
					.then(() => {
						setMessages((prev) =>
							prev.map((m) =>
								m.sender === "assistant" && !m.read_at
									? { ...m, read_at: now }
									: m,
							),
						);
					});
			}
		}
	}, []);

	useEffect(() => {
		sync();
		const i = setInterval(sync, 4000);
		return () => clearInterval(i);
	}, [sync]);

	useEffect(() => {
		if (scrollRef.current)
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages]);

	const send = async (e) => {
		e.preventDefault();
		if (!input.trim() || sending) return;
		setSending(true);
		const content = input.trim();
		setInput("");
		// Insert to DB first, then sync — no optimistic ID collision
		const { error } = await supabase
			.from("verp_private_channel")
			.insert([{ sender: "admin", content }]);
		if (!error) {
			await sync(); // pull fresh from DB so ID is real
		}
		setSending(false);
	};

	return (
		<>
			<style>{`
        @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.35);border-radius:99px}
      `}</style>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
					background: T.void,
					fontFamily: "'DM Sans',sans-serif",
				}}
			>
				{/* HEADER */}
				<div
					style={{
						padding: "16px 22px",
						background: T.obsidian,
						borderBottom: T.sub,
						flexShrink: 0,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<div style={{ position: "relative" }}>
								<div
									style={{
										width: 38,
										height: 38,
										borderRadius: "50%",
										background: "rgba(56,189,248,0.1)",
										border: "1px solid rgba(56,189,248,0.25)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 18, color: T.shipped }}
									>
										mark_unread_chat_alt
									</span>
								</div>
								<div
									style={{
										position: "absolute",
										bottom: 1,
										right: 1,
										width: 8,
										height: 8,
										borderRadius: "50%",
										background: T.ember,
										animation: "pulseDot 2s ease-in-out infinite",
										border: "1.5px solid #080808",
									}}
								/>
							</div>
							<div>
								<h2
									style={{
										fontFamily: "'Playfair Display',serif",
										fontSize: "clamp(16px,2.5vw,22px)",
										fontStyle: "italic",
										fontWeight: 400,
										color: "white",
									}}
								>
									Assistant <span style={{ color: T.shipped }}>Inbox</span>
								</h2>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 7,
										letterSpacing: "0.22em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.22)",
										marginTop: 2,
									}}
								>
									PRIVATE · ADMIN ↔ ASSISTANT · NO CLIENT VISIBILITY
								</p>
							</div>
						</div>
						<div style={{ display: "flex", gap: 16 }}>
							{[
								{ color: T.shipped, label: "You (Admin)" },
								{ color: T.ember, label: "Assistant" },
							].map(({ color, label }) => (
								<div
									key={label}
									style={{ display: "flex", alignItems: "center", gap: 5 }}
								>
									<div
										style={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											background: color,
										}}
									/>
									<span
										style={{
											fontFamily: "'JetBrains Mono',monospace",
											fontSize: 7,
											letterSpacing: "0.15em",
											textTransform: "uppercase",
											color: "rgba(255,255,255,0.28)",
										}}
									>
										{label}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* MESSAGES */}
				<div
					ref={scrollRef}
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "18px 22px",
						display: "flex",
						flexDirection: "column",
						gap: 14,
						scrollbarWidth: "thin",
						scrollbarColor: "rgba(56,189,248,0.3) transparent",
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
								gap: 14,
								opacity: 0.12,
							}}
						>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: 40 }}
							>
								mark_unread_chat_alt
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
							<p
								style={{
									fontFamily: "'DM Sans',sans-serif",
									fontSize: 11,
									color: "rgba(255,255,255,0.3)",
									textAlign: "center",
									maxWidth: 280,
									lineHeight: 1.6,
								}}
							>
								The assistant will message here when they need your guidance on
								a session.
							</p>
						</div>
					)}
					{messages.map((msg, idx) => (
						<AssistantInbox_Message key={msg.id || idx} msg={msg} idx={idx} />
					))}
				</div>

				{/* INPUT */}
				<div
					style={{
						borderTop: T.sub,
						background: T.obsidian,
						padding: "14px 18px",
						flexShrink: 0,
					}}
				>
					<form onSubmit={send} style={{ display: "flex", gap: 8 }}>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							disabled={sending}
							placeholder="REPLY TO ASSISTANT — PRIVATE & SECURE..."
							style={{
								flex: 1,
								background: "rgba(56,189,248,0.04)",
								border: "1px solid rgba(56,189,248,0.18)",
								borderRadius: 12,
								padding: "11px 16px",
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 13,
								color: "rgba(255,255,255,0.85)",
								outline: "none",
								transition: "border-color 200ms",
							}}
							onFocus={(e) =>
								(e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)")
							}
							onBlur={(e) =>
								(e.currentTarget.style.borderColor = "rgba(56,189,248,0.18)")
							}
						/>
						<button
							type="submit"
							disabled={sending || !input.trim()}
							style={{
								background: T.shipped,
								border: "none",
								borderRadius: 12,
								padding: "11px 22px",
								cursor: "pointer",
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 10,
								fontWeight: 700,
								letterSpacing: "0.15em",
								textTransform: "uppercase",
								color: "#000",
								opacity: sending || !input.trim() ? 0.45 : 1,
								transition: "all 200ms",
							}}
						>
							SEND
						</button>
					</form>
					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 6,
							letterSpacing: "0.2em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.1)",
							textAlign: "center",
							marginTop: 10,
						}}
					>
						PRIVATE CHANNEL · CLIENT CANNOT SEE THIS
					</p>
				</div>
			</div>
		</>
	);
};

export default AssistantInbox;
