import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Homepage from "./Homepage/Homepage.jsx";
import BoxerPage from "./Cartpages/BoxerPage.jsx";
import ShoePages from "./Cartpages/ShoePages.jsx";
import ShirtPage from "./Cartpages/ShirtPage.jsx";
import Navbar from "./Homepage/Navbar.jsx";
import Footer from "./Homepage/Footer.jsx";
import SlidesPage from "./Cartpages/SlidesPage.jsx";
import CapPage from "./Cartpages/CapPage.jsx";
import HoodiePage from "./Cartpages/HoodiePage.jsx";
import SweatshirtPage from "./Cartpages/SweatshirtPage.jsx";
import BagPage from "./Cartpages/BagPage.jsx";
import OrdersPage from "./Navoptions/OrderPage.jsx";
import StatusTracker from "./Navoptions/StatusTracker.jsx";
import Support from "./Navoptions/Support.jsx";
import About from "./Navoptions/About.jsx";
import Reviews from "./Navoptions/Reviews.jsx";
import { CartProvider } from "./Cartoptions/CartContext";
import Cart from "./Cartoptions/Cart.jsx";
import AdminDashBoard from "./Administration/AdminDashBoard.jsx";
// In your router (App.jsx or routes file):
import AllCategoriesPage from "./Homepage/AllCategoriesPage";
import Checkout from "./Cartpages/Checkout.jsx";

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		// Target everything that could possibly be scrolling
		const targetScroll = () => {
			window.scrollTo(0, 0);
			document.documentElement.scrollTo(0, 0);
			document.body.scrollTo(0, 0);
		};

		// Use requestAnimationFrame to ensure the DOM has updated before scrolling
		const timeoutId = requestAnimationFrame(targetScroll);

		return () => cancelAnimationFrame(timeoutId);
	}, [pathname]);

	return null;
}
function Paths() {
	const location = useLocation();

	// 1. Define which paths should hide the standard Nav/Footer
	const isAdminPath = location.pathname.startsWith("/admin");

	return (
		<>
			<ScrollToTop />
			<CartProvider>
				{/* 2. Conditionally render Navbar: Only if NOT on admin path */}
				{!isAdminPath && <Navbar />}

				<Routes>
					{/* Admin Route */}
					<Route path="/admin" element={<AdminDashBoard />} />

					{/* Store Routes */}
					<Route path="/" element={<Homepage />} />
					<Route path="/category/boxers" element={<BoxerPage />} />
					<Route path="/category/shoes" element={<ShoePages />} />
					<Route path="/category/slides" element={<SlidesPage />} />
					<Route path="/category/shirts" element={<ShirtPage />} />
					<Route path="/category/caps" element={<CapPage />} />
					<Route path="/category/hoodie" element={<HoodiePage />} />
					<Route path="/category/sweatshirts" element={<SweatshirtPage />} />
					<Route path="/category/bags" element={<BagPage />} />
					<Route path="/orderpage" element={<OrdersPage />} />
					<Route path="/checkout" element={<Checkout />} />
					<Route path="/orderStatus" element={<StatusTracker />} />
					<Route path="/support" element={<Support />} />
					<Route path="/about" element={<About />} />
					<Route path="/reviews" element={<Reviews />} />
					<Route path="/cart" element={<Cart />} />
					<Route path="/categories" element={<AllCategoriesPage />} />
				</Routes>

				{/* 3. Conditionally render Footer: Only if NOT on admin path */}
				{!isAdminPath && <Footer />}
			</CartProvider>
		</>
	);
}

export default Paths;
