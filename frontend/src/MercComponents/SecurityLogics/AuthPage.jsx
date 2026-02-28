import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import logo from "../../assets/V - 1.png";
import loginImg from "../../public/login.jpg";

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
const Field = ({ label, type = "text", value, onChange, placeholder, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: T.ember, fontWeight: 700 }}>{label}</label>
    <div style={{ position: "relative" }}>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required
        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "14px 16px", fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)", outline: "none", transition: "border-color 200ms", boxSizing: "border-box" }}
        onFocus={e => { if (!error) e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)"; }}
        onBlur={e => { if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }} />
      {children}
    </div>
    {error && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "#ef4444", letterSpacing: "0.15em" }}>{error}</p>}
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
    style={{ width: "100%", background: "linear-gradient(135deg, #ec5b13, #d94e0f)", border: "none", borderRadius: 12, padding: "15px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "#fff", cursor: loading || disabled ? "not-allowed" : "pointer", opacity: loading || disabled ? 0.7 : 1, transition: "all 220ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 20px rgba(236,91,19,0.2)" }}
    onMouseEnter={e => { if (!loading && !disabled) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(236,91,19,0.35)"; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(236,91,19,0.2)"; }}>
    {loading
      ? (<><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />PROCESSING...</>)
      : label}
  </button>
);

/* ─── AUTH SWITCH LINK ───────────────────────────────────────── */
const AuthSwitch = ({ mode }) => (
  <p style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
    {mode === "login" ? "NEW OPERATIVE? " : "ALREADY REGISTERED? "}
    <Link to={mode === "login" ? "/signup" : "/login"} style={{ color: T.ember, fontWeight: 700, textDecoration: "none" }}>
      {mode === "login" ? "JOIN VERP" : "LOGIN IN"}
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
    if (!form.email.includes("@")) e.email = "VALID EMAIL REQUIRED";
    if (form.password.length < 8) e.password = "MIN 8 CHARACTERS";
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
      const { data: existing } = await supabase
        .from("verp_users")
        .select("id, is_verified")
        .eq("email", form.email)
        .maybeSingle();
      if (existing?.is_verified) {
        setErrors({ email: "EMAIL ALREADY REGISTERED" });
        setLoading(false);
        return;
      }

      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(form.password, 10);

      // Call server to send OTP — server generates + emails it (mobile: same-origin fallback + timeout)
      const res = await fetchWithTimeout(`${getApiBase()}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, type: "SIGNUP" }),
      }, 25000);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send verification email");
      if (!data.otp) throw new Error("Server did not return OTP. Check server logs.");

      // Save OTP + pending user data to DB now (upsert so re-signup works)
      const otp = String(data.otp).trim();
      console.log("[SIGNUP] Server returned OTP:", otp, "| length:", otp.length);
      const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from("verp_users").upsert(
        {
          email: form.email,
          full_name: form.fullName,
          password_hash: hash,
          is_verified: false,
          otp_code: otp,
          otp_expiry: expiry,
        },
        { onConflict: "email" }
      );

      // Store minimal locals for the OTP screen
      localStorage.setItem("pendingEmail", form.email);
      localStorage.setItem("otpPurpose", "SIGNUP");
      localStorage.setItem("pendingOtp", otp);

      onSuccess();
    } catch (err) {
      const msg = err.name === "AbortError" ? "Request timed out. Check your connection and try again." : (err.message || "Something went wrong.");
      Swal.fire({ title: "Error", text: msg, icon: "error", background: "#0a0a0a", color: "#fff", confirmButtonColor: T.ember });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Field label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="Your full name" error={errors.fullName} />
      <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="mail@gmail.com" error={errors.email} />
      <Field label="Access Key" type={show.password ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters" error={errors.password}>
        <EyeBtn visible={show.password} onToggle={() => setShow(s => ({ ...s, password: !s.password }))} />
      </Field>
      {form.password && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: strength >= i ? STRENGTH_COLOR[strength] : "rgba(255,255,255,0.08)", transition: "background 300ms" }} />
            ))}
          </div>
          {strength > 0 && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: STRENGTH_COLOR[strength], letterSpacing: "0.2em" }}>{STRENGTH_LABEL[strength]}</p>}
        </div>
      )}
      <Field label="Confirm Key" type={show.confirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" error={errors.confirmPassword}>
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
      await supabase.from("verp_sessions").upsert({ user_id: user.id, device_fingerprint: fingerprint, last_active_path: "/", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.full_name);
      localStorage.setItem("deviceFingerprint", fingerprint);
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
        <Link to="/forgot-password" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: T.ember, textDecoration: "none", opacity: 0.7 }}>FORGOT ACCESS KEY?</Link>
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
      if (data.success) {
        // ✅ Always store trimmed string
        if (data.otp) {
          localStorage.setItem("pendingOtp", String(data.otp).trim());
        }
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

    console.group("🔐 OTP VERIFY DEBUG");
    console.log("📧 Email:", email);
    console.log("🎯 Purpose:", purpose);
    console.log("✏️  Entered OTP:", entered, "| length:", entered.length, "| type:", typeof entered);

    const rawStored = localStorage.getItem("pendingOtp");
    const stored = String(rawStored || "").trim();
    console.log("💾 localStorage raw value:", rawStored, "| type:", typeof rawStored);
    console.log("💾 localStorage trimmed:", stored, "| length:", stored.length);
    console.log("🔁 localStorage match?", entered === stored);
    let valid = stored.length === 6 && entered === stored;
    console.log("✅ Valid after localStorage check:", valid);

    if (!valid) {
      console.log("📡 localStorage check failed — querying DB...");
      const { data: dbUser, error: dbErr } = await supabase
        .from("verp_users")
        .select("otp_code, otp_expiry")
        .eq("email", email)
        .maybeSingle();
      console.log("🗃️  DB query error:", dbErr);
      console.log("🗃️  DB raw otp_code:", dbUser?.otp_code, "| type:", typeof dbUser?.otp_code);
      console.log("🗃️  DB otp_expiry:", dbUser?.otp_expiry);
      if (dbUser?.otp_code) {
        const dbOtp = String(dbUser.otp_code).trim();
        console.log("🗃️  DB trimmed OTP:", dbOtp, "| length:", dbOtp.length);
        console.log("🔁 DB match?", dbOtp === entered);
        if (purpose === "RESET") {
          const notExpired = new Date(dbUser.otp_expiry) > new Date();
          console.log("⏱️  Expiry check (RESET):", dbUser.otp_expiry, "| not expired?", notExpired);
          valid = dbOtp === entered && notExpired;
        } else {
          valid = dbOtp === entered;
        }
      } else {
        console.warn("⚠️  No otp_code found in DB for this email!");
      }
      console.log("✅ Valid after DB check:", valid);
    }
    console.groupEnd();

    if (!valid) {
      Swal.fire({
        title: "WRONG CODE",
        text: "Double-check the digits in your email. Use RESEND if the code is old.",
        icon: "error",
        background: "#0a0a0a",
        color: "#fff",
        confirmButtonColor: T.ember,
      });
      setLoading(false);
      return;
    }

    if (purpose === "RESET") {
      localStorage.removeItem("pendingOtp");
      onSuccess("reset");
      setLoading(false);
      return;
    }

    // SIGNUP: data is already in DB from signup step — just verify the row
    if (purpose === "SIGNUP") {
      const { data: newUser, error: verifyErr } = await supabase
        .from("verp_users")
        .update({ is_verified: true, otp_code: null, otp_expiry: null })
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
      await supabase.from("verp_sessions").upsert(
        { user_id: newUser.id, device_fingerprint: fingerprint, last_active_path: "/", updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      localStorage.setItem("userEmail", newUser.email);
      localStorage.setItem("userId", newUser.id);
      localStorage.setItem("userName", newUser.full_name);
      localStorage.setItem("deviceFingerprint", fingerprint);
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
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>CODE SENT TO</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{maskedEmail}</p>
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
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.22)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              SENT{" "}
              <span style={{ color: T.ember, fontWeight: 700 }}>
                {Math.floor((180 - cooldown) / 60)}:{String((180 - cooldown) % 60).padStart(2, "0")}
              </span>
              {" "}AGO
            </p>
          ) : (
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
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
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", padding: "10px 0", transition: "color 180ms" }}
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
            fontFamily: "'JetBrains Mono',monospace", fontSize: 7,
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
      if (!data.success) { setError(data.error || "FAILED TO SEND CODE"); setLoading(false); return; }

      // 2. Save the SAME OTP to DB so verify can check it
      const otp = String(data.otp).trim();
      const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from("verp_users").update({ otp_code: otp, otp_expiry: expiry }).eq("email", email);

      localStorage.setItem("pendingOtp", otp);
      localStorage.setItem("pendingEmail", email);
      localStorage.setItem("otpPurpose", "RESET");
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
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(form.password, 10);
      await supabase.from("verp_users").update({ password_hash: hash, otp_code: null, otp_expiry: null }).eq("email", email);
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
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 0", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 200ms" }}
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

  const TITLES = {
    login:  { title: "Welcome Back",       sub: "Verify your credentials to proceed." },
    signup: { title: "Initialize Account", sub: "Create your identity in the VERP system." },
    otp:    { title: "Verify Identity",    sub: "Enter the 6-digit code sent to your email." },
    forgot: { title: "Recover Access",     sub: "We'll get you back in." },
    reset:  { title: "New Passphrase",     sub: "Set your new access key." },
  };
  const { title, sub } = TITLES[mode] || TITLES.login;

  const handleSignupSuccess  = ()       => navigate("/verify-otp");
  const handleLoginSuccess   = ()       => navigate("/loading");
  const handleOtpSuccess     = (result) => { if (result === "reset") navigate("/reset-password"); else navigate("/loading"); };
  const handleForgotSuccess  = ()       => navigate("/verify-otp");
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
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 10 }}>{sub}</p>
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