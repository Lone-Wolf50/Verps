import React, { useState, useEffect, useRef, useCallback } from "react";
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
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
          border: "2px solid rgba(236,91,19,0.35)",
          cursor: "pointer",
          fontFamily: "'Playfair Display',serif",
          fontSize: 18, fontStyle: "italic",
          color: "#fff", fontWeight: 400,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 0 0 rgba(236,91,19,0)",
          transition: "box-shadow 200ms, border-color 200ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(236,91,19,0.25)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.7)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 0 0 rgba(236,91,19,0)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.35)"; }}
      >
        {initial}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:"fixed",inset:0,zIndex:98}} />
          <div style={{position:"absolute",top:"calc(100% + 12px)",right:0,width:220,background:"#0d0d0d",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"8px",zIndex:99,boxShadow:"0 20px 60px rgba(0,0,0,0.7)"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)",marginBottom:4}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.85)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</p>
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
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>{item.label}</span>
              </Link>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",marginTop:4,paddingTop:4}}>
              <button onClick={() => { setOpen(false); onLogout(); }}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"rgba(239,68,68,0.7)",textAlign:"left"}}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span className="material-symbols-outlined" style={{fontSize:16}}>logout</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>Sign Out</span>
              </button>
              <button onClick={handleTerminate}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",color:"rgba(239,68,68,0.45)",textAlign:"left",marginTop:2}}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span className="material-symbols-outlined" style={{fontSize:16}}>delete_forever</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>Terminate Account</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Shared terminate-account logic ── */
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
   CHILD 3 — DraggableFloatingSupport
   Shown only when: isLoggedIn === true AND pathname !== "/"
   ════════════════════════════════════════════════════════════ */
