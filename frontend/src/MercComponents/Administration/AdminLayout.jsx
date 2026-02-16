import React from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
	return (
		<div className="flex min-h-screen bg-[#050505] text-white">
			<AdminSidebar />
			<main className="flex-1 p-8 ml-64 overflow-y-auto">{children}</main>
		</div>
	);
};

export default AdminLayout;
