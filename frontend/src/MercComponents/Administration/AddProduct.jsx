import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Swal from "sweetalert2";
import { API_URL } from "../../config";
import { Trash2, UploadCloud } from "lucide-react";

const AddProduct = ({ editData, onSuccess }) => {
	const [loading, setLoading] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	// Add this near your other category states
	const [editingCategoryId, setEditingCategoryId] = useState(null);
	// Category section state
	const [categoryImageFile, setCategoryImageFile] = useState(null);
	const [categoryPreviewUrl, setCategoryPreviewUrl] = useState(null);
	const [categoryName, setCategoryName] = useState("");
	const [categories, setCategories] = useState([]);

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
	const handleEditCategory = (category) => {
		setEditingCategoryId(category.id);
		setCategoryName(category.name);
		setCategoryPreviewUrl(category.image_url);
		// Scroll smoothly back to the top form
		window.scrollTo({ top: 0, behavior: "smooth" });
	};
	const fetchCategories = async () => {
		const { data, error } = await supabase
			.from("verp_categories")
			.select("*") // Get everything (id, name, image_url)
			.order("name", { ascending: true });

		if (error) {
			console.error("Vault Error:", error.message);
		} else {
			// This is the critical line. Ensure 'categories' is the
			// same variable used in your .map() functions.
			setCategories(data || []);
		}
	};

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
	useEffect(() => {
		console.log("MANAGE CATEGORIES: Component Mounted");
		fetchCategories();
	}, []);
	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setImageFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleCategoryFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setCategoryImageFile(file);
			setCategoryPreviewUrl(URL.createObjectURL(file));
		}
	};

	const removeImage = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setImageFile(null);
		setPreviewUrl(null);
		setProductData({ ...productData, image_url: "" });
	};

	const removeCategoryImage = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setCategoryImageFile(null);
		setCategoryPreviewUrl(null);
	};

	const handleCategorySave = async () => {
		// If NOT editing, we require an image. If editing, image is optional.
		if (!categoryName.trim() || (!editingCategoryId && !categoryImageFile)) {
			return Toast.fire({
				icon: "warning",
				title: "Missing Data",
				text: "Please provide the category name and an image asset.",
			});
		}

		setLoading(true);
		try {
			let finalImageUrl = categoryPreviewUrl;

			// Only upload a new image if the user selected a new file
			if (categoryImageFile) {
				const fileExt = categoryImageFile.name.split(".").pop();
				const fileName = `category_${Math.random()}.${fileExt}`;
				const { error: uploadError } = await supabase.storage
					.from("verp-products")
					.upload(fileName, categoryImageFile);

				if (uploadError) throw uploadError;

				const {
					data: { publicUrl },
				} = supabase.storage.from("verp-products").getPublicUrl(fileName);

				finalImageUrl = publicUrl;
			}

			const payload = {
				name: categoryName,
				image_url: finalImageUrl,
			};

			let error;
			if (editingCategoryId) {
				// UPDATE existing architecture
				const { error: updateError } = await supabase
					.from("verp_categories")
					.update(payload)
					.eq("id", editingCategoryId);
				error = updateError;
			} else {
				// INSERT new architecture
				const { error: insertError } = await supabase
					.from("verp_categories")
					.insert([payload]);
				error = insertError;
			}

			if (error) throw error;

			// Refresh all instances of categories in the UI
			await fetchCategories();

			await Swal.fire({
				title: editingCategoryId ? "ARCHITECTURE UPDATED" : "CATEGORY CREATED",
				text: `${categoryName} has been synchronized in the vault.`,
				icon: "success",
				background: "#0a0a0a",
				color: "#fff",
				confirmButtonColor: "#ec5b13",
			});

			// Reset all states back to neutral
			setCategoryName("");
			setCategoryImageFile(null);
			setCategoryPreviewUrl(null);
			setEditingCategoryId(null); // Critical: exit edit mode
		} catch (error) {
			Toast.fire({
				icon: "error",
				title: "Operation Failed",
				text: error.message,
			});
		} finally {
			setLoading(false);
		}
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
	const handleDeleteCategory = async (id, name, imageUrl) => {
		const result = await Swal.fire({
			title: "PURGE CATEGORY?",
			text: `Permanently remove ${name} from Vault and Storage?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "CONFIRM PURGE",
			background: "#0a0a0a",
			color: "#fff",
			confirmButtonColor: "#ec5b13",
		});

		if (result.isConfirmed) {
			setLoading(true);
			try {
				// 1. EXTRACT FILENAME
				// We split by '/' and take the last part
				const fileName = imageUrl.split("/").pop();

				// 2. DELETE FROM STORAGE

				const { data: storageData, error: storageError } =
					await supabase.storage.from("verp-products").remove([fileName]);

				if (storageError) {
					console.error("STORAGE ERROR:", storageError);
				} else {
					console.log("STORAGE SUCCESS:", storageData);
				}

				// 3. DELETE FROM DATABASE

				const { error: dbError } = await supabase
					.from("verp_categories")
					.delete()
					.eq("id", id);

				if (dbError) throw dbError;

				Toast.fire({
					icon: "success",
					title: "Vault Purged",
					text: "Database row and storage file removed.",
				});

				await fetchCategories();
			} catch (error) {
				console.error("CRITICAL ERROR:", error.message);
			} finally {
				setLoading(false);
			}
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
				await fetch(`${API_URL}/api/send-otp`, {
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
	console.log("Current Component State:", categories);
	return (
		<div className="max-w-7xl mx-auto space-y-20 pb-32 px-4 md:px-6">
			{/* SECTION 01 - CATEGORY ARCHITECTURE */}
			<section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="mb-8 md:mb-12">
					<div className="flex items-center gap-4 mb-3">
						<div className="w-12 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
						<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
							Section 01
						</span>
					</div>
					<h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">
						Category{" "}
						<span className="font-serif italic text-[#ec5b13]">
							Architecture
						</span>
					</h2>
				</div>

				<div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-6 md:p-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
						{/* Category Image Upload */}
						<div className="relative group aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/[0.01] to-transparent flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#ec5b13]/40">
							{categoryPreviewUrl ? (
								<>
									<img
										src={categoryPreviewUrl}
										alt="Category Preview"
										className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
									/>
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<button
											onClick={removeCategoryImage}
											className="p-3 md:p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110 shadow-xl"
											title="Remove Image"
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
								<label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center">
									<input
										type="file"
										className="hidden"
										onChange={handleCategoryFileChange}
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
									<p className="text-xs md:text-sm font-light text-white/30 tracking-wide">
										Drop Category Image or{" "}
										<span className="text-white/60 underline">Browse</span>
									</p>
								</label>
							)}
						</div>

						{/* Category Name & Actions */}
						<div className="flex flex-col justify-center gap-6">
							<div className="space-y-3">
								<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									{editingCategoryId
										? "Update Classification Name"
										: "Category Name"}
								</label>
								<input
									type="text"
									className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
									placeholder="e.g. Performance Series"
									value={categoryName}
									onChange={(e) => setCategoryName(e.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-3">
								<button
									onClick={handleCategorySave}
									disabled={loading}
									className="w-full px-6 md:px-8 py-4 md:py-5 bg-gradient-to-r from-[#ec5b13] to-[#d94e0f] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#ec5b13]/30 transition-all active:scale-[0.98] disabled:opacity-50"
								>
									{loading
										? "Processing..."
										: editingCategoryId
											? "Update Vault Entry"
											: "Create Category"}
								</button>

								{/* Cancel Edit Button */}
								{editingCategoryId && (
									<button
										onClick={() => {
											setEditingCategoryId(null);
											setCategoryName("");
											setCategoryPreviewUrl(null);
											setCategoryImageFile(null);
										}}
										className="text-[9px] font-bold uppercase text-white/20 hover:text-red-500 transition-colors tracking-[0.2em] text-center"
									>
										Abort Edit
									</button>
								)}
							</div>

							<p className="text-[9px] md:text-[10px] text-white/20 uppercase tracking-widest text-center">
								{editingCategoryId
									? "Modifying existing vault structure"
									: "Add categories to organize products"}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* SECTION 02 - ADD/EDIT PRODUCT */}
			<section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
				<div className="mb-8 md:mb-12">
					<div className="flex items-center gap-4 mb-3">
						<div className="w-12 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
						<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
							Section 02
						</span>
					</div>
					<h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">
						{editData ? "Modify" : "Add New"}{" "}
						<span className="font-serif italic text-[#ec5b13]">
							Masterpiece
						</span>
					</h2>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
					<div className="lg:col-span-2">
						<form className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-6 md:p-12 space-y-6 md:space-y-8">
							<div className="space-y-3">
								<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									Product Name
								</label>
								<input
									type="text"
									className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
									placeholder="Enter product name"
									value={productData.name}
									onChange={(e) =>
										setProductData({ ...productData, name: e.target.value })
									}
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
								<div className="space-y-3">
									<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Category
									</label>
									<input
										type="text"
										className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
										placeholder="e.g., Bags"
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
									<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Price (GH₵)
									</label>
									<input
										type="number"
										className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
										placeholder="0.00"
										value={productData.price}
										onChange={(e) =>
											setProductData({ ...productData, price: e.target.value })
										}
									/>
								</div>
								<div className="space-y-3">
									<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Origin
									</label>
									<input
										type="text"
										className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
										placeholder="e.g., Italy"
										value={productData.origin}
										onChange={(e) =>
											setProductData({ ...productData, origin: e.target.value })
										}
									/>
								</div>
								<div className="space-y-3">
									<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
										Series
									</label>
									<input
										type="text"
										className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
										placeholder="e.g., 2026"
										value={productData.series}
										onChange={(e) =>
											setProductData({ ...productData, series: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="space-y-3">
								<label className="block text-[9px] md:text-[10px] font-bold uppercase text-white/50 tracking-[0.2em]">
									Description
								</label>
								<textarea
									className="w-full px-4 md:px-6 py-4 md:py-5 bg-black/20 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base h-32 md:h-40 resize-none focus:outline-none focus:border-[#ec5b13]/50 transition-all font-light"
									placeholder="Describe the product..."
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
						<div className="relative group aspect-square rounded-2xl md:rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-br from-white/[0.01] to-transparent flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#ec5b13]/40">
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
											className="p-3 md:p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110 shadow-xl"
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
								<label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 md:p-10 text-center">
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
									<p className="text-xs md:text-sm font-light text-white/30 tracking-wide">
										Drop Asset Media or{" "}
										<span className="text-white/60 underline">Browse</span>
									</p>
								</label>
							)}
						</div>

						<div className="space-y-3 md:space-y-4">
							<button
								onClick={handleSubmit}
								disabled={loading}
								className="w-full px-6 md:px-8 py-4 md:py-5 bg-gradient-to-r from-[#ec5b13] to-[#d94e0f] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#ec5b13]/30 transition-all active:scale-[0.98] disabled:opacity-50"
							>
								{loading
									? "Synchronizing..."
									: editData
										? "Confirm Changes"
										: "Vault Masterpiece"}
							</button>
							<button
								onClick={handleClear}
								className="w-full px-6 md:px-8 py-4 md:py-5 bg-white/5 border border-white/10 text-white/40 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
							>
								Reset Architecture
							</button>
						</div>

						{/* Status Indicators */}
						<div className="pt-4 md:pt-6 border-t border-white/5 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-[8px] md:text-[9px] text-white/20 uppercase font-bold tracking-widest">
									Storage Status
								</span>
								<span className="text-[8px] md:text-[9px] text-green-500 uppercase font-bold tracking-widest">
									Optimal
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-[8px] md:text-[9px] text-white/20 uppercase font-bold tracking-widest">
									Encryption
								</span>
								<span className="text-[8px] md:text-[9px] text-white/40 uppercase font-bold tracking-widest">
									AES-256
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>
			{/* SECTION 03 - CATEGORY REPOSITORY */}
			<section className="mt-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
				<div className="mb-8 md:mb-12">
					<div className="flex items-center gap-4 mb-3">
						<div className="w-12 h-[2px] bg-gradient-to-r from-[#ec5b13] to-transparent"></div>
						<span className="text-[9px] font-black text-[#ec5b13] uppercase tracking-[0.4em]">
							Section 03
						</span>
					</div>
					<h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">
						Vault{" "}
						<span className="font-serif italic text-[#ec5b13]">Repository</span>
					</h2>
				</div>

				{/* The Grid */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
					{/* 1. DATA RENDER: Only maps if categories exist */}
					{categories.length > 0 &&
						categories.map((cat) => (
							<div
								key={cat.id}
								className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] transition-all hover:border-[#ec5b13]/30"
							>
								<img
									src={cat.image_url}
									alt={cat.name}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
								/>

								<div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
									<p className="text-[10px] text-[#ec5b13] font-black uppercase tracking-[0.2em] mb-1">
										Category
									</p>
									<h3 className="text-white font-light text-lg tracking-tight truncate">
										{cat.name}
									</h3>
								</div>

								<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
									<button
										onClick={() => handleEditCategory(cat)}
										className="w-32 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#ec5b13] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
									>
										Edit
									</button>
									<button
										onClick={() =>
											handleDeleteCategory(cat.id, cat.name, cat.image_url)
										}
										className="w-32 py-2.5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:border-red-600 transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
									>
										Delete
									</button>
								</div>
							</div>
						))}

					{/* 2. LOADING STATE: Prevents "Empty" flash on refresh */}
					{loading && categories.length === 0 && (
						<div className="col-span-full py-24 text-center">
							<div className="inline-block w-8 h-8 border-2 border-t-[#ec5b13] border-white/10 rounded-full animate-spin mb-4"></div>
							<p className="text-[#ec5b13] uppercase tracking-[0.3em] text-[10px] font-bold animate-pulse">
								Synchronizing Vault Data...
							</p>
						</div>
					)}

					{/* 3. EMPTY STATE: Only shows if NOT loading and actually empty */}
					{!loading && categories.length === 0 && (
						<div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
							<div className="inline-flex p-4 rounded-full bg-white/5 text-white/10 mb-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect width="20" height="20" x="2" y="2" rx="2" ry="2" />
									<path d="M12 8v8" />
									<path d="M8 12h8" />
								</svg>
							</div>
							<p className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-bold">
								The repository is currently empty
							</p>
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default AddProduct;
