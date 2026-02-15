const Hero = () => {
	return (
		<header className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background-dark">
			{/* Image Container */}
			<div className="absolute inset-0 z-0">
				{/* We use object-top so the head stays visible regardless of screen width */}
				<img
					className="w-full h-full object-cover object-top opacity-60 scale-100"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyJjiXpgDEF4ezbvrKEi9hZ5uksXVmWAnPbBSyCTdMecfDgwfcfzZr67tfS1ypSQub4Bn8-xrjQQrwkTk6vkar2RTp0t6tH8AU8x0Qg0IRlEGBHSIIusurjrrKFt7is0VSh8K3DH--xi7vDgexscsb_gdk5NgD-0JHLG8f9rbwh6PLdv3kRIf_a3ozMgsT_nD7RhZRbzDUcKMCW74EU4CP6zktuzRKd6LB0h_7GLX0Pb7sOBMQR9tkRTu-wGHb4x96HlWd6IzZMPb9"
					alt="Luxury fashion model"
				/>
				{/* Darker gradient at the top to help the Navbar stand out, 
            and at the bottom to transition to the next section */}
				<div className="absolute inset-0 bg-gradient-to-b from-background-dark via-transparent to-background-dark z-10"></div>
			</div>

			{/* Content Container */}
			{/* pt-32 (padding-top) specifically pushes the text down on PC 
          so it doesn't cover the model's face or sit under the Nav */}
			<div className="relative z-20 text-center px-6 max-w-4xl pt-32 md:pt-40">
				<h2 className="text-primary font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
					Verp Embodiment
				</h2>
				<h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter text-white">
					REDEFINING <br />
					<span className="text-stroke-gold">ESSENTIAL</span>
				</h1>
				<p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
					Experience the pinnacle of luxury apparel and lifestyle essentials.{" "}
					<br className="hidden md:block" />
					Crafted with precision in metallic black and gold.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<button className="bg-primary text-background-dark px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm gold-glow transition-all duration-300 w-full sm:w-auto">
						Shop Collection
					</button>
					<button className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto">
						View Lookbook
					</button>
				</div>
			</div>

			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 z-20">
				<span className="material-symbols-outlined text-3xl text-white">
					expand_more
				</span>
			</div>
		</header>
	);
};

export default Hero;
