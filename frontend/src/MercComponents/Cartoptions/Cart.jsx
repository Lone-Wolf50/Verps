import React from "react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
	const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

	if (cart.length === 0) {
		return (
			<div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6">
				<span className="material-symbols-outlined text-6xl text-white/10 mb-4">
					shopping_bag
				</span>
				<h2 className="text-2xl font-black uppercase tracking-tighter italic">
					Your Bag is Empty
				</h2>
				<p className="text-white/40 text-sm mt-2 mb-8 uppercase tracking-widest">
					Exclusivity awaits you.
				</p>
				<Link
					to="/"
					className="bg-[#ec5b13] text-black font-black px-10 py-4 rounded-full uppercase tracking-widest text-xs hover:bg-white transition-all"
				>
					Return to Collection
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0d0d0d] text-white pt-32 pb-20 px-6">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl md:text-6xl font-[900] italic uppercase tracking-tighter mb-12">
					Shopping <span className="text-[#ec5b13]">Bag</span>
				</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-6">
						{cart.map((item) => (
							<div
								key={item.id}
								className="glass-panel p-6 rounded-3xl border border-white/5 flex gap-6 items-center"
							>
								<div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0">
									<img
										src={item.image}
										alt={item.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="flex-grow">
									<h3 className="font-black uppercase tracking-tight text-lg">
										{item.name}
									</h3>
									<p className="text-[#ec5b13] font-bold text-sm">
										${item.price.toLocaleString()}
									</p>

									<div className="flex items-center gap-4 mt-4">
										<div className="flex items-center border border-white/10 rounded-full px-3 py-1 bg-white/5">
											<button
												onClick={() => updateQuantity(item.id, -1)}
												className="hover:text-[#ec5b13] px-2"
											>
												-
											</button>
											<span className="text-xs font-bold w-8 text-center">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQuantity(item.id, 1)}
												className="hover:text-[#ec5b13] px-2"
											>
												+
											</button>
										</div>
										<button
											onClick={() => removeFromCart(item.id)}
											className="text-[10px] uppercase font-black text-white/20 hover:text-red-500 transition-colors tracking-widest"
										>
											Remove
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Summary */}
					<div className="lg:col-span-1">
						<div className="glass-panel p-8 rounded-3xl border border-white/10 sticky top-32">
							<h2 className="text-xl font-black uppercase italic mb-6">
								Summary
							</h2>
							<div className="space-y-4 border-b border-white/5 pb-6">
								<div className="flex justify-between text-sm">
									<span className="text-white/40 uppercase font-bold tracking-widest">
										Subtotal
									</span>
									<span className="font-bold">
										${cartTotal.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-white/40 uppercase font-bold tracking-widest">
										Shipping
									</span>
									<span className="text-green-500 font-bold uppercase tracking-tighter italic">
										Complimentary
									</span>
								</div>
							</div>
							<div className="flex justify-between items-center py-6">
								<span className="text-lg font-black uppercase italic">
									Total
								</span>
								<span className="text-2xl font-black text-[#ec5b13]">
									${cartTotal.toLocaleString()}
								</span>
							</div>
							<button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#ec5b13] hover:text-white transition-all shadow-xl active:scale-95">
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
