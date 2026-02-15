import React from "react";
import { shoeProducts } from "./ShoeData.js";

const ShoePages = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Fixed Hero Header - Clean & Bold */}
				<div className="max-w-2xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE <span className="text-[#ec5b13]">SHOE</span>
						<br />
						SERIES
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
						Excellence in every detail. Precision-crafted footwear for the
						modern explorer.
					</p>
				</div>

				{/* Standardized Product Grid 
                    - Mobile: 2 cols
                    - Tablet: 3 cols
                    - PC: 4 cols 
                */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{shoeProducts.map((p, i) => (
						<div
							key={i}
							className="glass-panel rounded-2xl p-3 md:p-6 group transition-all duration-500 hover:-translate-y-2 flex flex-col h-full bg-[#121212] border border-white/5"
						>
							{/* Image Container */}
							<div className="relative aspect-square rounded-xl overflow-hidden mb-4 md:mb-6 bg-[#1a1a1a]">
								<img
									className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-110"
									src={p.image}
									alt={p.name}
								/>
								<div className="absolute top-3 left-3">
									<span className="bg-[#ec5b13] px-2 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white italic">
										{p.tag || "Performance"}
									</span>
								</div>
							</div>

							{/* Info Area */}
							<div className="flex flex-col flex-grow">
								<div className="flex flex-col mb-1">
									<h3 className="text-[13px] md:text-xl font-bold tracking-tight uppercase truncate">
										{p.name}
									</h3>
									<span className="text-[#ec5b13] font-black text-sm md:text-lg">
										{p.price}
									</span>
								</div>

								<p className="text-[8px] md:text-[10px] font-bold text-slate-600 mb-3 uppercase tracking-tighter">
									{p.id || `SH-00${i + 1}`}
								</p>

								<p className="hidden md:block text-slate-400 text-xs mb-6 line-clamp-2 leading-relaxed font-light">
									{p.description}
								</p>

								{/* Stacking Buttons for Consistency */}
								<div className="mt-auto flex flex-col gap-2">
									<button className="w-full bg-[#ec5b13] hover:bg-white hover:text-black text-white font-bold py-2.5 md:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-[9px] md:text-xs uppercase tracking-widest">
										<span className="material-symbols-outlined text-sm">
											shopping_cart
										</span>
										ADD TO CART
									</button>
									<button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 md:py-3 rounded-lg border border-white/10 transition-colors text-[9px] md:text-xs uppercase tracking-widest">
										QUICK VIEW
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
};

export default ShoePages;
