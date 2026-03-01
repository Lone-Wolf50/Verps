const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const SALT_ROUNDS = 12;
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(express.json());

// ── TRUST PROXY ───────────────────────────────────────────────
// Required when running behind Vercel / a reverse proxy.
// Without this, express-rate-limit sees every request as the same IP
// (the proxy's IP) and rate limiting effectively stops working.
// "1" means trust the first hop in the X-Forwarded-For chain only.
app.set("trust proxy", 1);

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
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error("🌐 [CORS] ❌ Blocked:", origin);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-internal-secret"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ══════════════════════════════════════════════════════════════
//  RATE LIMITERS
// ══════════════════════════════════════════════════════════════

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
app.use(globalLimiter);

const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP requests. Please wait before requesting another code." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Please wait." },
});

const staffLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reset attempts. Please try again later." },
});

// ══════════════════════════════════════════════════════════════
//  AUTH MIDDLEWARE
// ══════════════════════════════════════════════════════════════

const requireInternalSecret = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    console.error("[auth] ❌ Invalid or missing x-internal-secret");
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

const requireAdminHeader = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    console.error("[auth] ❌ Missing Authorization header");
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded  = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) throw new Error("Bad format");
    const email    = decoded.slice(0, colonIdx).toLowerCase().trim();
    const password = decoded.slice(colonIdx + 1);
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (email !== adminEmail || password !== process.env.ADMIN_PASS) {
      console.error("[auth] ❌ Admin credentials mismatch");
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  } catch (e) {
    console.error("[auth] ❌ Authorization parse error:", e.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// ── Transporter ───────────────────────────────────────────────
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
  if (err) console.error("❌ [SMTP] Email transporter error:", err.message);
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

// ── 1. Staff Login ─────────────────────────────────────────────
app.post("/api/staff-login", staffLoginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }
  const adminEmail     = (process.env.ADMIN_EMAIL     || "").toLowerCase().trim();
  const assistantEmail = (process.env.ASSISTANT_EMAIL || "").toLowerCase().trim();
  const em = String(email).toLowerCase().trim();

  if (em === adminEmail && password === process.env.ADMIN_PASS) {
    return res.status(200).json({ success: true, role: "admin", message: "Access Granted" });
  }
  if (em === assistantEmail && password === process.env.ASSISTANT_PASS) {
    return res.status(200).json({ success: true, role: "assistant", message: "Access Granted" });
  }
  console.error("[staff-login] ❌ Invalid credentials");
  res.status(401).json({ success: false, error: "Invalid email or password" });
});

