import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "./Tokens";

const PushModal = ({ session, type, onClose, onDone }) => {
	const [reason, setReason]   = useState("");
	const [sending, setSending] = useState(false);

	const submit = async () => {
		if (!reason.trim()) return;
		setSending(true);
		const newStatus = type === "full" ? "full_push" : "escalated";

		await supabase
			.from("verp_support_sessions")
			.update({ status: newStatus, admin_note: reason, updated_at: new Date().toISOString() })
			.eq("id", session.id);

		const label = type === "full" ? "🚨 FULL ADMIN TAKEOVER REQUESTED" : "⚠️ PARTIAL ESCALATION";
		await supabase.from("verp_private_channel").insert([{
			sender: "assistant",
			content: `${label}\nClient: ${session.client_email}\nReason: ${reason}`,
		}]);

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

	const accentColor = type === "full" ? T.escalated : T.ember;

	return (
		<div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
			<div style={{ background: "#0a0a0a", border: type === "full" ? "1px solid rgba(239,68,68,0.3)" : T.border, borderRadius: 24, padding: "32px 28px", width: "100%", maxWidth: 480, animation: "slideInR 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
				{/* Title row */}
				<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
					<div style={{ width: 44, height: 44, borderRadius: 12, background: `${accentColor}1a`, border: `1px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
						<span className="material-symbols-outlined" style={{ fontSize: 22, color: accentColor }}>
							{type === "full" ? "security" : "flag"}
						</span>
					</div>
					<div>
						<h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontStyle: "italic", color: "white", lineHeight: 1 }}>
							{type === "full" ? "Full Admin Push" : "Escalate to Admin"}
						</h3>
						<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 4, color: `${accentColor}99` }}>
							{type === "full" ? "ADMIN WILL TAKE OVER THE CLIENT CHAT" : "ADMIN WILL BE NOTIFIED PRIVATELY"}
						</p>
					</div>
				</div>

				{type === "full" && (
					<div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: 20 }}>
						<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(239,68,68,0.8)", lineHeight: 1.6 }}>
							The admin will continue this conversation from where you left off. Your chat becomes private between you and the admin.
						</p>
					</div>
				)}

				{/* Reason */}
				<div style={{ marginBottom: 16 }}>
					<label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>
						STATE YOUR REASON
					</label>
					<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Explain the situation clearly..." style={{ width: "100%", background: "#111", border: T.border, borderRadius: 12, padding: "12px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.8)", outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
				</div>

				{/* Actions */}
				<div style={{ display: "flex", gap: 10 }}>
					<button onClick={submit} disabled={sending || !reason.trim()} style={{ flex: 1, padding: "13px", cursor: "pointer", border: "none", borderRadius: 12, background: accentColor, color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 200ms", opacity: !reason.trim() || sending ? 0.4 : 1 }}>
						{sending ? "SENDING..." : type === "full" ? "PUSH TO ADMIN" : "ESCALATE"}
					</button>
					<button onClick={onClose} style={{ padding: "13px 20px", cursor: "pointer", background: "transparent", border: T.border, borderRadius: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", transition: "all 200ms" }}
						onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default PushModal;