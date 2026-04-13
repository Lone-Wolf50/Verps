import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import logo from "../../assets/V - 1.png";
import loginImg from "../../public/login.jpg";
import { useCart } from "../../MercComponents/Cartoptions/CartContext";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const T = {
  ember: "#ec5b13",
  void: "#050505",
  obsidian: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.07)",
};

/* ─── API BASE (mobile-friendly: avoid "failed to fetch" when VITE_SERVER_URL unset) ─── */
const getApiBase = () => {
  const env = import.meta.env.VITE_SERVER_URL;
  if (env && typeof env === "string" && env.trim()) return String(env).trim().replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
};

const fetchWithTimeout = (url, options = {}, ms = 25000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
};

/* ─── DEVICE FINGERPRINT ─────────────────────────────────────── */
const getFingerprint = () => {
  const nav = window.navigator;
  const raw = [nav.userAgent, nav.language, screen.width, screen.height, new Date().getTimezoneOffset()].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = (hash << 5) - hash + raw.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(36);
};

/* ─── PASSWORD STRENGTH ──────────────────────────────────────── */
const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_LABEL = ["", "WEAK", "FAIR", "GOOD", "STRONG"];
const STRENGTH_COLOR = ["", "#ef4444", "#f59e0b", "#38bdf8", "#22c55e"];

/* ─── SHARED FIELD ───────────────────────────────────────────── */
const Field = ({ label, type = "text", value, onChange, placeholder, error, hint, maxLength, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: T.ember, fontWeight: 700 }}>{label}</label>
    <div style={{ position: "relative" }}>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required maxLength={maxLength}
        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "14px 16px", fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.92)", outline: "none", transition: "border-color 200ms", boxSizing: "border-box" }}
        onFocus={e => { if (!error) e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)"; }}
        onBlur={e => { if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }} />
      {children}
    </div>
    {hint && !error && (
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(236,91,19,0.5)", display: "inline-block", flexShrink: 0 }} />
        {hint}
      </p>
    )}
    {error && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ef4444", letterSpacing: "0.15em" }}>{error}</p>}
  </div>
);

/* ─── EYE TOGGLE ─────────────────────────────────────────────── */
const EyeBtn = ({ visible, onToggle }) => (
  <button type="button" onClick={onToggle} tabIndex={-1}
    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}>
    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.3)" }}>
      {visible ? "visibility" : "visibility_off"}
    </span>
  </button>
);

/* ─── SUBMIT BUTTON ──────────────────────────────────────────── */
const SubmitButton = ({ loading, label, disabled }) => (
  <button type="submit" disabled={loading || disabled}
    style={{ width: "100%", background: "linear-gradient(135deg, #ec5b13, #d94e0f)", border: "none", borderRadius: 12, padding: "15px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "#fff", cursor: loading || disabled ? "not-allowed" : "pointer", opacity: loading || disabled ? 0.7 : 1, transition: "all 220ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 20px rgba(236,91,19,0.2)" }}
    onMouseEnter={e => { if (!loading && !disabled) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(236,91,19,0.35)"; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(236,91,19,0.2)"; }}>
    {loading
      ? (<><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />PROCESSING...</>)
      : label}
  </button>
);

/* ─── AUTH SWITCH LINK ───────────────────────────────────────── */
const AuthSwitch = ({ mode }) => (
  <p style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
    {mode === "login" ? "NEW OPERATIVE? " : "ALREADY REGISTERED? "}
    <Link to={mode === "login" ? "/signup" : "/login"} style={{ color: T.ember, fontWeight: 700, textDecoration: "none" }}>
      {mode === "login" ? "REGISTER" : "LOGIN IN"}
    </Link>
  </p>
);

/* ══════════════════════════════════════════════════════════════
   CHILD 1 — AuthPage_Visual
   Premium dual-image editorial left panel
   ════════════════════════════════════════════════════════════ */
const AuthPage_Visual = ({ mode }) => {
  const taglines = {
    login:  { title: "Welcome Back.",        sub: "Access the elite catalog." },
    signup: { title: "Initialize Identity.", sub: "Join the inner circle." },
    otp:    { title: "Verify Access.",       sub: "One code. One entry." },
    forgot: { title: "Recover Access.",      sub: "Secure your identity." },
    reset:  { title: "New Passphrase.",      sub: "Update your credentials." },
  };
  const t = taglines[mode] || taglines.login;

  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#000", height: "100%" }}>

      {/* ── Background image — fills panel cleanly ── */}
      <img
        src={loginImg}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center 20%",
          opacity: 0.65,
          filter: "saturate(0.8) contrast(1.05)",
        }}
        onError={e => { e.currentTarget.style.display = "none"; }}
      />

      {/* ── Gradient overlays ── */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(5,5,5,0.75) 70%, rgba(5,5,5,0.97) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,5,5,0.45) 0%, transparent 70%)" }} />

      {/* ── Ember vignette glow bottom-left ── */}
      <div style={{
        position: "absolute",
        bottom: "-10%", left: "-5%",
        width: "55%", height: "45%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(236,91,19,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Scan line effect ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.25), transparent)",
        animation: "authScan 4s linear infinite",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* ── Bottom content: logo + headline ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 36px 40px",
        zIndex: 4,
      }}>
        {/* Vault badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(236,91,19,0.1)",
          border: "1px solid rgba(236,91,19,0.25)",
          borderRadius: 999,
          padding: "6px 14px 6px 8px",
          marginBottom: 20,
        }}>
          <img
            src={logo} alt="V"
            style={{ height: 22, objectFit: "contain", filter: "invert(1) brightness(2)" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
            VERP
          </span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(30px,3.2vw,42px)",
          fontStyle: "italic",
          fontWeight: 400,
          color: "white",
          lineHeight: 1.1,
          marginBottom: 10,
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>
          {t.title}
        </h2>
        <p style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.38)",
          marginBottom: 18,
        }}>
          {t.sub}
        </p>

        {/* Divider + series label */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 2, background: T.ember, borderRadius: 2 }} />
          <span style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 7,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)",
          }}>
            SERIES 2026
          </span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   CHILD 2 — AuthPage_SignupForm
   ════════════════════════════════════════════════════════════ */
