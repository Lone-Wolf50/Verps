import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";
import AdminSidebar from "./AdminSidebar";
import Inventory from "./Inventory";
import AddProduct from "./AddProduct";
import ClientRequests from "./ClientRequests";
import Inbox from "./Inbox";
import Swal from "sweetalert2";
import Analytics from "./Analytics";

const AdminDashBoard = () => {
	const [activeTab, setActiveTab] = useState("inventory");
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingProduct, setEditingProduct] = useState(null);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("verp_products")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			setProducts(data || []);
		} catch (error) {
			console.error("Error fetching inventory:", error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleDelete = async (id) => {
		// 1. Find the product to get the image URL before deleting
		const productToDelete = products.find((p) => p.id === id);

		// Premium Theme Config
		const premiumStyle = {
			background: "#0a0a0a",
			color: "#fff",
			confirmButtonColor: "#ec5b13",
			cancelButtonColor: "#1a1a1a",
			customClass: {
				popup: "rounded-3xl border border-white/10 backdrop-blur-xl",
				title: "text-2xl font-light tracking-tight uppercase",
				confirmButton:
					"rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
				cancelButton:
					"rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
			},
		};

		const result = await Swal.fire({
			...premiumStyle,
			title: "DE-AUTHORIZE ASSET?",
			text: "This will permanently purge the record and media from the vault.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "PERMANENT DELETE",
			cancelButtonText: "CANCEL",
		});

		if (result.isConfirmed) {
			try {
				console.log("--- CLEANUP START ---");

				// 2. Delete Image from Storage Bucket
				if (productToDelete?.image_url) {
					// Extracts the filename from the end of the URL
					const fileName = productToDelete.image_url.split("/").pop();
					console.log("Purging from storage:", fileName);

					const { error: storageError } = await supabase.storage
						.from("verp-products")
						.remove([fileName]);

					if (storageError)
						console.warn(
							"Bucket cleanup skipped/failed:",
							storageError.message,
						);
				}

				// 3. Delete Row from Database
				const { error, count } = await supabase
					.from("verp_products")
					.delete({ count: "exact" })
					.eq("id", id);

				if (error) throw error;

				// 4. Update UI state
				setProducts((prev) => prev.filter((p) => p.id !== id));

				// Success Alert
				await Swal.fire({
					...premiumStyle,
					title: "PURGED",
					text:
						count === 0
							? "Database row not found, but UI updated."
							: "Asset removed successfully.",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
				});
			} catch (error) {
				console.error("Deletion error details:", error);
				Swal.fire({
					...premiumStyle,
					title: "VAULT ERROR",
					text: error.message,
					icon: "error",
				});
				throw error;
			}
		} else {
			// This stops the 'Synchronizing' state in Inventory.js
			throw new Error("Cancelled by user");
		}
	};

	const handleEditInitiated = (product) => {
		console.log("--- EDIT INITIATED ---");
		console.log("Data being sent to AddProduct form:", product);
		setEditingProduct(product);
		setActiveTab("add-product");
	};
	// Add this to AdminDashBoard.jsx
	const handleActionSuccess = (updatedItem) => {
		console.log("--- SUCCESS TRIGGERED ---");
		if (updatedItem) {
			console.log("Item updated/added successfully:", updatedItem);
		} else {
			console.log("Action completed. Refreshing full vault list...");
		}

		setEditingProduct(null);
		fetchProducts(); // This pulls the fresh data from Supabase
		setActiveTab("inventory");
	};

	const renderContent = () => {
		if (loading && activeTab === "inventory") {
			return (
				<div className="flex justify-center p-20">
					<div className="animate-pulse text-white/20 uppercase tracking-widest text-xs font-bold">
						Accessing Vault...
					</div>
				</div>
			);
		}

		switch (activeTab) {
			case "inventory":
				return (
					<Inventory
						products={products}
						onDelete={handleDelete}
						onEdit={handleEditInitiated}
					/>
				);
			case "add-product":
				return (
					<AddProduct
						editData={editingProduct}
						onSuccess={handleActionSuccess}
					/>
				);
			case "requests":
				return <ClientRequests />;
			case "inbox":
				return <Inbox />;
			case "analytics":
				return <Analytics />;
			default:
				return <Inventory products={products} />;
		}
	};

	return (
		<div className="flex min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
			<AdminSidebar
				activeTab={activeTab}
				setActiveTab={(tab) => {
					if (tab !== "add-product") setEditingProduct(null);
					setActiveTab(tab);
				}}
			/>
			<main className="flex-1 transition-all duration-500 min-h-screen pt-20 lg:pt-0 lg:ml-64 px-6 md:px-12 py-10">
				<header className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
					<div>
						<h1 className="text-2xl font-black uppercase italic tracking-tighter">
							Control <span className="text-[#ec5b13]">Center</span>
						</h1>
						<p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
							Verp Executive Interface / {activeTab}
						</p>
					</div>
				</header>
				<div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
					{renderContent()}
				</div>
			</main>
		</div>
	);
};

export default AdminDashBoard;
