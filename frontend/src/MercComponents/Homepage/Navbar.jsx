import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../MercComponents/Cartoptions/CartContext";
import SearchOverlay from "./SearchOverlay";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import logo from "../../assets/V - 1.png";

/* ══════════════════════════════════════════════════════════════
   CHILD 1 — Navbar_AuthPrompt
   ════════════════════════════════════════════════════════════ */
const Navbar_AuthPrompt = ({ isOpen, onClose, targetPath }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  const goTo = (path) => { onClose(); navigate(path, { state: { redirect: targetPath } }); };
  return (
    <>
      <style>{`@keyframes promptFade{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:400,background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"36px 32px",animation:"promptFade 0.25s ease both"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <span style={{fontSize:40}}>🔒</span>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontStyle:"italic",color:"white",marginTop:16,marginBottom:8}}>Members Only</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>Sign in to access this area of Verp.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>goTo("/login")} style={{width:"100%",background:"linear-gradient(135deg,#ec5b13,#d94e0f)",border:"none",borderRadius:12,padding:"14px 0",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:800,letterSpacing:"0.22em",textTransform:"uppercase",color:"#fff",cursor:"pointer"}}>SIGN IN</button>
            <button onClick={()=>goTo("/signup")} style={{width:"100%",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"14px 0",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",cursor:"pointer"}}>CREATE ACCOUNT</button>
            <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:"0.2em",textTransform:"uppercase",marginTop:4}}>CONTINUE BROWSING</button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   CHILD 2 — Navbar_UserMenu (desktop dropdown)
   ════════════════════════════════════════════════════════════ */
const Navbar_UserMenu = ({ userName, onLogout, onTerminate }) => {
  const [open, setOpen] = useState(false);
  const initial = userName?.[0]?.toUpperCase() || "V";

  const handleTerminate = async () => {
    setOpen(false);
    if (onTerminate) await onTerminate();
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#ec5b13,#d94e0f)",border:"none",cursor:"pointer",fontFamily:"'Playfair Display',serif",fontSize:14,fontStyle:"italic",color:"#fff",fontWeight:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {initial}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:"fixed",inset:0,zIndex:98}} />
          <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,width:210,background:"#0d0d0d",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"8px",zIndex:99,boxShadow:"0 16px 60px rgba(0,0,0,0.6)"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)",marginBottom:4}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,0.75)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</p>
              <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.2em",color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>VAULT MEMBER</p>
            </div>
            {[
              { label: "Profile", icon: "person", path: "/profile" },
              { label: "Orders", icon: "inventory_2", path: "/orderpage" },
              { label: "Inbox", icon: "mail", path: "/inbox" },
            ].map(item => (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:8,textDecoration:"none",transition:"background 150ms",color:"rgba(255,255,255,0.6)"}}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span className="material-symbols-outlined" style={{fontSize:16}}>{item.icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>{item.label}</span>
              </Link>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",marginTop:4,paddingTop:4}}>
              <button onClick={() => { setOpen(false); onLogout(); }}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"rgba(239,68,68,0.7)",textAlign:"left"}}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span className="material-symbols-outlined" style={{fontSize:16}}>logout</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>Sign Out</span>
              </button>
              <button onClick={handleTerminate}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"rgba(239,68,68,0.45)",textAlign:"left",marginTop:2}}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span className="material-symbols-outlined" style={{fontSize:16}}>delete_forever</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>Terminate Account</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Shared terminate-account logic (used by desktop menu + mobile menu) ── */
const useTerminateAccount = () => {
  const navigate = useNavigate();
  return async (onCloseMenu) => {
    if (onCloseMenu) onCloseMenu();
    const result = await Swal.fire({
      title: "TERMINATE ACCOUNT?",
      html: `<p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.7;">This will <strong style="color:#ef4444">permanently delete</strong> your account, all orders, and chat history. This action <strong>cannot be undone</strong>.</p>`,
      background: "#0a0a0a",
      color: "#fff",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1c1c1c",
      confirmButtonText: "DELETE MY ACCOUNT",
      cancelButtonText: "KEEP ACCOUNT",
      customClass: { popup: "swal-vault-term" },
    });
    if (!result.isConfirmed) return;

    const confirm2 = await Swal.fire({
      title: "ARE YOU ABSOLUTELY SURE?",
      input: "text",
      inputPlaceholder: 'Type "DELETE" to confirm',
      background: "#0a0a0a",
      color: "#0a0a0a",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1c1c1c",
      confirmButtonText: "PROCEED WITH DELETION",
      cancelButtonText: "CANCEL",
      inputValidator: (v) => v !== "DELETE" ? "You must type DELETE to confirm" : null,
    });
    if (!confirm2.isConfirmed) return;

    const email = localStorage.getItem("userEmail");
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
      await Swal.fire({
        title: "Account Deleted",
        text: "Your membership has been terminated.",
        icon: "success",
        background: "#0a0a0a",
        color: "#fff",
        timer: 2500,
        showConfirmButton: false,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error", background: "#0a0a0a", color: "#fff" });
    }
  };
};

