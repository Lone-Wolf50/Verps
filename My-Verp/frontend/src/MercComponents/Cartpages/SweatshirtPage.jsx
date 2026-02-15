import React from "react";

const sweatshirtProducts = [
	{
		id: "SW-SIG-27",
		name: "Signature Crewneck",
		price: "$85.00",
		description:
			"French Terry construction with a refined anatomical fit for daily wear.",
		tag: "New Arrival",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuDtnBTcdOFEfBiXKwzm8i6VImZI9HVVBAJbHsLq_KoiG0Clwlwj6zx7jLK5tmD3I_jZGR8I7YSGGFeaX-ggAKzMx0iaDkNtz3XUW6HzEUOu0hl-lwMkwQpwg7YNcTiiqSC7DcI0kTxc08adpddqNLuPLfim3PBMKXaDdg1_nF-KxGHrF2SzxKFaI7-o232QwogCUOVF4UNbp4UyQXy3LAvK-Y1rqYDu0q3Dr3-fIQZfdSKl3R0QDj1y6Oblk63qKXseezYPC5acjMs",
	},
	{
		id: "SW-HGR-28",
		name: "Heather Grey Pullover",
		price: "$95.00",
		description:
			"Textured soft cotton mix with reinforced stitching and ribbed cuffs.",
		tag: "Sustainable",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBdiOG6bQtt8sFLXo15QDymVIK7qQ1tTv5yZjU2j8G3stqSMeOtQwd4Bf-vggwwZaZl1_ITQMPF0xB2O9qTXmq9ckGkoRyi-VkP0uF1nSmzakUBlC_tzpsjHFy8AoiE8x4l4zgFtWBrRrCv2bBgyFROw5pIbrx-nAW9-sQaE7OuF_AhmJxjsmTFhM-WSFyEK4hWPuhrPdXDT1BvYTdtQ_D6x4By4TtIvh0BMW5trqJkfV15jGzjpGZ0L_jwq_RkJT26y9YqxGTsiNY",
	},
	{
		id: "SW-ONX-29",
		name: "Onyx Modal Sweat",
		price: "$110.00",
		description:
			"Deep black premium modal blend with a silky hand-feel and draped fit.",
		tag: "Limited Edition",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBLWFCjg2QRr6EHwtDqYXif1uwDL_rKIWtiqLj7gKoZ9VHTmWLzbbe8MycEdmPcYpQuNOn38AyuO7rd0zxsX8hYtCEMgJrBRc99loVgD9jzSD9uBq1xbd2nLYHCKPMmXYTtmXAJTF3fMZ82ZE7NSRg9enVbezPGrvQVBRgVQvzXGVrbI4yJObqR1sUcaeCD9oGljMFWIa7ECmfQtrhYupHRJbFbPinOHXRMP5baPC15qoISFy5h5nVadDXIVWgWzHTWygk6ZKKFL-0",
	},
	{
		id: "SW-OLV-30",
		name: "Olive Terrain Base",
		price: "$75.00",
		description:
			"Brushed fleece interior for warmth without the bulk of a hood.",
		tag: null,
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuATjboaWZSu5aRN9UOmRufrdCpb1SBXrj9j0XEuzqgg9gW0DkU_yPuc7xripHBNvam306k6yWmYKJnclyJebR5n27Lvldzd_ducOsxFZQCqK-DrwZ_F4I7gFeGB8DiAe6SfWGJYQMFA0i0a_P5tiF1W1gKOKE8--ruOG1yEyrlk7p2wsJB2fK-hKtZvZHyblkL_t9caWscYkxijUZEZBYKQdTP6fboa-FZhtnQ_GaZkGwZfztcELu0ztLa82Z1tdAF_NHYYUNl5gCE",
	},
];

const SweatshirtPage = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Unified Hero Header - Bold, Italic & Clean */}
				<div className="max-w-3xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE SWEATSHIRT <span className="text-[#ec5b13]">SERIES</span>
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light max-w-2xl leading-relaxed">
						Refined essentials for the modern wardrobe. Engineered for a perfect
						fit, timeless appeal, and unparalleled comfort.
					</p>
				</div>

				{/* Standardized Product Grid 
                    - Mobile: 2 cols
                    - Tablet: 3 cols
                    - PC: 4 cols 
                */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{sweatshirtProducts.map((p, i) => (
						<div
							key={i}
							className="glass-panel rounded-2xl p-3 md:p-6 group transition-all duration-500 hover:-translate-y-2 flex flex-col h-full bg-[#121212] border border-white/5"
						>
							{/* Image Container - Aspect 4/5 for Apparel */}
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

export default SweatshirtPage;
