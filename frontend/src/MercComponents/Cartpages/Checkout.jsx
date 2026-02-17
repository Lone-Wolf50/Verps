import React, { useState } from "react";
import { useCart } from "../Cartoptions/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";

// ─── Step Indicator ───────────────────────────────────────────────────────────
const steps = ["Cart", "Details", "Confirm"];

// ─── Input Field Component ────────────────────────────────────────────────────
const Field = ({ label, icon, error, children }) => (
	<div className="space-y-2 group">
		<label className="flex items-center gap-2 text-[9px] font-medium text-white/30 uppercase tracking-[0.35em] ml-1">
			{icon && <span className="text-[10px]">{icon}</span>}
			{label}
		</label>
		{children}
		{error && (
			<p className="text-[9px] text-red-400 uppercase tracking-wider ml-1 font-medium">
				{error}
			</p>
		)}
	</div>
);

const inputClass =
	"w-full bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/15 px-5 py-4 rounded-2xl text-sm font-light outline-none transition-all duration-300 focus:border-[#ec5b13]/50 focus:bg-[#ec5b13]/[0.03] focus:shadow-[0_0_0_3px_rgba(236,91,19,0.08)]";

// ─── Order Summary Item ───────────────────────────────────────────────────────
const SummaryItem = ({ item }) => (
	<div className="flex items-center gap-4">
		<div className="relative flex-shrink-0">
			<img
				src={item.image}
				alt={item.name}
				className="w-14 h-14 object-cover rounded-xl"
				style={{ border: "1px solid rgba(255,255,255,0.07)" }}
			/>
			<span
				className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#ec5b13] text-black text-[8px] font-black flex items-center justify-center"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				{item.quantity}
			</span>
		</div>
		<div className="flex-1 min-w-0">
			<p className="text-xs font-semibold uppercase tracking-tight text-white truncate">
				{item.name}
			</p>
			<p
				className="text-[10px] text-white/30 mt-0.5"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				${Number(item.price).toLocaleString()} × {item.quantity}
			</p>
		</div>
		<p className="text-sm font-bold text-white tabular-nums">
			${(item.price * item.quantity).toLocaleString()}
		</p>
	</div>
);

// ─── Delivery Card ────────────────────────────────────────────────────────────
const DeliveryCard = ({
	value,
	selected,
	onSelect,
	title,
	description,
	icon,
}) => (
	<button
		type="button"
		onClick={() => onSelect(value)}
		className="relative flex-1 p-4 rounded-2xl text-left transition-all duration-300 group"
		style={{
			background: selected ? "rgba(236,91,19,0.08)" : "rgba(255,255,255,0.02)",
			border: selected
				? "1px solid rgba(236,91,19,0.3)"
				: "1px solid rgba(255,255,255,0.06)",
			boxShadow: selected ? "0 0 20px -8px rgba(236,91,19,0.3)" : "none",
		}}
	>
		{/* Selected indicator */}
		<div
			className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200"
			style={{
				background: selected ? "#ec5b13" : "rgba(255,255,255,0.05)",
				border: selected ? "none" : "1px solid rgba(255,255,255,0.1)",
			}}
		>
			{selected && (
				<svg width="8" height="6" viewBox="0 0 8 6" fill="none">
					<path
						d="M1 3L3 5L7 1"
						stroke="black"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			)}
		</div>

		<div className="text-xl mb-2">{icon}</div>
		<p className="text-xs font-bold uppercase tracking-wider text-white mb-1">
			{title}
		</p>
		<p className="text-[10px] text-white/30 leading-relaxed">{description}</p>
	</button>
);

