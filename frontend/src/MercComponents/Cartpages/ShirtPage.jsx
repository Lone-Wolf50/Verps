import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const ShirtPage = () => {
	return (
		<CategoryTemplate
			// UI Labels & Branding
			title="THE"
			subtitle="shirt series"
			collectionIndex="03" // Unique vault sequence
			description="Elegance redefined for the everyday. Handcrafted from the finest silks and cottons for the modern professional."
			// Database Filter
			// This pulls from 'verp_products' where category is 'shirt' or 'shirts'
			categoryName="shirt"
		/>
	);
};

export default ShirtPage;
