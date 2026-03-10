import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

const getInternalSecret = () => {
  const secret = import.meta.env.VITE_INTERNAL_SECRET;
  if (!secret) console.error("[auth] ⚠️ VITE_INTERNAL_SECRET is not set — requests to protected endpoints will fail.");
  return secret ?? "";
};

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	ember: "#ec5b13",
	live: "#10b981",
	waiting: "#eab308",
	shipped: "#0ea5e9",
	violet: "#a855f7",
	returned: "#f43f5e",
	cancelled: "#64748b",
	border: "1px solid rgba(255,255,255,0.06)",
};

const ORDER_STATUSES = [
	"ordered",
	"pending",
	"processing",
	"shipped",
	"delivered",
	"returned",
	"cancelled",
];

/* Statuses that trigger a client notification email */
const EMAIL_TRIGGER_STATUSES = new Set(["shipped", "delivered", "cancelled", "returned"]);

const STATUS_COLOR = {
	ordered:    "#a855f7",
	pending:    "#eab308",
	processing: "#0ea5e9",
	shipped:    "#10b981",
	delivered:  "#ec5b13",
	returned:   "#f43f5e",
	cancelled:  "#64748b",
};

const STATUS_ICON = {
	ordered:    "shopping_bag",
	pending:    "hourglass_empty",
	processing: "settings",
	shipped:    "local_shipping",
	delivered:  "check_circle",
	returned:   "assignment_return",
	cancelled:  "cancel",
};

