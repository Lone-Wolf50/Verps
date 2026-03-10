import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { T, ORDER_STATUSES } from "./Tokens";
import { OrderBadge } from "./SharredComponents";

/* ─── CUSTOMER INFO PANEL ────────────────────────────────────── */
/* Fetches rich profile from verp_users_details, falls back to order row */
const CustomerInfoPanel = ({ order }) => {
	const email = order?.customer_email || order?.client_email || order?.email;
	const deliveryName = order?.delivery_name || order?.customer_name || null;

	const [profile, setProfile] = useState(null);
	const [profileLoading, setProfileLoading] = useState(true);

	useEffect(() => {
		if (!email) { setProfileLoading(false); return; }
		const fetch = async () => {
			setProfileLoading(true);
			try {
				// Join via verp_users to get the user_id, then fetch verp_users_details
				const { data: userRow } = await supabase
					.from("verp_users")
					.select("id")
					.eq("email", email)
					.maybeSingle();

				if (userRow?.id) {
					const { data: details } = await supabase
						.from("verp_users_details")
						.select("*")
						.eq("user_id", userRow.id)
						.maybeSingle();
					setProfile(details || null);
				}
			} catch (_) {}
			setProfileLoading(false);
		};
		fetch();
	}, [email]);

	const InfoRow = ({ icon, label, value, iconColor }) => {
		if (!value) return null;
		return (
			<div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
				<div style={{
					width: 28, height: 28, borderRadius: 8,
					background: `${iconColor || T.ember}12`,
					border: `1px solid ${iconColor || T.ember}28`,
					display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1
				}}>
					<span className="material-symbols-outlined" style={{ fontSize: 13, color: iconColor || T.ember }}>{icon}</span>
				</div>
				<div style={{ minWidth: 0 }}>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 2 }}>{label}</p>
					<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.45, wordBreak: "break-word" }}>{value}</p>
				</div>
			</div>
		);
	};

	// Merge: prefer verp_users_details values, fall back to order row values
	const phone   = profile?.phone    || order?.customer_phone || null;
	const address = profile?.address  || order?.address        || null;
	const bio     = profile?.bio      || null;
	const location = order?.location  || null;
	const avatarUrl = profile?.avtar_url || null; // Note: DB column is "avtar_url" per schema
	const displayName = deliveryName || email || "?";
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<div style={{
			background: "linear-gradient(135deg, rgba(236,91,19,0.04) 0%, rgba(236,91,19,0.01) 100%)",
			border: "1px solid rgba(236,91,19,0.15)",
			borderRadius: 16, padding: "16px 14px",
			display: "flex", flexDirection: "column", gap: 14,
		}}>
			{/* Section label */}
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: T.ember }}>
					CLIENT PROFILE
				</p>
				{profileLoading && (
					<div style={{
						width: 14, height: 14, borderRadius: "50%",
						border: `1.5px solid rgba(236,91,19,0.2)`,
						borderTopColor: T.ember,
						animation: "spin 0.8s linear infinite",
					}} />
				)}
			</div>

			{/* Avatar + name/email */}
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<div style={{
					width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
					background: avatarUrl ? "transparent" : "linear-gradient(135deg, rgba(236,91,19,0.25), rgba(236,91,19,0.1))",
					border: avatarUrl ? "2px solid rgba(236,91,19,0.4)" : "1.5px solid rgba(236,91,19,0.3)",
					display: "flex", alignItems: "center", justifyContent: "center",
					overflow: "hidden",
					boxShadow: "0 0 16px rgba(236,91,19,0.12)",
				}}>
					{avatarUrl ? (
						<img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />
					) : (
						<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, fontStyle: "italic", color: T.ember }}>{initial}</span>
					)}
				</div>
				<div style={{ minWidth: 0, flex: 1 }}>
					{deliveryName && (
						<p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontStyle: "italic", color: "white", lineHeight: 1.25, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{deliveryName}
						</p>
					)}
					<p style={{
						fontFamily: "'JetBrains Mono',monospace", fontSize: 7,
						color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em",
						overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
					}}>
						{email || "—"}
					</p>
					{bio && (
						<p style={{
							fontFamily: "'DM Sans',sans-serif", fontSize: 10,
							color: "rgba(255,255,255,0.35)", fontStyle: "italic",
							marginTop: 4, lineHeight: 1.4,
							overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
						}}>
							{bio}
						</p>
					)}
				</div>
			</div>

			{/* Divider */}
			<div style={{ height: 1, background: "rgba(255,255,255,0.04)", borderRadius: 1 }} />

			{/* Details rows */}
			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<InfoRow icon="call"        label="Phone"            value={phone}    iconColor={T.live} />
				<InfoRow icon="location_on" label="Location"         value={location} iconColor={T.shipped} />
				<InfoRow icon="home"        label="Delivery Address" value={address}  iconColor="#a855f7" />
			</div>

			{/* No profile data notice */}
			{!profileLoading && !profile && !phone && !address && (
				<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.15)", letterSpacing: "0.18em", textAlign: "center", paddingTop: 2 }}>
					NO EXTENDED PROFILE ON FILE
				</p>
			)}

			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);
};

