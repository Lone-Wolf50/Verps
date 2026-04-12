import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

/* ── Shell components ── */
import Navbar            from "./Homepage/Navbar.jsx";
import Footer            from "./Homepage/Footer.jsx";
import FloatingSupport   from "./Homepage/FloatingSupport.jsx";
import { CartProvider }  from "./Cartoptions/CartContext";

/* ── PWA install banner ── */
import VerpInstallBanner from "./Homepage/VerpInstallBanner.jsx";

/* ── Supabase (for pagehide session cleanup) ── */
import { supabase } from "../supabaseClient";

/* ── Auth & loading ── */
import AuthPage       from "./SecurityLogics/AuthPage.jsx";
import RandomLoader   from "./SecurityLogics/RandomLoader.jsx";
import StaffLogin     from "./SecurityLogics/StaffLogin.jsx";
import NotFoundPage   from "./SecurityLogics/NotFoundPage.jsx";
import ProfilePage    from "./SecurityLogics/ProfilePages.jsx";

/* ── Staff / admin ── */
import AdminDashBoard     from "./Administration/AdminDashBoard.jsx";
import AssistantTerminal  from "./Assistant/AssistantTerminal.jsx";

/* ── Public pages ── */
import Homepage           from "./Homepage/Homepage.jsx";
import About              from "./Navoptions/About.jsx";
import AllCategoriesPage  from "./Homepage/AllCategoriesPage";
import Reviews            from "./Navoptions/Reviews.jsx";

/* ── Category pages ── */
import BoxerPage      from "./Cartpages/BoxerPage.jsx";
import ShoePages      from "./Cartpages/ShoePages.jsx";
import ShirtPage      from "./Cartpages/ShirtPage.jsx";
import SlidesPage     from "./Cartpages/SlidesPage.jsx";
import CapPage        from "./Cartpages/CapPage.jsx";
import HoodiePage     from "./Cartpages/HoodiePage.jsx";
import SweatshirtPage from "./Cartpages/SweatshirtPage.jsx";
import BagPage        from "./Cartpages/BagPage.jsx";
import Sockspage      from "./Cartpages/Sockspage.jsx";
import WatchesPage    from "./Cartpages/WatchesPage.jsx";
import SneakersPage   from "./Cartpages/SneakersPage.jsx";
import JewelryPage    from "./Cartpages/JewelryPage.jsx";
import JacketPages    from "./Cartpages/JacketPages.jsx";
import GlassesPage    from "./Cartpages/GlassesPage.jsx";
import BeltsPage      from "./Cartpages/BeltsPage.jsx";

/* ── Protected pages ── */
import OrdersPage     from "./Navoptions/OrderPage.jsx";
import StatusTracker  from "./Navoptions/StatusTracker.jsx";
import Cart           from "./Cartoptions/Cart.jsx";
import Checkout       from "./Cartpages/Checkout.jsx";
import InboxPage      from "./Administration/InboxPage.jsx";
import SupportPage    from "./Messages/SupportPage.jsx";
import ReviewPrompt   from "./Homepage/ReviewPrompt.jsx";

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

/* ── Review prompt visibility ────────────────────────────────────
   Mount on any client-facing page once the user is logged in.
   Staff paths and auth flows are excluded — no prompt there.
── */
function useReviewPromptEmail() {
  const location = useLocation();
  const [email, setEmail] = useState(localStorage.getItem("userEmail"));

  useEffect(() => {
    setEmail(localStorage.getItem("userEmail"));
  }, [location]);

  const isStaffPath = location.pathname.startsWith("/sys/console");
  const AUTH_PATHS  = ["/login","/signup","/verify-otp","/forgot-password","/reset-password","/loading"];
  const isAuthPath  = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  if (!email || isStaffPath || isAuthPath) return null;
  return email;
}

/* ── Install banner visibility ───────────────────────────────────
   Show on all client-facing pages — staff and auth flows excluded.
── */
function useShowInstallBanner() {
  const location = useLocation();
  const isStaffPath = location.pathname.startsWith("/sys/console");
  const AUTH_PATHS  = ["/login","/signup","/verify-otp","/forgot-password","/reset-password","/loading"];
  const isAuthPath  = AUTH_PATHS.some((p) => location.pathname.startsWith(p));
  return !isStaffPath && !isAuthPath;
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

  const showShell         = !isAdminPath && !isAssistantPath && !isAuthPath && !is404;
  const showFloat         = useFloatVisible();
  const reviewEmail       = useReviewPromptEmail();
  const showInstallBanner = useShowInstallBanner();

  /* ── PWA vs browser session logic ── */
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userEmail"));

  useEffect(() => {
  const staffRoleLS = localStorage.getItem("staffRole");
  const staffRoleSS = sessionStorage.getItem("staffRole");
  const isStaffSession = staffRoleLS || staffRoleSS;

  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  // Stamp a persistent flag the first time we detect PWA mode
  if (isPWA) localStorage.setItem("vrp_is_pwa", "1");
  const wasPWA = !!localStorage.getItem("vrp_is_pwa"); // survives app restarts

  if (wasPWA) {
    /* PWA users — grace period logic, untouched */
    const lastSeen    = localStorage.getItem("vrp_last_seen");
    const gracePeriod = 7 * 24 * 60 * 60 * 1000;
    const expired     = lastSeen && (Date.now() - parseInt(lastSeen)) > gracePeriod;

    if (expired && !isStaffSession) {
      ["userEmail","userId","userName","deviceFingerprint","luxury_cart","vrp_last_seen","vrp_session_type"]
        .forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("guest_cart");
      setIsLoggedIn(false);
    }

    localStorage.setItem("vrp_last_seen", Date.now().toString());

  } else {
    /* Browser/web users — sessionStorage tab-tracking, untouched */
    const vrpAlive = sessionStorage.getItem("vrp_alive");
    if (!vrpAlive && !isStaffSession) {
      ["userEmail","userId","userName","deviceFingerprint","luxury_cart"]
        .forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("guest_cart");
      setIsLoggedIn(false);
    }
  }

  sessionStorage.setItem("vrp_alive", "1");

  const onPageHide = (e) => {
    if (!e.persisted) {
      const fp  = localStorage.getItem("deviceFingerprint");
      const uid = localStorage.getItem("userId");
      if (fp && uid)
        supabase.from("verp_sessions").delete().match({ user_id: uid, device_fingerprint: fp });
    }
  };
  window.addEventListener("pagehide", onPageHide);
  return () => window.removeEventListener("pagehide", onPageHide);
}, []);
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
        {reviewEmail && <ReviewPrompt userEmail={reviewEmail} />}
        {showInstallBanner && <VerpInstallBanner />}

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
              <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

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