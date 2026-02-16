import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const About = () => {
	const [currentSlide, setCurrentSlide] = useState(0);

	const slides = [
		{
			url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
			label: "Our Workspace",
		},
		{
			url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
			label: "Attention to Detail",
		},
		{
			url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
			label: "Collaborative Spirit",
		},
	];

	// Auto-advance timer
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
		}, 5000);
		return () => clearInterval(timer);
	}, [slides.length]);

	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans selection:bg-[#ec5b13]/30">
			<main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
				{/* Hero Section */}
				<div className="mb-20 text-center">
					<h1 className="text-5xl md:text-8xl font-[900] italic uppercase tracking-tighter leading-none mb-6">
						Beyond <span className="text-[#ec5b13]">Precision</span>
					</h1>
					<p className="text-white/40 text-sm md:text-base uppercase tracking-[0.4em] font-medium max-w-2xl mx-auto leading-loose">
						Defining the intersection of avant-garde digital artistry and
						heritage craftsmanship.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
					{/* Brand Text Card */}
					<div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 bg-white/[0.02]">
						<h2 className="text-2xl font-black uppercase italic mb-6">
							The Brand
						</h2>
						<p className="text-white/60 leading-relaxed mb-8 font-medium">
							Founded in 2023, LUXURY BRAND was born from a singular vision: to
							treat digital commerce as a gallery experience. We don't just sell
							items; we curate legacies. Each piece in our collection undergoes
							a rigorous selection process to ensure it meets the "Master
							Standard."
						</p>
						<Link
							to="/collections"
							className="group inline-flex items-center gap-3 text-[#ec5b13] text-xs font-black uppercase tracking-[0.2em]"
						>
							Explore the Collection
							<span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
								trending_flat
							</span>
						</Link>
					</div>

					{/* Luxury Carousel Component */}
					<div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 group bg-white/5">
						{/* Images */}
						{slides.map((slide, index) => (
							<div
								key={index}
								className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
									index === currentSlide
										? "opacity-100 z-10 scale-100"
										: "opacity-0 z-0 scale-105"
								}`}
							>
								<img
									src={slide.url}
									alt={slide.label}
									className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
									loading="lazy"
								/>
								{/* Scrim for text readability */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

								{/* Overlay Label */}
								<div className="absolute bottom-8 left-8 z-20">
									<p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
										{slide.label}
									</p>
								</div>
							</div>
						))}

						{/* Interactive Area for manual switching */}
						<div className="absolute inset-0 z-30 flex">
							<div
								className="w-1/2 h-full cursor-pointer"
								onClick={() =>
									setCurrentSlide((prev) =>
										prev === 0 ? slides.length - 1 : prev - 1,
									)
								}
								title="Previous"
							></div>
							<div
								className="w-1/2 h-full cursor-pointer"
								onClick={() =>
									setCurrentSlide((prev) =>
										prev === slides.length - 1 ? 0 : prev + 1,
									)
								}
								title="Next"
							></div>
						</div>

						{/* Carousel Navigation Dots */}
						<div className="absolute bottom-8 right-8 flex gap-3 z-40">
							{slides.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentSlide(index)}
									className={`h-[2px] transition-all duration-500 ${
										index === currentSlide
											? "w-8 bg-[#ec5b13]"
											: "w-3 bg-white/20"
									}`}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Values / Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{
							title: "Authenticity",
							desc: "Every item is verified by our master curators.",
							link: "/support",
						},
						{
							title: "Exclusivity",
							desc: "Limited production runs for the discerning few.",
							link: "/collections",
						},
						{
							title: "Concierge",
							desc: "24/7 dedicated lifestyle management.",
							link: "/support",
						},
					].map((value, i) => (
						<div
							key={i}
							className="p-10 border border-white/5 rounded-3xl bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
						>
							<p className="text-[#ec5b13] text-[10px] font-black uppercase tracking-widest mb-6">
								0{i + 1}
							</p>
							<h3 className="text-xl font-bold uppercase mb-4 tracking-tight">
								{value.title}
							</h3>
							<p className="text-white/40 text-sm leading-relaxed mb-8 font-medium">
								{value.desc}
							</p>
							<Link
								to={value.link}
								className="flex items-center justify-center size-10 rounded-full border border-white/10 text-white/20 group-hover:text-[#ec5b13] group-hover:border-[#ec5b13] transition-all"
							>
								<span className="material-symbols-outlined text-sm">
									north_east
								</span>
							</Link>
						</div>
					))}
				</div>
			</main>
		</div>
	);
};

export default About;
