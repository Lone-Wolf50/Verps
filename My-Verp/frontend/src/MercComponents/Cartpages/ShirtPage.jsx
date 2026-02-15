import React from "react";

const shirts = [
	{
		id: "TSS-ONX-01",
		name: "Signature Onyx",
		price: "$145.00",
		description: "Premium handcrafted silk with quadruple-stitched seams.",
		tag: "New Release",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDeEjSj05hElJkLhU9OHD1On0aXIWq3mr8yYvSCuQOpuBBclaG7OiXo6qVA-Bdk8goDGS9z52War7ZU2_pFU0-qErGCfAGM1OYmmr6ofYAzNRAKc2gvTwLj5srURdPUbiiriUDqx093FQCSC-HkOEbaCTsq0KzVUmIdlzI_s9KNTYi274UlDTFzcFeYsLFBSo3hHFBv5fC0_sr1SK6WiNmszCaw-WImC-hVItFX1cPqddU3o3ZIsZANKkOdot7VB8liBrVf7adTmGQ",
	},
	{
		id: "TSS-MDT-05",
		name: "Midnight Silk",
		price: "$95.00",
		description: "Semi-elastic herringbone weave for ultimate comfort.",
		tag: null,
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfzgKOwShyd5klBjPNBT3W1wqoPVE6sF7lD1VPSmtUkyBIZeTpWbh1_6gfLXCskknBgTLOGAWvoxqPtjkx5M3a05x2w6nWJyvIXDtPW2FLknedxJb9AjzbCKCv7KvO9aHnPQGOBiJLMSZh1hB405hHzO2c6LM55TEUO1SQFIcvY0TAep8bqcJzDhcJp2lNw1gGgE1SM0RTJ8uvj5-TGmcLn_Ct9Dp1uyB_u3jZ8W0zRx2W3yUzBbVTBXcHAO8HAqesbkEZAQ7jXDc",
	},
	{
		id: "TSS-TCH-09",
		name: "Charcoal Tech",
		price: "$110.00",
		description: "Performance tech fabric designed for durability.",
		tag: "Best Seller",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBb0vEH8jyjrzda1ekF6kuMiJ95W8vSNTKVNRCY9rQ_iWkIGd5aypV-sl6nDksMizOTLepGTKXtaD4yVP8AswkL0fa3jjaWbHw8PvnozMedVxrEm33P6fE6otbL2lCdvz7b8YbetP65jaU4zUUVJHEOnwOhFKHUiX8FIfJhcUC3i1pXVyStmqaqsIX7hiJcR4VUNROrQtm4RBaMusCvNNrG-y1xR_Bkrv4VayJZ3o2BTA76SoPcpLHJ97P_E5WBlDkwZdPnM9PeF5M",
	},
];

const ShirtPage = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Unified Hero Header - Bold, Italic & Clean */}
				<div className="max-w-3xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE <span className="text-[#ec5b13]">SHIRT</span> SERIES
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
						Elegance redefined for the everyday. Handcrafted from the finest
						silks and cottons for the modern professional.
					</p>
				</div>

				{/* Standardized Product Grid 
                    - Mobile: 2 cols
                    - Tablet: 3 cols
                    - PC: 4 cols 
                */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{shirts.map((p, i) => (
						<div
							key={i}
							className="glass-panel rounded-2xl p-3 md:p-6 group transition-all duration-500 hover:-translate-y-2 flex flex-col h-full bg-[#121212] border border-white/5"
						>
							{/* Image Container */}
							<div className="relative aspect-square rounded-xl overflow-hidden mb-4 md:mb-6 bg-[#1a1a1a]">
								<img
									className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-110"
									src={p.img}
									alt={p.name}
								/>
								{p.tag && (
									<div className="absolute top-3 left-3">
										<span className="bg-[#ec5b13] px-2 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white italic">
											{p.tag}
										</span>
									</div>
								)}
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
									{p.id}
								</p>

								<p className="hidden md:block text-slate-400 text-xs mb-6 line-clamp-2 leading-relaxed font-light">
									{p.description}
								</p>

								{/* Action Buttons - Vertically Stacked */}
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

export default ShirtPage;
