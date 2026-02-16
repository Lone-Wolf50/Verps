const footerLinks = {
	Explore: ["All Products", "New Arrivals", "Bestsellers", "Collaborations"],
	Company: ["About Us", "Sustainability", "Press", "Careers"],
	Support: [
		"Shipping & Returns",
		"Size Guide",
		"Contact Us",
		"Terms of Service",
	],
};

const Footer = () => (
	<footer className="bg-background-dark pt-24 pb-12 border-t border-white/5 px-6 md:px-12">
		<div className="max-w-[1400px] mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
				{/* Brand Section */}
				<div>
					<div className="flex items-center gap-2 mb-8">
						<span className="material-symbols-outlined text-primary text-3xl">
							token
						</span>
						<span className="text-2xl font-800 tracking-tighter uppercase">
							Verp
						</span>
					</div>
					<p className="text-white/40 leading-relaxed text-sm mb-8">
						Elevating the every day through premium craftsmanship and a
						commitment to minimalist luxury. Designed in London, worn globally.
					</p>
					<div className="flex gap-4">
						{["public", "camera", "share"].map((icon) => (
							<a
								key={icon}
								href="#"
								className="w-10 h-10 rounded-full bg-neutral-dark border border-white/5 flex items-center justify-center text-white/60 hover:text-primary transition-colors"
							>
								<span className="material-symbols-outlined text-xl">
									{icon}
								</span>
							</a>
						))}
					</div>
				</div>

				{/* Dynamic Link Sections */}
				{Object.entries(footerLinks).map(([title, links]) => (
					<div key={title}>
						<h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">
							{title}
						</h4>
						<ul className="space-y-4">
							{links.map((link) => (
								<li key={link}>
									<a
										className="text-white/40 hover:text-primary text-sm transition-colors"
										href="#"
									>
										{link}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>

			{/* Bottom Bar */}
			<div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
				<p className="text-white/20 text-[10px] uppercase tracking-widest">
					© 2024 Verp Collective. All Rights Reserved.
				</p>
				<div className="flex gap-8">
					<span className="text-white/20 text-[10px] uppercase tracking-widest italic">
						Metallic Finish v1.2
					</span>
					<span className="text-white/20 text-[10px] uppercase tracking-widest italic">
						Designed for Excellence
					</span>
				</div>
			</div>
		</div>
	</footer>
);

export default Footer;
