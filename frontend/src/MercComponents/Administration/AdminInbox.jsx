import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	ember: "#ec5b13",
	shipped: "#38bdf8",
	violet: "#a78bfa",
	live: "#22c55e",
	border: "1px solid rgba(255,255,255,0.06)",
	sub: "1px solid rgba(255,255,255,0.03)",
};

const FROM_CFG = {
	admin: { label: "ADMIN", color: T.ember, icon: "shield_person" },
	assistant: { label: "ASSISTANT", color: T.shipped, icon: "support_agent" },
};

/* ─── MESSAGE ROW ─────────────────────────────────────────────── */
const MessageRow = ({ msg, isSelected, onClick }) => {
	const from = FROM_CFG[msg.from_role] || FROM_CFG.admin;
	const isUnread = !msg.read_at;

	return (
		<div
			onClick={onClick}
			style={{
				padding: "13px 16px",
				borderBottom: T.sub,
				cursor: "pointer",
				transition: "background 150ms",
				background: isSelected ? "rgba(236,91,19,0.06)" : "transparent",
				borderLeft: isSelected
					? `2px solid ${T.ember}`
					: "2px solid transparent",
				display: "flex",
				alignItems: "flex-start",
				gap: 10,
			}}
		>
			{/* Unread indicator */}
			<div
				style={{
					width: 6,
					height: 6,
					borderRadius: "50%",
					background: isUnread ? T.ember : "transparent",
					border: isUnread ? "none" : "1px solid rgba(255,255,255,0.1)",
					flexShrink: 0,
					marginTop: 5,
					animation: isUnread ? "pd 2s ease-in-out infinite" : "none",
				}}
			/>

			<div style={{ flex: 1, minWidth: 0 }}>
				{/* To email */}
				<p
					style={{
						fontFamily: "'DM Sans',sans-serif",
						fontSize: 12,
						fontWeight: isUnread ? 600 : 400,
						color: isUnread ? "white" : "rgba(255,255,255,0.6)",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						marginBottom: 3,
					}}
				>
					{msg.to_email}
				</p>

				{/* Subject */}
				<p
					style={{
						fontFamily: "'DM Sans',sans-serif",
						fontSize: 11,
						color: "rgba(255,255,255,0.35)",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						marginBottom: 5,
					}}
				>
					{msg.subject}
				</p>

				{/* Meta row */}
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 7,
							letterSpacing: "0.15em",
							textTransform: "uppercase",
							color: from.color,
							background: `${from.color}10`,
							border: `1px solid ${from.color}28`,
							padding: "2px 7px",
							borderRadius: 999,
						}}
					>
						{from.label}
					</span>
					<span
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 6,
							color: "rgba(255,255,255,0.18)",
							letterSpacing: "0.1em",
						}}
					>
						{new Date(msg.created_at).toLocaleDateString("en", {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					{isUnread && (
						<span
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 6,
								letterSpacing: "0.15em",
								textTransform: "uppercase",
								color: T.ember,
							}}
						>
							UNREAD
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

/* ─── MESSAGE DETAIL ──────────────────────────────────────────── */
const MessageDetail = ({ msg, isMobile, onBack }) => {
	if (!msg)
		return (
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 12,
					opacity: 0.1,
				}}
			>
				<span className="material-symbols-outlined" style={{ fontSize: 44 }}>
					mark_email_read
				</span>
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8,
						letterSpacing: "0.35em",
						textTransform: "uppercase",
					}}
				>
					SELECT A MESSAGE
				</p>
			</div>
		);

	const from = FROM_CFG[msg.from_role] || FROM_CFG.admin;
	const isUnread = !msg.read_at;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				overflow: "hidden",
			}}
		>
			{/* HEADER */}
			<div
				style={{
					padding: "16px 20px",
					background: T.obsidian,
					borderBottom: T.sub,
					flexShrink: 0,
				}}
			>
				{isMobile && (
					<button
						onClick={onBack}
						style={{
							background: "transparent",
							border: "none",
							cursor: "pointer",
							color: "rgba(255,255,255,0.4)",
							display: "flex",
							alignItems: "center",
							gap: 6,
							marginBottom: 12,
							padding: 0,
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 18 }}
						>
							arrow_back
						</span>
						<span
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 7,
								letterSpacing: "0.2em",
								textTransform: "uppercase",
							}}
						>
							BACK
						</span>
					</button>
				)}

				{/* Sender badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 10,
					}}
				>
					<div
						style={{
							width: 36,
							height: 36,
							borderRadius: "50%",
							background: `${from.color}12`,
							border: `1px solid ${from.color}28`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 17, color: from.color }}
						>
							{from.icon}
						</span>
					</div>
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								marginBottom: 2,
							}}
						>
							<span
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 8,
									letterSpacing: "0.18em",
									textTransform: "uppercase",
									color: from.color,
								}}
							>
								{from.label}
							</span>
							{isUnread && (
								<span
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 6,
										letterSpacing: "0.15em",
										textTransform: "uppercase",
										color: T.ember,
										background: "rgba(236,91,19,0.08)",
										border: "1px solid rgba(236,91,19,0.2)",
										padding: "2px 6px",
										borderRadius: 999,
									}}
								>
									UNREAD BY CLIENT
								</span>
							)}
							{!isUnread && (
								<span
									style={{
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 6,
										letterSpacing: "0.15em",
										textTransform: "uppercase",
										color: T.live,
										background: "rgba(34,197,94,0.08)",
										border: "1px solid rgba(34,197,94,0.2)",
										padding: "2px 6px",
										borderRadius: 999,
									}}
								>
									READ
								</span>
							)}
						</div>
						<p
							style={{
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 11,
								color: "rgba(255,255,255,0.4)",
							}}
						>
							To: {msg.to_email}
						</p>
					</div>
				</div>

				{/* Subject */}
				<h3
					style={{
						fontFamily: "'Playfair Display',serif",
						fontSize: "clamp(16px,2.5vw,20px)",
						fontStyle: "italic",
						fontWeight: 400,
						color: "white",
						lineHeight: 1.3,
					}}
				>
					{msg.subject}
				</h3>

				{/* Timestamp */}
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 7,
						letterSpacing: "0.15em",
						color: "rgba(255,255,255,0.2)",
						marginTop: 6,
					}}
				>
					SENT{" "}
					{new Date(msg.created_at)
						.toLocaleDateString("en", {
							weekday: "short",
							year: "numeric",
							month: "long",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})
						.toUpperCase()}
					{msg.read_at && (
						<span style={{ color: "rgba(34,197,94,0.5)", marginLeft: 14 }}>
							· READ{" "}
							{new Date(msg.read_at)
								.toLocaleDateString("en", {
									month: "short",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
								.toUpperCase()}
						</span>
					)}
				</p>
			</div>

			{/* BODY */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "22px 20px",
					scrollbarWidth: "thin",
					scrollbarColor: "rgba(236,91,19,0.2) transparent",
				}}
			>
				<div
					style={{
						background: "rgba(255,255,255,0.02)",
						border: T.border,
						borderRadius: 14,
						padding: "18px 20px",
					}}
				>
					<p
						style={{
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 13,
							color: "rgba(255,255,255,0.7)",
							lineHeight: 1.8,
							whiteSpace: "pre-wrap",
						}}
					>
						{msg.body}
					</p>
				</div>

				{/* Supervisor note */}
				<div
					style={{
						marginTop: 16,
						padding: "11px 14px",
						background: "rgba(255,255,255,0.01)",
						border: T.sub,
						borderRadius: 10,
						display: "flex",
						alignItems: "center",
						gap: 8,
					}}
				>
					<span
						className="material-symbols-outlined"
						style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}
					>
						info
					</span>
					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 7,
							letterSpacing: "0.18em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.15)",
						}}
					>
						SUPERVISOR VIEW — READ ONLY — CLIENT MANAGES THEIR OWN INBOX
					</p>
				</div>
			</div>
		</div>
	);
};

