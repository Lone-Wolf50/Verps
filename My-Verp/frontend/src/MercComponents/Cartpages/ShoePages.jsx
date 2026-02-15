import React from "react";
import { shoeProducts } from "./ShoeData.js"; // Ensure you create this data file
import Navbar from "../Homepage/Navbar.jsx";
import Footer from "../Homepage/Footer.jsx";

const ShoePages = () => {
	const orangeTheme = {
		"--primary-color": "#ec5b13",
		"--bg-dark": "#0d0d0d",
	};

	return (
		<div
			style={orangeTheme}
			className="bg-[#0d0d0d] text-white min-h-screen font-sans"
		>
			<Navbar />

			{/* Hero Section */}
			<section className="relative pt-44 pb-20 px-6 overflow-hidden bg-[#0d0d0d]">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ec5b13]/20 blur-[120px] rounded-full"></div>
				</div>
				<div className="max-w-7xl mx-auto">
					<span className="inline-block px-4 py-1.5 rounded-full bg-[#ec5b13]/10 text-[#ec5b13] text-xs font-bold uppercase tracking-widest mb-6 border border-[#ec5b13]/20">
						Autumn / Winter 2024
					</span>
					<h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-none">
						THE SHOE <span className="text-[#ec5b13] italic">SERIES</span>
					</h2>
					<p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
						Excellence in every detail. Precision-crafted footwear for the
						modern explorer.
					</p>
				</div>
			</section>

			<main className="max-w-7xl mx-auto px-6 pb-32">
				{/* Responsive Grid: 2 columns mobile, 4 columns desktop */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{shoeProducts.map((p, i) => (
						<div
							key={i}
							className="glass-panel rounded-2xl p-3 md:p-6 group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#ec5b13]/10 flex flex-col"
						>
							{/* Image Container */}
							<div className="relative aspect-square rounded-xl overflow-hidden mb-4 md:mb-6 bg-gradient-to-br from-white/5 to-transparent">
								<img
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
									src={p.image}
									alt={p.name}
								/>
								<div className="absolute bottom-3 left-3">
									<span className="bg-[#ec5b13] px-2 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white">
										{p.tag || "Performance"}
									</span>
								</div>
							</div>

							{/* Info */}
							<div className="flex flex-col flex-grow">
								<div className="flex flex-col mb-2">
									<h3 className="text-sm md:text-xl font-bold tracking-tight uppercase truncate">
										{p.name}
									</h3>
									<span className="text-[#ec5b13] font-black text-sm md:text-lg">
										{p.price}
									</span>
								</div>

								<p className="hidden md:block text-slate-400 text-xs mb-6 line-clamp-2">
									{p.description}
								</p>

								{/* Buttons */}
								<div className="mt-auto flex flex-col gap-2">
									<button className="w-full bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white font-bold py-2 md:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-widest">
										<span className="material-symbols-outlined text-sm">
											shopping_cart
										</span>
										ADD
									</button>
									<button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2 md:py-3 rounded-lg border border-white/10 transition-colors text-[10px] md:text-xs uppercase tracking-widest">
										QUICK VIEW
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default ShoePages;
