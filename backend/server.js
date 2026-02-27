const express = require("express");
const { Resend } = require("resend");
const cors = require("cors");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 12;
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// ── ENV CHECK ON STARTUP ──────────────────────────────────────
console.log("🔍 [STARTUP] Checking environment variables...");
console.log("  SUPABASE_URL        :", process.env.SUPABASE_URL ? "✅ set" : "❌ MISSING");
console.log("  SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ set" : "❌ MISSING");
console.log("  RESEND_API_KEY      :", process.env.RESEND_API_KEY ? "✅ set" : "❌ MISSING");
console.log("  ADMIN_EMAIL         :", process.env.ADMIN_EMAIL ? "✅ set" : "❌ MISSING");
console.log("  ADMIN_PASS          :", process.env.ADMIN_PASS  ? "✅ set" : "❌ MISSING");
console.log("  PAYSTACK_SECRET_KEY :", process.env.PAYSTACK_SECRET_KEY ? "✅ set" : "❌ MISSING");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://verps-chi.vercel.app",
  "http://192.168.0.3:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("🌐 [CORS] Request from origin:", origin || "(no origin)");
    if (!origin || allowedOrigins.includes(origin)) {
      console.log("🌐 [CORS] ✅ Allowed");
      return callback(null, true);
    }
    console.error("🌐 [CORS] ❌ Blocked:", origin);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ── Helper: send email via Resend ────────────────────────────