/* ══════════════════════════════════════════════════════════════
   PARENT — Navbar
   ════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authPrompt, setAuthPrompt] = useState({ open: false, path: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const handleTerminate = useTerminateAccount();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    setIsLoggedIn(!!email);
    setUserName(name || "");
  }, [location]);

  /* ── Single-device policy ─────────────────────────────────── */
  useEffect(() => {
    const checkDevice = async () => {
      const userId = localStorage.getItem("userId");
      const fingerprint = localStorage.getItem("deviceFingerprint");
      if (!userId || !fingerprint) return;
      const { data: session } = await supabase.from("verp_sessions").select("device_fingerprint").eq("user_id", userId).maybeSingle();
      if (session && session.device_fingerprint !== fingerprint) {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("deviceFingerprint");
        setIsLoggedIn(false);
        navigate("/login", { replace: true });
      }
    };
    if (isLoggedIn) {
      checkDevice();
      const i = setInterval(checkDevice, 30000);
      return () => clearInterval(i);
    }
  }, [isLoggedIn, navigate]);

  /* ── Unread inbox badge ───────────────────────────────────── */
  useEffect(() => {
    const fetchUnread = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) { setUnreadCount(0); return; }
      try {
        const { count } = await supabase.from("verp_inbox_messages").select("id", { count: "exact", head: true }).eq("to_email", userEmail).is("read_at", null);
        if (count !== null) setUnreadCount(count);
      } catch (_) {}
    };
    fetchUnread();
    const i = setInterval(fetchUnread, 30000);
    return () => clearInterval(i);
  }, [isLoggedIn]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? "hidden" : "unset";
  }, [isMenuOpen, isSearchOpen]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("deviceFingerprint");
    setIsLoggedIn(false);
    navigate("/");
  };

  const PROTECTED_PATHS = ["/cart", "/orderpage", "/checkout", "/inbox", "/support", "/reviews"];

  const handleNavClick = (e, path) => {
    if (!isLoggedIn && PROTECTED_PATHS.includes(path)) {
      e.preventDefault();
      setAuthPrompt({ open: true, path });
    }
  };

  useEffect(() => {
    window.__vaultAddToCartGuard = () => {
      if (!isLoggedIn) { setAuthPrompt({ open: true, path: "/cart" }); return false; }
      return true;
    };
  }, [isLoggedIn]);

  const navLinks = [
    { name: "About", path: "/about", icon: "info", protected: false },
    { name: "Orders", path: "/orderpage", icon: "inventory_2", protected: true },
    { name: `Bag (${itemCount})`, path: "/cart", icon: "shopping_bag", isCart: true, protected: true },
    { name: "Inbox", path: "/inbox", icon: "mail", isInbox: true, protected: true },
    { name: "Support", path: "/support", icon: "support_agent", protected: true },
    { name: "Reviews", path: "/reviews", icon: "star", protected: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes navPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
        .glass-nav{background:rgba(8,8,8,0.88);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(255,255,255,0.04);}
        .nav-link{position:relative;transition:color 200ms;}
        .nav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:#ec5b13;transition:width 250ms cubic-bezier(0.16,1,0.3,1);}
        .nav-link:hover::after,.nav-link.active::after{width:100%;}
        .nav-link.active{color:#ec5b13!important;}
        .glass-panel{background:#0d0d0d;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;}
        .swal-vault-term{border:1px solid rgba(239,68,68,0.3)!important;border-radius:20px!important;}
      `}</style>

      <Navbar_AuthPrompt isOpen={authPrompt.open} onClose={() => setAuthPrompt({ open: false, path: "" })} targetPath={authPrompt.path} />

      {/* ── FIXED NAV ─────────────────────────────────────────── */}
      <nav className="glass-nav fixed top-0 left-0 w-full z-[100] px-6 md:px-8 flex items-center justify-between" style={{ height: 68, fontFamily: "'DM Sans',sans-serif" }}>
        {/* Logo + desktop links */}
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Vault" style={{ height: 40, objectFit: "contain", filter: "invert(1) brightness(2)" }} />
          </Link>
          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} onClick={e => handleNavClick(e, link.path)}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
                style={{ textDecoration: "none", position: "relative", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: isActive(link.path) ? "#ec5b13" : "rgba(255,255,255,0.45)" }}>
                {link.name}
                {link.isCart && itemCount > 0 && (
                  <span style={{ position: "absolute", top: -3, right: -6, width: 6, height: 6, borderRadius: "50%", background: "#ec5b13", animation: "navPulse 2s ease-in-out infinite" }} />
                )}
                {link.isInbox && unreadCount > 0 && (
                  <span style={{ position: "absolute", top: -7, right: -12, minWidth: 16, height: 16, borderRadius: 999, background: "#ec5b13", color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", lineHeight: 1 }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 text-white/50 hover:text-[#ec5b13] transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>search</span>
          </button>
          <Link to="/cart" onClick={e => handleNavClick(e, "/cart")} className="relative p-2 text-white/50 hover:text-[#ec5b13] transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>shopping_bag</span>
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#ec5b13] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </Link>

          {/* Auth state — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Navbar_UserMenu userName={userName} onLogout={handleLogout} onTerminate={handleTerminate} />
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/login" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "8px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, transition: "all 180ms" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)"; e.currentTarget.style.color = "#ec5b13"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                  LOGIN
                </Link>
                <Link to="/signup" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", background: "#ec5b13", color: "#000", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontWeight: 700 }}>
                  JOIN
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-white hover:text-[#ec5b13] transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>menu</span>
          </button>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* ── MOBILE MENU ──────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: isMenuOpen ? "auto" : "none" }}>
        {/* Backdrop */}
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            opacity: isMenuOpen ? 1 : 0,
            transition: "opacity 400ms ease",
          }}
        />
        {/* Slide-in panel */}
        <div style={{
          position: "absolute", top: 16, right: 16, bottom: 16,
          width: "88%", maxWidth: 380,
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 24, overflow: "hidden",
          display: "flex", flexDirection: "column",
          transform: isMenuOpen ? "translateX(0)" : "translateX(24px)",
          opacity: isMenuOpen ? 1 : 0,
          transition: "transform 420ms cubic-bezier(0.16,1,0.3,1), opacity 350ms ease",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}>
          
          {/* Panel header */}
          <div style={{ flexShrink: 0, padding: "24px 24px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.28em", color: "#ec5b13", marginBottom: 5 }}>
                {isLoggedIn ? `MEMBER: ${userName?.split(" ")[0] || ""}` : "GUEST USER"}
              </p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontStyle: "italic", fontWeight: 400, color: "white", letterSpacing: "-0.01em", lineHeight: 1 }}>
                {isLoggedIn ? "V-TAB" : "Guest"}
              </h2>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", transition: "all 150ms" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* Scrollable nav links */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            <div style={{ width: 48, height: 2, background: "#ec5b13", borderRadius: 2, marginBottom: 28 }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Quick search shortcut */}
              <button
                onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: 24, padding: "14px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", opacity: isMenuOpen ? 1 : 0, transform: isMenuOpen ? "translateX(0)" : "translateX(16px)", transition: `opacity 350ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)` }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#ec5b13" }}>search</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>
                  Quick Search
                </span>
              </button>

              {navLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={e => {
                    handleNavClick(e, link.path);
                    if (!link.protected || isLoggedIn) setIsMenuOpen(false);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 24,
                    padding: "14px 0",
                    textDecoration: "none",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen ? "translateX(0)" : "translateX(16px)",
                    transition: `opacity 350ms ease ${isMenuOpen ? idx * 45 : 0}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${isMenuOpen ? idx * 45 : 0}ms`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: isActive(link.path) ? "#ec5b13" : "rgba(255,255,255,0.28)", transition: "color 200ms" }}>
                    {link.icon}
                  </span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: isActive(link.path) ? "white" : "rgba(255,255,255,0.6)", transition: "color 200ms" }}>
                    {link.name}
                  </span>
                  {link.isInbox && unreadCount > 0 && (
                    <span style={{ marginLeft: "auto", minWidth: 20, height: 20, borderRadius: 999, background: "#ec5b13", color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                      {unreadCount}
                    </span>
                  )}
                  {link.protected && !isLoggedIn && !link.isInbox && (
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.1)", marginLeft: "auto" }}>lock</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Footer actions ── */}
          <div style={{ flexShrink: 0, padding: "18px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  style={{ width: "100%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "14px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(239,68,68,0.8)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 180ms" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(239,68,68,0.8)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                  SIGN OUT
                </button>
                <button
                  onClick={() => { handleTerminate(() => setIsMenuOpen(false)); }}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: "13px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(239,68,68,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 180ms" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.5)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_forever</span>
                  TERMINATE ACCOUNT
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ width: "100%", background: "linear-gradient(135deg, #ec5b13, #d94e0f)", border: "none", borderRadius: 14, padding: "14px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none", boxShadow: "0 6px 20px rgba(236,91,19,0.25)", transition: "all 180ms" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(236,91,19,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(236,91,19,0.25)"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                  SIGN IN
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", transition: "all 180ms" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                  CREATE ACCOUNT
                </Link>
              </>
            )}
            <p style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.1)", letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>
              Verp Series 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
