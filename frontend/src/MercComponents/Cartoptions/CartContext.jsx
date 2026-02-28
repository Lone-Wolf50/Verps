/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      // Only restore from localStorage if there's an active session
      const email = localStorage.getItem("userEmail");
      if (!email) return [];
      const saved = localStorage.getItem("luxury_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [synced, setSynced] = useState(false);

  // ── On mount: pull cart from DB (cross-device restore) ───────
  const syncFromDB = useCallback(async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      // No user — ensure cart is empty (guards against stale localStorage)
      setCart([]);
      localStorage.removeItem("luxury_cart");
      setSynced(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("verp_cart_items")
        .select("*")
        .eq("user_email", email);


      // Recover any items saved as guest_cart before logout/before login
      let guestItems = [];
      try {
        const raw = localStorage.getItem("guest_cart");
        if (raw) {
          guestItems = JSON.parse(raw);
          localStorage.removeItem("guest_cart");
        } else {
        }
      } catch (_) {}

      let baseCart = [];
      if (data && data.length > 0) {
        baseCart = data.map((row) => ({
          id: row.product_id,
          name: row.product_name,
          price: Number(row.price),
          quantity: row.quantity,
          image: row.image || "",
          size: row.size || null,
          color: row.color || null,
        }));
      }

      // Merge guest items into the DB cart (guest items take lower precedence — just add qty if already in DB cart)
      const merged = [...baseCart];
      for (const gi of guestItems) {
        const existing = merged.find((x) => x.id === gi.id);
        if (existing) {
          existing.quantity += gi.quantity;
        } else {
          merged.push(gi);
        }
      }


      if (merged.length > 0) {
        setCart(merged);
        localStorage.setItem("luxury_cart", JSON.stringify(merged));
      } else {
      }
    } catch (err) {
    }
    setSynced(true);
  }, []);

  useEffect(() => { syncFromDB(); }, [syncFromDB]);

  // ── Sync to DB whenever cart changes (after initial load) ────
  useEffect(() => {
    if (!synced) return; // don't overwrite DB before we've loaded from it
    localStorage.setItem("luxury_cart", JSON.stringify(cart));
    const email = localStorage.getItem("userEmail");
    if (!email) {
      return;
    }
    const push = async () => {
      try {
        await supabase.from("verp_cart_items").delete().eq("user_email", email);
        if (cart.length > 0) {
          await supabase.from("verp_cart_items").insert(
            cart.map((item) => ({
              user_email: email,
              product_id: String(item.id),
              product_name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || null,
              size: item.size || null,
              color: item.color || null,
            })),
          );
        } else {
        }
      } catch (err) { /* non-critical */ }
    };
    push();
  }, [cart, synced]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id, amount) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item,
      ),
    );
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("luxury_cart");
    const email = localStorage.getItem("userEmail");
    if (email) {
      try { await supabase.from("verp_cart_items").delete().eq("user_email", email); } catch (_) {}
    }
  };

  // ── resetCart: wipes local state + localStorage only (no DB call)
  // Use this on logout so the next account starts with an empty cart.
  const resetCart = () => {
    setCart([]);
    setSynced(false);
    localStorage.removeItem("luxury_cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart, resetCart, syncFromDB }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};