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
// 1. This function resets scroll to top on every page change
function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

function Paths() {
	return (
		<>
			{/* 2. Place it here inside the Router but outside the Routes */}
			<ScrollToTop />
			<Navbar />
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/category/boxers" element={<BoxerPage />} />
				<Route path="/category/shoes" element={<ShoePages />} />
				<Route path="/category/slides" element={<SlidesPage />} />
				<Route path="/category/shirts" element={<ShirtPage />} />
				<Route path="/category/caps" element={<CapPage />} />
				<Route path="/category/hoodie" element={<HoodiePage />} />
				<Route path="/category/sweatshirts" element={<SweatshirtPage />} />
				<Route path="/category/bags" element={<BagPage />} />
			</Routes>
			<Footer />
		</>
	);
}

export default Paths;
