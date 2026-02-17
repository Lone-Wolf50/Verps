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
								Return to Vault
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

			{/* --- QUICK VIEW MODAL --- */}
			{selectedProduct && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 lg:p-12">
					<div
						className="absolute inset-0 bg-black/95 backdrop-blur-md animate-in fade-in duration-500"
						onClick={closeQuickView}
					/>

					<div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
						<button
							onClick={closeQuickView}
							className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-black/60 text-white/40 hover:text-[#ec5b13] transition-all border border-white/10 hover:border-[#ec5b13]/50"
						>
							<X className="w-5 h-5" />
						</button>

						{/* Image Section with Zoom Hover */}
						<div className="w-full md:w-1/2 h-[300px] md:h-auto overflow-hidden bg-[#0d0d0d] group/img relative">
							<img
								src={selectedProduct.image_url}
								className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/img:scale-110 cursor-zoom-in"
								alt={selectedProduct.name}
							/>
						</div>

						{/* Content Section */}
						<div className="w-full md:w-1/2 flex flex-col h-full bg-[#0a0a0a]">
							<div className="p-6 md:p-10 pb-4">
								<div className="flex items-center gap-3 mb-3">
									<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
										Limited Release
									</span>
									<div className="h-[1px] flex-grow bg-white/10"></div>
								</div>
								<h2 className="text-2xl md:text-4xl font-light uppercase tracking-tighter mb-2">
									{selectedProduct.name}
								</h2>
								<div className="flex items-center gap-4">
									<p className="text-xl md:text-2xl text-[#ec5b13] font-mono tracking-tighter italic">
										${Number(selectedProduct.price).toLocaleString()}
									</p>
									<span className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/5 bg-white/5 text-[7px] text-white/40 uppercase tracking-widest font-bold">
										<ShieldCheck className="w-3 h-3 text-[#ec5b13]" />{" "}
										Authenticated
									</span>
								</div>
							</div>

							<div className="flex-grow overflow-y-auto px-6 md:px-10 py-2 custom-scrollbar">
								{/* Universal Accordion Description */}
								<div className="mb-8">
									<div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
										<h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
											Description
										</h4>
										<button
											onClick={() => setIsDescExpanded(!isDescExpanded)}
											className="text-[#ec5b13] flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter hover:text-white transition-colors"
										>
											{isDescExpanded ? "Close Info" : "View Info"}{" "}
											{isDescExpanded ? (
												<ChevronUp className="w-3 h-3" />
											) : (
												<ChevronDown className="w-3 h-3" />
											)}
										</button>
									</div>
									<p
										className={`
                                        text-white/60 leading-relaxed font-light transition-all duration-500
                                        text-[11px] md:text-[15px] md:tracking-wide
                                        ${!isDescExpanded ? "line-clamp-2 md:line-clamp-3" : "line-clamp-none"}
                                    `}
									>
										{selectedProduct.description ||
											"Archived premium selection. Handcrafted for the modern explorer with focus on durability and refined aesthetics."}
									</p>
								</div>

								{relatedItems.length > 0 && (
									<div className="pt-6 border-t border-white/5">
										<h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">
											Related Inventory
										</h4>
										{/* Grid: 3 columns on Tablet/PC, 2 on Mobile */}
										<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-6">
											{relatedItems.map((item) => (
												<button
													key={item.id}
													onClick={() => setSelectedProduct(item)}
													className="group flex flex-col gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#ec5b13]/40 transition-all text-left"
												>
													<div className="aspect-square rounded overflow-hidden bg-[#121212]">
														<img
															src={item.image_url}
															className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
															alt=""
														/>
													</div>
													<div className="overflow-hidden">
														<p className="text-[8px] uppercase font-bold text-white/60 truncate">
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

							{/* Sticky Buy Button */}
							<div className="p-6 md:p-10 bg-[#0a0a0a] border-t border-white/5">
								<button
									onClick={() => {
										addToCart(selectedProduct);
										closeQuickView();
									}}
									className="w-full bg-[#ec5b13] hover:bg-white hover:text-black text-white font-bold py-4 rounded-xl transition-all duration-500 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(236,91,19,0.15)]"
								>
									<ShoppingCart className="w-4 h-4" />
									Acquire for Selection
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CategoryTemplate;