/* ─── EMAIL HELPER ───────────────────────────────────────────── */
const buildStatusEmailHTML = (order, status, clientName) => {
	const statusConfig = {
		shipped: {
			color: "#10b981",
			gradientFrom: "#10b981",
			gradientTo: "#059669",
			icon: "🚚",
			title: "Your Order Is On Its Way",
			subtitle: "It's packed, sealed, and heading to you right now.",
			headline: "SHIPPED & EN ROUTE",
			bodyText: `Great news — your order <strong style="color:#10b981">${order.order_number}</strong> has been dispatched and is currently on its way to you. Our team has carefully packaged your items and handed them off to our delivery partner. You can expect your delivery soon.`,
			closingLine: "Thank you for choosing us. We hope you love every piece.",
			cta: "TRACK YOUR ORDER",
		},
		delivered: {
			color: "#ec5b13",
			gradientFrom: "#ec5b13",
			gradientTo: "#d94e0f",
			icon: "✅",
			title: "Order Delivered",
			subtitle: "Your order has arrived. We hope it exceeded your expectations.",
			headline: "DELIVERED WITH CARE",
			bodyText: `Your order <strong style="color:#ec5b13">${order.order_number}</strong> has been successfully delivered. We hope the experience has been exceptional from start to finish. If you have any questions or concerns about your items, our support team is always here to help.`,
			closingLine: "We'd love to hear what you think — your feedback means the world to us.",
			cta: "LEAVE A REVIEW",
		},
		cancelled: {
			color: "#64748b",
			gradientFrom: "#475569",
			gradientTo: "#334155",
			icon: "❌",
			title: "Order Cancellation Notice",
			subtitle: "Your order has been cancelled as requested.",
			headline: "ORDER CANCELLED",
			bodyText: `We're writing to confirm that your order <strong style="color:#94a3b8">${order.order_number}</strong> has been cancelled. If this was done in error or you'd like to place a new order, our team is ready to assist you immediately. Any applicable refund will be processed within 3–5 business days.`,
			closingLine: "We're sorry this order didn't work out. We hope to serve you again.",
			cta: "SHOP AGAIN",
		},
		returned: {
			color: "#f43f5e",
			gradientFrom: "#f43f5e",
			gradientTo: "#e11d48",
			icon: "↩️",
			title: "Return Initiated",
			subtitle: "We've received your return request and are processing it.",
			headline: "RETURN IN PROGRESS",
			bodyText: `Your return request for order <strong style="color:#f43f5e">${order.order_number}</strong> has been initiated. Our team will review your request and get back to you shortly. Once the return is processed and items are received, your refund will be initiated within 5–7 business days.`,
			closingLine: "We appreciate your patience and are committed to making this right.",
			cta: "VIEW RETURN STATUS",
		},
	};

	const cfg = statusConfig[status];
	if (!cfg) return null;

	const name = clientName || "Valued Customer";
	const amount = Number(order.total_amount || 0).toLocaleString();

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${cfg.title}</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;min-height:100vh;">
<tr><td align="center" style="padding:40px 20px;">

  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- HEADER BRAND -->
    <tr>
      <td align="center" style="padding-bottom:36px;">
        <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:rgba(255,255,255,0.2);">
          VERP EXECUTIVE COLLECTION
        </p>
      </td>
    </tr>

    <!-- HERO CARD -->
    <tr>
      <td style="background:linear-gradient(135deg,#0d0d0d,#111);border-radius:24px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

        <!-- STATUS BAND -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:linear-gradient(90deg,${cfg.gradientFrom}18,${cfg.gradientTo}08);padding:28px 36px;border-bottom:1px solid rgba(255,255,255,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 8px 0;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.35em;text-transform:uppercase;color:${cfg.color};">
                      ${cfg.headline}
                    </p>
                    <p style="margin:0;font-size:26px;font-weight:300;color:#fff;letter-spacing:-0.5px;line-height:1.2;">
                      ${cfg.title}
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.5;">
                      ${cfg.subtitle}
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding-left:16px;width:60px;">
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 0 auto;">
                      <tr>
                        <td width="56" height="56" align="center" valign="middle"
                          style="width:56px;height:56px;border-radius:50%;background:${cfg.color}18;border:1px solid ${cfg.color}40;font-size:28px;line-height:56px;text-align:center;vertical-align:middle;">
                          ${cfg.icon}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ORDER DETAILS STRIP -->
          <tr>
            <td style="padding:24px 36px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;">
                    <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.25);">ORDER NUMBER</p>
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:${cfg.color};font-weight:700;letter-spacing:0.05em;">${order.order_number || "—"}</p>
                  </td>
                  <td style="width:50%;" align="right">
                    <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.25);">ORDER VALUE</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:${cfg.color};">GH₵ ${amount}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY COPY -->
          <tr>
            <td style="padding:28px 36px 24px;">
              <p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.85);line-height:1.7;">
                Dear <strong style="color:#fff;">${name}</strong>,
              </p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.8;">
                ${cfg.bodyText}
              </p>
            </td>
          </tr>

          <!-- CLOSING LINE -->
          <tr>
            <td style="padding:0 36px 28px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);font-style:italic;line-height:1.6;border-left:2px solid ${cfg.color}40;padding-left:14px;">
                ${cfg.closingLine}
              </p>
            </td>
          </tr>

          <!-- STATUS BADGE DISPLAY -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${cfg.color}15;border:1px solid ${cfg.color}40;border-radius:999px;padding:6px 18px;">
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${cfg.color};">
                      STATUS: ${status.toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- DIVIDER -->
    <tr><td style="height:24px;"></td></tr>

    <!-- FOOTER -->
    <tr>
      <td align="center" style="padding:0 20px 40px;">
        <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.15);">VERP · EXECUTIVE COLLECTION</p>
        <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.1);line-height:1.6;">
          This is an automated notification from the Verp Order Management System.<br/>
          If you have questions, reply to this email or contact our support team.
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
};

