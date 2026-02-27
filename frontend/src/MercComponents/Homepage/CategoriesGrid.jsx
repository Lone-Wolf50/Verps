import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

import bagImg from "../../assets/bag.jpg";
import boxersImg from "../../assets/boxers.jpg";
import capImg from "../../assets/cap.jpg";
import hoodImg from "../../assets/hood.jpg";

const getCatImg = (cat) => {
  if (cat.image_url) return cat.image_url;
  const fallbacks = { Boxers: boxersImg, Caps: capImg, Hoodies: hoodImg, Bags: bagImg };
  return fallbacks[cat.name] || "https://via.placeholder.com/800";
};

// ─── Shared Card ──────────────────────────────────────────────────────────────
const Card = ({ cat, index, isHero = false }) => (
  <Link
    to={`/category/${cat.slug || cat.name.toLowerCase()}`}
    className="group relative overflow-hidden rounded-2xl bg-[#111] block h-full w-full"
    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
  >
    {/* Image */}
    <img
      src={getCatImg(cat)}
      alt={cat.name}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover opacity-55 transition-all duration-700 ease-out group-hover:opacity-75 group-hover:scale-105"
    />

    {/* Gradient */}
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }}
    />

    {/* Top accent line animates in on hover */}
    <div
      className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
      style={{ background: "#ec5b13" }}
    />

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <span
        className="block mb-1 font-mono font-black"
        style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#ec5b13", opacity: 0.7 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3
        className="font-black uppercase leading-none text-white transition-colors duration-300 group-hover:text-[#ec5b13]"
        style={{ letterSpacing: "-0.03em", fontSize: isHero ? "28px" : "20px" }}
      >
        {cat.name}
      </h3>
    </div>
  </Link>
);

