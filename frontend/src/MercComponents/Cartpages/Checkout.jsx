import React, { useState, useEffect } from "react";
import { useCart } from "../Cartoptions/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

/* ─── Sub-Components ─────────────────────────────────────────── */
const Field = ({ label, icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.3em", display: "flex", alignItems: "center", gap: 6 }}>
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}{label}
    </label>
    {children}
    {error && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "#f87171", letterSpacing: "0.15em" }}>{error}</p>}
  </div>
);

const inputSx = {
  width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14, padding: "14px 18px", fontFamily: "'DM Sans',sans-serif", fontSize: 14,
  color: "rgba(255,255,255,0.85)", outline: "none", transition: "border-color 250ms, box-shadow 250ms",
  boxSizing: "border-box",
};

const DeliveryCard = ({ value, selected, onSelect, icon, title, desc }) => (
  <button type="button" onClick={() => onSelect(value)} style={{ flex: 1, padding: "16px 14px", borderRadius: 16, textAlign: "left", cursor: "pointer", transition: "all 200ms", background: selected ? "rgba(236,91,19,0.07)" : "rgba(255,255,255,0.02)", border: selected ? "1px solid rgba(236,91,19,0.35)" : "1px solid rgba(255,255,255,0.07)", boxShadow: selected ? "0 0 24px -10px rgba(236,91,19,0.35)" : "none" }}>
    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: selected ? "#ec5b13" : "rgba(255,255,255,0.55)", marginBottom: 4 }}>{title}</p>
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>{desc}</p>
    {selected && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ec5b13", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10 }}><span style={{ fontFamily: "monospace", fontSize: 11, color: "#000", fontWeight: 900 }}>✓</span></div>}
  </button>
);

const SummaryItem = ({ item }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ position: "relative", flexShrink: 0 }}>
      <img src={item.image} alt={item.name} style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }} />
      <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ec5b13", color: "#000", fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.quantity}</span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>GH₵{Number(item.price).toLocaleString()} × {item.quantity}</p>
    </div>
    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontStyle: "italic", color: "#ec5b13", flexShrink: 0 }}>GH₵{(item.price * item.quantity).toLocaleString()}</p>
  </div>
);

