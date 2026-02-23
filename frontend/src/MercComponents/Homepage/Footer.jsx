import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/V - 1.png";

const footerLinks = {
  Explore: [
    { label: "All Categories", to: "/categories" },
    { label: "New Arrivals", to: "/categories" },
    { label: "Boxers", to: "/category/boxers" },
    { label: "Shoes", to: "/category/shoes" },
    { label: "Hoodies", to: "/category/hoodie" },
    { label: "Caps", to: "/category/caps" },
  ],
  Company: [
    { label: "About Verp", to: "/about" },
    { label: "Client Reviews", to: "/reviews" },
    { label: "Press", to: null, info: "Press enquiries: Verpembodiments@gmail.com" },
    { label: "Careers", to: null, info: "We are not hiring at this time. Check back soon." },
  ],
  Support: [
    { label: "Live Support", to: "/support" },
    { label: "My Orders", to: "/orderpage" },
    { label: "Size Guide", to: null, info: "XS = 34-36 · S = 36-38 · M = 38-40 · L = 40-42 · XL = 42-44 · XXL = 44-46" },
    { label: "Returns Policy", to: null, info: "You have 48 hours from delivery to request a return. Items must be unused and in original packaging. Go to My Orders to submit a return request." },
    { label: "Contact Us", to: "/support" },
  ],
};

const InfoModal = ({ message, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: "#0d0d0d", border: "1px solid rgba(236,91,19,0.22)",
        borderRadius: 20, padding: "36px 40px", maxWidth: 440, width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        animation: "modalIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec5b13" }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", color: "#ec5b13", textTransform: "uppercase", fontWeight: 700 }}>Verp Info</span>
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.65)" }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          marginTop: 24, padding: "10px 24px", background: "transparent",
          border: "1px solid rgba(236,91,19,0.3)", borderRadius: 999,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
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
  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <button
      type="button"
      onClick={onToggle}
      style={{ width: "100%", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
    >
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: open ? "#ec5b13" : "rgba(255,255,255,0.5)", transition: "color 200ms" }}>{title}</span>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.25)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 300ms" }}>expand_more</span>
    </button>
    <div style={{ overflow: "hidden", maxHeight: open ? 400 : 0, opacity: open ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.3s ease" }}>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(link => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 200ms" }}
                onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >{link.label}</Link>
            ) : (
              <button
                onClick={() => onInfo(link.info)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 200ms", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.color = "#ec5b13"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >{link.label}</button>
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
    <footer style={{ background: "#050505", padding: "96px 48px 48px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <style>{`
        @keyframes footerFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .footer-col { animation: footerFadeIn 0.5s ease both; }
        @media(max-width:767px){ .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {modalMsg && <InfoModal message={modalMsg} onClose={() => setModalMsg(null)} />}

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 48, marginBottom: 72 }}>

          {/* Brand */}
          <div className="footer-col" style={{ animationDelay: "0s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <img src={logo} alt="Verp" style={{ height: 36, objectFit: "contain", filter: "invert(1) brightness(2)" }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: "white" }}>Verp</span>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.75, marginBottom: 28, maxWidth: 260 }}>
              Premium streetwear born from ambition. Every piece is crafted with intention — for those who know quality when they feel it. Proudly Ghanaian.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[{icon:"public",label:"Web"},{icon:"camera_alt",label:"Instagram"},{icon:"share",label:"Share"}].map(({icon,label}) => (
                <a key={icon} href="#" title={label} style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.4)", textDecoration:"none", transition:"all 200ms" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(236,91,19,0.12)"; e.currentTarget.style.borderColor="rgba(236,91,19,0.4)"; e.currentTarget.style.color="#ec5b13"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
                >
                  <span className="material-symbols-outlined" style={{fontSize:18}}>{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Desktop link columns */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <div key={title} className="footer-col" style={{ animationDelay:`${(idx+1)*0.07}s` }}>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:22 }}>{title}</p>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:12 }}>
                {links.map(link => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 200ms" }}
                        onMouseEnter={e => e.currentTarget.style.color="#ec5b13"}
                        onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.35)"}
                      >{link.label}</Link>
                    ) : (
                      <button
                        onClick={() => setModalMsg(link.info)}
                        style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.35)", transition:"color 200ms", textAlign:"left" }}
                        onMouseEnter={e => e.currentTarget.style.color="#ec5b13"}
                        onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.35)"}
                      >
                        {link.label}
                        <span style={{ marginLeft:4, fontFamily:"'JetBrains Mono',monospace", fontSize:6, color:"rgba(236,91,19,0.5)", verticalAlign:"middle" }}>ⓘ</span>
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
          {Object.entries(footerLinks).map(([key, links]) => (
            <AccordionItem key={key} title={key} links={links} open={openKey === key}
              onToggle={() => setOpenKey(k => k === key ? null : key)}
              onInfo={(msg) => setModalMsg(msg)}
            />
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.15)", letterSpacing:"0.25em", textTransform:"uppercase" }}>
            © {new Date().getFullYear()} Verp Collective. All Rights Reserved.
          </p>
          <div style={{ display:"flex", gap:32, flexWrap:"wrap" }}>
            {["Free Delivery on Orders Over GH₵500","48-Hour Returns Policy","Proudly Made in Ghana"].map(item => (
              <span key={item} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.12)", letterSpacing:"0.2em", textTransform:"uppercase", fontStyle:"italic" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:767px){.mobile-accordion{display:block!important}.footer-grid .footer-col:not(:first-child){display:none!important}}`}</style>
    </footer>
  );
};

export default Footer;