const AuthPage_SignupForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "FULL NAME REQUIRED";
    else if (form.fullName.trim().length > 60) e.fullName = "NAME MUST BE 60 CHARACTERS OR FEWER";
    else if (!/^[A-Za-z\s'\-]+$/.test(form.fullName.trim())) e.fullName = "LETTERS ONLY — NO NUMBERS OR SYMBOLS ALLOWED";
    if (!form.email.includes("@")) e.email = "VALID EMAIL REQUIRED";
    else if (form.email.toLowerCase().split("@")[1] !== "gmail.com") e.email = "ONLY GMAIL ADDRESSES ARE ACCEPTED (@gmail.com)";
    if (form.password.length < 8) e.password = "MIN 8 CHARACTERS";
    else if (form.password.length > 128) e.password = "PASSWORD MUST BE 128 CHARACTERS OR FEWER";
    if (form.password !== form.confirmPassword) e.confirmPassword = "PASSWORDS DO NOT MATCH";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      // ✅ /api/register handles everything server-side:
      //    name validation, email format+domain check, password hashing,
      //    DB upsert, OTP generation + email — frontend never touches Supabase directly.
      const res = await fetchWithTimeout(`${getApiBase()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email:    form.email,
          password: form.password,
        }),
      }, 25000);
      const data = await res.json();

      if (res.status === 429) {
        Swal.fire({
          title: "Too Many Requests",
          text: data.error || "Please wait before trying again.",
          icon: "warning",
          background: "#0a0a0a",
          color: "#fff",
          confirmButtonColor: T.ember,
        });
        setLoading(false);
        return;
      }

      if (res.status === 409) {
        setErrors({ email: "EMAIL ALREADY REGISTERED" });
        setLoading(false);
        return;
      }

      if (!data.success) {
        // Surface server validation errors back into the relevant field
        const msg = data.error || "Something went wrong.";
        if (msg.toLowerCase().includes("name"))     setErrors({ fullName: msg.toUpperCase() });
        else if (msg.toLowerCase().includes("email")) setErrors({ email: msg.toUpperCase() });
        else if (msg.toLowerCase().includes("password")) setErrors({ password: msg.toUpperCase() });
        else Swal.fire({ title: "Error", text: msg, icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
        setLoading(false);
        return;
      }

      // ✅ Server wrote user + OTP to DB and emailed the code.
      // Store only email + purpose for the OTP screen.
      localStorage.setItem("pendingEmail", form.email);
      localStorage.setItem("otpPurpose", "SIGNUP");

      await Swal.fire({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 0;">
            <div style="width:54px;height:54px;border-radius:50%;background:rgba(236,91,19,0.1);border:1.5px solid rgba(236,91,19,0.4);display:flex;align-items:center;justify-content:center;">
              <span style="font-family:'Material Symbols Outlined';font-size:26px;color:#ec5b13;">mark_email_unread</span>
            </div>
            <div>
              <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.38em;text-transform:uppercase;color:#ec5b13;margin:0 0 10px;font-weight:700;">Verification Code Sent</p>
              <p style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.4;">Check Your Inbox</p>
              <p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.55);margin:0;line-height:1.65;">A 6-digit code has been sent to <strong style="color:rgba(255,255,255,0.85);">${form.email}</strong>. Open your email app and enter the code on the next screen.</p>
            </div>
            <div style="width:100%;padding:12px 16px;background:rgba(236,91,19,0.06);border:1px solid rgba(236,91,19,0.18);border-radius:12px;display:flex;align-items:center;gap:10px;">
              <span style="font-family:'Material Symbols Outlined';font-size:16px;color:#ec5b13;">info</span>
              <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;">Code expires in 10 minutes</p>
            </div>
          </div>`,
        background: "#0a0a0a",
        color: "#fff",
        showConfirmButton: true,
        confirmButtonText: "OPEN CODE SCREEN",
        confirmButtonColor: "#ec5b13",
        customClass: { popup: "verp-otp-toast", confirmButton: "verp-otp-btn" },
        width: 420,
      });

      onSuccess();
    } catch (err) {
      const msg = err.name === "AbortError" ? "Request timed out. Check your connection and try again." : (err.message || "Something went wrong.");
      Swal.fire({ title: "Error", text: msg, icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Field label="Full Name" value={form.fullName} onChange={e => { const v = e.target.value; if (v.length <= 60 && /^[A-Za-z\s'\-]*$/.test(v)) setForm(f => ({ ...f, fullName: v })); }} placeholder="Your full name" error={errors.fullName} hint="Letters only — no numbers or symbols" maxLength={60} />
      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="mail@gmail.com" error={errors.email} />
      <Field label="Access Key" type={show.password ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters" error={errors.password} maxLength={128}>
        <EyeBtn visible={show.password} onToggle={() => setShow(s => ({ ...s, password: !s.password }))} />
      </Field>
      {form.password && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: strength >= i ? STRENGTH_COLOR[strength] : "rgba(255,255,255,0.08)", transition: "background 300ms" }} />
            ))}
          </div>
          {strength > 0 && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: STRENGTH_COLOR[strength], letterSpacing: "0.2em" }}>{STRENGTH_LABEL[strength]}</p>}
        </div>
      )}
      <Field label="Confirm Key" type={show.confirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" error={errors.confirmPassword} maxLength={128}>
        <EyeBtn visible={show.confirm} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))} />
      </Field>
      <SubmitButton loading={loading} label="INITIALIZE ACCOUNT" />
      <AuthSwitch mode="signup" />
    </form>
  );
};

