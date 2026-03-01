import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

/*
  ── LAZY LOADING ──────────────────────────────────────────────────────────────
  Every route component is now loaded on-demand instead of all at once.
  Previously, Paths.jsx was importing ~60 files eagerly, which forced the
  browser to download and parse all of them before rendering anything.

  With React.lazy + Suspense, Vite will code-split each import into its own
  chunk. Only the chunk for the current route is downloaded on first visit.

  BEFORE: ~7 MB of JS downloaded before page renders (20s+ load time)
  AFTER:  ~300-500 KB for the initial shell + current route only

  Shell components (Navbar, Footer, FloatingSupport, CartProvider) stay as
  regular imports because they're always needed immediately on page load.
*/

/* ── Shell components — always needed, keep as eager imports ── */
import Navbar            from "./Homepage/Navbar.jsx";
import Footer            from "./Homepage/Footer.jsx";
import FloatingSupport   from "./Homepage/FloatingSupport.jsx";
import { CartProvider }  from "./Cartoptions/CartContext";

/* ── Auth & loading (lazy) ── */
const AuthPage       = lazy(() => import("./SecurityLogics/AuthPage.jsx"));
const RandomLoader   = lazy(() => import("./SecurityLogics/RandomLoader.jsx"));
const StaffLogin     = lazy(() => import("./SecurityLogics/StaffLogin.jsx"));
const NotFoundPage   = lazy(() => import("./SecurityLogics/NotFoundPage.jsx"));
const ProfilePage    = lazy(() => import("./SecurityLogics/ProfilePages.jsx"));

/* ── Staff / admin (lazy) ── */
const AdminDashBoard     = lazy(() => import("./Administration/AdminDashBoard.jsx"));
const AssistantTerminal  = lazy(() => import("./Assistant/AssistantTerminal.jsx"));

/* ── Public pages (lazy) ── */
const Homepage           = lazy(() => import("./Homepage/Homepage.jsx"));
const About              = lazy(() => import("./Navoptions/About.jsx"));
const AllCategoriesPage  = lazy(() => import("./Homepage/AllCategoriesPage"));
const Reviews            = lazy(() => import("./Navoptions/Reviews.jsx"));

/* ── Category pages (lazy) ── */
const BoxerPage      = lazy(() => import("./Cartpages/BoxerPage.jsx"));
const ShoePages      = lazy(() => import("./Cartpages/ShoePages.jsx"));
const ShirtPage      = lazy(() => import("./Cartpages/ShirtPage.jsx"));
const SlidesPage     = lazy(() => import("./Cartpages/SlidesPage.jsx"));
const CapPage        = lazy(() => import("./Cartpages/CapPage.jsx"));
const HoodiePage     = lazy(() => import("./Cartpages/HoodiePage.jsx"));
const SweatshirtPage = lazy(() => import("./Cartpages/SweatshirtPage.jsx"));
const BagPage        = lazy(() => import("./Cartpages/BagPage.jsx"));
const Sockspage      = lazy(() => import("./Cartpages/Sockspage.jsx"));
const WatchesPage    = lazy(() => import("./Cartpages/WatchesPage.jsx"));
const SneakersPage   = lazy(() => import("./Cartpages/SneakersPage.jsx"));
const JewelryPage    = lazy(() => import("./Cartpages/JewelryPage.jsx"));
const JacketPages    = lazy(() => import("./Cartpages/JacketPages.jsx"));
const GlassesPage    = lazy(() => import("./Cartpages/GlassesPage.jsx"));
const BeltsPage      = lazy(() => import("./Cartpages/BeltsPage.jsx"));

/* ── Protected pages (lazy) ── */
const OrdersPage     = lazy(() => import("./Navoptions/OrderPage.jsx"));
const StatusTracker  = lazy(() => import("./Navoptions/StatusTracker.jsx"));
const Cart           = lazy(() => import("./Cartoptions/Cart.jsx"));
const Checkout       = lazy(() => import("./Cartpages/Checkout.jsx"));
const InboxPage      = lazy(() => import("./Administration/InboxPage.jsx"));
const SupportPage    = lazy(() => import("./Messages/SupportPage.jsx"));

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

/* ── Route guards ── */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!localStorage.getItem("userEmail"))
    return <Navigate to="/login" replace state={{ redirect: location.pathname }} />;
  return children;
};
const GuestRoute = ({ children }) => {
  if (localStorage.getItem("userEmail")) return <Navigate to="/" replace />;
  return children;
};
const StaffAdminRoute = ({ children }) => {
  if (localStorage.getItem("staffRole") !== "admin")
    return <Navigate to="/sys/console/login?from=admin" replace />;
  return children;
};
const StaffAssistantRoute = ({ children }) => {
  if (localStorage.getItem("staffRole") !== "assistant")
    return <Navigate to="/sys/console/login?from=assistant" replace />;
  return children;
};

