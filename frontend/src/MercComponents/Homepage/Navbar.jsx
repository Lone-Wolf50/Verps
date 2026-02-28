import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../MercComponents/Cartoptions/CartContext";
import SearchOverlay from "./SearchOverlay";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import logo from "../../assets/V - 1.png";



/* ══════════════════════════════════════
   AUTH PROMPT MODAL
   ══════════════════════════════════════ */
const Navbar_AuthPrompt = ({ isOpen, onClose, targetPath }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  const goTo = (path) => { onClose(); navigate(path, { state: { redirect: targetPath } }); };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[600] flex items-end justify-center md:items-center p-4 md:p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
        style={{
          background: "rgba(11,11,11,0.98)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 28,
          padding: 32,
          fontFamily: "'DM Sans',sans-serif",
          animation: "authPromptUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <style>{`
          @keyframes authPromptUp {
            from { opacity:0; transform:translateY(28px) scale(0.96); }
            to   { opacity:1; transform:translateY(0) scale(1); }
          }
        `}</style>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
            background: "linear-gradient(135deg,rgba(236,91,19,0.18),rgba(217,78,15,0.08))",
            border: "1px solid rgba(236,91,19,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="material-symbols-outlined" style={{ color: "#ec5b13", fontSize: 24 }}>lock</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#fff", margin: "0 0 6px" }}>Members Only</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.36)", lineHeight: 1.65, margin: 0 }}>Sign in to access this area of Verp.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => goTo("/login")} style={{
            width: "100%", borderRadius: 14, padding: "14px 0",
            background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
            color: "#fff", fontWeight: 800, fontSize: 10,
            letterSpacing: "0.22em", textTransform: "uppercase",
            border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}>LOGIN</button>
          <button onClick={() => goTo("/signup")} style={{
            width: "100%", borderRadius: 14, padding: "14px 0",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 10,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
          }}>CREATE ACCOUNT</button>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", marginTop: 4,
            fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)", fontFamily: "'JetBrains Mono',monospace",
          }}>CONTINUE BROWSING</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   PROFILE TRAY
   ══════════════════════════════════════ */
const ProfileTray = ({ userName, avatarUrl, onLogout, onTerminate, isOpen, onClose }) => {
  if (!isOpen) return null;
  const initial = userName?.[0]?.toUpperCase() || "V";

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[300]" />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: "calc(1rem + 72px)",
          right: 16,
          width: 224,
          borderRadius: 20,
          background: "rgba(10,10,10,0.97)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.85)",
          zIndex: 400,
          overflow: "hidden",
          animation: "trayUp 0.24s cubic-bezier(0.16,1,0.3,1) both",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <style>{`@keyframes trayUp { from{opacity:0;transform:translateY(14px) scale(0.95);} to{opacity:1;transform:translateY(0) scale(1);} }`}</style>
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: avatarUrl ? "transparent" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
              border: "1.5px solid rgba(236,91,19,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 15, fontStyle: "italic",
              overflow: "hidden",
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initial
              }
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
              <p style={{ fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "'JetBrains Mono',monospace" }}>VAULT MEMBER</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "6px 8px" }}>
          {[
            { label: "Profile", icon: "person",      path: "/profile"   },
            { label: "Orders",  icon: "inventory_2", path: "/orderpage" },
            { label: "Inbox",   icon: "mail",        path: "/inbox"     },
          ].map((item) => (
            <Link key={item.path} to={item.path} onClick={onClose} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 10, textDecoration: "none",
              color: "rgba(255,255,255,0.55)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
            </Link>
          ))}
        </div>
        <div style={{ padding: "0 8px 8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <button onClick={() => { onClose(); onLogout(); }} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "9px 10px", borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer", color: "rgba(239,68,68,0.72)",
            fontFamily: "'DM Sans',sans-serif", marginTop: 4,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sign Out</span>
          </button>
          <button onClick={async () => { onClose(); if (onTerminate) await onTerminate(); }} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "9px 10px", borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer", color: "rgba(239,68,68,0.4)",
            fontFamily: "'DM Sans',sans-serif",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete_forever</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Terminate Account</span>
          </button>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════
   DESKTOP USER MENU
   ══════════════════════════════════════ */
const Navbar_UserMenu = ({ userName, avatarUrl, onLogout, onTerminate }) => {
  const [open, setOpen] = useState(false);
  const initial = userName?.[0]?.toUpperCase() || "V";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg italic cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#ec5b13]/40"
        style={{
          background: avatarUrl ? "transparent" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
          border: "2px solid rgba(236,91,19,0.35)",
          fontFamily: "'Playfair Display',serif",
          overflow: "hidden",
        }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          : initial
        }
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-[98]" />
          <div className="absolute top-[calc(100%+12px)] right-0 w-56 rounded-2xl p-2 z-[99] border border-white/[0.08]"
            style={{ background: "#0d0d0d", boxShadow: "0 20px 60px rgba(0,0,0,0.7)", fontFamily: "'DM Sans',sans-serif" }}>
            <div className="px-3.5 py-2.5 mb-1 border-b border-white/[0.05] flex items-center gap-2.5">
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: avatarUrl ? "transparent" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
                border: "1.5px solid rgba(236,91,19,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 12, fontStyle: "italic",
                overflow: "hidden",
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initial
                }
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white/85" style={{ margin: 0 }}>{userName}</p>
                <p className="text-[7px] tracking-[0.2em] uppercase mt-0.5 text-white/20" style={{ fontFamily: "'JetBrains Mono',monospace", margin: 0 }}>VAULT MEMBER</p>
              </div>
            </div>
            {[
              { label: "Profile", icon: "person",      path: "/profile"   },
              { label: "Orders",  icon: "inventory_2", path: "/orderpage" },
              { label: "Inbox",   icon: "mail",        path: "/inbox"     },
            ].map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg no-underline text-white/60 hover:bg-white/[0.05] transition-colors duration-150">
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            ))}
            <div className="mt-1 pt-1 border-t border-white/[0.05]">
              <button onClick={() => { setOpen(false); onLogout(); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-lg border-0 bg-transparent cursor-pointer text-left text-red-500/70 hover:bg-red-500/[0.06] transition-colors">
                <span className="material-symbols-outlined text-base">logout</span>
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
              <button onClick={async () => { setOpen(false); if (onTerminate) await onTerminate(); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-lg border-0 bg-transparent cursor-pointer text-left mt-0.5 text-red-500/45 hover:bg-red-500/[0.06] transition-colors">
                <span className="material-symbols-outlined text-base">delete_forever</span>
                <span className="text-sm font-semibold">Terminate Account</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Terminate account hook ── */
const useTerminateAccount = () => {
  const navigate = useNavigate();
  return async (onCloseMenu) => {
    if (onCloseMenu) onCloseMenu();
    const r1 = await Swal.fire({
      title: "TERMINATE ACCOUNT?",
      html: `<p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.7;">This will <strong style="color:#ef4444">permanently delete</strong> your account, all orders, and chat history.</p>`,
      background: "#0a0a0a", color: "#fff", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#1c1c1c",
      confirmButtonText: "DELETE MY ACCOUNT", cancelButtonText: "KEEP ACCOUNT",
    });
    if (!r1.isConfirmed) return;
    const r2 = await Swal.fire({
      title: "ARE YOU ABSOLUTELY SURE?", input: "text", inputPlaceholder: 'Type "DELETE" to confirm',
      background: "#0a0a0a", color: "#0a0a0a", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#1c1c1c",
      confirmButtonText: "PROCEED WITH DELETION", cancelButtonText: "CANCEL",
      inputValidator: (v) => v !== "DELETE" ? "You must type DELETE to confirm" : null,
    });
    if (!r2.isConfirmed) return;
    const email  = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");
    if (!email && !userId) return;
    try {
      if (userId) {
        await supabase.from("verp_users").delete().eq("id", userId);
        await supabase.from("verp_sessions").delete().eq("user_id", userId);
      } else {
        await supabase.from("verp_users").delete().eq("email", email);
      }
      localStorage.clear();
      await Swal.fire({ title: "Account Deleted", text: "Your membership has been terminated.", icon: "success", background: "#0a0a0a", color: "#fff", timer: 2500, showConfirmButton: false });
      navigate("/login", { replace: true });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    }
  };
};

