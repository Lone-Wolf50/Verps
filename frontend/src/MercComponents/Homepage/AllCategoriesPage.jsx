import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, ChevronRight, LayoutGrid } from "lucide-react";

// Fallback images
import bagImg from "../../assets/bag.jpg";
import boxersImg from "../../assets/boxers.jpg";
import capImg from "../../assets/cap.jpg";
import hoodImg from "../../assets/hood.jpg";

const getCatImg = (cat) => {
	if (cat.image_url) return cat.image_url;
	const fallbacks = {
		Boxers: boxersImg,
		Caps: capImg,
		Hoodies: hoodImg,
		Bags: bagImg,
	};
	return (
		fallbacks[cat.name] ||
		"https://images.unsplash.com/photo-1555529669-2269763671c0?q=80&w=1000&auto=format&fit=crop"
	);
};

// --- Premium Card Component ---
const PremiumCategoryCard = ({ cat, isFeatured = false }) => (
	<Link
		to={`/category/${cat.slug || cat.name.toLowerCase()}`}
		className="group relative block w-full overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0a0a0a] transition-all duration-500 hover:border-[#ec5b13]/40 hover:shadow-[0_0_30px_rgba(236,91,19,0.1)]"
	>
		<div
			className={`${isFeatured ? "aspect-[4/5]" : "aspect-square"} overflow-hidden relative`}
		>
			<img
				src={getCatImg(cat)}
				alt={cat.name}
				className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
			/>
			{/* Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

			{/* Content Overlay */}
			<div className="absolute bottom-0 left-0 p-6 w-full">
				<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.3em] mb-2 block transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
					Collection
				</span>
				<h3 className="text-xl font-light text-white tracking-tight flex items-center justify-between">
					{cat.name}
					<ChevronRight className="w-4 h-4 text-[#ec5b13] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
				</h3>
			</div>
		</div>
	</Link>
);

const AllCategoriesPage = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchCategories = async () => {
			const { data } = await supabase
				.from("verp_categories")
				.select("*")
				.order("name", { ascending: true });
			setCategories(data || []);
			setLoading(false);
		};
		fetchCategories();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#050505] flex items-center justify-center">
				<div className="w-10 h-10 border-2 border-[#ec5b13] border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#050505] text-white">
			{/* Navigation / Header Section */}
			<div className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
					<div className="space-y-6">
						{/* Premium Back Button */}
						<button
							onClick={() => navigate(-1)}
							className="group flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all w-fit"
						>
							<ArrowLeft className="w-4 h-4 text-[#ec5b13] group-hover:-translate-x-1 transition-transform" />
							<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
								Return to Vault
							</span>
						</button>

						<div className="space-y-2">
							<div className="flex items-center gap-4">
								<div className="w-12 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
								<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
									Index 00
								</span>
							</div>
							<h1 className="text-5xl md:text-7xl font-light tracking-tighter">
								Archive{" "}
								<span className="font-serif italic text-[#ec5b13]">
									Categories
								</span>
							</h1>
						</div>
					</div>

					<div className="hidden lg:block text-right">
						<p className="text-[10px] text-white/30 uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
							Curated global departments for the modern enthusiast.
						</p>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<main className="max-w-7xl mx-auto px-6 pb-32">
				{/* Popular / Featured Row */}
				<div className="mb-20">
					<div className="flex items-center gap-3 mb-8">
						<LayoutGrid className="w-4 h-4 text-[#ec5b13]" />
						<h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
							Curated Highlights
						</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{categories.slice(0, 4).map((cat) => (
							<PremiumCategoryCard key={cat.id} cat={cat} isFeatured={true} />
						))}
					</div>
				</div>

				{/* Horizontal Divider */}
				<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

				{/* Full Gallery Grid */}
				<div className="space-y-12">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-light tracking-tight text-white/90">
							Complete <span className="text-white/40">Inventory</span>
						</h2>
						<span className="text-[10px] text-white/20 font-mono">
							{categories.length} DEPARTMENTS AVAILABLE
						</span>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
						{categories.map((cat) => (
							<PremiumCategoryCard key={cat.id} cat={cat} />
						))}
					</div>

					{/* Empty State */}
					{categories.length === 0 && (
						<div className="py-40 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
							<p className="text-white/20 uppercase tracking-widest text-xs">
								The vault is currently empty
							</p>
						</div>
					)}
				</div>
			</main>

			{/* Aesthetic Footer Element */}
			<div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
		</div>
	);
};

export default AllCategoriesPage;
