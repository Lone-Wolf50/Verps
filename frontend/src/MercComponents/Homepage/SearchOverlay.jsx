import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	Search,
	X,
	ArrowUpRight,
	Tag,
	ShoppingCart,
	ShieldCheck,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../Cartoptions/CartContext";

/* ─────────────────────────────────────────────
   SEARCH OVERLAY
───────────────────────────────────────────── */
const SearchOverlay = ({ isOpen, onClose }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState({ products: [], categories: [] });
	const [isSearching, setIsSearching] = useState(false);
	const [quickViewProduct, setQuickViewProduct] = useState(null);
	const [isDescExpanded, setIsDescExpanded] = useState(false);
	const navigate = useNavigate();
	const inputRef = useRef(null);
	const { addToCart } = useCart();

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
			document.body.style.overflow = "hidden";
		} else {
			setQuery("");
			setResults({ products: [], categories: [] });
			setQuickViewProduct(null);
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	useEffect(() => {
		if (!query.trim()) {
			setResults({ products: [], categories: [] });
			return;
		}
		const t = setTimeout(() => performSearch(), 300);
		return () => clearTimeout(t);
	}, [query]);

	const performSearch = async () => {
		setIsSearching(true);
		try {
			const [prodRes, catRes] = await Promise.all([
				supabase
					.from("verp_products")
					.select("*")
					.or(`name.ilike.%${query}%,category.ilike.%${query}%`)
					.limit(6),
				supabase
					.from("verp_categories")
					.select("*")
					.ilike("name", `%${query}%`)
					.limit(6),
			]);
			setResults({
				products: prodRes.data || [],
				categories: catRes.data || [],
			});
		} catch (e) {
			console.error(e);
		} finally {
			setIsSearching(false);
		}
	};

	const openQuickView = (product) => {
		setQuickViewProduct(product);
		setIsDescExpanded(false);
	};

	// Close quickview only — search panel stays open
	const closeQuickView = () => {
		setQuickViewProduct(null);
		setIsDescExpanded(false);
	};

	// Related items excludes current product
	const relatedItems = results.products
		.filter((p) => p.id !== quickViewProduct?.id)
		.slice(0, 4);

	if (!isOpen) return null;

	return (
		<>
			{/* ── SEARCH PANEL ── */}
			<div className="fixed inset-0 z-[300] flex items-start justify-center">
				{/* Backdrop — desktop click to close */}
				<div
					className="absolute inset-0 bg-black/60 backdrop-blur-md hidden sm:block"
					onClick={onClose}
				/>
				{/* Mobile backdrop */}
				<div className="absolute inset-0 bg-black/70 sm:hidden" />

				<div
					className="
						relative z-10 flex flex-col
						w-full h-full
						sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-2xl
						sm:mt-16 sm:rounded-2xl sm:mx-4
						bg-[#0d0d0d]/95 sm:bg-[#111]/95
						border-0 sm:border sm:border-white/10
						overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]
					"
					onClick={(e) => e.stopPropagation()}
				>
					{/* ── Header with clear button INSIDE input ── */}
					<div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 pt-safe pt-4 pb-3 border-b border-white/8">
						<Search className="w-4 h-4 text-[#ec5b13] flex-shrink-0" />

						{/* Input wrapper — clear X lives inside here */}
						<div className="relative flex-1">
							<input
								ref={inputRef}
								type="text"
								placeholder="Search products..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-full bg-transparent text-base text-white/90 font-light focus:outline-none placeholder-white/30 tracking-wide pr-7"
							/>
							{/* Clear button — inside the input, right edge */}
							{query && !isSearching && (
								<button
									onClick={() => {
										setQuery("");
										inputRef.current?.focus();
									}}
									className="absolute right-0 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							)}
						</div>

						{/* Spinner */}
						{isSearching && (
							<span className="w-4 h-4 border border-[#ec5b13]/60 border-t-[#ec5b13] rounded-full animate-spin flex-shrink-0" />
						)}

						{/* Mobile-only close X */}
						<button
							onClick={onClose}
							className="sm:hidden ml-1 flex items-center justify-center w-8 h-8 rounded-full bg-white/8 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition-all active:scale-95"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* ── Body ── */}
					<div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 space-y-7">
						{query.trim() === "" ? (
							<StaticMenu navigate={navigate} onClose={onClose} />
						) : (
							<>
								{results.categories.length > 0 && (
									<section className="space-y-3">
										<SectionHeader label="Categories" />
										<div className="flex flex-wrap gap-2">
											{results.categories.map((cat) => (
												<CategoryPill
													key={cat.id}
													name={cat.name}
													onClick={() => {
														navigate(`/shop?category=${cat.name}`);
														onClose();
													}}
												/>
											))}
										</div>
									</section>
								)}
								{results.products.length > 0 && (
									<section className="space-y-3">
										<SectionHeader label="Products" />
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{results.products.map((product) => (
												<ProductCard
													key={product.id}
													product={product}
													onClick={() => openQuickView(product)}
												/>
											))}
										</div>
									</section>
								)}
								{!isSearching &&
									results.products.length === 0 &&
									results.categories.length === 0 && (
										<div className="py-12 text-center text-white/30 text-sm tracking-widest uppercase">
											No results for "{query}"
										</div>
									)}
							</>
						)}
					</div>
				</div>
			</div>

			{/* ── QUICK VIEW MODAL (above search panel, search stays mounted) ── */}
			{quickViewProduct && (
				<div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-6">
					{/* Backdrop closes quickview only, NOT the search */}
					<div
						className="absolute inset-0 bg-black/80 backdrop-blur-xl"
						onClick={closeQuickView}
					/>

					<div className="relative w-full max-w-3xl max-h-[88vh] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
						{/* Close button */}
						<button
							onClick={closeQuickView}
							className="absolute top-3 right-3 z-50 p-2 rounded-full bg-black/80 border border-white/10 text-white/50 hover:text-[#ec5b13] hover:border-[#ec5b13]/50 transition-all"
						>
							<X className="w-4 h-4" />
						</button>

						{/* Image */}
						<div className="w-full md:w-[42%] h-[38vh] md:h-auto flex-shrink-0 bg-[#0d0d0d] relative overflow-hidden">
							<img
								src={quickViewProduct.image_url}
								alt={quickViewProduct.name}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
						</div>

						{/* Content */}
						<div className="flex-1 flex flex-col min-h-0">
							{/* Header */}
							<div className="p-5 md:p-6 pb-3 border-b border-white/5 flex-shrink-0">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-[8px] font-black text-[#ec5b13] uppercase tracking-[0.3em]">
										Limited Release
									</span>
									<div className="h-px flex-1 bg-white/10" />
								</div>
								<h2 className="text-lg md:text-xl font-light uppercase tracking-tight mb-2 pr-8 line-clamp-2">
									{quickViewProduct.name}
								</h2>
								<div className="flex items-center gap-3">
									<p className="text-lg text-[#ec5b13] font-mono tabular-nums">
										${Number(quickViewProduct.price).toLocaleString()}
									</p>
									<span className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/5 bg-white/5 text-[7px] text-white/40 uppercase tracking-wider font-bold">
										<ShieldCheck className="w-2.5 h-2.5 text-[#ec5b13]" />{" "}
										Verified
									</span>
								</div>
							</div>

							{/* Scrollable middle */}
							<div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-5 custom-scrollbar">
								{/* Description */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<h4 className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">
											Description
										</h4>
										<button
											onClick={() => setIsDescExpanded(!isDescExpanded)}
											className="flex items-center gap-1 text-[8px] font-black uppercase text-[#ec5b13] hover:text-white transition-colors"
										>
											{isDescExpanded ? (
												<ChevronUp className="w-3 h-3" />
											) : (
												<ChevronDown className="w-3 h-3" />
											)}
											{isDescExpanded ? "Less" : "More"}
										</button>
									</div>
									<p
										className={`text-[11px] md:text-[12px] text-white/55 leading-relaxed tracking-wide transition-all duration-300 ${isDescExpanded ? "" : "line-clamp-3"}`}
									>
										{quickViewProduct.description ||
											"Archived premium selection. Handcrafted for the modern explorer with focus on durability and refined aesthetics. Each piece represents timeless design merged with contemporary functionality."}
									</p>
								</div>

								{/* Related from search results */}
								{relatedItems.length > 0 && (
									<div className="border-t border-white/5 pt-4">
										<h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">
											From your search
										</h4>
										<div className="grid grid-cols-2 gap-2">
											{relatedItems.map((item) => (
												<button
													key={item.id}
													onClick={() => {
														setQuickViewProduct(item);
														setIsDescExpanded(false);
													}}
													className="group flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#ec5b13]/30 transition-all text-left"
												>
													<div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-[#121212]">
														<img
															src={item.image_url}
															alt={item.name}
															className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
														/>
													</div>
													<div className="min-w-0">
														<p className="text-[9px] uppercase font-bold text-white/55 truncate group-hover:text-white/80 transition-colors">
															{item.name}
														</p>
														<p className="text-[9px] text-[#ec5b13] font-mono">
															${Number(item.price).toLocaleString()}
														</p>
													</div>
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Add to cart */}
							<div className="p-5 md:p-6 pt-3 border-t border-white/5 flex-shrink-0">
								<button
									onClick={() => {
										addToCart({
											...quickViewProduct,
											image: quickViewProduct.image_url,
										});
										closeQuickView();
									}}
									className="w-full bg-[#ec5b13] hover:bg-white hover:text-black text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 text-[9px] md:text-[10px] uppercase tracking-[0.25em] active:scale-[0.98]"
								>
									<ShoppingCart className="w-3.5 h-3.5" />
									Add to Cart
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(255, 255, 255, 0.02);
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(236, 91, 19, 0.3);
					border-radius: 2px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(236, 91, 19, 0.5);
				}
			`}</style>
		</>
	);
};

/* ── SUB-COMPONENTS ── */
const SectionHeader = ({ label }) => (
	<div className="flex items-center gap-3">
		<span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
			{label}
		</span>
		<div className="h-px flex-1 bg-white/8" />
	</div>
);

const CategoryPill = ({ name, onClick }) => (
	<button
		onClick={onClick}
		className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 hover:text-[#ec5b13] hover:border-[#ec5b13]/30 transition-all active:scale-95"
	>
		<Tag className="w-3 h-3" />
		{name}
	</button>
);

const ProductCard = ({ product, onClick }) => (
	<button
		onClick={onClick}
		className="group relative flex items-center gap-4 p-3 rounded-xl text-left bg-white/[0.03] border border-white/8 hover:bg-white/[0.07] hover:border-[#ec5b13]/25 transition-all duration-200 active:scale-[0.98] overflow-hidden w-full"
	>
		<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#ec5b13]/5 to-transparent rounded-xl" />
		<div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white/5 border border-white/8">
			{product.image_url ? (
				<img
					src={product.image_url}
					alt={product.name}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center text-xl">
					📦
				</div>
			)}
		</div>
		<div className="flex-1 min-w-0">
			<p className="text-sm font-semibold text-white/90 truncate uppercase tracking-wide leading-tight">
				{product.name}
			</p>
			<p className="text-[11px] text-white/35 mt-0.5 truncate">
				{product.category}
			</p>
			<p className="text-sm text-[#ec5b13] font-mono mt-1.5 tabular-nums">
				${product.price}
			</p>
		</div>
		<ArrowUpRight className="flex-shrink-0 w-4 h-4 text-white/15 group-hover:text-[#ec5b13]/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
	</button>
);

const StaticMenu = ({ navigate, onClose }) => (
	<div className="space-y-6">
		<section className="space-y-3">
			<SectionHeader label="Trending" />
			<div className="flex flex-wrap gap-2">
				{["Outerwear", "Vault", "Essentials"].map((term) => (
					<button
						key={term}
						onClick={() => {
							navigate(`/shop?search=${term}`);
							onClose();
						}}
						className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-white/50 hover:text-[#ec5b13] hover:border-[#ec5b13]/25 transition-all active:scale-95"
					>
						{term}
					</button>
				))}
			</div>
		</section>
	</div>
);

export default SearchOverlay;
