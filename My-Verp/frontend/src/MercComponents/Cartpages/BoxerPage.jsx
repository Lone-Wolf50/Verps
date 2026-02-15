import React from "react";
import { boxerProducts } from "./BoxersData";
import Navbar from "../Homepage/Navbar";
import Footer from "../Homepage/Footer";
const BoxerPage = () => {
	// These variables ensure Tailwind 'primary' classes use your orange
	const orangeTheme = {
		"--primary-color": "#ec5b13",
		"--bg-dark": "#0d0d0d",
	};

	return (
		<div
			style={orangeTheme}
			className="bg-[#0d0d0d] text-white min-h-screen font-sans"
		>
			{/* The Navbar usually sits at the very top */}
			<Navbar />

			<main className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12 pt-32">
				{/* Header Section */}
				<header className="mb-12 max-w-2xl">
					<h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase leading-[0.9]">
						The <span className="text-[#ec5b13]">Boxer</span> Series
					</h1>
					<p className="text-gray-400 text-lg lg:text-xl font-light leading-relaxed">
						Engineered for power. Designed for endurance. Explore the full
						collection of professional grade, high-performance combat gear.
					</p>
				</header>

				{/* Grid: 2 columns on mobile (grid-cols-2), 4 on desktop (lg:grid-cols-4) */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{boxerProducts.map((p, i) => (
						<div
							key={i}
							className="bg-white/5 glass-card backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 hover:border-[#ec5b13]/40 transition-all flex flex-col group"
						>
							{/* Product Image */}
							<div className="relative aspect-square mb-4 md:mb-6 rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
								<img
									src={p.image}
									className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
									alt={p.name}
								/>
								{p.isNew && (
									<span className="absolute top-2 left-2 bg-[#ec5b13] text-[8px] md:text-[10px] font-black px-2 py-1 rounded">
										NEW RELEASE
									</span>
								)}
							</div>

							{/* Product Info */}
							<div className="flex flex-col flex-grow">
								<div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-1">
									<div>
										<h3 className="text-sm md:text-lg font-bold uppercase tracking-tight truncate">
											{p.name}
										</h3>
										<p className="text-[10px] text-gray-500 font-medium uppercase">
											SKU: {p.sku}
										</p>
									</div>
									<span className="text-sm md:text-xl font-black text-[#ec5b13]">
										{p.price}
									</span>
								</div>

								{/* Description - hidden on small mobile to keep grid neat */}
								<p className="hidden md:block text-xs text-gray-500 mb-6 line-clamp-2">
									{p.description}
								</p>

								{/* Action Buttons */}
								<div className="mt-auto flex flex-col sm:flex-row gap-2 md:gap-3">
									<button className="flex-1 bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white text-[10px] md:text-xs font-black uppercase tracking-widest py-2 md:py-3 rounded-lg transition-all flex items-center justify-center gap-2">
										<span className="material-symbols-outlined text-sm">
											shopping_cart
										</span>
										Add
									</button>
									<button className="flex-1 border border-white/20 hover:bg-white/5 text-white text-[10px] md:text-xs font-black uppercase tracking-widest py-2 md:py-3 rounded-lg transition-all">
										Quick View
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

export default BoxerPage;
