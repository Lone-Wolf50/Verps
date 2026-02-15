const Newsletter = () => {
	const handleSubmit = (e) => {
		e.preventDefault();
		// Logic for newsletter subscription goes here
		console.log("Subscription submitted");
	};

	return (
		<section className="py-24 bg-background-dark border-t border-white/5">
			<div className="max-w-xl mx-auto px-6 text-center">
				<h2 className="text-3xl font-bold mb-4 tracking-tighter">
					JOIN THE CIRCLE
				</h2>
				<p className="text-white/40 mb-10 uppercase tracking-widest text-xs">
					Be the first to access limited drops and private looks.
				</p>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col sm:flex-row gap-4"
				>
					<input
						className="flex-1 bg-neutral-dark border border-white/10 rounded-full px-8 py-4 focus:ring-1 focus:ring-primary focus:border-primary text-white transition-all outline-none"
						placeholder="Your email address"
						type="email"
						required
					/>
					<button
						type="submit"
						className="bg-primary text-background-dark px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white transition-all"
					>
						Subscribe
					</button>
				</form>

				<p className="mt-6 text-[10px] text-white/20 uppercase tracking-widest italic">
					Privacy respected. Always.
				</p>
			</div>
		</section>
	);
};

export default Newsletter;
