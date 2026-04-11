const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { randomInt } = require("crypto");
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
app.set("trust proxy", 1);

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
   "https://verpembodiments.com",

  "http://192.168.0.3:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(" [CORS]  Blocked origin — request rejected");
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

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour window
  max: 5,                      // max 5 signup attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Please try again later." },
});

// ══════════════════════════════════════════════════════════════
//  AUTH MIDDLEWARE
// ══════════════════════════════════════════════════════════════

const requireInternalSecret = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    console.error("[auth]  Invalid or missing x-internal-secret");
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

const requireAdminHeader = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    console.error("[auth]  Missing Authorization header");
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
      console.error("[auth]  Admin credentials mismatch");
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  } catch (e) {
    console.error("[auth]  Authorization header parse error");
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
  if (err) console.error("[SMTP] Email transporter error:", err.message);
});

// ── HTML Email Wrapper ─────────────────────────────────────────
const wrap = (title, body, ctaUrl, ctaLabel) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 16px;">
  <div style="background:#0a0a0a;border:1px solid rgba(236,91,19,0.4);border-radius:16px;overflow:hidden;">
    <div style="background:#080808;padding:22px 28px;border-bottom:1px solid rgba(255,255,255,0.05);">
      <h1 style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:26px;color:#ec5b13;">Verp</h1>
      <p style="margin:4px 0 0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.25);">SYSTEM NOTIFICATION</p>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 14px;font-size:17px;font-weight:700;color:#fff;">${title}</h2>
      ${body}
      ${ctaUrl ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;background:#ec5b13;color:#000;text-decoration:none;font-weight:700;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;border-radius:10px;">${ctaLabel || "OPEN DASHBOARD"}</a></div>` : ""}
    </div>
    <div style="padding:14px 28px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
      <p style="margin:0;font-size:8px;color:rgba(255,255,255,0.12);letter-spacing:0.2em;text-transform:uppercase;">VERP AUTOMATED SYSTEM · DO NOT REPLY</p>
    </div>
  </div>
</div></body></html>`;

const row = (label, value, color) =>
  `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
    <span style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.15em;">${label}</span>
    <span style="font-size:11px;font-weight:600;color:${color || "#fff"};">${value || "—"}</span>
  </div>`;

  
app.get('/sitemap.xml', async (req, res) => {
  const staticPaths = ['/', '/about'];
  let allPaths = [...staticPaths];

  try {
    const { data, error } = await supabase
      .from('verp_categories')
      .select('name');

    if (!error && data) {
      const categoryPaths = data.map(({ name }) =>`/category/${name}`);
      allPaths = [...allPaths, ...categoryPaths];
    }
  } catch (_) {}

  const baseUrl = 'https://verpembodiments.com';
  const urls = allPaths
    .map(path =>  ` <url><loc>${baseUrl}${path}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  res.send(xml);
});

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
  console.error("[staff-login]  Invalid credentials");
  res.status(401).json({ success: false, error: "Invalid email or password" });
});

