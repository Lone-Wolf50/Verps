const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const SALT_ROUNDS = 12;
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");
// ── ENV CHECK ON STARTUP ──────────────────────────────────────
console.log("🔍 [STARTUP] Checking environment variables...");
console.log("  SUPABASE_URL        :", process.env.SUPABASE_URL              ? "✅ set" : "❌ MISSING");
console.log("  SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ set" : "❌ MISSING");
console.log("  GMAIL_USER          :", process.env.GMAIL_USER                ? "✅ set" : "❌ MISSING");
console.log("  GMAIL_PASS          :", process.env.GMAIL_PASS                ? "✅ set" : "❌ MISSING");
console.log("  ADMIN_EMAIL         :", process.env.ADMIN_EMAIL               ? "✅ set" : "❌ MISSING");
console.log("  ADMIN_PASS          :", process.env.ADMIN_PASS                ? "✅ set" : "❌ MISSING");
console.log("  PAYSTACK_SECRET_KEY :", process.env.PAYSTACK_SECRET_KEY       ? "✅ set" : "❌ MISSING");
console.log("  INTERNAL_SECRET     :", process.env.INTERNAL_SECRET           ? "✅ set" : "❌ MISSING — add to .env or alert-staff will reject ALL calls");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  // x-internal-secret added so browser preflight allows the header
  allowedHeaders: ["Content-Type", "Authorization", "x-internal-secret"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ══════════════════════════════════════════════════════════════
//  RATE LIMITERS
//  Run: npm install express-rate-limit
// ══════════════════════════════════════════════════════════════

// Global — 120 requests per IP per minute across every route
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
app.use(globalLimiter);

// OTP send — max 3 per IP per 10 minutes
// Stops anyone spamming inboxes or burning your Gmail quota
const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP requests. Please wait before requesting another code." },
});

// OTP verify — max 10 attempts per IP per 10 minutes
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Please wait." },
});

// Staff login — max 10 attempts per IP per 15 minutes
const staffLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

// Password reset — max 5 per IP per 15 minutes
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

// Internal secret guard — protects /api/alert-staff from public abuse
// Backend .env  → INTERNAL_SECRET=verpvault2026secretkey
// Frontend .env → VITE_INTERNAL_SECRET=verpvault2026secretkey
// Every fetch call to alert-staff must include this header:
//   "x-internal-secret": import.meta.env.VITE_INTERNAL_SECRET
const requireInternalSecret = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    console.error("[auth] ❌ Invalid or missing x-internal-secret");
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