// ─── Main Checkout ────────────────────────────────────────────────────────────
const Checkout = () => {
	const { cart, cartTotal, clearCart } = useCart();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		location: "",
		deliveryMethod: "pickup",
	});

	const set = (key, val) => {
		setFormData((prev) => ({ ...prev, [key]: val }));
		if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }));
	};

	const handlePhoneChange = (e) => {
		const value = e.target.value.replace(/\D/g, "");
		if (value.length <= 10) set("phone", value);
	};

	const validate = () => {
		const errors = {};
		if (!formData.name.trim()) errors.name = "Name is required";
		if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
			errors.email = "Valid email required";
		if (formData.phone.length !== 10)
			errors.phone = "Must be exactly 10 digits";
		if (!formData.location.trim()) errors.location = "Location required";
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		try {
			const { data: orderData, error: dbError } = await supabase
				.from("verp_orders")
				.insert([
					{
						customer_name: formData.name,
						customer_email: formData.email,
						customer_phone: formData.phone,
						location: formData.location,
						delivery_method: formData.deliveryMethod,
						items: cart.map((item) => ({
							id: item.id,
							name: item.name,
							price: item.price,
							quantity: item.quantity,
							image: item.image,
						})),
						total_amount: cartTotal,
						status: "Ordered",
					},
				])
				.select();

			if (dbError) throw dbError;

			await Swal.fire({
				title: "ORDER ENCRYPTED",
				text: "Your acquisition has been logged into the VERP Vault.",
				icon: "success",
				background: "#0a0a0a",
				color: "#fff",
				confirmButtonColor: "#ec5b13",
				iconColor: "#ec5b13",
			});

			clearCart();
			navigate("/orders");
		} catch (error) {
			Swal.fire({
				title: "Vault Error",
				text: error.message,
				icon: "error",
				background: "#0a0a0a",
				color: "#fff",
				confirmButtonColor: "#ec5b13",
			});
		} finally {
			setLoading(false);
		}
	};

	const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,700&family=DM+Mono:wght@300;400;500&display=swap');

        .co-page { font-family: 'DM Sans', sans-serif; }
        .co-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }
        .co-mono { font-family: 'DM Mono', monospace; }

        .co-input:focus { 
          border-color: rgba(236,91,19,0.5); 
          background: rgba(236,91,19,0.03);
          box-shadow: 0 0 0 3px rgba(236,91,19,0.08);
        }

        /* grain overlay */
        .grain::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.5;
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.65s cubic-bezier(.22,1,.36,1) both; }
        .fade-up-delay { animation: fade-up 0.65s 0.15s cubic-bezier(.22,1,.36,1) both; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .btn-submit {
          background: linear-gradient(90deg, #ec5b13, #ff7a3d, #ec5b13);
          background-size: 200% auto;
          transition: background-position 0.4s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
        .btn-submit:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 32px -8px rgba(236,91,19,0.5);
          transform: translateY(-1px);
        }
        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes spin-ring {
          to { transform: rotate(360deg); }
        }
        .spin-ring { animation: spin-ring 0.9s linear infinite; }

        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
      `}</style>

			<div className="co-page grain min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-5 md:px-8 relative">
				{/* ambient glow */}
				<div
					className="fixed inset-0 pointer-events-none"
					style={{
						background:
							"radial-gradient(ellipse 60% 40% at 30% 0%, rgba(236,91,19,0.05) 0%, transparent 70%)",
					}}
				/>

				<div className="max-w-6xl mx-auto relative z-10">
					{/* ── Header ── */}
					<div className="mb-14 fade-up">
						<p className="co-mono text-[#ec5b13]/40 text-[9px] uppercase tracking-[0.5em] mb-3">
							◈ Secure Acquisition Terminal
						</p>
						<h1 className="co-display text-[4.5rem] md:text-[7rem] leading-none text-white">
							CHECK
							<span
								style={{
									WebkitTextStroke: "1px rgba(236,91,19,0.7)",
									color: "transparent",
								}}
							>
								OUT
							</span>
						</h1>
					</div>

					{/* ── Two-column layout ── */}
					<div className="flex flex-col lg:flex-row gap-8">
						{/* ══ FORM COLUMN ══ */}
						<div className="flex-1 fade-up-delay">
							<form onSubmit={handleSubmit} className="space-y-8">
								{/* Section: Contact */}
								<div
									className="rounded-[1.75rem] overflow-hidden"
									style={{
										background: "rgba(255,255,255,0.02)",
										border: "1px solid rgba(255,255,255,0.07)",
									}}
								>
									<div className="px-7 py-5 border-b border-white/[0.05] flex items-center gap-3">
										<div
											className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]"
											style={{
												background: "rgba(236,91,19,0.15)",
												color: "#ec5b13",
											}}
										>
											01
										</div>
										<h2 className="co-mono text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">
											Contact Information
										</h2>
									</div>

									<div className="p-7 space-y-5">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
											<Field label="Full Name" error={fieldErrors.name}>
												<input
													type="text"
													placeholder="John Doe"
													className={`${inputClass} co-input`}
													value={formData.name}
													onChange={(e) => set("name", e.target.value)}
													style={{
														borderColor: fieldErrors.name
															? "rgba(248,113,113,0.5)"
															: undefined,
													}}
												/>
											</Field>
											<Field label="Email Address" error={fieldErrors.email}>
												<input
													type="email"
													placeholder="client@luxury.com"
													className={`${inputClass} co-input`}
													value={formData.email}
													onChange={(e) => set("email", e.target.value)}
													style={{
														borderColor: fieldErrors.email
															? "rgba(248,113,113,0.5)"
															: undefined,
													}}
												/>
											</Field>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
											<Field label="Phone Number" error={fieldErrors.phone}>
												<input
													type="text"
													inputMode="numeric"
													placeholder="0500000000"
													value={formData.phone}
													className={`${inputClass} co-mono co-input`}
													onChange={handlePhoneChange}
													style={{
														borderColor: fieldErrors.phone
															? "rgba(248,113,113,0.5)"
															: undefined,
													}}
												/>
											</Field>
											<Field
												label="City / Location"
												error={fieldErrors.location}
											>
												<input
													type="text"
													placeholder="Dubai, UAE"
													className={`${inputClass} co-input`}
													value={formData.location}
													onChange={(e) => set("location", e.target.value)}
													style={{
														borderColor: fieldErrors.location
															? "rgba(248,113,113,0.5)"
															: undefined,
													}}
												/>
											</Field>
										</div>
									</div>
								</div>

								{/* Section: Delivery */}
								<div
									className="rounded-[1.75rem] overflow-hidden"
									style={{
										background: "rgba(255,255,255,0.02)",
										border: "1px solid rgba(255,255,255,0.07)",
									}}
								>
									<div className="px-7 py-5 border-b border-white/[0.05] flex items-center gap-3">
										<div
											className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]"
											style={{
												background: "rgba(236,91,19,0.15)",
												color: "#ec5b13",
											}}
										>
											02
										</div>
										<h2 className="co-mono text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">
											Delivery Method
										</h2>
									</div>

									<div className="p-7 space-y-4">
										<div className="flex flex-col sm:flex-row gap-3">
											<DeliveryCard
												value="pickup"
												selected={formData.deliveryMethod === "pickup"}
												onSelect={(v) => set("deliveryMethod", v)}
												icon="🏛️"
												title="Showroom Pickup"
												description="Collect your acquisition from our flagship showroom."
											/>
											<DeliveryCard
												value="door"
												selected={formData.deliveryMethod === "door"}
												onSelect={(v) => set("deliveryMethod", v)}
												icon="🚚"
												title="Door Delivery"
												description="White-glove delivery to your address. Fees calculated post-checkout."
											/>
										</div>

										{formData.deliveryMethod === "door" && (
											<div
												className="flex gap-3 p-4 rounded-2xl"
												style={{
													background: "rgba(236,91,19,0.06)",
													border: "1px solid rgba(236,91,19,0.15)",
												}}
											>
												<div className="text-[#ec5b13] mt-0.5 flex-shrink-0">
													<svg
														width="14"
														height="14"
														viewBox="0 0 14 14"
														fill="none"
													>
														<circle
															cx="7"
															cy="7"
															r="6"
															stroke="currentColor"
															strokeWidth="1.2"
														/>
														<path
															d="M7 6v4M7 4.5v.5"
															stroke="currentColor"
															strokeWidth="1.4"
															strokeLinecap="round"
														/>
													</svg>
												</div>
												<p className="co-mono text-[10px] text-[#ec5b13]/70 leading-relaxed uppercase tracking-wide">
													Our logistics team will contact you via call or email
													to coordinate secure transit and confirm delivery
													fees.
												</p>
											</div>
										)}
									</div>
								</div>

								{/* CTA */}
								<button
									type="submit"
									disabled={loading || cart.length === 0}
									className="btn-submit w-full py-5 rounded-2xl font-bold text-black text-xs uppercase tracking-[0.35em] flex items-center justify-center gap-3"
								>
									{loading ? (
										<>
											<div className="spin-ring w-4 h-4 rounded-full border-2 border-black/20 border-t-black" />
											<span>Encrypting Order…</span>
										</>
									) : (
										<>
											<span>Confirm Acquisition</span>
											<span className="co-mono font-medium opacity-60">
												— ${cartTotal.toLocaleString()}
											</span>
										</>
									)}
								</button>

								{/* Trust line */}
								<div className="flex items-center justify-center gap-6">
									{[
										{ icon: "🔒", text: "256-bit Encrypted" },
										{ icon: "✦", text: "Secure Vault" },
										{ icon: "⟳", text: "48h Return Window" },
									].map((t) => (
										<div key={t.text} className="flex items-center gap-1.5">
											<span className="text-[10px] opacity-30">{t.icon}</span>
											<span className="co-mono text-[8px] text-white/20 uppercase tracking-widest">
												{t.text}
											</span>
										</div>
									))}
								</div>
							</form>
						</div>

						{/* ══ ORDER SUMMARY COLUMN ══ */}
						<div
							className="lg:w-[360px] fade-up-delay"
							style={{ animationDelay: "0.2s" }}
						>
							<div
								className="rounded-[1.75rem] overflow-hidden sticky top-32"
								style={{
									background: "rgba(255,255,255,0.02)",
									border: "1px solid rgba(255,255,255,0.07)",
								}}
							>
								{/* Header */}
								<div className="px-7 py-5 border-b border-white/[0.05] flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]"
											style={{
												background: "rgba(236,91,19,0.15)",
												color: "#ec5b13",
											}}
										>
											◈
										</div>
										<h2 className="co-mono text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium">
											Order Summary
										</h2>
									</div>
									<span
										className="co-mono text-[10px] px-2.5 py-1 rounded-full text-white/30"
										style={{
											background: "rgba(255,255,255,0.05)",
											border: "1px solid rgba(255,255,255,0.07)",
										}}
									>
										{itemCount} {itemCount === 1 ? "item" : "items"}
									</span>
								</div>

								{/* Items */}
								<div className="p-7 space-y-5">
									{cart.length === 0 ? (
										<p className="co-mono text-[10px] text-white/20 text-center py-8 uppercase tracking-widest">
											Vault is empty
										</p>
									) : (
										cart.map((item, i) => (
											<React.Fragment key={item.id}>
												<SummaryItem item={item} />
												{i < cart.length - 1 && (
													<div className="divider-line" />
												)}
											</React.Fragment>
										))
									)}
								</div>

								{/* Totals */}
								<div
									className="px-7 pb-7 space-y-3 pt-1"
									style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
								>
									<div className="flex justify-between items-center pt-5">
										<span className="co-mono text-[10px] text-white/25 uppercase tracking-widest">
											Subtotal
										</span>
										<span className="co-mono text-sm text-white/50">
											${cartTotal.toLocaleString()}
										</span>
									</div>

									{formData.deliveryMethod === "door" && (
										<div className="flex justify-between items-center">
											<span className="co-mono text-[10px] text-white/25 uppercase tracking-widest">
												Delivery
											</span>
											<span className="co-mono text-[10px] text-[#ec5b13]/60 uppercase tracking-wider">
												TBD
											</span>
										</div>
									)}

									<div className="divider-line" />

									<div className="flex justify-between items-end pt-1">
										<span className="co-mono text-[9px] text-white/30 uppercase tracking-widest">
											Total
										</span>
										<div className="text-right">
											<p
												className="co-display text-3xl text-[#ec5b13]"
												style={{ letterSpacing: "0.05em" }}
											>
												${cartTotal.toLocaleString()}
											</p>
											{formData.deliveryMethod === "door" && (
												<p className="co-mono text-[8px] text-white/20 uppercase tracking-wider mt-0.5">
													+ delivery
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Delivery method badge */}
								<div
									className="mx-5 mb-5 p-3 rounded-xl flex items-center gap-3"
									style={{
										background: "rgba(255,255,255,0.02)",
										border: "1px solid rgba(255,255,255,0.05)",
									}}
								>
									<span className="text-lg">
										{formData.deliveryMethod === "pickup" ? "🏛️" : "🚚"}
									</span>
									<div>
										<p className="co-mono text-[9px] text-white/50 uppercase tracking-wider font-medium">
											{formData.deliveryMethod === "pickup"
												? "Showroom Pickup"
												: "Door Delivery"}
										</p>
										<p className="co-mono text-[8px] text-white/20 uppercase tracking-wider mt-0.5">
											{formData.deliveryMethod === "pickup"
												? "Ready for collection"
												: "Fees confirmed post-checkout"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Checkout;
