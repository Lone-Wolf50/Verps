import React from "react";
import { Link } from "react-router-dom";
import bagImg from "../../assets/bag.jpg";
import boxersImg from "../../assets/boxers.jpg";
import capImg from "../../assets/cap.jpg";
import hoodImg from "../../assets/hood.jpg";

const categories = [
	{
		id: "01",
		title: "Boxers",
		size: "lg:col-span-4 lg:row-span-2",
		img: boxersImg,
		path: "/category/boxers",
	},
	{
		id: "02",
		title: "Caps",
		size: "lg:col-span-3 lg:row-span-2",
		img: capImg,
		path: "/category/caps",
	},
	{
		id: "03",
		title: "Hoodies",
		size: "lg:col-span-5 lg:row-span-1",
		img: hoodImg,
		path: "/category/hoodie",
	},
	{
		id: "04",
		title: "Sweatshirts",
		size: "lg:col-span-5 lg:row-span-1",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkrtGE5NqSK4oco8gyJfWk7N61RdnlpTO6fIppyZwq9tXV_gW2mQMBFYIm2_4dJ-wLFAcIg3Y4XIiAf-H_81-NywOtK-sU7yYkZv7FqQLewwz8-DIXVihFb5sRSmH0Ed37fbGmDdQnbYbJpuq0DouiHqYs5zYcNvssc6qeyTJq5RzIt1dX3i3lxv2A01AqiYZ0pUROYJzwtwvQLj_nXAVmri4V9un1nORVKWndHEAApvEfbiitVP93JSDsljbqig0v_eOC61iY1vb7",
		path: "/category/sweatshirts",
	},
	{
		id: "05",
		title: "Slides",
		size: "lg:col-span-4 lg:row-span-1",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX26tIIuIoQ0GBmgtyASVN_Fl2psA4oMihRfQ3lu2xJDWp7WctN7s5xASIpvBD-kQl6tL_AjLop3I4lVJrOMW4f4ne-O2BOZ-oV_3FzX3-_AGh8RnTageaqzlFXLQBqqOX3h2_TyEFTxR9Ch9d0VxULx985Qg9I1fpJYG-wD-iHvG66wLVTwihK55euBjlubPeJvnqAFLjUxmgHPpZeOKhMVvVHROINmiUGBM_vv6rZYSKYaBQOs3P85655ESLI_B_SS5cUINH3O3Y",
		path: "/category/slides",
	},
	{
		id: "06",
		title: "Shoes",
		size: "lg:col-span-4 lg:row-span-1",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuANLmzBFuLAKvJTBy_xxhShEob2zXYjflwmaLyJ2NmlQBGRwAvOe9ZM63epyKEZFrRshNWOR8O29-8_tYlvdLP-mqJtHf6gslrzXb1XTpmVviisNPraTCBhnCCA8X9l9u5C3kkR_TlahJr0lXSE92XaKcGJ0vT_HDGYko8rYpBftVXVSNy4uT7MsLq6lXi4oQcCb-lApC4aaKfIx0Zea-PWy4l_5peW6CfyZB1sA8zpNn08URTbaIxrmUG728hJOsIgKrDBeCT39Hux",
		path: "/category/shoes", // Matches your new ShoePage
	},
	{
		id: "07",
		title: "Shirts",
		size: "lg:col-span-4 lg:row-span-1",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6nWSa3KnD2cEfgILZ6odmHtZ80JUsSptL7gs_J1a4X_5hNzSmx7uK4uExXExYC45DAaY1z7MvGcNepkR2f8JuSP-gb-s6UzNGYenLpMm6uicMH2ynHU686n-LYeyYsv8pce_63PduskyVNvQ6Pynq2Fe8Zn3BDo8QAJYlOIzY5HxVC1KFKkjgF1H9aluZS_PYSpfCpREwJH7AwoFt2Z361xwdRwyoK2HSfkfSPHgF6w3rXj5yfg-_jL8eKHKby0OEuNP93_CTUj_z",
		path: "/category/shirts",
	},
	{
		id: "08",
		title: "Bags",
		size: "lg:col-span-4 lg:row-span-1",
		img: bagImg,
		path: "/category/bags",
	},
];

const CategoriesGrid = () => (
	<section className="py-24 px-6 md:px-12 bg-[#0a0a0a]">
		<div className="max-w-[1400px] mx-auto">
			<div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
				<div>
					<h3 className="text-[#ec5b13] font-bold tracking-widest uppercase text-sm mb-2">
						Curated selection
					</h3>
					<h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
						THE CATEGORIES
					</h2>
				</div>
				<p className="text-white/40 max-w-xs text-sm uppercase tracking-wider leading-loose">
					Explore our meticulously designed ranges, where utility meets
					opulence.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-[300px]">
				{categories.map((cat) => (
					<Link
						key={cat.id}
						to={cat.path}
						className={`${cat.size} relative group overflow-hidden rounded-xl bg-neutral-900 block cursor-pointer border border-white/5 hover:border-[#ec5b13]/30 transition-all duration-500`}
					>
						{/* Background Image */}
						<img
							className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
							src={cat.img}
							alt={cat.title}
						/>

						{/* Overlay Gradient */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

						{/* Text Content */}
						<div className="absolute bottom-6 left-6 transition-transform duration-500 group-hover:translate-x-2">
							<span className="text-[#ec5b13] text-xs font-bold tracking-[0.2em] mb-1 block">
								{cat.id}
							</span>
							<h4 className="text-2xl font-bold tracking-tighter uppercase text-white flex items-center gap-2">
								{cat.title}
								<span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
									arrow_forward
								</span>
							</h4>
						</div>
					</Link>
				))}
			</div>
		</div>
	</section>
);

export default CategoriesGrid;