/* ─── Main Checkout ─────────────────────────────────────────── */
const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: localStorage.getItem("userName") || "",
    deliveryName: "",
    email: localStorage.getItem("userEmail") || "",
    phone: "",
    location: "",
    address: "",
    deliveryMethod: "pickup",
  });

  // State to hold fee calculations + loading state
  const [feeData, setFeeData] = useState({ chargeGHS: cartTotal, feeGHS: 0, chargePesewas: Math.round(cartTotal * 100) });
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState(false);

  // Effect to sync fees from server when cart changes
  useEffect(() => {
    if (cartTotal <= 0) return;
    let cancelled = false;
    const fetchFees = async () => {
      setFeeLoading(true);
      setFeeError(false);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/paystack-charge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountGHS: cartTotal }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled && data.success) setFeeData(data);
        else if (!cancelled) setFeeError(true);
      } catch (err) {
        console.error("Fee calculation error:", err);
        if (!cancelled) setFeeError(true);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    };
    fetchFees();
    return () => { cancelled = true; };
  }, [cartTotal]);

  const set = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleDeliverySelect = (val) => {
    set("deliveryMethod", val);
    if (val === "door") {
      Swal.fire({
        title: "Door Delivery Selected",
        html: `
          <div style="text-align:left;font-family:'DM Sans',sans-serif;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <span style="font-size:28px;">🚚</span>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;font-weight:600;margin:0;">White-Glove Delivery Service</p>
            </div>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;line-height:1.7;margin-bottom:14px;">
              Delivery fees vary based on your location and will be confirmed by our team after your order is placed.
            </p>
            <div style="background:rgba(236,91,19,0.08);border:1px solid rgba(236,91,19,0.2);border-radius:12px;padding:14px 16px;">
              <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#ec5b13;margin-bottom:6px;font-weight:700;">WHAT HAPPENS NEXT</p>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.7;margin:0;">
                After payment, a member of our team will contact you directly to confirm your delivery address and provide the exact fee for your area.
              </p>
            </div>
          </div>
        `,
        background: "#0a0a0a",
        color: "#fff",
        confirmButtonColor: "#ec5b13",
        confirmButtonText: "UNDERSTOOD — PROCEED",
      });
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name required";
    if (!formData.deliveryName.trim()) e.deliveryName = "Delivery name required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (formData.phone.replace(/\D/g, "").length < 10) e.phone = "Must be 10 digits";
    if (!formData.location.trim()) e.location = "Location required — e.g. Accra";
    if (!formData.address.trim()) e.address = "Address required — e.g. Madina, Near Total Filling Station";
    if (cart.length === 0) e.cart = "Cart is empty";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    
    if (!window.PaystackPop) {
      Swal.fire({ 
        title: "System Error", 
        text: "Payment gateway not loaded. Please refresh.", 
        icon: "error", 
        background: "#0a0a0a", color: "#fff" 
      });
      return;
    }

    setLoading(true);

    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: formData.email,
        amount: feeData.chargePesewas, // Use calculated amount from server
        currency: "GHS",
        ref: `VRP-${Date.now()}`,
        metadata: {
          custom_fields: [
            { display_name: "Customer", variable_name: "customer_name", value: formData.name },
            { display_name: "Delivery Name", variable_name: "delivery_name", value: formData.deliveryName },
            { display_name: "Phone", variable_name: "customer_phone", value: formData.phone },
            { display_name: "Location", variable_name: "location", value: formData.location },
            { display_name: "Base Total", variable_name: "base_total", value: cartTotal },
            { display_name: "Paystack Fee", variable_name: "paystack_fee", value: feeData.feeGHS },
          ],
        },
        callback: async (response) => {
          setLoading(true);
          try {
            const { data: savedOrder, error: dbErr } = await supabase
              .from("verp_orders")
              .insert([{
                customer_name: formData.name,
                delivery_name: formData.deliveryName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                location: formData.location,
                address: formData.address,
                delivery_method: formData.deliveryMethod,
                payment_reference: response.reference,
                payment_status: "paid",
                items: cart, 
                total_amount: cartTotal, // Log what YOU receive
                status: "ordered",
              }])
              .select().single();

            if (dbErr) throw dbErr;
            await clearCart(); 
            
            fetch(`${import.meta.env.VITE_SERVER_URL}/api/alert-staff`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-internal-secret": import.meta.env.VITE_INTERNAL_SECRET },
              body: JSON.stringify({
                type: "NEW_ORDER",
                clientId: formData.email,
                orderNumber: savedOrder?.order_number || response.reference,
                orderValue: cartTotal,
                orderStatus: "ordered",
              }),
            }).catch(() => {});

            await Swal.fire({
              title: "ACQUISITION COMPLETE",
              html: `<p style="color:rgba(255,255,255,0.6); font-size:13px;">Ref: ${response.reference}<br/>Payment confirmed.</p>`,
              icon: "success",
              background: "#0a0a0a", color: "#fff", confirmButtonColor: "#ec5b13",
            });
            navigate("/orderpage");
          } catch (err) {
            Swal.fire({ title: "Order Logging Error", text: err.message, icon: "warning", background: "#0a0a0a", color: "#fff" });
          } finally {
            setLoading(false);
          }
        },
        onClose: () => setLoading(false),
      });

      handler.openIframe();
    } catch (err) {
      setLoading(false);
    }
  };

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        input:focus,textarea:focus{border-color:rgba(236,91,19,0.5)!important;box-shadow:0 0 0 3px rgba(236,91,19,0.08)!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .co-fade{animation:fadeUp 0.6s cubic-bezier(.22,1,.36,1) both}
        .co-fade-d{animation:fadeUp 0.6s 0.14s cubic-bezier(.22,1,.36,1) both}
        @keyframes spinRing{to{transform:rotate(360deg)}}
        .co-spin{animation:spinRing 0.8s linear infinite}
        @keyframes feeSkeleton{0%,100%{opacity:0.35}50%{opacity:0.7}}
        .fee-skeleton{display:inline-block;width:64px;height:13px;border-radius:6px;background:rgba(236,91,19,0.25);animation:feeSkeleton 1.1s ease-in-out infinite;vertical-align:middle}
        @keyframes feePop{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
        .fee-value{animation:feePop 0.35s cubic-bezier(.22,1,.36,1) both}
        .co-cta{background:linear-gradient(90deg,#ec5b13,#ff7a3d,#ec5b13);background-size:200% auto;transition:background-position 0.4s,box-shadow 0.3s,transform 0.2s}
        .co-cta:hover:not(:disabled){background-position:right center;box-shadow:0 8px 32px -8px rgba(236,91,19,0.5);transform:translateY(-1px)}
        .co-cta:disabled{opacity:0.5;cursor:not-allowed}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(236,91,19,0.3);border-radius:99px}
      `}</style>

      <div style={{ minHeight: "100vh", paddingTop: 96, paddingBottom: 64, background: "linear-gradient(180deg,#050505,#080808)", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          
          <div className="co-fade" style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "clamp(40px,7vw,80px)", color: "white", margin: 0, lineHeight: 1 }}>Checkout</h1>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginTop: 10 }}>SECURE VAULT ACQUISITION</p>
          </div>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <div className="co-fade" style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 22 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, overflow: "hidden" }}>
                  <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: "rgba(236,91,19,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ec5b13", fontWeight: 700 }}>01</div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>CLIENT INFORMATION</p>
                  </div>
                  <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Account name — read only display */}
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.3em" }}>ACCOUNT NAME</label>
                      <div style={{ width:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:14, padding:"14px 18px", fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.3)", boxSizing:"border-box", display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:14 }}>👤</span>
                        <span>{formData.name || "—"}</span>
                        <span style={{ marginLeft:"auto", fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.18)", letterSpacing:"0.15em" }}>NOT EDITABLE</span>
                      </div>
                    </div>

                    {/* Delivery name — required fresh entry */}
                    <Field label="Delivery Name" icon="📋" error={fieldErrors.deliveryName}>
                      <input
                        style={inputSx}
                        value={formData.deliveryName}
                        onChange={(e) => set("deliveryName", e.target.value)}
                        placeholder="Full name to use for delivery & calls"
                        autoComplete="off"
                      />
                      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.2)", letterSpacing:"0.12em", marginTop:6, lineHeight:1.6 }}>
                        YOUR ACCOUNT NAME IS NOT USED FOR ORDERS — ENTER THE NAME OUR TEAM SHOULD ASK FOR WHEN THEY CONTACT YOU.
                      </p>
                    </Field>
                    <Field label="Email" icon="✉" error={fieldErrors.email}>
                      <input style={inputSx} type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" />
                    </Field>
                    <Field label="Phone" icon="📱" error={fieldErrors.phone}>
                      <input style={inputSx} type="tel" value={formData.phone} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 10) set("phone", v); }} placeholder="0XX XXX XXXX" maxLength={10} />
                    </Field>
                    {/* ── Premium Location Notice (Glassmorphism) ── */}
                    <div style={{
                      background: "linear-gradient(135deg, rgba(236,91,19,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                      border: "1px solid rgba(236,91,19,0.25)",
                      borderRadius: 18,
                      padding: "18px 20px",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 4px 24px rgba(236,91,19,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      {/* shimmer line */}
                      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(236,91,19,0.4),transparent)" }} />
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(236,91,19,0.15)", border:"1px solid rgba(236,91,19,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                          <span style={{ fontSize:16 }}>📍</span>
                        </div>
                        <div>
                          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", color:"#ec5b13", marginBottom:6 }}>LOCATION ACCURACY IS CRITICAL</p>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:10 }}>
                            An incorrect location will directly affect your delivery. Please fill both fields carefully.
                          </p>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 10px" }}>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.35)", letterSpacing:"0.15em" }}>LOCATION — </span>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em" }}>City / Area (e.g. Accra)</span>
                            </div>
                            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 10px" }}>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.35)", letterSpacing:"0.15em" }}>ADDRESS — </span>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:7, color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em" }}>Specific place (e.g. Madina)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Field label="Location" icon="🌍" error={fieldErrors.location}>
                      <input style={inputSx} value={formData.location} onChange={(e) => set("location", e.target.value)} placeholder="Your city or area — e.g. Accra" />
                    </Field>
                    <Field label="Address" icon="🏠" error={fieldErrors.address}>
                      <input style={inputSx} value={formData.address} onChange={(e) => set("address", e.target.value)} placeholder="Specific area — e.g. Madina, Near Total Filling Station" />
                    </Field>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, overflow: "hidden" }}>
                  <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: "rgba(236,91,19,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ec5b13", fontWeight: 700 }}>02</div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>DELIVERY METHOD</p>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <DeliveryCard value="pickup" selected={formData.deliveryMethod === "pickup"} onSelect={handleDeliverySelect} icon="🏛️" title="Showroom Pickup" desc="Collect from our flagship showroom at no extra charge." />
                      <DeliveryCard value="door" selected={formData.deliveryMethod === "door"} onSelect={handleDeliverySelect} icon="🚚" title="Door Delivery" desc="White-glove delivery. Fees confirmed after checkout." />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading || feeLoading || cart.length === 0} className="co-cta"
                  style={{ width: "100%", padding: "17px 0", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  {loading ? (
                    <><div className="co-spin" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000" }} />PROCESSING…</>
                  ) : (
                    <><span>CONFIRM ACQUISITION</span><span style={{ opacity: 0.55 }}>{feeLoading ? "— calculating…" : `— GH₵${(feeData?.chargeGHS || 0).toLocaleString()}`}</span></>
                  )}
                </button>
              </form>
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div className="co-fade-d" style={{ flex: "1 1 300px", maxWidth: 380 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, overflow: "hidden", position: "sticky", top: 100 }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>ORDER SUMMARY</p>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#ec5b13" }}>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                </div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {cart.map((item) => <SummaryItem key={item.id} item={item} />)}
                </div>

                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 4 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Subtotal</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>GH₵{cartTotal.toLocaleString()}</span>
                  </div>
                  
                  {/* Service Fee — with loader */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.2em", display: "flex", alignItems: "center", gap: 6 }}>
                      Service Fee
                      {feeLoading && <span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(236,91,19,0.3)", borderTopColor: "#ec5b13", display: "inline-block", animation: "spinRing 0.8s linear infinite" }} />}
                    </span>
                    {feeLoading
                      ? <span className="fee-skeleton" />
                      : feeError
                        ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,100,100,0.6)", letterSpacing: "0.1em" }}>—</span>
                        : <span className="fee-value" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>+ GH₵{(feeData?.feeGHS || 0).toFixed(2)}</span>
                    }
                  </div>

                  {formData.deliveryMethod === "door" && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Delivery</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(236,91,19,0.6)", letterSpacing: "0.15em" }}>TBD</span>
                    </div>
                  )}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.2em" }}>Total</span>
                    {feeLoading
                      ? <span className="fee-skeleton" style={{ width: 90, height: 28 }} />
                      : <p className="fee-value" style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 28, color: "#ec5b13", margin: 0 }}>GH₵{(feeData?.chargeGHS || 0).toLocaleString()}</p>
                    }
                  </div>
                </div>

                <div style={{ margin: "0 16px 16px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{formData.deliveryMethod === "pickup" ? "🏛️" : "🚚"}</span>
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>{formData.deliveryMethod === "pickup" ? "Showroom Pickup" : "Door Delivery"}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em" }}>{formData.deliveryMethod === "pickup" ? "Ready for collection" : "Team will contact you"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;