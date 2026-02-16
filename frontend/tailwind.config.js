/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: "var(--primary-color)",
				"background-dark": "var(--bg-dark)",
				"neutral-dark": "var(--neutral-dark)",
				"neutral-card": "var(--neutral-card)",
				"background-light": "#f8f7f6",
			},
			fontFamily: {
				display: ["Manrope", "sans-serif", "Public Sans"],
			},
			borderRadius: {
				DEFAULT: "0.25rem",
				lg: "0.5rem",
				xl: "0.75rem",
				full: "9999px",
			},
		},
	},

	plugins: [],
};