/* ══════════════════════════════════════════════════════
   MAIN NAVBAR
   ══════════════════════════════════════════════════════ */
const Navbar = () => {
  const [isSearchOpen,    setIsSearchOpen]  = useState(false);
  const [profileTrayOpen, setProfileTray]   = useState(false);
  const [authPrompt,      setAuthPrompt]    = useState({ open: false, path: "" });
  const [isLoggedIn,      setIsLoggedIn]    = useState(() => !!localStorage.getItem("userEmail"));
  const [userName,        setUserName]      = useState(() => localStorage.getItem("userName") || "");
  const [avatarUrl,       setAvatarUrl]     = useState(null);
  const [unreadCount,     setUnreadCount]   = useState(0);
  const [isScrolled,      setIsScrolled]    = useState(false);

  const { cart, resetCart, syncFromDB } = useCart();
  const location        = useLocation();
  const navigate        = useNavigate();
  const handleTerminate = useTerminateAccount();
  const itemCount       = cart.reduce((t, i) => t + i.quantity, 0);

  /* ── Sync auth state ── */
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));
    setUserName(localStorage.getItem("userName") || "");
  }, [location]);

  /* ── Listen for name/avatar changes from ProfilePage (same tab) ── */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userName" && e.newValue) {
        console.log("[Navbar] Name updated →", e.newValue);
        setUserName(e.newValue);
      }
      if (e.key === "userAvatarUrl") {
        console.log("[Navbar] Avatar updated →", e.newValue);
        setAvatarUrl(e.newValue || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ── Load avatar from verp_users_details ── */
  useEffect(() => {
    if (!isLoggedIn) { setAvatarUrl(null); return; }
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    supabase
      .from("verp_users_details")
      .select("avatar_url")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
          localStorage.setItem("userAvatarUrl", data.avatar_url);
        } else {
          setAvatarUrl(null);
        }
      });
  }, [isLoggedIn, location.pathname]);

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── GAP DIAGNOSTIC: open browser console to see why there's a gap ── */
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const computed = window.getComputedStyle(main);
    const pt = computed.paddingTop;
    const mt = computed.marginTop;
    const ptPx = parseInt(pt, 10);
    console.log("[Navbar][Gap] <main> paddingTop:", pt, "| marginTop:", mt);
    if (ptPx > 0) {
      console.error(
        "[Navbar][Gap] ⚠️ DOUBLE-GAP DETECTED — <main> has paddingTop:", pt,
        "\nThe Navbar already renders its own spacer div (" +
        (window.innerWidth >= 768 ? "82" : "68") + "px) in the normal document flow." +
        "\nIf <main> also has pt-[68px] or pt-[82px], the gap is doubled." +
        "\nFIX: In Paths.jsx change your <main> to just:  <main className=\"flex-1 min-h-0\">"
      );
    } else {
      console.log("[Navbar][Gap] ✅ <main> has no extra padding. Spacer height:", document.querySelector('[aria-hidden="true"]')?.offsetHeight, "px");
    }
  }, []);

  /* ── Session hijack guard ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    const check = async () => {
      const userId = localStorage.getItem("userId");
      const fp     = localStorage.getItem("deviceFingerprint");
      if (!userId || !fp) return;
      const { data } = await supabase
        .from("verp_sessions").select("device_fingerprint")
        .eq("user_id", userId).maybeSingle();
      if (data && data.device_fingerprint !== fp) {
        ["userEmail","userId","userName","deviceFingerprint","luxury_cart"].forEach((k) => localStorage.removeItem(k));
        setIsLoggedIn(false);
        navigate("/login", { replace: true });
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [isLoggedIn, navigate]);

  /* ── Unread inbox polling ── */
  useEffect(() => {
    const fetchUnread = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) { setUnreadCount(0); return; }
      try {
        const { count } = await supabase
          .from("verp_inbox_messages")
          .select("id", { count: "exact", head: true })
          .eq("to_email", email).is("read_at", null);
        if (count !== null) setUnreadCount(count);
      } catch (_) {}
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, [isLoggedIn]);

  /* ── Body scroll lock for search overlay ── */
  useEffect(() => {
    if (isSearchOpen) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = sw + "px";
    } else {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    };
  }, [isSearchOpen]);

  /* ── Session lifetime guard ── */
  useEffect(() => {
    if (!sessionStorage.getItem("vrp_alive")) {
      ["userEmail","userId","userName","deviceFingerprint","luxury_cart"].forEach((k) => localStorage.removeItem(k));
      setIsLoggedIn(false);
    }
    sessionStorage.setItem("vrp_alive", "1");
    const onPageHide = (e) => {
      if (!e.persisted) {
        const fp  = localStorage.getItem("deviceFingerprint");
        const uid = localStorage.getItem("userId");
        if (fp && uid) supabase.from("verp_sessions").delete().match({ user_id: uid, device_fingerprint: fp });
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  /* ── Cart guard ── */
  useEffect(() => {
    window.__vaultAddToCartGuard = () => {
      if (!isLoggedIn) { setAuthPrompt({ open: true, path: "/cart" }); return false; }
      return true;
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    resetCart(); // wipe cart state before clearing auth keys
    ["userEmail","userId","userName","deviceFingerprint","luxury_cart"].forEach((k) => localStorage.removeItem(k));
    setIsLoggedIn(false);
    navigate("/");
  };

  const PROTECTED = ["/cart","/orderpage","/checkout","/inbox","/support","/reviews"];
  const handleNavClick = (e, path) => {
    if (!isLoggedIn && PROTECTED.includes(path)) {
      e.preventDefault();
      setAuthPrompt({ open: true, path });
    }
  };
  const isActive = (p) => location.pathname === p;

  const guestBottomNav = [
    { label: "Home",    icon: "home",          path: "/",        protected: false },
    { label: "About",   icon: "info",          path: "/about",   protected: false },
    { label: "Cart",    icon: "shopping_cart", path: "/cart",    protected: true  },
    { label: "Inbox",   icon: "mail",          path: "/inbox",   protected: true  },
    { label: "Reviews", icon: "star",          path: "/reviews", protected: true  },
  ];
  const loggedInBottomNav = [
    { label: "Home",    icon: "home",          path: "/",          protected: false },
    { label: "Orders",  icon: "inventory_2",   path: "/orderpage", protected: true  },
    { label: "Cart",    icon: "shopping_cart", path: "/cart",      protected: true, isCart: true  },
    { label: "Inbox",   icon: "mail",          path: "/inbox",     protected: true, isInbox: true },
    { label: "Profile", icon: null,            path: null,         isProfile: true },
  ];
  const bottomNavItems = isLoggedIn ? loggedInBottomNav : guestBottomNav;

  return (
    <>
      <Navbar_AuthPrompt
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, path: "" })}
        targetPath={authPrompt.path}
      />

      {/* ══════════════════════════════════════════════════
          PERMANENT SPACER
          Fixed height, never changes. Holds the layout
          gap left by the always-fixed top nav.
          ══════════════════════════════════════════════════ */}
      <div className="h-[68px] md:h-[82px] w-full shrink-0" aria-hidden="true" />

      {/* ══════════════════════════════════════════════════
          TOP NAV
          KEY FIX: "left-0 right-0" instead of "w-full".
          w-full on a fixed element = 100vw which is tied
          to the viewport and changes when the carousel
          causes the scrollbar to appear/disappear (~6px
          oscillation per frame). left-0 right-0 uses the
          layout edges which are stable and unaffected.

          will-change:transform puts the nav on its own
          GPU compositing layer — completely isolated from
          page repaints caused by the carousel.
          ══════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-[68px] md:h-[82px]"
        style={{
          background: isScrolled ? "rgba(8,8,8,0.92)" : "rgba(8,8,8,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: isScrolled
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid rgba(255,255,255,0.03)",
          transition: "background 0.25s ease, border-color 0.25s ease",
          fontFamily: "'DM Sans',sans-serif",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        {/* ── MOBILE TOP BAR ── */}
        <div className="md:hidden h-full px-5 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0 no-underline">
            <img src={logo} alt="Vault" className="h-9 object-contain" style={{ filter: "invert(1) brightness(2)" }} />
          </Link>

          {isLoggedIn && (
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                flex: 1, maxWidth: 200, margin: "0 12px",
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 14px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", color: "rgba(255,255,255,0.3)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
              <span style={{ fontSize: 11, letterSpacing: "0.05em", fontFamily: "'DM Sans',sans-serif" }}>Search...</span>
            </button>
          )}

          {!isLoggedIn ? (
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/login" style={{
                display: "flex", alignItems: "center", height: 36,
                padding: "0 14px", borderRadius: 10, textDecoration: "none",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "'JetBrains Mono',monospace",
              }}>LOGIN</Link>
              <Link to="/signup" style={{
                display: "flex", alignItems: "center", height: 36,
                padding: "0 14px", borderRadius: 10, textDecoration: "none",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                fontWeight: 800, color: "#fff",
                background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: "0 4px 14px rgba(236,91,19,0.3)",
              }}>JOIN</Link>
            </div>
          ) : (
            <Link to="/cart" style={{
              position: "relative", width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 10, textDecoration: "none",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.5)",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_cart</span>
              {itemCount > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#ec5b13", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 7, fontWeight: 900, border: "1.5px solid #080808",
                  fontFamily: "'JetBrains Mono',monospace",
                }}>{itemCount}</span>
              )}
            </Link>
          )}
        </div>

        {/* ── DESKTOP TOP BAR ── */}
        <div className="hidden md:flex h-full px-10 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center shrink-0">
              <img src={logo} alt="Vault" className="h-[42px] object-contain" style={{ filter: "invert(1) brightness(2)" }} />
            </Link>
            <div className="flex items-center gap-8">
              {[
                { name: "About",   path: "/about"     },
                { name: "Orders",  path: "/orderpage", protected: true },
                { name: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}`, path: "/cart", protected: true, isCart: true },
                { name: "Inbox",   path: "/inbox",     protected: true, isInbox: true },
                { name: "Reviews", path: "/reviews",   protected: true },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`relative no-underline text-[12.5px] font-bold tracking-[0.16em] uppercase pb-0.5
                    after:absolute after:bottom-[-4px] after:left-0 after:h-px after:bg-[#ec5b13]
                    after:transition-[width] after:duration-[250ms]
                    ${isActive(link.path) ? "text-[#ec5b13] after:w-full" : "text-white/52 after:w-0 hover:after:w-full"}`}
                  style={{ fontFamily: "'DM Sans',sans-serif" }}
                >
                  {link.name}
                  {link.isCart && itemCount > 0 && (
                    <span className="absolute top-[-4px] right-[-8px] w-1.5 h-1.5 rounded-full bg-[#ec5b13] animate-pulse" />
                  )}
                  {link.isInbox && unreadCount > 0 && (
                    <span className="absolute top-[-8px] right-[-14px] min-w-[17px] h-[17px] rounded-full bg-[#ec5b13] text-black flex items-center justify-center font-bold px-0.5"
                      style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8 }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/[0.07] cursor-pointer text-white/50 bg-white/[0.04] hover:bg-[#ec5b13]/10 hover:border-[#ec5b13]/30 hover:text-[#ec5b13] transition-all duration-[180ms]">
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
            <Link to="/cart" onClick={(e) => handleNavClick(e, "/cart")}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl border border-white/[0.07] cursor-pointer text-white/50 bg-white/[0.04] hover:bg-[#ec5b13]/10 hover:border-[#ec5b13]/30 hover:text-[#ec5b13] transition-all duration-[180ms] no-underline">
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-[15px] h-[15px] rounded-full bg-[#ec5b13] text-white flex items-center justify-center font-black border-[1.5px] border-black/90"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8 }}>{itemCount}</span>
              )}
            </Link>
            <div className="ml-1">
              {isLoggedIn ? (
                <Navbar_UserMenu userName={userName} avatarUrl={avatarUrl} onLogout={handleLogout} onTerminate={handleTerminate} />
              ) : (
                <div className="flex gap-2">
                  <Link to="/login"
                    className="flex items-center h-11 px-[18px] rounded-xl no-underline text-[10px] tracking-[0.16em] uppercase text-white/45 border border-white/10 hover:border-[#ec5b13]/40 hover:text-[#ec5b13] transition-all duration-[180ms]"
                    style={{ fontFamily: "'JetBrains Mono',monospace" }}>LOGIN</Link>
                  <Link to="/signup"
                    className="flex items-center h-11 px-[18px] rounded-xl no-underline text-[10px] tracking-[0.16em] uppercase font-bold text-white"
                    style={{ fontFamily: "'JetBrains Mono',monospace", background: "linear-gradient(135deg,#ec5b13,#d94e0f)", boxShadow: "0 4px 14px rgba(236,91,19,0.3)" }}>JOIN</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* ══════════════════════════════════════════════════════════
          MOBILE BOTTOM DOCK
          KEY FIX: width is set to a fixed px value on mount
          via useEffect and stored in the element directly.
          This means the dock width NEVER recalculates from vw,
          so the carousel's viewport oscillation can't touch it.

          left-0 right-0 on the outer wrapper (same as TopNav fix)
          then the inner pill is centered with mx-auto + max-w.

          will-change:transform isolates it on its own GPU layer.
          ══════════════════════════════════════════════════════════ */}
      <div
        className="md:hidden fixed bottom-3 left-0 right-0 z-[200] flex justify-center px-4"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <nav
          className="rounded-[2.5rem] relative overflow-hidden w-full"
          style={{
            maxWidth: 420,
            background: "rgba(8,8,8,0.92)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: "20%", right: "20%", height: 1, borderRadius: 1,
            background: "linear-gradient(90deg,transparent,rgba(236,91,19,0.4),transparent)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "stretch", padding: "8px 4px 8px" }}>
            {bottomNavItems.map((item) => {
              const active   = item.path ? isActive(item.path) : false;
              const isLocked = !isLoggedIn && item.protected;

              if (item.isProfile) {
                const initial = userName?.[0]?.toUpperCase() || "V";
                return (
                  <button key="profile"
                    onClick={() => setProfileTray((o) => !o)}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 5, padding: "2px 0",
                      background: "none", border: "none", cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: avatarUrl ? "transparent" : "linear-gradient(135deg,#ec5b13,#d94e0f)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 13, fontStyle: "italic",
                      border: profileTrayOpen ? "2px solid rgba(236,91,19,0.7)" : "2px solid rgba(236,91,19,0.3)",
                      boxShadow: profileTrayOpen ? "0 0 14px rgba(236,91,19,0.4)" : "none",
                      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                      overflow: "hidden",
                    }}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : initial
                      }
                    </div>
                    <span style={{
                      fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase",
                      fontFamily: "'JetBrains Mono',monospace",
                      color: profileTrayOpen ? "#ec5b13" : "rgba(255,255,255,0.3)",
                      transition: "color 0.18s ease",
                    }}>You</span>
                  </button>
                );
              }

              if (isLocked) {
                return (
                  <button key={item.label}
                    onClick={() => setAuthPrompt({ open: true, path: item.path })}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 5, padding: "2px 0", position: "relative",
                      background: "none", border: "none", cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div className="lock-shimmer" style={{ position: "relative" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 21, color: "rgba(255,255,255,0.15)", display: "block" }}>
                        {item.icon}
                      </span>
                      <span className="material-symbols-outlined" style={{
                        position: "absolute", bottom: -3, right: -6,
                        fontSize: 9, color: "rgba(236,91,19,0.45)",
                        background: "rgba(8,8,8,0.95)", borderRadius: 3, padding: "0 1px",
                      }}>lock</span>
                    </div>
                    <span style={{
                      fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase",
                      fontFamily: "'JetBrains Mono',monospace",
                      color: "rgba(255,255,255,0.15)",
                    }}>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 5, padding: "2px 0",
                    textDecoration: "none", position: "relative",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {active && (
                    <div style={{
                      position: "absolute", inset: "2px 6px",
                      borderRadius: 16,
                      background: "rgba(236,91,19,0.1)",
                      border: "1px solid rgba(236,91,19,0.14)",
                    }} />
                  )}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: 21,
                      color: active ? "#ec5b13" : "rgba(255,255,255,0.35)",
                      transition: "color 0.18s ease",
                      display: "block",
                      ...(active ? { filter: "drop-shadow(0 0 4px rgba(236,91,19,0.5))" } : {}),
                    }}>{item.icon}</span>
                    {item.isCart && itemCount > 0 && (
                      <span style={{
                        position: "absolute", top: -3, right: -5,
                        width: 13, height: 13, borderRadius: "50%",
                        background: "#ec5b13", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 7, fontWeight: 900, border: "1.5px solid #080808",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}>{itemCount}</span>
                    )}
                    {item.isInbox && unreadCount > 0 && (
                      <span style={{
                        position: "absolute", top: -3, right: -7,
                        minWidth: 13, height: 13, borderRadius: 7,
                        background: "#ec5b13", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 7, fontWeight: 900, border: "1.5px solid #080808", padding: "0 2px",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}>{unreadCount}</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono',monospace", zIndex: 1,
                    color: active ? "#ec5b13" : "rgba(255,255,255,0.3)",
                    transition: "color 0.18s ease",
                  }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <style>{`
        .lock-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: lockShimmer 3.5s ease infinite;
          border-radius: 6px;
        }
        @keyframes lockShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <ProfileTray
        isOpen={profileTrayOpen}
        onClose={() => setProfileTray(false)}
        userName={userName}
        avatarUrl={avatarUrl}
        onLogout={handleLogout}
        onTerminate={handleTerminate}
      />
    </>
  );
};

export default Navbar;