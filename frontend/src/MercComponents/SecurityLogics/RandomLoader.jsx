
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PremiumLoader  from "./PremiumLoader.jsx";
import PremiumLoader2 from "./PremiumLoader2.jsx";
import PremiumLoader3 from "./PremmiumLoader3.jsx";

const LOADERS = [PremiumLoader, PremiumLoader2, PremiumLoader3];

export default function RandomLoader() {
  const navigate = useNavigate();

  useEffect(() => {
    /* Hook: Wait for session initialization, then redirect based on login status */
    const timer = setTimeout(() => {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        /* User logged in — proceed to home page */
        navigate("/", { replace: true });
      } else {
        /* No session found — return to login */
        navigate("/login", { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Pick once per mount — stable across re-renders
  const Loader = LOADERS[Math.floor(Math.random() * LOADERS.length)];
  return <Loader />;
}