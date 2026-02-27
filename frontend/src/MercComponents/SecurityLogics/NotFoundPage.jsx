import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
	const [glitch, setGlitch] = useState(false);

	useEffect(() => {
		const i = setInterval(() => {
			setGlitch(true);
			setTimeout(() => setGlitch(false), 150);
		}, 3000);
		return () => clearInterval(i);
	}, []);

	return (
		<>
			<style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes glitch1{0%,100%{clip-path:inset(0 0 95% 0);transform:translate(-3px,0)}50%{clip-path:inset(40% 0 50% 0);transform:translate(3px,0)}}
        @keyframes glitch2{0%,100%{clip-path:inset(80% 0 0 0);transform:translate(3px,0)}50%{clip-path:inset(20% 0 60% 0);transform:translate(-3px,0)}}
        @keyframes scanline{0%{top:-5%}100%{top:105%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>
			<div
				style={{
					minHeight: "100vh",
					background: "#000",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "24px",
					overflow: "hidden",
					position: "relative",
					fontFamily: "'DM Sans',sans-serif",
				}}
			>
				{/* Scanline */}
				<div
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						height: "2px",
						background: "rgba(236,91,19,0.15)",
						animation: "scanline 4s linear infinite",
						pointerEvents: "none",
					}}
				/>
				{/* Grid bg */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
						backgroundSize: "60px 60px",
						pointerEvents: "none",
					}}
				/>

				<div
					style={{
						position: "relative",
						textAlign: "center",
						animation: "fadeIn 0.5s ease both",
					}}
				>
					{/* 404 with glitch */}
					<div
						style={{
							position: "relative",
							display: "inline-block",
							marginBottom: 24,
							animation: "float 4s ease-in-out infinite",
						}}
					>
						<h1
							style={{
								fontFamily: "'Playfair Display',serif",
								fontSize: "clamp(100px,20vw,180px)",
								fontStyle: "italic",
								color: "#ec5b13",
								lineHeight: 1,
								margin: 0,
								filter: `drop-shadow(0 0 40px rgba(236,91,19,0.4))`,
							}}
						>
							404
						</h1>
						{glitch && (
							<>
								<h1
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										fontFamily: "'Playfair Display',serif",
										fontSize: "clamp(100px,20vw,180px)",
										fontStyle: "italic",
										color: "#38bdf8",
										lineHeight: 1,
										margin: 0,
										animation: "glitch1 0.15s steps(1) both",
										opacity: 0.7,
									}}
								>
									404
								</h1>
								<h1
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										fontFamily: "'Playfair Display',serif",
										fontSize: "clamp(100px,20vw,180px)",
										fontStyle: "italic",
										color: "#ef4444",
										lineHeight: 1,
										margin: 0,
										animation: "glitch2 0.15s steps(1) both",
										opacity: 0.7,
									}}
								>
									404
								</h1>
							</>
						)}
					</div>

					<p
						style={{
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: "clamp(9px,2vw,11px)",
							letterSpacing: "0.4em",
							textTransform: "uppercase",
							color: "rgba(255,255,255,0.3)",
							marginBottom: 12,
						}}
					>
						SECURITY BREACH DETECTED
					</p>
					<p
						style={{
							fontFamily: "'DM Sans',sans-serif",
							fontSize: "clamp(14px,2vw,17px)",
							color: "rgba(255,255,255,0.55)",
							maxWidth: 360,
							margin: "0 auto 36px",
							lineHeight: 1.65,
						}}
					>
						This route doesn't exist in this page. You may have entered an
						unauthorized path.
					</p>

					<Link
						to="/"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 10,
							padding: "14px 32px",
							background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
							borderRadius: 14,
							fontFamily: "'JetBrains Mono',monospace",
							fontSize: 9,
							fontWeight: 700,
							letterSpacing: "0.25em",
							textTransform: "uppercase",
							color: "#fff",
							textDecoration: "none",
							transition: "all 220ms",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow =
								"0 12px 40px rgba(236,91,19,0.35)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "none";
							e.currentTarget.style.boxShadow = "none";
						}}
					>
						<span
							className="material-symbols-outlined"
							style={{ fontSize: 18 }}
						>
							home
						</span>
						RETURN TO HOME.
					</Link>
				</div>
			</div>
		</>
	);
};

export default NotFoundPage;
