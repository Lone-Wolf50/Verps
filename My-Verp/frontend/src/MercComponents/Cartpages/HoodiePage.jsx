import React from "react";

const hoodieProducts = [
	{
		id: "HD-ONX-21",
		name: "Essential Onyx Hoodie",
		price: "$145.00",
		description:
			"Premium handcrafted heavy-weight cotton designed for modern minimalists.",
		tag: "Heavyweight",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuD7C9YUmLwNYLyxNzCJW7VjQhA-eaQa_RESdpQ0h3LpMhFUZ2ZcgMOkOjFGRTjPIy3EUFhR0NOynQn9i-ZXoGifsCyi1Pag3PvqtAQ0gLxgxL0VNbNqNQJPdinI5Los8hrmalX7oyzwLBqRgITW9jBdMAswqYc0asV3g03HZ1HKe5HA_Vyj8X_9hsqyGP0JDHzBoUy_qVx4_eFa9E8hAcgY-K1WFTkCjP2Qi28It5_d7oXmoMSEzjWKHg3uPBDL1RpFfAyerdOyg-U",
	},
	{
		id: "HD-CHR-22",
		name: "Charcoal Tech Fleece",
		price: "$180.00",
		description:
			"Matte tech fabric with water-resistant core and structured hood.",
		tag: "Technical",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBqXIgPvl2nBMfNRmaMH-ZdRxyLlog7PlZUmrcXNJSvxzrBAuyNPkWSNCwlfY_1AF5Xn8ACTKmuBbZFqrFpUkJlHpuXN2x4htKXws2jOmon4eRfed-Dt-eHNpF-8bPaEed-9Ibz4c7cOIebXwQuJkbW-pete8cnIFJf_RN-9VCuHRDtSYid0KQzcnNsAbMfQ5-oK9P4sV5VowaxvZNsn0grTinkXAexT5eqQwWpHg-xdi9BGQLe-8k3NJbvwKe6PgqU9905HJ_IfeU",
	},
	{
		id: "HD-MID-23",
		name: "Midnight Cashmere",
		price: "$295.00",
		description:
			"Ultra-soft cashmere blend for the ultimate luxury comfort experience.",
		tag: "Premium",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDVUzDbrm62hVlucM5fgCB8JBDtAoL3Zh_ZUOGokKFTW6pCk30TVMyM2Z04agU3TzppgSUB7GOvmpaVpVQG5VgmujY8VffiCU8PnlEtLczXbSaM2eUmeSpD3ptAyh4Gqoj0kzvKE6N-buD8xK4UDDUyd3O2FZdog_HC8YtprrOQuAGXfWhVYF5HRWIwKQR1AKxHVnGf1IbhgoNrGi0mEhK-VkEShM5hD3M10gXcX42IaR1jM3EWhBS5s_bbDaaELOmABiyYd-l_g7c",
	},
	{
		id: "HD-RST-25",
		name: "Series 01: Rust",
		price: "$165.00",
		description:
			"Limited release garment-dyed series featuring signature distressed finish.",
		tag: "Limited",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuC5hSMNkBLQXPbnx2dAFmHpPV570VXM30IoEwyI_XiagARbvCfA967I9jL5YpY8lgm0ehBip9xuZv1jeknP3uYipUAKXqu_rZWeUv9gyHs4soD_SaRZU0mKbifN7GYJ7EEibVTRY9WCFY8QKKJXuJuDNz22pkJDzuBxDUyArvokuFb2kKHGe_IbHasdyJcN7TTZpPVdWBCERGJxz6i63E9OVg-i6VPrnysgysTkoFJKTYpseyB8uMCsHYKRAs2lAQzUoLycZbeUXEY",
	},
];

const HoodiePage = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Ultra-Clean Hero Header */}
				<div className="max-w-2xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE <span className="text-[#ec5b13]">HOODIE</span>
						<br />
						SERIES
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
						The ultimate expression of comfort and luxury. Handcrafted from
						heavy-weight premium cotton.
					</p>
				</div>

				{/* Standardized Product Grid 
                    - Mobile: 2 cols
                    - Tablet: 3 cols
                    - PC: 4 cols 
                */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{hoodieProducts.map((p, i) => (
						<div
							key={i}
							className="glass-panel rounded-2xl p-3 md:p-6 group transition-all duration-500 hover:-translate-y-2 flex flex-col h-full bg-white/5 border border-white/5"
						>
							{/* Image Container */}
							<div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 md:mb-6 bg-neutral-900">
								<img
									className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100"
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

								{/* Stacking Buttons for Mobile Consistency */}
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

export default HoodiePage;
