const BrandNarrative = () => {
	return (
		<section className="py-32 px-6 md:px-12 relative overflow-hidden">
			{/* Decorative Background Text */}
			<div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none">
				VERP
			</div>

			<div className="max-w-4xl mx-auto text-center relative z-10">
				<h3 className="text-primary font-bold tracking-[0.4em] uppercase text-sm mb-8">
					Our Philosophy
				</h3>
				<h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
					Crafted for those who understand that{" "}
					<span className="italic text-primary">details</span> aren't just
					details—they define the essence of being.
				</h2>
				<div className="w-20 h-1 bg-primary mx-auto mb-10"></div>
				<p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
					Verp was born from the desire to create a wardrobe that feels like
					armor and acts like silk. Every piece is an exploration of the
					interplay between dark metallic textures and the warmth of refined
					gold.
				</p>
				<a
					className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm hover:gap-4 transition-all"
					href="#"
				>
					The full story <span className="material-symbols-outlined">east</span>
				</a>
			</div>
		</section>
	);
};

export default BrandNarrative;