// ── 2. OTP Delivery ───────────────────────────────────────────
app.post("/api/send-otp", otpSendLimiter, async (req, res) => {
  const { email, type } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email required" });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const { data: user, error: fetchErr } = await supabase
      .from("verp_users")
      .select("id, otp_last_sent, otp_send_count, otp_locked_until")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchErr) {
      console.error("[send-otp] ❌ DB fetch failed:", fetchErr.message);
      return res.status(500).json({ success: false, error: "Failed to prepare OTP", detail: fetchErr.message });
    }

    if (user) {
      const now = new Date();

      if (user.otp_locked_until && now < new Date(user.otp_locked_until)) {
        const minutesLeft = Math.ceil((new Date(user.otp_locked_until) - now) / 60000);
        return res.status(429).json({
          success: false,
          error: `For your security, this account is temporarily locked. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        });
      }

      if (user.otp_last_sent) {
        const secondsSinceLast = (now - new Date(user.otp_last_sent)) / 1000;
        if (secondsSinceLast < 60) {
          const wait = Math.ceil(60 - secondsSinceLast);
          return res.status(429).json({
            success: false,
            error: `Please wait ${wait} second${wait !== 1 ? "s" : ""} before requesting a new code.`,
          });
        }
      }

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentSends = (user.otp_last_sent && new Date(user.otp_last_sent) > tenMinutesAgo)
        ? (user.otp_send_count || 0)
        : 0;

      if (recentSends >= 3) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        await supabase
          .from("verp_users")
          .update({ otp_locked_until: lockedUntil })
          .eq("email", cleanEmail);
        return res.status(429).json({
          success: false,
          error: "Too many code requests. For your security, this account has been locked for 30 minutes.",
        });
      }
    }

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now    = new Date();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentSends = user && user.otp_last_sent && new Date(user.otp_last_sent) > tenMinutesAgo
      ? (user.otp_send_count || 0)
      : 0;

    const { error: dbErr } = await supabase
      .from("verp_users")
      .update({
        otp_code:        otp,
        otp_expiry:      expiry,
        otp_attempts:    0,
        otp_last_sent:   now.toISOString(),
        otp_send_count:  recentSends + 1,
        otp_locked_until: null,
      })
      .eq("email", cleanEmail);

    if (dbErr) {
      console.error("[send-otp] ❌ DB save failed:", dbErr.message);
      return res.status(500).json({ success: false, error: "Failed to prepare OTP", detail: dbErr.message });
    }

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
    console.error("[send-otp] ❌ CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ success: false, error: "Failed to deliver OTP", detail: err.message });
  }
});

// ── 3. OTP Verification ───────────────────────────────────────
app.post("/api/verify-otp", otpVerifyLimiter, async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: "Email and code required." });

  try {
    const { data, error } = await supabase
      .from("verp_users")
      .select("id, otp_code, otp_expiry, otp_attempts")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error("[verify-otp] ❌ Supabase error:", error.message);
      return res.status(500).json({ message: "DB error.", detail: error.message });
    }
    if (!data) return res.status(404).json({ message: "No account found for this email." });

    if (!data.otp_code) {
      return res.status(400).json({ message: "No active code — please request a new one." });
    }

    const attempts = data.otp_attempts || 0;
    if (attempts >= 5) {
      return res.status(429).json({ message: "Too many incorrect attempts — please request a new code." });
    }

    if (String(data.otp_code).trim() !== String(otp).trim()) {
      await supabase
        .from("verp_users")
        .update({ otp_attempts: attempts + 1 })
        .eq("id", data.id);
      console.error("[verify-otp] ❌ Code mismatch — attempt", attempts + 1, "of 5");
      return res.status(400).json({ message: "Incorrect code — please check and try again." });
    }

    if (data.otp_expiry && new Date() > new Date(data.otp_expiry)) {
      console.error("[verify-otp] ❌ OTP expired");
      return res.status(400).json({ message: "Code expired — please request a new one." });
    }

    await supabase
      .from("verp_users")
      .update({ otp_attempts: 0 })
      .eq("id", data.id);

    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[verify-otp] ❌ CAUGHT EXCEPTION:", e.message);
    res.status(500).json({ message: "Server error during OTP check.", detail: e.message });
  }
});

// ── 4. Reset Password ─────────────────────────────────────────
app.post("/api/reset-password", resetLimiter, async (req, res) => {
  const { email, password } = req.body;

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

    if (fetchErr) return res.status(500).json({ message: "DB error.", detail: fetchErr.message });
    if (!user)    return res.status(404).json({ message: "No account found for this email." });

    if (!user.otp_code) {
      console.error("[reset-password] ❌ otp_code is NULL — session expired or flow broken");
      return res.status(400).json({ message: "Session expired — please start over." });
    }

    if (user.otp_expiry && new Date() > new Date(user.otp_expiry)) {
      console.error("[reset-password] ❌ OTP expired");
      return res.status(400).json({ message: "Session expired — please request a new code." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { error: updateErr } = await supabase
      .from("verp_users")
      .update({ password_hash, otp_code: null, otp_expiry: null, otp_attempts: 0 })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[reset-password] ❌ update failed:", updateErr.message);
      return res.status(500).json({ message: "Failed to save new password.", detail: updateErr.message });
    }

    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[reset-password] ❌ CAUGHT EXCEPTION:", e.message);
    res.status(500).json({ message: "Server error during password reset.", detail: e.message });
  }
});

// ── 5. Paystack Verification ──────────────────────────────────
app.post("/api/verify-payment", async (req, res) => {
  const { reference, expectedEmail, expectedAmount } = req.body;

  if (!reference) return res.status(400).json({ error: "Reference required" });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      console.error("[verify-payment] ❌ Payment not verified:", data?.data?.status);
      return res.status(400).json({ success: false, message: "Payment not verified", data: data.data });
    }

    if (expectedEmail) {
      const paidEmail = (data.data.customer?.email || "").toLowerCase().trim();
      const wantEmail = expectedEmail.toLowerCase().trim();
      if (paidEmail !== wantEmail) {
        console.error("[verify-payment] ❌ Email mismatch");
        return res.status(400).json({ success: false, message: "Payment email mismatch" });
      }
    }

    if (expectedAmount) {
      const paidGHS     = data.data.amount / 100;
      const expectedGHS = parseFloat(expectedAmount);
      if (Math.abs(paidGHS - expectedGHS) > 0.5) {
        console.error("[verify-payment] ❌ Amount mismatch — paid:", paidGHS, "| expected:", expectedGHS);
        return res.status(400).json({ success: false, message: "Payment amount mismatch" });
      }
    }

    res.status(200).json({ success: true, data: data.data });

  } catch (err) {
    console.error("[verify-payment] ❌ CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── 6. Paystack Charge Calculation ───────────────────────────
app.post("/api/paystack-charge", (req, res) => {
  const { amountGHS } = req.body;
  const amount = parseFloat(amountGHS);

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amountGHS" });
  }

  const RATE = 0.0195;
  let chargeGHS = amount / (1 - RATE);
  chargeGHS = Math.ceil(chargeGHS * 100) / 100;
  const feeGHS = +(chargeGHS - amount).toFixed(2);
  const chargePesewas = Math.round(chargeGHS * 100);

  res.status(200).json({
    success: true,
    originalAmount: amount,
    chargeGHS,
    feeGHS,
    chargePesewas,
  });
});

// ── 7. Staff & System Alerts ──────────────────────────────────
app.post("/api/alert-staff", requireInternalSecret, async (req, res) => {
  const { type, clientId, note, orderNumber, orderValue, orderStatus, subject, recipientCount } = req.body;

  const ADMIN_EMAIL     = process.env.ADMIN_EMAIL     || process.env.GMAIL_USER;
  const ASSISTANT_EMAIL = process.env.ASSISTANT_EMAIL || process.env.GMAIL_USER;
  const DASH = "https://verps-chi.vercel.app/sys/console/admin";
  const TERM = "https://verps-chi.vercel.app/sys/console/terminal";

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
    res.status(200).json({ success: true, type, to });
  } catch (err) {
    console.error(`[alert-staff] ❌ [${type}] failed:`, err.message);
    res.status(500).json({ error: err.message, type });
  }
});

// ── 8. Admin: Return Requests ─────────────────────────────────
app.get("/api/admin/return-requests", requireAdminHeader, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("verp_return_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[return-requests] ❌ DB error:", error.message);
      throw error;
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "active", server: "Vault v2", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.error(`🚀 Vault Server on port ${PORT}`));
module.exports = app;