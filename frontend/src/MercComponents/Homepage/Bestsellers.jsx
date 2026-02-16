const products = [
	{
		id: 1,
		name: "Signature Gold Hoodie",
		category: "Heavyweight Terry Cotton",
		price: "$185",
		tag: "Limited",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAhT4xspvpdvV5mzE9nCX32tS80Pa-LsQyuDSnXth6rHCUk8xj7EX91V35f2JsdhhuoImGdBZTtGPh2Uzoj5EMnPEM4cRLmBuU7DCmbvBuJ63VGXDLC7CggVUV5kfXCl78VbxxIXIIuYmiuu8Du0Jso7jNCjkOt3wNH4XY-gFXmmlSuERs6bNNu7rZeCRXMLX2RQTqz5H6edSO4JNYy-VKY3zUJVGPDEJZEe2BVhSKfelMtZ2ni_aw6Wp5GFqV93HWrxQHnYgv817g",
	},
	{
		id: 2,
		name: "Aero Metallic Runner",
		category: "Carbon Fiber / Gold Mesh",
		price: "$340",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAp_u9I1hhZjs1Z46nxUiqm9Ih1DKNL_uOhN7GXbxjRlnMc_AnWGgnoRs2VsFrGCHXugLj0bQhgMrlz9dPz3NEWZMsuz1GAQ0_4Z9R_TONYO5A6UiXZbdQCkkAXzD0Pz3MDIbVEtKJqo2X7wkqd-2JaCcO780vIFwiUSGe0aSeXhqxqSM1bm9ARG74KFSEgstREqLQYTUplc316xWvDQYRR9JefHE7rhO4n-b3rQEgWmHVyirBJ4bjqsiQ357T8ecDFPIV082y2yi_C",
	},
	{
		id: 3,
		name: "Signature Gold Cap",
		category: "Luxury Cotton / Gold Embroidery",
		price: "$120",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuANLmzBFuLAKvJTBy_xxhShEob2zXYjflwmaLyJ2NmlQBGRwAvOe9ZM63epyKEZFrRshNWOR8O29-8_tYlvdLP-mqJtHf6gslrzXb1XTpmVviisNPraTCBhnCCA8X9l9u5C3kkR_TlahJr0lXSE92XaKcGJ0vT_HDGYko8rYpBftVXVSNy4uT7MsLq6lXi4oQcCb-lApC4aaKfIx0Zea-PWy4l_5peW6CfyZB1sA8zpNn08URTbaIxrmUG728hJOsIgKrDBeCT39Hux",
	},
	{
		id: 4,
		name: "Carbon Sweatshirt",
		category: "Seamless Tech Knit",
		price: "$160",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkrtGE5NqSK4oco8gyJfWk7N61RdnlpTO6fIppyZwq9tXV_gW2mQMBFYIm2_4dJ-wLFAcIg3Y4XIiAf-H_81-NywOtK-sU7yYkZv7FqQLewwz8-DIXVihFb5sRSmH0Ed37fbGmDdQnbYbJpuq0DouiHqYs5zYcNvssc6qeyTJq5RzIt1dX3i3lxv2A01AqiYZ0pUROYJzwtwvQLj_nXAVmri4V9un1nORVKWndHEAApvEfbiitVP93JSDsljbqig0v_eOC61iY1vb7",
	},
];

const Bestsellers = () => (
	<section className="py-24 bg-neutral-dark border-y border-white/5 overflow-hidden">
		<div className="px-6 md:px-12 max-w-[1400px] mx-auto mb-12 flex justify-between items-end">
			<div>
				<h3 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">
					Editor's choice
				</h3>
				<h2 className="text-4xl font-bold tracking-tighter">
					SEASONAL BESTSELLERS
				</h2>
			</div>
			<div className="flex gap-2">
				<button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all">
					<span className="material-symbols-outlined">arrow_back</span>
				</button>
				<button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all">
					<span className="material-symbols-outlined">arrow_forward</span>
				</button>
			</div>
		</div>

		<div className="flex gap-6 overflow-x-auto px-6 md:px-12 no-scrollbar pb-8">
			{products.map((product) => (
				<div
					key={product.id}
					className="min-w-[300px] md:min-w-[400px] group cursor-pointer"
				>
					<div className="aspect-[4/5] bg-background-dark rounded-xl overflow-hidden mb-4 relative">
						<img
							className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
							src={product.img}
							alt={product.name}
						/>
						{product.tag && (
							<div className="absolute top-4 right-4 bg-primary text-background-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
								{product.tag}
							</div>
						)}
					</div>
					<div className="flex justify-between items-start px-2">
						<div>
							<h4 className="font-bold text-lg">{product.name}</h4>
							<p className="text-white/40 text-sm">{product.category}</p>
						</div>
						<p className="text-primary font-bold">{product.price}</p>
					</div>
				</div>
			))}
		</div>
	</section>
);

export default Bestsellers;
