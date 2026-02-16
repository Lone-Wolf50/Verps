import React, { useState } from "react";
import { Link } from "react-router-dom";

const OrderPage = () => {
	const [activeTab, setActiveTab] = useState("active");

	const orders = [
		{
			id: "#ORD-992104-NX",
			date: "Oct 28, 2023",
			status: "In Transit",
			statusType: "active",
			items: "Limited Edition Runner + 2 items",
			shipping: "Standard Express Shipping",
			total: "$842.00",
			expected: "Expected Nov 02",
			images: [
				"https://lh3.googleusercontent.com/aida-public/AB6AXuCDzCcvfOu0o0HzJ9MGer81_fcNblPzz8fiOZTy7N8WW32qZ60zE_4jTdIn6XFHz7hIf5AByJRyofcBuWR1Mzv41ckIdzOzOOI_DOdG6Rc-H28v3byDLK_6ro3_D_vbC5-TM_DCfMzCflKQGLW7dng-WbDCe-U8RymQqfpulozsjq2tXZmKMKjw_0rg8eft_IZZC0iujumK_LcFcKTS-UwG6PZLik7NCMRXAay5R9OUk7jsVYWE42cwQyRBu2zw0xQLQS-quxaWuxg",
			],
			count: "+1",
		},
		{
			id: "#ORD-988273-NX",
			date: "Oct 15, 2023",
			status: "Delivered",
			statusType: "history",
			items: "Acoustic Pro Wireless Headphones",
			shipping: "Delivered Oct 19, 2023",
			total: "$349.50",
			images: [
				"https://lh3.googleusercontent.com/aida-public/AB6AXuDU-zuxq2cfNGqMeOEPJ53G2CUKBKX5xMUPWmsE6AX_oeHERBYO9qD91RKf6WUvtNOBwHFWjC_trZ5Visxuwz-j5gJVAzPz7WDJIEJKmpYG240qoVmIRlUHBAXB9lBT4ioy3Yq0hQ-Kxx__KB_KiCdLA41C6T21CqofRaqyLCU0TndwqvH9hklTTbNoHYTaBno7kIiF1t1ZkICSbqbzklGjCL4GaAWY-L5V44jRcoP5Ko6JvD5MjY536nBmH1hPC9NvcD8ui2xx0m4",
			],
			count: null,
		},
	];

	const filteredOrders = orders.filter((order) =>
		activeTab === "active"
			? order.statusType === "active"
			: order.statusType === "history",
	);

	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans">
			<main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
				<div className="mb-12">
					<h1 className="text-5xl md:text-7xl font-[900] italic tracking-tight text-white uppercase italic leading-none">
						Your Orders
					</h1>
					<p className="text-white/50 text-lg mt-4 uppercase tracking-widest text-sm">
						Active & History
					</p>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-white/5 gap-10 mb-8 overflow-x-auto pb-px">
					<button
						onClick={() => setActiveTab("active")}
						className={`pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === "active" ? "border-b-2 border-[#ec5b13] text-white" : "text-white/40 hover:text-white"}`}
					>
						Active Orders
					</button>
					<button
						onClick={() => setActiveTab("history")}
						className={`pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === "history" ? "border-b-2 border-[#ec5b13] text-white" : "text-white/40 hover:text-white"}`}
					>
						Order History
					</button>
				</div>

				{/* Orders List */}
				<div className="space-y-6">
					{filteredOrders.map((order, idx) => (
						<div
							key={idx}
							className="glass-panel glass-card-hover rounded-xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start max-md:gap-4 max-md:p-5 transition-all"
						>
							<div className="flex-1 space-y-6 max-md:space-y-3 w-full">
								{/* Header Info */}
								<div className="flex flex-wrap items-center gap-4 max-md:gap-2">
									<div
										className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${order.statusType === "active" ? "bg-[#ec5b13]/20 border border-[#ec5b13]/30" : "bg-white/5 border border-white/10"}`}
									>
										<span
											className={`size-2 rounded-full ${order.statusType === "active" ? "bg-[#ec5b13] animate-pulse" : "bg-white/30"}`}
										></span>
										<span
											className={`${order.statusType === "active" ? "text-[#ec5b13]" : "text-white/40"} text-[10px] font-black uppercase tracking-widest leading-none`}
										>
											{order.status}
										</span>
									</div>
									<h3 className="text-white text-xl font-bold font-mono tracking-tight max-md:text-sm">
										{order.id}
									</h3>
								</div>

								{/* Content */}
								<div className="flex items-center gap-4">
									<div className="flex -space-x-3 overflow-hidden">
										<img
											alt="item"
											className="h-16 w-16 md:h-16 md:w-16 rounded-xl ring-2 ring-[#0d0d0d] object-cover max-md:h-12 max-md:w-12"
											src={order.images[0]}
										/>
										{order.count && (
											<div className="flex h-16 w-16 items-center justify-center rounded-xl ring-2 ring-[#0d0d0d] bg-white/10 text-xs font-bold text-white max-md:h-12 max-md:w-12">
												{order.count}
											</div>
										)}
									</div>
									<div>
										<p className="text-white font-semibold max-md:text-xs">
											{order.items}
										</p>
										<p className="text-white/40 text-sm max-md:text-[10px]">
											{order.shipping}
										</p>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-3 pt-2">
									{order.statusType === "active" && (
										<Link
											to="/Orders/orderStatus"
											className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-2 max-md:px-4 max-md:py-2 max-md:text-[9px] hover:bg-white hover:text-black transition-all"
										>
											<span className="material-symbols-outlined text-sm">
												local_shipping
											</span>
											Track Package
										</Link>
									)}
									<button className="px-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg max-md:px-4 max-md:py-2 max-md:text-[9px]">
										Details
									</button>
								</div>
							</div>

							{/* Price Section */}
							<div className="w-full lg:w-48 lg:border-l lg:border-white/10 lg:pl-8 flex flex-row lg:flex-col justify-between items-center lg:items-start self-stretch max-md:pt-4 max-md:border-t max-md:border-white/5">
								<div>
									<p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
										Total Amount
									</p>
									<p className="text-white text-3xl font-black tracking-tight max-md:text-xl">
										{order.total}
									</p>
								</div>
								{order.expected && (
									<div className="flex items-center gap-2 text-[#ec5b13]">
										<span className="material-symbols-outlined text-sm">
											info
										</span>
										<span className="text-[10px] font-bold uppercase tracking-widest">
											{order.expected}
										</span>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
};

export default OrderPage;