/* ─── MAIN AdminInbox ─────────────────────────────────────────── */
const AdminInbox = () => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [filter, setFilter] = useState("all"); // all | unread | read
	const [search, setSearch] = useState("");
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const h = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", h);
		return () => window.removeEventListener("resize", h);
	}, []);

	const fetchMessages = useCallback(async () => {
		const { data } = await supabase
			.from("verp_inbox_messages")
			.select("*")
			.order("created_at", { ascending: false });
		if (data) setMessages(data);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchMessages();
		const i = setInterval(fetchMessages, 20000);
		return () => clearInterval(i);
	}, [fetchMessages]);

	/* ── Filter + search ── */
	const filtered = messages.filter((m) => {
		const matchFilter =
			filter === "all" ? true : filter === "unread" ? !m.read_at : !!m.read_at;

		const q = search.toLowerCase();
		const matchSearch =
			!q ||
			m.to_email?.toLowerCase().includes(q) ||
			m.subject?.toLowerCase().includes(q) ||
			m.body?.toLowerCase().includes(q);

		return matchFilter && matchSearch;
	});

	const unreadCount = messages.filter((m) => !m.read_at).length;

	const FILTERS = [
		{ k: "all", l: "All", c: messages.length },
		{ k: "unread", l: "Unread", c: unreadCount },
		{ k: "read", l: "Read", c: messages.length - unreadCount },
	];

	return (
		<>
			<style>{`
        @keyframes pd { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(236,91,19,0.3);border-radius:99px }
      `}</style>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
					background: T.void,
					overflow: "hidden",
					fontFamily: "'DM Sans',sans-serif",
				}}
			>
				{/* ── PAGE HEADER ── */}
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
							flexWrap: "wrap",
							gap: 12,
						}}
					>
						<div>
							<h2
								style={{
									fontFamily: "'Playfair Display',serif",
									fontSize: "clamp(18px,3vw,24px)",
									fontStyle: "italic",
									fontWeight: 400,
									color: "white",
								}}
							>
								Supervisor <span style={{ color: T.ember }}>Inbox</span>
							</h2>
							<p
								style={{
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 7,
									letterSpacing: "0.22em",
									textTransform: "uppercase",
									color: "rgba(255,255,255,0.22)",
									marginTop: 4,
								}}
							>
								ALL CLIENT MESSAGES · READ ONLY VIEW
							</p>
						</div>

						{/* Stats */}
						<div style={{ display: "flex", gap: 10 }}>
							{[
								{
									label: "Total",
									value: messages.length,
									color: "rgba(255,255,255,0.3)",
								},
								{ label: "Unread", value: unreadCount, color: T.ember },
							].map(({ label, value, color }) => (
								<div
									key={label}
									style={{
										padding: "8px 14px",
										background: "rgba(255,255,255,0.03)",
										border: T.sub,
										borderRadius: 10,
										textAlign: "center",
									}}
								>
									<p
										style={{
											fontFamily: "'Playfair Display',serif",
											fontSize: 20,
											fontStyle: "italic",
											color,
										}}
									>
										{value}
									</p>
									<p
										style={{
											fontFamily: "'JetBrains Mono',monospace",
											fontSize: 6,
											letterSpacing: "0.2em",
											textTransform: "uppercase",
											color: "rgba(255,255,255,0.2)",
										}}
									>
										{label}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Search + filters */}
					<div
						style={{
							display: "flex",
							gap: 10,
							marginTop: 14,
							flexWrap: "wrap",
						}}
					>
						{/* Search */}
						<div style={{ position: "relative", flex: 1, minWidth: 180 }}>
							<span
								className="material-symbols-outlined"
								style={{
									position: "absolute",
									left: 10,
									top: "50%",
									transform: "translateY(-50%)",
									fontSize: 15,
									color: "rgba(255,255,255,0.2)",
								}}
							>
								search
							</span>
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search by email, subject, body..."
								style={{
									width: "100%",
									paddingLeft: 32,
									paddingRight: 12,
									paddingTop: 8,
									paddingBottom: 8,
									background: "rgba(255,255,255,0.03)",
									border: T.border,
									borderRadius: 10,
									fontFamily: "'DM Sans',sans-serif",
									fontSize: 12,
									color: "rgba(255,255,255,0.6)",
									outline: "none",
									boxSizing: "border-box",
								}}
							/>
						</div>

						{/* Filter chips */}
						<div style={{ display: "flex", gap: 6 }}>
							{FILTERS.map((f) => (
								<button
									key={f.k}
									onClick={() => setFilter(f.k)}
									style={{
										padding: "7px 14px",
										borderRadius: 999,
										border: "none",
										cursor: "pointer",
										transition: "all 200ms",
										background:
											filter === f.k ? T.ember : "rgba(255,255,255,0.06)",
										color: filter === f.k ? "#000" : "rgba(255,255,255,0.4)",
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 8,
										letterSpacing: "0.15em",
										textTransform: "uppercase",
									}}
								>
									{f.l} · {f.c}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* ── BODY ── */}
				<div
					style={{
						display: "flex",
						flex: 1,
						overflow: "hidden",
						flexDirection: isMobile ? "column" : "row",
					}}
				>
					{/* MESSAGE LIST */}
					<div
						style={{
							width: isMobile ? "100%" : 300,
							background: T.void,
							borderRight: T.sub,
							display: isMobile && selected ? "none" : "flex",
							flexDirection: "column",
							overflow: "hidden",
							flexShrink: 0,
						}}
					>
						<div style={{ flex: 1, overflowY: "auto" }}>
							{loading && (
								<div
									style={{
										display: "flex",
										justifyContent: "center",
										padding: "40px 0",
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
								</div>
							)}

							{!loading && filtered.length === 0 && (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										height: 200,
										gap: 10,
										opacity: 0.12,
									}}
								>
									<span
										className="material-symbols-outlined"
										style={{ fontSize: 32 }}
									>
										inbox
									</span>
									<p
										style={{
											fontFamily: "'JetBrains Mono',monospace",
											fontSize: 7,
											letterSpacing: "0.25em",
											textTransform: "uppercase",
										}}
									>
										EMPTY
									</p>
								</div>
							)}

							{filtered.map((msg) => (
								<MessageRow
									key={msg.id}
									msg={msg}
									isSelected={selected?.id === msg.id}
									onClick={() => setSelected(msg)}
								/>
							))}
						</div>
					</div>

					{/* DETAIL PANEL */}
					<div
						style={{
							flex: 1,
							overflow: "hidden",
							display: isMobile && !selected ? "none" : "flex",
							flexDirection: "column",
						}}
					>
						<MessageDetail
							msg={selected}
							isMobile={isMobile}
							onBack={() => setSelected(null)}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default AdminInbox;