// ── 2. OTP Delivery ───────────────────────────────────────────
app.post("/api/send-otp", otpSendLimiter, async (req, res) => {
  const { email, type } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email required" });
  }

  const cleanEmail = email.toLowerCase().trim();

  // ── Email format guard ──────────────────────────────────────
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: "Valid email address required." });
  }

  // ── Domain whitelist — exact match prevents subdomain bypass ──
  const emailDomain = cleanEmail.split("@")[1];
  const ALLOWED_DOMAINS = ["gmail.com"];
  if (!ALLOWED_DOMAINS.includes(emailDomain)) {
    return res.status(400).json({
      success: false,
      error: "Only Gmail addresses (@gmail.com) are accepted at this time.",
    });
  }

  try {
    const { data: user, error: fetchErr } = await supabase
      .from("verp_users")
      .select("id, otp_code, otp_expiry, otp_last_sent, otp_send_count, otp_locked_until")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchErr) {
      console.error("[send-otp]  DB fetch failed:", fetchErr.message);
      return res.status(500).json({ success: false, error: "Failed to prepare OTP" });
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

      // Only enforce cooldown if user still has a live, unexpired code
      const hasActiveCode = user.otp_code && user.otp_expiry && new Date() < new Date(user.otp_expiry);
      if (hasActiveCode && user.otp_last_sent) {
        const secondsSinceLast = (now - new Date(user.otp_last_sent)) / 1000;
        if (secondsSinceLast < 60) {
          return res.status(429).json({
            success: false,
            error: "Please wait a moment before requesting a new code.",
          });
        }
      }

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentSends = (user.otp_last_sent && new Date(user.otp_last_sent) > tenMinutesAgo)
        ? (user.otp_send_count || 0)
        : 0;

      if (recentSends >= 3) {
        const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
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

    const otp       = randomInt(100000, 1000000).toString();
    const otpHash   = await bcrypt.hash(otp, SALT_ROUNDS);
    const expiry    = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now       = new Date();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentSends = user && user.otp_last_sent && new Date(user.otp_last_sent) > tenMinutesAgo
      ? (user.otp_send_count || 0)
      : 0;

    const { error: dbErr } = await supabase
      .from("verp_users")
      .update({
        otp_code:         otpHash,
        otp_expiry:       expiry,
        otp_attempts:     0,
        otp_last_sent:    now.toISOString(),
        otp_send_count:   recentSends + 1,
        otp_locked_until: null,
      })
      .eq("email", cleanEmail);

    if (dbErr) {
      console.error("[send-otp]  DB save failed:", dbErr.message);
      return res.status(500).json({ success: false, error: "Failed to prepare OTP" });
    }

    await transporter.sendMail({
      from: `"VERP Security" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[${otp}] Your Verp Access Code`,
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

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[send-otp]  CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ success: false, error: "Failed to deliver OTP" });
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
      console.error("[verify-otp]  Supabase error:", error.message);
      return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
    if (!data) return res.status(404).json({ message: "No account found for this email." });

    if (!data.otp_code) {
      // Reset attempts so user can cleanly request a new code without being locked
      await supabase.from("verp_users").update({ otp_attempts: 0 }).eq("id", data.id);
      return res.status(400).json({ message: "No active code — please tap Resend Code to get a fresh one." });
    }

    const attempts = data.otp_attempts || 0;
    if (attempts >= 5) {
      return res.status(429).json({ message: "Too many incorrect attempts — please request a new code." });
    }

    if (data.otp_expiry && new Date() > new Date(data.otp_expiry)) {
      await supabase
        .from("verp_users")
        .update({ otp_code: null, otp_expiry: null, otp_attempts: 0 })
        .eq("id", data.id);
      console.error("[verify-otp]  OTP expired");
      return res.status(400).json({ message: "Code expired — please request a new one." });
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), String(data.otp_code).trim());

    if (!isMatch) {
      await supabase
        .from("verp_users")
        .update({ otp_attempts: attempts + 1 })
        .eq("id", data.id);
      console.error("[verify-otp]  Code mismatch");
      return res.status(400).json({ message: "Incorrect code — please check and try again." });
    }

    // Atomic update — only succeeds if otp_code still exists (prevents race condition double-verify)
    const { data: atomicResult, error: atomicErr } = await supabase
      .from("verp_users")
      .update({ otp_code: null, otp_expiry: null, otp_attempts: 0, otp_verified: true })
      .eq("id", data.id)
      .not("otp_code", "is", null)
      .select("id");

    if (atomicErr || !atomicResult || atomicResult.length === 0) {
      return res.status(400).json({ message: "Code already used — please request a new one." });
    }

    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[verify-otp]  CAUGHT EXCEPTION:", e.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ── 4. Reset Password ─────────────────────────────────────────
app.post("/api/reset-password", resetLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and new password required." });
  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  if (password.length > 128)
    return res.status(400).json({ message: "Password must be 128 characters or fewer." });

  try {
    const { data: user, error: fetchErr } = await supabase
      .from("verp_users")
      .select("id, otp_verified")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (fetchErr) {
      console.error("[reset-password]  DB fetch error:", fetchErr.message);
      return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
    if (!user) return res.status(404).json({ message: "No account found for this email." });

    if (!user.otp_verified) {
      console.error("[reset-password]  OTP verification step not completed");
      return res.status(400).json({ message: "Session expired — please verify your code first." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { error: updateErr } = await supabase
      .from("verp_users")
      .update({ password_hash, otp_verified: false, otp_attempts: 0 })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[reset-password]  update failed:", updateErr.message);
      return res.status(500).json({ message: "Failed to save new password. Please try again." });
    }

    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[reset-password]  CAUGHT EXCEPTION:", e.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
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
      console.error("[verify-payment]  Payment not verified by Paystack");
      return res.status(400).json({ success: false, message: "Payment not verified" });
    }

    if (expectedEmail) {
      const paidEmail = (data.data.customer?.email || "").toLowerCase().trim();
      const wantEmail = expectedEmail.toLowerCase().trim();
      if (paidEmail !== wantEmail) {
        console.error("[verify-payment]  Email mismatch");
        return res.status(400).json({ success: false, message: "Payment email mismatch" });
      }
    }

    if (expectedAmount) {
      const paidGHS     = data.data.amount / 100;
      const expectedGHS = parseFloat(expectedAmount);
      if (Math.abs(paidGHS - expectedGHS) > 0.5) {
        console.error("[verify-payment]  Amount mismatch");
        return res.status(400).json({ success: false, message: "Payment amount mismatch" });
      }
    }

    res.status(200).json({ success: true, data: data.data });

  } catch (err) {
    console.error("[verify-payment]  CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ error: "Payment verification failed. Please try again." });
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
 const DASH = "https://verpembodiments.com/sys/console/admin";
const TERM = "https://verpembodiments.com/sys/console/terminal";
  let to, emailSubject, html;

  switch (type) {
    case "ASSISTANT_REQUEST":
    case "NEW_CHAT":
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
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
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
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
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
      emailSubject = "🚨 URGENT — Full Admin Takeover Needed";
      html = wrap(
        "Full Takeover Required",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The assistant has handed over a session. The client is waiting — please continue the conversation seamlessly.</p>
         ${row("Client", clientId, "#ec5b13")}${row("Reason", note, "#ef4444")}`,
        DASH + "#messages", "TAKE OVER CHAT",
      );
      break;

    case "NEW_ORDER":
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
      emailSubject = `🛒 New Order Placed — ${orderNumber || clientId}`;
      html = wrap(
        "New Order Received",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">A new order has been placed in the Verp.</p>
         ${row("Client", clientId, "#ec5b13")}
         ${row("Order ID", orderNumber, "#38bdf8")}
         ${row("Value", orderValue ? `GH₵ ${Number(orderValue).toLocaleString()}` : "—", "#ec5b13")}
         ${row("Status", orderStatus || "ordered", "#a78bfa")}`,
        DASH + "#requests", "VIEW ORDERS",
      );
      break;

    case "PUSH_BACK":
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
      emailSubject = "↩️ Session Returned — Resume with Client";
      html = wrap(
        "Admin Has Pushed Back",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">The admin is done advising. The session has been returned to you — please resume with the client.</p>
         ${row("Client", clientId, "#ec5b13")}${note ? row("Admin Note", note, "#38bdf8") : ""}`,
        TERM, "OPEN TERMINAL",
      );
      break;

    case "PRIVATE_MESSAGE":
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
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
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
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

    // ── NEW_REVIEW: a client submitted a product rating ───────
    // Fires once per review submission — no loop risk.
    // DB write already happened client-side before this call.
    // This endpoint only sends the notification email.
    case "NEW_REVIEW": {
      // Sanitise inputs — never trust the body directly in email HTML
      const safeClient  = String(clientId  || "—").replace(/[<>"'&]/g, "");
      const safeNote    = String(note       || "—").replace(/[<>"'&]/g, "");
      const safeOrder   = String(orderNumber || "—").replace(/[<>"'&]/g, "");

      to           = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
      emailSubject = `⭐ New Product Review — ${safeOrder}`;
      html = wrap(
        "A New Review Has Been Submitted",
        `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">
           A customer has rated a product. It is waiting in the moderation inbox.
         </p>
         ${row("Client",  safeClient, "#ec5b13")}
         ${row("Detail",  safeNote,   "#38bdf8")}
         ${row("Order",   safeOrder,  "#a78bfa")}
         <div style="margin-top:16px;padding:14px;background:#111;border-radius:10px;border-left:3px solid #ec5b13;">
           <p style="margin:0;color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">
             Next Steps
           </p>
           <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.7;">
             <strong style="color:#38bdf8;">Assistant:</strong> Open the Review Inbox and add your triage note.<br>
             <strong style="color:#ec5b13;">Admin:</strong> Review the assistant note, then Accept or Decline.
           </p>
         </div>`,
        DASH + "#reviews",
        "OPEN REVIEW INBOX",
      );
      break;
    }
    // ── end NEW_REVIEW ─────────────────────────────────────────

    default:
      to = `${ADMIN_EMAIL}, ${ASSISTANT_EMAIL}`;
      emailSubject = `[VERP] ${type}`;
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
    console.error(`[alert-staff]  [${type}] failed:`, err.message);
    res.status(500).json({ error: "Failed to send alert. Please try again." });
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
      console.error("[return-requests]  DB error:", error.message);
      return res.status(500).json({ error: "Failed to fetch return requests." });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[return-requests]  CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── 9. Update Order Status ────────────────────────────────────
app.post("/api/update-order-status", requireAdminHeader, async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: "orderId and status are required" });
  }

  const VALID = ["ordered", "pending", "processing", "shipped", "delivered", "returned", "cancelled"];
  if (!VALID.includes(status.toLowerCase())) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID.join(", ")}` });
  }

  try {
    const updates = { status: status.toLowerCase() };

    if (status.toLowerCase() === "delivered") {
      updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("verp_orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("[update-order-status]  DB error:", error.message);
      return res.status(500).json({ error: "Failed to update order status. Please try again." });
    }

    console.log(`[update-order-status]  Status updated → ${status}`);
    res.status(200).json({ success: true, order: data });

  } catch (err) {
    console.error("[update-order-status]  CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ── 10. Send Client Email (order status & return decisions) ───
// Called from the frontend ClientRequests / ClientMessages components.
// requireInternalSecret keeps it locked to your own app.
app.post("/api/send-email", requireInternalSecret, async (req, res) => {
  const { to, subject, html } = req.body || {};

  if (!to || typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ success: false, error: "Invalid or missing recipient email." });
  }
  if (!subject || typeof subject !== "string") {
    return res.status(400).json({ success: false, error: "Missing subject." });
  }
  if (!html || typeof html !== "string") {
    return res.status(400).json({ success: false, error: "Missing HTML body." });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Verp" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      // Plain-text fallback — strips tags so email clients that need it are covered
      text: html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim(),
    });
    console.log("[send-email]  Email delivered successfully");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[send-email] ", err.message);
    res.status(500).json({ success: false, error: "Failed to deliver email. Please try again." });
  }
});

// ── 11. Update Return Request Status + auto-email client ──────
// Single endpoint so the DB write and email fire together server-side.
// No loop risk: DB is written here, email is sent here — nothing calls back in.
app.post("/api/update-return-status", requireInternalSecret, async (req, res) => {
  const { returnId, status, orderId } = req.body || {};

  const VALID_STATUSES = ["pending", "reviewing", "approved", "rejected", "completed"];
  // Statuses that trigger a client-facing email
  const EMAIL_STATUSES = { approved: true, rejected: true, completed: true };
  // Statuses that require syncing the parent order
  const ORDER_STATUS_MAP = { approved: "returned", completed: "returned", rejected: "delivered" };

  if (!returnId || !status) {
    return res.status(400).json({ success: false, error: "returnId and status are required." });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  try {
    // ── 1. Fetch the return request row ──
    const { data: req_, error: fetchErr } = await supabase
      .from("verp_return_requests")
      .select("*")
      .eq("id", returnId)
      .maybeSingle();

    if (fetchErr || !req_) {
      console.error("[update-return-status]  Fetch error:", fetchErr?.message);
      return res.status(404).json({ success: false, error: "Return request not found." });
    }

    // ── 2. Update the return request in DB ──
    const resolved_at = EMAIL_STATUSES[status] ? new Date().toISOString() : null;
    const { error: updateErr } = await supabase
      .from("verp_return_requests")
      .update({ status, resolved_at })
      .eq("id", returnId);

    if (updateErr) {
      console.error("[update-return-status]  Update error:", updateErr.message);
      return res.status(500).json({ success: false, error: "Failed to update return request." });
    }

    // ── 3. Sync parent order status if needed ──
    const targetOrderId = orderId || req_.order_id;
    if (targetOrderId && ORDER_STATUS_MAP[status]) {
      await supabase
        .from("verp_orders")
        .update({ status: ORDER_STATUS_MAP[status] })
        .eq("id", targetOrderId);
    }

    // ── 4. Send client email for approved / rejected / completed ──
    if (EMAIL_STATUSES[status]) {
      const clientEmail = req_.customer_email;
      if (clientEmail) {
        const orderNum = req_.order_number || req_.order_id?.slice(0, 8) || "—";
        const amount   = Number(req_.total_amount || 0).toLocaleString();
        const name     = clientEmail.split("@")[0];

        const CFG = {
          approved: {
            color: "#22c55e", icon: "✅",
            banner: "RETURN APPROVED",
            headline: "Your Return Has Been Approved",
            subline: "A decision has been reached. Please read the next steps carefully.",
            body: `Following our review, your return request for order <strong style="color:#22c55e">${orderNum}</strong> has been <strong style="color:#22c55e">approved</strong>. To proceed, please ship the item(s) back to us using a trackable delivery method and retain your proof of postage. Once the item is received and inspected by our team, your refund of <strong style="color:#22c55e">GH₵ ${amount}</strong> will be formally processed — you will receive a final confirmation at that stage.`,
            note: "Approval is subject to the returned item passing physical inspection upon receipt. Please ensure items are securely packaged and in their original condition.",
            emailSubject: `Return Approved — Next Steps for Order ${orderNum}`,
          },
          rejected: {
            color: "#ef4444", icon: "❌",
            banner: "RETURN REQUEST DECLINED",
            headline: "Return Request Not Approved",
            subline: "We were unable to process your return request at this time.",
            body: `After careful review, your return for order <strong style="color:#ef4444">${orderNum}</strong> has been <strong style="color:#ef4444">declined</strong>. This may be due to the item falling outside our return window, signs of use beyond our policy, or missing packaging. If you believe this is an error, please contact our support team.`,
            note: "We understand this may be disappointing — our team is here to help clarify.",
            emailSubject: `Return Request for Order ${orderNum} — Decision Notice`,
          },
          completed: {
            color: "#a78bfa", icon: "🎉",
            banner: "RETURN FULLY PROCESSED",
            headline: "Your Return Has Been Completed",
            subline: "Everything has been resolved — thank you for your patience.",
            body: `We're happy to confirm that the return for order <strong style="color:#a78bfa">${orderNum}</strong> is <strong style="color:#a78bfa">fully complete</strong>. Your refund of <strong style="color:#a78bfa">GH₵ ${amount}</strong> has been issued and should reflect in your account within 3–5 business days depending on your payment provider.`,
            note: "Thank you for shopping with us — your satisfaction is our priority.",
            emailSubject: `Return Completed — Refund Issued for Order ${orderNum} 🎉`,
          },
        };

        const c = CFG[status];

        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;min-height:100vh;">
<tr><td align="center" style="padding:40px 20px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <tr><td align="center" style="padding-bottom:28px;">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.42em;text-transform:uppercase;color:rgba(255,255,255,0.15);">VERP · RETURNS &amp; REFUNDS</p>
    </td></tr>

    <tr><td style="background:linear-gradient(135deg,#0d0d0d,#111);border-radius:24px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <!-- accent line -->
        <tr><td style="height:3px;background:linear-gradient(90deg,${c.color},transparent);"></td></tr>

        <!-- hero -->
        <tr><td style="background:linear-gradient(135deg,${c.color}14,${c.color}04);padding:28px 36px 22px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <p style="margin:0 0 9px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.38em;text-transform:uppercase;color:${c.color};">${c.banner}</p>
              <p style="margin:0 0 7px;font-size:25px;font-weight:300;color:#fff;letter-spacing:-0.3px;line-height:1.25;">${c.headline}</p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.38);line-height:1.6;">${c.subline}</p>
            </td>
            <td align="right" valign="middle" style="padding-left:18px;width:52px;"><div style="font-size:38px;line-height:1;text-align:center;display:block;">${c.icon}</div></td>
          </tr></table>
        </td></tr>

        <!-- order strip -->
        <tr><td style="padding:20px 36px;border-bottom:1px solid rgba(255,255,255,0.04);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:50%;">
              <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.22);">RETURN REF</p>
              <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:${c.color};font-weight:700;">${orderNum}</p>
            </td>
            <td align="right">
              <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.22);">ORDER VALUE</p>
              <p style="margin:0;font-size:19px;font-weight:700;color:${c.color};">GH₵ ${amount}</p>
            </td>
          </tr></table>
        </td></tr>

        <!-- body -->
        <tr><td style="padding:24px 36px 18px;">
          <p style="margin:0 0 13px;font-size:13px;color:rgba(255,255,255,0.82);line-height:1.7;">Dear <strong style="color:#fff;">${name}</strong>,</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.58);line-height:1.85;">${c.body}</p>
        </td></tr>

        <!-- italic note -->
        <tr><td style="padding:0 36px 24px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);font-style:italic;line-height:1.65;border-left:2px solid ${c.color}35;padding-left:14px;">${c.note}</p>
        </td></tr>

        <!-- status chip -->
        <tr><td style="padding:0 36px 28px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:${c.color}16;border:1px solid ${c.color}45;border-radius:999px;padding:6px 18px;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:8px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${c.color};">RETURN STATUS: ${status.toUpperCase()}</p>
            </td>
          </tr></table>
        </td></tr>
      </table>

    </td></tr>

    <tr><td align="center" style="padding:28px 20px 0;">
      <p style="margin:0 0 7px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.4em;text-transform:uppercase;color:rgba(255,255,255,0.1);">VERP EXECUTIVE COLLECTION</p>
      <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.08);line-height:1.7;">Automated message from the Verp Returns System. For questions, contact our support team.</p>
    </td></tr>

  </table>
</td></tr>
</table>
</body></html>`;

        try {
          await transporter.sendMail({
            from: `"Verp" <${process.env.GMAIL_USER}>`,
            to: clientEmail,
            subject: c.emailSubject,
            html,
            text: html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim(),
          });
          console.log(`[update-return-status]  Client email sent for status: ${status}`);
        } catch (emailErr) {
          // Non-fatal — DB was already updated, log and continue
          console.error(`[update-return-status]  Email failed (non-fatal): ${emailErr.message}`);
        }
      }
    }

    console.log(`[update-return-status]  Status updated → ${status}`);
    res.status(200).json({ success: true, returnId, status });

  } catch (err) {
    console.error("[update-return-status]  CAUGHT EXCEPTION:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
  }
});

// ── 12. Register — server-side validation + upsert ──────────
// This is the single source of truth for signup data.
// The frontend sends name + email + password; the server validates,
// hashes, and writes to Supabase using the SERVICE KEY (not anon key).
// The frontend never writes to verp_users directly after this endpoint exists.
app.post("/api/register", registerLimiter, async (req, res) => {
  const { fullName, email, password } = req.body || {};

  // ── 1. Presence checks ──────────────────────────────────────
  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return res.status(400).json({ success: false, error: "Full name is required." });
  }
  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "Email is required." });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, error: "Password is required." });
  }

  const cleanName  = fullName.trim();
  const cleanEmail = email.toLowerCase().trim();

  // ── 2. Name validation — letters, spaces, hyphens, apostrophes only ──
  if (cleanName.length < 2) {
    return res.status(400).json({ success: false, error: "Name must be at least 2 characters." });
  }
  if (cleanName.length > 60) {
    return res.status(400).json({ success: false, error: "Name must be 60 characters or fewer." });
  }
  if (!/^[A-Za-z\s'\-]+$/.test(cleanName)) {
    return res.status(400).json({ success: false, error: "Name must contain letters only — no numbers or symbols." });
  }

  // ── 3. Email format + domain whitelist ──────────────────────
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: "Valid email address required." });
  }
  const emailDomain = cleanEmail.split("@")[1];
  const ALLOWED_DOMAINS = ["gmail.com"];
  if (!ALLOWED_DOMAINS.includes(emailDomain)) {
    return res.status(400).json({ success: false, error: "Only Gmail addresses (@gmail.com) are accepted." });
  }

  // ── 4. Password strength ────────────────────────────────────
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
  }
  if (password.length > 128) {
    return res.status(400).json({ success: false, error: "Password must be 128 characters or fewer." });
  }

  try {
    // ── 5. Check for existing verified account ─────────────────
    const { data: existing, error: lookupErr } = await supabase
      .from("verp_users")
      .select("id, is_verified")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (lookupErr) {
      console.error("[register]  DB lookup error");
      return res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }

    if (existing?.is_verified) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    // ── 6. Hash password — server-side only, never touched by frontend ──
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const otp_expiry    = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // ── 7. Upsert user record (handles re-signup of unverified accounts) ──
    const { error: upsertErr } = await supabase
      .from("verp_users")
      .upsert(
        {
          email:         cleanEmail,
          full_name:     cleanName,
          password_hash,
          is_verified:   false,
          otp_expiry,
        },
        { onConflict: "email" }
      );

    if (upsertErr) {
      console.error("[register]  DB upsert error");
      return res.status(500).json({ success: false, error: "Failed to create account. Please try again." });
    }

    // ── 8. Send OTP via existing send-otp logic ─────────────────
    // Generate OTP here so register is fully self-contained
    const otp     = randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const expiry  = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: otpErr } = await supabase
      .from("verp_users")
      .update({
        otp_code:         otpHash,
        otp_expiry:       expiry,
        otp_attempts:     0,
        otp_last_sent:    new Date().toISOString(),
        otp_send_count:   1,
        otp_locked_until: null,
      })
      .eq("email", cleanEmail);

    if (otpErr) {
      console.error("[register]  OTP save error");
      return res.status(500).json({ success: false, error: "Account created but failed to send verification code. Please use Resend." });
    }

    try {
      await transporter.sendMail({
        from: `"VERP Security" <${process.env.GMAIL_USER}>`,
        to: cleanEmail,
        subject: `[${otp}] Your Verp Verification Code`,
        html: wrap(
          "Verify Your Account",
          `<p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;">Welcome to Verp, <strong style="color:#ec5b13;">${cleanName}</strong>. Your verification code is:</p>
           <div style="margin:20px 0;text-align:center;padding:20px;background:#111;border-radius:12px;border:1px solid rgba(236,91,19,0.2);">
             <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#fff;font-family:monospace;">${otp}</span>
           </div>
           <p style="color:rgba(255,255,255,0.3);font-size:11px;">Expires in 10 minutes. Do not share this code.</p>`,
          null, null,
        ),
      });
    } catch (mailErr) {
      // Non-fatal — account + OTP are already saved to DB.
      // User can request a resend from the OTP screen.
      console.error("[register] Verification email failed (non-fatal):", mailErr.message);
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("[register] CAUGHT EXCEPTION");
    res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "active", server: "Verp v2", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.error(` Verp Server on port ${PORT}`));
module.exports = app;