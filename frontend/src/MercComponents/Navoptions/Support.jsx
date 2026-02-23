import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import ChatBot from "./ChatBot";
import LiveAssistantChat from "./LiveAssistantChat";
import Swal from "sweetalert2";

const SupportPage = () => {
	const [sessionStatus, setSessionStatus] = useState("bot");
	const [chatId, setChatId] = useState(null);
	const [loading, setLoading] = useState(true);

	/* ── Check for existing session on mount ─────────────────── */
	useEffect(() => {
		const check = async () => {
			const userEmail = localStorage.getItem("userEmail");
			if (!userEmail) {
				setLoading(false);
				return;
			}

			const { data } = await supabase
				.from("verp_support_sessions")
				.select("*")
				.eq("client_email", userEmail)
				.neq("status", "resolved")
				.order("created_at", { ascending: false })
				.maybeSingle();

			if (data) {
				setChatId(data.id);
				setSessionStatus(data.status);
			}
			setLoading(false);
		};
		check();
	}, []);

	/* ── Realtime session status updates ─────────────────────── */
	useEffect(() => {
		if (!chatId) return;
		const channel = supabase
			.channel(`sp-session-${chatId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "verp_support_sessions",
					filter: `id=eq.${chatId}`,
				},
				(payload) => {
					setSessionStatus(payload.new.status);
				},
			)
			.subscribe();
		return () => supabase.removeChannel(channel);
	}, [chatId]);

	/* ── Escalation handler: create session, start connecting ── */
	const handleEscalate = async () => {
		let userEmail = localStorage.getItem("userEmail");
		if (!userEmail) {
			const { value: email } = await Swal.fire({
				title: "IDENTIFICATION REQUIRED",
				html: `<p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.2em;margin-bottom:8px">ENTER YOUR EMAIL TO CONNECT</p>`,
				input: "email",
				inputPlaceholder: "your@email.com",
				background: "#0d0d0d",
				color: "#fff",
				confirmButtonColor: "#ec5b13",
				showCancelButton: true,
				customClass: {
					input: "swal-input-vault",
					popup: "swal-vault",
				},
			});
			if (!email) return;
			userEmail = email;
			localStorage.setItem("userEmail", email);
		}

		const { data, error } = await supabase
			.from("verp_support_sessions")
			.insert([{ client_email: userEmail, status: "waiting" }])
			.select()
			.single();

		if (data) {
			setChatId(data.id);
			setSessionStatus("waiting");
		} else {
			Swal.fire({
				title: "CONNECTION FAILED",
				text: error?.message || "Could not reach the Vault.",
				background: "#0d0d0d",
				color: "#fff",
				icon: "error",
				confirmButtonColor: "#ec5b13",
			});
		}
	};

	/* ── Loading ─────────────────────────────────────────────── */
	if (loading)
		return (
			<div
				style={{
					minHeight: "100vh",
					background: "#080808",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
					gap: 16,
				}}
			>
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: "50%",
						border: "1.5px solid rgba(236,91,19,0.2)",
						borderTopColor: "#ec5b13",
						animation: "spin-ring 1.1s linear infinite",
					}}
				/>
				<style>{`@keyframes spin-ring{to{transform:rotate(360deg)}}`}</style>
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 9,
						letterSpacing: "0.4em",
						color: "rgba(236,91,19,0.6)",
						textTransform: "uppercase",
						animation: "pulse-l 2s ease-in-out infinite",
					}}
				>
					SYNCING
				</p>
				<style>{`@keyframes pulse-l{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
			</div>
		);

	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .swal-vault { border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 20px !important; }
        .swal-input-vault { background:#111 !important; border-color: rgba(255,255,255,0.1) !important;
          color: white !important; font-family:'JetBrains Mono',monospace !important; font-size:12px !important; }
      `}</style>

			<div
				style={{
					minHeight: "100vh",
					background: "#080808",
					paddingTop: 96,
					paddingBottom: 48,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "96px 20px 48px",
				}}
			>
				<div
					style={{
						width: "100%",
						maxWidth: 480,
						height: "calc(100vh - 144px)",
						minHeight: 520,
						maxHeight: 680,
					}}
				>
					{/* ── BOT MODE ── */}
					{sessionStatus === "bot" && (
						<ChatBot onEscalate={handleEscalate} chatId={chatId} />
					)}

					{/* ── WAITING MODE ── */}
					{sessionStatus === "waiting" && (
						<div
							style={{
								height: "100%",
								background: "#080808",
								border: "1px solid rgba(255,255,255,0.06)",
								borderRadius: 28,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: 28,
							}}
						>
							<div style={{ position: "relative", width: 64, height: 64 }}>
								<div
									style={{
										position: "absolute",
										inset: 0,
										borderRadius: "50%",
										border: "1.5px solid rgba(236,91,19,0.1)",
									}}
								/>
								<div
									style={{
										position: "absolute",
										inset: 0,
										borderRadius: "50%",
										border: "1.5px solid transparent",
										borderTopColor: "#ec5b13",
										animation: "spin-ring 1.1s linear infinite",
									}}
								/>
								<style>{`@keyframes spin-ring{to{transform:rotate(360deg)}}`}</style>
								<div
									style={{
										position: "absolute",
										inset: 0,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 22, color: "#ec5b13", opacity: 0.5 }}
									>
										support_agent
									</span>
								</div>
							</div>
							<div
								style={{
									textAlign: "center",
									display: "flex",
									flexDirection: "column",
									gap: 8,
								}}
							>
								<h2
									style={{
										fontFamily: "'Playfair Display',serif",
										fontSize: 24,
										fontStyle: "italic",
										color: "white",
									}}
								>
									Awaiting Agent
								</h2>
								<p
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 9,
										letterSpacing: "0.3em",
										color: "rgba(255,255,255,0.3)",
										textTransform: "uppercase",
										animation: "pulse-l 2s ease-in-out infinite",
									}}
								>
									ESTABLISHING SECURE LINK...
								</p>
							</div>
							<button
								onClick={async () => {
									if (chatId) {
										await supabase
											.from("verp_support_sessions")
											.update({ status: "resolved" })
											.eq("id", chatId);
									}
									setChatId(null);
									setSessionStatus("bot");
								}}
								style={{
									background: "transparent",
									border: "1px solid rgba(239,68,68,0.3)",
									color: "rgba(239,68,68,0.6)",
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 8,
									letterSpacing: "0.2em",
									textTransform: "uppercase",
									padding: "8px 20px",
									borderRadius: 999,
									cursor: "pointer",
									transition: "all 200ms",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "rgba(239,68,68,0.08)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "transparent")
								}
							>
								Leave Queue
							</button>
						</div>
					)}

					{/* ── LIVE MODE ── */}
					{sessionStatus === "live" && chatId && (
						<LiveAssistantChat
							chatId={chatId}
							onSessionEnded={() => setSessionStatus("resolved")}
						/>
					)}

					{/* ── RESOLVED / RATING MODE ── */}
					{sessionStatus === "resolved" && (
						<ChatBot
							mode="rating"
							chatId={chatId}
							onFinishedRating={() => {
								setChatId(null);
								setSessionStatus("bot");
								localStorage.removeItem("vault_chat_history");
								localStorage.removeItem("vault_awaiting_order");
							}}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default SupportPage;