/* ══════════════════════════════════════════════════════════════
   CHILD 3 — AuthPage_LoginForm
   ════════════════════════════════════════════════════════════ */
const AuthPage_LoginForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const { syncFromDB } = useCart();

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email.includes("@")) { setErrors({ email: "VALID EMAIL REQUIRED" }); return; }
    if (!form.password) { setErrors({ password: "PASSWORD REQUIRED" }); return; }
    setLoading(true);
    try {
      const { data: user } = await supabase.from("verp_users").select("*").eq("email", form.email).maybeSingle();
      if (!user) { setErrors({ email: "NO ACCOUNT FOUND" }); setLoading(false); return; }
      if (!user.is_verified) { setErrors({ email: "ACCOUNT NOT VERIFIED — CHECK YOUR EMAIL" }); setLoading(false); return; }
      const bcrypt = await import("bcryptjs");
      const match = await bcrypt.compare(form.password, user.password_hash);
      if (!match) { setErrors({ password: "INCORRECT PASSWORD" }); setLoading(false); return; }
      const fingerprint = getFingerprint();
      console.log("🔐 Creating session for login - fingerprint:", fingerprint, "userId:", user.id);
      
      console.log("📤 Attempting upsert with device_fingerprint conflict...");
      /* ✅ Try device_fingerprint conflict first */
      let { data: sessionResult, error: sessionError } = await supabase
        .from("verp_sessions")
        .upsert(
          { user_id: user.id, device_fingerprint: fingerprint, last_active_path: "/", updated_at: new Date().toISOString() },
          { onConflict: "device_fingerprint" }
        );
      
      console.log("📥 Upsert result:", { data: sessionResult, error: sessionError });
      
      /* If device_fingerprint conflict fails, try deleting old sessions for this user and inserting new one */
      if (sessionError) {
        console.warn("⚠️ device_fingerprint conflict failed, error:", sessionError);
        console.log("🔄 Trying fallback: delete old sessions + insert new...");
        try {
          /* Delete old sessions for this user */
          const delRes = await supabase.from("verp_sessions").delete().eq("user_id", user.id);
          console.log("🗑️ Delete result:", delRes);
          
          /* Insert new session */
          console.log("📝 Inserting session:", { user_id: user.id, device_fingerprint: fingerprint });
          const { data: newSession, error: insertError } = await supabase
            .from("verp_sessions")
            .insert({
              user_id: user.id,
              device_fingerprint: fingerprint,
              last_active_path: "/",
              updated_at: new Date().toISOString()
            })
            .select();
          
          console.log("📥 Insert result:", { data: newSession, error: insertError });
          
          if (insertError) {
            console.error("❌ Failed to insert session:", insertError);
          } else {
            console.log("✅ Session created via insert:", newSession);
            sessionResult = newSession;
          }
        } catch (err) {
          console.error("❌ Session creation fallback failed:", err);
        }
      } else {
        console.log("✅ Session created with device_fingerprint conflict:", sessionResult);
      }
      
      console.log("💾 Saving user data to localStorage...");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.full_name);
      localStorage.setItem("deviceFingerprint", fingerprint);
      console.log("✅ LocalStorage updated:", { email: user.email, userId: user.id, fingerprint });
      
      /* ✅ Verify session was actually saved to DB */
      console.log("🔍 Verifying session in DB...");
      const { data: verifySession } = await supabase
        .from("verp_sessions")
        .select("user_id, device_fingerprint")
        .eq("device_fingerprint", fingerprint)
        .maybeSingle();
      console.log("✅ Session verification - found in DB:", verifySession);

      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      ) {
        console.log("📱 PWA detected - setting PWA flags");
        localStorage.setItem("vrp_is_pwa", "1");
        localStorage.setItem("vrp_session_type", "pwa");
        localStorage.setItem("vrp_last_seen", Date.now().toString());
        console.log("✅ PWA flags set, timestamp:", Date.now().toString());
      }

      // ✅ FIX: CartContext is already mounted and won't remount after login.
      // We must explicitly call syncFromDB here so it picks up any guest_cart
      // items the user added before logging in, and merges them with their DB cart.
      const guestRaw = localStorage.getItem("guest_cart");
      if (guestRaw) {
        try {
          const guestItems = JSON.parse(guestRaw);
        } catch (_) {}
      } else {
      }
      await syncFromDB();

      console.log("🎯 Login successful! Calling onSuccess with user:", { email: user.email, id: user.id });
      onSuccess(user);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" error={errors.email} />
      <Field label="Access Key" type={show ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Your password" error={errors.password}>
        <EyeBtn visible={show} onToggle={() => setShow(s => !s)} />
      </Field>
      <div style={{ textAlign: "right" }}>
        <Link to="/forgot-password" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.ember, textDecoration: "none", opacity: 0.9 }}>FORGOT PASSWORD?</Link>
      </div>
      <SubmitButton loading={loading} label="ACCESS VERP" />
      <AuthSwitch mode="login" />
    </form>
  );
};

