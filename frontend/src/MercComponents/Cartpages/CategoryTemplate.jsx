import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	ShoppingCart,
	Eye,
	LayoutGrid,
	Loader2,
} from "lucide-react";
import { useCart } from "../Cartoptions/CartContext";
import { supabase } from "../supabaseClient";

const CategoryTemplate = ({
	title,
	subtitle,
	collectionIndex = "01",
	description,
	categoryName, // e.g., "bag"
}) => {
	const navigate = useNavigate();
	const { addToCart } = useCart();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);

				// Create an array for both singular and plural versions
				// This handles "bag" vs "bags", "shoe" vs "shoes", etc.
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
					.in("category", searchTerms); // Fetches if category matches any in the array

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

				{/* --- GRID HEADER --- */}
				<div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
					<LayoutGrid className="w-3.5 h-3.5 text-[#ec5b13]" />
					<h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
						Current Inventory
					</h2>
				</div>

				{/* --- PRODUCT GRID / STATES --- */}
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
								className="glass-panel group relative flex flex-col h-full overflow-hidden border border-white/[0.05] bg-[#0a0a0a] transition-all duration-500 hover:border-[#ec5b13]/30"
							>
								<div className="relative aspect-square overflow-hidden bg-[#121212]">
									<img
										// Update this line to match your Supabase column name
										src={p.image_url}
										className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
										alt={p.name}
										// Good practice: Add a fallback for broken links
										onError={(e) => {
											e.target.src =
												"https://placehold.co/600x600/121212/ec5b13?text=Image+Not+Found";
										}}
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
											<ShoppingCart className="w-3 h-3" />
											Add cart
										</button>

										<button className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold py-2 rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em]">
											<Eye className="w-3 h-3 text-[#ec5b13]" />
											Quick View
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
};

export default CategoryTemplate;
