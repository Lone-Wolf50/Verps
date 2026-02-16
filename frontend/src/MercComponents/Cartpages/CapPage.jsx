import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const CapPage = () => {
	return (
		<CategoryTemplate
			// UI Labels & Branding
			title="THE"
			subtitle="cap series"
			collectionIndex="05" // Assigning a unique index for headwear
			description="Engineered for fit. Designed for style. Precision-crafted luxury headwear using premium tech-twill and silk blends."
			// Database Filter
			// This will fetch from 'verp_products' where category is 'cap' or 'caps'
			categoryName="cap"
		/>
	);
};

export default CapPage;