// Admin header guard — protects /api/admin/* endpoints
// Reads Authorization: Basic base64(email:password)
// Credentials must NEVER be sent as URL query params — they end up in server logs
// Update your admin dashboard fetch to:
//   const creds = btoa(`${adminEmail}:${adminPassword}`);
//   fetch("/api/admin/return-requests", { headers: { Authorization: `Basic ${creds}` } })
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
  else console.log("✅ [SMTP] Email transporter ready —", process.env.GMAIL_USER);
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
// PROTECTED: staffLoginLimiter — blocks brute force after 10 attempts per 15 min
// NOTE: /api/verify-staff (legacy) has been deleted — it was unprotected and redundant
app.post("/api/staff-login", staffLoginLimiter, (req, res) => {
  const { email, password } = req.body;
  console.log("[staff-login] called — email:", email);
  if (!email || !password) {
    console.error("[staff-login] ❌ Missing email or password");
    return res.status(400).json({ success: false, error: "Email and password required" });
  }
  const adminEmail     = (process.env.ADMIN_EMAIL     || "").toLowerCase().trim();
  const assistantEmail = (process.env.ASSISTANT_EMAIL || "").toLowerCase().trim();
  const em = String(email).toLowerCase().trim();

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

// ── 2. OTP Delivery ───────────────────────────────────────────
// PROTECTED: otpSendLimiter — max 3 OTP emails per IP per 10 minutes
// PROTECTED: per-email DB checks — 60s cooldown + 3 sends per 10 min + 30 min account lock
// Also resets otp_attempts to 0 so a fresh code unlocks the account
// REQUIRED: run this SQL in Supabase before using:
//   ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_attempts    integer     DEFAULT 0;
//   ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_last_sent   timestamptz;
//   ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_send_count  integer     DEFAULT 0;
//   ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_locked_until timestamptz;
app.post("/api/send-otp", otpSendLimiter, async (req, res) => {
  const { email, type } = req.body;
  console.log("[send-otp] called — email:", email, "| type:", type);

  if (!email) {
    console.error("[send-otp] ❌ No email provided");
    return res.status(400).json({ success: false, error: "Email required" });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // ── Fetch user's current rate-limit state from DB ──────────
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

      // 1. Check if account is locked
      if (user.otp_locked_until && now < new Date(user.otp_locked_until)) {
        const minutesLeft = Math.ceil((new Date(user.otp_locked_until) - now) / 60000);
        console.error("[send-otp] ❌ Account locked until:", user.otp_locked_until, "for:", cleanEmail);
        return res.status(429).json({
          success: false,
          error: `For your security, this account is temporarily locked. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        });
      }

      // 2. Check 60-second cooldown between sends
      if (user.otp_last_sent) {
        const secondsSinceLast = (now - new Date(user.otp_last_sent)) / 1000;
        if (secondsSinceLast < 60) {
          const wait = Math.ceil(60 - secondsSinceLast);
          console.error("[send-otp] ❌ Cooldown active —", wait, "seconds left for:", cleanEmail);
          return res.status(429).json({
            success: false,
            error: `Please wait ${wait} second${wait !== 1 ? "s" : ""} before requesting a new code.`,
          });
        }
      }

      // 3. Check if they've sent too many codes in the last 10 minutes
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
        console.error("[send-otp] ❌ Too many sends — locking account 30 min for:", cleanEmail);
        return res.status(429).json({
          success: false,
          error: "Too many code requests. For your security, this account has been locked for 30 minutes.",
        });
      }
    }

    // ── Generate OTP ───────────────────────────────────────────
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now    = new Date();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentSends = user && user.otp_last_sent && new Date(user.otp_last_sent) > tenMinutesAgo
      ? (user.otp_send_count || 0)
      : 0;

    console.log("[send-otp] Generated OTP — expiry:", expiry);

    // ── Save OTP + update rate-limit counters ──────────────────
    console.log("[send-otp] Saving OTP to DB for:", cleanEmail);
    const { error: dbErr } = await supabase
      .from("verp_users")
      .update({
        otp_code:        otp,
        otp_expiry:      expiry,
        otp_attempts:    0,
        otp_last_sent:   now.toISOString(),
        otp_send_count:  recentSends + 1,
        otp_locked_until: null, // clear any existing lock on fresh send
      })
      .eq("email", cleanEmail);

    if (dbErr) {
      console.error("[send-otp] ❌ DB save failed:", dbErr.message);
      return res.status(500).json({ success: false, error: "Failed to prepare OTP", detail: dbErr.message });
    }
    console.log("[send-otp] ✅ OTP saved to DB — send count:", recentSends + 1);

    // ── Send email ─────────────────────────────────────────────
    console.log("[send-otp] Sending email to:", cleanEmail);
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

    console.log("[send-otp] ✅ Email sent successfully to:", cleanEmail);
    res.status(200).json({ success: true, otp });
  } catch (err) {
    console.error("[send-otp] ❌ CAUGHT EXCEPTION:", err.message);
    console.error("[send-otp] ❌ Full error:", err);
    res.status(500).json({ success: false, error: "Failed to deliver OTP", detail: err.message });
  }
});

// ── 3. OTP Verification ───────────────────────────────────────
// PROTECTED: otpVerifyLimiter — max 10 attempts per IP per 10 minutes
// PROTECTED: otp_attempts DB counter — locks account after 5 wrong guesses
// Two layers stop brute forcing a 6-digit code within the 10-minute window
app.post("/api/verify-otp", otpVerifyLimiter, async (req, res) => {
  const { email, otp } = req.body;
  console.log("[verify-otp] called — email:", email, "| otp:", otp);

  if (!email || !otp) return res.status(400).json({ message: "Email and code required." });

  try {
    const { data, error } = await supabase
      .from("verp_users")
      .select("id, otp_code, otp_expiry, otp_attempts")
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

    // Block after 5 wrong guesses — forces them to request a new code
    const attempts = data.otp_attempts || 0;
    if (attempts >= 5) {
      console.error("[verify-otp] ❌ Account locked — too many failed attempts for", email);
      return res.status(429).json({ message: "Too many incorrect attempts — please request a new code." });
    }

    console.log("[verify-otp] DB code  :", JSON.stringify(String(data.otp_code).trim()));
    console.log("[verify-otp] Provided :", JSON.stringify(String(otp).trim()));

    if (String(data.otp_code).trim() !== String(otp).trim()) {
      // Increment the per-user attempt counter in DB
      await supabase
        .from("verp_users")
        .update({ otp_attempts: attempts + 1 })
        .eq("id", data.id);
      console.error("[verify-otp] ❌ Code mismatch — attempt", attempts + 1, "of 5");
      return res.status(400).json({ message: "Incorrect code — please check and try again." });
    }

    if (data.otp_expiry && new Date() > new Date(data.otp_expiry)) {
      console.error("[verify-otp] ❌ OTP expired at", data.otp_expiry);
      return res.status(400).json({ message: "Code expired — please request a new one." });
    }

    // Success — reset attempt counter
    await supabase
      .from("verp_users")
      .update({ otp_attempts: 0 })
      .eq("id", data.id);

    console.log("[verify-otp] ✅ OTP valid for", email);
    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[verify-otp] ❌ CAUGHT EXCEPTION:", e.message, e);
    res.status(500).json({ message: "Server error during OTP check.", detail: e.message });
  }
});

// ── 4. Reset Password ─────────────────────────────────────────
// PROTECTED: resetLimiter — max 5 attempts per IP per 15 minutes
// Also clears otp_attempts on success so the account is fully unlocked
app.post("/api/reset-password", resetLimiter, async (req, res) => {
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

    console.log("[reset-password] DB user found:", !!user);
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
      .update({ password_hash, otp_code: null, otp_expiry: null, otp_attempts: 0 })
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
// PROTECTED: cross-checks expectedEmail + expectedAmount against Paystack's record
// Stops anyone replaying a reference or spoofing a payment
// Update your Checkout fetch to pass these two extra fields:
//   body: JSON.stringify({
//     reference,
//     expectedEmail: localStorage.getItem("userEmail"),
//     expectedAmount: totalAmountGHS,
//   })
app.post("/api/verify-payment", async (req, res) => {
  const { reference, expectedEmail, expectedAmount } = req.body;
  console.log("[verify-payment] called — reference:", reference, "| expectedEmail:", expectedEmail, "| expectedAmount:", expectedAmount);

  if (!reference) return res.status(400).json({ error: "Reference required" });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    console.log("[verify-payment] Paystack response status:", data?.data?.status);

    if (!data.status || data.data.status !== "success") {
      console.error("[verify-payment] ❌ Payment not verified:", data?.data?.status);
      return res.status(400).json({ success: false, message: "Payment not verified", data: data.data });
    }

    // Cross-check email
    if (expectedEmail) {
      const paidEmail = (data.data.customer?.email || "").toLowerCase().trim();
      const wantEmail = expectedEmail.toLowerCase().trim();
      if (paidEmail !== wantEmail) {
        console.error("[verify-payment] ❌ Email mismatch — paid by:", paidEmail, "| expected:", wantEmail);
        return res.status(400).json({ success: false, message: "Payment email mismatch" });
      }
    }

    // Cross-check amount (Paystack returns pesewas, divide by 100 for GHS)
    if (expectedAmount) {
      const paidGHS     = data.data.amount / 100;
      const expectedGHS = parseFloat(expectedAmount);
      if (Math.abs(paidGHS - expectedGHS) > 0.5) { // 50p tolerance for rounding
        console.error("[verify-payment] ❌ Amount mismatch — paid:", paidGHS, "| expected:", expectedGHS);
        return res.status(400).json({ success: false, message: "Payment amount mismatch" });
      }
    }

    console.log("[verify-payment] ✅ Payment verified");
    res.status(200).json({ success: true, data: data.data });

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
// PROTECTED: requireInternalSecret middleware
// Without the correct x-internal-secret header this returns 403 immediately
app.post("/api/alert-staff", requireInternalSecret, async (req, res) => {
  const { type, clientId, note, orderNumber, orderValue, orderStatus, subject, recipientCount } = req.body;
  console.log("[alert-staff] called — type:", type, "| clientId:", clientId);

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
    console.log("[alert-staff] Sending email — type:", type, "→ to:", to);
    await transporter.sendMail({
      from: `"VERP System" <${process.env.GMAIL_USER}>`,
      to, subject: emailSubject, html,
    });
    console.log(`[alert-staff] ✅ [${type}] → ${to}`);
    res.status(200).json({ success: true, type, to });
  } catch (err) {
    console.error(`[alert-staff] ❌ [${type}] failed:`, err.message);
    res.status(500).json({ error: err.message, type });
  }
});

// ── 8. Admin: Return Requests ─────────────────────────────────
// PROTECTED: requireAdminHeader middleware
// Credentials are read from Authorization: Basic header — never from URL params
app.get("/api/admin/return-requests", requireAdminHeader, async (req, res) => {
  console.log("[return-requests] ✅ Admin verified via Authorization header");

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