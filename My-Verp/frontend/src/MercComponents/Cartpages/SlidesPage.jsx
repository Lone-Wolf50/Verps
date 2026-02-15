import React from "react";

const slideProducts = [
	{
		id: "SLD-ONX-01",
		name: "Signature Onyx Slide",
		price: "$120.00",
		description:
			"Premium handcrafted leather with ergonomic support and deep black finish.",
		tag: "Luxury",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuB7skn_jILqWtIKB2w7LlLSoHG8G4Ua9rAkuuusCMMsWxHcmiZ7Efpswra-fverY_5fiGltn2KeLGa-NvthjODRL2Se6X9CCrXYfxY6hcgepgD9HnoO2TA6rVh6ma4kc6BzSsD_GtczjmHl7X4kCtpYjz__DtxLdP4-ctdEF4f8TTHsAmFyUuFpNZS1rLzpN43ng0t4Tp15Ms4PaXEVUz7umQ5-qkWrG9WlhK0Mhi9ru9DzwC3GxmyifudEb5OoDLmriI8p5jeZ7j0",
	},
	{
		id: "SLD-TAN-02",
		name: "Tan Leather Lounge",
		price: "$115.00",
		description: "Handcrafted comfort featuring premium Italian tan leather.",
		tag: "Best Seller",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBpoypPDLtU0a1fszzzx10pvRYoM1MBY3YVLyQZTo6PR5Ogn1Ckq29cDK8aQ6jASIxFwQzU8eNiqsqxSS-No3H3B4Vu5vDa9xo-tspMTlp1w-QK2JEKzysS5awJrFwXJcz22KbxCbwi9gh2zhYU-BQ744hsdFQM1HWG8G9nb-4fpIduYfRTH-GPEACGMrl-lPs77TqNdlA0_C5RP9B0XbFKDBm8LWn4o1-rkHR_ZcCXPPHCyDAzDuBBlsQfGIKSKKBZQ5o_jW19PJw",
	},
	{
		id: "SLD-CHR-03",
		name: "Charcoal Tech Slide",
		price: "$95.00",
		description:
			"Technical mesh ergonomic slides designed for active recovery.",
		tag: "Performance",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAAhkrbKh56r-p3ksW7hBr7-tA_tA1ZVff4mwnnLsr9d0w5OlhG3IF5sJuO8wCGHIF-UtUcQJG2_8tb8i_WpN-1bIqMzQepJo3Nb4a_gUkVgzaO95B3R9gK3Ti3dViFEaw8AL4Vd7AWJvSehH5dPXu8LeWtMyf6ZCbjSTso2uit81uPtNen3PRNyi6-5tUfGtA64Ld6bHe0-RrZhgM2tOk57sDS_ByRHvyfgcg90xUfC-qyJf_wR_iljNHDPQyNfVvwfN5f2mWKag0",
	},
	{
		id: "SLD-CLD-04",
		name: "Cloud Foam Slide",
		price: "$80.00",
		description: "Ultra-light sand-colored foam for walking on clouds.",
		tag: "Cloud Foam",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAfNV610EQXb72nYhWKLr3cRf9tGoz6uMTL2hbzoDvZDNz78w8CooYAFmA4ayNSN5y9TyUjqV4vbnceh2loDh5dNz-Ipx-jLzoMVM4pYdR3UBf1WSwqu9gEZrOj53yVQvcq1XtojYil3tLnbtirs61mg6mUIelKxoaBGCp4MHEt0CUoosvNVsG46rpuVavJymGK5X-IPC_DnDBX0jQowEuRM7h_3z6RDicVvl3ovixJnIOvlziJ2fVomxwHINUtB5fMjiKTy4aFkDE",
	},
];

const SlidesPage = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Unified Hero Header */}
				<div className="max-w-2xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE <span className="text-[#ec5b13]">SLIDE</span>
						<br />
						SERIES
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
						Unrivaled comfort for every step. Handcrafted with premium materials
						and ergonomic support for the modern explorer.
					</p>
				</div>

				{/* Standardized Product Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{slideProducts.map((p, i) => (
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

export default SlidesPage;