/* ─── ORDERS TAB ─────────────────────────────────────────────── */
const OrdersTab = () => {
	const [orders, setOrders]       = useState([]);
	const [view, setView]           = useState("incoming");
	const [selected, setSelected]   = useState(null);
	const [newStatus, setNewStatus] = useState("");
	const [privateMsg, setPrivateMsg] = useState("");
	const [busy, setBusy]           = useState(false);

	const INCOMING = ["ordered", "pending", "processing", "shipped"];
	const OUTGOING = ["delivered", "returned", "cancelled"];

	useEffect(() => {
		const load = async () => {
			const { data } = await supabase.from("verp_orders").select("*").order("created_at", { ascending: false });
			if (data) setOrders(data);
		};
		load();
		const i = setInterval(load, 10000);
		return () => clearInterval(i);
	}, []);

	const filtered = orders.filter((o) =>
		view === "incoming"
			? INCOMING.includes(o.status?.toLowerCase())
			: OUTGOING.includes(o.status?.toLowerCase()),
	);

	/* Statuses that send a client notification email */
	const EMAIL_TRIGGER_STATUSES = new Set(["shipped", "delivered", "cancelled", "returned"]);

	const STATUS_COLOR_MAP = {
		ordered: "#a855f7", pending: "#eab308", processing: "#0ea5e9",
		shipped: "#10b981", delivered: "#ec5b13", returned: "#f43f5e", cancelled: "#64748b",
	};

	const STATUS_EMAIL_SUBJECT = {
		shipped:   (n) => `Your Order ${n} Has Shipped 🚚`,
		delivered: (n) => `Your Order ${n} Has Been Delivered ✅`,
		cancelled: (n) => `Order ${n} — Cancellation Confirmed`,
		returned:  (n) => `Return Initiated for Order ${n}`,
	};

	const buildStatusHTML = (order, status) => {
		const color = STATUS_COLOR_MAP[status] || "#ec5b13";
		const cfg = {
			shipped:   { icon:"🚚", headline:"Your Order Is On Its Way",      body:`Your order <strong style="color:${color}">${order.order_number}</strong> has been dispatched and is heading to you. Our team has carefully packaged your items and handed them to our delivery partner.`, note:"Thank you for choosing us. We hope you love every piece." },
			delivered: { icon:"✅", headline:"Order Delivered",                body:`Your order <strong style="color:${color}">${order.order_number}</strong> has been successfully delivered. We hope the experience has been exceptional from start to finish.`, note:"We'd love to hear what you think — your feedback means the world to us." },
			cancelled: { icon:"❌", headline:"Order Cancellation Notice",       body:`Your order <strong style="color:${color}">${order.order_number}</strong> has been cancelled. Any applicable refund will be processed within 3–5 business days.`, note:"We're sorry this order didn't work out. We hope to serve you again." },
			returned:  { icon:"↩️", headline:"Return Initiated",               body:`Your return request for order <strong style="color:${color}">${order.order_number}</strong> has been initiated. Once processed, your refund will be issued within 5–7 business days.`, note:"We appreciate your patience and are committed to making this right." },
		};
		const c = cfg[status];
		if (!c) return null;
		const name   = order.delivery_name || order.customer_name || order.client_email || order.email || "Valued Client";
		const amount = Number(order.total_amount || 0).toLocaleString();
		return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;min-height:100vh;">
<tr><td align="center" style="padding:40px 20px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr><td align="center" style="padding-bottom:28px;"><p style="margin:0;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.42em;text-transform:uppercase;color:rgba(255,255,255,0.15);">VERP EXECUTIVE COLLECTION</p></td></tr>
    <tr><td style="background:linear-gradient(135deg,#0d0d0d,#111);border-radius:24px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="height:3px;background:linear-gradient(90deg,${color},transparent);"></td></tr>
        <tr><td style="background:linear-gradient(135deg,${color}14,${color}04);padding:28px 36px 22px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0 0 9px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.38em;text-transform:uppercase;color:${color};">STATUS: ${status.toUpperCase()}</p><p style="margin:0 0 7px;font-size:25px;font-weight:300;color:#fff;">${c.headline}</p></td>
            <td align="right" valign="middle" style="padding-left:16px;width:50px;"><div style="font-size:36px;line-height:1;text-align:center;display:block;">${c.icon}</div></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:20px 36px;border-bottom:1px solid rgba(255,255,255,0.04);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.22);">ORDER</p><p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:${color};font-weight:700;">${order.order_number || "—"}</p></td>
            <td align="right"><p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.22);">VALUE</p><p style="margin:0;font-size:18px;font-weight:700;color:${color};">GH₵ ${amount}</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:24px 36px 18px;"><p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.82);line-height:1.7;">Dear <strong style="color:#fff;">${name}</strong>,</p><p style="margin:0;font-size:13px;color:rgba(255,255,255,0.58);line-height:1.85;">${c.body}</p></td></tr>
        <tr><td style="padding:0 36px 24px;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);font-style:italic;border-left:2px solid ${color}35;padding-left:14px;">${c.note}</p></td></tr>
        <tr><td style="padding:0 36px 28px;"><table cellpadding="0" cellspacing="0"><tr><td style="background:${color}16;border:1px solid ${color}45;border-radius:999px;padding:6px 18px;"><p style="margin:0;font-family:'Courier New',monospace;font-size:8px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${color};">STATUS: ${status.toUpperCase()}</p></td></tr></table></td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:28px 20px 0;"><p style="margin:0;font-size:10px;color:rgba(255,255,255,0.08);line-height:1.7;">Automated message from Verp. For questions, contact our support team.</p></td></tr>
  </table>
