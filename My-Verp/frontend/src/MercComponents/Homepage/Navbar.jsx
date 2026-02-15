import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/V - 1.png";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Lock body scroll when menu is active
	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
	}, [isMenuOpen]);

	const navLinks = [
		{ name: "Inbox", path: "/inbox", icon: "mail" },
		{ name: "Collection", path: "/", icon: "grid_view" },
		{ name: "Bag (0)", path: "/cart", icon: "shopping_bag" },
		{ name: "Support", path: "/support", icon: "support_agent" },
		{ name: "Reviews", path: "/reviews", icon: "star" },
	];

	return (
		<>
			{/* MAIN NAVBAR */}
			<nav className="fixed top-0 left-0 w-full z-[100] glass-nav px-6 md:px-12 py-2 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Link to="/" className="flex items-center">
						<div className="h-14 w-auto">
							<img
								src={logo}
								alt="Logo"
								className="h-full w-auto object-contain invert brightness-200"
							/>
						</div>
					</Link>
				</div>

				{/* RIGHT ICONS: Search, Bag, and Menu */}
				<div className="flex items-center gap-2 md:gap-4">
					<button className="p-2 text-white/70 hover:text-[#ec5b13] transition-colors">
						<span className="material-symbols-outlined text-[26px]">
							search
						</span>
					</button>

					{/* ADDED: Shopping Bag back in the middle */}
					<Link
						to="/cart"
						className="p-2 text-white/70 hover:text-[#ec5b13] transition-colors"
					>
						<span className="material-symbols-outlined text-[26px]">
							shopping_bag
						</span>
					</Link>

					<button
						onClick={() => setIsMenuOpen(true)}
						className="p-2 text-white hover:text-[#ec5b13] transition-colors"
					>
						<span className="material-symbols-outlined text-[30px]">menu</span>
					</button>
				</div>
			</nav>

			{/* FLOATING MENU SYSTEM */}
			<div
				className={`fixed inset-0 z-[200] transition-all duration-500 ${isMenuOpen ? "visible" : "invisible"}`}
			>
				{/* Backdrop Overlay */}
				<div
					className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
					onClick={() => setIsMenuOpen(false)}
				></div>

				{/* The Shaped Frosted Panel */}
				<div
					className={`absolute top-4 right-4 bottom-4 w-[88%] max-w-sm glass-panel
                    p-8 flex flex-col transition-all duration-500 ease-in-out
                    ${isMenuOpen ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95"}`}
				>
					{/* Close Header */}
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

					{/* Identity Section */}
					<div className="mb-10">
						<p className="text-[#ec5b13] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
							Guest Mode
						</p>
						<h2 className="text-4xl font-[900] italic uppercase text-white tracking-tighter leading-none">
							The Guest
						</h2>
						<div className="h-[2px] w-12 bg-[#ec5b13] mt-4"></div>
					</div>

					{/* Nav Links */}
					<div className="flex flex-col gap-6">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								to={link.path}
								onClick={() => setIsMenuOpen(false)}
								className="flex items-center gap-6 group"
							>
								<span className="material-symbols-outlined text-white/30 group-hover:text-[#ec5b13] text-2xl transition-all duration-300">
									{link.icon}
								</span>
								<span className="text-lg font-bold uppercase tracking-widest text-white/80 group-hover:text-white">
									{link.name}
								</span>
							</Link>
						))}
					</div>

					<div className="flex-grow"></div>

					{/* Bottom Actions */}
					<div className="pt-6 border-t border-white/10 flex flex-col gap-4">
						<Link
							to="/login"
							onClick={() => setIsMenuOpen(false)}
							className="w-full bg-[#ec5b13] text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-white active:scale-95"
						>
							<span className="material-symbols-outlined font-bold">login</span>
							SIGN IN TO LOGIN
						</Link>

						<button
							className="w-full py-2 text-[10px] font-bold text-white/20 hover:text-red-500/60 uppercase tracking-[0.2em] transition-colors"
							onClick={() => console.log("Account Terminated")}
						>
							Terminate Account
						</button>

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
