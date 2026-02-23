import { useEffect,lazy, } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Homepage from "./Homepage/Homepage.jsx";
const BoxerPage = lazy(() => import("./Cartpages/BoxerPage.jsx"));
const ShoePages = lazy(() => import("./Cartpages/ShoePages.jsx"));
const ShirtPage = lazy(() => import("./Cartpages/ShirtPage.jsx"));
const InboxPage = lazy(() => import("./Administration/InboxPage.jsx"));
import Navbar from "./Homepage/Navbar.jsx";
import Footer from "./Homepage/Footer.jsx";
const SlidesPage = lazy(() => import("./Cartpages/SlidesPage.jsx"));
const CapPage = lazy(() => import("./Cartpages/CapPage.jsx"));
const HoodiePage = lazy(() => import("./Cartpages/HoodiePage.jsx"));
const SweatshirtPage = lazy(() => import("./Cartpages/SweatshirtPage.jsx"));
const BagPage = lazy(() => import("./Cartpages/BagPage.jsx"));
const OrdersPage = lazy(() => import("./Navoptions/OrderPage.jsx"));
const StatusTracker = lazy(() => import("./Navoptions/StatusTracker.jsx"));
const AuthPage = lazy(() => import("./SecurityLogics/AuthPage.jsx"));
const NotFoundPage = lazy(() => import("./SecurityLogics/NotFoundPage.jsx"));
import PremiumLoader from "./SecurityLogics/PremiumLoader.jsx";
const StaffLogin = lazy(() => import("./SecurityLogics/StaffLogin.jsx"));
const About = lazy(() => import("./Navoptions/About.jsx"));
const Reviews = lazy(() => import("./Navoptions/Reviews.jsx"));import { CartProvider } from "./Cartoptions/CartContext";
const Cart = lazy(() => import("./Cartoptions/Cart.jsx"));
const AdminDashBoard = lazy(() => import("./Administration/AdminDashBoard.jsx"));
const AllCategoriesPage = lazy(() => import("./Homepage/AllCategoriesPage"));
const Checkout = lazy(() => import("./Cartpages/Checkout.jsx"));
const SupportPage = lazy(() => import("./Messages/SupportPage.jsx"));
const AssistantTerminal = lazy(() => import("./Assistant/AssistantTerminal.jsx"));const Sockspage = lazy(() => import("./Cartpages/Sockspage.jsx"));
const WatchesPage = lazy(() => import("./Cartpages/WatchesPage.jsx"));
const SneakersPage = lazy(() => import("./Cartpages/SneakersPage.jsx"));
const JewelryPage = lazy(() => import("./Cartpages/JewelryPage.jsx"));
const JacketPages = lazy(() => import("./Cartpages/JacketPages.jsx")); // Fixed your 'S' name
const GlassesPage = lazy(() => import("./Cartpages/Glassespage.jsx"));
const BeltsPage = lazy(() => import("./Cartpages/BeltsPage.jsx"));

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
					<Route path="/category/jackets" element={<JacketPages />} />
					<Route path="/category/glasses" element={<GlassesPage />} />
					<Route path="/category/Belts" element={<BeltsPage />} />
					<Route path="/category/watches" element={<WatchesPage />} />
					<Route path="/category/sneakers" element={<SneakersPage />} />
					<Route path="/category/socks" element={<Sockspage />} />
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
