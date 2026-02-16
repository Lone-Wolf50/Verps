import React from "react";
import Hero from "./Hero";
import CategoriesGrid from "./CategoriesGrid";
import Bestsellers from "./Bestsellers";
import BrandNarrative from "./BrandNarrative";
import Newsletter from "./Newsletter";

const Homepage = () => {
	const homeStyles = {
		"--primary-color": "#d4af35",
		"--bg-dark": "#0a0a0a",
		"--neutral-dark": "#1a1a1a",
		"--neutral-card": "#121212",
	};
	return (
		<div style={homeStyles}>
			<main>
				<Hero />
				<CategoriesGrid />
				<Bestsellers />
				<BrandNarrative />
				<Newsletter />
			</main>
		</div>
	);
};

export default Homepage;
