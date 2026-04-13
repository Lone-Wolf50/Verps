
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PremiumLoader  from "./PremiumLoader.jsx";
import PremiumLoader2 from "./PremiumLoader2.jsx";
import PremiumLoader3 from "./PremmiumLoader3.jsx";

const LOADERS = [PremiumLoader, PremiumLoader2, PremiumLoader3];

export default function RandomLoader() {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait a moment for session initialization, then redirect
    const timer = setTimeout(() => {
      const userEmail = localStorage.getItem("userEmail");
      console.log("🔄 RandomLoader redirecting check - userEmail:", userEmail);
      if (userEmail) {
        // ✅ User is logged in — redirect to home
        console.log("✅ User logged in, redirecting to /");
        navigate("/", { replace: true });
      } else {
        // ❌ Session restoration failed — redirect to login
        console.log("❌ Session restoration failed, redirecting to /login");
        navigate("/login", { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Pick once per mount — stable across re-renders
  const Loader = LOADERS[Math.floor(Math.random() * LOADERS.length)];
  return <Loader />;
}