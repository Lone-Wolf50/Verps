const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ MUST be service role
);
const app = express();
app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────
// Add every origin that will call this server.
// On Vercel, set VITE_SERVER_URL=https://your-server.railway.app (no trailing slash)
// in your Vercel project environment variables.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://verps-chi.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, same-server calls)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
    preflightContinue: false, 
  optionsSuccessStatus: 200, // some legacy browsers (IE11) choke on 204
};

// ✅ Handle ALL preflight OPTIONS requests BEFORE any route

// ✅ Apply CORS to every real request too
app.use(cors(corsOptions));

// ── Transporter ───────────────────────────────────────────────
// GMAIL_PASS must be a Gmail App Password (not account password).
// Google Account → Security → 2-Step Verification → App passwords
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ Email transporter error:", err.message);
  else console.log("✅ Email transporter ready —", process.env.GMAIL_USER);
});

// ── HTML Email Wrapper ─────────────────────────────────────────
const wrap = (title, body, ctaUrl, ctaLabel) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 16px;">
  <div style="background:#0a0a0a;border:1px solid rgba(236,91,19,0.4);border-radius:16px;overflow:hidden;">
    <div style="background:#080808;padding:22px 28px;border-bottom:1px solid rgba(255,255,255,0.05);">
      <h1 style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:26px;color:#ec5b13;">The Vault</h1>
      <p style="margin:4px 0 0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.25);">SYSTEM NOTIFICATION</p>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 14px;font-size:17px;font-weight:700;color:#fff;">${title}</h2>
      ${body}
      ${ctaUrl ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;background:#ec5b13;color:#000;text-decoration:none;font-weight:700;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;border-radius:10px;">${ctaLabel || "OPEN DASHBOARD"}</a></div>` : ""}
    </div>
    <div style="padding:14px 28px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
      <p style="margin:0;font-size:8px;color:rgba(255,255,255,0.12);letter-spacing:0.2em;text-transform:uppercase;">VAULT AUTOMATED SYSTEM · DO NOT REPLY</p>
    </div>
  </div>
</div></body></html>`;

const row = (label, value, color) =>
  `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
    <span style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.15em;">${label}</span>
    <span style="font-size:11px;font-weight:600;color:${color || "#fff"};">${value || "—"}</span>
  </div>`;

// ── 1. Staff Login (email + password from .env) ──────────────────
app.post("/api/staff-login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const assistantEmail = (process.env.ASSISTANT_EMAIL || "").toLowerCase().trim();
  const em = String(email).toLowerCase().trim();

  if (em === adminEmail && password === process.env.ADMIN_PASS) {
    return res.status(200).json({ success: true, role: "admin", message: "Access Granted" });
  }
  if (em === assistantEmail && password === process.env.ASSISTANT_PASS) {
    return res.status(200).json({ success: true, role: "assistant", message: "Access Granted" });
  }
  res.status(401).json({ success: false, error: "Invalid email or password" });
});

// Legacy: role + password only (for backward compatibility)
app.post("/api/verify-staff", (req, res) => {
  const { role, password } = req.body;
  const masterPass = role === "admin" ? process.env.ADMIN_PASS : process.env.ASSISTANT_PASS;
  if (password === masterPass) return res.status(200).json({ success: true, message: "Access Granted" });
  res.status(401).json({ success: false, error: "Invalid Credentials" });
});

// ── 2. OTP Delivery ───────────────────────────────────────────
app.post("/api/send-otp", async (req, res) => {
  const { email, type } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await transporter.sendMail({
      from: `"VERP Security" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[${otp}] Your Vault Access Code`,
      html: wrap(
        "Security Verification Code",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">Your one-time code for <strong style="color:#ec5b13;">${type || "verification"}</strong>:</p>
         <div style="margin:20px 0;text-align:center;padding:20px;background:#111;border-radius:12px;border:1px solid rgba(236,91,19,0.2);">
           <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#fff;font-family:monospace;">${otp}</span>
         </div>
         <p style="color:rgba(255,255,255,0.3);font-size:11px;">Expires in 10 minutes.</p>`,
        null, null,
      ),
    });

    res.status(200).json({ success: true, otp });
  } catch (err) {
    console.error("OTP error:", err.message);
    res.status(500).json({ error: "Failed to deliver OTP", detail: err.message });
  }
});

