import { useState, useEffect } from "react";

const VerpInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]                     = useState(false);
  const [dismissed, setDismissed]           = useState(false);

  useEffect(() => {
    // Don't show if already installed or permanently dismissed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      localStorage.getItem("vrp_install_dismissed") === "permanent"
    ) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so it doesn't flash on page load
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = (permanent = false) => {
    setShow(false);
    setDismissed(true);
    if (permanent) localStorage.setItem("vrp_install_dismissed", "permanent");
  };

  if (!show || dismissed) return null;

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isMobile && (
        <div
          onClick={() => handleDismiss(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 700,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "vrpFadeIn 0.25s ease both",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          zIndex: 800,
          fontFamily: "'DM Sans', sans-serif",

          // Mobile: bottom sheet
          ...(isMobile ? {
            bottom: 80, left: 12, right: 12,
            animation: "vrpSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          } : {
            // Desktop: top-right toast
            top: 96, right: 20, width: 340,
            animation: "vrpSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }),

          background: "rgba(10,10,10,0.98)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: isMobile ? 24 : 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          padding: isMobile ? "20px" : "14px 16px",
          overflow: "hidden",
        }}
      >
        <style>{`
          @keyframes vrpFadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes vrpSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes vrpSlideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        `}</style>

        {/* Orange top line */}
        <div style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(236,91,19,0.5),transparent)",
          pointerEvents: "none",
        }} />

        {isMobile ? (
          /* ── Mobile layout ── */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: "#fff",
                fontFamily: "'Playfair Display', serif", fontStyle: "italic",
              }}>V</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: 15, fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>Verp</p>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>Add to home screen</p>
              </div>
              <button
                onClick={() => handleDismiss(false)}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 4 }}
              >×</button>
            </div>

            <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
              Install the Verp app for faster access, online browsing, and a seamless full-screen experience.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleDismiss(true)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
                  fontFamily: "'JetBrains Mono',monospace", cursor: "pointer",
                }}
              >Not now</button>
              <button
                onClick={handleInstall}
                style={{
                  flex: 2, padding: "12px 0", borderRadius: 12,
                  border: "1px solid rgba(236,91,19,0.6)",
                  background: "linear-gradient(135deg,rgba(236,91,19,0.28),rgba(217,78,15,0.18))",
                  color: "#fff", fontSize: 11, fontWeight: 800,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  fontFamily: "'JetBrains Mono',monospace", cursor: "pointer",
                  boxShadow: "0 0 20px rgba(236,91,19,0.2)",
                }}
              >Install App</button>
            </div>
          </>
        ) : (
          /* ── Desktop layout ── */
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#fff",
              fontFamily: "'Playfair Display',serif", fontStyle: "italic",
            }}>V</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Install Verp</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Add to your desktop for quick access</p>
            </div>
            <button
              onClick={handleInstall}
              style={{
                padding: "8px 14px", borderRadius: 10,
                border: "1px solid rgba(236,91,19,0.5)",
                background: "linear-gradient(135deg,rgba(236,91,19,0.22),rgba(217,78,15,0.14))",
                color: "#ec5b13", fontSize: 10, fontWeight: 800,
                letterSpacing: "0.16em", textTransform: "uppercase",
                fontFamily: "'JetBrains Mono',monospace", cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >Install</button>
            <button
              onClick={() => handleDismiss(true)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer", padding: "2px 4px" }}
            >×</button>
          </div>
        )}
      </div>
    </>
  );
};

export default VerpInstallBanner;