/* ══════════════════════════════════════════════════════════════
   CHILD 4 — AuthPage_OtpForm
   ✅ OTP FIX: Strict string comparison with trim() on both sides.
   No expiry-based rejection — if user got the code it's valid
   until they resend. Cooldown timer is purely UI, not a gate.
   ════════════════════════════════════════════════════════════ */
const AuthPage_OtpForm = ({ onSuccess }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const refs = useRef([]);
  const navigate = useNavigate();

  const email = localStorage.getItem("pendingEmail");
  const purpose = localStorage.getItem("otpPurpose") || "SIGNUP";

  useEffect(() => {
    const stored = localStorage.getItem("pendingOtp");
    if (stored) setCooldown(180);
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      const res = await fetchWithTimeout(`${getApiBase()}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: purpose }),
      }, 25000);
      const data = await res.json();
      if (res.status === 429) {
        // Rate limit hit — show the server's message directly
        Swal.fire({
          title: "Slow Down",
          text: data.error || "Too many requests. Please wait before trying again.",
          icon: "warning",
          background: "#0a0a0a",
          color: "#fff",
          confirmButtonColor: T.ember,
        });
        setResending(false);
        return;
      }
      if (data.success) {
        // ✅ Server no longer returns the OTP — never store it in localStorage
        setCooldown(180);
        setOtp(["", "", "", "", "", ""]);
        refs.current[0]?.focus();
        Swal.fire({ title: "Code Resent!", text: "Check your inbox for the new code.", icon: "success", timer: 2200, showConfirmButton: false, background: "#0a0a0a", color: "#fff" });
      } else {
        throw new Error(data.error || "Failed to resend");
      }
    } catch (err) {
      const msg = err.name === "AbortError" ? "Request timed out. Check your connection and try again." : err.message || "Something went wrong.";
      Swal.fire({ title: "Error", text: msg, icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
    }
    setResending(false);
  };

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      refs.current[5]?.focus();
    }
  };

  const clearPending = () => {
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("pendingOtp");
    localStorage.removeItem("otpPurpose");
  };

  const verify = async (e) => {
    e.preventDefault();
    const entered = otp.join("").trim();
    if (entered.length !== 6) return;
    setLoading(true);

    // ✅ Always verify through the server — never compare against localStorage or DB directly from frontend.
    // The server does: bcrypt.compare(entered, stored_hash) + expiry check + attempt limiting.
    try {
      const res = await fetchWithTimeout(`${getApiBase()}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: entered }),
      }, 25000);
      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || "";
        const isNoCode = msg.toLowerCase().includes("no active code") || msg.toLowerCase().includes("expired");
        Swal.fire({
          title: isNoCode ? "CODE EXPIRED" : "WRONG CODE",
          text: isNoCode
            ? "Your code has expired or was already used. Tap RESEND CODE below to get a fresh one."
            : msg || "Double-check the digits in your email. Use RESEND if the code is old.",
          icon: isNoCode ? "warning" : "error",
          background: "#0a0a0a",
          color: "#fff",
          confirmButtonColor: T.ember,
          confirmButtonText: isNoCode ? "OK — I'LL RESEND" : "TRY AGAIN",
        });
        setLoading(false);
        return;
      }
    } catch (err) {
      const msg = err.name === "AbortError" ? "Request timed out. Check your connection." : (err.message || "Verification failed.");
      Swal.fire({ title: "Error", text: msg, icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
      setLoading(false);
      return;
    }

    console.log("🎯 OTP verified. Purpose:", purpose);

    if (purpose === "RESET") {
      console.log("🔄 Handling RESET purpose");
      localStorage.removeItem("pendingOtp");
      onSuccess("reset");
      setLoading(false);
      return;
    }

    // SIGNUP: OTP verified — mark account as verified in DB
    if (purpose === "SIGNUP") {
      console.log("📝 Handling SIGNUP purpose - Creating session...");
      const { data: newUser, error: verifyErr } = await supabase
        .from("verp_users")
        .update({ is_verified: true })
        .eq("email", email)
        .select("id, full_name, email")
        .single();

      if (verifyErr || !newUser) {
        Swal.fire({ title: "Registration Error", text: verifyErr?.message || "Could not verify account. Please try signing up again.", icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
        clearPending();
        navigate("/signup");
        setLoading(false);
        return;
      }

      const fingerprint = getFingerprint();
      console.log("🔐 Creating session for new user - fingerprint:", fingerprint, "userId:", newUser.id);
      
      console.log("📤 Attempting upsert with device_fingerprint conflict...");
      let { data: sessionResult, error: sessionError } = await supabase
        .from("verp_sessions")
        .upsert(
          { user_id: newUser.id, device_fingerprint: fingerprint, last_active_path: "/", updated_at: new Date().toISOString() },
          { onConflict: "device_fingerprint" }
        );
      
      console.log("📥 Upsert result:", { data: sessionResult, error: sessionError });
      
      /* If device_fingerprint conflict fails, try deleting old sessions and inserting new one */
      if (sessionError) {
        console.warn("⚠️ device_fingerprint conflict failed, error:", sessionError);
        console.log("🔄 Trying fallback: delete old sessions + insert new...");
        try {
          /* Delete old sessions for this user */
          const delRes = await supabase.from("verp_sessions").delete().eq("user_id", newUser.id);
          console.log("🗑️ Delete result:", delRes);
          
          /* Insert new session */
          console.log("📝 Inserting session (OTP):", { user_id: newUser.id, device_fingerprint: fingerprint });
          const { data: newSession, error: insertError } = await supabase
            .from("verp_sessions")
            .insert({
              user_id: newUser.id,
              device_fingerprint: fingerprint,
              last_active_path: "/",
              updated_at: new Date().toISOString()
            })
            .select();
          
          console.log("📥 Insert result:", { data: newSession, error: insertError });
          
          if (insertError) {
            console.error("❌ Failed to insert session:", insertError);
          } else {
            console.log("✅ Session created via insert:", newSession);
            sessionResult = newSession;
          }
        } catch (err) {
          console.error("❌ Session creation fallback failed:", err);
        }
      } else {
        console.log("✅ Session created with device_fingerprint conflict:", sessionResult);
      }
      
      // Store user data immediately before navigating to /loading
      localStorage.setItem("userEmail", newUser.email);
      localStorage.setItem("userId", newUser.id);
      localStorage.setItem("userName", newUser.full_name);
      localStorage.setItem("deviceFingerprint", fingerprint);
      console.log("✅ User data stored in localStorage - ready for app");

      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      ) {
        localStorage.setItem("vrp_is_pwa", "1");
        localStorage.setItem("vrp_session_type", "pwa");
        localStorage.setItem("vrp_last_seen", Date.now().toString());
        console.log("✅ PWA mode detected and flagged");
      }
    }

    clearPending();
    onSuccess("verified");
    setLoading(false);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "your email";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Email card */}
      <div style={{ background: "rgba(236,91,19,0.06)", border: "1px solid rgba(236,91,19,0.18)", borderRadius: 14, padding: "16px 20px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(236,91,19,0.12)", border: "1px solid rgba(236,91,19,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.ember }}>mark_email_unread</span>
          </div>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>CODE SENT TO</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{maskedEmail}</p>
          </div>
        </div>
      </div>

      <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* OTP inputs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }} onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: "clamp(38px,11vw,52px)",
                height: "clamp(48px,13vw,62px)",
                textAlign: "center",
                background: d ? "rgba(236,91,19,0.08)" : "rgba(255,255,255,0.04)",
                border: d ? "1.5px solid rgba(236,91,19,0.55)" : "1px solid rgba(255,255,255,0.09)",
                borderRadius: 14,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "clamp(18px,4vw,24px)",
                fontWeight: 700,
                color: "white",
                outline: "none",
                transition: "all 200ms",
                boxShadow: d ? "0 0 14px rgba(236,91,19,0.15)" : "none",
              }}
            />
          ))}
        </div>

        {/* Timer — purely informational, NOT a gate */}
        <div style={{ textAlign: "center", minHeight: 18 }}>
          {cooldown > 0 ? (
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              SENT{" "}
              <span style={{ color: T.ember, fontWeight: 700 }}>
                {Math.floor((180 - cooldown) / 60)}:{String((180 - cooldown) % 60).padStart(2, "0")}
              </span>
              {" "}AGO
            </p>
          ) : (
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              DIDN'T GET IT? RESEND BELOW
            </p>
          )}
        </div>

        <SubmitButton loading={loading} label="VERIFY & ENTER VERP" disabled={otp.join("").length !== 6} />
      </form>

      {/* Resend + back */}
      <div  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
        <button
          type="button"
          onClick={() => { clearPending(); navigate(purpose === "RESET" ? "/forgot-password" : "/signup"); }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", padding: "10px 0", transition: "color 180ms" }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
          GO BACK
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(236,91,19,0.08)",
            border: "1px solid rgba(236,91,19,0.3)",
            borderRadius: 10, padding: "10px 18px",
            cursor: resending ? "not-allowed" : "pointer",
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: T.ember,
            opacity: resending ? 0.55 : 1, transition: "all 200ms",
          }}
          onMouseEnter={e => { if (!resending) { e.currentTarget.style.background = "rgba(236,91,19,0.16)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(236,91,19,0.08)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.3)"; }}
        >
          {resending
            ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: T.ember, animation: "spin 0.8s linear infinite" }} />
            : <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
          }
          {resending ? "SENDING..." : "RESEND CODE"}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   CHILD 5 — AuthPage_ForgotForm
   ════════════════════════════════════════════════════════════ */
