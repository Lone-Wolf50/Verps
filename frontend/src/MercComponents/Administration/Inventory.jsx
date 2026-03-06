import React, { useState } from "react";

const Inventory = ({ products = [], onEdit, onDelete }) => {
	const [isDeleting, setIsDeleting] = useState(null);
	const [search, setSearch] = useState("");

	const handleDeleteClick = async (id) => {
		try {
			setIsDeleting(id);
			await onDelete(id);
		} catch (error) {
			console.log("UI: Deletion process stopped or failed:", error.message);
		} finally {
			setIsDeleting(null);
		}
	};

	const filtered = products.filter((item) => {
		const q = search.toLowerCase();
		return (
			!q ||
			item.name?.toLowerCase().includes(q) ||
			item.category?.toLowerCase().includes(q) ||
			item.series?.toLowerCase().includes(q)
		);
	});

	// Empty State
	if (products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 md:p-20 rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/[0.01] to-transparent mx-4 md:mx-0">
				<svg className="w-16 h-16 md:w-20 md:h-20 text-white/10 mb-4 md:mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
				</svg>
				<p className="text-xs md:text-sm font-medium text-white/30 tracking-wide">No products in vault</p>
				<p className="text-[10px] text-white/20 mt-2">Add your first masterpiece to get started</p>
			</div>
		);
	}

	return (
		<div className="px-4 md:px-0 space-y-5">
			{/* ── SEARCH BAR ── */}
			<div className="relative">
				<div style={{
					position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
					display: "flex", alignItems: "center", pointerEvents: "none",
				}}>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(236,91,19,0.6)" strokeWidth="2.5">
						<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
					</svg>
				</div>
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search products, categories, series..."
					style={{
						width: "100%",
						background: "rgba(255,255,255,0.02)",
						border: search ? "1px solid rgba(236,91,19,0.4)" : "1px solid rgba(255,255,255,0.07)",
						borderRadius: 14,
						padding: "13px 16px 13px 44px",
						fontFamily: "'DM Sans', sans-serif",
						fontSize: 13,
						color: "rgba(255,255,255,0.85)",
						outline: "none",
						transition: "all 200ms",
						boxSizing: "border-box",
						boxShadow: search ? "0 0 0 3px rgba(236,91,19,0.08)" : "none",
					}}
					onFocus={(e) => {
						e.target.style.borderColor = "rgba(236,91,19,0.5)";
						e.target.style.boxShadow = "0 0 0 3px rgba(236,91,19,0.08)";
					}}
					onBlur={(e) => {
						e.target.style.borderColor = search ? "rgba(236,91,19,0.4)" : "rgba(255,255,255,0.07)";
						e.target.style.boxShadow = search ? "0 0 0 3px rgba(236,91,19,0.08)" : "none";
					}}
				/>
				{search && (
					<button
						onClick={() => setSearch("")}
						style={{
							position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
							background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
							width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
							color: "rgba(255,255,255,0.5)", fontSize: 12,
						}}
					>✕</button>
				)}
			</div>

			{/* Result count */}
			{search && (
				<p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
					{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
				</p>
			)}

			{/* No results */}
			{filtered.length === 0 && search && (
				<div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10">
					<p className="text-xs text-white/30 tracking-widest uppercase">No matches found</p>
					<p className="text-[10px] text-white/15 mt-2">Try a different search term</p>
				</div>
			)}

			{/* Desktop Table View */}
			{filtered.length > 0 && (
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
								{filtered.map((item) => (
									<tr
										key={item.id}
										className={`transition-colors group ${isDeleting === item.id ? "opacity-50 pointer-events-none" : "hover:bg-white/[0.02]"}`}
									>
										<td className="p-6">
											<div className="flex items-center gap-4">
												<div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/5">
													<img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
												</div>
												<div>
													<p className="font-medium text-sm tracking-wide text-white">
														{search ? (
															<HighlightText text={item.name || ""} query={search} />
														) : item.name}
													</p>
													<p className="text-[10px] text-[#ec5b13]/60 uppercase tracking-widest mt-0.5 font-bold">
														{item.series || "Standard Edition"}
													</p>
												</div>
											</div>
										</td>
										<td className="p-6">
											<span className="text-xs text-white/60 font-medium uppercase tracking-wide">
												{search ? <HighlightText text={item.category || ""} query={search} /> : item.category}
											</span>
										</td>
										<td className="p-6">
											<span className="text-sm font-bold text-[#ec5b13]">GH₵ {item.price}</span>
										</td>
										<td className="p-6">
											<div className="flex gap-2 justify-end">
												<button onClick={() => onEdit(item)} className="p-2.5 hover:bg-white/5 rounded-lg transition-all group/btn" title="Edit Product">
													<svg className="w-4 h-4 text-white/40 group-hover/btn:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button onClick={() => handleDeleteClick(item.id)} disabled={isDeleting !== null} className="p-2.5 hover:bg-red-500/10 rounded-lg transition-all group/btn flex items-center justify-center min-w-[40px]">
													{isDeleting === item.id ? (
														<div className="w-4 h-4 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
													) : (
														<svg className="w-4 h-4 text-white/40 group-hover/btn:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
			)}

			{/* Mobile/Tablet Card View */}
			{filtered.length > 0 && (
				<div className="lg:hidden space-y-4">
					{filtered.map((item) => (
						<div
							key={item.id}
							className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-5 transition-opacity ${isDeleting === item.id ? "opacity-50" : "opacity-100"}`}
						>
							<div className="flex gap-4">
								<div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/5">
									<img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-sm tracking-wide text-white truncate">{item.name}</h3>
									<p className="text-[9px] text-[#ec5b13]/60 uppercase tracking-widest mt-0.5 font-bold">{item.series || "Standard"}</p>
									<div className="flex items-center gap-3 mt-3">
										<span className="text-xs text-white/50 font-medium uppercase tracking-wide">{item.category}</span>
										<span className="w-1 h-1 rounded-full bg-white/20"></span>
										<span className="text-sm font-bold text-[#ec5b13]">GH₵ {item.price}</span>
									</div>
								</div>
							</div>
							<div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
								<button onClick={() => onEdit(item)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-medium text-white/60 hover:text-white uppercase tracking-wide">Edit</button>
								<button onClick={() => handleDeleteClick(item.id)} disabled={isDeleting !== null} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all text-xs font-medium text-white/60 hover:text-red-500 uppercase tracking-wide">
									{isDeleting === item.id ? "Processing..." : "Delete"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

/* Highlight matching text */
const HighlightText = ({ text, query }) => {
	if (!query || !text) return <>{text}</>;
	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if (idx === -1) return <>{text}</>;
	return (
		<>
			{text.slice(0, idx)}
			<mark style={{ background: "rgba(236,91,19,0.3)", color: "#ec5b13", borderRadius: 3, padding: "0 2px" }}>
				{text.slice(idx, idx + query.length)}
			</mark>
			{text.slice(idx + query.length)}
		</>
	);
};

export default Inventory;