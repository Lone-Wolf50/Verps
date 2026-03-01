import React from "react";
import LiveAssistantChat from "../Messages/LiveAssistantChat";
import { T, STATUS_CFG } from "./Tokens";
import { Badge } from "./SharredComponents";

/* ─── Session list sidebar ───────────────────────────────────── */
const SessionList = ({ list, title, selectedChat, isMobile, onSelect }) => (
	<div style={{ width: isMobile ? "100%" : 250, background: "#0a0a0a", borderRight: T.borderSub, display: "flex", flexDirection: "column", flexShrink: 0, height: isMobile && selectedChat ? "0" : "100%", overflow: isMobile && selectedChat ? "hidden" : "visible" }}>
		<div style={{ height: 48, borderBottom: T.borderSub, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0 }}>
			<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{title}</span>
			<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: T.ember }}>{list.length}</span>
		</div>
		<div style={{ flex: 1, overflowY: "auto" }}>
			{list.length === 0 && (
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, gap: 8, opacity: 0.15 }}>
					<span className="material-symbols-outlined" style={{ fontSize: 28 }}>inbox</span>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase" }}>EMPTY</p>
				</div>
			)}
			{list.map((s) => {
				const cfg = STATUS_CFG[s.status] || STATUS_CFG.resolved;
				const isSel = selectedChat?.id === s.id;
				return (
					<div key={s.id} onClick={() => onSelect(s)} style={{ padding: "13px 14px", borderBottom: T.borderSub, cursor: "pointer", background: isSel ? "rgba(236,91,19,0.06)" : "transparent", borderLeft: isSel ? `2px solid ${T.ember}` : "2px solid transparent", transition: "all 150ms" }}>
						<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
							<div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0, animation: cfg.pulse ? "pd 2s ease-in-out infinite" : "none" }} />
							<Badge status={s.status} />
						</div>
						<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{s.client_email}
						</p>
						<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>
							{new Date(s.created_at).toLocaleTimeString()}
						</p>
					</div>
				);
			})}
		</div>
	</div>
);

/* ─── Inbox Tab ──────────────────────────────────────────────── */
const InboxTab = ({ liveSessions, selectedChat, isMobile, onSelect, onClearSelected, onEscalate, onFullPush, onResolve }) => (
	<div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
		<SessionList list={liveSessions} title="LIVE SESSIONS" selectedChat={selectedChat} isMobile={isMobile} onSelect={onSelect} />

		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			{selectedChat ? (
				<>
					{/* Action bar */}
					<div style={{ height: 52, background: T.obsidian, borderBottom: T.borderSub, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", flexShrink: 0, gap: 8 }}>
						<div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
							{isMobile && (
								<button onClick={onClearSelected} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
									<span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
								</button>
							)}
							<Badge status={selectedChat.status} />
							<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 100 : 200 }}>
								{selectedChat.client_email}
							</span>
						</div>
						<div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
							<button onClick={() => onEscalate(selectedChat)} style={{ background: "rgba(236,91,19,0.08)", border: `1px solid rgba(236,91,19,0.35)`, color: "rgba(236,91,19,0.85)", borderRadius: 9, padding: "7px 10px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", transition: "all 200ms", whiteSpace: "nowrap" }} title="Notify admin (you keep the chat)">
								Escalate
							</button>
							<button onClick={() => onFullPush(selectedChat)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(239,68,68,0.85)", borderRadius: 9, padding: "7px 10px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", transition: "all 200ms", whiteSpace: "nowrap" }} title="Hand full control to admin">
								Full Push
							</button>
							<button onClick={() => onResolve(selectedChat.id)} style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", color: "rgba(34,197,94,0.8)", borderRadius: 9, padding: "7px 10px", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.16em", textTransform: "uppercase", transition: "all 200ms" }}>
								Resolve
							</button>
						</div>
					</div>
					<div style={{ flex: 1, overflow: "hidden" }}>
						<LiveAssistantChat chatId={selectedChat.id} role="assistant" compact />
					</div>
				</>
			) : (
				<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, opacity: 0.15 }}>
					<span className="material-symbols-outlined" style={{ fontSize: 40 }}>forum</span>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase" }}>SELECT A SESSION</p>
				</div>
			)}
		</div>
	</div>
);

export default InboxTab;