// ─── Mobile Carousel ──────────────────────────────────────────────────────────
const MobileCarousel = ({ categories }) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const autoRef = useRef(null);
  const restartRef = useRef(null);

  const startAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setCurrent((p) => (p + 1) % categories.length), 4500);
  };

  const restartAuto = () => {
    clearInterval(autoRef.current);
    clearTimeout(restartRef.current);
    restartRef.current = setTimeout(startAuto, 2500);
  };

  useEffect(() => {
    startAuto();
    return () => { clearInterval(autoRef.current); clearTimeout(restartRef.current); };
  }, [categories.length]);

  const go = (dir) => {
    setCurrent((p) => dir === "next" ? (p + 1) % categories.length : (p - 1 + categories.length) % categories.length);
    restartAuto();
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="font-black uppercase mb-1" style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#ec5b13" }}>
            Featured Collection
          </p>
          <h3 className="text-white font-black uppercase leading-none" style={{ fontSize: "20px", letterSpacing: "-0.03em" }}>
            {categories[current]?.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {["prev", "next"].map((dir) => (
            <button
              key={dir}
              onClick={() => go(dir)}
              aria-label={dir}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 hover:border-[#ec5b13]"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                {dir === "prev" ? "chevron_left" : "chevron_right"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide track */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ height: "260px" }}
        onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) go(diff > 0 ? "next" : "prev");
        }}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)`, willChange: "transform" }}
        >
          {categories.map((cat, i) => (
            <div key={cat.id} className="min-w-full h-full">
              <Card cat={cat} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots + counter */}
      <div className="flex items-center gap-1.5 mt-3">
        {categories.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); restartAuto(); }}
            aria-label={`Slide ${i + 1}`}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === current ? "24px" : "4px",
              background: i === current ? "#ec5b13" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
        <span className="ml-auto font-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>
          {String(current + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

// ─── Mobile Grid — exactly 6 cards, 2 cols ────────────────────────────────────
const MobileGrid = ({ categories }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <span className="font-black uppercase" style={{ fontSize: "10px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)" }}>
        All Categories
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {categories.slice(0, 6).map((cat, i) => (
        <div key={cat.id} style={{ height: "140px" }}>
          <Card cat={cat} index={i} />
        </div>
      ))}
    </div>
  </div>
);

// ─── CTA Button ───────────────────────────────────────────────────────────────
const ViewAllBtn = ({ count }) => (
  <div className="flex justify-center mt-8">
    <Link
      to="/categories"
      className="group flex items-center gap-3 font-black uppercase transition-all duration-300 hover:border-[#ec5b13] hover:text-white"
      style={{
        padding: "14px 32px",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        color: "rgba(255,255,255,0.5)",
        fontSize: "11px",
        letterSpacing: "0.2em",
        textDecoration: "none",
      }}
    >
      <span>View All {count} Categories</span>
      <span
        className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1"
        style={{ fontSize: "16px", color: "#ec5b13" }}
      >
        arrow_forward
      </span>
    </Link>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const CategoriesGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("verp_categories")
        .select("*")
        .order("created_at", { ascending: true });
      setCategories(data || []);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "260px", background: "#0a0a0a" }}>
        <div className="text-center">
          <div
            className="mx-auto mb-3 animate-spin rounded-full"
            style={{ width: "28px", height: "28px", border: "2px solid #ec5b13", borderTopColor: "transparent" }}
          />
          <p className="font-black uppercase tracking-widest" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
            Loading
          </p>
        </div>
      </div>
    );
  }

  const f = categories.slice(0, 6);

  return (
    <section style={{ padding: "80px 20px", background: "#0a0a0a", overflowX: "hidden" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="font-black uppercase mb-2" style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#ec5b13" }}>
              Curated Selection
            </p>
            <h2
              className="font-black uppercase text-white leading-none"
              style={{ fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "-0.03em" }}
            >
              Popular Categories
            </h2>
          </div>
          <p className="uppercase leading-relaxed" style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", maxWidth: "200px" }}>
            Where utility meets opulence.
          </p>
        </div>

        {/* ══ MOBILE ══ */}
        <div className="md:hidden space-y-6">
          <MobileCarousel categories={categories} />
          <MobileGrid categories={categories} />
          <ViewAllBtn count={categories.length} />
        </div>

        {/* ══ TABLET — exactly matches preview: 3 cols, 2 rows, 400px tall ══ */}
        <div
          className="hidden md:grid lg:hidden"
          style={{
            gridTemplateColumns: "1.3fr 1fr 1fr",
            gridTemplateRows: "200px 200px",
            gap: "10px",
          }}
        >
          <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
            {f[0] && <Card cat={f[0]} index={0} isHero />}
          </div>
          <div style={{ gridColumn: "2 / 4", gridRow: "1" }}>
            {f[1] && <Card cat={f[1]} index={1} />}
          </div>
          <div style={{ gridColumn: "2", gridRow: "2" }}>
            {f[2] && <Card cat={f[2]} index={2} />}
          </div>
          <div style={{ gridColumn: "3", gridRow: "2" }}>
            {f[3] && <Card cat={f[3]} index={3} />}
          </div>
        </div>

        {/* ══ DESKTOP — exactly matches preview: 4 cols, 2 rows, 440px tall ══ */}
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gridTemplateRows: "220px 220px",
            gap: "12px",
          }}
        >
          <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
            {f[0] && <Card cat={f[0]} index={0} isHero />}
          </div>
          <div style={{ gridColumn: "2 / 4", gridRow: "1" }}>
            {f[1] && <Card cat={f[1]} index={1} />}
          </div>
          <div style={{ gridColumn: "4", gridRow: "1" }}>
            {f[2] && <Card cat={f[2]} index={2} />}
          </div>
          <div style={{ gridColumn: "2", gridRow: "2" }}>
            {f[3] && <Card cat={f[3]} index={3} />}
          </div>
          <div style={{ gridColumn: "3", gridRow: "2" }}>
            {f[4] && <Card cat={f[4]} index={4} />}
          </div>
          <div style={{ gridColumn: "4", gridRow: "2" }}>
            {f[5] && <Card cat={f[5]} index={5} />}
          </div>
        </div>

        {/* CTA — tablet & desktop only */}
        <div className="hidden md:block">
          <ViewAllBtn count={categories.length} />
        </div>

      </div>
    </section>
  );
};

export default CategoriesGrid;