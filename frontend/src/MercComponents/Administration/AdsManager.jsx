/**
 * AdsManager.jsx — complete rebuild
 *
 * Changes from v1:
 *   - cta_url replaced with a dropdown of known category pages (no typing)
 *   - image: file upload (phone/PC) OR paste URL — both supported
 *   - every field has a plain-English tooltip/hint
 *   - image upload goes to verp-products Supabase storage bucket
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

/* ── storage helpers ──────────────────────────────────────────
   Upload to verp-products bucket (already exists in your project).
   Only delete from storage if the URL is from our bucket.
   External URLs (pasted by admin) are never touched.
─────────────────────────────────────────────────────────────── */
const ADS_BUCKET = "verp-products";

/** Returns the storage filename if the URL is from our bucket, else null */
const getAdStorageFile = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    const marker = `/object/public/${ADS_BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch { return null; }
};

/** Delete a file from storage — non-fatal */
const deleteAdStorageFile = async (url) => {
  const file = getAdStorageFile(url);
  if (!file) return;
  try { await supabase.storage.from(ADS_BUCKET).remove([file]); }
  catch (_) { /* non-fatal */ }
};

/* ── tokens ───────────────────────────────────────────────────── */
const T = {
  void:    "var(--bg-dark)",
  obsidian:"var(--bg-panel)",
  ember:   "#ec5b13",
  green:   "#22c55e",
  red:     "#ef4444",
  amber:   "#f59e0b",
  blue:    "#38bdf8",
  border:  "1px solid var(--overlay-4)",
};

const SWAL_CFG = {
  background: "var(--bg-main)", color: "var(--text-primary)",
  confirmButtonColor: "#ec5b13", cancelButtonColor: "#1a1a1a",
  customClass: {
    popup: "rounded-3xl border border-[color:var(--border-medium)]",
    confirmButton: "rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
    cancelButton:  "rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
  },
};

/* ── dropdown options ─────────────────────────────────────────── */
const POSITIONS = [
  { id: "after_categories",  label: "Slot A — Between Categories and Bestsellers" },
  { id: "after_bestsellers", label: "Slot B — Between Bestsellers and Brand Story"  },
  { id: "after_narrative",   label: "Slot C — Between Brand Story and Newsletter"   },
];

/* Category destinations — admin picks from here, no URL typing */
const DESTINATIONS = [
  { label: "All Categories page",  value: "/categories"          },
  { label: "Boxers",               value: "/category/boxers"      },
  { label: "Shoes",                value: "/category/shoes"       },
  { label: "Slides",               value: "/category/slides"      },
  { label: "Shirts",               value: "/category/shirts"      },
  { label: "Caps",                 value: "/category/caps"        },
  { label: "Jewelry",              value: "/category/jewelry"     },
  { label: "Jackets",              value: "/category/jackets"     },
  { label: "Glasses",              value: "/category/glasses"     },
  { label: "Belts",                value: "/category/Belts"       },
  { label: "Watches",              value: "/category/watches"     },
  { label: "Sneakers",             value: "/category/sneakers"    },
  { label: "Socks",                value: "/category/socks"       },
  { label: "Hoodies",              value: "/category/hoodies"     },
  { label: "Sweatshirts",          value: "/category/sweatshirts" },
  { label: "Bags",                 value: "/category/bags"        },
];

const EMPTY_FORM = {
  title:                "",
  subtitle:             "",
  cta_label:            "Shop Now",
  cta_url:              "/categories",
  image_url:            "",
  position:             "after_bestsellers",
  priority:             1,
  starts_at:            "",
  ends_at:              "",
  is_active:            true,
  featured_product_id:  null,  // product shown in modal when CTA is clicked
};

/* ── Product search picker ────────────────────────────────────── */
const ProductPicker = ({ value, onChange }) => {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);

  /* fetch selected product name on mount if value already set */
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    supabase.from("verp_products").select("id,name,image_url,price")
      .eq("id", value).maybeSingle()
      .then(({ data }) => { if (data) setSelected(data); });
  }, [value]);

  const search = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("verp_products")
      .select("id, name, image_url, price, category")
      .ilike("name", `%${q}%`)
      .limit(6);
    setResults(data || []);
    setSearching(false);
  };

  const pick = (product) => {
    setSelected(product);
    setResults([]);
    setQuery("");
    onChange(product.id);
  };

  const clear = () => {
    setSelected(null);
    onChange(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {selected ? (
        /* selected state */
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px",
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 10,
        }}>
          {selected.image_url && (
            <img src={selected.image_url} alt="" style={{
              width: 44, height: 44, objectFit: "cover",
              borderRadius: 6, flexShrink: 0,
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected.name}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
              GH₵ {Number(selected.price).toLocaleString()} · {selected.category}
            </p>
          </div>
          <button onClick={clear} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 2,
            flexShrink: 0,
          }}>✕</button>
        </div>
      ) : (
        /* search state */
        <div style={{ position: "relative" }}>
          <input
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search product by name..."
            style={inputStyle}
            onFocus={focus} onBlur={blur}
          />
          {searching && (
            <span style={{
              position: "absolute", right: 12, top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 8, color: "rgba(255,255,255,0.3)",
            }}>
              searching...
            </span>
          )}
          {results.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-medium)",
              borderRadius: 10, zIndex: 50,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}>
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pick(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 14px",
                    background: "transparent", border: "none",
                    cursor: "pointer", textAlign: "left",
                    borderBottom: "1px solid var(--overlay-3)",
                    transition: "background 120ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--overlay-3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {p.image_url && (
                    <img src={p.image_url} alt="" style={{
                      width: 36, height: 36, objectFit: "cover",
                      borderRadius: 5, flexShrink: 0,
                    }} />
                  )}
                  <div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{p.name}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                      GH₵ {Number(p.price).toLocaleString()} · {p.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── helpers ──────────────────────────────────────────────────── */
const inputStyle = {
  background: "var(--overlay-2)",
  border: "1px solid var(--border-medium)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "rgba(255,255,255,0.8)",
  fontSize: 13,
  fontFamily: "'DM Sans',sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 180ms",
};

const focus = (e) => (e.currentTarget.style.borderColor = "rgba(236,91,19,0.4)");
const blur  = (e) => (e.currentTarget.style.borderColor = "var(--border-medium)");

/* ── Field wrapper with label + hint ─────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
      <label style={{
        fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.45)",
      }}>
        {label}
      </label>
      {hint && (
        <span style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: 10,
          color: "rgba(255,255,255,0.22)", fontStyle: "italic",
          textAlign: "right", flex: 1,
        }}>
          {hint}
        </span>
      )}
    </div>
    {children}
  </div>
);

/* ── Image uploader — file OR URL ─────────────────────────────── */
const ImagePicker = ({ value, onChange }) => {
  const fileRef     = useRef(null);
  const [mode, setMode]           = useState("url");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(value || "");
  /* track the previously uploaded URL so we can delete it if replaced */
  const prevUploadedRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    /* if the current preview is from our bucket, delete it first */
    if (prevUploadedRef.current) {
      await deleteAdStorageFile(prevUploadedRef.current);
      prevUploadedRef.current = null;
    }

    const ext  = file.name.split(".").pop().toLowerCase();
    const name = `ad_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(ADS_BUCKET)
      .upload(name, file, { upsert: false });

    if (!error) {
      const { data } = supabase.storage.from(ADS_BUCKET).getPublicUrl(name);
      const url = data.publicUrl;
      prevUploadedRef.current = url; /* remember for future replacement */
      setPreview(url);
      onChange(url);
    } else {
      Swal.fire({ ...SWAL_CFG, title: "Upload failed", text: error.message, icon: "error" });
    }
    setUploading(false);
  };

  const handleUrl = (e) => {
    setPreview(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* mode toggle */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { id: "file", label: "Upload from device" },
          { id: "url",  label: "Paste image URL"    },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            style={{
              padding: "5px 14px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${mode === m.id ? T.ember : "var(--border-medium)"}`,
              background: mode === m.id ? `${T.ember}14` : "transparent",
              color: mode === m.id ? T.ember : "rgba(255,255,255,0.35)",
              fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
              fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
              transition: "all 160ms",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              ...inputStyle,
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, cursor: "pointer", border: "1px dashed rgba(255,255,255,0.15)",
              color: uploading ? T.ember : "rgba(255,255,255,0.4)",
              minHeight: 44,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {uploading ? "hourglass_top" : "upload"}
            </span>
            {uploading ? "Uploading..." : "Choose photo from device or camera roll"}
          </button>
        </div>
      ) : (
        <input
          value={preview}
          onChange={handleUrl}
          placeholder="https://... (paste any image link)"
          style={inputStyle}
          onFocus={focus}
          onBlur={blur}
        />
      )}

      {/* preview thumbnail */}
      {preview && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={preview}
            alt="preview"
            style={{
              width: 64, height: 40, objectFit: "cover",
              borderRadius: 6, border: "1px solid var(--border-medium)",
            }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: T.green, letterSpacing: "0.15em" }}>
              Image set — will show as banner background
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              /* if image was uploaded by us, delete it from storage */
              if (prevUploadedRef.current) {
                deleteAdStorageFile(prevUploadedRef.current);
                prevUploadedRef.current = null;
              }
              setPreview(""); onChange("");
            }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 2,
            }}
          >✕</button>
        </div>
      )}
    </div>
  );
};

