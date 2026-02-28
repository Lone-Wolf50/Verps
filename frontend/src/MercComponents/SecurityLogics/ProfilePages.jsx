import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const T = {
  ember:    "#ec5b13",
  emberDim: "rgba(236,91,19,0.10)",
  emberBdr: "rgba(236,91,19,0.28)",
  void:     "#060606",
  glass:    "rgba(255,255,255,0.03)",
  bdr:      "rgba(255,255,255,0.07)",
  bdrSub:   "rgba(255,255,255,0.04)",
  text:     "rgba(255,255,255,0.82)",
  textDim:  "rgba(255,255,255,0.38)",
  textGhost:"rgba(255,255,255,0.16)",
  mono:     "'JetBrains Mono',monospace",
  sans:     "'DM Sans',sans-serif",
  serif:    "'Playfair Display',serif",
};

const BUCKET = "verp-avatars";

/* ─── UTILITIES ──────────────────────────────────────────────── */
const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8)         s++;
  if (/[A-Z]/.test(pw))       s++;
  if (/[0-9]/.test(pw))       s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_LABEL = ["", "WEAK", "FAIR", "GOOD", "STRONG"];
const STRENGTH_COLOR = ["", "#ef4444", "#f59e0b", "#38bdf8", "#22c55e"];

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

/* ─── ATOMS ──────────────────────────────────────────────────── */

const Field = ({ label, icon, value, onChange, placeholder, type = "text", disabled, hint, error, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.ember, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span className="material-symbols-outlined" style={{ fontSize: 13, color: T.ember }}>{icon}</span>}
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%", boxSizing: "border-box",
            background: disabled ? "rgba(255,255,255,0.02)" : focused ? "rgba(236,91,19,0.04)" : T.glass,
            border: error ? "1px solid #ef4444" : focused ? `1px solid ${T.emberBdr}` : `1px solid ${T.bdr}`,
            borderRadius: 12, padding: children ? "13px 44px 13px 14px" : "13px 14px",
            fontFamily: T.sans, fontSize: 14, color: disabled ? T.textGhost : T.text,
            outline: "none", transition: "all 200ms", cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {children}
      </div>
      {hint && !error && (
        <p style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: "0.1em", color: T.textGhost, margin: 0 }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: "0.1em", color: "#ef4444", margin: 0 }}>{error}</p>
      )}
    </div>
  );
};

const EyeBtn = ({ visible, onToggle }) => (
  <button type="button" onClick={onToggle} tabIndex={-1}
    style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
    <span className="material-symbols-outlined" style={{ fontSize: 17, color: T.textGhost }}>
      {visible ? "visibility" : "visibility_off"}
    </span>
  </button>
);

const Card = ({ children, danger }) => (
  <div style={{
    background: danger ? "rgba(239,68,68,0.025)" : "rgba(255,255,255,0.025)",
    backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
    border: danger ? "1px solid rgba(239,68,68,0.1)" : `1px solid ${T.bdr}`,
    borderRadius: 22, overflow: "hidden",
  }}>
    {children}
  </div>
);

const CardHead = ({ icon, title, sub, action, danger }) => (
  <div style={{ padding: "18px 22px 16px", borderBottom: danger ? "1px solid rgba(239,68,68,0.07)" : `1px solid ${T.bdrSub}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: danger ? "rgba(239,68,68,0.08)" : T.emberDim,
        border: danger ? "1px solid rgba(239,68,68,0.2)" : `1px solid ${T.emberBdr}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: danger ? "#ef4444" : T.ember }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontFamily: T.serif, fontSize: 16, color: T.text, margin: 0, fontWeight: 600, letterSpacing: "0.01em" }}>{title}</p>
        {sub && <p style={{ fontFamily: T.mono, fontSize: 8, color: danger ? "rgba(239,68,68,0.45)" : T.textGhost, letterSpacing: "0.18em", textTransform: "uppercase", margin: "3px 0 0" }}>{sub}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const SaveBtn = ({ loading, onClick, disabled }) => (
  <button onClick={onClick} disabled={loading || disabled} style={{
    display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10,
    background: loading || disabled ? "rgba(236,91,19,0.25)" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
    border: "none", cursor: loading || disabled ? "not-allowed" : "pointer",
    fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase",
    color: "#fff", fontWeight: 700, transition: "all 200ms",
    boxShadow: loading || disabled ? "none" : "0 4px 16px rgba(236,91,19,0.28)",
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 15, animation: loading ? "spin 1s linear infinite" : "none" }}>
      {loading ? "autorenew" : "check"}
    </span>
    {loading ? "SAVING..." : "SAVE"}
  </button>
);

const Toast = ({ show, type = "success", message }) => {
  if (!show) return null;
  const isSuccess = type === "success";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, marginTop: 12, background: isSuccess ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: isSuccess ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 14, color: isSuccess ? "#22c55e" : "#ef4444" }}>
        {isSuccess ? "check_circle" : "error"}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: isSuccess ? "#22c55e" : "rgba(239,68,68,0.9)" }}>
        {message}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   1. AVATAR HERO CARD
