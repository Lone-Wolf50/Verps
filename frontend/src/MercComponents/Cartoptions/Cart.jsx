import React from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-6xl text-white/10 mb-4">
          shopping_bag
        </span>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-2">
          Your Bag is Empty
        </h2>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.25em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 32 }}>
          Nothing here yet — go find something worth wearing.
        </p>
        <Link
          to="/categories"
          className="bg-[#ec5b13] text-black font-black px-10 py-4 rounded-full uppercase tracking-widest text-xs"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white pt-20 pb-28 px-6">
      <style>{`
        @keyframes cartRowIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cart-row { animation: cartRowIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* ── Header row: Back button (mobile) + Title ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>

          {/* Premium back button — visible on mobile & tablet, hidden on desktop where the navbar suffices */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.65)",
              cursor: "pointer",
              transition: "all 180ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(236,91,19,0.1)"; e.currentTarget.style.borderColor = "rgba(236,91,19,0.35)"; e.currentTarget.style.color = "#ec5b13"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          </button>

          <div>
            <h1
              className="text-4xl md:text-6xl font-[900] italic uppercase leading-none"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Shopping <span className="text-[#ec5b13]">Bag</span>
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
              {cart.reduce((t, i) => t + i.quantity, 0)} item{cart.reduce((t, i) => t + i.quantity, 0) !== 1 ? "s" : ""} · Verp Vault
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <div
                key={`${item.id}-${item.size || ""}-${item.color || ""}`}
                className="cart-row p-4 sm:p-6 rounded-3xl border border-white/5 bg-white/[0.03] flex gap-4 sm:gap-6 items-start sm:items-center"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                />
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-black uppercase tracking-tight text-base sm:text-xl leading-tight"
                      style={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      {item.name}
                    </h3>
                    {/* Remove — top right on mobile */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex-shrink-0 sm:hidden"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                        fontFamily: "'JetBrains Mono',monospace",
                        color: "rgba(255,255,255,0.2)", transition: "color 200ms",
                        padding: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Size / color tags */}
                  {(item.size || item.color) && (
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {item.size && (
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                          letterSpacing: "0.18em", textTransform: "uppercase",
                          color: "rgba(255,255,255,0.4)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 6, padding: "3px 7px",
                        }}>SIZE {item.size}</span>
                      )}
                      {item.color && (
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                          letterSpacing: "0.18em", textTransform: "uppercase",
                          color: "rgba(255,255,255,0.4)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 6, padding: "3px 7px",
                        }}>{item.color}</span>
                      )}
                    </div>
                  )}

                  <p style={{ color: "#ec5b13", fontWeight: 900, marginTop: 8, fontSize: 15 }}>
                    GH&#8373;{item.price.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    {/* Qty stepper */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 999, padding: "4px 4px",
                      background: "rgba(255,255,255,0.04)",
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{
                          width: 28, height: 28, borderRadius: "50%", border: "none",
                          background: "rgba(255,255,255,0.06)", cursor: "pointer",
                          color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(236,91,19,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      >−</button>
                      <span style={{
                        fontFamily: "'JetBrains Mono',monospace", fontSize: 13,
                        fontWeight: 900, width: 32, textAlign: "center",
                        color: "rgba(255,255,255,0.9)",
                      }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          width: 28, height: 28, borderRadius: "50%", border: "none",
                          background: "rgba(255,255,255,0.06)", cursor: "pointer",
                          color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(236,91,19,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      >+</button>
                    </div>

                    {/* Remove — inline on desktop */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="hidden sm:block"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                        fontFamily: "'JetBrains Mono',monospace",
                        color: "rgba(255,255,255,0.2)", transition: "color 200ms", padding: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div
              className="p-8 rounded-3xl sticky top-32"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ec5b13" }}>receipt_long</span>
                <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", color: "rgba(255,255,255,0.95)", margin: 0 }}>
                  Summary
                </h2>
              </div>

              {/* Line items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name} ×{item.quantity}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>
                      GH₵{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

              <div className="flex justify-between py-2">
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", color: "rgba(255,255,255,0.92)" }}>
                  Total
                </span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#ec5b13", fontFamily: "'DM Sans',sans-serif" }}>
                  GH&#8373;{cartTotal.toLocaleString()}
                </span>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate("/checkout")}
                style={{
                  width: "100%", marginTop: 24,
                  padding: "18px 0", borderRadius: 16, border: "none",
                  background: "#fff", color: "#000",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 900,
                  fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase",
                  cursor: "pointer", transition: "all 200ms",
                  boxShadow: "0 8px 32px rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ec5b13"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(236,91,19,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,255,255,0.08)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                Secure Checkout
              </button>

              {/* Trust note */}
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 14 }}>
                Encrypted · Secured · Verp Protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;