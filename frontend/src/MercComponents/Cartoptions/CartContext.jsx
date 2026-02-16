/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	// Initialize cart from localStorage so it persists on refresh
	const [cart, setCart] = useState(() => {
		try {
			const savedCart = localStorage.getItem("luxury_cart");
			return savedCart ? JSON.parse(savedCart) : [];
		} catch (error) {
			console.error("Cart recovery failed:", error);
			return [];
		}
	});

	// Save to localStorage whenever cart changes
	useEffect(() => {
		localStorage.setItem("luxury_cart", JSON.stringify(cart));
	}, [cart]);

	const addToCart = (product) => {
		setCart((prev) => {
			// Check if product already exists in cart
			const exists = prev.find((item) => item.id === product.id);
			if (exists) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			// If new, add to array with quantity 1
			return [...prev, { ...product, quantity: 1 }];
		});
	};

	const removeFromCart = (id) => {
		setCart((prev) => prev.filter((item) => item.id !== id));
	};

	const updateQuantity = (id, amount) => {
		setCart((prev) =>
			prev.map((item) =>
				item.id === id
					? { ...item, quantity: Math.max(1, item.quantity + amount) }
					: item,
			),
		);
	};

	const cartTotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	return (
		<CartContext.Provider
			value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal }}
		>
			{children}
		</CartContext.Provider>
	);
};

// Custom hook to use the cart
export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
