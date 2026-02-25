import React, { useEffect, useState, useCallback, useRef } from "react";
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
	CheckCircle2,
} from "lucide-react";
import { useCart } from "../Cartoptions/CartContext";
import { supabase } from "../supabaseClient";

/* ══════════════════════════════════════════════════════════════
   PREMIUM TOAST — floating, material-design-inspired
   ════════════════════════════════════════════════════════════ */
const ToastStack = ({ toasts, onDismiss }) => {
	return (
		<div
			style={{
				position: "fixed",
				bottom: 28,
				right: 24,
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				gap: 10,
				alignItems: "flex-end",
				pointerEvents: "none",
			}}
		>
			<style>{`
				@keyframes toastIn {
					from { opacity:0; transform: translateY(18px) scale(0.94); }
					to   { opacity:1; transform: translateY(0)    scale(1);    }
				}
				@keyframes toastOut {
					from { opacity:1; transform: translateY(0) scale(1); max-height:100px; margin-bottom:0; }
					to   { opacity:0; transform: translateY(10px) scale(0.96); max-height:0; margin-bottom:-10px; }
				}
				@keyframes progressBar {
					from { width: 100%; }
					to   { width: 0%;   }
				}
				@keyframes checkPop {
					0%   { transform: scale(0) rotate(-20deg); opacity:0; }
					60%  { transform: scale(1.2) rotate(4deg);  opacity:1; }
					100% { transform: scale(1) rotate(0deg);   opacity:1; }
				}
			`}</style>

			{toasts.map((t) => (
				<div
					key={t.id}
					style={{
						pointerEvents: "auto",
						animation: t.exiting
							? "toastOut 280ms cubic-bezier(0.4,0,1,1) forwards"
							: "toastIn 340ms cubic-bezier(0.16,1,0.3,1) forwards",
						willChange: "transform, opacity",
					}}
				>
					<div
						style={{
							position: "relative",
							minWidth: 300,
							maxWidth: 360,
							background: "rgba(14,14,14,0.97)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 16,
							padding: "14px 16px 18px",
							boxShadow:
								"0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
							backdropFilter: "blur(20px)",
							overflow: "hidden",
						}}
					>
						{/* Accent top-left glow */}
						<div
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: 120,
								height: 2,
								background:
									"linear-gradient(90deg, #ec5b13 0%, transparent 100%)",
								borderRadius: "16px 0 0 0",
							}}
						/>

						{/* Content row */}
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							{/* Animated check icon */}
							<div
								style={{
									width: 36,
									height: 36,
									borderRadius: 10,
									background:
										"linear-gradient(135deg, rgba(236,91,19,0.18), rgba(236,91,19,0.06))",
									border: "1px solid rgba(236,91,19,0.25)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<CheckCircle2
									style={{
										width: 18,
										height: 18,
										color: "#ec5b13",
										animation: "checkPop 420ms cubic-bezier(0.16,1,0.3,1) both",
										animationDelay: "80ms",
									}}
								/>
							</div>

							{/* Text */}
							<div style={{ flex: 1, minWidth: 0 }}>
								<p
									style={{
										fontFamily: "'DM Sans', sans-serif",
										fontSize: 12,
										fontWeight: 700,
										color: "rgba(255,255,255,0.92)",
										letterSpacing: "0.01em",
										marginBottom: 3,
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{t.name}
								</p>
								<p
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										fontSize: 9,
										fontWeight: 700,
										letterSpacing: "0.22em",
										textTransform: "uppercase",
										color: "#ec5b13",
									}}
								>
									Added to Cart
								</p>
							</div>

							{/* Product thumbnail */}
							{t.image && (
								<div
									style={{
										width: 38,
										height: 38,
										borderRadius: 8,
										overflow: "hidden",
										border: "1px solid rgba(255,255,255,0.06)",
										flexShrink: 0,
									}}
								>
									<img
										src={t.image}
										alt={t.name}
										style={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								</div>
							)}

							{/* Dismiss */}
							<button
								onClick={() => onDismiss(t.id)}
								style={{
									flexShrink: 0,
									width: 24,
									height: 24,
									borderRadius: 6,
									background: "rgba(255,255,255,0.04)",
									border: "none",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "rgba(255,255,255,0.25)",
									transition: "all 150ms",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background =
										"rgba(255,255,255,0.09)";
									e.currentTarget.style.color = "rgba(255,255,255,0.6)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background =
										"rgba(255,255,255,0.04)";
									e.currentTarget.style.color = "rgba(255,255,255,0.25)";
								}}
							>
								<X style={{ width: 11, height: 11 }} />
							</button>
						</div>

						{/* Progress bar — auto-dismiss indicator */}
						<div
							style={{
								position: "absolute",
								bottom: 0,
								left: 0,
								height: 2,
								background:
									"linear-gradient(90deg, #ec5b13, rgba(236,91,19,0.4))",
								borderRadius: "0 0 16px 16px",
								animation: `progressBar ${t.duration}ms linear forwards`,
								animationDelay: "50ms",
							}}
						/>
					</div>
				</div>
			))}
		</div>
	);
};

/* ── Toast manager hook ── */
let _toastId = 0;
const useToast = () => {
	const [toasts, setToasts] = useState([]);

	const dismiss = useCallback((id) => {
		setToasts((prev) =>
			prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
		);
		setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
	}, []);

	const addToast = useCallback(
		({ name, image, duration = 3800 }) => {
			const id = ++_toastId;
			setToasts((prev) => [...prev, { id, name, image, duration, exiting: false }]);
			setTimeout(() => dismiss(id), duration);
		},
		[dismiss]
	);

	return { toasts, addToast, dismiss };
};

/* ══════════════════════════════════════════════════════════════
   CATEGORY TEMPLATE
   ════════════════════════════════════════════════════════════ */
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
	const { toasts, addToast, dismiss } = useToast();

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

	// Wrapped add-to-cart that fires the toast
	const handleAddToCart = (product) => {
		addToCart({ ...product, image: product.image_url });
		addToast({ name: product.name, image: product.image_url });
	};

	const relatedItems = products
		.filter((p) => p.id !== selectedProduct?.id)
		.slice(0, 6);

	return (
		<div className="bg-[#050505] text-white min-h-screen font-sans">
			{/* Toast portal */}
			<ToastStack toasts={toasts} onDismiss={dismiss} />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 pt-[88px] sm:pt-[104px] md:pt-[112px] pb-20">
				{/* ── HEADER ROW ── */}
				<div className="flex flex-col gap-4 mb-10 sm:mb-12">
					<div className="flex items-center gap-3 sm:gap-5">
						<button
							onClick={() => navigate(-1)}
							className="group flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-[#ec5b13]/10 hover:border-[#ec5b13]/40 transition-all active:scale-95"
							aria-label="Go back"
						>
							<ArrowLeft className="w-3.5 h-3.5 text-[#ec5b13] group-hover:-translate-x-0.5 transition-transform" />
						</button>

						<div className="flex-shrink-0 w-6 sm:w-8 h-[1px] bg-gradient-to-r from-[#ec5b13]/50 to-transparent" />

						<div className="flex-1 min-w-0">
							<h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter uppercase leading-none">
								{title}{" "}
								<span className="font-serif italic text-[#ec5b13] lowercase">
									{subtitle}
								</span>
							</h1>
						</div>

						{description && (
							<div className="hidden lg:block flex-shrink-0 max-w-[220px] text-right">
								<p className="text-[9px] text-white/30 uppercase tracking-[0.3em] leading-relaxed">
									{description}
								</p>
							</div>
						)}
					</div>

					{description && (
						<p className="lg:hidden text-[9px] text-white/30 uppercase tracking-[0.3em] leading-relaxed max-w-sm pl-[52px] sm:pl-[60px]">
							{description}
						</p>
					)}
				</div>

				{/* Inventory label */}
				<div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
					<LayoutGrid className="w-3.5 h-3.5 text-[#ec5b13]" />
					<h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
						Current Inventory
					</h2>
				</div>

				{/* Product grid */}
				{loading ? (
					<div className="flex flex-col items-center justify-center py-32 gap-4">
						<Loader2 className="w-6 h-6 text-[#ec5b13] animate-spin" />
						<span className="text-[10px] font-mono tracking-[0.5em] uppercase text-white/20">
							Verp Syncing...
						</span>
					</div>
				) : products.length === 0 ? (
					<div className="py-32 text-center border border-dashed border-white/10 rounded-xl">
						<p className="text-[10px] font-mono tracking-widest text-white/30 uppercase italic">
							No entries found ...
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
										<p className="text-[7px] md:text-[8px] font-mono text-white/40 tracking-widest uppercase italic">
											SKU // {p.sku || `VERP-${collectionIndex}-${i + 1}`}
										</p>
									</div>
									<div className="mb-3">
										<span className="text-sm md:text-lg font-light text-white/90">
											GH&#8373; {Number(p.price).toLocaleString()}
										</span>
									</div>
									<div className="mt-auto flex flex-col gap-1.5">
										<button
											onClick={() => handleAddToCart(p)}
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

			{/* ── QUICK VIEW MODAL ── */}
			{selectedProduct && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
					<div
						className="absolute inset-0 bg-black/96 backdrop-blur-xl animate-in fade-in duration-300"
						onClick={closeQuickView}
					/>
					<div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
						<button
							onClick={closeQuickView}
							className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-black/80 text-white/60 hover:text-[#ec5b13] hover:bg-black transition-all border border-white/10 hover:border-[#ec5b13]/50"
						>
							<X className="w-4 h-4" />
						</button>

						<div className="w-full md:w-[45%] h-[35vh] md:h-auto overflow-hidden bg-[#0d0d0d] relative flex-shrink-0">
							<img
								src={selectedProduct.image_url}
								className="w-full h-full object-cover"
								alt={selectedProduct.name}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
						</div>

						<div className="w-full md:w-[55%] flex flex-col bg-[#0a0a0a] max-h-[50vh] md:max-h-full">
							<div className="p-5 md:p-7 pb-3 md:pb-4 flex-shrink-0 border-b border-white/5">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-[8px] font-black text-[#ec5b13] uppercase tracking-[0.3em]">
										Limited Release
									</span>
									<div className="h-[1px] flex-grow bg-white/10" />
								</div>
								<h2 className="text-xl md:text-2xl font-light uppercase tracking-tight mb-2 line-clamp-1">
									{selectedProduct.name}
								</h2>
								<div className="flex items-center gap-3">
									<p className="text-lg md:text-xl text-[#ec5b13] font-mono tracking-tight">
										GH&#8373; {Number(selectedProduct.price).toLocaleString()}
									</p>
									<span className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/5 bg-white/5 text-[7px] text-white/40 uppercase tracking-wider font-bold">
										<ShieldCheck className="w-2.5 h-2.5 text-[#ec5b13]" />{" "}
										Verified
									</span>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto px-5 md:px-7 py-4 custom-scrollbar">
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
										className={`text-white/60 leading-relaxed font-light transition-all duration-300 text-[11px] md:text-[12px] tracking-wide ${!isDescExpanded ? "line-clamp-3" : "line-clamp-none"}`}
									>
										{selectedProduct.description ||
											"Archived premium selection. Handcrafted for the modern explorer with focus on durability and refined aesthetics. Each piece represents timeless design merged with contemporary functionality."}
									</p>
								</div>

								{relatedItems.length > 0 && (
									<div className="pt-4 border-t border-white/5">
										<h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">
											Related Product
										</h4>
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
															GH&#8373;{Number(item.price).toLocaleString()}
														</p>
													</div>
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							<div className="p-5 md:p-7 pt-3 md:pt-4 bg-[#0a0a0a] border-t border-white/5 flex-shrink-0">
								<button
									onClick={() => {
										handleAddToCart(selectedProduct);
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