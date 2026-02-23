import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const reviews = [
  {
    name: "Kofi A.",
    role: "Verified Purchase",
    product: "Signature Hoodie",
    text: "I've bought pieces from a dozen brands over the years. The hoodie from Verp is the only one I've worn three times in the same week without washing. The weight of it — there's nothing else like it at this price point.",
    rating: 5,
    date: "Jan 2026",
  },
  {
    name: "Elena R.",
    role: "Verified Purchase",
    product: "Verp Cap",
    text: "The embroidery on the cap is cleaner than anything I've seen from stores twice the price. Fits perfectly. Ships fast. I've already ordered two more in different colourways.",
    rating: 5,
    date: "Dec 2025",
  },
  {
    name: "Marcus T.",
    role: "Verified Purchase",
    product: "Carbon Sweatshirt",
    text: "Didn't expect much from an online-only brand but Verp genuinely surprised me. The sweatshirt arrived better than described. Customer support was also helpful when I had a sizing question.",
    rating: 5,
    date: "Feb 2026",
  },
  {
    name: "Ama O.",
    role: "Verified Purchase",
    product: "Verp Slides",
    text: "Finally a brand that doesn't overlook the accessories. The slides are premium — solid base, thick strap, doesn't creak. Wore them on a beach trip and got compliments all weekend.",
    rating: 5,
    date: "Jan 2026",
  },
  {
    name: "Daniel K.",
    role: "Verified Purchase",
    product: "Verp Boxers",
    text: "The boxers are the quiet obsession of the collection. You don't talk about them but once you try them you won't buy from anywhere else. Comfortable, structured, premium.",
    rating: 5,
    date: "Feb 2026",
  },
  {
    name: "Serena M.",
    role: "Verified Purchase",
    product: "Verp Bag",
    text: "Ordered the bag as a gift. The recipient loved it before even opening — the packaging alone felt considered. The bag itself is beautiful. Verp understands that details are everything.",
    rating: 5,
    date: "Dec 2025",
  },
];

const StarRow = ({ rating, size = 13 }) => (
  <div style={{display:"flex",gap:3}}>
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className="material-symbols-outlined"
        style={{fontSize:size, color: i < rating ? "#ec5b13" : "rgba(255,255,255,0.1)"}}
      >
        star
      </span>
    ))}
  </div>
);

