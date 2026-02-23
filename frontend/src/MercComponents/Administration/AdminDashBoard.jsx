import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";
import AdminSidebar from "./AdminSidebar";
import Inventory from "./Inventory";
import AddProduct from "./AddProduct";
import ClientRequests from "./ClientRequests";
import AdminInbox from "./AdminInbox";
import Analytics from "./Analytics";
import ClientMessages from "./ClientMessages";
import AdminChannel from "./AdminChannel";
import Swal from "sweetalert2";

/* ─── HELPERS ────────────────────────────────────────────────── */
const PREMIUM_SWAL = {
	background: "#0a0a0a",
	color: "#fff",
	confirmButtonColor: "#ec5b13",
	cancelButtonColor: "#1a1a1a",
	customClass: {
		popup: "rounded-3xl border border-white/10",
		confirmButton:
			"rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
		cancelButton:
			"rounded-xl px-8 py-3 uppercase tracking-widest text-[10px] font-bold",
	},
};

/* Tabs that need 100vh flex layout (no page padding) */
const FULLSCREEN_TABS = new Set(["messages", "channel", "inbox"]);

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
const AdminDashBoard = () => {
	const [activeTab, setActiveTab] = useState("inventory");
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingProduct, setEditingProduct] = useState(null);

	/* ── Fetch products ── */
	const fetchProducts = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("verp_products")
				.select("*")
				.order("created_at", { ascending: false });
			if (error) throw error;
			setProducts(data || []);
		} catch (err) {
			console.error("Inventory fetch error:", err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	/* ── Delete product ── */
	const handleDelete = async (id) => {
		const product = products.find((p) => p.id === id);
		const result = await Swal.fire({
			...PREMIUM_SWAL,
			title: "DE-AUTHORIZE ASSET?",
			text: "This permanently purges the record and media from the vault.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "DELETE",
			cancelButtonText: "CANCEL",
		});
		if (!result.isConfirmed) throw new Error("Cancelled");

		try {
			if (product?.image_url) {
				const fileName = product.image_url.split("/").pop();
				await supabase.storage.from("verp-products").remove([fileName]);
			}
			const { error } = await supabase
				.from("verp_products")
				.delete()
				.eq("id", id);
			if (error) throw error;
			setProducts((prev) => prev.filter((p) => p.id !== id));
			Swal.fire({
				...PREMIUM_SWAL,
				title: "PURGED",
				icon: "success",
				timer: 1600,
				showConfirmButton: false,
			});
		} catch (err) {
			Swal.fire({
				...PREMIUM_SWAL,
				title: "VAULT ERROR",
				text: err.message,
				icon: "error",
			});
		}
	};

	/* ── Handlers ── */
	const handleEditInitiated = (product) => {
		setEditingProduct(product);
		setActiveTab("add-product");
	};
	const handleActionSuccess = () => {
		setEditingProduct(null);
		fetchProducts();
		setActiveTab("inventory");
	};

	/* ── Tab labels ── */
	const TAB_LABELS = {
		inventory: "Vault Inventory",
		"add-product": "Add Product",
		requests: "Order Flow",
		messages: "Client Messages",
		channel: "Admin Channel",
		inbox: "Supervisor Inbox",
		analytics: "Analytics & Broadcast",
	};

	/* ── Content renderer ── */
	const renderContent = () => {
		if (loading && activeTab === "inventory") {
			return (
				<div className="flex items-center justify-center py-32">
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
			case "messages":
				return <ClientMessages />;
			case "channel":
				return <AdminChannel />;
			case "inbox":
				return <AdminInbox />;
			case "analytics":
				return <Analytics />;
			default:
				return <Inventory products={products} />;
		}
	};

	const isFullscreen = FULLSCREEN_TABS.has(activeTab);

	return (
		<div
			className="flex bg-[#050505] text-white overflow-x-hidden"
			style={{
				fontFamily: "'DM Sans',sans-serif",
				minHeight: isFullscreen ? "100vh" : undefined,
				height: isFullscreen ? "100vh" : undefined,
			}}
		>
			{/* SIDEBAR */}
			<AdminSidebar
				activeTab={activeTab}
				setActiveTab={(tab) => {
					if (tab !== "add-product") setEditingProduct(null);
					setActiveTab(tab);
				}}
			/>

			{/* MAIN */}
			<main
				style={{
					flex: 1,
					marginLeft: 0,
					paddingTop: 60 /* mobile top-bar offset */,
					display: isFullscreen ? "flex" : "block",
					flexDirection: "column",
					height: isFullscreen ? "100vh" : undefined,
					overflow: isFullscreen ? "hidden" : undefined,
				}}
				className="lg:ml-[252px] lg:pt-0"
			>
				{/* Page header (non-fullscreen only) */}
				{!isFullscreen && (
					<header className="px-4 md:px-8 lg:px-12 pt-8 pb-6 flex justify-between items-center border-b border-white/5">
						<div>
							<h1 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
								Control <span style={{ color: "#ec5b13" }}>Center</span>
							</h1>
							<p
								className="text-[9px] font-bold text-white/25 uppercase mt-1"
								style={{ letterSpacing: "0.3em" }}
							>
								Verp Executive Interface / {TAB_LABELS[activeTab] || activeTab}
							</p>
						</div>
					</header>
				)}

				{/* Content area */}
				<div
					className={
						isFullscreen
							? "flex-1 overflow-hidden"
							: "px-4 md:px-8 lg:px-12 py-8"
					}
					style={isFullscreen ? { height: "100%" } : undefined}
				>
					{renderContent()}
				</div>
			</main>
		</div>
	);
};

export default AdminDashBoard;
