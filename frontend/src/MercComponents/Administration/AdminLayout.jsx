import React from "react";
import AdminSidebar from "./AdminSidebar";

/*
  Desktop (lg+):
    - Sidebar is a fixed icon-rail of 64px collapsed; hovers to 240px as an overlay.
    - Main content gets a permanent 64px left margin so it's never hidden behind the rail.
    - When sidebar expands on hover it floats over content with a shadow — no layout shift.

  Mobile / Tablet (< lg):
    - Topbar is 56px tall (fixed).
    - Sidebar slides in as a full drawer overlay.
    - Main content has pt-14 (56px) to clear the topbar.
*/

const AdminLayout = ({ children }) => {
	return (
		<div className="min-h-screen bg-[#050505] text-white">
			<AdminSidebar />

			<main
				className="
          min-h-screen
          pt-14 lg:pt-0
          lg:ml-16
          px-4 sm:px-6 lg:px-8
          py-6 lg:py-8
          overflow-y-auto
        "
			>
				<div className="max-w-[1400px] mx-auto w-full">
					{children}
				</div>
			</main>
		</div>
	);
};

export default AdminLayout;