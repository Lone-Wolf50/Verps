import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../public/footer.jpg";

const footerLinks = {
  "The Craft": [
    { label: "Thread & Tension",    icon: "spool",              to: null, info: "Every Verp stitch is tension-tested at 180 N/m² — the same standard used by heritage European fashion houses. Consistency isn't optional; it's the baseline." },
    { label: "Pattern Architecture",icon: "architecture",        to: null, info: "Our patterns are digitally graded across 7 sizes with zero visual distortion. A size XS and a size XXL carry identical proportional silhouettes — that's intentional geometry." },
    { label: "Limited Drops",       icon: "local_fire_department", to: "/categories" },
    { label: "Colorway Science",    icon: "palette",             to: null, info: "Our dyes are OEKO-TEX® certified, colorfast to 50+ washes, and UV-stable. Verp pieces don't fade — they age with character." },
    { label: "Garment Afterlife",   icon: "recycling",           to: null, info: "Worn-out Verp pieces can be returned for our fabric recovery program. We repurpose offcuts into accessories and donate wearable seconds to community programs." },
  ],
  "Vault Access": [
    { label: "My Orders",           icon: "inventory_2",        to: "/orderpage" },
    { label: "Track My Order",      icon: "package_2",          to: "/orderStatus" },
    { label: "Size Guide",          icon: "straighten",         to: null, info: "XS = 34–36 · S = 36–38 · M = 38–40 · L = 40–42 · XL = 42–44 · XXL = 44–46. When in doubt, size up — Verp cuts slightly fitted." },
    { label: "Returns Policy",      icon: "undo",               to: null, info: "You have 48 hours from delivery to request a return. Items must be unused and in original packaging. Go to My Orders to submit a return request." },
    { label: "Live Support",        icon: "support_agent",      to: "/support" },
  ],
  "The Brand": [
    { label: "Our Story",           icon: "auto_stories",       to: "/about" },
    { label: "Client Reviews",      icon: "star_half",          to: "/reviews" },
    { label: "Press & Media",       icon: "newspaper",          to: null, info: "Press enquiries: Verpembodiments@gmail.com — allow 48 hrs for a response." },
    { label: "Careers",             icon: "work",               to: null, info: "We hire rare — not often, but well. When we do, we look for people obsessed with craft over clout. Check back soon." },
    { label: "Verp Intelligence",   icon: "insights",           to: null, info: "We study how people actually move, sit, stretch, and live in clothes. Every Verp update is driven by real usage data — not trend forecasts." },
  ],
};

const trustBadges = [
  { icon: "verified",        label: "Premium Quality",      sub: "Certified Mills" },
  { icon: "local_shipping",  label: "Free Delivery",        sub: "Orders Over GH₵500" },
  { icon: "autorenew",       label: "48-Hour Returns",      sub: "Hassle-Free" },
  { icon: "lock",            label: "Secure Checkout",      sub: "256-bit Encrypted" },
];

const InfoModal = ({ message, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: "#0d0d0d", border: "1px solid rgba(236,91,19,0.22)",
        borderRadius: 20, padding: "36px 40px", maxWidth: 440, width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        animation: "modalIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec5b13" }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", color: "#ec5b13", textTransform: "uppercase", fontWeight: 700 }}>Verp Info</span>
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.9)" }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          marginTop: 24, padding: "10px 24px", background: "transparent",
          border: "1px solid rgba(236,91,19,0.3)", borderRadius: 999,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#ec5b13",
          cursor: "pointer", transition: "all 200ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#ec5b13"; e.currentTarget.style.color = "#000"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ec5b13"; }}
      >
        Got it
      </button>
    </div>
  </div>
);

