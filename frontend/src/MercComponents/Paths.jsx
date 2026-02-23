import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AuthPage from "./SecurityLogics/AuthPage.jsx";
import NotFoundPage from "./SecurityLogics/NotFoundPage.jsx";
import PremiumLoader from "./SecurityLogics/PremiumLoader.jsx";
import StaffLogin from "./SecurityLogics/StaffLogin.jsx";
import About from "./Navoptions/About.jsx";
import Reviews from "./Navoptions/Reviews.jsx";
import { CartProvider } from "./Cartoptions/CartContext";
import Cart from "./Cartoptions/Cart.jsx";
import AdminDashBoard from "./Administration/AdminDashBoard.jsx";
import AllCategoriesPage from "./Homepage/AllCategoriesPage";
import Checkout from "./Cartpages/Checkout.jsx";
import SupportPage from "./Messages/SupportPage.jsx";
import AssistantTerminal from "./Assistant/AssistantTerminal.jsx";
import InboxPage from "./Administration/InboxPage.jsx";
import SocksPage from "./Cartpages/Sockspage.jsx";
import WatchesPage from "./Cartpages/WatchesPage.jsx";
import SneakersPage from "./Cartpages/SneakersPage.jsx";
import JewelryPage from "./Cartpages/JewelryPage.jsx";
import JacketPage from "./Cartpages/Jacketpage.jsx";
import GlassesPage from "./Cartpages/Glassespage.jsx";
import BeltsPage from "./Cartpages/BeltsPage.jsx";

/* ── Scroll to top on route change ── */
function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		const id = requestAnimationFrame(() => {
			window.scrollTo(0, 0);
			document.documentElement.scrollTo(0, 0);
		});
		return () => cancelAnimationFrame(id);
	}, [pathname]);
	return null;
}

/* ── Protected route — redirect to login if not authed ── */
const ProtectedRoute = ({ children }) => {
	const location = useLocation();
	const isAuthenticated = !!localStorage.getItem("userEmail");
	if (!isAuthenticated) {
		return (
			<Navigate to="/login" replace state={{ redirect: location.pathname }} />
		);
	}
	return children;
};

/* ── Auth routes — redirect to home if already logged in ── */
const GuestRoute = ({ children }) => {
	const isAuthenticated = !!localStorage.getItem("userEmail");
	if (isAuthenticated) return <Navigate to="/" replace />;
	return children;
};

/* ── Staff routes — redirect to staff login if not that role ── */
const StaffAdminRoute = ({ children }) => {
	const role = localStorage.getItem("staffRole");
	if (role !== "admin") return <Navigate to="/staff-login?from=admin" replace />;
	return children;
};
const StaffAssistantRoute = ({ children }) => {
	const role = localStorage.getItem("staffRole");
	if (role !== "assistant") return <Navigate to="/staff-login?from=assistant" replace />;
	return children;
};

function Paths() {
	const location = useLocation();
	const isAdminPath = location.pathname.startsWith("/admin");
	const isAssistantPath = location.pathname.startsWith("/assistant");
				const isAuthPath = [
					"/login",
					"/signup",
					"/verify-otp",
					"/forgot-password",
					"/reset-password",
					"/loading",
					"/staff-login",
				].some((p) => location.pathname.startsWith(p));

	return (
		<>
			<ScrollToTop />
			<CartProvider>
				<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
				{!isAdminPath && !isAssistantPath && !isAuthPath && <Navbar />}

				<main style={{ flex: 1, minHeight: 0 }}>
				<Routes>
					{/* ── Auth / Security ── */}
					<Route
						path="/login"
						element={
							<GuestRoute>
								<AuthPage mode="login" />
							</GuestRoute>
						}
					/>
					<Route
						path="/signup"
						element={
							<GuestRoute>
								<AuthPage mode="signup" />
							</GuestRoute>
						}
					/>
					<Route path="/verify-otp" element={<AuthPage mode="otp" />} />
					<Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
					<Route path="/reset-password" element={<AuthPage mode="reset" />} />
					<Route path="/loading" element={<PremiumLoader />} />
					<Route path="/staff-login" element={<StaffLogin />} />

					{/* ── Staff (protected by staff login) ── */}
					<Route path="/admin" element={<StaffAdminRoute><AdminDashBoard /></StaffAdminRoute>} />
					<Route path="/assistant" element={<StaffAssistantRoute><AssistantTerminal /></StaffAssistantRoute>} />

					{/* ── Public store ── */}
					<Route path="/" element={<Homepage />} />
					<Route path="/about" element={<About />} />
					<Route path="/categories" element={<AllCategoriesPage />} />
					<Route path="/category/boxers" element={<BoxerPage />} />
					<Route path="/category/shoes" element={<ShoePages />} />
					<Route path="/category/slides" element={<SlidesPage />} />
					<Route path="/category/shirts" element={<ShirtPage />} />
					<Route path="/category/caps" element={<CapPage />} />
					<Route path="/category/jewelry" element={<JewelryPage />} />
					<Route path="/category/jackets" element={<JacketPage />} />
					<Route path="/category/glasses" element={<GlassesPage />} />
					<Route path="/category/Belts" element={<BeltsPage />} />
					<Route path="/category/watches" element={<WatchesPage />} />
					<Route path="/category/sneakers" element={<SneakersPage />} />
					<Route path="/category/socks" element={<SocksPage />} />
					<Route path="/category/hoodies" element={<HoodiePage />} />
					<Route path="/category/sweatshirts" element={<SweatshirtPage />} />
					<Route path="/category/bags" element={<BagPage />} />

					{/* ── Protected ── */}
					<Route
						path="/orderpage"
						element={
							<ProtectedRoute>
								<OrdersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/cart"
						element={
							<ProtectedRoute>
								<Cart />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/checkout"
						element={
							<ProtectedRoute>
								<Checkout />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/orderStatus"
						element={
							<ProtectedRoute>
								<StatusTracker />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/inbox"
						element={
							<ProtectedRoute>
								<InboxPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/support"
						element={
							<ProtectedRoute>
								<SupportPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/reviews"
						element={
							<ProtectedRoute>
								<Reviews />
							</ProtectedRoute>
						}
					/>

					{/* ── 404 ── */}
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				</main>

				{!isAdminPath && !isAssistantPath && !isAuthPath && <Footer />}
				</div>
			</CartProvider>
		</>
	);
}

export default Paths;
