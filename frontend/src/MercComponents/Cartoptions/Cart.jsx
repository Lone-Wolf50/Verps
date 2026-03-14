import React from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
	const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
	const navigate = useNavigate();

	if (cart.length === 0) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6">
				<span className="material-symbols-outlined text-6xl text-white/10 mb-4">
					shoppingCart
				</span>
				<h2 className="text-3xl font-black uppercase tracking-tighter italic">
					Your Bag is Empty
				</h2>
				<Link
					to="/categories"
					className="bg-[#ec5b13] text-black font-black px-10 py-4 rounded-full uppercase tracking-widest text-xs mt-8"
				>
					Return To Collections
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0d0d0d] text-white pt-20 pb-20 px-6">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl md:text-6xl font-[900] italic uppercase mb-12" style={{color:"rgba(255,255,255,0.95)"}}>
					Shopping <span className="text-[#ec5b13]">Bag</span>
				</h1>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					<div className="lg:col-span-2 space-y-6">
						{cart.map((item) => (
							<div
								key={`${item.id}-${item.size || ""}-${item.color || ""}`}
								className="p-4 sm:p-6 rounded-3xl border border-white/5 bg-white/5 flex gap-4 sm:gap-6 items-start sm:items-center"
							>
								<img
									src={item.image}
									alt={item.name}
									className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl flex-shrink-0"
								/>
								<div className="flex-grow min-w-0">
									<div className="flex items-start justify-between gap-2">
										<h3 className="font-black uppercase tracking-tight text-base sm:text-xl leading-tight" style={{color:"rgba(255,255,255,0.95)"}}>
											{item.name}
										</h3>
										{/* Remove button — top-right on mobile */}
										<button
											onClick={() => removeFromCart(item.id)}
											className="flex-shrink-0 text-[10px] sm:text-xs uppercase font-black text-white/35 hover:text-red-500 transition-colors duration-200 sm:hidden"
										>
											Remove
										</button>
									</div>
									<p className="text-[#ec5b13] font-black mt-1" style={{fontSize:"15px"}}>
										GH&#8373;{item.price.toLocaleString()}
									</p>
									<div className="flex items-center gap-4 mt-3">
										<div className="flex items-center border border-white/10 rounded-full px-3 py-1 bg-white/5">
											<button
												onClick={() => updateQuantity(item.id, -1)}
												className="px-2 text-white/70 hover:text-white"
											>
												-
											</button>
											<span className="text-sm font-black w-8 text-center">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQuantity(item.id, 1)}
												className="px-2 text-white/70 hover:text-white"
											>
												+
											</button>
										</div>
										{/* Remove button — inline on desktop */}
										<button
											onClick={() => removeFromCart(item.id)}
											className="hidden sm:block text-xs uppercase font-black text-white/35 hover:text-red-500 transition-colors duration-200"
										>
											Remove
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="lg:col-span-1">
						<div className="p-8 rounded-3xl border border-white/10 bg-white/5 sticky top-32">
							<h2 className="text-2xl font-black uppercase italic mb-6" style={{color:"rgba(255,255,255,0.95)"}}>
								Summary
							</h2>
							<div className="flex justify-between py-6 border-b border-white/5">
								<span className="text-xl font-black uppercase italic" style={{color:"rgba(255,255,255,0.92)"}}>
									Total
								</span>
								<span className="text-2xl font-black text-[#ec5b13]">
									GH&#8373; {cartTotal.toLocaleString()}
								</span>
							</div>
							<button
								onClick={() => navigate("/checkout")}
								className="w-full bg-white text-black py-5 mt-6 rounded-2xl font-black uppercase text-sm hover:bg-[#ec5b13] hover:text-white transition-all shadow-xl"
							>
								Secure Checkout
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default Cart;