const DraggableFloatingSupport = () => {
  const navigate = useNavigate();

  const [pos, setPos] = useState({ x: window.innerWidth - 72, y: window.innerHeight * 0.42 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStart = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      setPos(p => ({
        x: Math.min(p.x, window.innerWidth - 56),
        y: Math.min(p.y, window.innerHeight - 56),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setHasDragged(false);
    dragStart.current = {
      startX: e.clientX - pos.x,
      startY: e.clientY - pos.y,
    };
    btnRef.current?.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.startX;
    const newY = e.clientY - dragStart.current.startY;
    const clamped = {
      x: Math.max(8, Math.min(newX, window.innerWidth - 64)),
      y: Math.max(80, Math.min(newY, window.innerHeight - 64)),
    };
    setPos(clamped);
    setHasDragged(true);
  }, [isDragging]);

  const onPointerUp = useCallback((e) => {
    setIsDragging(false);
    if (!hasDragged) {
      navigate("/support");
    }
  }, [isDragging, hasDragged, navigate]);

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ec5b13, #d94e0f)",
        border: "none",
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isDragging
          ? "0 12px 40px rgba(236,91,19,0.55), 0 0 0 4px rgba(236,91,19,0.2)"
          : "0 6px 24px rgba(236,91,19,0.4)",
        transition: isDragging ? "none" : "box-shadow 200ms, transform 200ms",
        transform: isDragging ? "scale(1.1)" : "scale(1)",
        touchAction: "none",
        userSelect: "none",
      }}
      title="Support — drag to reposition"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff", pointerEvents: "none" }}>
        support_agent
      </span>
      <span style={{
        position: "absolute",
        bottom: -22,
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 7,
        letterSpacing: "0.15em",
        color: "rgba(255,255,255,0.25)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        SUPPORT
      </span>
    </button>
  );
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

  const isHomepage = location.pathname === "/";

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    setIsLoggedIn(!!email);
    setUserName(name || "");
  }, [location]);

  /* ── Single-device policy ── */
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

  /* ── Unread inbox badge ── */
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

  useEffect(() => {
    const isAlive = sessionStorage.getItem("vrp_alive");
    if (!isAlive) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("deviceFingerprint");
      setIsLoggedIn(false);
    }
    sessionStorage.setItem("vrp_alive", "1");
    const handlePageHide = (e) => {
      if (!e.persisted) {
        try {
          const fingerprint = localStorage.getItem("deviceFingerprint");
          const userId = localStorage.getItem("userId");
          if (fingerprint && userId) {
            supabase.from("verp_sessions").delete().match({ user_id: userId, device_fingerprint: fingerprint });
          }
        } catch (_) {}
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

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
    { name: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}`, path: "/cart", icon: "shopping_cart", isCart: true, protected: true },
    { name: "Inbox", path: "/inbox", icon: "mail", isInbox: true, protected: true },
    { name: "Reviews", path: "/reviews", icon: "star", protected: true },
    { name: "Support", path: "/support", icon: "support_agent", protected: true, isSupport: true },
  ];

  const mobileNavLinks = navLinks.filter(link => {
    if (link.isSupport) return isHomepage;
    return true;
  });

  const isActive = (path) => location.pathname === path;

  // ── CHANGED: taller icon buttons for desktop (44px vs 40px) ──
  const iconBtn = (extraStyle = {}) => ({
    width: 44, height: 44,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer",
    color: "rgba(255,255,255,0.5)",
    transition: "all 180ms",
    position: "relative",
    ...extraStyle,
  });

  const desktopNavLinks = navLinks.filter(link => {
    if (link.isSupport) return !isLoggedIn;
    return true;
  });

  return (
    <>
      <style>{`
        @keyframes navPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
        .glass-nav{background:rgba(8,8,8,0.92);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);border-bottom:1px solid rgba(255,255,255,0.05);}
        .nav-link{position:relative;transition:color 200ms;}
        .nav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:#ec5b13;transition:width 250ms cubic-bezier(0.16,1,0.3,1);}
        .nav-link:hover::after,.nav-link.active::after{width:100%;}
        .nav-link.active{color:#ec5b13!important;}
        .glass-panel{background:#0d0d0d;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;}
        .swal-vault-term{border:1px solid rgba(239,68,68,0.3)!important;border-radius:20px!important;}
        .nav-icon-btn:hover{background:rgba(236,91,19,0.1)!important;border-color:rgba(236,91,19,0.3)!important;color:#ec5b13!important;}
      `}</style>

      <Navbar_AuthPrompt isOpen={authPrompt.open} onClose={() => setAuthPrompt({ open: false, path: "" })} targetPath={authPrompt.path} />

      {isLoggedIn && !isHomepage && <DraggableFloatingSupport />}

      {/* ── FIXED NAV ──
          CHANGED: height 68 → 80 on md+, kept 68 on mobile via inline style override below
      ── */}
      <nav
        className="glass-nav fixed top-0 left-0 w-full z-[100] px-5 md:px-10 flex items-center justify-between"
        style={{ height: 68, fontFamily: "'DM Sans',sans-serif" }}
      >
        {/* Taller bar on md+ without a Tailwind h-class conflict */}
        <style>{`@media(min-width:768px){.glass-nav{height:82px!important;}}`}</style>

        {/* ── LEFT: Logo + desktop links ── */}
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="flex items-center" style={{ flexShrink: 0 }}>
            {/* CHANGED: logo height 36 → 42 on desktop via responsive wrapper */}
            <img
              src={logo}
              alt="Vault"
              style={{ height: 36, objectFit: "contain", filter: "invert(1) brightness(2)" }}
              className="md:!h-[42px]"
            />
          </Link>

          {/* DESKTOP NAV LINKS — CHANGED: fontSize 11 → 12.5, letterSpacing slightly relaxed */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {desktopNavLinks.map(link => {
              if (link.isSupport && !isLoggedIn) {
                return (
                  <button
                    key={link.name}
                    onClick={e => { e.preventDefault(); setAuthPrompt({ open: true, path: link.path }); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 12.5,
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.2)",
                      padding: 0,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    title="Sign in to access Support"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>lock</span>
                    {link.name}
                  </button>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={e => handleNavClick(e, link.path)}
                  className={`nav-link ${isActive(link.path) ? "active" : ""}`}
                  style={{
                    textDecoration: "none",
                    position: "relative",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: isActive(link.path) ? "#ec5b13" : "rgba(255,255,255,0.52)",
                    paddingBottom: 2,
                  }}
                >
                  {link.name}
                  {link.isCart && itemCount > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -8, width: 6, height: 6, borderRadius: "50%", background: "#ec5b13", animation: "navPulse 2s ease-in-out infinite" }} />
                  )}
                  {link.isInbox && unreadCount > 0 && (
                    <span style={{ position: "absolute", top: -8, right: -14, minWidth: 17, height: 17, borderRadius: 999, background: "#ec5b13", color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: icon tray ── */}
        <div className="flex items-center gap-2" style={{ marginRight: 12 }}>
          <button onClick={() => setIsSearchOpen(true)} className="nav-icon-btn" style={iconBtn()}>
            <span className="material-symbols-outlined" style={{ fontSize: 21 }}>search</span>
          </button>

          <Link to="/cart" onClick={e => handleNavClick(e, "/cart")} className="nav-icon-btn" style={{ ...iconBtn(), textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 21 }}>shopping_cart</span>
            {itemCount > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 15, height: 15, borderRadius: "50%",
                background: "#ec5b13", color: "#fff",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 8, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
                border: "1.5px solid rgba(8,8,8,0.9)",
              }}>{itemCount}</span>
            )}
          </Link>

          {/* Auth state — desktop only */}
          <div className="hidden md:flex items-center" style={{ marginLeft: 4 }}>
            {isLoggedIn ? (
              <Navbar_UserMenu userName={userName} onLogout={handleLogout} onTerminate={handleTerminate} />
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  to="/login"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 10, letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    padding: "0 18px",
                    height: 44,
                    display: "flex", alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    transition: "all 180ms",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)"; e.currentTarget.style.color = "#ec5b13"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  LOGIN
                </Link>
                <Link
                  to="/signup"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 10, letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "0 18px",
                    height: 44,
                    display: "flex", alignItems: "center",
                    borderRadius: 12,
                    fontWeight: 700,
                    boxShadow: "0 4px 14px rgba(236,91,19,0.3)",
                  }}
                >
                  JOIN
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden nav-icon-btn"
            style={{ ...iconBtn({ width: 40, height: 40 }), display: undefined }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
          </button>
        </div>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* ── MOBILE MENU (unchanged) ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: isMenuOpen ? "auto" : "none" }}>
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
        <div style={{
          position: "absolute", top: 16, right: 16, bottom: 16,
          width: "88%", maxWidth: 380,
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 24, overflow: "hidden",
          display: "flex", flexDirection: "column",
          transform: isMenuOpen ? "translateX(0)" : "translateX(calc(100% + 24px))",
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
              <button
                onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: 24, padding: "14px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", opacity: isMenuOpen ? 1 : 0, transform: isMenuOpen ? "translateX(0)" : "translateX(16px)", transition: `opacity 350ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)` }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#ec5b13" }}>search</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>
                  Quick Search
                </span>
              </button>

              {mobileNavLinks.map((link, idx) => {
                if (link.isSupport) {
                  if (!isLoggedIn) return null;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 24,
                        padding: "14px 0",
                        textDecoration: "none",
                        opacity: isMenuOpen ? 1 : 0,
                        transform: isMenuOpen ? "translateX(0)" : "translateX(16px)",
                        transition: `opacity 350ms ease ${isMenuOpen ? idx * 45 : 0}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${isMenuOpen ? idx * 45 : 0}ms`,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: isActive(link.path) ? "#ec5b13" : "rgba(255,255,255,0.28)" }}>
                        {link.icon}
                      </span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: isActive(link.path) ? "white" : "rgba(255,255,255,0.6)" }}>
                        {link.name}
                      </span>
                    </Link>
                  );
                }

                return (
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
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: isActive(link.path) ? "#ec5b13" : "rgba(255,255,255,0.28)", transition: "color 200ms" }}>
                      {link.icon}
                    </span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: isActive(link.path) ? "white" : "rgba(255,255,255,0.6)", transition: "color 200ms" }}>
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ flexShrink: 0, padding: "18px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  style={{ width: "100%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "14px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(239,68,68,0.8)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 180ms" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                  SIGN OUT
                </button>
                <button
                  onClick={() => { handleTerminate(() => setIsMenuOpen(false)); }}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: "13px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(239,68,68,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 180ms" }}
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
                  style={{ width: "100%", background: "linear-gradient(135deg, #ec5b13, #d94e0f)", border: "none", borderRadius: 14, padding: "14px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                  SIGN IN
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 0", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                  CREATE ACCOUNT
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;