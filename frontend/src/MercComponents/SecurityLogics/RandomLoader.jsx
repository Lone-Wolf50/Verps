
import PremiumLoader  from "./PremiumLoader.jsx";
import PremiumLoader2 from "./PremiumLoader2.jsx";
import PremiumLoader3 from "./PremmiumLoader3.jsx";

const LOADERS = [PremiumLoader, PremiumLoader2, PremiumLoader3];

export default function RandomLoader() {
  // Pick once per mount — stable across re-renders
  const Loader = LOADERS[Math.floor(Math.random() * LOADERS.length)];
  return <Loader />;
}