</td></tr>
</table></body></html>`;
	};

	const applyStatus = async () => {
		if (!selected || !newStatus) return;
		setBusy(true);

		await supabase.from("verp_orders").update({ status: newStatus }).eq("id", selected.id);
		setOrders((prev) => prev.map((o) => (o.id === selected.id ? { ...o, status: newStatus } : o)));
		setSelected((prev) => ({ ...prev, status: newStatus }));

		/* Send client email for trigger statuses */
		if (EMAIL_TRIGGER_STATUSES.has(newStatus)) {
			const toEmail = selected.customer_email || selected.client_email || selected.email;
			const html    = buildStatusHTML(selected, newStatus);
			if (toEmail && html) {
				try {
					
await fetch(`${import.meta.env.VITE_API_URL}/api/send-email`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-internal-secret": import.meta.env.VITE_INTERNAL_SECRET ?? "",
						},
						body: JSON.stringify({
							to: toEmail,
							subject: STATUS_EMAIL_SUBJECT[newStatus]?.(selected.order_number) || `Order Update: ${newStatus}`,
							html,
						}),
					});
				} catch (err) {
  console.error("[applyStatus] Email send failed:", err);
}
			}
		}

		setBusy(false);
	};

	const sendPrivate = async () => {
		if (!selected || !privateMsg.trim()) return;
		setBusy(true);
		const toEmail = selected.customer_email || selected.client_email || selected.email || null;
		if (!toEmail) {
			setBusy(false);
			Swal.fire({ title: "No Email Found", text: "This order has no customer email on record.", icon: "error", background: T.obsidian, color: "#fff" });
			return;
		}
		const { error } = await supabase.from("verp_inbox_messages").insert([{
			to_email: toEmail,
			from_role: "assistant",
			subject: `Update on Order ${selected.order_number}`,
			body: privateMsg,
		}]);
		setPrivateMsg("");
		setBusy(false);
		if (error) {
			Swal.fire({ title: "Error", text: error.message, icon: "error", background: T.obsidian, color: "#fff" });
			return;
		}
		Swal.fire({ title: "Sent!", text: "Client will see this in their Inbox.", background: T.obsidian, color: "#fff", icon: "success", timer: 2000, showConfirmButton: false });
	};

	return (
		<div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: "column" }}>
			{/* ── Pipeline header ── */}
			<div style={{ height: 52, background: T.obsidian, borderBottom: T.borderSub, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
				<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>ORDER PIPELINE</span>
				<div style={{ display: "inline-flex", background: "#111", border: T.border, borderRadius: 999, padding: 3, gap: 2, marginLeft: "auto" }}>
					{["incoming", "outgoing"].map((v) => (
						<button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", background: view === v ? T.ember : "transparent", color: view === v ? "#000" : "rgba(255,255,255,0.35)", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 200ms" }}>
							{v}
						</button>
					))}
				</div>
			</div>

			<div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
				{/* ── Order list ── */}
				<div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
					{filtered.length === 0 && (
						<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, flexDirection: "column", gap: 10, opacity: 0.15 }}>
							<span className="material-symbols-outlined" style={{ fontSize: 32 }}>inventory_2</span>
							<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase" }}>NO ORDERS</p>
						</div>
					)}
					{filtered.map((order, idx) => (
						<div
							key={order.id}
							onClick={() => { setSelected(order); setNewStatus(order.status || ""); }}
							className="at-order-card"
							style={{ display: "block", animationDelay: `${idx * 0.04}s`, background: selected?.id === order.id ? "rgba(236,91,19,0.05)" : "", borderColor: selected?.id === order.id ? "rgba(236,91,19,0.3)" : "" }}
						>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
								<div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
									<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{order.delivery_name || order.customer_name || order.customer_email || order.client_email || "—"}
									</p>
									<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 2, letterSpacing: "0.08em" }}>
										{order.order_number || "—"} · {new Date(order.created_at).toLocaleDateString()}
									</p>
									{/* Phone + location inline */}
									{(order.customer_phone || order.location) && (
										<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", marginTop: 3, display: "flex", gap: 10 }}>
											{order.customer_phone && <span>📞 {order.customer_phone}</span>}
											{order.location && <span>📍 {order.location}</span>}
										</p>
									)}
								</div>
								<OrderBadge status={order.status} />
							</div>
							{/* Product image strip */}
							{(() => {
								let items = [];
								try { items = typeof order.items === "string" ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []); } catch (_) {}
								if (!items.length) return null;
								return (
									<div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
										{items.slice(0, 5).map((item, i) => (
											<div key={i} style={{ position: "relative", flexShrink: 0 }}>
												{item.image ? (
													<img src={item.image} alt={item.name || ""} title={`${item.name || ""} × ${item.quantity || 1}`} style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }} onError={e => { e.currentTarget.style.display = "none"; }} />
												) : (
													<div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
														<span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>image</span>
													</div>
												)}
												{(item.quantity || 1) > 1 && (
													<span style={{ position: "absolute", top: -5, right: -5, width: 15, height: 15, borderRadius: "50%", background: T.ember, color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.quantity}</span>
												)}
											</div>
										))}
										{items.length > 5 && (
											<div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
												+{items.length - 5}
											</div>
										)}
									</div>
								);
							})()}
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontStyle: "italic", color: T.ember }}>
									₵{Number(order.total_amount || 0).toLocaleString()}
								</span>
								<span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.2)" }}>chevron_right</span>
							</div>
						</div>
					))}
				</div>

				{/* ── Detail panel ── */}
				{selected && (
					<div style={{ width: 300, background: T.obsidian, borderLeft: T.borderSub, display: "flex", flexDirection: "column", flexShrink: 0, animation: "slideInR 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
						{/* Panel header */}
						<div style={{ padding: "18px 18px 14px", borderBottom: T.borderSub, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<div>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: T.ember, letterSpacing: "0.22em" }}>{selected.order_number}</p>
								<OrderBadge status={selected.status} />
							</div>
							<button onClick={() => setSelected(null)} style={{ background: "transparent", border: T.border, borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
								<span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
							</button>
						</div>

						<div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
							{/* ── Customer profile ── */}
							<CustomerInfoPanel order={selected} />

							{/* ── Order date + product images ── */}
							<div>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>
									{new Date(selected.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(selected.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
								</p>
								{(() => {
									let items = [];
									try { items = typeof selected.items === "string" ? JSON.parse(selected.items) : (Array.isArray(selected.items) ? selected.items : []); } catch (_) {}
									if (!items.length) return null;
									return (
										<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
											{items.slice(0, 5).map((item, i) => (
												<div key={i} style={{ position: "relative", flexShrink: 0 }}>
													{item.image ? (
														<img src={item.image} alt={item.name || "item"} title={`${item.name || ""} × ${item.quantity || 1}`} style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)" }} onError={e => { e.currentTarget.style.display = "none"; }} />
													) : (
														<div style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
															<span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.2)" }}>image</span>
														</div>
													)}
													{(item.quantity || 1) > 1 && (
														<span style={{ position: "absolute", top: -5, right: -5, width: 15, height: 15, borderRadius: "50%", background: T.ember, color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.quantity}</span>
													)}
												</div>
											))}
											{items.length > 5 && (
												<div style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
													+{items.length - 5}
												</div>
											)}
										</div>
									);
								})()}
							</div>

							{/* ── Status update ── */}
							<div>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>UPDATE STATUS</p>
								<div style={{ position: "relative" }}>
									<select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: "100%", background: "#111", border: T.border, borderRadius: 11, padding: "10px 14px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, textTransform: "uppercase", color: T.ember, outline: "none", cursor: "pointer", appearance: "none" }}>
										{ORDER_STATUSES.map((s) => (
											<option key={s} value={s}>{s.toUpperCase()}</option>
										))}
									</select>
									<span className="material-symbols-outlined" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>expand_more</span>
								</div>
								<button onClick={applyStatus} disabled={busy} style={{ marginTop: 8, width: "100%", padding: "10px", background: T.ember, border: "none", borderRadius: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#000", opacity: busy ? 0.5 : 1, transition: "all 200ms" }}>
									{busy ? "UPDATING..." : "APPLY STATUS"}
								</button>
							</div>

							{/* ── Private message ── */}
							<div>
								<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>PRIVATE MESSAGE</p>
								<textarea value={privateMsg} onChange={(e) => setPrivateMsg(e.target.value)} rows={4} placeholder="Write message to client..." style={{ width: "100%", background: "#111", border: T.border, borderRadius: 11, padding: "10px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
								<button onClick={sendPrivate} disabled={busy} style={{ marginTop: 8, width: "100%", padding: "10px", background: "transparent", border: T.border, borderRadius: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", transition: "all 200ms", opacity: busy ? 0.5 : 1 }}
									onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.emberBorder; e.currentTarget.style.color = "white"; }}
									onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
								>
									SEND TO CLIENT
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default OrdersTab;