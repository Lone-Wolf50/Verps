import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../MercComponents/Cartoptions/CartContext"; // Ensure this path is correct
import logo from "../../assets/V - 1.png";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { cart } = useCart();
	const location = useLocation();

	// Calculate total quantity of items in the bag
	const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
	}, [isMenuOpen]);

	// Dynamic Navigation Links
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
			<nav className="fixed top-0 left-0 w-full z-[100] glass-nav px-6 md:px-12 py-2 flex items-center justify-between">
				<div className="flex items-center gap-12">
					<Link to="/" className="flex items-center">
						<div className="h-14 w-auto">
							<img
								src={logo}
								alt="Logo"
								className="h-full w-auto object-contain invert brightness-200"
							/>
						</div>
					</Link>

					{/* PC & TABLET: Professional List Display */}
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
								{/* Small notification dot for cart on desktop */}
								{link.isCart && itemCount > 0 && (
									<span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-[#ec5b13] rounded-full animate-pulse"></span>
								)}
							</Link>
						))}
					</div>
				</div>

				<div className="flex items-center gap-2 md:gap-4">
					<button className="p-2 text-white/70 hover:text-[#ec5b13] transition-colors">
						<span className="material-symbols-outlined text-[26px]">
							search
						</span>
					</button>

					<Link
						to="/cart"
						className="p-2 text-white/70 hover:text-[#ec5b13] transition-colors relative"
					>
						<span className="material-symbols-outlined text-[26px]">
							shopping_bag
						</span>
						{itemCount > 0 && (
							<span className="absolute top-1 right-1 bg-[#ec5b13] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center scale-90">
								{itemCount}
							</span>
						)}
					</Link>

					{/* Hamburger ONLY for Mobile */}
					<button
						onClick={() => setIsMenuOpen(true)}
						className="md:hidden p-2 text-white hover:text-[#ec5b13] transition-colors"
					>
						<span className="material-symbols-outlined text-[30px]">menu</span>
					</button>
				</div>
			</nav>

			{/* MOBILE MENU SYSTEM */}
			<div
				className={`fixed inset-0 z-[200] transition-all duration-500 ${isMenuOpen ? "visible" : "invisible"}`}
			>
				<div
					className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
					onClick={() => setIsMenuOpen(false)}
				></div>
				<div
					className={`absolute top-4 right-4 bottom-4 w-[88%] max-w-sm glass-panel p-8 flex flex-col transition-all duration-500 ease-in-out ${isMenuOpen ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95"}`}
				>
					<div className="flex justify-end mb-4">
						<button
							onClick={() => setIsMenuOpen(false)}
							className="text-white/40 hover:text-white transition-colors"
						>
							<span className="material-symbols-outlined text-3xl p-2 bg-white/5 rounded-full">
								close
							</span>
						</button>
					</div>

					<div className="mb-10">
						<p className="text-[#ec5b13] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
							Guest Mode
						</p>
						<h2 className="text-4xl font-[900] italic uppercase text-white tracking-tighter leading-none">
							The Guest
						</h2>
						<div className="h-[2px] w-12 bg-[#ec5b13] mt-4"></div>
					</div>

					<div className="flex flex-col gap-6">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								to={link.path}
								onClick={() => setIsMenuOpen(false)}
								className="flex items-center gap-6 group"
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
									className={`text-lg font-bold uppercase tracking-widest transition-all ${
										location.pathname === link.path
											? "text-white"
											: "text-white/80 group-hover:text-white"
									}`}
								>
									{link.name}
								</span>
							</Link>
						))}
					</div>

					<div className="flex-grow"></div>

					<div className="pt-6 border-t border-white/10 flex flex-col gap-4">
						<Link
							to="/login"
							onClick={() => setIsMenuOpen(false)}
							className="w-full bg-[#ec5b13] text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-white active:scale-95"
						>
							<span className="material-symbols-outlined font-bold">login</span>{" "}
							SIGN IN TO LOGIN
						</Link>
						<p className="text-center text-[8px] text-white/10 mt-2 tracking-[0.5em] uppercase font-bold">
							Verp Series 2026
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;