═══════════════════════════════════════════════════════════════ */
const AvatarCard = ({ userId, name, email, joinedAt }) => {
  const [url,       setUrl]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const fileRef = useRef(null);
  const initial = name?.[0]?.toUpperCase() || "V";

  useEffect(() => {
    if (!userId) return;
    supabase.from("verp_users_details").select("avatar_url").eq("user_id", userId).maybeSingle()
      .then(({ data }) => { if (data?.avatar_url) setUrl(data.avatar_url); });
  }, [userId]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      Swal.fire({ title: "File too large", text: "Max 3 MB", icon: "warning", background: "#0a0a0a", color: "#fff" }); return;
    }
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const newUrl = pub.publicUrl + `?t=${Date.now()}`;
      await supabase.from("verp_users_details").upsert({ user_id: userId, avatar_url: newUrl }, { onConflict: "user_id" });
      setUrl(newUrl);
      // Notify Navbar immediately
      localStorage.setItem("userAvatarUrl", newUrl);
      window.dispatchEvent(new StorageEvent("storage", { key: "userAvatarUrl", newValue: newUrl }));
    } catch (err) {
      Swal.fire({ title: "Upload failed", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    } finally { setUploading(false); e.target.value = ""; }
  };

  const remove = async () => {
    const { isConfirmed } = await Swal.fire({ title: "Remove photo?", showCancelButton: true, confirmButtonText: "REMOVE", confirmButtonColor: "#ef4444", cancelButtonColor: "#1c1c1c", background: "#0a0a0a", color: "#fff" });
    if (!isConfirmed) return;
    setDeleting(true);
    try {
      const ext = url.split(".").pop().split("?")[0];
      await supabase.storage.from(BUCKET).remove([`${userId}/avatar.${ext}`]);
      await supabase.from("verp_users_details").upsert({ user_id: userId, avatar_url: null }, { onConflict: "user_id" });
      setUrl(null);
      localStorage.removeItem("userAvatarUrl");
      window.dispatchEvent(new StorageEvent("storage", { key: "userAvatarUrl", newValue: null }));
    } catch (err) {
      Swal.fire({ title: "Failed", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    } finally { setDeleting(false); }
  };

  const busy = uploading || deleting;

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
      border: `1px solid ${T.bdr}`, borderRadius: 22, overflow: "hidden",
    }}>
      {/* Ember strip */}
      <div style={{ height: 3, background: "linear-gradient(90deg,transparent,#ec5b13,transparent)" }} />

      <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        {/* Avatar ring */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: url ? "transparent" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
            border: "2.5px solid rgba(236,91,19,0.5)",
            boxShadow: "0 0 0 6px rgba(236,91,19,0.07), 0 16px 40px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", transition: "box-shadow 300ms",
          }}>
            {url
              ? <img src={url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontFamily: T.serif, fontSize: 40, color: "#fff", fontStyle: "italic" }}>{initial}</span>
            }
          </div>
          {busy && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: T.ember, animation: "spin 1s linear infinite" }}>autorenew</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontFamily: T.serif, fontSize: "clamp(20px,3vw,26px)", color: T.text, margin: "0 0 2px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            {name || "Vault Member"}
          </p>
          <p style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.textGhost, margin: "0 0 3px", textTransform: "uppercase" }}>{email}</p>
          <p style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em", color: "rgba(236,91,19,0.5)", margin: "0 0 18px", textTransform: "uppercase" }}>
            MEMBER SINCE {joinedAt ? new Date(joinedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase() : "—"}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={busy} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10,
              background: T.emberDim, border: `1px solid ${T.emberBdr}`,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ember, fontWeight: 700,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>upload</span>
              {url ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
            </button>
            {url && (
              <button onClick={remove} disabled={busy} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 10,
                background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                cursor: busy ? "not-allowed" : "pointer",
                fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(239,68,68,0.7)", fontWeight: 700,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                REMOVE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   2. PERSONAL INFO
═══════════════════════════════════════════════════════════════ */
const PersonalInfoCard = ({ userId, email, initialName }) => {
  const [name,    setName]    = useState(initialName || "");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  // WHY THIS REF: after save(), the useEffect below re-runs
  // (because userId hasn't changed but React may remount the
  // component). Without this guard the DB fetch overwrites the
  // new name with the OLD value before Supabase propagates.
  const savedNameRef = React.useRef(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ data: det, error: detErr }, { data: usr, error: usrErr }] = await Promise.all([
        supabase.from("verp_users_details").select("phone,address").eq("user_id", userId).maybeSingle(),
        supabase.from("verp_users").select("full_name").eq("id", userId).maybeSingle(),
      ]);


      if (det) { setPhone(det.phone || ""); setAddress(det.address || ""); }
      if (usr?.full_name) {
        // If we just saved a new name, don't let the DB fetch overwrite it
        if (savedNameRef.current && savedNameRef.current !== usr.full_name) {
        } else {
          setName(usr.full_name);
        }
      }
    })();
  }, [userId]);

  const save = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      // Run update and capture full result including errors
      const { data: updateData, error: updateErr, status, statusText } = await supabase
        .from("verp_users")
        .update({ full_name: name.trim() })
        .eq("id", userId)
        .select("id, full_name");
      if (updateErr) {
        throw updateErr;
      }
      if (!updateData || updateData.length === 0) {
      } else {
      }

      // Save details separately so one failure doesn't block the other
      const { error: detErr } = await supabase
        .from("verp_users_details")
        .upsert({ user_id: userId, phone: phone.trim(), address: address.trim() }, { onConflict: "user_id" });


      // Store so useEffect doesn't overwrite with stale DB value
      savedNameRef.current = name.trim();
      localStorage.setItem("userName", name.trim());
      // Dispatch so Navbar re-reads the name immediately (same tab)
      window.dispatchEvent(new StorageEvent("storage", { key: "userName", newValue: name.trim() }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2800);
    } catch (err) {
      Swal.fire({ title: "Error saving name", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHead icon="person" title="Personal Information" sub="Name · Phone · Address" action={<SaveBtn loading={loading} onClick={save} disabled={!name.trim()} />} />
      <div style={{ padding: "22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
          <Field label="Display Name"     icon="badge"       value={name}    onChange={e => setName(e.target.value)}    placeholder="Your full name" />
          <Field label="Email Address"    icon="mail"        value={email}   disabled hint="EMAIL CANNOT BE CHANGED" />
          <Field label="Phone Number"     icon="phone"       value={phone}   onChange={e => setPhone(e.target.value)}   placeholder="+233 XX XXX XXXX" />
          <Field label="Address Location" icon="location_on" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, Region" />
        </div>
        <Toast show={saved} type="success" message="Changes saved successfully" />
      </div>
    </Card>
  );
};

/* ═══════════════════════════════════════════════════════════════
   3. BIO
═══════════════════════════════════════════════════════════════ */
const BioCard = ({ userId }) => {
  const [bio,     setBio]     = useState("");
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const MAX = 200;

  useEffect(() => {
    if (!userId) return;
    supabase.from("verp_users_details").select("bio").eq("user_id", userId).maybeSingle()
      .then(({ data }) => { if (data?.bio) setBio(data.bio); });
  }, [userId]);

  const save = async () => {
    setLoading(true);
    try {
      await supabase.from("verp_users_details").upsert({ user_id: userId, bio: bio.trim() }, { onConflict: "user_id" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2800);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHead icon="edit_note" title="Bio" sub="Optional · Visible only to you" action={<SaveBtn loading={loading} onClick={save} />} />
      <div style={{ padding: "22px" }}>
        <div style={{ position: "relative" }}>
          <textarea
            value={bio}
            onChange={e => { if (e.target.value.length <= MAX) setBio(e.target.value); }}
            placeholder="A short note about yourself — style, interests, anything..."
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 105,
              background: T.glass, border: `1px solid ${T.bdr}`, borderRadius: 12,
              padding: "13px 14px 30px", fontFamily: T.sans, fontSize: 13.5,
              color: T.text, outline: "none", lineHeight: 1.65, transition: "border-color 200ms",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = T.emberBdr; e.currentTarget.style.background = "rgba(236,91,19,0.03)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.background = T.glass; }}
          />
          <span style={{ position: "absolute", right: 12, bottom: 10, fontFamily: T.mono, fontSize: 7, color: bio.length >= MAX ? T.ember : T.textGhost, letterSpacing: "0.1em" }}>
            {bio.length}/{MAX}
          </span>
        </div>
        <Toast show={saved} type="success" message="Bio saved" />
      </div>
    </Card>
  );
};

/* ═══════════════════════════════════════════════════════════════
   4. CHANGE PASSWORD
   Mirrors AuthPage logic exactly:
   • Send OTP  → POST /api/send-otp  (type "RESET"), store in localStorage + DB
   • Verify OTP → check localStorage first, fall back to DB (same as AuthPage_OtpForm)
   • Reset pw   → bcryptjs hash client-side → direct Supabase update (same as AuthPage_ResetForm)
═══════════════════════════════════════════════════════════════ */
const PasswordCard = ({ email: userEmail }) => {
  // step: "email" → "otp" → "password" → "done"
  const [step,     setStep]   = useState("email");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [next,     setNext]   = useState("");
  const [conf,     setConf]   = useState("");
  const [showN,    setShowN]  = useState(false);
  const [showCo,   setShowCo] = useState(false);
  const [loading,  setLoading] = useState(false);
  const [err,      setErr]    = useState("");
  const otpRefs = useRef([]);

  const strength = getStrength(next);

  const apiBase = (() => {
    const env = typeof import.meta !== "undefined" && import.meta?.env?.VITE_SERVER_URL;
    if (env && typeof env === "string" && env.trim()) return env.trim().replace(/\/$/, "");
    return window.location.origin;
  })();

  const fetchWithTimeout = (url, options = {}, ms = 25000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
  };

  // Cooldown ticker — purely informational, not a gate (mirrors AuthPage)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* ── STEP 1: send OTP (mirrors AuthPage_ForgotForm) ── */
  const sendOtp = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, type: "RESET" }),
      }, 25000);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send code");

      // Store OTP + metadata exactly as AuthPage does
      const otp = String(data.otp).trim();
      const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from("verp_users").update({ otp_code: otp, otp_expiry: expiry }).eq("email", userEmail);
      localStorage.setItem("pendingOtp", otp);
      localStorage.setItem("pendingEmail", userEmail);
      localStorage.setItem("otpPurpose", "RESET");

      setOtpDigits(["", "", "", "", "", ""]);
      setCooldown(180);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (e) {
      const msg = e.name === "AbortError" ? "Request timed out. Check your connection." : (e.message || "Failed to send code.");
      setErr(msg);
    } finally { setLoading(false); }
  };

  /* ── Resend OTP (mirrors AuthPage_OtpForm handleResend) ── */
  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, type: "RESET" }),
      }, 25000);
      const data = await res.json();
      if (data.success) {
        if (data.otp) localStorage.setItem("pendingOtp", String(data.otp).trim());
        setCooldown(180);
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        Swal.fire({ title: "Code Resent!", text: "Check your inbox for the new code.", icon: "success", timer: 2200, showConfirmButton: false, background: "#0a0a0a", color: "#fff" });
      } else {
        throw new Error(data.error || "Failed to resend");
      }
    } catch (e) {
      const msg = e.name === "AbortError" ? "Request timed out." : (e.message || "Something went wrong.");
      setErr(msg);
    } finally { setResending(false); }
  };

  /* ── OTP digit handlers (mirrors AuthPage_OtpForm) ── */
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits]; next[idx] = val; setOtpDigits(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtpDigits(pasted.split("")); otpRefs.current[5]?.focus(); }
  };

  /* ── STEP 2: verify OTP (mirrors AuthPage_OtpForm verify) ── */
  const verifyOtp = async () => {
    const entered = otpDigits.join("").trim();
    if (entered.length !== 6) return;
    setErr("");
    setLoading(true);

    // Check localStorage first, then fall back to DB — exactly as AuthPage does
    const stored = String(localStorage.getItem("pendingOtp") || "").trim();
    let valid = stored.length === 6 && entered === stored;

    if (!valid) {
      const { data: dbUser } = await supabase
        .from("verp_users")
        .select("otp_code, otp_expiry")
        .eq("email", userEmail)
        .maybeSingle();
      if (dbUser?.otp_code) {
        const dbOtp = String(dbUser.otp_code).trim();
        valid = dbOtp === entered && new Date(dbUser.otp_expiry) > new Date();
      }
    }

    if (!valid) {
      Swal.fire({ title: "WRONG CODE", text: "Double-check the digits in your email. Use RESEND if the code is old.", icon: "error", background: "#0a0a0a", color: "#fff" });
      setLoading(false);
      return;
    }

    // Valid — clear pendingOtp just like AuthPage does for RESET purpose
    localStorage.removeItem("pendingOtp");
    setLoading(false);
    setStep("password");
  };

  /* ── STEP 3: save new password (mirrors AuthPage_ResetForm submit) ── */
  const changePassword = async () => {
    setErr("");
    if (!next || !conf)  { setErr("Fill in both password fields."); return; }
    if (next.length < 8) { setErr("Min 8 characters."); return; }
    if (next !== conf)   { setErr("Passwords don't match."); return; }
    setLoading(true);
    try {
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(next, 10);
      await supabase.from("verp_users")
        .update({ password_hash: hash, otp_code: null, otp_expiry: null })
        .eq("email", userEmail);
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingOtp");
      localStorage.removeItem("otpPurpose");
      setStep("done");
    } catch (e) {
      Swal.fire({ title: "Error", text: e.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    } finally { setLoading(false); }
  };

  const reset = () => {
    setStep("email");
    setOtpDigits(["", "", "", "", "", ""]);
    setNext(""); setConf(""); setErr("");
    localStorage.removeItem("pendingOtp");
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("otpPurpose");
  };

  const maskedEmail = userEmail
    ? userEmail.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "your email";

  return (
    <Card>
      <CardHead icon="lock" title="Change Password" sub="Verified via email OTP" />
      <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── DONE ── */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#22c55e" }}>check_circle</span>
            </div>
            <p style={{ fontFamily: T.serif, fontSize: 15, color: T.text, margin: "0 0 4px", fontWeight: 600 }}>Password Updated</p>
            <p style={{ fontFamily: T.mono, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.textGhost, margin: "0 0 18px" }}>YOUR ACCOUNT IS SECURE</p>
            <button onClick={reset} style={{ background: "none", border: `1px solid ${T.bdr}`, borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontFamily: T.mono, fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.textDim }}>CHANGE AGAIN</button>
          </div>
        )}

        {/* ── EMAIL step ── */}
        {step === "email" && (
          <>
            <Field label="Account Email" icon="mail" value={userEmail} disabled hint="YOUR REGISTERED EMAIL" />
            <button onClick={sendOtp} disabled={loading} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", borderRadius: 10, alignSelf: "flex-start",
              background: loading ? "rgba(236,91,19,0.25)" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: T.mono, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fff", fontWeight: 700,
              boxShadow: loading ? "none" : "0 4px 16px rgba(236,91,19,0.28)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, animation: loading ? "spin 1s linear infinite" : "none" }}>{loading ? "autorenew" : "send"}</span>
              {loading ? "SENDING..." : "SEND CODE"}
            </button>
          </>
        )}

        {/* ── OTP step (mirrors AuthPage_OtpForm UI exactly) ── */}
        {step === "otp" && (
          <>
            <div style={{ background: "rgba(236,91,19,0.06)", border: "1px solid rgba(236,91,19,0.18)", borderRadius: 14, padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(236,91,19,0.12)", border: "1px solid rgba(236,91,19,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.ember }}>mark_email_unread</span>
                </div>
                <div>
                  <p style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: T.textGhost, margin: "0 0 3px" }}>CODE SENT TO</p>
                  <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{maskedEmail}</p>
                </div>
              </div>
            </div>

            {/* 6-box digit input — mirrors AuthPage exactly */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }} onPaste={handleOtpPaste}>
              {otpDigits.map((d, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  maxLength={1} inputMode="numeric"
                  style={{
                    width: "clamp(38px,10vw,50px)", height: "clamp(46px,12vw,58px)",
                    textAlign: "center",
                    background: d ? "rgba(236,91,19,0.08)" : "rgba(255,255,255,0.04)",
                    border: d ? "1.5px solid rgba(236,91,19,0.55)" : `1px solid ${T.bdr}`,
                    borderRadius: 12,
                    fontFamily: T.mono, fontSize: "clamp(18px,4vw,22px)", fontWeight: 700, color: "#fff",
                    outline: "none", transition: "all 200ms",
                    boxShadow: d ? "0 0 14px rgba(236,91,19,0.15)" : "none",
                  }}
                />
              ))}
            </div>

            {/* Cooldown — informational only, not a gate */}
            <div style={{ textAlign: "center", minHeight: 16 }}>
              {cooldown > 0
                ? <p style={{ fontFamily: T.mono, fontSize: 8, color: T.textGhost, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>
                    SENT <span style={{ color: T.ember, fontWeight: 700 }}>{Math.floor((180 - cooldown) / 60)}:{String((180 - cooldown) % 60).padStart(2, "0")}</span> AGO
                  </p>
                : <p style={{ fontFamily: T.mono, fontSize: 8, color: T.textGhost, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>DIDN'T GET IT? RESEND BELOW</p>
              }
            </div>

            <button onClick={verifyOtp} disabled={loading || otpDigits.join("").length !== 6} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 0", borderRadius: 10, width: "100%",
              background: loading || otpDigits.join("").length !== 6 ? "rgba(236,91,19,0.25)" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
              border: "none", cursor: loading || otpDigits.join("").length !== 6 ? "not-allowed" : "pointer",
              fontFamily: T.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", fontWeight: 700,
              boxShadow: loading || otpDigits.join("").length !== 6 ? "none" : "0 4px 16px rgba(236,91,19,0.28)",
            }}>
              {loading
                ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />VERIFYING...</>
                : "VERIFY & CONTINUE"
              }
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: T.textGhost, padding: "8px 0", transition: "color 180ms" }}
                onMouseEnter={e => e.currentTarget.style.color = T.textDim}
                onMouseLeave={e => e.currentTarget.style.color = T.textGhost}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_back</span>
                START OVER
              </button>
              <button onClick={handleResend} disabled={resending} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(236,91,19,0.08)", border: "1px solid rgba(236,91,19,0.3)",
                borderRadius: 9, padding: "9px 14px", cursor: resending ? "not-allowed" : "pointer",
                fontFamily: T.mono, fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase",
                color: T.ember, opacity: resending ? 0.55 : 1, transition: "all 200ms",
              }}
                onMouseEnter={e => { if (!resending) { e.currentTarget.style.background = "rgba(236,91,19,0.16)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(236,91,19,0.08)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.3)"; }}>
                {resending
                  ? <div style={{ width: 11, height: 11, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: T.ember, animation: "spin 0.8s linear infinite" }} />
                  : <span className="material-symbols-outlined" style={{ fontSize: 13 }}>refresh</span>
                }
                {resending ? "SENDING..." : "RESEND CODE"}
              </button>
            </div>
          </>
        )}

        {/* ── PASSWORD step (mirrors AuthPage_ResetForm UI) ── */}
        {step === "password" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="New Password" icon="lock_reset"
              value={next} onChange={e => setNext(e.target.value)}
              placeholder="8+ chars, upper, number, symbol"
              type={showN ? "text" : "password"}>
              <EyeBtn visible={showN} onToggle={() => setShowN(o => !o)} />
            </Field>
            {next.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: -6 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? STRENGTH_COLOR[strength] : T.bdr, transition: "background 250ms" }} />)}
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: "0.22em", color: STRENGTH_COLOR[strength] }}>{STRENGTH_LABEL[strength]}</span>
              </div>
            )}
            <Field label="Confirm Password" icon="check_circle"
              value={conf} onChange={e => setConf(e.target.value)}
              placeholder="Re-enter new password"
              type={showCo ? "text" : "password"}
              error={conf && conf !== next ? "Passwords don't match" : ""}>
              <EyeBtn visible={showCo} onToggle={() => setShowCo(o => !o)} />
            </Field>
            <SaveBtn loading={loading} onClick={changePassword} disabled={!next || !conf || next !== conf} />
            <button onClick={reset} style={{
              display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.bdr}`,
              borderRadius: 10, padding: "10px 16px", cursor: "pointer", alignSelf: "flex-start",
              fontFamily: T.mono, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: T.textDim, transition: "all 180ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = T.textDim; }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
              START OVER
            </button>
          </div>
        )}

        {err && <Toast show message={err} type="error" />}
      </div>
    </Card>
  );
};

/* ═══════════════════════════════════════════════════════════════
   5. ACCOUNT OVERVIEW
═══════════════════════════════════════════════════════════════ */
const OverviewCard = ({ userId, email, joinedAt }) => {
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    if (!email) {
      setOrderCount(0);
      return;
    }
    supabase
      .from("verp_orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_email", email)
      .then(({ count, error }) => {
        if (error) {
          console.error("[OverviewCard] ❌ Order count error:", error.message);
          setOrderCount(0);
        } else {
          setOrderCount(count ?? 0);
        }
      });
  }, [email]);

  // member since: prop → localStorage fallback → "—"
  const memberSince = (() => {
    const iso = joinedAt || localStorage.getItem("userCreatedAt");
    if (!iso) {
      return "—";
    }
    try {
      const formatted = new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      return formatted;
    } catch (e) {
      return "—";
    }
  })();

  const rows = [
    { icon: "calendar_month", label: "Member Since",  value: memberSince },
    { icon: "mail",           label: "Email",          value: email || "—" },
    { icon: "inventory_2",    label: "Total Orders",   value: orderCount === null ? "..." : orderCount },
  ];

  return (
    <Card>
      <CardHead icon="info" title="Account Overview" sub="Read-only details" />
      <div style={{ padding: "10px 10px 14px" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", borderRadius: 12, background: i % 2 === 0 ? T.glass : "transparent", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, color: T.textGhost }}>{r.icon}</span>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textDim }}>{r.label}</span>
            </div>
            <span style={{ fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 600, textAlign: "right" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* ═══════════════════════════════════════════════════════════════
   6. DANGER ZONE
═══════════════════════════════════════════════════════════════ */
const DangerCard = ({ userId, email, onLogout }) => {
  const navigate = useNavigate();

  const terminate = async () => {
    const r1 = await Swal.fire({
      title: "TERMINATE ACCOUNT?",
      html: `<p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.7;">This will <strong style="color:#ef4444">permanently delete</strong> your account, all orders, chat history, and profile data. This cannot be undone.</p>`,
      background: "#0a0a0a", color: "#fff", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#1c1c1c",
      confirmButtonText: "DELETE ACCOUNT", cancelButtonText: "CANCEL",
    });
    if (!r1.isConfirmed) return;
    const r2 = await Swal.fire({
      title: "TYPE DELETE TO CONFIRM", input: "text", inputPlaceholder: 'Type "DELETE"',
      background: "#0a0a0a", color: "#fff", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#1c1c1c",
      confirmButtonText: "PROCEED", inputValidator: (v) => v !== "DELETE" ? "You must type DELETE" : null,
    });
    if (!r2.isConfirmed) return;
    try {
      if (userId) {
        await supabase.from("verp_users_details").delete().eq("user_id", userId);
        await supabase.from("verp_sessions").delete().eq("user_id", userId);
        await supabase.from("verp_users").delete().eq("id", userId);
      } else {
        await supabase.from("verp_users").delete().eq("email", email);
      }
      localStorage.clear();
      await Swal.fire({ title: "Account Deleted", icon: "success", timer: 2500, showConfirmButton: false, background: "#0a0a0a", color: "#fff" });
      navigate("/login", { replace: true });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    }
  };

  const ActionRow = ({ title, sub, btnLabel, btnIcon, onClick, red }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "16px 0" }}>
      <div>
        <p style={{ fontFamily: T.sans, fontSize: 13.5, color: T.text, fontWeight: 600, margin: "0 0 2px" }}>{title}</p>
        <p style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textGhost, margin: 0 }}>{sub}</p>
      </div>
      <button onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10,
        background: red ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.04)",
        border: red ? "1px solid rgba(239,68,68,0.22)" : `1px solid ${T.bdr}`,
        cursor: "pointer", fontFamily: T.mono, fontSize: 9,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: red ? "rgba(239,68,68,0.8)" : T.textDim, fontWeight: 700,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{btnIcon}</span>
        {btnLabel}
      </button>
    </div>
  );

  return (
    <Card danger>
      <CardHead icon="warning" title="Danger Zone" sub="Irreversible actions" danger />
      <div style={{ padding: "6px 22px 18px" }}>
        <ActionRow title="Sign out of this device" sub="Clear session and return to home" btnLabel="SIGN OUT" btnIcon="logout" onClick={onLogout} />
        <div style={{ height: 1, background: "rgba(239,68,68,0.07)" }} />
        <ActionRow title="Terminate account" sub="Permanently delete all data" btnLabel="TERMINATE" btnIcon="delete_forever" onClick={terminate} red />
      </div>
    </Card>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ userId: null, email: "", name: "", joinedAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email  = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");
    if (!email) { navigate("/login", { replace: true }); return; }

    supabase.from("verp_users").select("id,full_name,email,created_at").eq("id", userId).maybeSingle()
      .then(({ data, error }) => {
        setProfile({
          userId:   data?.id    || userId,
          email:    data?.email || email,
          name:     data?.full_name || localStorage.getItem("userName") || "",
          joinedAt: data?.created_at || null,
        });
        if (data?.created_at) {
          localStorage.setItem("userCreatedAt", data.created_at);
        } else {
          const cached = localStorage.getItem("userCreatedAt");
          if (cached) setProfile(p => ({ ...p, joinedAt: cached }));
        }
        setLoading(false);
      });
  }, [navigate]);

  const logout = () => {
    ["userEmail","userId","userName","deviceFingerprint"].forEach(k => localStorage.removeItem(k));
    navigate("/", { replace: true });
  };

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: T.void, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: T.ember, animation: "spin 1s linear infinite", display: "block" }}>autorenew</span>
        <p style={{ fontFamily: T.mono, fontSize: 7.5, letterSpacing: "0.3em", color: T.textGhost, marginTop: 14, textTransform: "uppercase" }}>LOADING PROFILE</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glowPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

        *  { box-sizing: border-box; }
        textarea { font-family: 'DM Sans',sans-serif; color: rgba(255,255,255,0.82); }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
      `}</style>

      <div style={{ minHeight: "100dvh", background: T.void, fontFamily: T.sans }}>

        {/* ── Ambient background glows ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -250, left: "50%", transform: "translateX(-50%)", width: 800, height: 450, background: "radial-gradient(ellipse,rgba(236,91,19,0.055) 0%,transparent 65%)", animation: "glowPulse 5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: -80, right: -120, width: 500, height: 500, background: "radial-gradient(ellipse,rgba(167,139,250,0.03) 0%,transparent 70%)" }} />
          <div style={{ position: "absolute", top: "40%", left: -100, width: 350, height: 350, background: "radial-gradient(ellipse,rgba(56,189,248,0.025) 0%,transparent 70%)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto", padding: "28px 16px 96px" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 28, animation: "fadeUp 0.35s ease both" }}>
            <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: T.textGhost, fontFamily: T.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", padding: "0 0 14px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_back</span>BACK
            </button>
            <h1 style={{ fontFamily: T.serif, fontSize: "clamp(26px,5vw,35px)", color: T.text, margin: 0, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Your Profile
            </h1>
            <p style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: T.textGhost, margin: "6px 0 0" }}>
              VERP MEMBER · PERSONAL SPACE
            </p>
          </div>

          {/* ── Content stack ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Avatar hero */}
            <div style={{ animation: "fadeUp 0.38s ease 0.04s both" }}>
              <AvatarCard userId={profile.userId} name={profile.name} email={profile.email} joinedAt={profile.joinedAt} />
            </div>

            {/* Personal info */}
            <div style={{ animation: "fadeUp 0.38s ease 0.08s both" }}>
              <PersonalInfoCard userId={profile.userId} email={profile.email} initialName={profile.name} />
            </div>

            {/* Bio */}
            <div style={{ animation: "fadeUp 0.38s ease 0.12s both" }}>
              <BioCard userId={profile.userId} />
            </div>

            {/* Password + Overview — side by side on wide screens */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 18, animation: "fadeUp 0.38s ease 0.16s both" }}>
              <PasswordCard email={profile.email} />
              <OverviewCard userId={profile.userId} email={profile.email} joinedAt={profile.joinedAt} />
            </div>

            {/* Danger zone */}
            <div style={{ animation: "fadeUp 0.38s ease 0.2s both" }}>
              <DangerCard userId={profile.userId} email={profile.email} onLogout={logout} />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;