/* ── Live preview of the banner ───────────────────────────────── */
const AdPreview = ({ form }) => {
  if (!form.title.trim()) return (
    <div style={{
      background: "var(--overlay-1)", border: T.border,
      borderRadius: 12, padding: "20px", textAlign: "center",
    }}>
      <p style={{
        fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
        letterSpacing: "0.25em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.15)",
      }}>
        Preview appears as you type the title
      </p>
    </div>
  );

  return (
    <div style={{
      position: "relative", borderRadius: 12, overflow: "hidden",
      border: "1px solid rgba(236,91,19,0.2)", minHeight: 88,
      background: form.image_url ? "transparent" : "#111",
    }}>
      {form.image_url && (
        <>
          <img src={form.image_url} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22 }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(5,5,5,0.96),rgba(5,5,5,0.55) 60%,rgba(5,5,5,0.2))" }} />
        </>
      )}
      {/* ember left accent */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#ec5b13" }} />
      <div style={{
        position: "relative", padding: "16px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: T.ember, marginBottom: 5 }}>
            Featured
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: form.subtitle ? 4 : 0 }}>
            {form.title}
          </p>
          {form.subtitle && (
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              {form.subtitle}
            </p>
          )}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "9px 18px", background: T.ember, color: "#000",
          borderRadius: 9, fontFamily: "'DM Sans',sans-serif",
          fontWeight: 800, fontSize: 10, letterSpacing: "0.15em",
          textTransform: "uppercase", flexShrink: 0,
        }}>
          {form.cta_label || "Shop Now"}
        </div>
      </div>
    </div>
  );
};

