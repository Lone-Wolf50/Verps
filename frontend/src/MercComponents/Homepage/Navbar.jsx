import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../MercComponents/Cartoptions/CartContext";
import logo from "../../assets/V - 1.png";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { cart } = useCart();
	const location = useLocation();

	const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
	}, [isMenuOpen]);

	const navLinks = [
		{ name: "About", path: "/about", icon: "info" },
		{ name: "Orders", path: "/orderpage", icon: "inventory_2" },
		{
			name: `Bag (${itemCount})`,
			path: "/cart",
			icon: "shopping_bag",
			isCart: true,
		},
		{ name: "Inbox", path: "/inbox", icon: "mail" },
		{ name: "Support", path: "/support", icon: "support_agent" },
		{ name: "Reviews", path: "/reviews", icon: "star" },
	];

	return (
		<>
			{/* Increased navbar height with better proportions */}
			<nav className="fixed top-0 left-0 w-full z-[100] glass-nav px-6 md:px-12 py-2 md:py-3 flex items-center justify-between">
				<div className="flex items-center gap-12">
					<Link to="/" className="flex items-center">
						<div className="h-16 md:h-20 w-auto">
							<img
								src={logo}
								alt="Logo"
								className="h-full w-auto object-contain invert brightness-200"
							/>
						</div>
					</Link>

					{/* PC & TABLET */}
					<div className="hidden md:flex items-center gap-8">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								to={link.path}
								className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative ${
									location.pathname === link.path
										? "text-[#ec5b13]"
										: "text-white/60 hover:text-[#ec5b13]"
								}`}
							>
								{link.name}
								{link.isCart && itemCount > 0 && (
									<span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-[#ec5b13] rounded-full animate-pulse"></span>
								)}
							</Link>
						))}
					</div>
				</div>

				<div className="flex items-center gap-2 md:gap-4">
					<button className="p-2 text-white/70 hover:text-[#ec5b13] transition-colors">
						<span className="material-symbols-outlined text-[26px] md:text-[28px]">
							search
						</span>
					</button>

					<Link
						to="/cart"
						className="p-2 text-white/70 hover:text-[#ec5b13] transition-colors relative"
					>
						<span className="material-symbols-outlined text-[26px] md:text-[28px]">
							shopping_bag
						</span>
						{itemCount > 0 && (
							<span className="absolute top-1 right-1 bg-[#ec5b13] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center scale-90">
								{itemCount}
							</span>
						)}
					</Link>

					<button
						onClick={() => setIsMenuOpen(true)}
						className="md:hidden p-2 text-white hover:text-[#ec5b13] transition-colors"
					>
						<span className="material-symbols-outlined text-[30px]">menu</span>
					</button>
				</div>
			</nav>

			{/* FIXED MOBILE MENU SYSTEM - No Overflow */}
			<div
				className={`fixed inset-0 z-[200] ${
					isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
				}`}
			>
				{/* Backdrop */}
				<div
					className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
						isMenuOpen ? "opacity-100" : "opacity-0"
					}`}
					onClick={() => setIsMenuOpen(false)}
				></div>

				{/* Sidebar Panel - Fixed overflow with proper scrolling */}
				<div
					className={`absolute top-4 right-4 bottom-4 w-[88%] max-w-sm glass-panel flex flex-col overflow-hidden ${
						isMenuOpen ? "is-active" : ""
					}`}
				>
					{/* Header - Fixed at top */}
					<div className="flex-shrink-0 p-6 pb-4 flex justify-end border-b border-white/5">
						<button
							onClick={() => setIsMenuOpen(false)}
							className="text-white/40 hover:text-white transition-all transform active:scale-90"
						>
							<span className="material-symbols-outlined text-3xl p-2 bg-white/5 rounded-full border border-white/10">
								close
							</span>
						</button>
					</div>

					{/* Scrollable Content Area */}
					<div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
						<div className="mb-8">
							<p className="text-[#ec5b13] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
								Guest Mode
							</p>
							<h2 className="text-4xl font-[900] italic uppercase text-white tracking-tighter leading-none">
								The Guest
							</h2>
							<div className="h-[2px] w-12 bg-[#ec5b13] mt-4"></div>
						</div>

						<div className="flex flex-col gap-6 mb-8">
							{navLinks.map((link, idx) => (
								<Link
									key={link.name}
									to={link.path}
									onClick={() => setIsMenuOpen(false)}
									className={`flex items-center gap-6 group transition-all duration-500 ${
										isMenuOpen
											? "translate-x-0 opacity-100"
											: "translate-x-10 opacity-0"
									}`}
									style={{
										transitionDelay: isMenuOpen ? `${idx * 50}ms` : "0ms",
									}}
								>
									<span
										className={`material-symbols-outlined text-2xl transition-all duration-300 ${
											location.pathname === link.path
												? "text-[#ec5b13]"
												: "text-white/30 group-hover:text-[#ec5b13]"
										}`}
									>
										{link.icon}
									</span>
									<span
										className={`text-base font-bold uppercase tracking-widest transition-all ${
											location.pathname === link.path
												? "text-white"
												: "text-white/60 group-hover:text-white"
										}`}
									>
										{link.name}
									</span>
								</Link>
							))}
						</div>
					</div>

					{/* Footer - Fixed at bottom */}
					<div className="flex-shrink-0 p-6 pt-4 border-t border-white/5 flex flex-col gap-3">
						<Link
							to="/login"
							onClick={() => setIsMenuOpen(false)}
							className="w-full bg-[#ec5b13] text-black font-black uppercase py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-white active:scale-95 shadow-lg shadow-[#ec5b13]/20 text-sm"
						>
							<span className="material-symbols-outlined font-bold text-xl">
								login
							</span>
							SIGN IN TO LOGIN
						</Link>
						<button
							onClick={() => setIsMenuOpen(false)}
							className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-red-500/20 hover:border-red-500/50 active:scale-95 text-xs tracking-wide"
						>
							<span className="material-symbols-outlined text-lg">
								delete_forever
							</span>
							TERMINATE ACCOUNT
						</button>
						<p className="text-center text-[8px] text-white/10 mt-1 tracking-[0.4em] uppercase font-bold">
							Verp Series 2026
						</p>
					</div>
				</div>
			</div>

			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(255, 255, 255, 0.02);
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(236, 91, 19, 0.3);
					border-radius: 2px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(236, 91, 19, 0.5);
				}
			`}</style>
		</>
	);
};

export default Navbar;
