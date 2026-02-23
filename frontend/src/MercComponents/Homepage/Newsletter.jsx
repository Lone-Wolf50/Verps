import React, { useState } from "react";
import Swal from "sweetalert2";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    // Simulate a brief network delay for authenticity
    await new Promise((res) => setTimeout(res, 800));

    setEmail("");
    setSubmitting(false);

    await Swal.fire({
      title: `<span style="font-family:'Playfair Display',serif;font-style:italic;font-size:22px;color:#fff;">You're In.</span>`,
      html: `
        <div style="text-align:center;padding:4px 0 12px;">
          <p style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:16px;">VERP ACCESS GRANTED</p>
          <p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.7;">
            You'll be the first to hear about limited drops, private looks, and exclusive offers — delivered directly to your inbox.
          </p>
        </div>
      `,
      background: "#0d0d0d",
      color: "#fff",
      confirmButtonColor: "#ec5b13",
      confirmButtonText: `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;">CONTINUE</span>`,
      customClass: {
        popup: "newsletter-swal-popup",
        confirmButton: "newsletter-swal-btn",
      },
      showClass: {
        popup: "animate__animated animate__fadeIn",
      },
    });
  };

  return (
    <section style={{
      padding: "100px 24px",
      background: "#080808",
      borderTop: "1px solid rgba(255,255,255,0.04)",
    }}>
      <style>{`
        .newsletter-swal-popup {
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 24px !important;
        }
        .newsletter-swal-btn {
          border-radius: 999px !important;
          padding: 12px 32px !important;
        }
        @keyframes nlFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nl-input::placeholder { color: rgba(255,255,255,0.2); }
        .nl-input:focus { outline: none; border-color: rgba(236,91,19,0.5) !important; box-shadow: 0 0 0 3px rgba(236,91,19,0.08); }
      `}</style>

      <div style={{
        maxWidth: 560,
        margin: "0 auto",
        textAlign: "center",
        animation: "nlFadeUp 0.6s ease both",
      }}>
        {/* Label */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:20}}>
          <div style={{width:20,height:1,background:"#ec5b13"}} />
          <span style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:8,
            letterSpacing:"0.4em",
            color:"#ec5b13",
            textTransform:"uppercase",
            fontWeight:700,
          }}>Inner Circle</span>
          <div style={{width:20,height:1,background:"#ec5b13"}} />
        </div>

        <h2 style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize:"clamp(28px,4vw,48px)",
          fontWeight:900,
          letterSpacing:"-0.03em",
          textTransform:"uppercase",
          color:"white",
          lineHeight:1,
          marginBottom:16,
        }}>
          Join the{" "}
          <span style={{
            fontFamily:"'Playfair Display',serif",
            fontStyle:"italic",
            fontWeight:400,
            color:"#ec5b13",
          }}>
            Circle
          </span>
        </h2>

        <p style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize:13,
          color:"rgba(255,255,255,0.35)",
          letterSpacing:"0.05em",
          lineHeight:1.7,
          marginBottom:40,
          maxWidth:380,
          margin:"0 auto 40px",
        }}>
          First access to limited drops, campaign previews, and vault-only offers.
          No noise — only signal.
        </p>

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
          <div style={{
            display:"flex",
            width:"100%",
            maxWidth:440,
            gap:10,
            flexWrap:"wrap",
          }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="nl-input"
              style={{
                flex:1,
                minWidth:200,
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:999,
                padding:"14px 22px",
                fontFamily:"'DM Sans',sans-serif",
                fontSize:13,
                color:"white",
                transition:"border-color 200ms, box-shadow 200ms",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding:"14px 28px",
                background: submitting ? "rgba(236,91,19,0.6)" : "#ec5b13",
                border:"none",
                borderRadius:999,
                fontFamily:"'DM Sans',sans-serif",
                fontSize:10,
                fontWeight:900,
                letterSpacing:"0.2em",
                textTransform:"uppercase",
                color:"#000",
                cursor: submitting ? "not-allowed" : "pointer",
                transition:"all 200ms",
                whiteSpace:"nowrap",
                boxShadow: submitting ? "none" : "0 6px 24px rgba(236,91,19,0.3)",
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.boxShadow="0 8px 32px rgba(236,91,19,0.5)"; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.boxShadow="0 6px 24px rgba(236,91,19,0.3)"; }}
            >
              {submitting ? "Sending..." : "Subscribe"}
            </button>
          </div>
        </form>

        <p style={{
          marginTop:20,
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:7,
          color:"rgba(255,255,255,0.15)",
          letterSpacing:"0.3em",
          textTransform:"uppercase",
        }}>
          Privacy respected. Always.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
