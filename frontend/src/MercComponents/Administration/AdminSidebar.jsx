import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

/* ─── NAV — Supervisor Inbox removed, Admin Channel → Assistant Inbox ── */
const NAV = [
	{ id: "inventory", icon: "inventory_2", label: "Inventory" },
	{ id: "add-product", icon: "add_circle", label: "Add Product" },
	{ id: "requests", icon: "receipt_long", label: "Order Flow" },
	{ id: "messages", icon: "forum", label: "Client Messages" },
	{ id: "channel", icon: "mark_unread_chat_alt", label: "Assistant Inbox" },
	{ id: "analytics", icon: "bar_chart", label: "Analytics" },
];

const AdminSidebar = ({ activeTab, setActiveTab }) => {
	const navigate = useNavigate();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [channelBadge, setChannelBadge] = useState(0);
	const [escalatedBadge, setEscalatedBadge] = useState(0);

	const handleStaffLogout = () => {
		localStorage.removeItem("staffRole");
		localStorage.removeItem("staffEmail");
		navigate("/staff-login?from=admin", { replace: true });
	};

	useEffect(() => {
		const fetchBadges = async () => {
			// Only count UNREAD messages from assistant
			const { count: cc } = await supabase
				.from("verp_private_channel")
				.select("id", { count: "exact", head: true })
				.eq("sender", "assistant")
				.is("read_at", null);
			if (cc !== null) setChannelBadge(cc);

			// Escalated + full_push sessions requiring admin attention
			const { count: ec } = await supabase
				.from("verp_support_sessions")
				.select("id", { count: "exact", head: true })
				.in("status", ["escalated", "full_push"]);
			if (ec !== null) setEscalatedBadge(ec);
		};

		fetchBadges();
		const i = setInterval(fetchBadges, 10000);
		return () => clearInterval(i);
	}, []);

	const getBadge = (id) =>
		id === "channel" ? channelBadge : id === "messages" ? escalatedBadge : 0;
	const getBadgeColor = (id) => (id === "channel" ? "#38bdf8" : "#ef4444");
	const handleNav = (id) => {
		setActiveTab(id);
		setMobileOpen(false);
	};

	const SidebarInner = () => (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				fontFamily: "'DM Sans',sans-serif",
			}}
		>
			{/* LOGO */}
			<div
				style={{
					padding: "24px 18px 18px",
					borderBottom: "1px solid rgba(255,255,255,0.05)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<span
						style={{
							fontFamily: "'Playfair Display',serif",
							fontSize: 30,
							fontStyle: "italic",
							color: "#ec5b13",
						}}
					>
						V
					</span>
					<div>
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 6,
								letterSpacing: "0.35em",
								textTransform: "uppercase",
								color: "rgba(255,255,255,0.2)",
								margin: 0,
							}}
						>
							VAULT ADMIN
						</p>
						<p
							style={{
								fontFamily: "'JetBrains Mono',monospace",
								fontSize: 5,
								letterSpacing: "0.2em",
								textTransform: "uppercase",
								color: "rgba(255,255,255,0.1)",
								margin: 0,
								marginTop: 2,
							}}
						>
							EXECUTIVE INTERFACE
						</p>
					</div>
				</div>
				<button
					onClick={() => setMobileOpen(false)}
					style={{
						display: "none",
						background: "transparent",
						border: "none",
						cursor: "pointer",
						color: "rgba(255,255,255,0.4)",
						padding: 4,
					}}
					className="mobile-close-btn"
				>
					<span className="material-symbols-outlined" style={{ fontSize: 20 }}>
						close
					</span>
				</button>
			</div>

			{/* NAV */}
			<nav
				style={{
					flex: 1,
					padding: "14px 10px",
					display: "flex",
					flexDirection: "column",
					gap: 3,
					overflowY: "auto",
				}}
			>
				{NAV.map((item) => {
					const active = activeTab === item.id;
					const badge = getBadge(item.id);
					const bColor = getBadgeColor(item.id);
					return (
						<button
							key={item.id}
							onClick={() => handleNav(item.id)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 12,
								width: "100%",
								padding: "11px 14px",
								borderRadius: 12,
								border: "none",
								cursor: "pointer",
								transition: "all 200ms",
								background: active ? "#ec5b13" : "transparent",
								color: active ? "#000" : "rgba(255,255,255,0.42)",
								boxShadow: active ? "0 0 24px rgba(236,91,19,0.22)" : "none",
							}}
							onMouseEnter={(e) => {
								if (!active)
									e.currentTarget.style.background = "rgba(255,255,255,0.04)";
							}}
							onMouseLeave={(e) => {
								if (!active) e.currentTarget.style.background = "transparent";
							}}
						>
							<span
								className="material-symbols-outlined"
								style={{ fontSize: 18, flexShrink: 0 }}
							>
								{item.icon}
							</span>
							<span
								style={{
									fontFamily: "'DM Sans',sans-serif",
									fontSize: 9,
									fontWeight: 700,
									letterSpacing: "0.18em",
									textTransform: "uppercase",
									flex: 1,
									textAlign: "left",
								}}
							>
								{item.label}
							</span>
							{badge > 0 && (
								<span
									style={{
										minWidth: 18,
										height: 18,
										borderRadius: 999,
										background: bColor,
										color: "#fff",
										fontFamily: "'JetBrains Mono',monospace",
										fontSize: 8,
										fontWeight: 700,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										padding: "0 4px",
										flexShrink: 0,
									}}
								>
									{badge}
								</span>
							)}
						</button>
					);
				})}
			</nav>

			<div
				style={{
					padding: "16px 18px",
					borderTop: "1px solid rgba(255,255,255,0.05)",
				}}
			>
				<button
					onClick={handleStaffLogout}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
						padding: "10px 0",
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 10,
						cursor: "pointer",
						color: "rgba(255,255,255,0.35)",
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 7,
						letterSpacing: "0.18em",
						textTransform: "uppercase",
						marginBottom: 12,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "rgba(255,255,255,0.04)";
						e.currentTarget.style.color = "rgba(255,255,255,0.5)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "transparent";
						e.currentTarget.style.color = "rgba(255,255,255,0.35)";
					}}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
					Sign out
				</button>
				<p
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 6,
						letterSpacing: "0.25em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.1)",
						textAlign: "center",
					}}
				>
					VERP EXECUTIVE v2
				</p>
			</div>
		</div>
	);

	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @media (max-width:1023px) { .mobile-close-btn { display:flex !important; } }
      `}</style>

			{/* Mobile top bar */}
			<div
				style={{
					display: "none",
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: 60,
					zIndex: 100,
					background: "rgba(8,8,8,0.92)",
					backdropFilter: "blur(20px)",
					borderBottom: "1px solid rgba(255,255,255,0.05)",
					alignItems: "center",
					padding: "0 16px",
					gap: 12,
				}}
				className="mobile-topbar"
			>
				<button
					onClick={() => setMobileOpen(true)}
					style={{
						width: 36,
						height: 36,
						borderRadius: 10,
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.1)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "rgba(255,255,255,0.6)",
					}}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 20 }}>
						menu
					</span>
				</button>
				<span
					style={{
						fontFamily: "'Playfair Display',serif",
						fontSize: 22,
						fontStyle: "italic",
						color: "#ec5b13",
					}}
				>
					V
				</span>
				<span
					style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 8,
						letterSpacing: "0.28em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.3)",
					}}
				>
					ADMIN
				</span>
				{escalatedBadge > 0 && (
					<span
						style={{
							marginLeft: "auto",
							background: "#ef4444",
							color: "white",
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 8,
							fontWeight: 700,
							padding: "4px 10px",
							borderRadius: 999,
						}}
					>
						{escalatedBadge} NEEDS ATTENTION
					</span>
				)}
			</div>

			{mobileOpen && (
				<div
					onClick={() => setMobileOpen(false)}
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.75)",
						backdropFilter: "blur(6px)",
						zIndex: 148,
					}}
				/>
			)}

			<aside
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					height: "100%",
					width: 252,
					zIndex: 150,
					background: "#0a0a0a",
					borderRight: "1px solid rgba(255,255,255,0.05)",
					transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
				}}
				className="admin-sidebar"
			>
				<SidebarInner />
			</aside>

			<style>{`
        @media (max-width:1023px) {
          .admin-sidebar { transform: ${mobileOpen ? "translateX(0)" : "translateX(-100%)"} !important; }
          .mobile-topbar { display:flex !important; }
        }
        @media (min-width:1024px) { .admin-sidebar { transform:translateX(0) !important; } }
      `}</style>
		</>
	);
};

export default AdminSidebar;
