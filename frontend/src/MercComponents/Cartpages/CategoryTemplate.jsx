import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	ShoppingCart,
	Eye,
	LayoutGrid,
	Loader2,
	X,
	ChevronDown,
	ChevronUp,
	ShieldCheck,
} from "lucide-react";
import { useCart } from "../Cartoptions/CartContext";
import { supabase } from "../supabaseClient";

const CategoryTemplate = ({
	title,
	subtitle,
	collectionIndex = "01",
	description,
	categoryName,
}) => {
	const navigate = useNavigate();
	const { addToCart } = useCart();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [isDescExpanded, setIsDescExpanded] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				const capitalized =
					categoryName.charAt(0).toUpperCase() +
					categoryName.slice(1).toLowerCase();
				const searchTerms = [
					categoryName.toUpperCase(),
					categoryName.toLowerCase(),
					capitalized,
					`${categoryName.toUpperCase()}S`,
					`${categoryName.toLowerCase()}s`,
					`${capitalized}s`,
				];

				const { data, error } = await supabase
					.from("verp_products")
					.select("*")
					.in("category", searchTerms);

				if (error) throw error;
				setProducts(data || []);
			} catch (err) {
				console.error("Vault Access Error:", err.message);
			} finally {
				setLoading(false);
			}
		};

		if (categoryName) fetchProducts();
	}, [categoryName]);

	const openQuickView = (product) => {
		setSelectedProduct(product);
		setIsDescExpanded(false);
		document.body.style.overflow = "hidden";
	};

	const closeQuickView = () => {
		setSelectedProduct(null);
		document.body.style.overflow = "unset";
	};

	const relatedItems = products
		.filter((p) => p.id !== selectedProduct?.id)
		.slice(0, 6);

	return (
		<div className="bg-[#050505] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-20 pb-20">
				{/* --- HEADER SECTION --- */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
					<div className="space-y-4">
						<button
							onClick={() => navigate(-1)}
							className="group flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all w-fit"
						>
							<ArrowLeft className="w-3.5 h-3.5 text-[#ec5b13] group-hover:-translate-x-1 transition-transform" />
							<span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
								Back
							</span>
						</button>

						<div className="space-y-1">
							<div className="flex items-center gap-3">
								<div className="w-10 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
								<span className="text-[8px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
									Index {collectionIndex}
								</span>
							</div>
							<h1 className="text-4xl md:text-6xl font-light tracking-tighter uppercase">
								{title}{" "}
								<span className="font-serif italic text-[#ec5b13] lowercase">
									{subtitle}
								</span>
							</h1>
						</div>
					</div>

					<div className="hidden lg:block text-right max-w-[250px]">
						<p className="text-[9px] text-white/30 uppercase tracking-[0.3em] leading-relaxed">
							{description}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
					<LayoutGrid className="w-3.5 h-3.5 text-[#ec5b13]" />
					<h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
						Current Inventory
					</h2>
				</div>

				{/* --- PRODUCT GRID --- */}
				{loading ? (
					<div className="flex flex-col items-center justify-center py-32 gap-4">
						<Loader2 className="w-6 h-6 text-[#ec5b13] animate-spin" />
						<span className="text-[10px] font-mono tracking-[0.5em] uppercase text-white/20">
							Syncing Vault...
						</span>
					</div>
				) : products.length === 0 ? (
					<div className="py-32 text-center border border-dashed border-white/10 rounded-xl">
						<p className="text-[10px] font-mono tracking-widest text-white/30 uppercase italic">
							No entries found in archive
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
						{products.map((p, i) => (
							<div
								key={p.id || i}
								className="group relative flex flex-col h-full overflow-hidden border border-white/[0.05] bg-[#0a0a0a] transition-all duration-500 hover:border-[#ec5b13]/30"
							>
								<div className="relative aspect-square overflow-hidden bg-[#121212]">
									<img
										src={p.image_url}
										className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
										alt={p.name}
									/>
									{p.is_new && (
										<div className="absolute top-2 left-2">
											<span className="bg-[#ec5b13] px-1.5 py-0.5 rounded-sm text-[6px] font-black uppercase tracking-widest text-white italic">
												New
											</span>
										</div>
									)}
								</div>

								<div className="p-3 md:p-5 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/20">
									<div className="mb-2">
										<h3 className="hidden md:block text-[13px] font-bold tracking-tight uppercase group-hover:text-[#ec5b13] transition-colors line-clamp-1">
											{p.name}
										</h3>
										<p className="text-[7px] md:text-[8px] font-mono text-white/20 tracking-widest uppercase italic">
											SKU // {p.sku || `VERP-${collectionIndex}-${i + 1}`}
										</p>
									</div>
									<div className="mb-3">
										<span className="text-sm md:text-lg font-light text-white/90">
											${Number(p.price).toLocaleString()}
										</span>
									</div>
									<div className="mt-auto flex flex-col gap-1.5">
										<button
											onClick={() => addToCart(p)}
											className="w-full bg-[#ec5b13] hover:bg-white hover:text-black text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em]"
										>
											<ShoppingCart className="w-3 h-3" /> Add cart
										</button>
										<button
											onClick={() => openQuickView(p)}
											className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold py-2 rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em]"
										>
											<Eye className="w-3 h-3 text-[#ec5b13]" /> Quick View
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>

			{/* --- PREMIUM QUICK VIEW MODAL --- */}
			{selectedProduct && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
					<div
						className="absolute inset-0 bg-black/96 backdrop-blur-xl animate-in fade-in duration-300"
						onClick={closeQuickView}
					/>

					{/* Optimized Modal Container */}
					<div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
						{/* Close Button */}
						<button
							onClick={closeQuickView}
							className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-black/80 text-white/60 hover:text-[#ec5b13] hover:bg-black transition-all border border-white/10 hover:border-[#ec5b13]/50"
						>
							<X className="w-4 h-4" />
						</button>

						{/* Image Section - Optimized Size */}
						<div className="w-full md:w-[45%] h-[35vh] md:h-auto overflow-hidden bg-[#0d0d0d] relative flex-shrink-0">
							<img
								src={selectedProduct.image_url}
								className="w-full h-full object-cover"
								alt={selectedProduct.name}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
						</div>

						{/* Content Section - Better Proportions */}
						<div className="w-full md:w-[55%] flex flex-col bg-[#0a0a0a] max-h-[50vh] md:max-h-full">
							{/* Header - Fixed */}
							<div className="p-5 md:p-7 pb-3 md:pb-4 flex-shrink-0 border-b border-white/5">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-[8px] font-black text-[#ec5b13] uppercase tracking-[0.3em]">
										Limited Release
									</span>
									<div className="h-[1px] flex-grow bg-white/10"></div>
								</div>
								<h2 className="text-xl md:text-2xl font-light uppercase tracking-tight mb-2 line-clamp-1">
									{selectedProduct.name}
								</h2>
								<div className="flex items-center gap-3">
									<p className="text-lg md:text-xl text-[#ec5b13] font-mono tracking-tight">
										${Number(selectedProduct.price).toLocaleString()}
									</p>
									<span className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/5 bg-white/5 text-[7px] text-white/40 uppercase tracking-wider font-bold">
										<ShieldCheck className="w-2.5 h-2.5 text-[#ec5b13]" />{" "}
										Verified
									</span>
								</div>
							</div>

							{/* Scrollable Content Area */}
							<div className="flex-1 overflow-y-auto px-5 md:px-7 py-4 custom-scrollbar">
								{/* Description Section - Compact & Expandable */}
								<div className="mb-5">
									<div className="flex items-center justify-between mb-2">
										<h4 className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">
											Description
										</h4>
										<button
											onClick={() => setIsDescExpanded(!isDescExpanded)}
											className="text-[#ec5b13] flex items-center gap-1 text-[8px] font-black uppercase tracking-tight hover:text-white transition-colors"
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
										className={`
                                        text-white/60 leading-relaxed font-light transition-all duration-300
                                        text-[11px] md:text-[12px] tracking-wide
                                        ${!isDescExpanded ? "line-clamp-3" : "line-clamp-none"}
                                    `}
									>
										{selectedProduct.description ||
											"Archived premium selection. Handcrafted for the modern explorer with focus on durability and refined aesthetics. Each piece represents timeless design merged with contemporary functionality."}
									</p>
								</div>

								{/* Related Items - Optimized Grid */}
								{relatedItems.length > 0 && (
									<div className="pt-4 border-t border-white/5">
										<h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">
											Related Inventory
										</h4>
										{/* 2 columns mobile, 3 columns tablet/desktop */}
										<div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
											{relatedItems.map((item) => (
												<button
													key={item.id}
													onClick={() => {
														setSelectedProduct(item);
														setIsDescExpanded(false);
													}}
													className="group flex flex-col gap-1.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#ec5b13]/40 transition-all text-left"
												>
													<div className="aspect-square rounded overflow-hidden bg-[#121212]">
														<img
															src={item.image_url}
															className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
															alt={item.name}
														/>
													</div>
													<div className="overflow-hidden px-0.5">
														<p className="text-[8px] md:text-[9px] uppercase font-bold text-white/60 truncate group-hover:text-white/80 transition-colors">
															{item.name}
														</p>
														<p className="text-[8px] text-[#ec5b13] font-mono">
															${Number(item.price).toLocaleString()}
														</p>
													</div>
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Footer Button - Fixed */}
							<div className="p-5 md:p-7 pt-3 md:pt-4 bg-[#0a0a0a] border-t border-white/5 flex-shrink-0">
								<button
									onClick={() => {
										addToCart(selectedProduct);
										closeQuickView();
									}}
									className="w-full bg-[#ec5b13] hover:bg-white hover:text-black text-white font-bold py-3 md:py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 text-[9px] md:text-[10px] uppercase tracking-[0.25em] shadow-lg hover:shadow-xl"
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
		</div>
	);
};

export default CategoryTemplate;
