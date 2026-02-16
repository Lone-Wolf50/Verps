import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Fallback images for existing categories
import bagImg from "../../assets/bag.jpg";
import boxersImg from "../../assets/boxers.jpg";
import capImg from "../../assets/cap.jpg";
import hoodImg from "../../assets/hood.jpg";

// --- Utility: Get Image or Fallback ---
const getCatImg = (cat) => {
	if (cat.image_url) return cat.image_url;
	const fallbacks = {
		Boxers: boxersImg,
		Caps: capImg,
		Hoodies: hoodImg,
		Bags: bagImg,
	};
	return fallbacks[cat.name] || "https://via.placeholder.com/800";
};

// --- Sub-Component: Premium Featured Card (for PC/Tablet) ---
const PremiumCategoryCard = ({ cat, index, size = "default" }) => {
	const cardSizes = {
		large: "col-span-2 row-span-2",
		wide: "col-span-2 row-span-1",
		tall: "col-span-1 row-span-2",
		default: "col-span-1 row-span-1",
	};

	return (
		<Link
			to={`/category/${cat.slug || cat.name.toLowerCase()}`}
			className={`${cardSizes[size]} group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-2xl hover:shadow-[#ec5b13]/50 transition-all duration-500 transform hover:-translate-y-1`}
		>
			{/* Background Image with Overlay */}
			<div className="absolute inset-0">
				<img
					src={getCatImg(cat)}
					alt={cat.name}
					className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700"
					loading="lazy"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
			</div>

			{/* Content Overlay */}
			<div className="relative h-full p-8 flex flex-col justify-end">
				{/* Category Number Badge */}
				<div className="absolute top-6 right-6">
					<div className="w-12 h-12 rounded-full bg-[#ec5b13]/20 backdrop-blur-sm border border-[#ec5b13]/40 flex items-center justify-center">
						<span className="text-[#ec5b13] font-bold text-sm">
							{String(index + 1).padStart(2, "0")}
						</span>
					</div>
				</div>

				{/* Category Name */}
				<div className="space-y-2">
					<h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight group-hover:text-[#ec5b13] transition-colors duration-300">
						{cat.name}
					</h3>
					<div className="flex items-center gap-3">
						<div className="h-1 w-12 bg-[#ec5b13] group-hover:w-20 transition-all duration-300"></div>
						<span className="text-white/60 text-sm uppercase tracking-wider">
							Explore Collection
						</span>
					</div>
				</div>

				{/* Arrow Icon */}
				<div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
					<div className="w-12 h-12 rounded-full bg-[#ec5b13] flex items-center justify-center">
						<span className="material-symbols-outlined text-white text-xl">
							arrow_forward
						</span>
					</div>
				</div>
			</div>
		</Link>
	);
};

// --- Sub-Component: Regular CategoryCard (for mobile) ---
const CategoryCard = ({ cat, index, className = "" }) => (
	<Link
		to={`/category/${cat.slug || cat.name.toLowerCase()}`}
		className={`relative group overflow-hidden rounded-xl bg-neutral-900 block cursor-pointer border border-white/5 hover:border-[#ec5b13]/30 transition-all duration-500 ${className}`}
	>
		<img
			className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
			src={getCatImg(cat)}
			alt={cat.name}
			loading="lazy"
		/>
		<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
		<div className="absolute bottom-6 left-6 transition-transform duration-500 group-hover:translate-x-2">
			<span className="text-[#ec5b13] text-xs font-bold tracking-[0.2em] mb-1 block">
				{String(index + 1).padStart(2, "0")}
			</span>
			<h4 className="text-2xl font-bold tracking-tighter uppercase text-white flex items-center gap-2">
				{cat.name}
				<span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
					arrow_forward
				</span>
			</h4>
		</div>
	</Link>
);

// --- Sub-Component: MobileCarousel ---
const MobileCarousel = ({ categories }) => {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [touchStart, setTouchStart] = useState(null);
	const [touchEnd, setTouchEnd] = useState(null);
	const autoPlayRef = useRef(null);
	const restartTimeoutRef = useRef(null);

	const startAutoPlay = () => {
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		autoPlayRef.current = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % categories.length);
		}, 5000);
	};

	const restartAutoPlay = () => {
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
		restartTimeoutRef.current = setTimeout(() => {
			startAutoPlay();
		}, 3000);
	};

	useEffect(() => {
		startAutoPlay();
		return () => {
			if (autoPlayRef.current) clearInterval(autoPlayRef.current);
			if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
		};
	}, [categories.length]);

	const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
	const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return;
		const distance = touchStart - touchEnd;
		if (distance > 50) {
			setCurrentSlide((prev) => (prev + 1) % categories.length);
			restartAutoPlay();
		}
		if (distance < -50) {
			setCurrentSlide(
				(prev) => (prev - 1 + categories.length) % categories.length,
			);
			restartAutoPlay();
		}
	};

	const goToSlide = (index) => {
		setCurrentSlide(index);
		restartAutoPlay();
	};

	const currentCategory = categories[currentSlide];

	return (
		<div className="relative">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<p className="text-[#ec5b13]/60 text-xs font-bold tracking-[0.3em] uppercase">
						Featured Collection
					</p>
					<h3 className="text-white text-2xl font-bold tracking-tight mt-1">
						{currentCategory?.name}
					</h3>
				</div>
				<div className="text-right">
					<p className="text-white/40 text-xs tracking-wider">
						{currentSlide + 1} / {categories.length}
					</p>
				</div>
			</div>

			<div
				className="relative overflow-hidden rounded-xl h-[400px]"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div
					className="flex transition-transform duration-500 ease-out h-full"
					style={{ transform: `translateX(-${currentSlide * 100}%)` }}
				>
					{categories.map((cat, i) => (
						<div key={cat.id} className="min-w-full h-full">
							<CategoryCard cat={cat} index={i} className="h-full" />
						</div>
					))}
				</div>

				<div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
					<div
						className="h-full bg-[#ec5b13] transition-all duration-300"
						style={{
							width: `${((currentSlide + 1) / categories.length) * 100}%`,
						}}
					/>
				</div>
			</div>

			<div className="flex justify-center gap-2 mt-4">
				{categories.map((_, i) => (
					<button
						key={i}
						onClick={() => goToSlide(i)}
						className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-[#ec5b13]" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
						aria-label={`Go to category ${i + 1}`}
					/>
				))}
			</div>
		</div>
	);
};

