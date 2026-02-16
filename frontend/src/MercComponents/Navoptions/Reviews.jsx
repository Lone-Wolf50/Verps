import React from "react";

const Reviews = () => {
	const reviews = [
		{
			name: "Alexander V.",
			role: "Collector",
			text: "The Heritage Chronograph exceeded all expectations. The delivery was handled with the utmost discretion.",
			rating: 5,
		},
		{
			name: "Elena Rossi",
			role: "Design Director",
			text: "Finally, a brand that understands the weight of digital luxury. The interface is as premium as the product.",
			rating: 5,
		},
		{
			name: "Marcus Thorne",
			role: "Elite Member",
			text: "The concierge service is unmatched. They facilitated a custom order in less than 48 hours.",
			rating: 5,
		},
	];

	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
				<div className="mb-16">
					<h1 className="text-4xl md:text-6xl font-[900] italic uppercase tracking-tighter leading-none mb-4">
						Client <span className="text-[#ec5b13]">Verdicts</span>
					</h1>
					<p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
						Verified Purchases Only
					</p>
				</div>

				<div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
					{reviews.map((rev, i) => (
						<div
							key={i}
							className="break-inside-avoid glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.02]"
						>
							<div className="flex gap-1 mb-6">
								{[...Array(rev.rating)].map((_, star) => (
									<span
										key={star}
										className="material-symbols-outlined text-[14px] text-[#ec5b13]"
									>
										star
									</span>
								))}
							</div>
							<p className="text-lg font-medium leading-relaxed italic mb-8 text-white/90">
								"{rev.text}"
							</p>
							<div className="flex items-center gap-4">
								<div className="size-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-white/10 flex items-center justify-center text-[10px] font-black">
									{rev.name[0]}
								</div>
								<div>
									<h4 className="text-sm font-black uppercase tracking-widest leading-none">
										{rev.name}
									</h4>
									<p className="text-[10px] text-[#ec5b13] font-bold uppercase tracking-tight mt-1">
										{rev.role}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Call to Action */}
				<div className="mt-20 p-12 rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent text-center">
					<h3 className="text-2xl font-bold uppercase mb-4">
						Share Your Experience
					</h3>
					<p className="text-white/40 text-sm mb-8 max-w-md mx-auto italic">
						Only verified owners are invited to leave a verdict to maintain the
						integrity of our circle.
					</p>
					<button className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#ec5b13] hover:text-white transition-all">
						Write a Review
					</button>
				</div>
			</main>
		</div>
	);
};

export default Reviews;