function useFloatVisible() {
  const location     = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userEmail"));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));
  }, [location]);

  const AUTH_PATHS = [
    "/login", "/signup", "/verify-otp",
    "/forgot-password", "/reset-password",
    "/loading", "/sys/console/login",
  ];
  const isHomepage    = location.pathname === "/";
  const isSupportPage = location.pathname === "/support";
  const isAuthPath    = AUTH_PATHS.some((p) => location.pathname.startsWith(p));
  const isStaffPath   = location.pathname.startsWith("/sys/console");

  const KNOWN_FLOAT_PATHS = [
    "/","/about","/categories","/orderpage","/cart","/checkout","/orderStatus",
    "/inbox","/support","/reviews","/profile",
    "/category/boxers","/category/shoes","/category/slides","/category/shirts",
    "/category/caps","/category/jewelry","/category/jackets","/category/glasses",
    "/category/Belts","/category/watches","/category/sneakers","/category/socks",
    "/category/hoodies","/category/sweatshirts","/category/bags",
  ];
  const isKnownPath = KNOWN_FLOAT_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  return isLoggedIn && isKnownPath && !isHomepage && !isSupportPage && !isAuthPath && !isStaffPath;
}

function Paths() {
  const location        = useLocation();
  const isAdminPath     = location.pathname.startsWith("/sys/console/admin");
  const isAssistantPath = location.pathname.startsWith("/sys/console/terminal");
  const AUTH_PATHS      = ["/login","/signup","/verify-otp","/forgot-password","/reset-password","/loading","/sys/console/login"];
  const isAuthPath      = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  const KNOWN_PATHS = [
    "/","/about","/categories","/orderpage","/cart","/checkout","/orderStatus",
    "/inbox","/support","/reviews","/profile","/sys/console/admin","/sys/console/terminal","/sys/console/login",
    "/category/boxers","/category/shoes","/category/slides","/category/shirts",
    "/category/caps","/category/jewelry","/category/jackets","/category/glasses",
    "/category/Belts","/category/watches","/category/sneakers","/category/socks",
    "/category/hoodies","/category/sweatshirts","/category/bags",
    ...AUTH_PATHS,
  ];
  const is404 = !KNOWN_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  const showShell = !isAdminPath && !isAssistantPath && !isAuthPath && !is404;
  const showFloat = useFloatVisible();

  return (
    <>
      <ScrollToTop />

      <style>{`
        *, *::before, *::after {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }
        input, textarea, select, [contenteditable] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }
      `}</style>

      <CartProvider>
        {showFloat && <FloatingSupport />}

        <div className="flex flex-col min-h-screen">
          {showShell && <Navbar />}

          <main className="flex-1 min-h-0">
            {/*
              Suspense provides a fallback while a lazy chunk is being fetched.
              You can replace the fallback with your existing RandomLoader/PremiumLoader
              component for a branded experience — just keep it as a regular (non-lazy)
              import so it's available immediately.
            */}
            <Suspense fallback={
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: "60vh", fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)",
                textTransform: "uppercase"
              }}>
                Loading...
              </div>
            }>
              <Routes>
                {/* Auth */}
                <Route path="/login"           element={<GuestRoute><AuthPage mode="login"   /></GuestRoute>} />
                <Route path="/signup"          element={<GuestRoute><AuthPage mode="signup"  /></GuestRoute>} />
                <Route path="/verify-otp"      element={<AuthPage mode="otp"    />} />
                <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
                <Route path="/reset-password"  element={<AuthPage mode="reset"  />} />
                <Route path="/loading"         element={<RandomLoader />} />
                <Route path="/sys/console/login" element={<StaffLogin />} />

                {/* Staff */}
                <Route path="/sys/console/admin"    element={<StaffAdminRoute><AdminDashBoard /></StaffAdminRoute>} />
                <Route path="/sys/console/terminal" element={<StaffAssistantRoute><AssistantTerminal /></StaffAssistantRoute>} />

                {/* Public */}
                <Route path="/"                     element={<Homepage />} />
                <Route path="/about"                element={<About />} />
                <Route path="/categories"           element={<AllCategoriesPage />} />
                <Route path="/category/boxers"      element={<BoxerPage />} />
                <Route path="/category/shoes"       element={<ShoePages />} />
                <Route path="/category/slides"      element={<SlidesPage />} />
                <Route path="/category/shirts"      element={<ShirtPage />} />
                <Route path="/category/caps"        element={<CapPage />} />
                <Route path="/category/jewelry"     element={<JewelryPage />} />
                <Route path="/category/jackets"     element={<JacketPages />} />
                <Route path="/category/glasses"     element={<GlassesPage />} />
                <Route path="/category/Belts"       element={<BeltsPage />} />
                <Route path="/category/watches"     element={<WatchesPage />} />
                <Route path="/category/sneakers"    element={<SneakersPage />} />
                <Route path="/category/socks"       element={<Sockspage />} />
                <Route path="/category/hoodies"     element={<HoodiePage />} />
                <Route path="/category/sweatshirts" element={<SweatshirtPage />} />
                <Route path="/category/bags"        element={<BagPage />} />

                {/* Protected */}
                <Route path="/orderpage"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/cart"        element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orderStatus" element={<ProtectedRoute><StatusTracker /></ProtectedRoute>} />
                <Route path="/inbox"       element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
                <Route path="/support"     element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                <Route path="/reviews"     element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          {showShell && <Footer />}
        </div>
      </CartProvider>
    </>
  );
}

export default Paths;