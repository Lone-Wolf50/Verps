import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const ShoePages = () => {
	return (
		<CategoryTemplate
			// UI Labels & Branding
			title="THE"
			subtitle="shoe series"
			collectionIndex="06" // Final sequence in your vault
			description="Excellence in every detail. Precision-crafted footwear for the modern explorer, engineered for both performance and aesthetics."
			// Database Filter
			// This pulls from 'verp_products' where category is 'shoe' or 'shoes'
			categoryName="shoe"
		/>
	);
};

export default ShoePages;
