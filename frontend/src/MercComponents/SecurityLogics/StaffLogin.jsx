import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

const T = {
	ember: "#ec5b13",
	void: "#050505",
	obsidian: "#0a0a0a",
	border: "1px solid rgba(255,255,255,0.07)",
};

const StaffLogin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const from = searchParams.get("from") || ""; // "admin" | "assistant"

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email.trim() || !password) {
			Swal.fire({ title: "Required", text: "Enter email and password.", background: T.obsidian, color: "#fff", confirmButtonColor: T.ember });
			return;
		}
		setLoading(true);
		try {
			const base = import.meta.env.VITE_SERVER_URL || "";
			const res = await fetch(`${base}/api/staff-login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim(), password }),
			});
			const data = await res.json().catch(() => ({}));

			if (res.ok && data.success && data.role) {
				localStorage.setItem("staffRole", data.role);
				localStorage.setItem("staffEmail", email.trim());
				Swal.fire({
					title: "Welcome",
					icon: "success",
					background: T.obsidian,
					color: "#fff",
					timer: 800,
					showConfirmButton: false,
				});
				const target = from === "assistant" ? "/sys/console/terminal" : from === "admin" ? "/sys/console/admin" : data.role === "admin" ? "/sys/console/admin" : "/sys/console/terminal";
				navigate(target, { replace: true });
				return;
			}
			Swal.fire({
				title: "Access Denied",
				text: data.error || "Invalid email or password.",
				icon: "error",
				background: T.obsidian,
				color: "#fff",
				confirmButtonColor: T.ember,
			});
		} catch (err) {
			Swal.fire({
				title: "Error",
				text: err.message || "Could not reach server.",
				icon: "error",
				background: T.obsidian,
				color: "#fff",
				confirmButtonColor: T.ember,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<style>{`
				.staff-login-wrap { font-family: 'DM Sans', sans-serif; }
			`}</style>
			<div
				className="staff-login-wrap"
				style={{
					minHeight: "100vh",
					background: T.void,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: 24,
				}}
			>
				<div
					style={{
						width: "100%",
						maxWidth: 400,
						background: T.obsidian,
						border: T.border,
						borderRadius: 24,
						padding: "40px 32px",
						boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
					}}
				>
					<div style={{ textAlign: "center", marginBottom: 28 }}>
						<span className="material-symbols-outlined" style={{ fontSize: 42, color: T.ember }}>admin_panel_settings</span>
						<h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontStyle: "italic", color: "white", marginTop: 12, marginBottom: 6 }}>
							Staff access
						</h1>
						<p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
							Admin & assistant only
						</p>
					</div>

					<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
						<div>
							<label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: T.ember, marginBottom: 8 }}>Email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								required
								autoComplete="email"
								style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: T.border, borderRadius: 12, padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.9)", outline: "none", boxSizing: "border-box" }}
							/>
						</div>
						<div>
							<label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: T.ember, marginBottom: 8 }}>Password</label>
							<div style={{ position: "relative" }}>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									required
									autoComplete="current-password"
									style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: T.border, borderRadius: 12, padding: "14px 16px 14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.9)", outline: "none", boxSizing: "border-box" }}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
								>
									<span className="material-symbols-outlined" style={{ fontSize: 20, color: "rgba(255,255,255,0.35)" }}>
										{showPassword ? "visibility_off" : "visibility"}
									</span>
								</button>
							</div>
						</div>
						<button
							type="submit"
							disabled={loading}
							style={{
								width: "100%",
								background: "linear-gradient(135deg, #ec5b13, #d94e0f)",
								border: "none",
								borderRadius: 12,
								padding: "15px 0",
								fontFamily: "'DM Sans', sans-serif",
								fontSize: 10,
								fontWeight: 800,
								letterSpacing: "0.22em",
								textTransform: "uppercase",
								color: "#fff",
								cursor: loading ? "not-allowed" : "pointer",
								opacity: loading ? 0.7 : 1,
								transition: "all 200ms",
								marginTop: 8,
							}}
						>
							{loading ? "Signing in…" : "Sign in"}
						</button>
					</form>

					<p style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: "rgba(255,255,255,0.15)", letterSpacing: "0.2em", marginTop: 24, textTransform: "uppercase" }}>
						Use credentials from your .env
					</p>
				</div>
			</div>
		</>
	);
};

export default StaffLogin;