import React from "react";

const bagProducts = [
	{
		id: "BAG-NLR-33",
		name: "Noir Leather Carryall",
		price: "$450.00",
		description:
			"Exquisite Italian leather with hand-finished edges and brushed gunmetal hardware.",
		tag: "Premium Leather",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuD_O_bJn64ncAVe-vMWw3TBXiQRgBC0x_Fqtwmhm-RrNxYG453sjOsQ-qtZ7EGYAcV4poZhfLR1zebUS8D3EkxgzTyZZ-6Y7iqwkM-EAMSCivkvn7yHkl2WNBwYSGxd1znWLM31VucOIvKaVuae4tVyLR6JwzoAixq5jZESz5mLrzdReW8BACJyOWxSOKEKtKo7nPr8v1BlId71p7Ho35TZR_shNS9L4e7ygd02qFQywzbSyEZ5I_V06Z6w8bEpRFRc079xxOmxRVk",
	},
	{
		id: "BAG-CHR-34",
		name: "Charcoal Tech Backpack",
		price: "$280.00",
		description:
			"Water-resistant Cordura® with internal shock-resistant laptop sleeve and modular pouches.",
		tag: "Tech Optimized",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDJmCfmGyXLoc8bP9IgsDmz-i953N5yN-IL6-6KN1KZsotxqSmcwD-4jJnnfHkcgPfx8q5CgIo_8N06VL-XuavnZ6uBwIQe92EZ_nrWOTZXFVdxcZJ_iLUF4PFliiaE6Cf2davamEAz5ojNs9f1g4Kipy3_GIo1ZapDOLpw4mxJg4z3o81QcrvyJ4bQI-yuKY5VNVbDxQrmQLflGNYjvaK2LPwn8ccDmkarBYUju7grSW2_2qLI1lDcTD1VbCtCp36pDVQdvtzGEpA",
	},
	{
		id: "BAG-MDT-35",
		name: "Midnight Silk Duffle",
		price: "$320.00",
		description:
			"Lustrous silk blend reinforced with ballistic nylon. The ultimate weekend companion.",
		tag: "Limited Edition",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDxW8-ukoXSCJsgC8yVUosRuRxlckn0RJ1jvDUu8GUflc46lLnh_FjSuIknrJFGOcZRP59KKlNyjeU9ty4RmC7AVCUh1_CyUD417p27q2euks-TldVSTOcXujSmM3KhE8-os7COU2Asx_lMlH6acKdlD1_59_LGjo6TjFXGbYfBu76sJT9_OX8yqbJlfj5udvj_iF9SKsV4kJFIIlu5ijIowF5Jy5W2J_DoA27j9OSRey8nGc1L7Osf2MDavnvcGqLB_VQgnsoccEg",
	},
	{
		id: "BAG-HRT-36",
		name: "Heritage Briefcase",
		price: "$510.00",
		description:
			"Classic architecture meeting modern utility. Full-grain cognac leather with brass accents.",
		tag: "Heritage",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuCGg3g4S6GJaOHqy1WM-uSyusOxIZ02o12TCV9gbkVpBZMwoWOIP-ZlP8kys903Stq2HjKMooXUKNHOaKJpDGKYlFLWWVSAuAIN8RP9D0dXHc1uKqp84kb0KvoDhhzdMlSuMV_PSqvjX16ilkQ-IIrmmtUt4X9PwqrpqbhrY49a2uTJ9qLp8fb3h7AkBHaNMGAP8ln2qTzGwaxZlpgzm2Qkx4jTyilewwwIuIYQgrnmQeMTTtY1LXodWfckQqwjwQs5-R_w-E8Vigo",
	},
];

const BagPage = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Unified Hero Header */}
				<div className="max-w-3xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE <span className="text-[#ec5b13]">BAGS</span>
						<br />
						SERIES
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
						Sophisticated storage for the journey ahead. Handcrafted from
						premium leathers and textiles designed to age beautifully and endure
						global travel.
					</p>
				</div>

				{/* Standardized Product Grid 
                    - Mobile: 2 cols
                    - Tablet: 3 cols
                    - PC: 4 cols 
                */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{bagProducts.map((p, i) => (
						<div
							key={i}
							className="glass-panel rounded-2xl p-3 md:p-6 group transition-all duration-500 hover:-translate-y-2 flex flex-col h-full bg-[#121212] border border-white/5"
						>
							{/* Image Container - Aspect 4/5 for Bags */}
							<div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 md:mb-6 bg-[#1a1a1a]">
								<img
									className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-110"
									src={p.image}
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

export default BagPage;
