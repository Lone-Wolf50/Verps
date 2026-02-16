import React, { useState } from "react";
import { Link } from "react-router-dom";

const Support = () => {
	const [message, setMessage] = useState("");

	return (
		<div className="bg-[#0d0d0d] text-white min-h-screen font-sans flex flex-col">
			<main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-32 pb-12 flex flex-col">
				{/* Header Section */}
				<div className="mb-8 flex justify-between items-end">
					<div>
						<Link
							to="/"
							className="flex items-center gap-2 text-white/40 hover:text-[#ec5b13] transition-all group mb-4"
						>
							<span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
								arrow_back
							</span>
							<span className="text-[10px] font-black uppercase tracking-[0.2em]">
								Exit Concierge
							</span>
						</Link>
						<h1 className="text-4xl md:text-5xl font-[900] italic tracking-tighter uppercase leading-none">
							Concierge <span className="text-[#ec5b13]">Support</span>
						</h1>
					</div>
					<div className="hidden md:block text-right">
						<p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
							Status
						</p>
						<p className="text-[11px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2 justify-end">
							<span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
							Priority Line Active
						</p>
					</div>
				</div>

				{/* Chat Interface */}
				<section className="glass-panel flex-grow rounded-3xl overflow-hidden flex flex-col border border-white/5 bg-white/[0.02] shadow-2xl min-h-[500px] mb-6">
					{/* Agent Header */}
					<div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
						<div className="flex items-center gap-4">
							<div className="relative">
								<div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 flex items-center justify-center text-sm font-black tracking-tighter border border-white/10">
									JS
								</div>
								<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0d0d0d] rounded-full"></span>
							</div>
							<div>
								<h3 className="text-sm font-black uppercase tracking-widest text-white">
									James Sterling
								</h3>
								<p className="text-[10px] text-white/40 uppercase font-bold tracking-tight">
									Senior Lifestyle Manager
								</p>
							</div>
						</div>
						<div className="text-[10px] font-black text-white/10 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-md">
							Verified Agent
						</div>
					</div>

					{/* Chat Messages */}
					<div className="flex-grow overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
						{/* Agent Message */}
						<div className="flex flex-col gap-2 max-w-[80%] md:max-w-[60%]">
							<div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-5 text-sm leading-relaxed text-white/80 font-medium">
								Good evening. This is James Sterling from the Concierge team. It
								is a pleasure to assist you today. How may I facilitate your
								request this evening?
							</div>
							<span className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1">
								18:42 — Delivered
							</span>
						</div>

						{/* User Message */}
						<div className="flex flex-col items-end gap-2 self-end max-w-[80%] md:max-w-[60%]">
							<div className="bg-[#ec5b13] text-black font-bold rounded-2xl rounded-tr-none p-5 text-sm leading-relaxed shadow-[0_10px_30px_rgba(236,91,19,0.2)]">
								I would like to inquire about the availability of the Limited
								Edition Chronograph for next week's delivery.
							</div>
							<span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mr-1">
								18:45 — Read
							</span>
						</div>
					</div>

					{/* Input Area */}
					<div className="p-6 md:p-8 bg-black/20">
						<div className="relative flex items-center">
							<input
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 pr-16 text-sm focus:outline-none focus:border-[#ec5b13]/50 transition-all placeholder:text-white/20 font-medium"
								placeholder="Describe your request to James..."
								type="text"
							/>
							<div className="absolute right-3 flex items-center">
								{/* Only Send Button as requested */}
								<button className="bg-[#ec5b13] hover:bg-white text-black p-3 rounded-xl transition-all shadow-lg active:scale-95 group">
									<span className="material-symbols-outlined font-black text-xl group-hover:scale-110 transition-transform">
										near_me
									</span>
								</button>
							</div>
						</div>
						<div className="flex justify-center items-center gap-4 mt-6">
							<div className="h-px w-8 bg-white/5"></div>
							<p className="text-[8px] text-white/20 tracking-[0.4em] uppercase font-black">
								Encryption Secured • Private Session
							</p>
							<div className="h-px w-8 bg-white/5"></div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default Support;
