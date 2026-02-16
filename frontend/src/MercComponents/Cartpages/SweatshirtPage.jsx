import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const SweatshirtPage = () => {
	return (
		<CategoryTemplate
			// UI Labels & Branding
			title="THE SWEATSHIRT"
			subtitle="series"
			collectionIndex="04" // Unique identifier for the apparel vault
			description="Refined essentials for the modern wardrobe. Engineered for a perfect fit, timeless appeal, and unparalleled comfort."
			// Database Filter
			// This pulls from 'verp_products' where category is 'sweatshirt' or 'sweatshirts'
			categoryName="sweatshirt"
		/>
	);
};

export default SweatshirtPage;
