import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

/**
 * AssistantChannelWriter
 * ─────────────────────
 * Drop this into AssistantTerminal as the "Admin Channel" tab content.
 * It verifies the user is actually the assistant before reading or writing,
 * so even if someone navigates to the terminal URL directly they get blocked.
 *
 * Usage in AssistantTerminal:
 *   import AssistantChannelWriter from "./AssistantChannelWriter";
 *   // in your tab render:
 *   {activeTab === "channel" && <AssistantChannelWriter />}
 */

const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	ember: "#ec5b13",
	shipped: "#38bdf8",
	sub: "1px solid rgba(255,255,255,0.03)",
};

const AssistantChannelWriter = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const [authReady, setAuthReady] = useState(false);
	const [authorized, setAuthorized] = useState(false);
	const scrollRef = useRef(null);

	/* ── Verify assistant session ── */
	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				setAuthReady(true);
				return;
			}
			const role = user.user_metadata?.role;
			if (role === "assistant") setAuthorized(true);
			setAuthReady(true);
		};
		checkAuth();
	}, []);

	/* ── Fetch messages ── */
	const sync = useCallback(async () => {
		if (!authorized) return;
		const { data, error } = await supabase
			.from("verp_private_channel")
			.select("*")
			.order("created_at", { ascending: true });
		if (!error && data) setMessages(data);
	}, [authorized]);

	useEffect(() => {
		if (!authorized) return;
		sync();
		const i = setInterval(sync, 4000);
		return () => clearInterval(i);
	}, [authorized, sync]);

	/* ── Mark admin messages read when assistant opens channel ── */
	useEffect(() => {
		if (!authorized || messages.length === 0) return;
		const unread = messages.filter((m) => m.sender === "admin" && !m.read_at);
		if (unread.length === 0) return;
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
						m.sender === "admin" && !m.read_at ? { ...m, read_at: now } : m,
					),
				);
			});
	}, [authorized, messages.length]);

	/* ── Scroll ── */
	useEffect(() => {
		if (scrollRef.current)
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages]);

	const send = async (e) => {
		e.preventDefault();
		if (!input.trim() || sending || !authorized) return;
		setSending(true);
		const content = input.trim();
		setInput("");
		const { error } = await supabase
			.from("verp_private_channel")
			.insert([{ sender: "assistant", content }]);

		/* Also fire email alert to admin */
		if (!error) {
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					sender: "assistant",
					content,
					created_at: new Date().toISOString(),
					read_at: null,
				},
			]);
			try {
				await fetch("/api/alert-staff", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						type: "ADMIN_TAKEOVER",
						clientId: "Private channel message",
						note: content,
					}),
				});
			} catch (_) {
				/* non-critical */
			}
		}
		setSending(false);
	};

	/* ── Loading ── */
	if (!authReady)
		return (
			<div
				style={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: T.void,
				}}
			>
				<div
					style={{
						width: 20,
						height: 20,
						borderRadius: "50%",
						border: "1.5px solid rgba(236,91,19,0.15)",
						borderTopColor: T.ember,
						animation: "spin 1s linear infinite",
					}}
				/>
				<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
			</div>
		);

	/* ── Unauthorized ── */
	if (!authorized)
		return (
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: T.void,
					gap: 12,
				}}
			>
				<span
					className="material-symbols-outlined"
					style={{ fontSize: 40, color: "rgba(239,68,68,0.35)" }}
				>
					lock
				</span>
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8,
						letterSpacing: "0.3em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.15)",
					}}
				>
					ASSISTANT ACCESS ONLY
				</p>
			</div>
		);

	return (
		<>
			<style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(236,91,19,0.3);border-radius:99px}
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
						padding: "13px 18px",
						background: T.obsidian,
						borderBottom: T.sub,
						flexShrink: 0,
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
								letterSpacing: "0.25em",
								textTransform: "uppercase",
								color: T.ember,
							}}
						>
							PRIVATE CHANNEL
						</p>
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 6,
								letterSpacing: "0.2em",
								textTransform: "uppercase",
								color: "rgba(255,255,255,0.2)",
								marginTop: 3,
							}}
						>
							SECURE · ADMIN ↔ ASSISTANT ONLY
						</p>
					</div>
					<div style={{ display: "flex", gap: 14 }}>
						{[
							{ color: T.ember, label: "You (Assistant)" },
							{ color: T.shipped, label: "Admin" },
						].map(({ color, label }) => (
							<div
								key={label}
								style={{ display: "flex", alignItems: "center", gap: 5 }}
							>
								<div
									style={{
										width: 7,
										height: 7,
										borderRadius: "50%",
										background: color,
									}}
								/>
								<span
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 6,
										letterSpacing: "0.12em",
										textTransform: "uppercase",
										color: "rgba(255,255,255,0.25)",
									}}
								>
									{label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* MESSAGES */}
				<div
					ref={scrollRef}
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "14px 18px",
						display: "flex",
						flexDirection: "column",
						gap: 12,
						scrollbarWidth: "thin",
						scrollbarColor: "rgba(236,91,19,0.25) transparent",
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
								opacity: 0.12,
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
									fontSize: 7,
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
									textAlign: "center",
									maxWidth: 240,
									lineHeight: 1.6,
								}}
							>
								Message the admin privately when you need help with a session.
							</p>
						</div>
					)}

					{messages.map((msg, idx) => {
						const isAssistant = msg.sender === "assistant";
						const color = isAssistant ? T.ember : T.shipped;
						return (
							<div
								key={msg.id || idx}
								style={{
									display: "flex",
									justifyContent: isAssistant ? "flex-end" : "flex-start",
									animation: `fadeUp 0.22s ${Math.min(idx * 0.03, 0.25)}s both`,
								}}
							>
								<div
									style={{
										maxWidth: "75%",
										display: "flex",
										flexDirection: "column",
										alignItems: isAssistant ? "flex-end" : "flex-start",
										gap: 4,
									}}
								>
									<p
										style={{
											fontFamily: "'JetBrains Mono',monospace",
											fontSize: 6,
											letterSpacing: "0.2em",
											textTransform: "uppercase",
											color: `${color}70`,
										}}
									>
										{isAssistant ? "YOU" : "ADMIN"}
									</p>
									<div
										style={{
											padding: "11px 15px",
											background: color,
											borderRadius: isAssistant
												? "16px 4px 16px 16px"
												: "4px 16px 16px 16px",
											fontFamily: "'DM Sans',sans-serif",
											fontSize: 12,
											color: "#000",
											lineHeight: 1.65,
											fontWeight: 500,
											wordBreak: "break-word",
										}}
									>
										{msg.content}
									</div>
									<div
										style={{ display: "flex", alignItems: "center", gap: 6 }}
									>
										<p
											style={{
												fontFamily: "'JetBrains Mono',monospace",
												fontSize: 6,
												color: "rgba(255,255,255,0.15)",
												letterSpacing: "0.08em",
											}}
										>
											{new Date(msg.created_at).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
										{/* Read receipt for assistant's own messages */}
										{isAssistant && (
											<p
												style={{
													fontFamily: "'JetBrains Mono',monospace",
													fontSize: 6,
													letterSpacing: "0.08em",
													color: msg.read_at
														? "rgba(236,91,19,0.65)"
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
					})}
				</div>

				{/* INPUT */}
				<div
					style={{
						borderTop: T.sub,
						background: T.obsidian,
						padding: "12px 16px",
						flexShrink: 0,
					}}
				>
					<form onSubmit={send} style={{ display: "flex", gap: 8 }}>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							disabled={sending}
							placeholder="MESSAGE ADMIN PRIVATELY..."
							style={{
								flex: 1,
								background: "rgba(236,91,19,0.04)",
								border: "1px solid rgba(236,91,19,0.18)",
								borderRadius: 11,
								padding: "10px 14px",
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 12,
								color: "rgba(255,255,255,0.85)",
								outline: "none",
								transition: "border-color 200ms",
							}}
							onFocus={(e) =>
								(e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)")
							}
							onBlur={(e) =>
								(e.currentTarget.style.borderColor = "rgba(236,91,19,0.18)")
							}
						/>
						<button
							type="submit"
							disabled={sending || !input.trim()}
							style={{
								background: T.ember,
								border: "none",
								borderRadius: 11,
								padding: "10px 18px",
								cursor: "pointer",
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 9,
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
							color: "rgba(255,255,255,0.08)",
							textAlign: "center",
							marginTop: 8,
						}}
					>
						PRIVATE · SESSION VERIFIED · CLIENT CANNOT SEE THIS
					</p>
				</div>
			</div>
		</>
	);
};

export default AssistantChannelWriter;
