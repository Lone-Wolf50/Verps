import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useCart } from "../Cartoptions/CartContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderPage = () => {
	const navigate = useNavigate();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("active");
	const [now, setNow] = useState(new Date());
	const { addToCart } = useCart();

	useEffect(() => {
		fetchOrders();
		const timer = setInterval(() => setNow(new Date()), 60000);
		return () => clearInterval(timer);
	}, []);

	const fetchOrders = async () => {
		const { data, error } = await supabase
			.from("verp_orders")
			.select("*")
			.order("created_at", { ascending: false });
		if (!error) setOrders(data);
		setLoading(false);
	};

	const handleReacquire = (items) => {
		items.forEach((item) => {
			addToCart({
				id: item.id,
				name: item.name,
				price: item.price,
				image: item.image,
				quantity: item.quantity,
			});
		});
	};

	const STATUS_CONFIG = {
		ordered: {
			color: "#a78bfa",
			glow: "#7c3aed",
			bg: "rgba(167,139,250,0.08)",
			border: "rgba(167,139,250,0.25)",
		},
		pending: {
			color: "#facc15",
			glow: "#ca8a04",
			bg: "rgba(250,204,21,0.07)",
			border: "rgba(250,204,21,0.2)",
		},
		processing: {
			color: "#38bdf8",
			glow: "#0284c7",
			bg: "rgba(56,189,248,0.07)",
			border: "rgba(56,189,248,0.2)",
		},
		shipped: {
			color: "#34d399",
			glow: "#059669",
			bg: "rgba(52,211,153,0.07)",
			border: "rgba(52,211,153,0.2)",
		},
		delivered: {
			color: "#ec5b13",
			glow: "#c44a0c",
			bg: "rgba(236,91,19,0.07)",
			border: "rgba(236,91,19,0.22)",
		},
		returned: {
			color: "#fb923c",
			glow: "#ea580c",
			bg: "rgba(251,146,60,0.06)",
			border: "rgba(251,146,60,0.18)",
		},
		cancelled: {
			color: "#f87171",
			glow: "#dc2626",
			bg: "rgba(248,113,113,0.05)",
			border: "rgba(248,113,113,0.15)",
		},
	};

	const getReturnMetrics = (deliveredAt) => {
		if (!deliveredAt)
			return {
				opacity: 0.2,
				timeLeft: "SYNC PENDING",
				expired: false,
				noTimestamp: true,
			};
		const deliveryTime = new Date(deliveredAt).getTime();
		const expiryTime = deliveryTime + 48 * 60 * 60 * 1000;
		const remaining = expiryTime - now.getTime();
		if (remaining <= 0)
			return { opacity: 0.1, timeLeft: "EXPIRED", expired: true };
		const ratio = remaining / (48 * 60 * 60 * 1000);
		return {
			opacity: Math.max(0.2, ratio),
			timeLeft: `${Math.floor(remaining / 3600000)}H ${Math.floor((remaining % 3600000) / 60000)}M LEFT`,
			expired: false,
		};
	};

	const filteredOrders = orders.filter((o) => {
		const status = o.status?.toLowerCase();
		if (activeTab === "active")
			return ["ordered", "pending", "processing", "shipped"].includes(status);
		if (activeTab === "history")
			return ["delivered", "returned", "cancelled"].includes(status);
		return true;
	});

	if (loading)
		return (
			<div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
				<div className="w-10 h-10 border border-[#ec5b13]/30 border-t-[#ec5b13] rounded-full animate-spin"></div>
				<span className="vault-mono text-[#ec5b13] text-[10px] uppercase tracking-[0.6em] animate-pulse">
					Accessing Page...
				</span>
			</div>
		);

	return (
		<div className="vault-page bg-[#0a0a0a] text-white/80 min-h-screen pb-12 px-4 md:px-6 relative grain">
			{/* 1. THE SPACER: Adjust h-20 (mobile) and h-32 (desktop) to match your navbar height */}
			<div className="h-24 md:h-32 w-full" />

			<div
				className="fixed inset-0 pointer-events-none z-0"
				style={{
					background:
						"radial-gradient(ellipse 70% 50% at 50% 0%, rgba(236,91,19,0.06) 0%, transparent 70%)",
				}}
			></div>

			<div className="max-w-5xl mx-auto relative z-10 space-y-6 md:space-y-10">
				{/* Header Section */}
				<header className="fade-up">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-8 h-[1px] bg-[#ec5b13]"></div>
						<span className="text-[8px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
							Orders Log
						</span>
					</div>

					<div className="flex items-center gap-4 md:gap-6">
						<button
							onClick={() => navigate(-1)}
							className="p-3 rounded-xl border border-white/5 bg-white/[0.03] hover:border-[#ec5b13]/40 transition-all group"
						>
							<ArrowLeft className="w-5 h-5 text-[#ec5b13] group-hover:-translate-x-1 transition-transform" />
						</button>

						<h1 className="text-4xl md:text-7xl font-light tracking-tighter">
							Your{" "}
							<span className="font-serif italic text-[#ec5b13]">Orders</span>
						</h1>
					</div>
				</header>

				{/* Tab Bar */}
				<div className="fade-up" style={{ animationDelay: "0.1s" }}>
					<div className="inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl">
						{["active", "history"].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`relative px-5 md:px-8 py-2 md:py-3 rounded-lg vault-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
									activeTab === tab ? "text-black font-bold" : "text-white/40"
								}`}
							>
								{activeTab === tab && (
									<div className="absolute inset-0 bg-[#ec5b13] shadow-[0_0_15px_rgba(236,91,19,0.3)] z-0"></div>
								)}
								<span className="relative z-10">{tab}</span>
							</button>
						))}
					</div>
				</div>

				{/* Orders List */}
				<div key={activeTab} className="tab-panel space-y-6">
					{filteredOrders.length === 0 ? (
						<div className="text-center py-16 border border-dashed border-white/5 rounded-[2rem]">
							<h3 className="vault-display text-2xl text-white/10 tracking-widest uppercase">
								Empty_Orders
							</h3>
						</div>
					) : (
						filteredOrders.map((order, idx) => {
							const statusKey = order.status?.toLowerCase() || "ordered";
							const conf = STATUS_CONFIG[statusKey];
							const isActive = [
								"ordered",
								"pending",
								"processing",
								"shipped",
							].includes(statusKey);
							const metrics = getReturnMetrics(order.delivered_at);

							return (
								<div
									key={order.id}
									className="card-hover fade-up relative rounded-[1.5rem] md:rounded-[2.5rem] border overflow-hidden transition-all"
									style={{
										animationDelay: `${idx * 0.05}s`,
										background: `linear-gradient(135deg, ${conf.bg} 0%, rgba(255,255,255,0.01) 100%)`,
										borderColor: conf.border,
									}}
								>
									<div className="p-5 md:p-10">
										<div className="flex items-center justify-between mb-6">
											<div className="flex items-center gap-3">
												<div
													className="flex items-center gap-2 px-3 py-1 rounded-full border bg-black/20"
													style={{ borderColor: `${conf.color}25` }}
												>
													<div
														className={`w-1 h-1 rounded-full ${isActive ? "status-dot-pulse" : ""}`}
														style={{ backgroundColor: conf.color }}
													></div>
													<span
														className="vault-mono text-[9px] font-bold uppercase tracking-wider"
														style={{ color: conf.color }}
													>
														{order.status}
													</span>
												</div>
												<span className="vault-mono text-white/20 text-[8px] tracking-widest hidden xs:inline">
													#{order.order_number}
												</span>
											</div>
											<span className="vault-mono text-[9px] text-white/30 uppercase">
												{new Date(order.created_at).toLocaleDateString()}
											</span>
										</div>

										<div className="flex flex-col lg:flex-row gap-6">
											<div className="flex-1">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													{order.items?.map((item, i) => (
														<div
															key={i}
															className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
														>
															<img
																src={item.image}
																alt=""
																className="w-10 h-10 object-cover rounded-lg border border-white/10"
															/>
															<div className="min-w-0">
																<h4 className="text-[10px] font-bold uppercase truncate">
																	{item.name}
																</h4>
																<p className="vault-mono text-[8px] text-white/30">
																	QTY: {item.quantity}
																</p>
															</div>
														</div>
													))}
												</div>
											</div>

											<div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-6 lg:pt-0 lg:pl-8">
												<label className="vault-mono text-[8px] text-white/20 uppercase tracking-[0.3em] block mb-1">
													Total Amount
												</label>
												<div className="vault-display text-3xl md:text-5xl tracking-tight text-white/90 mb-6">
													GH&#8373;{" "}
													{Number(order.total_amount).toLocaleString()}
												</div>

												<div className="space-y-2">
													{statusKey === "delivered" ? (
														<>
															<button
																disabled={metrics.expired}
																className={`w-full py-3 rounded-xl vault-mono text-[8px] uppercase tracking-widest transition-all ${!metrics.expired ? "text-[#ec5b13] border border-[#ec5b13]/30 hover:bg-[#ec5b13] hover:text-black" : "text-white/10 border border-white/5 cursor-not-allowed"}`}
															>
																{metrics.expired
																	? "Window Closed"
																	: `Return (${metrics.timeLeft})`}
															</button>
															<button
																onClick={() => handleReacquire(order.items)}
																className="w-full py-3 rounded-xl vault-mono text-[8px] uppercase tracking-widest text-white/40 border border-white/10 hover:bg-white/05 transition-all"
															>
																↺ Re-Order
															</button>
														</>
													) : (
														<div className="py-3 px-4 rounded-xl border border-white/[0.03] bg-white/[0.01] text-center">
															<p className="vault-mono text-[8px] text-white/20 uppercase tracking-widest">
																{isActive
																	? "Status Monitoring Active"
																	: "Archive Finalized"}
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<style jsx>{`
				.status-dot-pulse {
					animation: status-pulse 2.2s ease-in-out infinite;
				}
				@keyframes status-pulse {
					0%,
					100% {
						opacity: 1;
						filter: brightness(1.2);
					}
					50% {
						opacity: 0.4;
						filter: brightness(0.8);
					}
				}
				.fade-up {
					animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
				}
				@keyframes fade-up {
					from {
						opacity: 0;
						transform: translateY(15px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.grain::after {
					content: "";
					position: fixed;
					inset: 0;
					background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
					pointer-events: none;
					z-index: 5; /* Lowered z-index so it doesn't block Navbar */
					opacity: 0.5;
				}
			`}</style>
		</div>
	);
};

export default OrderPage;