const AuthPage_ForgotForm = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("VALID EMAIL REQUIRED"); return; }
    setError(""); setLoading(true);
    const { data: user } = await supabase.from("verp_users").select("id").eq("email", email).maybeSingle();
    if (!user) { setError("NO ACCOUNT WITH THIS EMAIL"); setLoading(false); return; }

    // 1. Get OTP from server (it emails it) — mobile-friendly URL + timeout
    try {
      const res = await fetchWithTimeout(`${getApiBase()}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "RESET" }),
      }, 25000);
      const data = await res.json();
      if (res.status === 429) {
        Swal.fire({
          title: "Too Many Requests",
          text: data.error || "Please wait before requesting another code.",
          icon: "warning",
          background: "#0a0a0a",
          color: "#fff",
          confirmButtonColor: T.ember,
        });
        setLoading(false);
        return;
      }
      if (!data.success) { setError(data.error || "FAILED TO SEND CODE"); setLoading(false); return; }

      // ✅ Server handles OTP generation + hashing + storing. Never touch the OTP here.
      // Only store email + purpose so the OTP screen knows who to verify.
      localStorage.setItem("pendingEmail", email);
      localStorage.setItem("otpPurpose", "RESET");

      await Swal.fire({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 0;">
            <div style="width:54px;height:54px;border-radius:50%;background:rgba(236,91,19,0.1);border:1.5px solid rgba(236,91,19,0.4);display:flex;align-items:center;justify-content:center;">
              <span style="font-family:'Material Symbols Outlined';font-size:26px;color:#ec5b13;">lock_reset</span>
            </div>
            <div>
              <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.38em;text-transform:uppercase;color:#ec5b13;margin:0 0 10px;font-weight:700;">Reset Code Sent</p>
              <p style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.4;">Check Your Inbox</p>
              <p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.55);margin:0;line-height:1.65;">A 6-digit reset code has been sent to <strong style="color:rgba(255,255,255,0.85);">${email}</strong>. Enter it on the next screen to set a new password.</p>
            </div>
            <div style="width:100%;padding:12px 16px;background:rgba(236,91,19,0.06);border:1px solid rgba(236,91,19,0.18);border-radius:12px;display:flex;align-items:center;gap:10px;">
              <span style="font-family:'Material Symbols Outlined';font-size:16px;color:#ec5b13;">info</span>
              <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.5);margin:0;text-transform:uppercase;">Code expires in 10 minutes</p>
            </div>
          </div>`,
        background: "#0a0a0a",
        color: "#fff",
        showConfirmButton: true,
        confirmButtonText: "ENTER RESET CODE",
        confirmButtonColor: "#ec5b13",
        width: 420,
      });

      onSuccess();
    } catch (err) {
      const msg = err.name === "AbortError" ? "Request timed out. Check your connection and try again." : (err.message || "Network error. Check connection and try again.");
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Field label="Registered Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" error={error} />
      <SubmitButton loading={loading} label="SEND RESET CODE" />
      <AuthSwitch mode="forgot" />
    </form>
  );
};

