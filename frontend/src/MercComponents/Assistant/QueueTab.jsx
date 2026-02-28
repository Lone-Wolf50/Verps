import React from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { T } from "./Tokens";
import { Badge } from "./SharredComponents";

const QueueTab = ({ waitingSessions, onRefresh }) => (
	<div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
		<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
			CLEARANCE REQUESTS
		</p>

		{waitingSessions.length === 0 && (
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12, opacity: 0.15 }}>
				<span className="material-symbols-outlined" style={{ fontSize: 36 }}>done_all</span>
				<p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontStyle: "italic", color: "white" }}>All Clear</p>
			</div>
		)}

		{waitingSessions.map((s, idx) => (
			<div key={s.id} style={{ background: T.obsidian, border: T.border, borderRadius: 15, padding: "16px 20px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, animation: `fadeUp 0.3s ${idx * 0.06}s both` }}>
				<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
					<Badge status="waiting" />
					<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "white", marginTop: 4 }}>{s.client_email}</p>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
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
							background: "#0a0a0a", color: "#fff",
							showCancelButton: true,
							confirmButtonColor: "#ec5b13",
							cancelButtonColor: "#1c1c1c",
							confirmButtonText: "Start session",
							customClass: { popup: "rounded-2xl border border-white/10", input: "vault-agent-name-input" },
						});
						if (!agentName || !agentName.trim()) return;
						const name = agentName.trim();
						await supabase.from("verp_support_sessions").update({ status: "live", updated_at: new Date().toISOString() }).eq("id", s.id);
						const greeting = `Hello, my name is ${name} from Verp support. How can I help you today?`;
						await supabase.from("verp_chat_messages").insert([{ chat_id: s.id, sender_role: "assistant", content: greeting }]);
						onRefresh();
					}}
					style={{ background: T.ember, border: "none", borderRadius: 11, padding: "10px 22px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#000", transition: "filter 200ms" }}
					onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
					onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
				>
					GRANT ACCESS
				</button>
			</div>
		))}
	</div>
);

export default QueueTab;