const Reviews = () => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleWriteReview = async () => {
    const { value: formValues } = await Swal.fire({
      title: `<span style="font-family:'Playfair Display',serif;font-style:italic;font-size:22px;color:#fff;">Leave a Verdict</span>`,
      html: `
        <div style="text-align:left;margin-top:4px;">
          <p style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:20px;">VERIFIED PURCHASES ONLY</p>
          <label style="font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);display:block;margin-bottom:6px;">Your Review</label>
          <textarea id="swal-review-text" placeholder="Tell us about your experience..." rows="4"
            style="width:100%;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 14px;font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.8);resize:none;box-sizing:border-box;outline:none;"></textarea>
        </div>
      `,
      background: "#0d0d0d",
      color: "#fff",
      confirmButtonColor: "#ec5b13",
      confirmButtonText: `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;">SUBMIT</span>`,
      showCancelButton: true,
      cancelButtonText: "Cancel",
      customClass: { popup: "review-swal-popup" },
      preConfirm: () => {
        const text = document.getElementById("swal-review-text")?.value;
        if (!text || text.trim().length < 10) {
          Swal.showValidationMessage("Please write at least a sentence.");
          return false;
        }
        return text;
      },
    });

    if (formValues) {
      await Swal.fire({
        title: `<span style="font-family:'Playfair Display',serif;font-style:italic;color:#fff;">Verdict Received</span>`,
        html: `<p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;">Thank you. Your review is under verification and will appear on the page shortly.</p>`,
        background: "#0d0d0d",
        color: "#fff",
        icon: "success",
        iconColor: "#ec5b13",
        confirmButtonColor: "#ec5b13",
        confirmButtonText: `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;">DONE</span>`,
        customClass: { popup: "review-swal-popup" },
      });
    }
  };

  return (
    <div style={{background:"#0a0a0a",color:"white",minHeight:"100vh"}}>
      <style>{`
       @keyframes rvFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .rv-fade { animation: rvFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .review-swal-popup { border:1px solid rgba(255,255,255,0.08) !important; border-radius:24px !important; }
      `}</style>

      <main style={{maxWidth:1100, margin:"0 auto", padding:"0 24px 100px"}}>

        {/* ── Header ── */}
        <div style={{paddingTop:140, paddingBottom:72}}>
          <button
            onClick={() => navigate(-1)}
            className="rv-fade"
            style={{
              display:"flex",alignItems:"center",gap:10,
              background:"transparent",border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:999,padding:"8px 18px 8px 14px",
              cursor:"pointer",color:"rgba(255,255,255,0.4)",
              marginBottom:52,
              fontFamily:"'JetBrains Mono',monospace",fontSize:8,
              letterSpacing:"0.25em",textTransform:"uppercase",
              transition:"all 200ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(236,91,19,0.5)"; e.currentTarget.style.color="#ec5b13"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
          >
            <span className="material-symbols-outlined" style={{fontSize:16}}>arrow_back</span>
            Back
          </button>

          <div className="rv-fade" style={{animationDelay:"0.05s",display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:28,height:1,background:"#ec5b13"}} />
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.4em",color:"#ec5b13",textTransform:"uppercase",fontWeight:700}}>
              Verified Clients
            </span>
          </div>

          <h1
            className="rv-fade"
            style={{
              animationDelay:"0.08s",
              fontFamily:"'DM Sans',sans-serif",
              fontSize:"clamp(40px,7vw,88px)",
              fontWeight:900,
              letterSpacing:"-0.04em",
              lineHeight:0.92,
              textTransform:"uppercase",
              marginBottom:0,
            }}
          >
            Client{" "}
            <span style={{
              fontFamily:"'Playfair Display',serif",
              fontStyle:"italic",
              fontWeight:400,
              color:"#ec5b13",
            }}>
              Verdicts
            </span>
          </h1>
        </div>

        {/* ── Reviews masonry grid ── */}
        <div
          className="rv-fade"
          style={{
            columns:"1",
            columnGap:20,
            marginBottom:72,
            animationDelay:"0.15s"
          }}
        >
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",
            gap:20,
          }}>
            {reviews.map((rev, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  padding:"32px 28px",
                  background: hoveredIdx === i ? "rgba(236,91,19,0.03)" : "rgba(255,255,255,0.02)",
                  border: hoveredIdx === i ? "1px solid rgba(236,91,19,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  borderRadius:24,
                  transition:"all 0.3s ease",
                  animation:`rvFadeUp 0.6s ${i*0.06}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
              >
                {/* Stars + product */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                  <StarRow rating={rev.rating} />
                  <span style={{
                    fontFamily:"'JetBrains Mono',monospace",
                    fontSize:7,
                    letterSpacing:"0.2em",
                    textTransform:"uppercase",
                    color:"rgba(255,255,255,0.2)",
                  }}>
                    {rev.product}
                  </span>
                </div>

                {/* Review text */}
                <p style={{
                  fontFamily:"'DM Sans',sans-serif",
                  fontSize:14,
                  fontWeight:400,
                  lineHeight:1.75,
                  fontStyle:"italic",
                  color:"rgba(255,255,255,0.7)",
                  marginBottom:28,
                }}>
                  "{rev.text}"
                </p>

                {/* Author */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{
                      width:36,height:36,borderRadius:"50%",
                      background:"linear-gradient(135deg,rgba(236,91,19,0.3),rgba(236,91,19,0.1))",
                      border:"1px solid rgba(236,91,19,0.2)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:"'Playfair Display',serif",
                      fontSize:15,
                      fontStyle:"italic",
                      color:"#ec5b13",
                    }}>
                      {rev.name[0]}
                    </div>
                    <div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.02em"}}>
                        {rev.name}
                      </p>
                      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(236,91,19,0.7)",marginTop:2}}>
                        {rev.role}
                      </p>
                    </div>
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.15)",letterSpacing:"0.15em"}}>
                    {rev.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div
          className="rv-fade"
          style={{
            animationDelay:"0.4s",
            padding:"60px 40px",
            background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:28,
            textAlign:"center",
          }}
        >
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.35em",textTransform:"uppercase",color:"#ec5b13",fontWeight:700,marginBottom:16}}>
            VERIFIED PURCHASES ONLY
          </p>
          <h3 style={{
            fontFamily:"'DM Sans',sans-serif",
            fontSize:28,fontWeight:900,letterSpacing:"-0.02em",textTransform:"uppercase",marginBottom:12,
          }}>
            Share Your Experience
          </h3>
          <p style={{
            fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.35)",
            lineHeight:1.7,marginBottom:32,maxWidth:380,margin:"0 auto 32px",
          }}>
            Only verified owners can leave a verdict — to protect the integrity of the circle.
          </p>
          <button
            onClick={handleWriteReview}
            style={{
              padding:"14px 36px",
              background:"#ec5b13",
              border:"none",borderRadius:999,
              fontFamily:"'DM Sans',sans-serif",
              fontSize:10,fontWeight:900,letterSpacing:"0.2em",textTransform:"uppercase",
              color:"#000",cursor:"pointer",
              transition:"all 200ms",
              boxShadow:"0 6px 24px rgba(236,91,19,0.3)",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 10px 36px rgba(236,91,19,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 6px 24px rgba(236,91,19,0.3)"}
          >
            Write a Verdict
          </button>
        </div>

      </main>
    </div>
  );
};

export default Reviews;
