import React, { useState } from "react";

const ClientRequests = () => {
	const [view, setView] = useState("incoming");
	const [selectedOrder, setSelectedOrder] = useState(null);

	const closeManifest = () => setSelectedOrder(null);

	const orders = [
		{
			id: 1,
			name: "John Doe",
			orderId: "#VERP-9921",
			date: "15 Feb 2026",
			items: 2,
			total: 4500,
			status: "Processing",
		},
		{
			id: 2,
			name: "Sarah Johnson",
			orderId: "#VERP-9922",
			date: "15 Feb 2026",
			items: 1,
			total: 2300,
			status: "Pending",
		},
	];

	return (
		<div className="space-y-6 px-4 md:px-0">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
						Order <span className="font-serif italic text-[#ec5b13]">Flow</span>
					</h2>
					<p className="text-xs text-white/40 mt-2 tracking-wide">
						Manage your order pipeline
					</p>
				</div>
				<div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 w-full md:w-auto">
					<button
						onClick={() => setView("incoming")}
						className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[10px] font-medium uppercase transition-all tracking-wider ${view === "incoming" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"}`}
					>
						<span className="hidden sm:inline">Incoming</span>
						<span className="sm:hidden">In</span> (5)
					</button>
					<button
						onClick={() => setView("outgoing")}
						className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[10px] font-medium uppercase transition-all tracking-wider ${view === "outgoing" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"}`}
					>
						<span className="hidden sm:inline">Outgoing</span>
						<span className="sm:hidden">Out</span> (14)
					</button>
				</div>
			</div>

			{/* Desktop Table View */}
			<div className="hidden lg:block relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
							<tr>
								<th className="p-6 font-bold">Client Details</th>
								<th className="p-6 font-bold">Order ID</th>
								<th className="p-6 font-bold">Items</th>
								<th className="p-6 font-bold">Total Value</th>
								<th className="p-6 font-bold text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{orders.map((order) => (
								<tr
									key={order.id}
									className="hover:bg-white/[0.02] transition-colors group"
								>
									<td className="p-6">
										<p className="font-medium text-sm tracking-wide text-white">
											{order.name}
										</p>
										<p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
											{order.date}
										</p>
									</td>
									<td className="p-6">
										<span className="text-xs text-white/60 font-mono tracking-wide">
											{order.orderId}
										</span>
									</td>
									<td className="p-6">
										<span className="text-xs text-white/60">
											{order.items} Items
										</span>
									</td>
									<td className="p-6">
										<span className="text-sm font-bold text-[#ec5b13]">
											GH₵ {order.total.toLocaleString()}
										</span>
									</td>
									<td className="p-6 text-right">
										<button
											onClick={() => setSelectedOrder(order)}
											className="text-[10px] font-medium text-white/60 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-[#ec5b13] hover:border-[#ec5b13] hover:text-white transition-all uppercase tracking-wider"
										>
											View Details
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Mobile/Tablet Card View */}
			<div className="lg:hidden space-y-4">
				{orders.map((order) => (
					<div
						key={order.id}
						className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-6 space-y-4"
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-medium text-base tracking-wide text-white">
									{order.name}
								</h3>
								<p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
									{order.date}
								</p>
							</div>
							<span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-medium text-white/60 uppercase tracking-wider">
								{order.status}
							</span>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
									Order ID
								</p>
								<p className="text-xs text-white/60 font-mono">
									{order.orderId}
								</p>
							</div>
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
									Items
								</p>
								<p className="text-xs text-white/60">{order.items} Items</p>
							</div>
							<div>
								<p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">
									Total
								</p>
								<p className="text-sm font-bold text-[#ec5b13]">
									GH₵ {order.total.toLocaleString()}
								</p>
							</div>
						</div>

						<button
							onClick={() => setSelectedOrder(order)}
							className="w-full text-[10px] font-medium text-white/60 border border-white/10 px-5 py-3 rounded-xl hover:bg-[#ec5b13] hover:border-[#ec5b13] hover:text-white transition-all uppercase tracking-wider"
						>
							View Full Manifest
						</button>
					</div>
				))}
			</div>

			{/* MANIFEST MODAL - Responsive */}
			{selectedOrder && (
				<div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/90 backdrop-blur-xl">
					<div className="bg-[#0a0a0a] border-t md:border border-white/10 w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl p-6 md:p-10 relative shadow-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
						{/* Close Button */}
						<button
							onClick={closeManifest}
							className="absolute top-6 md:top-8 right-6 md:right-8 text-white/40 hover:text-white transition-colors"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						{/* Header */}
						<div className="mb-8 md:mb-10 pr-10">
							<h3 className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2">
								Manifest{" "}
								<span className="font-serif italic text-[#ec5b13]">
									{selectedOrder.orderId}
								</span>
							</h3>
							<p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
								Client: {selectedOrder.name}
							</p>
						</div>

						<div className="space-y-6 md:space-y-8">
							{/* Status and Details Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
								<div className="space-y-3">
									<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Update Status
									</label>
									<div className="relative group">
										<select className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm text-white/80 uppercase outline-none focus:border-[#ec5b13]/50 focus:bg-black/30 transition-all duration-300 appearance-none cursor-pointer">
											<option>Awaiting Pickup</option>
											<option>In Transit</option>
											<option>Delivered</option>
											<option>Cancelled</option>
										</select>
										<svg
											className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>

								<div className="space-y-3">
									<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em] md:text-right">
										Order Summary
									</label>
									<div className="space-y-2 md:text-right p-6 bg-white/[0.02] rounded-2xl border border-white/5">
										<p className="text-sm text-white/60 tracking-wide">
											<span className="text-white/40">Date:</span>{" "}
											{selectedOrder.date}
										</p>
										<p className="text-sm text-white/60 tracking-wide">
											<span className="text-white/40">Items:</span>{" "}
											{selectedOrder.items}
										</p>
										<p className="text-base font-bold text-[#ec5b13]">
											GH₵ {selectedOrder.total.toLocaleString()}
										</p>
									</div>
								</div>
							</div>

							{/* Message Field */}
							<div className="space-y-3">
								<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									Message Client
								</label>
								<div className="relative group">
									<textarea
										placeholder="Write a message about delivery status..."
										className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#ec5b13]/50 focus:bg-black/30 transition-all duration-300 text-sm tracking-wide font-light h-32 resize-none"
									></textarea>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3">
								<button className="flex-1 px-8 py-4 bg-gradient-to-r from-[#ec5b13] to-[#d94e0f] text-white rounded-2xl font-medium text-xs uppercase tracking-[0.15em] hover:shadow-lg hover:shadow-[#ec5b13]/30 transition-all duration-300 active:scale-[0.98]">
									Update & Notify
								</button>
								<button
									onClick={closeManifest}
									className="flex-1 sm:flex-none px-8 py-4 bg-white/5 border border-white/10 text-white/50 rounded-2xl font-medium text-xs uppercase tracking-[0.15em] hover:bg-white/10 hover:text-white transition-all duration-300"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientRequests;
