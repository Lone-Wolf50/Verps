import React from "react";

const Analytics = () => {
	const data = [
		{ label: "JAN", value: 60, amount: "₵12.5K" },
		{ label: "FEB", value: 85, amount: "₵18.2K" },
		{ label: "MAR", value: 45, amount: "₵9.8K" },
		{ label: "APR", value: 95, amount: "₵21.4K" },
		{ label: "MAY", value: 70, amount: "₵15.6K" },
	];

	return (
		<div className="space-y-8 md:space-y-10 px-4 md:px-0">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
				{/* Performance Chart */}
				<div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-6 md:p-10">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,91,19,0.05),transparent_50%)]"></div>

					<div className="relative mb-8 md:mb-10">
						<h3 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2">
							Vault{" "}
							<span className="font-serif italic text-[#ec5b13]">
								Performance
							</span>
						</h3>
						<p className="text-xs text-white/40 tracking-wide">
							Monthly revenue overview
						</p>
					</div>

					{/* Chart */}
					<div className="relative">
						<div className="flex items-end justify-between h-48 md:h-64 gap-2 md:gap-4 px-2 md:px-4">
							{data.map((item, index) => (
								<div
									key={index}
									className="flex flex-col items-center gap-3 md:gap-4 w-full group"
								>
									<div className="relative w-full">
										<div
											className="w-full bg-gradient-to-t from-white/5 to-white/10 rounded-t-xl relative overflow-hidden transition-all duration-500 group-hover:from-[#ec5b13]/50 group-hover:to-[#ec5b13]"
											style={{ height: `${item.value}%` }}
										>
											<div className="absolute inset-0 bg-gradient-to-t from-[#ec5b13] to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
										</div>
										<div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
											<span className="text-[10px] md:text-xs font-bold text-[#ec5b13] bg-black/80 px-2 md:px-3 py-1 rounded-lg">
												{item.amount}
											</span>
										</div>
									</div>
									<span className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-wider">
										{item.label}
									</span>
								</div>
							))}
						</div>

						{/* Grid Lines */}
						<div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
							{[100, 75, 50, 25, 0].map((val) => (
								<div key={val} className="w-full h-px bg-white/5"></div>
							))}
						</div>
					</div>

					{/* Stats Summary */}
					<div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/5">
						<div>
							<p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider mb-1 md:mb-2">
								Total Revenue
							</p>
							<p className="text-base md:text-xl font-bold text-white">
								₵77.5K
							</p>
						</div>
						<div>
							<p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider mb-1 md:mb-2">
								Avg Order
							</p>
							<p className="text-base md:text-xl font-bold text-[#ec5b13]">
								₵15.5K
							</p>
						</div>
						<div>
							<p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider mb-1 md:mb-2">
								Growth
							</p>
							<p className="text-base md:text-xl font-bold text-green-400">
								+23%
							</p>
						</div>
					</div>
				</div>

				{/* Broadcast Panel */}
				<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ec5b13] to-[#d94e0f] p-6 md:p-10 text-black">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>

					<div className="relative">
						<svg
							className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 opacity-80"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
							/>
						</svg>

						<h3 className="text-xl md:text-2xl font-light tracking-tight leading-tight mb-2 md:mb-3">
							Vault <br className="hidden md:block" />
							<span className="font-serif italic">Broadcast</span>
						</h3>
						<p className="text-[10px] md:text-xs font-medium uppercase tracking-wider opacity-70 mb-6 md:mb-8">
							Send updates to all active clients
						</p>

						<textarea
							placeholder="Write your announcement..."
							className="w-full bg-black/10 backdrop-blur-sm border border-black/10 rounded-2xl p-4 md:p-5 text-sm placeholder:text-black/40 h-28 md:h-32 resize-none mb-4 md:mb-6 outline-none focus:bg-black/20 transition-all"
						></textarea>

						<button className="w-full bg-black text-white py-3 md:py-4 rounded-xl font-medium uppercase text-[10px] md:text-xs tracking-wider hover:bg-black/90 active:scale-[0.98] transition-all shadow-lg">
							Send Broadcast
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Analytics;
