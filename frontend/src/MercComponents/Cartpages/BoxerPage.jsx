import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const BoxerPage = () => {
	return (
		<CategoryTemplate
			// UI Labels & Branding
			title="THE"
			subtitle="boxer series"
			collectionIndex="01"
			description="Engineered for power. Designed for endurance. Professional grade, high-performance combat gear."
			// Database Filter
			// This will automatically fetch 'boxer' or 'boxers' from verp_products
			categoryName="boxer"
		/>
	);
};

export default BoxerPage;
