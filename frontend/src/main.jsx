import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<StrictMode>
			<App />
		</StrictMode>
	</BrowserRouter>,
);

/* ── Service Worker Registration with Update Checking ── */
if ("serviceWorker" in navigator) {
	window.addEventListener("load", async () => {
		try {
			const reg = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
			});

			// ── Check for updates every 60 seconds ── 
			setInterval(() => {
				reg.update();
			}, 60000);

			// ── Notify when new version is ready ── 
			reg.addEventListener("updatefound", () => {
				const newWorker = reg.installing;
				newWorker.addEventListener("statechange", () => {
					if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
						// New service worker ready — optionally notify user
						console.log("[PWA] New version available. Refresh to update.");
					}
				});
			});

			console.log("[PWA] Service Worker registered successfully");
		} catch (err) {
			console.error("[PWA] Service Worker registration failed:", err);
		}
	});
}
