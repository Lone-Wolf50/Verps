import React from "react";

const capProducts = [
	{
		id: "CP-ONX-15",
		name: "Signature Onyx Cap",
		price: "$45.00",
		description:
			"Brushed tech-twill with 3D embroidery and adjustable metal closure.",
		tag: "Limited Edition",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBpPJWPe_VTgThZcPXtIOhIprn1QhSnvAu6YHovowpB2bGABIGrjrpdCqae3sWEoVjUptWgn6yrq2ONhtposcnIlwfh7scJI1xbQ2hFkXrkxVfttE6z_3O9xmFF7XICdnGQ16nAvpN9YBpppn3vaBqS2z3mqJDQZLu-kL--YxrA6VJpJeR6LCA31eQ-F0F48FPraTq_7imlINjBAEJJO0Ogyt6iCnc-5VTlJuLmsqdDzR5FRyhrffwvMog8xzEdWTckOasC9Rj6FvI",
	},
	{
		id: "CP-SLT-16",
		name: "Slate Tech Trucker",
		price: "$50.00",
		description:
			"Laser-cut mesh panels with moisture-wicking core and structured front.",
		tag: null,
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAic6WBW08jGQrLHKz5IdY5xebYr0YPoaej3rhhY0sgYFxljYCOE30r03uFCUFggy0tQflLgU6PJW92_G6H7ipb26GNm-DzJ7HdteLXxLqHJNmRTPMpu7S6bU-9kDk59e4jSNyjlSKDecQ5TQ23u8NUNW6mFAv3aysFHu1hgZeyj60zOWCPREUBmyaoCM_H3kfiNsqS7lbTxfT2vg_kCEI4Y19imQnO3izmgbSC_0vjtLtHG7G6kVClDZN0VzsoGa8ztKFJXbTLhHg",
	},
	{
		id: "CP-MSB-17",
		name: "Midnight Silk Beanie",
		price: "$65.00",
		description:
			"Premium mulberry silk blend for ultimate comfort and temperature regulation.",
		tag: "Premium",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBENy5rnruAHaT5VlmvJTaPq1Un_Cs3D_kcsWJpVUM1L2TKf9xCoHh9rrdvBw5ybqkIe1nl9lUTMe3Rvay8d8A-FP_aBwJzvH-hNv6UEL10FP2Ph-PibWXTVkWh33selDeHfm0WpoeJc8G2RGlpvfQ0gCw6KLKE2Q0KJWfj7JxZ2WmZZE8Fku8Stu86cPIRNMvbb5DJmO8hZBJD6q46KH0ngpJshRmO8UD7x7-i2hC4Cmn1ep0WPYv3ZtOFW2VyOYsb-2HOk85ueJY",
	},
	{
		id: "CP-ORC-18",
		name: "Burnt Orange Core",
		price: "$45.00",
		description:
			"Signature series in the season's primary colorway. Organic heavy cotton.",
		tag: "New Drop",
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuAuSCevn-PP1idap7iG9RDUqD-iIwqjPCo7c7kEorPvByJk1yVy7qkKq_igIMpujHml6dO692k5d2mHQSWGysBGf1HVMYpnmhsn8Ns2EA5aghXHhIhRHk45r1WjjUtzuFn9xNshIN015uo6TrruNzdLQtDc7er_9sw2A7sF4WkbcXJnM8vpOUTDWeBmzrxxCw_sUKH_hQV5D1RZceCpUZc1toY5g6Ej342nbRnqg0Vxv5fRvmWvrE1Gg3ZklUiWVQ7DQmvJQVhDcTo",
	},
];

const CapPage = () => {
	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				{/* Simplified Hero Header */}
				<div className="max-w-2xl mb-20 text-left">
					<h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter leading-[0.85] uppercase mb-8">
						THE <span className="text-[#ec5b13]">CAP</span>
						<br />
						SERIES
					</h1>
					<p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
						Engineered for fit. Designed for style. Precision-crafted luxury
						headwear.
					</p>
				</div>

				{/* Standardized Product Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
					{capProducts.map((p, i) => (
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

								{/* Buttons - mt-auto keeps them aligned at the bottom across the row */}
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

export default CapPage;
