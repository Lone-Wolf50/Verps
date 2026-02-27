import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, ChevronRight, LayoutGrid } from "lucide-react";

import bagImg    from "../../assets/bag.jpg";
import boxersImg from "../../assets/boxers.jpg";
import capImg    from "../../assets/cap.jpg";
import hoodImg   from "../../assets/hood.jpg";

const getCatImg = (cat) => {
	if (cat.image_url) return cat.image_url;
	const fallbacks = { Boxers: boxersImg, Caps: capImg, Hoodies: hoodImg, Bags: bagImg };
	return (
		fallbacks[cat.name] ||
		"https://images.unsplash.com/photo-1555529669-2269763671c0?q=80&w=1000&auto=format&fit=crop"
	);
};

/* ── Card ── */
const PremiumCategoryCard = ({ cat, isFeatured = false }) => (
	<Link
		to={`/category/${cat.slug || cat.name.toLowerCase()}`}
		className="group relative block w-full overflow-hidden border border-white/[0.05] bg-[#0a0a0a] transition-all duration-500 hover:border-[#ec5b13]/30 hover:shadow-[0_0_24px_rgba(236,91,19,0.08)]"
		style={{ borderRadius: 4 }}
	>
		<div
			className="overflow-hidden relative"
			style={{ aspectRatio: isFeatured ? "3/4" : "1/1" }}
		>
			<img
				src={getCatImg(cat)}
				alt={cat.name}
				className="w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-[1.06] transition-all duration-700 ease-out"
			/>
			{/* Ember left accent */}
			<div
				className="absolute left-0 top-0 w-[2px] bg-[#ec5b13]"
				style={{ height: "0%", transition: "height 360ms cubic-bezier(0.16,1,0.3,1)" }}
				ref={(el) => {
					if (!el) return;
					const link = el.closest("a");
					link.addEventListener("mouseenter", () => { el.style.height = "100%"; });
					link.addEventListener("mouseleave", () => { el.style.height = "0%";   });
				}}
			/>
			{/* Gradient */}
			<div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)" }} />

			{/* Content */}
			<div className="absolute bottom-0 left-0 p-4 w-full">
				<span
					className="block mb-1.5"
					style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.3em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}
				>
					Collection
				</span>
				<div className="flex items-center justify-between">
					<h3
						className="text-white uppercase group-hover:text-[#ec5b13] transition-colors duration-300"
						style={{ fontFamily: "'DM Sans',sans-serif", fontSize: isFeatured ? 17 : 14, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}
					>
						{cat.name}
					</h3>
					<ChevronRight
						className="text-[#ec5b13] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 flex-shrink-0"
						style={{ width: 14, height: 14 }}
					/>
				</div>
			</div>
		</div>
	</Link>
);

/* ── Page ── */
const AllCategoriesPage = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading]       = useState(true);
	const navigate                    = useNavigate();

	useEffect(() => {
		supabase
			.from("verp_categories")
			.select("*")
			.order("name", { ascending: true })
			.then(({ data }) => { setCategories(data || []); setLoading(false); });
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#050505] flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border border-[#ec5b13] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
					<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.28em", color: "rgba(255,255,255,0.2)" }}>
						LOADING
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#050505] text-white">

			{/* ── Header — pt-16 instead of pt-32, tight and close to nav ── */}
			<div className="pt-10 pb-10 px-6 max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

					<div className="space-y-5">
						{/* Title */}
						<div>
							<div className="flex items-center gap-3 mb-3">
								<div style={{ width: 20, height: 1, background: "#ec5b13" }} />
								<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.38em", color: "#ec5b13", textTransform: "uppercase" }}>
									Index 00
								</span>
							</div>
							<h1
								className="text-white uppercase"
								style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.95 }}
							>
								Verp{" "}
								<span style={{ fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.28)" }}>
									Categories
								</span>
							</h1>
						</div>

						{/* Back button */}
						<button
							onClick={() => navigate(-1)}
							className="group flex items-center gap-2.5 text-white/30 hover:text-white/60 transition-colors duration-300"
						>
							<ArrowLeft
								className="group-hover:-translate-x-0.5 transition-transform duration-300"
								style={{ width: 14, height: 14, color: "#ec5b13" }}
							/>
							<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase" }}>
								Back
							</span>
						</button>
					</div>

					{/* Right descriptor */}
					<p
						className="hidden lg:block"
						style={{
							fontFamily: "'DM Sans',sans-serif",
							fontSize: 11,
							color: "rgba(255,255,255,0.25)",
							lineHeight: 1.8,
							letterSpacing: "0.04em",
							borderLeft: "1px solid rgba(255,255,255,0.07)",
							paddingLeft: 16,
							maxWidth: 190,
						}}
					>
						Curated global departments for the modern enthusiast.
					</p>
				</div>
			</div>

			{/* ── Main content ── */}
			<main className="max-w-7xl mx-auto px-6 pb-28">

				{/* Curated Highlights — 4 featured */}
				<div className="mb-14">
					<div className="flex items-center gap-3 mb-6">
						<LayoutGrid style={{ width: 13, height: 13, color: "#ec5b13" }} />
						<h2 style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
							Curated Highlights
						</h2>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{categories.slice(0, 4).map((cat) => (
							<PremiumCategoryCard key={cat.id} cat={cat} isFeatured />
						))}
					</div>
				</div>

				{/* Divider */}
				<div className="w-full h-px mb-14" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)" }} />

				{/* Complete inventory */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2
							className="text-white"
							style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 300, letterSpacing: "-0.01em" }}
						>
							Complete{" "}
							<span style={{ color: "rgba(255,255,255,0.28)" }}>Inventory</span>
						</h2>
						<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)" }}>
							{categories.length} DEPARTMENTS
						</span>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
						{categories.map((cat) => (
							<PremiumCategoryCard key={cat.id} cat={cat} />
						))}
					</div>

					{categories.length === 0 && (
						<div className="py-32 text-center border border-dashed border-white/[0.06]" style={{ borderRadius: 4 }}>
							<p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.3em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>
								The vault is currently empty
							</p>
						</div>
					)}
				</div>
			</main>

			{/* Bottom fade */}
			<div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none z-10" style={{ background: "linear-gradient(to top, #050505, transparent)" }} />
		</div>
	);
};

export default AllCategoriesPage;