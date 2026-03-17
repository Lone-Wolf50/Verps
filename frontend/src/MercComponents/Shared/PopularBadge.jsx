/**
 * PopularBadge.jsx
 *
 * Small badge that sits on a product card image when the product
 * qualifies as popular (5+ orders, 4★+ avg rating).
 *
 * Usage — drop inside any product card image wrapper:
 *   import PopularBadge from "./PopularBadge";
 *   import usePopularProducts from "./usePopularProducts";
 *
 *   const popularIds = usePopularProducts();
 *   ...
 *   {popularIds.has(product.id) && <PopularBadge />}
 */

import React from "react";

const PopularBadge = () => (
  <div
    style={{
      position:    "absolute",
      top:         8,
      right:       8,
      display:     "flex",
      alignItems:  "center",
      gap:         4,
      padding:     "4px 9px",
      borderRadius: 6,
      background:  "linear-gradient(135deg,#ec5b13,#d94e0f)",
      boxShadow:   "0 2px 12px rgba(236,91,19,0.45)",
      zIndex:      2,
    }}
  >
    {/* flame icon via text — no emoji so it works everywhere */}
    <span style={{ fontSize: 10, lineHeight: 1 }}>🔥</span>
    <span
      style={{
        fontFamily:    "'JetBrains Mono',monospace",
        fontSize:       7,
        fontWeight:     700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color:          "#000",
      }}
    >
      Popular
    </span>
  </div>
);

export default PopularBadge;