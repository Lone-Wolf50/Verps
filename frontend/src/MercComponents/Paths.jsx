import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Homepage          from "./Homepage/Homepage.jsx";
import BoxerPage         from "./Cartpages/BoxerPage.jsx";
import ShoePages         from "./Cartpages/ShoePages.jsx";
import ShirtPage         from "./Cartpages/ShirtPage.jsx";
import InboxPage         from "./Administration/InboxPage.jsx";
import Navbar            from "./Homepage/Navbar.jsx";
import Footer            from "./Homepage/Footer.jsx";
import FloatingSupport   from "./Homepage/FloatingSupport.jsx";
import SlidesPage        from "./Cartpages/SlidesPage.jsx";
import CapPage           from "./Cartpages/CapPage.jsx";
import HoodiePage        from "./Cartpages/HoodiePage.jsx";
import SweatshirtPage    from "./Cartpages/SweatshirtPage.jsx";
import BagPage           from "./Cartpages/BagPage.jsx";
import OrdersPage        from "./Navoptions/OrderPage.jsx";
import StatusTracker     from "./Navoptions/StatusTracker.jsx";
import AuthPage          from "./SecurityLogics/AuthPage.jsx";
import NotFoundPage      from "./SecurityLogics/NotFoundPage.jsx";
import PremiumLoader     from "./SecurityLogics/PremiumLoader.jsx";
import StaffLogin        from "./SecurityLogics/StaffLogin.jsx";
import About             from "./Navoptions/About.jsx";
import Reviews           from "./Navoptions/Reviews.jsx";
import { CartProvider }  from "./Cartoptions/CartContext";
import Cart              from "./Cartoptions/Cart.jsx";
import AdminDashBoard    from "./Administration/AdminDashBoard.jsx";
import AllCategoriesPage from "./Homepage/AllCategoriesPage";
import Checkout          from "./Cartpages/Checkout.jsx";
import SupportPage       from "./Messages/SupportPage.jsx";
import AssistantTerminal from "./Assistant/AssistantTerminal.jsx";
import Sockspage         from "./Cartpages/Sockspage.jsx";
import WatchesPage       from "./Cartpages/WatchesPage.jsx";
import SneakersPage      from "./Cartpages/SneakersPage.jsx";
import JewelryPage       from "./Cartpages/JewelryPage.jsx";
import JacketPages       from "./Cartpages/JacketPages.jsx";
import GlassesPage       from "./Cartpages/GlassesPage.jsx";
import BeltsPage         from "./Cartpages/BeltsPage.jsx";
import ProfilePage from "./SecurityLogics/ProfilePages.jsx";
import RandomLoader from "./SecurityLogics/RandomLoader.jsx";
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
  const isKnownPath = KNOWN_FLOAT_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));

  return isLoggedIn && isKnownPath && !isHomepage && !isSupportPage && !isAuthPath && !isStaffPath;
}

function Paths() {
  const location        = useLocation();
  const isAdminPath     = location.pathname.startsWith("/sys/console/admin");
  const isAssistantPath = location.pathname.startsWith("/sys/console/terminal");
  const AUTH_PATHS      = ["/login","/signup","/verify-otp","/forgot-password","/reset-password","/loading","/sys/console/login"];
  const isAuthPath      = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  // Check if current path matches any known route — if not, it's a 404
  const KNOWN_PATHS = [
    "/","/about","/categories","/orderpage","/cart","/checkout","/orderStatus",
    "/inbox","/support","/reviews","/profile","/sys/console/admin","/sys/console/terminal","/sys/console/login",
    "/category/boxers","/category/shoes","/category/slides","/category/shirts",
    "/category/caps","/category/jewelry","/category/jackets","/category/glasses",
    "/category/Belts","/category/watches","/category/sneakers","/category/socks",
    "/category/hoodies","/category/sweatshirts","/category/bags",
    ...AUTH_PATHS,
  ];
  const is404 = !KNOWN_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));

  const showShell       = !isAdminPath && !isAssistantPath && !isAuthPath && !is404;
  const showFloat       = useFloatVisible();

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
        {/* Single FloatingSupport — Navbar renders none */}
        {showFloat && <FloatingSupport />}

        <div className="flex flex-col min-h-screen">
          {showShell && <Navbar />}

          <main className="flex-1 min-h-0">
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
<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {showShell && <Footer />}
        </div>
      </CartProvider>
    </>
  );
}

export default Paths;