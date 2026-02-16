import React, { useState } from "react";

const Inventory = ({ products = [], onEdit, onDelete }) => {
	// Local state to track which item is currently being deleted in the backend
	const [isDeleting, setIsDeleting] = useState(null);

	const handleDeleteClick = async (id) => {
		console.log("UI: Delete button clicked for ID:", id);

		// We removed window.confirm here because the Parent
		// (AdminDashBoard) handles the fancy SweetAlert confirmation.

		try {
			setIsDeleting(id);
			console.log("UI: Handing off ID to Parent Dashboard...");

			// This calls the handleDelete in AdminDashBoard.js
			await onDelete(id);

			console.log("UI: Dashboard reported success.");
		} catch (error) {
			// This catches if the user clicks "Cancel" in the fancy alert
			// or if the network fails.
			console.log("UI: Deletion process stopped or failed:", error.message);
		} finally {
			setIsDeleting(null);
		}
	};
	// Empty State View
	if (products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 md:p-20 rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/[0.01] to-transparent mx-4 md:mx-0">
				<svg
					className="w-16 h-16 md:w-20 md:h-20 text-white/10 mb-4 md:mb-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1}
						d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
					/>
				</svg>
				<p className="text-xs md:text-sm font-medium text-white/30 tracking-wide">
					No products in vault
				</p>
				<p className="text-[10px] text-white/20 mt-2">
					Add your first masterpiece to get started
				</p>
			</div>
		);
	}

	return (
		<div className="px-4 md:px-0">
			{/* Desktop Table View */}
			<div className="hidden lg:block relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-white/5 uppercase text-[10px] tracking-[0.2em] font-bold text-white/50">
							<tr>
								<th className="p-6 font-bold">Product</th>
								<th className="p-6 font-bold">Category</th>
								<th className="p-6 font-bold">Price</th>
								<th className="p-6 font-bold text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{products.map((item) => (
								<tr
									key={item.id}
									className={`transition-colors group ${isDeleting === item.id ? "opacity-50 pointer-events-none" : "hover:bg-white/[0.02]"}`}
								>
									<td className="p-6">
										<div className="flex items-center gap-4">
											<div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/5">
												<img
													src={item.image_url}
													className="w-full h-full object-cover"
													alt={item.name}
												/>
											</div>
											<div>
												<p className="font-medium text-sm tracking-wide text-white">
													{item.name}
												</p>
												<p className="text-[10px] text-[#ec5b13]/60 uppercase tracking-widest mt-0.5 font-bold">
													{item.series || "Standard Edition"}
												</p>
											</div>
										</div>
									</td>
									<td className="p-6">
										<span className="text-xs text-white/60 font-medium uppercase tracking-wide">
											{item.category}
										</span>
									</td>
									<td className="p-6">
										<span className="text-sm font-bold text-[#ec5b13]">
											GH₵ {item.price}
										</span>
									</td>
									<td className="p-6">
										<div className="flex gap-2 justify-end">
											<button
												onClick={() => onEdit(item)}
												className="p-2.5 hover:bg-white/5 rounded-lg transition-all group/btn"
												title="Edit Product"
											>
												<svg
													className="w-4 h-4 text-white/40 group-hover/btn:text-white"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
											</button>
											<button
												onClick={() => handleDeleteClick(item.id)}
												disabled={isDeleting !== null}
												className="p-2.5 hover:bg-red-500/10 rounded-lg transition-all group/btn flex items-center justify-center min-w-[40px]"
											>
												{isDeleting === item.id ? (
													<div className="w-4 h-4 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
												) : (
													<svg
														className="w-4 h-4 text-white/40 group-hover/btn:text-red-500 transition-colors"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												)}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Mobile/Tablet Card View */}
			<div className="lg:hidden space-y-4">
				{products.map((item) => (
					<div
						key={item.id}
						className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-5 transition-opacity ${isDeleting === item.id ? "opacity-50" : "opacity-100"}`}
					>
						<div className="flex gap-4">
							<div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/5">
								<img
									src={item.image_url}
									className="w-full h-full object-cover"
									alt={item.name}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-medium text-sm tracking-wide text-white truncate">
									{item.name}
								</h3>
								<p className="text-[9px] text-[#ec5b13]/60 uppercase tracking-widest mt-0.5 font-bold">
									{item.series || "Standard"}
								</p>
								<div className="flex items-center gap-3 mt-3">
									<span className="text-xs text-white/50 font-medium uppercase tracking-wide">
										{item.category}
									</span>
									<span className="w-1 h-1 rounded-full bg-white/20"></span>
									<span className="text-sm font-bold text-[#ec5b13]">
										GH₵ {item.price}
									</span>
								</div>
							</div>
						</div>

						<div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
							<button
								onClick={() => onEdit(item)}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-medium text-white/60 hover:text-white uppercase tracking-wide"
							>
								Edit
							</button>
							<button
								onClick={() => handleDeleteClick(item.id)}
								disabled={isDeleting !== null}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all text-xs font-medium text-white/60 hover:text-red-500 uppercase tracking-wide"
							>
								{isDeleting === item.id ? "Processing..." : "Delete"}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Inventory;
