import React from "react";
import CategoryTemplate from "./CategoryTemplate";

const SlidesPage = () => {
    return (
        <CategoryTemplate
            // UI Labels & Branding
            title="THE"
            subtitle="slide series"
            collectionIndex="07" // Continuing your vault sequence
            description="Unrivaled comfort for every step. Handcrafted with premium materials and ergonomic support for the modern explorer."
            
            // Database Filter
            // This pulls from 'verp_products' where category is 'slide' or 'slides'
            categoryName="slide" 
        />
    );
};

export default SlidesPage;