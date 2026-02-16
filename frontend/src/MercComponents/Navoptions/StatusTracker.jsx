import React from "react";
import { Link } from "react-router-dom";

const StatusTracker = () => {
	// This would typically come from your API based on the Order ID
	const orderData = {
		id: "#LX-88291-77",
		name: "Heritage Chronograph",
		specs: "Saphire Edition • Oyster Steel • Qty: 1",
		price: "$4,850.00",
		date: "Oct 20, 2023",
		estimate: "Oct 24, 2023",
		currentStatus: "In Transit to Regional Hub",
		progress: 70, // percentage
		image:
			"https://lh3.googleusercontent.com/aida-public/AB6AXuBXbw8EdOts39cPE2GMFLbwtJhxMUTiFg33jnayxZEtHA6-y3Hu8uzF068jMbwXEGbqFicFu2-30xXdS4XIvZtT51rWF0mBboOcNqsGgte-FIuFGvxM9tTE7nU3bo412OYTUcbZZ99MIsPJuKv2fuD3R-w2oOcQPjxI2e5bCCzOaUbKukWbvGWH_UMaODVxhZFDaGTzz_94gvKeWMNhqHBCSdD4zhZRWzlYUiSdSuPoD1vDU0zu-xs4DAzk2r9govtJIPb5W8yhNrs",
		address: {
			name: "Julian Thorne",
			street: "72 Berkeley Square",
			city: "Mayfair, London",
			zip: "W1J 6EB, United Kingdom",
		},
	};

	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-6xl mx-auto px-6 pt-32 pb-32">
				{/* Back Button & Header */}
				<div className="mb-10">
					<Link
						to="/Orders/orderpage"
						className="flex items-center gap-2 text-white/40 hover:text-primary transition-all group mb-6"
					>
						<span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">
							arrow_back
						</span>
						<span className="text-[10px] font-black uppercase tracking-[0.2em]">
							Back to Orders
						</span>
					</Link>
					<h1 className="text-4xl md:text-6xl font-[900] italic tracking-tighter uppercase leading-none">
						Track <span className="text-primary">Package</span>
					</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* LEFT: Main Tracking Card */}
					<div className="lg:col-span-8 space-y-6">
						<div className="glass-panel rounded-2xl p-6 md:p-10 border border-white/5 bg-white/[0.02]">
							{/* Compact Item Info */}
							<div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/5">
								<div className="size-20 md:size-24 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
									<img
										className="w-full h-full object-cover"
										src={orderData.image}
										alt="product"
									/>
								</div>
								<div className="flex-1">
									<div className="flex justify-between items-start">
										<div>
											<p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">
												Item Details
											</p>
											<h3 className="text-lg md:text-xl font-bold">
												{orderData.name}
											</h3>
											<p className="text-white/40 text-[10px] uppercase tracking-wider mt-1">
												{orderData.specs}
											</p>
										</div>
										<div className="text-right hidden md:block">
											<p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
												Order ID
											</p>
											<p className="font-mono font-bold text-sm">
												{orderData.id}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Tracking Status */}
							<div className="mb-12">
								<div className="flex justify-between items-end mb-10">
									<div>
										<p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">
											Live Status
										</p>
										<h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">
											{orderData.currentStatus}
										</h4>
									</div>
									<div className="text-right">
										<p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">
											Arrival
										</p>
										<p className="text-lg md:text-xl font-black">
											{orderData.estimate}
										</p>
									</div>
								</div>

								{/* Progress Bar System */}
								<div className="relative py-10 px-2">
									{/* Background Track */}
									<div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2"></div>
									{/* Active Track */}
									<div
										className="absolute top-1/2 left-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(236,91,19,0.5)] -translate-y-1/2 transition-all duration-1000"
										style={{ width: `${orderData.progress}%` }}
									></div>

									{/* Milestones */}
									<div className="relative flex justify-between">
										{[
											{ label: "Ordered", icon: "check", active: true },
											{ label: "Processing", icon: "check", active: true },
											{
												label: "Shipped",
												icon: "local_shipping",
												active: true,
												pulse: true,
											},
											{
												label: "Delivered",
												icon: "inventory_2",
												active: false,
											},
										].map((step, i) => (
											<div key={i} className="flex flex-col items-center">
												<div
													className={`size-6 rounded-full flex items-center justify-center z-10 transition-all 
                                                    ${step.active ? "bg-primary border-4 border-[#0d0d0d]" : "bg-[#1a1a1a] border-4 border-[#0d0d0d]"}
                                                    ${step.pulse ? "ring-8 ring-primary/10 scale-125" : ""}`}
												>
													<span className="material-symbols-outlined text-[10px] font-black text-white">
														{step.icon}
													</span>
												</div>
												<p
													className={`text-[9px] font-black uppercase tracking-[0.2em] mt-4 ${step.active ? "text-white" : "text-white/20"}`}
												>
													{step.label}
												</p>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Info Box */}
							<div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4">
								<span className="material-symbols-outlined text-primary text-sm mt-0.5">
									info
								</span>
								<p className="text-[11px] text-white/60 leading-relaxed uppercase tracking-wider font-medium">
									Your package has cleared customs and is being sorted at our
									Paris facility. International priority transit is currently on
									schedule.
								</p>
							</div>
						</div>
					</div>

					{/* RIGHT: Sidebar Details */}
					<div className="lg:col-span-4 space-y-6">
						<div className="glass-panel rounded-2xl p-6 border border-white/5 bg-white/[0.02]">
							<h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
								Shipping Destination
							</h4>
							<div className="flex gap-4">
								<span className="material-symbols-outlined text-white/20">
									location_on
								</span>
								<div className="text-sm">
									<p className="font-bold text-white mb-2">
										{orderData.address.name}
									</p>
									<p className="text-white/40 leading-relaxed font-medium uppercase text-[11px] tracking-widest">
										{orderData.address.street}
										<br />
										{orderData.address.city}
										<br />
										{orderData.address.zip}
									</p>
								</div>
							</div>
						</div>

						<div className="glass-panel rounded-2xl p-6 border border-white/5 bg-white/[0.02]">
							<h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">
								Payment Summary
							</h4>
							<div className="flex justify-between items-center">
								<span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
									Grand Total
								</span>
								<span className="text-xl font-black">{orderData.price}</span>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default StatusTracker;
