import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const BagPage = () => {
	return (
		<CategoryTemplate
			// UI Labels
			title="Carryall"
			subtitle="Archive"
			collectionIndex="04"
			description="Sophisticated storage for the journey ahead. Handcrafted from premium leathers and textiles designed to age beautifully."
			// Database Filter
			// This will fetch items from 'verp_products' where category is 'bag' or 'bags'
			categoryName="bag"
		/>
	);
};

export default BagPage;
