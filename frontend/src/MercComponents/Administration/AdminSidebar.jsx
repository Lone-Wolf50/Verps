import React, { useState } from "react";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
	const [isOpen, setIsOpen] = useState(false);

	const menuItems = [
		{ id: "inventory", name: "Vault Inventory", icon: "inventory_2" },
		{ id: "add-product", name: "Add Product", icon: "add_circle" },
		{ id: "categories", name: "Manage Categories", icon: "grid_view" },
		{ id: "requests", name: "Client Requests", icon: "hub" },
		{ id: "inbox", name: "Inbox", icon: "mail" },
		{ id: "analytics", name: "Analytics", icon: "analytics" },
	];

	return (
		<>
			{/* Mobile Header */}
			<div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-4 flex justify-between items-center z-[200]">
				<h2 className="text-[#ec5b13] font-black tracking-widest text-xs uppercase">
					Verp Admin
				</h2>
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="material-symbols-outlined text-white text-3xl"
				>
					{isOpen ? "close" : "menu"}
				</button>
			</div>

			{/* Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/80 z-[140] lg:hidden"
					onClick={() => setIsOpen(false)}
				></div>
			)}

			<aside
				className={`fixed top-0 left-0 h-screen w-64 bg-[#080808] border-r border-white/5 flex flex-col z-[150] transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="p-8">
					<h2 className="text-[#ec5b13] font-black tracking-[0.3em] uppercase text-xs italic">
						Verp Vault
					</h2>
				</div>

				<nav className="flex-grow px-4 space-y-2">
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => {
								setActiveTab(item.id);
								setIsOpen(false);
							}}
							className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
								activeTab === item.id
									? "bg-[#ec5b13] text-black font-black"
									: "text-white/40 hover:bg-white/5 hover:text-white"
							}`}
						>
							<span className="material-symbols-outlined">{item.icon}</span>
							<span className="text-[10px] uppercase tracking-widest">
								{item.name}
							</span>
						</button>
					))}
				</nav>

				<div className="p-6 border-t border-white/5">
					<button className="w-full flex items-center gap-4 px-4 py-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
						<span className="material-symbols-outlined">logout</span>
						<span className="text-[10px] uppercase font-black tracking-widest">
							Logout
						</span>
					</button>
				</div>
			</aside>
		</>
	);
};

export default AdminSidebar;
