/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
export const T = {
	void: "#080808",
	obsidian: "#0d0d0d",
	smoke: "#1c1c1c",
	ember: "#ec5b13",
	emberDim: "rgba(236,91,19,0.10)",
	emberBorder: "rgba(236,91,19,0.35)",
	live: "#22c55e",
	waiting: "#f59e0b",
	resolved: "#6b7280",
	escalated: "#ef4444",
	shipped: "#38bdf8",
	delivered: "#a78bfa",
	returned: "#fb923c",
	cancelled: "#f87171",
	border: "1px solid rgba(255,255,255,0.06)",
	borderSub: "1px solid rgba(255,255,255,0.03)",
};

export const STATUS_CFG = {
	waiting:   { color: T.waiting,  label: "WAITING",        pulse: true  },
	live:      { color: T.live,     label: "LIVE",           pulse: true  },
	resolved:  { color: T.resolved, label: "RESOLVED",       pulse: false },
	escalated: { color: T.escalated,label: "ESCALATED",      pulse: true  },
	full_push: { color: "#a78bfa",  label: "ADMIN TAKEOVER", pulse: true  },
};

export const ORDER_STATUSES = [
	"ordered", "pending", "processing", "shipped",
	"delivered", "returned", "cancelled",
];

export const ORDER_COLOR = {
	ordered:    "#a78bfa",
	pending:    T.waiting,
	processing: T.shipped,
	shipped:    T.shipped,
	delivered:  T.ember,
	returned:   T.returned,
	cancelled:  T.cancelled,
};

export const NAV = [
	{ id: "inbox",          icon: "chat_bubble",          label: "Live Inbox"     },
	{ id: "queue",          icon: "group_add",            label: "Queue"          },
	{ id: "orders",         icon: "inventory_2",          label: "Orders"         },
	{ id: "order-messages", icon: "mark_email_read",      label: "Order Messages" },
	{ id: "analytics",      icon: "bar_chart",            label: "Analytics"      },
	{ id: "admin",          icon: "admin_panel_settings", label: "Admin Channel"  },
	{ id: "history",        icon: "history",              label: "Chat History"   },
];