const sendEmail = async ({ to, subject, html, from }) => {
  const result = await resend.emails.send({
    from: from || "VERP System <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (result.error) throw new Error(result.error.message);
  return result;
};

// ── HTML Email Wrapper ────────────────────────────────────────
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

// ── 1. Staff Login ────────────────────────────────────────────
app.post("/api/staff-login", (req, res) => {
  const { email, password } = req.body;
  console.log("[staff-login] called — email:", email);
  if (!email || !password) {
    console.error("[staff-login] ❌ Missing email or password");
    return res.status(400).json({ success: false, error: "Email and password required" });
  }
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const assistantEmail = (process.env.ASSISTANT_EMAIL || "").toLowerCase().trim();
  const em = String(email).toLowerCase().trim();
  console.log("[staff-login] Comparing against admin:", adminEmail, "| assistant:", assistantEmail);

  if (em === adminEmail && password === process.env.ADMIN_PASS) {
    console.log("[staff-login] ✅ Admin login success");
    return res.status(200).json({ success: true, role: "admin", message: "Access Granted" });
  }
  if (em === assistantEmail && password === process.env.ASSISTANT_PASS) {
    console.log("[staff-login] ✅ Assistant login success");
    return res.status(200).json({ success: true, role: "assistant", message: "Access Granted" });
  }
  console.error("[staff-login] ❌ Invalid credentials for:", em);
  res.status(401).json({ success: false, error: "Invalid email or password" });
});

// Legacy
app.post("/api/verify-staff", (req, res) => {
  const { role, password } = req.body;
  console.log("[verify-staff] called — role:", role);
  const masterPass = role === "admin" ? process.env.ADMIN_PASS : process.env.ASSISTANT_PASS;
  if (password === masterPass) {
    console.log("[verify-staff] ✅ Access granted for role:", role);
    return res.status(200).json({ success: true, message: "Access Granted" });
  }
  console.error("[verify-staff] ❌ Invalid credentials for role:", role);
  res.status(401).json({ success: false, error: "Invalid Credentials" });
});

// ── 2. OTP Delivery ───────────────────────────────────────────
app.post("/api/send-otp", async (req, res) => {
  const { email, type } = req.body;
  console.log("[send-otp] called — email:", email, "| type:", type);

  if (!email) {
    console.error("[send-otp] ❌ No email provided");
    return res.status(400).json({ success: false, error: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  console.log("[send-otp] Generated OTP — expiry:", expiry);

  try {
    console.log("[send-otp] Saving OTP to DB for:", email);
    const { error: dbErr } = await supabase
      .from("verp_users")
      .update({ otp_code: otp, otp_expiry: expiry })
      .eq("email", email.toLowerCase().trim());

    if (dbErr) {
      console.error("[send-otp] ❌ DB save failed:", dbErr.message);
      return res.status(500).json({ error: "Failed to prepare OTP", detail: dbErr.message });
    }
    console.log("[send-otp] ✅ OTP saved to DB");

    console.log("[send-otp] Sending email via Resend to:", email);
    await sendEmail({
      from: "VERP Security <onboarding@resend.dev>",
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

    console.log("[send-otp] ✅ Email sent successfully to:", email);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[send-otp] ❌ CAUGHT EXCEPTION:", err.message);
    console.error("[send-otp] ❌ Full error:", err);
    res.status(500).json({ error: "Failed to deliver OTP", detail: err.message });
  }
});

// ── 3. OTP Verification ───────────────────────────────────────
app.post("/api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  console.log("[verify-otp] called — email:", email, "| otp:", otp);

  if (!email || !otp) return res.status(400).json({ message: "Email and code required." });

  try {
    const { data, error } = await supabase
      .from("verp_users")
      .select("id, otp_code, otp_expiry")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    console.log("[verify-otp] DB row :", data);
    console.log("[verify-otp] DB err :", error?.message ?? "none");

    if (error) {
      console.error("[verify-otp] ❌ Supabase error:", error.message);
      return res.status(500).json({ message: "DB error.", detail: error.message });
    }
    if (!data) return res.status(404).json({ message: "No account found for this email." });

    if (!data.otp_code) {
      console.error("[verify-otp] ❌ otp_code is NULL for", email);
      return res.status(400).json({ message: "No active code — please request a new one." });
    }

    console.log("[verify-otp] DB code  :", JSON.stringify(String(data.otp_code).trim()));
    console.log("[verify-otp] Provided :", JSON.stringify(String(otp).trim()));

    if (String(data.otp_code).trim() !== String(otp).trim()) {
      console.error("[verify-otp] ❌ Code mismatch");
      return res.status(400).json({ message: "Incorrect code — please check and try again." });
    }

    if (data.otp_expiry && new Date() > new Date(data.otp_expiry)) {
      console.error("[verify-otp] ❌ OTP expired at", data.otp_expiry);
      return res.status(400).json({ message: "Code expired — please request a new one." });
    }

    console.log("[verify-otp] ✅ OTP valid for", email);
    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[verify-otp] ❌ CAUGHT EXCEPTION:", e.message, e);
    res.status(500).json({ message: "Server error during OTP check.", detail: e.message });
  }
});

// ── 4. Reset Password ─────────────────────────────────────────
app.post("/api/reset-password", async (req, res) => {
  const { email, password } = req.body;
  console.log("[reset-password] called — email:", email);

  if (!email || !password)
    return res.status(400).json({ message: "Email and new password required." });
  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters." });

  try {
    const { data: user, error: fetchErr } = await supabase
      .from("verp_users")
      .select("id, otp_code, otp_expiry")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    console.log("[reset-password] DB user:", user);
    console.log("[reset-password] DB err :", fetchErr?.message ?? "none");

    if (fetchErr) return res.status(500).json({ message: "DB error.", detail: fetchErr.message });
    if (!user)    return res.status(404).json({ message: "No account found for this email." });

    if (!user.otp_code) {
      console.error("[reset-password] ❌ otp_code is NULL — session expired or flow broken");
      return res.status(400).json({ message: "Session expired — please start over." });
    }

    if (user.otp_expiry && new Date() > new Date(user.otp_expiry)) {
      console.error("[reset-password] ❌ OTP expired at", user.otp_expiry);
      return res.status(400).json({ message: "Session expired — please request a new code." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("[reset-password] ✅ password hashed");

    const { error: updateErr } = await supabase
      .from("verp_users")
      .update({ password_hash, otp_code: null, otp_expiry: null })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[reset-password] ❌ update failed:", updateErr.message);
      return res.status(500).json({ message: "Failed to save new password.", detail: updateErr.message });
    }

    console.log("[reset-password] ✅ password saved and OTP cleared for", email);
    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[reset-password] ❌ CAUGHT EXCEPTION:", e.message, e);
    res.status(500).json({ message: "Server error during password reset.", detail: e.message });
  }
});

// ── 5. Paystack Verification ──────────────────────────────────
app.post("/api/verify-payment", async (req, res) => {
  const { reference } = req.body;
  console.log("[verify-payment] called — reference:", reference);
  if (!reference) return res.status(400).json({ error: "Reference required" });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    console.log("[verify-payment] Paystack response status:", data?.data?.status);
    if (data.status && data.data.status === "success") {
      console.log("[verify-payment] ✅ Payment verified");
      return res.status(200).json({ success: true, data: data.data });
    }
    console.error("[verify-payment] ❌ Payment not verified:", data?.data?.status);
    res.status(400).json({ success: false, message: "Payment not verified", data: data.data });
  } catch (err) {
    console.error("[verify-payment] ❌ CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── 6. Paystack Charge Calculation ───────────────────────────
app.post("/api/paystack-charge", (req, res) => {
  const { amountGHS } = req.body;
  console.log("[paystack-charge] called — amountGHS:", amountGHS);
  const amount = parseFloat(amountGHS);

  if (!amount || isNaN(amount) || amount <= 0) {
    console.error("[paystack-charge] ❌ Invalid amount:", amountGHS);
    return res.status(400).json({ error: "Invalid amountGHS" });
  }

  const RATE = 0.0195;
  let chargeGHS = amount / (1 - RATE);
  chargeGHS = Math.ceil(chargeGHS * 100) / 100;
  const feeGHS = +(chargeGHS - amount).toFixed(2);
  const chargePesewas = Math.round(chargeGHS * 100);

  console.log("[paystack-charge] ✅ Calculated — charge:", chargeGHS, "fee:", feeGHS);
  res.status(200).json({
    success: true,
    originalAmount: amount,
    chargeGHS,
    feeGHS,
    chargePesewas,
  });
});

// ── 7. Staff & System Alerts ──────────────────────────────────
app.post("/api/alert-staff", async (req, res) => {
  const { type, clientId, note, orderNumber, orderValue, orderStatus, subject, recipientCount } = req.body;
  console.log("[alert-staff] called — type:", type, "| clientId:", clientId);

  const ADMIN_EMAIL     = process.env.ADMIN_EMAIL;
  const ASSISTANT_EMAIL = process.env.ASSISTANT_EMAIL || process.env.ADMIN_EMAIL;
  const DASH = "https://verps-chi.vercel.app/admin";
  const TERM = "https://verps-chi.vercel.app/assistant";

  let to, emailSubject, html;

  switch (type) {
    case "ASSISTANT_REQUEST":
    case "NEW_CHAT":
      to = ASSISTANT_EMAIL;
      emailSubject = "🔔 New Client Support Request";
      html = wrap("A Client Needs Help",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">A client is waiting for live support.</p>
         ${row("Client", clientId, "#ec5b13")}${note ? row("Message", note, "#fff") : ""}`,
        TERM, "OPEN TERMINAL");
      break;

    case "ESCALATION":
    case "PARTIAL_PUSH":
      to = ADMIN_EMAIL;
      emailSubject = "⚠️ Chat Escalation — Advice Needed";
      html = wrap("Partial Escalation Alert",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The assistant needs your guidance.</p>
         ${row("Client", clientId, "#ec5b13")}${row("Reason", note, "#f59e0b")}`,
        DASH, "OPEN ASSISTANT INBOX");
      break;

    case "ADMIN_TAKEOVER":
    case "FULL_PUSH":
      to = ADMIN_EMAIL;
      emailSubject = "🚨 URGENT — Full Admin Takeover Needed";
      html = wrap("Full Takeover Required",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The assistant has handed over a session.</p>
         ${row("Client", clientId, "#ec5b13")}${row("Reason", note, "#ef4444")}`,
        DASH + "#messages", "TAKE OVER CHAT");
      break;

    case "NEW_ORDER":
      to = ADMIN_EMAIL;
      emailSubject = `🛒 New Order Placed — ${orderNumber || clientId}`;
      html = wrap("New Order Received",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">A new order has been placed.</p>
         ${row("Client", clientId, "#ec5b13")}
         ${row("Order ID", orderNumber, "#38bdf8")}
         ${row("Value", orderValue ? `GH₵ ${Number(orderValue).toLocaleString()}` : "—", "#ec5b13")}
         ${row("Status", orderStatus || "ordered", "#a78bfa")}`,
        DASH + "#requests", "VIEW ORDERS");
      break;

    case "PUSH_BACK":
      to = ASSISTANT_EMAIL;
      emailSubject = "↩️ Session Returned — Resume with Client";
      html = wrap("Admin Has Pushed Back",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">Session returned to you.</p>
         ${row("Client", clientId, "#ec5b13")}${note ? row("Admin Note", note, "#38bdf8") : ""}`,
        TERM, "OPEN TERMINAL");
      break;

    case "PRIVATE_MESSAGE":
      to = ADMIN_EMAIL;
      emailSubject = "💬 New Private Message from Assistant";
      html = wrap("Assistant Sent a Private Message",
        `${clientId ? row("Re: Client", clientId, "#ec5b13") : ""}
         <div style="margin-top:14px;padding:14px;background:#111;border-radius:10px;border-left:3px solid #ec5b13;">
           <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.7;">${note || ""}</p>
         </div>`,
        DASH + "#channel", "OPEN ASSISTANT INBOX");
      break;

    case "BROADCAST":
      to = ADMIN_EMAIL;
      emailSubject = `📢 Broadcast Confirmed — "${(subject || "").slice(0, 40)}"`;
      html = wrap("Broadcast Delivered",
        `${row("Subject", subject || "(no subject)", "#38bdf8")}
         ${row("Recipients", recipientCount ? `${recipientCount} clients` : "All clients", "#22c55e")}`,
        null, null);
      break;

    default:
      to = ADMIN_EMAIL;
      emailSubject = `[VAULT] ${type}`;
      html = wrap(`Alert: ${type}`,
        `${clientId ? row("Client", clientId, "#ec5b13") : ""}${note ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:12px;">${note}</p>` : ""}`,
        DASH, "OPEN DASHBOARD");
  }

  try {
    console.log("[alert-staff] Sending email — type:", type, "→ to:", to);
    await sendEmail({
      from: "VERP System <onboarding@resend.dev>",
      to,
      subject: emailSubject,
      html,
    });
    console.log(`[alert-staff] ✅ [${type}] → ${to}`);
    res.status(200).json({ success: true, type, to });
  } catch (err) {
    console.error(`[alert-staff] ❌ [${type}] failed:`, err.message);
    res.status(500).json({ error: err.message, type });
  }
});

// ── 8. Admin: Return Requests ─────────────────────────────────
app.get("/api/admin/return-requests", async (req, res) => {
  const { email, password } = req.query;
  console.log("[return-requests] called — email:", email);
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();

  if (email?.toLowerCase().trim() !== adminEmail || password !== process.env.ADMIN_PASS) {
    console.error("[return-requests] ❌ Unauthorized access attempt — email:", email);
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const { data, error } = await supabase
      .from("verp_return_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[return-requests] ❌ DB error:", error.message);
      throw error;
    }
    console.log("[return-requests] ✅ Returned", data?.length, "records");
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  console.log("[health] ping received");
  res.json({ status: "active", server: "Vault v2", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Vault Server on port ${PORT}`));
module.exports = app;