/* ─── Send client email via Supabase Edge Function / API ─────── */
const sendStatusEmail = async (order, status) => {
	const email = order.client_email || order.customer_email || order.email;
	if (!email) return;
	const clientName = order.delivery_name || order.customer_name || null;
	const html = buildStatusEmailHTML(order, status, clientName);
	if (!html) return;

	const SUBJECT_MAP = {
		shipped:   `Your Order ${order.order_number} Has Shipped 🚚`,
		delivered: `Your Order ${order.order_number} Has Been Delivered ✅`,
		cancelled: `Order ${order.order_number} — Cancellation Confirmed`,
		returned:  `Return Initiated for Order ${order.order_number}`,
	};

	try {
		await fetch(`${import.meta.env.VITE_API_URL}/api/send-email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-internal-secret": getInternalSecret(),
			},
			body: JSON.stringify({
				to: email,
				subject: SUBJECT_MAP[status] || `Order Update: ${status}`,
				html,
			}),
		});
	} catch (_) {
		console.warn("[sendStatusEmail] non-critical failure");
	}
};

/* ─── CUSTOMER PROFILE CARD ──────────────────────────────────── */
const CustomerProfileCard = ({ order }) => {
	const email = order?.customer_email || order?.client_email || order?.email;
	const deliveryName = order?.delivery_name || order?.customer_name || null;
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!email) { setLoading(false); return; }
		(async () => {
			setLoading(true);
			try {
				const { data: userRow } = await supabase
					.from("verp_users").select("id").eq("email", email).maybeSingle();
				if (userRow?.id) {
					const { data: details } = await supabase
						.from("verp_users_details").select("*").eq("user_id", userRow.id).maybeSingle();
					setProfile(details || null);
				}
			} catch (_) {}
			setLoading(false);
		})();
	}, [email]);

	const phone     = profile?.phone   || order?.customer_phone || null;
	const address   = profile?.address || order?.address        || null;
	const bio       = profile?.bio                              || null;
	const location  = order?.location                           || null;
	const avatarUrl = profile?.avtar_url                        || null;
	const displayName = deliveryName || email || "?";
	const initial   = displayName.charAt(0).toUpperCase();

	const InfoRow = ({ icon, label, value, color = T.ember }) => {
		if (!value) return null;
		return (
			<div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
				<div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1, background: `${color}14`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
					<span className="material-symbols-outlined" style={{ fontSize: 14, color }}>{icon}</span>
				</div>
				<div style={{ minWidth: 0 }}>
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 2 }}>{label}</p>
					<p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.45, wordBreak: "break-word" }}>{value}</p>
				</div>
			</div>
		);
	};

	return (
		<div style={{ background: "linear-gradient(135deg, rgba(236,91,19,0.05) 0%, rgba(236,91,19,0.01) 100%)", border: "1px solid rgba(236,91,19,0.18)", borderRadius: 18, padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: T.ember }}>CLIENT PROFILE</p>
				{loading && <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid rgba(236,91,19,0.2)", borderTopColor: T.ember, animation: "crSpin 0.8s linear infinite" }} />}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: avatarUrl ? "transparent" : "linear-gradient(135deg, rgba(236,91,19,0.3), rgba(236,91,19,0.1))", border: `2px solid ${avatarUrl ? "rgba(236,91,19,0.45)" : "rgba(236,91,19,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 18px rgba(236,91,19,0.14)" }}>
					{avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} /> : <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, fontStyle: "italic", color: T.ember }}>{initial}</span>}
				</div>
				<div style={{ minWidth: 0, flex: 1 }}>
					{deliveryName && <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontStyle: "italic", color: "white", lineHeight: 1.25, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{deliveryName}</p>}
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email || "—"}</p>
					{bio && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", fontStyle: "italic", marginTop: 4, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bio}</p>}
				</div>
			</div>
			<div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<InfoRow icon="call" label="Phone" value={phone} color={T.live} />
				<InfoRow icon="location_on" label="Location" value={location} color={T.shipped} />
				<InfoRow icon="home" label="Delivery Address" value={address} color="rgba(167,139,250,1)" />
			</div>
			{!loading && !profile && !phone && !address && (
				<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.15)", letterSpacing: "0.18em", textAlign: "center" }}>NO EXTENDED PROFILE ON FILE</p>
			)}
			<style>{`@keyframes crSpin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);
};

/* ─── STATUS BADGE ───────────────────────────────────────────── */
const Badge = ({ status = "" }) => {
	const c = STATUS_COLOR[status.toLowerCase()] || "rgba(255,255,255,0.3)";
	return (
		<span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 999, background: `${c}14`, border: `1px solid ${c}40`, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: c, whiteSpace: "nowrap" }}>
			{status.toUpperCase()}
		</span>
	);
};

/* ─── EMAIL PREVIEW PILL ─────────────────────────────────────── */
const EmailTriggerPill = ({ status }) => {
	if (!EMAIL_TRIGGER_STATUSES.has(status)) return null;
	const c = STATUS_COLOR[status] || T.ember;
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", background: `${c}0e`, border: `1px solid ${c}30`, borderRadius: 10, marginTop: 8 }}>
			<span className="material-symbols-outlined" style={{ fontSize: 13, color: c }}>mail</span>
			<p style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: c }}>
				CLIENT EMAIL WILL BE SENT
			</p>
		</div>
	);
};

/* ─── MAIN ───────────────────────────────────────────────────── */
const ClientRequests = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useState("incoming");
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [newStatus, setNewStatus] = useState("");
	const [saving, setSaving] = useState(false);

	const INCOMING = ["ordered", "pending", "processing", "shipped"];
	const OUTGOING = ["delivered", "returned", "cancelled"];

	const fetchOrders = async () => {
		const { data } = await supabase.from("verp_orders").select("*").order("created_at", { ascending: false });
		if (data) setOrders(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchOrders();
		const i = setInterval(fetchOrders, 15000);
		return () => clearInterval(i);
	}, []);

	const filtered = orders.filter((o) =>
		view === "incoming"
			? INCOMING.includes(o.status?.toLowerCase())
			: OUTGOING.includes(o.status?.toLowerCase()),
	);

	const openManifest = (order) => {
		setSelectedOrder(order);
		setNewStatus(order.status || "ordered");
	};

	/* ── Status update WITH email trigger ── */
	const handleUpdate = async () => {
		if (!selectedOrder) return;
		setSaving(true);
		const willEmail = EMAIL_TRIGGER_STATUSES.has(newStatus);

		await supabase.from("verp_orders").update({ status: newStatus }).eq("id", selectedOrder.id);

		/* Alert staff */
		try {
			await fetch("/api/alert-staff", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-internal-secret": getInternalSecret(),
				},
				body: JSON.stringify({ type: "NEW_ORDER", clientId: selectedOrder.client_email || selectedOrder.email, orderNumber: selectedOrder.order_number, orderValue: selectedOrder.total_amount, orderStatus: newStatus }),
			});
		} catch (_) {}

		/* Send client email for trigger statuses */
		if (willEmail) {
			await sendStatusEmail(selectedOrder, newStatus);
		}

		setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
		setSaving(false);
		setSelectedOrder(null);

		const statusColor = STATUS_COLOR[newStatus] || T.ember;
		Swal.fire({
			background: "#0d0d0d",
			color: "#fff",
			html: `
				<div style="text-align:center;padding:8px 0;">
					<div style="width:52px;height:52px;border-radius:50%;background:${statusColor}18;border:1px solid ${statusColor}40;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;">
						<span class="material-symbols-outlined" style="font-size:24px;color:${statusColor};">${STATUS_ICON[newStatus] || "check_circle"}</span>
					</div>
					<p style="margin:0 0 6px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.3em;text-transform:uppercase;color:${statusColor};">STATUS UPDATED</p>
					<p style="margin:0 0 ${willEmail ? "10px" : "0"};font-size:16px;font-weight:300;color:#fff;">Order is now <strong style="color:${statusColor};">${newStatus.toUpperCase()}</strong></p>
					${willEmail ? `<div style="display:inline-flex;align-items:center;gap:8px;background:${statusColor}12;border:1px solid ${statusColor}30;border-radius:8px;padding:6px 14px;"><span class="material-symbols-outlined" style="font-size:13px;color:${statusColor};">mail</span><p style="margin:0;font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:0.2em;text-transform:uppercase;color:${statusColor};">CLIENT EMAIL DISPATCHED</p></div>` : ""}
				</div>
			`,
			timer: 2400,
			showConfirmButton: false,
			customClass: { popup: "rounded-3xl" },
		});
	};

	if (loading)
		return (
			<div className="flex items-center justify-center py-32">
				<div className="w-8 h-8 border-2 border-t-[#ec5b13] border-white/10 rounded-full animate-spin" />
			</div>
		);

	return (
		<div className="space-y-6 px-4 md:px-0">
			{/* ── HEADER + TOGGLE ── */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
						Order <span className="font-serif italic" style={{ color: T.ember }}>Flow</span>
					</h2>
					<p className="text-xs text-white/40 mt-2 tracking-wide">
						{filtered.length} order{filtered.length !== 1 ? "s" : ""} in this view
					</p>
				</div>
				<div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 w-full sm:w-auto">
					{["incoming", "outgoing"].map((v) => (
						<button key={v} onClick={() => setView(v)} className={`flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl text-[10px] font-bold uppercase transition-all tracking-wider ${view === v ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"}`}>
							{v}
						</button>
					))}
				</div>
			</div>

			{/* ── DESKTOP TABLE ── */}
			<div className="hidden lg:block relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
							<tr>
								<th className="p-5 font-bold">Client</th>
								<th className="p-5 font-bold">Order ID</th>
								<th className="p-5 font-bold">Value</th>
								<th className="p-5 font-bold">Status</th>
								<th className="p-5 font-bold text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filtered.length === 0 && (
								<tr><td colSpan={5} className="p-10 text-center text-white/20 text-xs uppercase tracking-widest">No orders</td></tr>
							)}
							{filtered.map((order) => (
								<tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
									<td className="p-5">
										<p className="font-medium text-sm text-white">{order.delivery_name || order.customer_name || order.client_email || order.email || "—"}</p>
										<p className="text-[10px] text-white/30 font-mono mt-0.5" style={{ letterSpacing: "0.05em" }}>{order.client_email || order.email || ""}</p>
										<p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
										{(() => {
											let items = [];
											try { items = typeof order.items === "string" ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []); } catch (_) {}
											if (!items.length) return null;
											return (
												<div className="flex gap-1 mt-2 flex-wrap">
													{items.slice(0, 4).map((item, i) => (
														<div key={i} className="relative flex-shrink-0">
															{item.image ? <img src={item.image} alt={item.name || "item"} title={item.name || ""} className="w-9 h-9 object-cover rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.08)" }} onError={e => { e.currentTarget.style.display = "none"; }} /> : <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}><span className="material-symbols-outlined text-white/20" style={{ fontSize: 13 }}>image</span></div>}
															{(item.quantity || 1) > 1 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ec5b13] text-black text-[7px] font-bold flex items-center justify-center">{item.quantity}</span>}
														</div>
													))}
													{items.length > 4 && <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[8px] text-white/30 font-mono" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>+{items.length - 4}</div>}
												</div>
											);
										})()}
									</td>
									<td className="p-5"><span className="text-xs text-white/50 font-mono">{order.order_number || "—"}</span></td>
									<td className="p-5"><span className="text-sm font-bold" style={{ color: T.ember }}>GH₵ {Number(order.total_amount || 0).toLocaleString()}</span></td>
									<td className="p-5"><Badge status={order.status} /></td>
									<td className="p-5 text-right">
										<button onClick={() => openManifest(order)} className="text-[10px] font-medium text-white/60 border border-white/10 px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider" onMouseEnter={(e) => { e.currentTarget.style.background = T.ember; e.currentTarget.style.borderColor = T.ember; e.currentTarget.style.color = "#000"; }} onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}>
											Manage
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* ── MOBILE CARDS ── */}
			<div className="lg:hidden space-y-4">
				{filtered.length === 0 && <div className="text-center py-16 text-white/20 text-xs uppercase tracking-widest">No orders</div>}
				{filtered.map((order) => (
					<div key={order.id} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-5 space-y-4">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-medium text-sm text-white">{order.delivery_name || order.customer_name || order.client_email || order.email || "—"}</h3>
								{(order.delivery_name || order.customer_name) && <p className="text-[10px] text-white/30 font-mono mt-0.5" style={{ letterSpacing: "0.05em" }}>{order.client_email || order.email || ""}</p>}
								<p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
							</div>
							<Badge status={order.status} />
						</div>
						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Order ID</p>
								<p className="text-xs text-white/60 font-mono">{order.order_number || "—"}</p>
							</div>
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Value</p>
								<p className="text-sm font-bold" style={{ color: T.ember }}>GH₵ {Number(order.total_amount || 0).toLocaleString()}</p>
							</div>
						</div>
						<button onClick={() => openManifest(order)} className="w-full text-[10px] font-medium text-white/60 border border-white/10 px-5 py-3 rounded-xl transition-all uppercase tracking-wider" onMouseEnter={(e) => { e.currentTarget.style.background = T.ember; e.currentTarget.style.borderColor = T.ember; e.currentTarget.style.color = "#000"; }} onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}>
							Manage Order
						</button>
					</div>
				))}
			</div>

			{/* ── MANIFEST MODAL ── */}
			{selectedOrder && (
				<div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)" }}>
					<div className="bg-[#0a0a0a] border-t md:border border-white/10 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl p-6 md:p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
						<button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
							<span className="material-symbols-outlined text-2xl">close</span>
						</button>

						<div className="mb-8 pr-10">
							<h3 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2">
								Order <span className="font-serif italic" style={{ color: T.ember }}>{selectedOrder.order_number}</span>
							</h3>
							<p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
								{selectedOrder.delivery_name || selectedOrder.customer_name || selectedOrder.client_email || selectedOrder.email}
							</p>
						</div>

						<div className="space-y-6">
							<CustomerProfileCard order={selectedOrder} />

							{/* Summary */}
							<div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Current Value</p>
										<p className="text-xl font-bold" style={{ color: T.ember }}>GH₵ {Number(selectedOrder.total_amount || 0).toLocaleString()}</p>
									</div>
									<Badge status={selectedOrder.status} />
								</div>
								<p className="text-[10px] text-white/30 mt-3">
									{new Date(selectedOrder.created_at).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
								</p>
								{(() => {
									let items = [];
									try { items = typeof selectedOrder.items === "string" ? JSON.parse(selectedOrder.items) : (Array.isArray(selectedOrder.items) ? selectedOrder.items : []); } catch (_) {}
									if (!items.length) return null;
									return (
										<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
											{items.map((item, i) => (
												<div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-1.5 border border-white/[0.05]">
													{item.image ? <img src={item.image} alt={item.name || ""} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" onError={e => { e.currentTarget.style.display = "none"; }} /> : <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-white/20" style={{ fontSize: 14 }}>image</span></div>}
													<div className="min-w-0 pr-1">
														<p className="text-[9px] font-medium text-white/60 truncate max-w-[90px]">{item.name || "Item"}</p>
														<p className="text-[8px] text-white/30 font-mono">×{item.quantity || 1}</p>
													</div>
												</div>
											))}
										</div>
									);
								})()}
							</div>

							{/* Status selector */}
							<div className="space-y-3">
								<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">Update Status</label>
								<div className="relative">
									<select
										value={newStatus}
										onChange={(e) => setNewStatus(e.target.value)}
										className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm uppercase outline-none focus:border-[#ec5b13]/50 transition-all appearance-none cursor-pointer font-bold tracking-widest"
										style={{ color: STATUS_COLOR[newStatus] || T.ember }}
									>
										{ORDER_STATUSES.map((s) => (
											<option key={s} value={s} style={{ color: STATUS_COLOR[s] || "#fff", background: "#0d0d0d" }}>{s.toUpperCase()}</option>
										))}
									</select>
									<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-lg">expand_more</span>
								</div>
								{/* Email trigger indicator */}
								<EmailTriggerPill status={newStatus} />
							</div>

							{/* Actions */}
							<div className="flex flex-col sm:flex-row gap-3 pt-2">
								<button
									onClick={handleUpdate}
									disabled={saving}
									className="flex-1 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] transition-all active:scale-[0.98] disabled:opacity-50"
									style={{ background: `linear-gradient(135deg, ${T.ember}, #d94e0f)`, color: "#fff" }}
								>
									{saving ? "SAVING..." : EMAIL_TRIGGER_STATUSES.has(newStatus) ? "UPDATE & NOTIFY CLIENT" : "UPDATE STATUS"}
								</button>
								<button onClick={() => setSelectedOrder(null)} className="flex-1 sm:flex-none px-8 py-4 bg-white/5 border border-white/10 text-white/50 rounded-2xl font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-white/10 hover:text-white transition-all">
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientRequests;