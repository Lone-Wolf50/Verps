import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { Trash2, UploadCloud } from "lucide-react"; // Optional: if you use lucide-react, otherwise replace with SVGs provided below

const AddProduct = ({ editData, onSuccess }) => {
	const [loading, setLoading] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	const initialState = {
		name: "",
		category: "",
		price: "",
		description: "",
		origin: "",
		series: "",
		image_url: "",
	};

	const [productData, setProductData] = useState(() => {
		const savedDraft = localStorage.getItem("product_draft");
		return savedDraft ? JSON.parse(savedDraft) : initialState;
	});

	// Sync form with editData and set initial preview
	useEffect(() => {
		if (editData) {
			setProductData({
				name: editData.name || "",
				category: editData.category || "",
				price: editData.price || "",
				description: editData.description || "",
				origin: editData.origin || "",
				series: editData.series || "",
				image_url: editData.image_url || "",
			});
			setPreviewUrl(editData.image_url);
		} else {
			setProductData(initialState);
			setPreviewUrl(null);
		}
	}, [editData]);

	// Save draft to localStorage (only if not editing)
	useEffect(() => {
		if (!editData) {
			localStorage.setItem("product_draft", JSON.stringify(productData));
		}
	}, [productData, editData]);

	// Unsaved changes warning
	useEffect(() => {
		const handleBeforeUnload = (e) => {
			const isDirty = Object.values(productData).some((val) => val !== "");
			if (isDirty && !loading) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [productData, loading]);

	const Toast = Swal.mixin({
		toast: true,
		position: "top-end",
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		background: "#1a1a1a",
		color: "#fff",
	});

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setImageFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const removeImage = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Prevents triggering the file input
		setImageFile(null);
		setPreviewUrl(null);
		setProductData({ ...productData, image_url: "" });
	};

	const handleClear = async () => {
		const result = await Swal.fire({
			title: "CLEAR ARCHITECTURE?",
			text: "Unsaved progress will be lost.",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "CLEAR",
			cancelButtonText: "CANCEL",
			background: "#0a0a0a",
			color: "#fff",
			confirmButtonColor: "#ec5b13",
			cancelButtonColor: "#1a1a1a",
		});

		if (result.isConfirmed) {
			setProductData(initialState);
			setImageFile(null);
			setPreviewUrl(null);
			localStorage.removeItem("product_draft");
			if (onSuccess) onSuccess();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!imageFile && !productData.image_url) {
			return Toast.fire({
				icon: "warning",
				title: "Asset Media Required",
				text: "Please select an image to vault.",
			});
		}

		setLoading(true);

		try {
			let finalImageUrl = productData.image_url;

			if (imageFile) {
				const fileExt = imageFile.name.split(".").pop();
				const fileName = `${Math.random()}.${fileExt}`;
				const { error: uploadError } = await supabase.storage
					.from("verp-products")
					.upload(fileName, imageFile);

				if (uploadError) throw uploadError;

				const {
					data: { publicUrl },
				} = supabase.storage.from("verp-products").getPublicUrl(fileName);
				finalImageUrl = publicUrl;
			}

			const payload = {
				name: productData.name,
				category: productData.category,
				price: parseFloat(productData.price),
				description: productData.description,
				origin: productData.origin,
				series: productData.series,
				image_url: finalImageUrl,
			};

			const { error: dbError } = editData?.id
				? await supabase
						.from("verp_products")
						.update(payload)
						.eq("id", editData.id)
				: await supabase.from("verp_products").insert([payload]);

			if (dbError) throw dbError;

			try {
				await fetch("http://localhost:5000/api/notify-entry", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...payload }),
				});
			} catch (err) {
				console.warn("Notification failed.");
			}

			await Swal.fire({
				title: editData ? "VAULT UPDATED" : "MASTERPIECE VAULTED",
				text: `${productData.name} has been synchronized.`,
				icon: "success",
				background: "#0a0a0a",
				color: "#fff",
				confirmButtonColor: "#ec5b13",
			});

			setProductData(initialState);
			setImageFile(null);
			setPreviewUrl(null);
			localStorage.removeItem("product_draft");
			if (onSuccess) onSuccess();
		} catch (error) {
			Toast.fire({ icon: "error", title: "Entry Failed", text: error.message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-7xl mx-auto space-y-20 pb-32 px-6">
			<section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="mb-12">
					<div className="flex items-center gap-4 mb-3">
						<div className="w-12 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
						<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
							Section 01
						</span>
					</div>
					<h2 className="text-5xl font-light text-white tracking-tight">
						{editData ? "Edit" : "Category"}{" "}
						<span className="font-serif italic text-[#ec5b13]">
							Architecture
						</span>
					</h2>
				</div>
				{/* Category architecture placeholder */}
				<div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-12 mb-10">
					<p className="text-[10px] text-white/30 uppercase tracking-widest">
						Global Vault Categorization Active
					</p>
				</div>
			</section>

			<section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
				<div className="mb-12">
					<div className="flex items-center gap-4 mb-3">
						<div className="w-12 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
						<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
							Section 02
						</span>
					</div>
					<h2 className="text-5xl font-light text-white tracking-tight">
						{editData ? "Modify" : "Add New"}{" "}
						<span className="font-serif italic text-[#ec5b13]">
							Masterpiece
						</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<form className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-12 space-y-8">
							<div className="space-y-3">
								<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									Product Name
								</label>
								<input
									type="text"
									className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ec5b13]/50 transition-all text-sm font-light"
									value={productData.name}
									onChange={(e) =>
										setProductData({ ...productData, name: e.target.value })
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-3">
									<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Category
									</label>
									<input
										type="text"
										className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ec5b13]/50"
										value={productData.category}
										onChange={(e) =>
											setProductData({
												...productData,
												category: e.target.value,
											})
										}
									/>
								</div>
								<div className="space-y-3">
									<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Price (GH₵)
									</label>
									<input
										type="number"
										className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ec5b13]/50"
										value={productData.price}
										onChange={(e) =>
											setProductData({ ...productData, price: e.target.value })
										}
									/>
								</div>
								<div className="space-y-3">
									<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Origin
									</label>
									<input
										type="text"
										className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ec5b13]/50"
										value={productData.origin}
										onChange={(e) =>
											setProductData({ ...productData, origin: e.target.value })
										}
									/>
								</div>
								<div className="space-y-3">
									<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Series
									</label>
									<input
										type="text"
										className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#ec5b13]/50"
										value={productData.series}
										onChange={(e) =>
											setProductData({ ...productData, series: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="space-y-3">
								<label className="block text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									Description
								</label>
								<textarea
									className="w-full px-6 py-5 bg-black/20 border border-white/10 rounded-2xl text-white h-40 resize-none focus:outline-none focus:border-[#ec5b13]/50 transition-all"
									value={productData.description}
									onChange={(e) =>
										setProductData({
											...productData,
											description: e.target.value,
										})
									}
								></textarea>
							</div>
						</form>
					</div>

					<div className="space-y-6">
						{/* IMAGE UPLOAD & PREVIEW AREA */}
						<div className="relative group aspect-square rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/[0.01] to-transparent flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#ec5b13]/40">
							{previewUrl ? (
								<>
									<img
										src={previewUrl}
										alt="Preview"
										className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
										<button
											onClick={removeImage}
											className="p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110 shadow-xl"
											title="Purge Image"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M3 6h18" />
												<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
												<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
												<line x1="10" y1="11" x2="10" y2="17" />
												<line x1="14" y1="11" x2="14" y2="17" />
											</svg>
										</button>
									</div>
								</>
							) : (
								<label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-10 text-center">
									<input
										type="file"
										className="hidden"
										onChange={handleFileChange}
										accept="image/*"
									/>
									<div className="mb-4 p-4 rounded-full bg-white/5 text-white/20 group-hover:text-[#ec5b13] transition-colors">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="17 8 12 3 7 8" />
											<line x1="12" y1="3" x2="12" y2="15" />
										</svg>
									</div>
									<p className="text-xs font-light text-white/30 tracking-wide">
										Drop Asset Media or{" "}
										<span className="text-white/60 underline">Browse</span>
									</p>
								</label>
							)}
						</div>

						<div className="space-y-4">
							<button
								onClick={handleSubmit}
								disabled={loading}
								className="w-full px-8 py-5 bg-gradient-to-r from-[#ec5b13] to-[#d94e0f] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#ec5b13]/30 transition-all active:scale-[0.98] disabled:opacity-50"
							>
								{loading
									? "Synchronizing..."
									: editData
										? "Confirm Changes"
										: "Vault Masterpiece"}
							</button>
							<button
								onClick={handleClear}
								className="w-full px-8 py-5 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
							>
								Reset Architecture
							</button>
						</div>

						{/* Status Indicators */}
						<div className="pt-6 border-t border-white/5 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">
									Storage Status
								</span>
								<span className="text-[8px] text-green-500 uppercase font-bold tracking-widest">
									Optimal
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">
									Encryption
								</span>
								<span className="text-[8px] text-white/40 uppercase font-bold tracking-widest">
									AES-256
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AddProduct;
