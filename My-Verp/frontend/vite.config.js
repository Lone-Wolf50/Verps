import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite"; // Or TanStackRouterVite

export default defineConfig({
	plugins: [
		tanstackRouter(), // Make sure this is BEFORE react()
		react(),
	],
});
