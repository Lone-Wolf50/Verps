import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const HoodiePage = () => {
	return (
		<CategoryTemplate
			// UI Labels & Branding
			title="THE"
			subtitle="hoodie series"
			collectionIndex="02" // Sequence for your vault
			description="The ultimate expression of comfort and luxury. Handcrafted from heavy-weight premium cotton and technical fleece."
			// Database Filter
			// This will fetch from 'verp_products' where category is 'hoodie' or 'hoodies'
			categoryName="hoodie"
		/>
	);
};

export default HoodiePage;
