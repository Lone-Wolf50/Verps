import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import { T } from "./Tokens";

const AdminChannel = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput]       = useState("");
	const scrollRef               = useRef(null);

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
		setMessages((prev) => [...prev, { id: Date.now(), sender: "assistant", content, created_at: new Date().toISOString() }]);
		await supabase.from("verp_private_channel").insert([{ sender: "assistant", content }]);
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.void }}>
			{/* Header */}
			<div style={{ padding: "14px 20px", borderBottom: T.borderSub, background: T.obsidian, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
				<span className="material-symbols-outlined" style={{ fontSize: 15, color: T.ember }}>lock</span>
				<div>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: T.ember }}>SECURE CHANNEL</p>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>ASSISTANT ↔ ADMIN — PRIVATE</p>
				</div>
			</div>

			{/* Messages */}
			<div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, scrollbarWidth: "thin", scrollbarColor: "rgba(236,91,19,0.3) transparent" }}>
				{messages.length === 0 && (
					<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: 0.15 }}>
						<span className="material-symbols-outlined" style={{ fontSize: 36 }}>lock</span>
						<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase" }}>NO MESSAGES YET</p>
					</div>
				)}
				{messages.map((msg, idx) => {
					const isMe = msg.sender === "assistant";
					return (
						<div key={idx} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
							<div style={{ maxWidth: "74%", minWidth: 0, display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 4 }}>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: isMe ? "rgba(236,91,19,0.55)" : "rgba(255,255,255,0.22)" }}>
									{isMe ? "YOU" : "ADMIN"}
								</p>
								<div style={{ padding: "11px 15px", background: isMe ? T.ember : "#1a1a1a", border: isMe ? "none" : T.border, borderRadius: isMe ? "15px 4px 15px 15px" : "4px 15px 15px 15px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: isMe ? "#000" : "rgba(255,255,255,0.8)", lineHeight: 1.6, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
									{msg.content}
								</div>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
									{new Date(msg.created_at).toLocaleTimeString()}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Input */}
			<div style={{ borderTop: T.borderSub, background: T.obsidian, padding: "13px 16px", flexShrink: 0 }}>
				<form onSubmit={send} style={{ display: "flex", gap: 8 }}>
					<input value={input} onChange={(e) => setInput(e.target.value)} placeholder="MESSAGE ADMIN (PRIVATE)..." style={{ flex: 1, background: "#111", border: T.border, borderRadius: 11, padding: "10px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", outline: "none" }} />
					<button type="submit" style={{ background: T.ember, border: "none", borderRadius: 11, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#000" }}>
						SEND
					</button>
				</form>
			</div>
		</div>
	);
};

export default AdminChannel;