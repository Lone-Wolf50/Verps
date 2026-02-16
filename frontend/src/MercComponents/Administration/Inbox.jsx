import React, { useState } from "react";

const Inbox = () => {
	const [selectedChat, setSelectedChat] = useState(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const messages = [
		{
			id: 1,
			user: "Alex Rivera",
			subject: "Sizing Inquiry",
			time: "2m ago",
			status: "unread",
			text: "Is the Noir Carryall flight approved?",
		},
		{
			id: 2,
			user: "Sarah Chen",
			subject: "Shipping Update",
			time: "1h ago",
			status: "read",
			text: "When will my Heritage Briefcase ship?",
		},
		{
			id: 3,
			user: "Marcus Johnson",
			subject: "Return Request",
			time: "3h ago",
			status: "read",
			text: "Need to return my recent order",
		},
	];

	return (
		<div className="px-4 md:px-0">
			{/* Mobile Header */}
			<div className="lg:hidden mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-light text-white tracking-tight">
						Support{" "}
						<span className="font-serif italic text-[#ec5b13]">Inbox</span>
					</h2>
					<p className="text-xs text-white/40 mt-2">Customer messages</p>
				</div>
				<button
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="lg:hidden p-3 bg-white/5 rounded-xl border border-white/10"
				>
					<svg
						className="w-5 h-5 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>

			<div className="flex flex-col lg:flex-row h-[75vh] relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
				{/* Sidebar: Message List */}
				<div
					className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 absolute lg:relative w-full lg:w-2/5 xl:w-1/3 h-full border-r border-white/5 flex flex-col bg-[#0a0a0a] lg:bg-transparent transition-transform duration-300 z-10 lg:z-0`}
				>
					<div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
						<div>
							<h3 className="text-xs font-bold uppercase tracking-wider text-[#ec5b13]">
								Support Tickets
							</h3>
							<p className="text-[10px] text-white/40 mt-1">
								{messages.length} conversations
							</p>
						</div>
						<button
							onClick={() => setIsSidebarOpen(false)}
							className="lg:hidden text-white/40 hover:text-white"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
					<div className="overflow-y-auto flex-grow">
						{messages.map((msg) => (
							<div
								key={msg.id}
								onClick={() => {
									setSelectedChat(msg);
									setIsSidebarOpen(false);
								}}
								className={`p-5 md:p-6 border-b border-white/5 cursor-pointer transition-all relative ${
									selectedChat?.id === msg.id
										? "bg-[#ec5b13]/10 border-r-2 border-r-[#ec5b13]"
										: "hover:bg-white/[0.02]"
								}`}
							>
								{msg.status === "unread" && (
									<div className="absolute top-6 left-2 w-2 h-2 bg-[#ec5b13] rounded-full"></div>
								)}
								<div className="flex justify-between items-start mb-2">
									<h4 className="text-sm font-medium tracking-wide text-white pr-2">
										{msg.user}
									</h4>
									<span className="text-[9px] text-white/30 uppercase tracking-wider whitespace-nowrap">
										{msg.time}
									</span>
								</div>
								<p className="text-[10px] text-[#ec5b13] font-medium uppercase mb-2 tracking-wide">
									{msg.subject}
								</p>
								<p className="text-xs text-white/40 truncate">{msg.text}</p>
							</div>
						))}
					</div>
				</div>

				{/* Chat View */}
				<div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col bg-black/20">
					{selectedChat ? (
						<>
							{/* Chat Header */}
							<div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center">
								<div className="flex items-center gap-3">
									<button
										onClick={() => setIsSidebarOpen(true)}
										className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
									>
										<svg
											className="w-5 h-5 text-white/60"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>
									<div>
										<h3 className="text-base md:text-lg font-medium tracking-wide text-white">
											{selectedChat.user}
										</h3>
										<p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
											{selectedChat.subject}
										</p>
									</div>
								</div>
								<button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
									<svg
										className="w-5 h-5 text-white/40"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
										/>
									</svg>
								</button>
							</div>

							{/* Messages Area */}
							<div className="flex-grow p-4 md:p-8 overflow-y-auto space-y-4">
								<div className="bg-white/5 p-4 md:p-5 rounded-2xl rounded-tl-none max-w-[85%] md:max-w-[75%] border border-white/5">
									<p className="text-sm text-white/80 leading-relaxed">
										{selectedChat.text}
									</p>
									<p className="text-[9px] text-white/30 mt-2 uppercase tracking-wider">
										{selectedChat.time}
									</p>
								</div>
								<div className="bg-[#ec5b13]/10 p-4 md:p-5 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-[75%] ml-auto border border-[#ec5b13]/20">
									<p className="text-sm text-white/80 leading-relaxed">
										Checking with the workshop now. One moment.
									</p>
									<p className="text-[9px] text-white/30 mt-2 uppercase tracking-wider text-right">
										Just now
									</p>
								</div>
							</div>

							{/* Input Area */}
							<div className="p-4 md:p-6 bg-white/5 border-t border-white/5">
								<div className="flex gap-3">
									<input
										type="text"
										placeholder="Type your message..."
										className="flex-grow px-4 md:px-6 py-3 md:py-4 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ec5b13]/50 transition-all"
									/>
									<button className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-[#ec5b13] to-[#d94e0f] text-white rounded-xl hover:shadow-lg hover:shadow-[#ec5b13]/30 transition-all active:scale-95">
										<svg
											className="w-5 h-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
											/>
										</svg>
									</button>
								</div>
							</div>
						</>
					) : (
						<div className="h-full flex flex-col items-center justify-center text-white/20 p-6">
							<svg
								className="w-16 h-16 mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							<p className="text-xs font-medium uppercase tracking-wider text-center">
								Select a conversation
							</p>
							<button
								onClick={() => setIsSidebarOpen(true)}
								className="mt-4 lg:hidden px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs uppercase tracking-wider text-white/60 hover:bg-white/10 transition-all"
							>
								View Messages
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Inbox;