// --- Sub-Component: HorizontalScroll ---
const HorizontalScroll = ({ categories, title }) => {
	const scrollRef = useRef(null);
	const scroll = (dir) => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({
				left: dir === "left" ? -300 : 300,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="relative">
			{title && (
				<div className="mb-6">
					<h3 className="text-white text-xl font-bold tracking-tight uppercase">
						{title}
					</h3>
					<div className="h-0.5 w-16 bg-[#ec5b13] mt-2"></div>
				</div>
			)}
			<button
				onClick={() => scroll("left")}
				className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/80 border border-white/10 text-white hover:bg-[#ec5b13] transition-all -translate-x-5"
				aria-label="Scroll left"
			>
				<span className="material-symbols-outlined">chevron_left</span>
			</button>
			<button
				onClick={() => scroll("right")}
				className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/80 border border-white/10 text-white hover:bg-[#ec5b13] transition-all translate-x-5"
				aria-label="Scroll right"
			>
				<span className="material-symbols-outlined">chevron_right</span>
			</button>
			<div
				ref={scrollRef}
				className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
			>
				{categories.map((cat, i) => (
					<div
						key={cat.id}
						className="min-w-[280px] sm:min-w-[320px] h-[280px] snap-start"
					>
						<CategoryCard cat={cat} index={i} className="h-full" />
					</div>
				))}
			</div>
		</div>
	);
};

// --- Main Component ---
const CategoriesGrid = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCategories = async () => {
			const { data } = await supabase
				.from("verp_categories")
				.select("*")
				.order("created_at", { ascending: true });
			setCategories(data || []);
			setLoading(false);
		};
		fetchCategories();
	}, []);

	if (loading) {
		return (
			<div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 border-2 border-[#ec5b13] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-white/40 text-sm tracking-wider">
						Loading collections...
					</p>
				</div>
			</div>
		);
	}

	// Show only first 6 for PC/Tablet
	const featuredCategories = categories.slice(0, 6);

	// Define layout pattern for 6 items (creative asymmetric grid)
	const layoutPattern = [
		"large", // 0: Large hero card
		"tall", // 1: Tall card
		"default", // 2: Regular
		"wide", // 3: Wide card
		"default", // 4: Regular
		"tall", // 5: Tall card
	];

	return (
		<section className="py-24 px-6 md:px-12 bg-[#0a0a0a]">
			<div className="max-w-[1400px] mx-auto">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
					<div>
						<h3 className="text-[#ec5b13] font-bold tracking-widest uppercase text-sm mb-2">
							Curated selection
						</h3>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white uppercase">
							Popular Categories
						</h2>
					</div>
					<p className="text-white/40 max-w-xs text-sm uppercase tracking-wider leading-loose">
						Explore our meticulously designed ranges, where utility meets
						opulence.
					</p>
				</div>

				{/* Mobile Layout - Keep everything as is */}
				<div className="md:hidden space-y-8">
					<MobileCarousel categories={categories} />
					<HorizontalScroll categories={categories} title="All Categories" />
				</div>

				{/* Tablet Layout - Premium 6 Cards Grid */}
				<div className="hidden md:block lg:hidden">
					<div className="grid grid-cols-3 grid-rows-3 gap-4 h-[900px] mb-12">
						{featuredCategories.map((cat, i) => (
							<PremiumCategoryCard
								key={cat.id}
								cat={cat}
								index={i}
								size={layoutPattern[i] || "default"}
							/>
						))}
					</div>

					{/* View All Categories Button */}
					<div className="flex justify-center">
						<Link
							to="/categories"
							className="group px-10 py-5 bg-gradient-to-r from-[#ec5b13] to-[#d44d0f] text-white rounded-xl hover:shadow-2xl hover:shadow-[#ec5b13]/50 transition-all duration-300 flex items-center gap-4 uppercase tracking-wider text-sm font-bold transform hover:-translate-y-1"
						>
							<span>View All {categories.length} Categories</span>
							<span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
								arrow_forward
							</span>
						</Link>
					</div>
				</div>

				{/* Desktop Layout - Premium 6 Cards Grid */}
				<div className="hidden lg:block">
					<div className="grid grid-cols-4 grid-rows-3 gap-6 h-[950px] mb-16">
						{featuredCategories.map((cat, i) => (
							<PremiumCategoryCard
								key={cat.id}
								cat={cat}
								index={i}
								size={layoutPattern[i] || "default"}
							/>
						))}
					</div>

					{/* View All Categories Button */}
					<div className="flex justify-center">
						<Link
							to="/categories"
							className="group px-14 py-6 bg-gradient-to-r from-[#ec5b13] to-[#d44d0f] text-white rounded-xl hover:shadow-2xl hover:shadow-[#ec5b13]/50 transition-all duration-300 flex items-center gap-4 uppercase tracking-widest text-sm font-bold transform hover:-translate-y-1"
						>
							<span>View All {categories.length} Categories</span>
							<span className="material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform">
								arrow_forward
							</span>
						</Link>
					</div>
				</div>
			</div>
			<style jsx>{`
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</section>
	);
};

export default CategoriesGrid;