/* ══════════════════════════════════════════════════════════════
   CHILD 6 — AuthPage_ResetForm
   ════════════════════════════════════════════════════════════ */
const AuthPage_ResetForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleBackToLogin = () => {
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("pendingOtp");
    localStorage.removeItem("otpPurpose");
    navigate("/login", { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.password.length < 8) errs.password = "MIN 8 CHARACTERS";
    if (form.password !== form.confirm) errs.confirm = "PASSWORDS DO NOT MATCH";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    const email = localStorage.getItem("pendingEmail");
    try {
      // ✅ Always reset password through the server — it checks otp_verified flag
      // before allowing the password change. Direct Supabase writes bypass this check.
      const res = await fetchWithTimeout(`${getApiBase()}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.password }),
      }, 25000);
      const data = await res.json();
      if (!res.ok || !data.success) {
        Swal.fire({ title: "Error", text: data.message || "Failed to update password.", icon: "error", background: "#0a0a0a", color: "#fff" });
        setLoading(false);
        return;
      }
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingOtp");
      localStorage.removeItem("otpPurpose");
      onSuccess();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="New Access Key" type={show.password ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters" error={errors.password}>
          <EyeBtn visible={show.password} onToggle={() => setShow(s => ({ ...s, password: !s.password }))} />
        </Field>
        <Field label="Confirm New Key" type={show.confirm ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" error={errors.confirm}>
          <EyeBtn visible={show.confirm} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))} />
        </Field>
        <SubmitButton loading={loading} label="UPDATE PASSPHRASE" />
      </form>
      <button
        type="button"
        onClick={handleBackToLogin}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 0", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", cursor: "pointer", transition: "all 200ms" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)"; e.currentTarget.style.color = T.ember; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        BACK TO LOGIN
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PARENT — AuthPage
   ════════════════════════════════════════════════════════════ */
const AuthPage = ({ mode: propMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeMode = location.pathname.includes("signup") ? "signup"
    : location.pathname.includes("otp") || location.pathname.includes("verify") ? "otp"
    : location.pathname.includes("forgot") ? "forgot"
    : location.pathname.includes("reset") ? "reset"
    : "login";
  const mode = propMode || routeMode;

  /* where to go after successful login — defaults to /loading which then redirects home */
  const redirectTo = location.state?.redirect || null;

  const TITLES = {
    login:  { title: "Welcome Back",       sub: "Verify your credentials to proceed." },
    signup: { title: "Initialize Account", sub: "Create your identity in the VERP system." },
    otp:    { title: "Verify Identity",    sub: "Enter the 6-digit code sent to your email." },
    forgot: { title: "Recover Access",     sub: "We'll get you back in." },
    reset:  { title: "New Passphrase",     sub: "Set your new Password." },
  };
  const { title, sub } = TITLES[mode] || TITLES.login;

  const handleSignupSuccess  = ()       => navigate("/verify-otp", { state: location.state });
  const handleLoginSuccess   = ()       => navigate(redirectTo || "/loading");
  const handleOtpSuccess     = (result) => { if (result === "reset") navigate("/reset-password"); else navigate(redirectTo || "/loading"); };
  const handleForgotSuccess  = ()       => navigate("/verify-otp", { state: location.state });
  const handleResetSuccess   = ()       => {
    Swal.fire({ title: "Password Updated!", icon: "success", timer: 1600, showConfirmButton: false, background: "#0a0a0a", color: "#fff" })
      .then(() => navigate("/login"));
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes authScan { 0% { top:-2% } 100% { top:102% } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(236,91,19,0.3); border-radius: 99px; }
        .verp-otp-toast { border: 1px solid rgba(236,91,19,0.2) !important; border-radius: 20px !important; }
        .verp-otp-btn { font-family: 'JetBrains Mono',monospace !important; font-size: 10px !important; letter-spacing: 0.25em !important; font-weight: 700 !important; border-radius: 10px !important; padding: 13px 28px !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.void, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{
          width: "100%", maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          minHeight: 640,
          maxHeight: "90vh",
          background: T.obsidian,
          borderRadius: 20,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 120px rgba(0,0,0,0.9)",
          overflow: "hidden",
        }}>

          {/* Left visual */}
          <div className="auth-visual" style={{ minHeight: 0 }}>
            <AuthPage_Visual mode={mode} />
          </div>

          {/* Right form */}
          <div style={{
            padding: "clamp(28px,4vw,52px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflowY: "auto",
            animation: "fadeIn 0.35s ease both",
            borderLeft: "1px solid rgba(255,255,255,0.04)",
            minHeight: 0,
          }}>
            {/* Mobile logo */}
            <div className="auth-mobile-logo" style={{ display: "none", marginBottom: 32, textAlign: "center" }}>
              <img src={logo} alt="Vault" style={{ height: 36, objectFit: "contain", filter: "invert(1) brightness(2)" }} onError={e => (e.currentTarget.style.display = "none")} />
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,2.8vw,32px)", fontStyle: "italic", fontWeight: 400, color: "white", lineHeight: 1.2 }}>{title}</h1>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 10 }}>{sub}</p>
              <div style={{ width: 32, height: 2, background: T.ember, marginTop: 14, borderRadius: 2 }} />
            </div>

            {mode === "login"  && <AuthPage_LoginForm  onSuccess={handleLoginSuccess} />}
            {mode === "signup" && <AuthPage_SignupForm  onSuccess={handleSignupSuccess} />}
            {mode === "otp"    && <AuthPage_OtpForm     onSuccess={handleOtpSuccess} />}
            {mode === "forgot" && <AuthPage_ForgotForm  onSuccess={handleForgotSuccess} />}
            {mode === "reset"  && <AuthPage_ResetForm   onSuccess={handleResetSuccess} />}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          div[style*="grid-template-columns"]{grid-template-columns:1fr!important;max-height:none!important;border-radius:0!important}
          .auth-visual{display:none!important}
          .auth-mobile-logo{display:block!important}
        }
        @media(min-width:769px){.auth-mobile-logo{display:none!important}}
      `}</style>
    </>
  );
};

export default AuthPage;