// ── 3. Paystack Payment Verification ─────────────────────────
app.post("/api/verify-payment", async (req, res) => {
  const { reference } = req.body;
  if (!reference) return res.status(400).json({ error: "Reference required" });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    if (data.status && data.data.status === "success") {
      return res.status(200).json({ success: true, data: data.data });
    }
    res.status(400).json({ success: false, message: "Payment not verified", data: data.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── NEW: Paystack Charge Calculator ──────────────────────────
// POST { amountGHS: 200 }  →  { chargeGHS, chargePesewas, feeGHS }
//
// Paystack Ghana fees (local cards):
//   1.95% of transaction + GH₵0.25 flat fee
//   Fee is capped at GH₵1,000
//
// We reverse-engineer so YOU receive exactly amountGHS after fees.
// Formula: charge = (amountYouWant + 0.25) / (1 - 0.0195)
// Update this route in your server.js
// server.js - Update only the /api/paystack-charge route
app.post("/api/paystack-charge", (req, res) => {
  const { amountGHS } = req.body;
  const amount = parseFloat(amountGHS);
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amountGHS" });
  }

  // Paystack Ghana: 1.95% flat
  const RATE = 0.0195; 

  /* Formula to ensure you receive 'amount' after the 1.95% cut:
     Charge = Amount / (1 - 0.0195)
  */
  let chargeGHS = amount / (1 - RATE);

  // Round up to the nearest pesewa to ensure you don't lose money
  chargeGHS = Math.ceil(chargeGHS * 100) / 100;
  
  const feeGHS = +(chargeGHS - amount).toFixed(2);
  const chargePesewas = Math.round(chargeGHS * 100); 

  // FIXED: Changed keys to match Checkout.jsx
  res.status(200).json({ 
    success: true, 
    originalAmount: amount, 
    chargeGHS: chargeGHS,   // Changed from customerPays
    feeGHS: feeGHS,         // Changed from paystackFee
    chargePesewas: chargePesewas 
  });
});
// ── 4. All Staff & System Alerts ──────────────────────────────
app.post("/api/alert-staff", async (req, res) => {
  const { type, clientId, note, orderNumber, orderValue, orderStatus, subject, recipientCount } = req.body;

  const ADMIN_EMAIL     = process.env.ADMIN_EMAIL     || process.env.GMAIL_USER;
  const ASSISTANT_EMAIL = process.env.ASSISTANT_EMAIL || process.env.GMAIL_USER;
  const DASH = "https://verps-chi.vercel.app/admin";
  const TERM = "https://verps-chi.vercel.app/assistant";

  let to, emailSubject, html;

  switch (type) {
    case "ASSISTANT_REQUEST":
    case "NEW_CHAT":
      to = ASSISTANT_EMAIL;
      emailSubject = "🔔 New Client Support Request";
      html = wrap(
        "A Client Needs Help",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">A client is waiting for live support. Please attend to them promptly.</p>
         ${row("Client", clientId, "#ec5b13")}${note ? row("Message", note, "#fff") : ""}`,
        TERM, "OPEN TERMINAL",
      );
      break;

    case "ESCALATION":
    case "PARTIAL_PUSH":
      to = ADMIN_EMAIL;
      emailSubject = "⚠️ Chat Escalation — Advice Needed";
      html = wrap(
        "Partial Escalation Alert",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The assistant has escalated a session and needs your guidance privately. Check the Assistant Inbox and reply. The client is being kept informed.</p>
         ${row("Client", clientId, "#ec5b13")}${row("Reason", note, "#f59e0b")}`,
        DASH, "OPEN ASSISTANT INBOX",
      );
      break;

    case "ADMIN_TAKEOVER":
    case "FULL_PUSH":
      to = ADMIN_EMAIL;
      emailSubject = "🚨 URGENT — Full Admin Takeover Needed";
      html = wrap(
        "Full Takeover Required",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The assistant has handed over a session. The client is waiting — please continue the conversation seamlessly.</p>
         ${row("Client", clientId, "#ec5b13")}${row("Reason", note, "#ef4444")}`,
        DASH + "#messages", "TAKE OVER CHAT",
      );
      break;

    case "NEW_ORDER":
      to = ADMIN_EMAIL;
      emailSubject = `🛒 New Order Placed — ${orderNumber || clientId}`;
      html = wrap(
        "New Order Received",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">A new order has been placed in the Vault.</p>
         ${row("Client", clientId, "#ec5b13")}
         ${row("Order ID", orderNumber, "#38bdf8")}
         ${row("Value", orderValue ? `GH₵ ${Number(orderValue).toLocaleString()}` : "—", "#ec5b13")}
         ${row("Status", orderStatus || "ordered", "#a78bfa")}`,
        DASH + "#requests", "VIEW ORDERS",
      );
      break;

    case "PUSH_BACK":
      to = ASSISTANT_EMAIL;
      emailSubject = "↩️ Session Returned — Resume with Client";
      html = wrap(
        "Admin Has Pushed Back",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The admin is done advising. The session has been returned to you — please resume with the client.</p>
         ${row("Client", clientId, "#ec5b13")}${note ? row("Admin Note", note, "#38bdf8") : ""}`,
        TERM, "OPEN TERMINAL",
      );
      break;

    case "PRIVATE_MESSAGE":
      to = ADMIN_EMAIL;
      emailSubject = "💬 New Private Message from Assistant";
      html = wrap(
        "Assistant Sent a Private Message",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The assistant has sent you a private message.</p>
         ${clientId ? row("Re: Client", clientId, "#ec5b13") : ""}
         <div style="margin-top:14px;padding:14px;background:#111;border-radius:10px;border-left:3px solid #ec5b13;">
           <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;">${note || ""}</p>
         </div>`,
        DASH + "#channel", "OPEN ASSISTANT INBOX",
      );
      break;

    case "BROADCAST":
      to = ADMIN_EMAIL;
      emailSubject = `📢 Broadcast Confirmed — "${(subject || "").slice(0, 40)}"`;
      html = wrap(
        "Broadcast Delivered",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">Your broadcast has been sent to all client inboxes.</p>
         ${row("Subject", subject || "(no subject)", "#38bdf8")}
         ${row("Recipients", recipientCount ? `${recipientCount} clients` : "All clients", "#22c55e")}
         ${note ? `<div style="margin-top:12px;padding:12px;background:#111;border-radius:8px;"><p style="margin:0;color:rgba(255,255,255,0.55);font-size:12px;line-height:1.6;">${note}</p></div>` : ""}`,
        null, null,
      );
      break;

    default:
      to = ADMIN_EMAIL;
      emailSubject = `[VAULT] ${type}`;
      html = wrap(
        `Alert: ${type}`,
        `${clientId ? row("Client", clientId, "#ec5b13") : ""}${note ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:12px;">${note}</p>` : ""}`,
        DASH, "OPEN DASHBOARD",
      );
  }

  try {
    await transporter.sendMail({
      from: `"VERP System" <${process.env.GMAIL_USER}>`,
      to, subject: emailSubject, html,
    });
    console.log(`✅ [${type}] → ${to}`);
    res.status(200).json({ success: true, type, to });
  } catch (err) {
    console.error(`❌ [${type}] failed:`, err.message);
    res.status(500).json({ error: err.message, type });
  }
});

// ── 5. Admin: Get All Return Requests ─────────────────────────
app.get("/api/admin/return-requests", async (req, res) => {
  const { email, password } = req.query;
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();

  if (
    email?.toLowerCase().trim() !== adminEmail ||
    password !== process.env.ADMIN_PASS
  ) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const { data, error } = await supabase
      .from("verp_return_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "active", server: "Vault v2", time: new Date().toISOString() })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Vault Server on port ${PORT}`));
module.exports = app;