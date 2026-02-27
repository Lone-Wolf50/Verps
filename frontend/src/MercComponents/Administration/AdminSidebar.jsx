import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const NAV = [
	{ id: "inventory",   icon: "inventory_2",         label: "Inventory"       },
	{ id: "add-product", icon: "add_circle",           label: "Add Product"     },
	{ id: "requests",    icon: "receipt_long",         label: "Order Flow"      },
	{ id: "messages",    icon: "forum",                label: "Client Messages" },
	{ id: "channel",     icon: "mark_unread_chat_alt", label: "Assistant Inbox" },
	{ id: "analytics",   icon: "bar_chart",            label: "Analytics"       },
	{ id: "broadcasts",  icon: "campaign",             label: "Broadcasts"      },
];

// Export so AdminLayout can read the collapsed width for its margin
export const SIDEBAR_COLLAPSED_W = 64;
export const SIDEBAR_EXPANDED_W  = 240;

const AdminSidebar = ({ activeTab, setActiveTab }) => {
	const navigate = useNavigate();
	const [hovered, setHovered]               = useState(false);
	const [mobileOpen, setMobileOpen]         = useState(false);
	const [channelBadge, setChannelBadge]     = useState(0);
	const [escalatedBadge, setEscalatedBadge] = useState(0);

	const handleStaffLogout = () => {
		localStorage.removeItem("staffRole");
		localStorage.removeItem("staffEmail");
		navigate("/staff-login?from=admin", { replace: true });
	};

	useEffect(() => {
		const fetchBadges = async () => {
			const { count: cc } = await supabase
				.from("verp_private_channel")
				.select("id", { count: "exact", head: true })
				.eq("sender", "assistant")
				.is("read_at", null);
			if (cc !== null) setChannelBadge(cc);

			const { count: ec } = await supabase
				.from("verp_support_sessions")
				.select("id", { count: "exact", head: true })
				.in("status", ["escalated", "full_push"]);
			if (ec !== null) setEscalatedBadge(ec);
		};
		fetchBadges();
		const iv = setInterval(fetchBadges, 10000);
		return () => clearInterval(iv);
	}, []);

	const getBadge      = (id) => id === "channel" ? channelBadge : id === "messages" ? escalatedBadge : 0;
	const getBadgeColor = (id) => id === "channel" ? "#38bdf8" : "#ef4444";

	/* ── Sidebar inner content — used by both rail & mobile drawer ── */
	const SidebarInner = ({ showLabels = false, onClose }) => (
		<div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans',sans-serif" }}>

			{/* ── Logo ── */}
			<div style={{
				height: 64,
				padding: "0 16px",
				borderBottom: "1px solid rgba(255,255,255,0.05)",
				display: "flex",
				alignItems: "center",
				gap: 10,
				overflow: "hidden",
				flexShrink: 0,
			}}>
				<span style={{
					fontFamily: "'Playfair Display',serif",
					fontSize: 24,
					fontStyle: "italic",
					color: "#ec5b13",
					flexShrink: 0,
					lineHeight: 1,
				}}>
					V
				</span>

				{/* Labels fade in when expanded */}
				<div style={{
					overflow: "hidden",
					opacity: showLabels ? 1 : 0,
					transform: showLabels ? "translateX(0)" : "translateX(-8px)",
					transition: "opacity 200ms, transform 200ms",
					pointerEvents: "none",
					whiteSpace: "nowrap",
				}}>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: 0 }}>
						VAULT ADMIN
					</p>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)", margin: "2px 0 0" }}>
						EXECUTIVE INTERFACE
					</p>
				</div>

				{/* Close button on mobile drawer */}
				{onClose && (
					<button
						onClick={onClose}
						style={{
							marginLeft: "auto",
							background: "transparent",
							border: "none",
							cursor: "pointer",
							color: "rgba(255,255,255,0.3)",
							padding: 4,
							display: "flex",
							alignItems: "center",
							flexShrink: 0,
						}}
					>
						<span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
					</button>
				)}
			</div>

			{/* ── Nav items ── */}
			<nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
				{NAV.map((item) => {
					const active = activeTab === item.id;
					const badge  = getBadge(item.id);
					const bColor = getBadgeColor(item.id);
					return (
						<button
							key={item.id}
							title={!showLabels ? item.label : undefined}
							onClick={() => { setActiveTab(item.id); if (onClose) onClose(); }}
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: showLabels ? "flex-start" : "center",
								gap: showLabels ? 11 : 0,
								width: "100%",
								padding: "10px 0",
								paddingLeft: showLabels ? 12 : 0,
								paddingRight: showLabels ? 10 : 0,
								borderRadius: 10,
								border: "none",
								cursor: "pointer",
								transition: "background 150ms, color 150ms",
								background: active ? "#ec5b13" : "transparent",
								color: active ? "#000" : "rgba(255,255,255,0.45)",
								boxShadow: active ? "0 0 16px rgba(236,91,19,0.18)" : "none",
								position: "relative",
								flexShrink: 0,
							}}
							onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
							onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
						>
							<span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>

							{/* Label */}
							<span style={{
								fontFamily: "'DM Sans',sans-serif",
								fontSize: 9,
								fontWeight: 700,
								letterSpacing: "0.16em",
								textTransform: "uppercase",
								flex: 1,
								textAlign: "left",
								whiteSpace: "nowrap",
								overflow: "hidden",
								opacity: showLabels ? 1 : 0,
								transform: showLabels ? "translateX(0)" : "translateX(-6px)",
								transition: "opacity 180ms, transform 180ms",
								pointerEvents: "none",
							}}>
								{item.label}
							</span>

							{/* Badge */}
							{badge > 0 && (
								<span style={{
									position: showLabels ? "relative" : "absolute",
									top:   showLabels ? undefined : 6,
									right: showLabels ? undefined : 6,
									minWidth: 14,
									height: 14,
									borderRadius: 999,
									background: bColor,
									color: "#fff",
									fontFamily: "'JetBrains Mono',monospace",
									fontSize: 7,
									fontWeight: 700,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: "0 3px",
									flexShrink: 0,
								}}>
									{badge}
								</span>
							)}
						</button>
					);
				})}
			</nav>

			{/* ── Footer / sign-out ── */}
			<div style={{ padding: "12px 8px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
				<button
					onClick={handleStaffLogout}
					title={!showLabels ? "Sign out" : undefined}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: showLabels ? 7 : 0,
						padding: "9px 0",
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.07)",
						borderRadius: 9,
						cursor: "pointer",
						color: "rgba(255,255,255,0.28)",
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 7,
						letterSpacing: "0.18em",
						textTransform: "uppercase",
						marginBottom: showLabels ? 10 : 0,
						transition: "background 150ms, color 150ms",
					}}
					onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
					onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.28)"; }}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
					<span style={{
						opacity: showLabels ? 1 : 0,
						transition: "opacity 180ms",
						overflow: "hidden",
						maxWidth: showLabels ? 80 : 0,
					}}>
						Sign out
					</span>
				</button>

				{showLabels && (
					<p style={{
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 6,
						letterSpacing: "0.25em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.08)",
						textAlign: "center",
						marginTop: 2,
					}}>
						VERP EXECUTIVE v2
					</p>
				)}
			</div>
		</div>
	);

	return (
		<>
			{/* ══════════════════════════════════════════════════════
			    DESKTOP (lg+) — fixed icon-rail, hover to expand
			══════════════════════════════════════════════════════ */}
			<aside
				className="hidden lg:block"
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					height: "100%",
					width: hovered ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
					zIndex: 150,
					background: "#0a0a0a",
					borderRight: "1px solid rgba(255,255,255,0.05)",
					transition: "width 260ms cubic-bezier(0.16,1,0.3,1)",
					overflow: "hidden",
					/* Subtle shadow when expanded to feel like a layer above content */
					boxShadow: hovered ? "4px 0 32px rgba(0,0,0,0.6)" : "none",
				}}
			>
				<SidebarInner showLabels={hovered} />
			</aside>

			{/* ══════════════════════════════════════════════════════
			    MOBILE / TABLET (< lg) — topbar + slide-in drawer
			══════════════════════════════════════════════════════ */}

			{/* Top bar */}
			<div
				className="lg:hidden fixed top-0 left-0 right-0 z-[100] flex items-center gap-3 px-4"
				style={{
					height: 56,
					background: "rgba(8,8,8,0.96)",
					backdropFilter: "blur(20px)",
					borderBottom: "1px solid rgba(255,255,255,0.05)",
				}}
			>
				<button
					onClick={() => setMobileOpen(true)}
					style={{
						width: 32,
						height: 32,
						borderRadius: 8,
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.09)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "rgba(255,255,255,0.55)",
					}}
				>
					<span className="material-symbols-outlined" style={{ fontSize: 17 }}>menu</span>
				</button>
				<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontStyle: "italic", color: "#ec5b13" }}>V</span>
				<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
					ADMIN
				</span>
				{escalatedBadge > 0 && (
					<span style={{
						marginLeft: "auto",
						background: "#ef4444",
						color: "white",
						fontFamily: "'JetBrains Mono',monospace",
						fontSize: 7,
						fontWeight: 700,
						padding: "3px 9px",
						borderRadius: 999,
					}}>
						{escalatedBadge} NEEDS ATTENTION
					</span>
				)}
			</div>

			{/* Backdrop */}
			{mobileOpen && (
				<div
					className="lg:hidden"
					onClick={() => setMobileOpen(false)}
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.72)",
						backdropFilter: "blur(4px)",
						zIndex: 148,
					}}
				/>
			)}

			{/* Drawer */}
			<div
				className="lg:hidden"
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					height: "100%",
					width: SIDEBAR_EXPANDED_W,
					zIndex: 150,
					background: "#0a0a0a",
					borderRight: "1px solid rgba(255,255,255,0.05)",
					transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
					transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
				}}
			>
				<SidebarInner showLabels onClose={() => setMobileOpen(false)} />
			</div>
		</>
	);
};

export default AdminSidebar;