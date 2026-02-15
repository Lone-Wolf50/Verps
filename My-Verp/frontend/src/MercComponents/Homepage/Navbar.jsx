import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/V - 1.png";

const Navbar = () => (
	<nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 px-6 md:px-12 py-4 flex items-center justify-between">
		<div className="flex items-center gap-12">
			{/* BRANDED LOGO - INCREASED SIZE */}
			<Link to="/" className="flex items-center group cursor-pointer">
				<div className="relative h-14 w-auto">
					{" "}
					{/* Increased from h-10 to h-14 */}
					<img
						src={logo}
						alt="Verp Logo"
						className="h-full w-auto object-contain transition-all duration-500 group-hover:scale-105 invert brightness-200"
					/>
				</div>
				{/* Removed the separate text span since the brand name is inside the logo image */}
			</Link>

			<div className="hidden lg:flex items-center gap-8">
				{["Shop", "Lookbook", "Sustainability", "Support"].map((link) => (
					<Link
						key={link}
						to={link === "Shop" ? "/" : "#"}
						className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-[#ec5b13] transition-colors"
					>
						{link}
					</Link>
				))}
			</div>
		</div>

		<div className="flex items-center gap-6">
			{/* Search Bar */}
			<div className="hidden md:flex items-center bg-neutral-900 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-[#ec5b13]/50 transition-all">
				<span className="material-symbols-outlined text-white/50 text-sm">
					search
				</span>
				<input
					className="bg-transparent border-none focus:ring-0 text-sm w-32 placeholder:text-white/30 text-white outline-none"
					placeholder="Search collection..."
					type="text"
				/>
			</div>

			<div className="flex items-center gap-4">
				<button className="text-white hover:text-[#ec5b13] transition-colors">
					<span className="material-symbols-outlined">shopping_bag</span>
				</button>
				<button className="text-white hover:text-[#ec5b13] transition-colors">
					<span className="material-symbols-outlined">person</span>
				</button>
				<button className="lg:hidden text-white hover:text-[#ec5b13] transition-colors">
					<span className="material-symbols-outlined">menu</span>
				</button>
			</div>
		</div>
	</nav>
);

export default Navbar;