const AccordionItem = ({ title, links, open, onToggle, onInfo }) => (
  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
    <button
      type="button"
      onClick={onToggle}
      style={{ width: "100%", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
    >
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: open ? "#ec5b13" : "rgba(255,255,255,0.85)", transition: "color 200ms" }}>{title}</span>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 300ms" }}>expand_more</span>
    </button>
    <div style={{ overflow: "hidden", maxHeight: open ? 500 : 0, opacity: open ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.3s ease" }}>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(link => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to}
                style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: 0.65 }}>{link.icon}</span>
                {link.label}
              </Link>
            ) : (
              <button
                onClick={() => onInfo(link.info)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: 0.65 }}>{link.icon}</span>
                {link.label}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(236,91,19,0.65)" }}>ⓘ</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const Footer = () => {
  const [openKey, setOpenKey] = useState(null);
  const [modalMsg, setModalMsg] = useState(null);

  return (
    <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <style>{`
        @keyframes footerFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .footer-col { animation: footerFadeIn 0.5s ease both; }

        .trust-strip {
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          border-top: 1px solid rgba(255,255,255,0.05);
          background: #080808;
        }
        .trust-badge {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 20px;
          gap: 10px;
          border-right: 1px solid rgba(255,255,255,0.05);
          transition: background 250ms;
          cursor: default;
        }
        .trust-badge:last-child { border-right: none; }
        .trust-badge:hover { background: rgba(236,91,19,0.04); }
        .trust-badge:hover .tb-icon-wrap { border-color: rgba(236,91,19,0.45); background: rgba(236,91,19,0.1); }
        .trust-badge:hover .tb-icon { color: #ec5b13 !important; }
        .tb-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 250ms;
        }
        .tb-icon {
          font-size: 26px !important;
          color: rgba(255,255,255,0.75) !important;
          transition: color 250ms;
        }

        .footer-link-row { display:flex; align-items:center; gap:10px; }
        .footer-link-row .f-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 200ms;
          flex-shrink: 0;
        }
        .footer-link-row:hover .f-icon {
          background: rgba(236,91,19,0.1);
          border-color: rgba(236,91,19,0.3);
        }

        .brand-col {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        @media(max-width:1023px){
          .footer-main-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:767px){
          .trust-strip { flex-wrap: wrap; }
          .trust-badge { flex: 1 1 50%; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .footer-main-grid { grid-template-columns: 1fr !important; }
          .footer-desktop-cols { display: none !important; }
          .mobile-accordion { display: block !important; }
        }
      `}</style>

      {modalMsg && <InfoModal message={modalMsg} onClose={() => setModalMsg(null)} />}

      {/* TRUST BADGE STRIP */}
      <div className="trust-strip">
        {trustBadges.map(({ icon, label, sub }) => (
          <div key={icon} className="trust-badge">
            <div className="tb-icon-wrap">
              <span className="material-symbols-outlined tb-icon">{icon}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em" }}>{label}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 3 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: "80px 48px 48px", maxWidth: 1400, margin: "0 auto" }}>

        {/* Desktop grid */}
        <div className="footer-main-grid footer-desktop-cols" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64, alignItems: "start" }}>

          {/* Brand col */}
          <div className="footer-col brand-col" style={{ animationDelay: "0s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <img src={logo} alt="Verp" style={{ height: 56, width: 56, objectFit: "contain", borderRadius: 10 }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: "white" }}>Verp</span>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 0, maxWidth: 270 }}>
              Premium streetwear built for those who set the standard. Not the trend — the standard. Every piece ships from Accra, made to last a decade.
            </p>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Got Something to Say?</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 14 }}>
                Orders, collabs, press, or just a thought — tap below and your message lands directly with the Verp team.
              </p>
              <a
                href="mailto:Verpembodiments@gmail.com"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 10,
                  background: "rgba(236,91,19,0.08)",
                  border: "1px solid rgba(236,91,19,0.2)",
                  fontFamily: "'DM Sans',sans-serif", fontSize: 13,
                  color: "#ec5b13", textDecoration: "none",
                  transition: "all 220ms",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(236,91,19,0.16)";
                  e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(236,91,19,0.08)";
                  e.currentTarget.style.borderColor = "rgba(236,91,19,0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>mail</span>
                <span>Verpembodiments@gmail.com</span>
                <span className="material-symbols-outlined" style={{ fontSize: 13, opacity: 0.6 }}>arrow_outward</span>
              </a>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10 }}>
                ↳ Opens your email app · We reply within 48 hrs
              </p>
            </div>
          </div>

          {/* 3 link columns */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <div key={title} className="footer-col" style={{ animationDelay: `${(idx + 1) * 0.07}s` }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>{title}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {links.map(link => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to}
                        className="footer-link-row"
                        style={{ textDecoration: "none", color: "rgba(255,255,255,0.7)", transition: "color 200ms" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                      >
                        <span className="f-icon">
                          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{link.icon}</span>
                        </span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>{link.label}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => setModalMsg(link.info)}
                        className="footer-link-row"
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,0.7)", transition: "color 200ms", textAlign: "left", width: "100%" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                      >
                        <span className="f-icon">
                          <span className="material-symbols-outlined" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{link.icon}</span>
                        </span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>{link.label}</span>
                        <span style={{ marginLeft: 2, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(236,91,19,0.6)" }}>ⓘ</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div style={{ marginBottom: 40, display: "none" }} className="mobile-accordion">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <img src={logo} alt="Verp" style={{ height: 44, width: 44, objectFit: "contain", borderRadius: 8 }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: "white" }}>Verp</span>
          </div>

          <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>Got Something to Say?</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 14 }}>
              Orders, collabs, press, or just a thought — tap below and your message lands directly with the Verp team.
            </p>
            <a
              href="mailto:Verpembodiments@gmail.com"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(236,91,19,0.08)",
                border: "1px solid rgba(236,91,19,0.2)",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ec5b13" }}>mail</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#ec5b13" }}>Verpembodiments@gmail.com</span>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(236,91,19,0.6)" }}>arrow_outward</span>
            </a>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10 }}>
              ↳ Opens your email app · We reply within 48 hrs
            </p>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <AccordionItem key={key} title={key} links={links} open={openKey === key}
              onToggle={() => setOpenKey(k => k === key ? null : key)}
              onInfo={(msg) => setModalMsg(msg)}
            />
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} Verp Collective. All Rights Reserved.
          </p>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {["Free Delivery Over GH₵500", "48-Hour Returns", "Proudly Accra-Built"].map(item => (
              <span key={item} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.2em", textTransform: "uppercase", fontStyle: "italic" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;