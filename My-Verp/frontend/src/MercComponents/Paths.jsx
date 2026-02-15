import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Homepage from "./Homepage/Homepage.jsx";
import BoxerPage from "./Cartpages/BoxerPage.jsx";
import ShoePages from "./Cartpages/ShoePages.jsx";

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

			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/category/boxers" element={<BoxerPage />} />
				<Route path="/category/shoes" element={<ShoePages />} />
			</Routes>
		</>
	);
}

export default Paths;