/* ── Ad list card ─────────────────────────────────────────────── */
const AdCard = ({ ad, onDelete, onReactivate }) => {
  const pos         = POSITIONS.find((p) => p.id === ad.position);
  const dest        = DESTINATIONS.find((d) => d.value === ad.cta_url);
  const isExpired   = ad.ends_at   && new Date(ad.ends_at)   < new Date();
  const isScheduled = ad.starts_at && new Date(ad.starts_at) > new Date();
  const statusColor = isExpired ? T.red : isScheduled ? T.amber : T.green;
  const statusLabel = isExpired ? "Expired" : isScheduled ? "Scheduled" : "Live";

  /* full date + time: "15 Jun 2025, 03:00 PM" */
  const fmt = (iso) => !iso ? null : new Date(iso).toLocaleString("en", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <div style={{
      background: T.obsidian, border: T.border,
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 14, padding: "16px 18px",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      {/* ── title row + buttons stacked on right ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: T.ember, marginBottom: 4 }}>
            {pos?.label || ad.position}
          </p>
          <h4 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ad.title}
          </h4>
          {ad.subtitle && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ad.subtitle}
            </p>
          )}
        </div>

        {/* right column — pill on top, buttons below, never pushes title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{
            padding: "3px 10px", borderRadius: 99,
            background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
            fontFamily: "'JetBrains Mono',monospace", fontSize: 7, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", color: statusColor,
            whiteSpace: "nowrap",
          }}>
            {statusLabel}
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {isExpired && (
              <button onClick={() => onReactivate(ad)} style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                color: T.green, fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", whiteSpace: "nowrap",
              }}>Reactivate</button>
            )}
            <button onClick={() => onDelete(ad)} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer",
              background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
              color: T.red, fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
              fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>Delete</button>
          </div>
        </div>
      </div>

      {/* ── meta: button / destination / priority ── */}
      <div style={{ display: "flex", gap: "6px 18px", flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Button",   value: ad.cta_label              },
          { label: "Goes to",  value: dest?.label || ad.cta_url },
          { label: "Priority", value: ad.priority               },
        ].map((m) => (
          <div key={m.label} style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {m.label}
            </span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── start / end: full date + time on their own row, colour-coded ── */}
      {(ad.starts_at || ad.ends_at) && (
        <div style={{
          display: "flex", gap: "6px 24px", flexWrap: "wrap",
          marginTop: 8, paddingTop: 8,
          borderTop: "1px solid var(--overlay-3)",
        }}>
          {ad.starts_at && (
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Starts
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: isScheduled ? T.amber : "rgba(255,255,255,0.38)" }}>
                {fmt(ad.starts_at)}
              </span>
            </div>
          )}
          {ad.ends_at && (
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Ends
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: isExpired ? T.red : "rgba(255,255,255,0.38)" }}>
                {fmt(ad.ends_at)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── main component ───────────────────────────────────────────── */
const AdsManager = () => {
  const [ads, setAds]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAds = useCallback(async () => {
    const { data } = await supabase
      .from("verp_ads")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAds(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAds();
    const channel = supabase
      .channel("ads_manager_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "verp_ads" },
        () => fetchAds()
      )
      .subscribe();

    /* tick every 30 s — flips Expired/Live/Scheduled pill without DB change */
    const tick = setInterval(() => setAds((p) => [...p]), 30_000);

    return () => { supabase.removeChannel(channel); clearInterval(tick); };
  }, [fetchAds]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title:                form.title.trim(),
      subtitle:             form.subtitle.trim()  || null,
      cta_label:            form.cta_label.trim() || "Shop Now",
      cta_url:              form.cta_url,
      image_url:            form.image_url.trim() || null,
      position:             form.position,
      priority:             Number(form.priority) || 1,
      is_active:            form.is_active,
      starts_at:            form.starts_at || null,
      ends_at:              form.ends_at   || null,
      featured_product_id:  form.featured_product_id || null,
    };
    const { error } = await supabase.from("verp_ads").insert([payload]);
    if (!error) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchAds();
    }
    setSaving(false);
  };

  const reactivate = async (ad) => {
    const { value: newEndDate, isConfirmed } = await Swal.fire({
      ...SWAL_CFG,
      title: "Reactivate this ad?",
      html: `
        <p style="font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:16px;line-height:1.6;">
          Set a new end date to run the ad again, or leave blank to run with no expiry.
        </p>
        <input id="new-end-date" type="datetime-local" style="
          width:100%; background:var(--border-light);
          border:1px solid rgba(255,255,255,0.15); border-radius:10px;
          padding:10px 14px; color:white; font-family:'DM Sans',sans-serif;
          font-size:14px; outline:none; box-sizing:border-box; color-scheme:dark;
        "/>`,
      showCancelButton: true,
      confirmButtonText: "REACTIVATE", cancelButtonText: "CANCEL",
      preConfirm: () => {
        const val = document.getElementById("new-end-date")?.value;
        if (val && new Date(val) <= new Date()) {
          Swal.showValidationMessage("End date must be in the future");
          return false;
        }
        return val || null;
      },
    });
    if (!isConfirmed) return;
    await supabase.from("verp_ads")
      .update({ is_active: true, ends_at: newEndDate || null })
      .eq("id", ad.id);
    fetchAds();
  };

  const remove = async (ad) => {
    const r = await Swal.fire({
      ...SWAL_CFG,
      title: "Delete this ad?",
      text: `"${ad.title}" will be permanently removed.`,
      icon: "warning", showCancelButton: true,
      confirmButtonText: "DELETE", cancelButtonText: "CANCEL",
    });
    if (!r.isConfirmed) return;

    /* delete the image from storage first — non-fatal if it fails */
    await deleteAdStorageFile(ad.image_url);

    /* then delete the DB row */
    await supabase.from("verp_ads").delete().eq("id", ad.id);
    fetchAds();
  };

  const canSave = form.title.trim().length > 0 && !saving;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 860, width: "100%" }}>

      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>
            Homepage Promotions
          </p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 26, color: "var(--text-primary)", fontWeight: 400 }}>
            Ad <span style={{ color: T.ember }}>Manager</span>
          </h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12, cursor: "pointer",
            background: showForm ? "var(--border-light)" : T.ember,
            border: "none",
            color: showForm ? "rgba(255,255,255,0.5)" : "#000",
            fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 200ms",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {showForm ? "close" : "add"}
          </span>
          {showForm ? "Cancel" : "New Ad"}
        </button>
      </div>

      {/* ── create form ── */}
      {showForm && (
        <div style={{
          background: T.obsidian, border: T.border,
          borderTop: `2px solid ${T.ember}`,
          borderRadius: 18,
          padding: "clamp(16px, 4vw, 26px)",
          marginBottom: 28,
        }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 22 }}>
            Create New Promotion
          </p>

          <style>{`
            @media(max-width:600px){
              .am-form-grid { grid-template-columns: 1fr !important; }
              .am-sched-grid { grid-template-columns: 1fr !important; }
              .am-card-actions { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
              .am-card-btns { flex-wrap: wrap !important; }
            }
          `}</style>

          <div className="am-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 16 }}>

            <Field label="Title *" hint="The big headline on the banner">
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                maxLength={80} placeholder="e.g. New Collection Drop"
                style={inputStyle} onFocus={focus} onBlur={blur} />
            </Field>

            <Field label="Subtitle" hint="Optional — smaller line below the title">
              <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
                maxLength={140} placeholder="e.g. Fresh styles just added"
                style={inputStyle} onFocus={focus} onBlur={blur} />
            </Field>

            <Field label="Button text" hint="What the orange button says">
              <input value={form.cta_label} onChange={(e) => set("cta_label", e.target.value)}
                maxLength={30} placeholder="Shop Now"
                style={inputStyle} onFocus={focus} onBlur={blur} />
            </Field>

            <Field label="Button destination" hint="Where the button takes the customer">
              <select value={form.cta_url} onChange={(e) => set("cta_url", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {DESTINATIONS.map((d) => (
                  <option key={d.value} value={d.value} style={{ background: "#111" }}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Position" hint="Which section of the homepage it sits in">
              <select value={form.position} onChange={(e) => set("position", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {POSITIONS.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: "#111" }}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Priority"
              hint={
                form.priority === 1 ? "1 = lowest — shown after any higher-priority ad in this slot" :
                form.priority <= 3  ? `${form.priority} = medium — shown before priority 1–${form.priority - 1} ads` :
                form.priority === 4 ? "4 = high — shown before most ads in this slot" :
                "5 = highest — always shown first in this slot"
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="range" min={1} max={5} step={1}
                  value={form.priority}
                  onChange={(e) => set("priority", Number(e.target.value))}
                  style={{ flex: 1, accentColor: T.ember }} />
                <span style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 14,
                  color: T.ember, minWidth: 16, textAlign: "center",
                }}>
                  {form.priority}
                </span>
              </div>
            </Field>

          </div>

          {/* image picker — full width */}
          <div style={{ marginBottom: 16 }}>
            <Field label="Background image" hint="Optional — appears dimmed behind the text">
              <ImagePicker value={form.image_url} onChange={(v) => set("image_url", v)} />
            </Field>
          </div>

          {/* featured product picker — full width */}
          <div style={{ marginBottom: 16 }}>
            <Field
              label="Featured product"
              hint="Optional — client clicks the button and sees this product in a modal"
            >
              <ProductPicker
                value={form.featured_product_id}
                onChange={(id) => set("featured_product_id", id)}
              />
            </Field>
            {form.featured_product_id && (
              <p style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                color: "#22c55e", letterSpacing: "0.15em",
                marginTop: 6,
              }}>
                ✓ Clicking the button will open a product modal — not navigate away
              </p>
            )}
            {!form.featured_product_id && (
              <p style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 8,
                color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em",
                marginTop: 6,
              }}>
                No product selected — button will navigate to the destination page
              </p>
            )}
          </div>

          {/* scheduling — two cols on desktop, one on mobile */}
          <div className="am-sched-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Field label="Start date" hint="Leave empty to go live immediately">
              <input type="datetime-local" value={form.starts_at}
                onChange={(e) => set("starts_at", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }} />
            </Field>
            <Field label="End date" hint="Leave empty — ad runs until deleted">
              <input type="datetime-local" value={form.ends_at}
                onChange={(e) => set("ends_at", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }} />
            </Field>
          </div>

          {/* active toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              onClick={() => set("is_active", !form.is_active)}
              style={{
                width: 38, height: 22, borderRadius: 99,
                background: form.is_active ? T.ember : "var(--border-medium)",
                position: "relative", cursor: "pointer", transition: "background 200ms",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute", top: 4, left: form.is_active ? 19 : 4,
                width: 14, height: 14, borderRadius: "50%", background: "var(--text-primary)",
                transition: "left 200ms", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }} />
            </div>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "var(--text-secondary)" }}>
                {form.is_active ? "Active — will go live immediately when published" : "Inactive — saved but not shown to clients yet"}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", marginTop: 2 }}>
                To stop a live ad, delete it and create a new one
              </p>
            </div>
          </div>

          {/* live preview */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>
              Live Preview — this is exactly what the customer sees
            </p>
            <AdPreview form={form} />
          </div>

          {/* publish button */}
          <button
            onClick={save}
            disabled={!canSave}
            style={{
              padding: "12px 32px", borderRadius: 12, cursor: canSave ? "pointer" : "default",
              background: canSave ? T.ember : "var(--border-light)",
              border: "none",
              color: canSave ? "#000" : "rgba(255,255,255,0.2)",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11,
              letterSpacing: "0.18em", textTransform: "uppercase",
              opacity: saving ? 0.6 : 1, transition: "all 200ms",
            }}
          >
            {saving ? "Publishing..." : "Publish Ad"}
          </button>
        </div>
      )}

      {/* ── ads list ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 48 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${T.ember}`, borderTopColor: "transparent", animation: "am-spin 0.8s linear infinite" }} />
          <style>{`@keyframes am-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : ads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 28, marginBottom: 10 }}>📢</p>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
            No ads yet — click "New Ad" to create your first promotion
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onDelete={remove} onReactivate={reactivate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdsManager;