import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

const getInternalSecret = () => {
  const secret = import.meta.env.VITE_INTERNAL_SECRET;
  if (!secret) console.error("[auth] ⚠️ VITE_INTERNAL_SECRET is not set — requests to protected endpoints will fail.");
  return secret ?? "";
};

const T = {
	void:"var(--bg-dark)", obsidian:"var(--bg-panel)", ember:"#ec5b13",
	shipped:"#38bdf8", live:"#22c55e", waiting:"#f59e0b", violet:"#a78bfa",
	border:"1px solid var(--overlay-4)", sub:"1px solid var(--overlay-2)",
};

/* ─── RETURN EMAIL BUILDER ───────────────────────────────────── */
const buildReturnEmailHTML = (req, decision, clientName) => {
	const name = clientName || req?.customer_email?.split("@")[0] || "Valued Client";
	const orderNum = req?.order_number || req?.order_id?.slice(0, 8) || "—";
	const amount   = Number(req?.total_amount || 0).toLocaleString();

	const cfg = {
		approved: {
			color: "#22c55e",
			gradientFrom: "#22c55e",
			gradientTo: "#16a34a",
			icon: "✅",
			bannerLabel: "RETURN APPROVED",
			headline: "Great News — Your Return Is Approved",
			subline: "We've reviewed your request and it has been accepted.",
			body: `We're pleased to let you know that your return request for order <strong style="color:#22c55e">${orderNum}</strong> has been <strong style="color:#22c55e">approved</strong>. Please ship the item(s) back to us using a trackable shipping method. Once we receive and inspect the goods, your refund of <strong style="color:#22c55e">GH₵ ${amount}</strong> will be processed within 5–7 business days.`,
			italicNote: "We appreciate your trust in us and are committed to making this as smooth as possible.",
			cta: "VIEW RETURN DETAILS",
		},
		rejected: {
			color: "#ef4444",
			gradientFrom: "#ef4444",
			gradientTo: "#dc2626",
			icon: "❌",
			bannerLabel: "RETURN REQUEST DECLINED",
			headline: "Return Request Not Approved",
			subline: "We were unable to process your return request at this time.",
			body: `After careful review, we regret to inform you that your return request for order <strong style="color:#ef4444">${orderNum}</strong> has been <strong style="color:#ef4444">declined</strong>. This may be due to the item falling outside our return window, showing signs of use beyond our policy, or missing original packaging. If you believe this decision was made in error or would like to discuss further, please contact our support team directly.`,
			italicNote: "We understand this may be disappointing and are here to help clarify the decision.",
			cta: "CONTACT SUPPORT",
		},
		completed: {
			color: "#a78bfa",
			gradientFrom: "#a78bfa",
			gradientTo: "#7c3aed",
			icon: "🎉",
			bannerLabel: "RETURN FULLY PROCESSED",
			headline: "Your Return Has Been Completed",
			subline: "Everything has been resolved — thank you for your patience.",
			body: `We're happy to confirm that the return process for order <strong style="color:#a78bfa">${orderNum}</strong> has been <strong style="color:#a78bfa">fully completed</strong>. Your refund of <strong style="color:#a78bfa">GH₵ ${amount}</strong> has been issued and should reflect in your account within 3–5 business days depending on your payment provider. Thank you for shopping with us — your satisfaction is our priority.`,
			italicNote: "We hope to serve you again soon and wish you an exceptional experience every time.",
			cta: "SHOP AGAIN",
		},
	};

	const c = cfg[decision];
	if (!c) return null;

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${c.headline}</title>
</head>
<body style="margin:0;padding:0;background:var(--bg-deep);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:var(--bg-deep);min-height:100vh;">
<tr><td align="center" style="padding:40px 20px;">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- BRAND HEADER -->
    <tr>
      <td align="center" style="padding-bottom:32px;">
        <p style="margin:0;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.45em;text-transform:uppercase;color:rgba(255,255,255,0.15);">
          VERP · RETURNS & REFUNDS
        </p>
      </td>
    </tr>

    <!-- MAIN CARD -->
    <tr>
      <td style="background:linear-gradient(135deg,var(--bg-panel),#111);border-radius:24px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

        <!-- ACCENT TOP BAND -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,${c.gradientFrom},${c.gradientTo},transparent);"></td>
        </tr>

        <!-- HERO SECTION -->
        <tr>
          <td style="background:linear-gradient(135deg,${c.gradientFrom}14,${c.gradientTo}06);padding:30px 36px 24px;border-bottom:1px solid var(--border-light);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 10px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.38em;text-transform:uppercase;color:${c.color};">
                    ${c.bannerLabel}
                  </p>
                  <p style="margin:0 0 8px;font-size:26px;font-weight:300;color:#fff;letter-spacing:-0.3px;line-height:1.25;">
                    ${c.headline}
                  </p>
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.38);line-height:1.6;">
                    ${c.subline}
                  </p>
                </td>
                <td align="right" valign="middle" style="padding-left:20px;width:56px;">
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 0 auto;">
                    <tr>
                      <td width="52" height="52" align="center" valign="middle"
                        style="width:52px;height:52px;border-radius:50%;background:${c.color}18;border:1px solid ${c.color}40;font-size:28px;line-height:52px;text-align:center;vertical-align:middle;">
                        ${c.icon}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ORDER DETAILS ROW -->
        <tr>
          <td style="padding:22px 36px;border-bottom:1px solid var(--overlay-3);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:50%;">
                  <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.22);">RETURN REF</p>
                  <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:${c.color};font-weight:700;letter-spacing:0.06em;">${orderNum}</p>
                </td>
                <td align="right">
                  <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.22);">ORDER VALUE</p>
                  <p style="margin:0;font-size:20px;font-weight:700;color:${c.color};">GH₵ ${amount}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY TEXT -->
        <tr>
          <td style="padding:26px 36px 20px;">
            <p style="margin:0 0 14px;font-size:13px;color:rgba(255,255,255,0.82);line-height:1.7;">
              Dear <strong style="color:#fff;">${name}</strong>,
            </p>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.58);line-height:1.85;">
              ${c.body}
            </p>
          </td>
        </tr>

        <!-- ITALIC NOTE -->
        <tr>
          <td style="padding:0 36px 26px;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.28);font-style:italic;line-height:1.65;border-left:2px solid ${c.color}35;padding-left:14px;">
              ${c.italicNote}
            </p>
          </td>
        </tr>

        <!-- STATUS CHIP -->
        <tr>
          <td style="padding:0 36px 30px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:${c.color}16;border:1px solid ${c.color}45;border-radius:999px;padding:7px 20px;">
                  <p style="margin:0;font-family:'Courier New',monospace;font-size:8px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${c.color};">
                    RETURN STATUS: ${decision.toUpperCase()}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td align="center" style="padding:32px 20px 0;">
        <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.4em;text-transform:uppercase;color:var(--border-medium);">
          VERP EXECUTIVE COLLECTION
        </p>
        <p style="margin:0;font-size:10px;color:var(--border-medium);line-height:1.7;">
          This is an automated message from the Verp Returns Management System.<br/>
          For questions, reply to this email or contact our support team.
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
};

/* ─── SERVER-SIDE RETURN STATUS UPDATE + EMAIL ───────────────── */
// One call to the server: it handles DB write, order sync, and client email.
// No Supabase direct write here — avoids any risk of double-write or loop.
const serverUpdateReturnStatus = async (returnId, status, orderId) => {
	const res = await fetch("/api/update-return-status", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-internal-secret": getInternalSecret(),
		},
		body: JSON.stringify({ returnId, status, orderId }),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.error || "Failed to update return status");
	}
	return res.json();
};

/* ── Status badge ─────────────────────────────────────────── */
const ClientMessages_StatusBadge = ({ status }) => {
	const map = {
		waiting:  { color:T.waiting, label:"WAITING" },
		live:     { color:T.live,    label:"LIVE" },
		escalated:{ color:T.waiting, label:"PARTIAL PUSH" },
		full_push:{ color:T.violet,  label:"ADMIN TAKEOVER" },
		resolved: { color:"rgba(255,255,255,0.2)", label:"RESOLVED" },
	};
	const { color, label } = map[status] || { color:"rgba(255,255,255,0.2)", label:status?.toUpperCase() };
	return (
		<span style={{display:"inline-flex",padding:"2px 8px",borderRadius:999,background:`${color}14`,border:`1px solid ${color}40`,fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",color,textTransform:"uppercase",whiteSpace:"nowrap"}}>
			{label}
		</span>
	);
};

/* ── Session list sidebar ─────────────────────────────────── */
const ClientMessages_SessionList = ({ sessions, selectedId, onSelect, searchQuery, onSearchChange }) => (
	<div style={{width:"100%",borderRight:T.border,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",height:"100%"}}>
		<div style={{padding:"12px 12px 8px",borderBottom:T.sub,flexShrink:0}}>
			<div style={{position:"relative"}}>
				<span className="material-symbols-outlined" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"rgba(255,255,255,0.25)"}}>search</span>
				<input value={searchQuery} onChange={e => onSearchChange(e.target.value)} placeholder="Search clients..."
					style={{width:"100%",background:"var(--overlay-3)",border:"1px solid var(--border-medium)",borderRadius:10,padding:"9px 12px 9px 32px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--text-secondary)",outline:"none",boxSizing:"border-box"}} />
			</div>
		</div>
		<div style={{flex:1,overflowY:"auto",padding:"8px"}}>
			{sessions.length === 0 && (
				<p style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",color:"rgba(255,255,255,0.12)",textTransform:"uppercase",paddingTop:40}}>NO RESULTS</p>
			)}
			{sessions.map(s => (
				<button key={s.id} onClick={() => onSelect(s)}
					style={{width:"100%",textAlign:"left",padding:"12px",background:selectedId===s.id?"rgba(236,91,19,0.08)":"transparent",border:selectedId===s.id?"1px solid rgba(236,91,19,0.22)":"1px solid transparent",borderRadius:10,cursor:"pointer",transition:"all 160ms",marginBottom:4}}
					onMouseEnter={e => { if (selectedId !== s.id) e.currentTarget.style.background = "var(--overlay-2)"; }}
					onMouseLeave={e => { if (selectedId !== s.id) e.currentTarget.style.background = "transparent"; }}>
					<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,marginBottom:4}}>
						<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.8)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{s.client_email}</p>
						<ClientMessages_StatusBadge status={s.status} />
					</div>
					{s.admin_note && (
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
							{s.admin_note.replace(/^FULL_PUSH:\s*/i, "")}
						</p>
					)}
				</button>
			))}
		</div>
	</div>
);

/* ── Chat window ──────────────────────────────────────────── */
const ClientMessages_ChatWindow = ({ session, onPushBack, onSessionUpdate, onResolve }) => {
	const [messages, setMessages] = useState([]);
	const [input, setInput]       = useState("");
	const [sending, setSending]   = useState(false);
	const [clientTyping, setClientTyping] = useState(false);
	const scrollRef = useRef(null);
	const inputRef  = useRef(null);
	const typingTimerRef = useRef(null);

	const syncMessages = useCallback(async () => {
		const { data } = await supabase.from("verp_chat_messages").select("*").eq("chat_id", session.id).order("created_at", { ascending: true });
		if (data) setMessages(data);
		const { data: sess } = await supabase.from("verp_support_sessions").select("typing_role, typing_at").eq("id", session.id).maybeSingle();
		if (sess) {
			const isClientTyping = sess.typing_role === "client" && sess.typing_at && Date.now() - new Date(sess.typing_at).getTime() < 4000;
			setClientTyping(!!isClientTyping);
		}
	}, [session.id]);

	useEffect(() => { syncMessages(); const i = setInterval(syncMessages, 4500); return () => clearInterval(i); }, [syncMessages]);
	useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, clientTyping]);
	useEffect(() => { return () => clearTimeout(typingTimerRef.current); }, []);

	const broadcastAdminTyping = async (isTyping) => {
		if (!session?.id) return;
		await supabase.from("verp_support_sessions").update({ typing_role: isTyping ? "admin" : null, typing_at: isTyping ? new Date().toISOString() : null }).eq("id", session.id);
	};

	const handleAdminInputChange = (e) => {
		setInput(e.target.value);
		broadcastAdminTyping(true);
		clearTimeout(typingTimerRef.current);
		typingTimerRef.current = setTimeout(() => broadcastAdminTyping(false), 3000);
	};

	const sendReply = async (e) => {
		e.preventDefault();
		if (!input.trim() || sending || session.status !== "full_push") return;
		setSending(true);
		clearTimeout(typingTimerRef.current);
		broadcastAdminTyping(false);
		const content = input.trim();
		setInput("");
		await supabase.from("verp_chat_messages").insert([{ chat_id:session.id, sender_role:"admin", content }]);
		setMessages(prev => [...prev, { id:Date.now(), chat_id:session.id, sender_role:"admin", content, created_at:new Date().toISOString() }]);
		setSending(false);
		if (inputRef.current) inputRef.current.focus();
	};

	const resolveSession = async () => {
		await supabase.from("verp_support_sessions").update({ status:"resolved", updated_at:new Date().toISOString() }).eq("id", session.id);
		if (onSessionUpdate) onSessionUpdate();
		if (onResolve) onResolve();
	};

	const isFullPush  = session.status === "full_push";
	const isEscalated = session.status === "escalated";

	return (
		<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
			<div style={{padding:"10px 14px",background:T.obsidian,borderBottom:T.sub,flexShrink:0}}>
				<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
					<div style={{minWidth:0,flex:1}}>
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:T.ember,textTransform:"uppercase",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>{session.client_email}</p>
						<ClientMessages_StatusBadge status={session.status} />
					</div>
					<div style={{display:"flex",gap:6,flexShrink:0}}>
						{isEscalated && (
							<button onClick={onPushBack} style={{background:`${T.live}15`,border:`1px solid ${T.live}40`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",textTransform:"uppercase",color:T.live,fontWeight:700,whiteSpace:"nowrap"}}>↩ PUSH BACK</button>
						)}
						{isFullPush && (
							<button onClick={resolveSession} style={{background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.4)",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",textTransform:"uppercase",color:"#22c55e",fontWeight:700,whiteSpace:"nowrap"}}>RESOLVE</button>
						)}
					</div>
				</div>
			</div>

			<div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,WebkitOverflowScrolling:"touch"}}>
				{messages.length === 0 && (
					<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.15,paddingTop:40}}>
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase"}}>NO MESSAGES YET</p>
					</div>
				)}
				{messages.map((msg, idx) => {
					const isClient = msg.sender_role === "client";
					const isAdmin  = msg.sender_role === "admin";
					const bg = isClient ? "var(--border-medium)" : isAdmin ? T.violet : T.ember;
					return (
						<div key={msg.id || idx} style={{display:"flex",justifyContent:isClient?"flex-start":"flex-end"}}>
							<div style={{maxWidth:"78%",minWidth:0,display:"flex",flexDirection:"column",alignItems:isClient?"flex-start":"flex-end",gap:3}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,letterSpacing:"0.18em",textTransform:"uppercase",color:isClient?"rgba(255,255,255,0.2)":isAdmin?`${T.violet}70`:`${T.ember}70`}}>
									{isClient ? "CLIENT" : isAdmin ? "YOU (ADMIN)" : "ASSISTANT"} · {new Date(msg.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
								</p>
								<div style={{padding:"10px 14px",background:bg,border:isClient?T.border:"none",borderRadius:isClient?"4px 14px 14px 14px":"14px 4px 14px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:isClient?"rgba(255,255,255,0.8)":"#000",lineHeight:1.6,fontWeight:isClient?400:500,wordBreak:"break-word",overflowWrap:"break-word",whiteSpace:"pre-wrap"}}>
									{msg.content}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{clientTyping && session.status === "full_push" && (
				<div style={{padding:"6px 14px 2px",flexShrink:0,background:T.obsidian}}>
					<div style={{display:"flex",alignItems:"center",gap:8}}>
						<div style={{display:"flex",gap:3,alignItems:"center",padding:"8px 14px",background:"var(--border-light)",border:`1px solid ${T.border}`,borderRadius:"4px 14px 14px 14px",width:"fit-content"}}>
							<span style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.4)",animation:"cmTypingDot 1.4s ease-in-out infinite",animationDelay:"0ms"}} />
							<span style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.4)",animation:"cmTypingDot 1.4s ease-in-out infinite",animationDelay:"200ms"}} />
							<span style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.4)",animation:"cmTypingDot 1.4s ease-in-out infinite",animationDelay:"400ms"}} />
						</div>
						<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.18em",color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>CLIENT TYPING</span>
					</div>
				</div>
			)}

			<div style={{borderTop:T.sub,background:T.obsidian,padding:"10px 12px",flexShrink:0,paddingBottom:"max(10px,env(safe-area-inset-bottom))"}}>
				{isFullPush ? (
					<form onSubmit={sendReply} style={{display:"flex",gap:8,alignItems:"flex-end"}}>
						<input ref={inputRef} value={input} onChange={handleAdminInputChange} disabled={sending} placeholder="Reply to client..." autoComplete="off"
							style={{flex:1,minWidth:0,background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.18)",borderRadius:10,padding:"11px 14px",color:"var(--text-primary)",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",WebkitAppearance:"none",boxSizing:"border-box"}} />
						<button type="submit" disabled={sending || !input.trim()}
							style={{flexShrink:0,background:T.shipped,borderRadius:10,padding:"11px 16px",color:"#000",fontWeight:700,border:"none",cursor:sending||!input.trim()?"not-allowed":"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",opacity:sending||!input.trim()?0.45:1,transition:"opacity 200ms",whiteSpace:"nowrap"}}>
							SEND
						</button>
					</form>
				) : (
					<div>
						<div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",marginBottom:8,borderRadius:10,background:isEscalated?"rgba(236,91,19,0.07)":"rgba(56,189,248,0.05)",border:isEscalated?"1px solid rgba(236,91,19,0.18)":"1px solid rgba(56,189,248,0.15)"}}>
							<span className="material-symbols-outlined" style={{fontSize:14,color:isEscalated?"rgba(236,91,19,0.7)":"rgba(56,189,248,0.6)",flexShrink:0}}>lock</span>
							<div style={{minWidth:0}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",color:isEscalated?"rgba(236,91,19,0.8)":"rgba(56,189,248,0.7)",marginBottom:1}}>
									{isEscalated ? "PARTIAL PUSH — READ ONLY" : "AWAITING FULL PUSH"}
								</p>
								<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"rgba(255,255,255,0.3)",lineHeight:1.4}}>
									{isEscalated ? <><b style={{color:"rgba(167,139,250,0.9)"}}>Admin Takeover</b> in the AI terminal unlocks messaging.</> : "Use Push Back to return to assistant, or wait for a Full Push to enable messaging."}
								</p>
							</div>
						</div>
						<div style={{display:"flex",gap:8,alignItems:"flex-end",opacity:0.25,pointerEvents:"none",userSelect:"none"}}>
							<input disabled readOnly placeholder="Reply to client..." style={{flex:1,minWidth:0,background:"var(--overlay-1)",border:"1px solid var(--overlay-4)",borderRadius:10,padding:"11px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"rgba(255,255,255,0.2)",outline:"none",cursor:"not-allowed",boxSizing:"border-box"}} />
							<div style={{flexShrink:0,background:"var(--overlay-4)",borderRadius:10,padding:"11px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"rgba(255,255,255,0.2)",whiteSpace:"nowrap"}}>SEND</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

/* ── Return Requests Panel ────────────────────────────────── */
const ReturnRequestsPanel = ({ onCountChange, isActive = true }) => {
	const [grouped, setGrouped]           = useState([]);
	const [loading, setLoading]           = useState(true);
	const [selected, setSelected]         = useState(null);
	const [activeReq, setActiveReq]       = useState(null);
	const [updatingId, setUpdatingId]     = useState(null);
	const [searchQ, setSearchQ]           = useState("");
	const [mobileShowDetail, setMobileShowDetail] = useState(false);
	const [emailSending, setEmailSending] = useState(false);

	const selectedRef      = useRef(null);
	const activeReqRef     = useRef(null);
	const onCountChangeRef = useRef(onCountChange);
	useEffect(() => { selectedRef.current      = selected;     }, [selected]);
	useEffect(() => { activeReqRef.current     = activeReq;    }, [activeReq]);
	useEffect(() => { onCountChangeRef.current = onCountChange;}, [onCountChange]);

	/* ── Status config with email trigger ── */
	const STATUS_COLORS = {
		pending:   { color:"#facc15", label:"PENDING",   emailTrigger: false },
		reviewing: { color:"#38bdf8", label:"REVIEWING", emailTrigger: false },
		approved:  { color:"#22c55e", label:"APPROVED",  emailTrigger: true  },
		rejected:  { color:"#ef4444", label:"REJECTED",  emailTrigger: true  },
		completed: { color:"#a78bfa", label:"COMPLETED", emailTrigger: true  },
	};

	const sync = useCallback(async () => {
		const { data, error } = await supabase.from("verp_return_requests").select("*").order("created_at", { ascending: false });
		if (error || !data) { setLoading(false); return; }
		const emailMap = {};
		data.forEach(r => {
			const key = r.customer_email || r.order_id || r.id;
			if (!emailMap[key]) emailMap[key] = [];
			emailMap[key].push(r);
		});
		const groupArr = Object.entries(emailMap).map(([email, reqs]) => ({
			email, requests: reqs, latest: reqs[0],
			hasUnresolved: reqs.some(r => ["pending","reviewing"].includes(r.status)),
		}));
		groupArr.sort((a, b) => (b.hasUnresolved ? 1 : 0) - (a.hasUnresolved ? 1 : 0) || new Date(b.latest.created_at) - new Date(a.latest.created_at));
		setGrouped(groupArr);
		const curSel = selectedRef.current;
		const curReq = activeReqRef.current;
		if (curSel) {
			const rg = groupArr.find(g => g.email === curSel.email);
			if (rg) {
				setSelected(rg);
				if (curReq) { const rr = rg.requests.find(r => r.id === curReq.id); if (rr) setActiveReq(rr); }
			}
		}
		onCountChangeRef.current?.(groupArr.filter(g => g.hasUnresolved).length);
		setLoading(false);
	}, []);

	useEffect(() => { sync(); const i = setInterval(sync, 8000); return () => clearInterval(i); }, [sync]);

	const updateStatus = async (id, status) => {
		if (!isActive) return;
		setUpdatingId(id);
		const req = activeReqRef.current?.id === id ? activeReqRef.current : null;

		/* Optimistic UI update */
		setActiveReq(prev => prev?.id === id ? { ...prev, status } : prev);
		setGrouped(prev => prev.map(g => ({
			...g,
			requests: g.requests.map(r => r.id === id ? { ...r, status } : r),
			latest: g.latest?.id === id ? { ...g.latest, status } : g.latest,
			hasUnresolved: g.requests.some(r => r.id === id ? ["pending","reviewing"].includes(status) : ["pending","reviewing"].includes(r.status)),
		})));

		/* Single server call — handles DB update, order sync, and client email */
		const cfg = STATUS_COLORS[status];
		if (cfg?.emailTrigger) setEmailSending(true);
		try {
			await serverUpdateReturnStatus(id, status, req?.order_id);
		} catch (err) {
			console.error("[updateStatus] server error:", err.message);
		} finally {
			if (cfg?.emailTrigger) setEmailSending(false);
		}

		await sync();
		setUpdatingId(null);
	};

	const filtered = grouped.filter(g => {
		const q = searchQ.toLowerCase();
		return !q || g.email?.toLowerCase().includes(q) || g.requests.some(r => r.order_number?.toLowerCase().includes(q));
	});

	const handleSelectGroup = (g) => { setSelected(g); setActiveReq(g.latest); setMobileShowDetail(true); };
	const displayReq = activeReq;

	return (
		<div style={{display:"flex",height:"100%",background:T.void,overflow:"hidden"}}>
			<style>{`
				.rp-list{display:flex;flex-direction:column;width:280px;border-right:${T.border};flex-shrink:0;overflow:hidden}
				.rp-detail{flex:1;display:flex;flex-direction:column;overflow:hidden}
				.rp-back{display:none;align-items:center;gap:6px;padding:10px 14px;background:${T.obsidian};border:none;border-bottom:1px solid var(--overlay-2);cursor:pointer;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;flex-shrink:0;width:100%}
				@media(max-width:640px){
					.rp-list{width:100%;border-right:none;display:${!mobileShowDetail ? "flex" : "none"} !important}
					.rp-detail{display:${mobileShowDetail ? "flex" : "none"} !important}
					.rp-back{display:flex !important}
				}
			`}</style>

			{/* List */}
			<div className="rp-list">
				<div style={{padding:"12px 12px 8px",borderBottom:T.sub,flexShrink:0}}>
					<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.3em",textTransform:"uppercase",color:T.ember,marginBottom:8,paddingLeft:2}}>
						RETURN REQUESTS · {grouped.filter(g => g.hasUnresolved).length} UNRESOLVED
					</p>
					<input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search email / order..."
						style={{width:"100%",background:"var(--overlay-2)",border:"1px solid var(--overlay-4)",borderRadius:8,padding:"8px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"var(--text-secondary)",outline:"none",boxSizing:"border-box"}} />
				</div>
				<div style={{flex:1,overflowY:"auto",padding:8}}>
					{loading && <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"var(--border-medium)",textAlign:"center",paddingTop:40,letterSpacing:"0.2em",textTransform:"uppercase"}}>LOADING…</p>}
					{!loading && filtered.length === 0 && <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"var(--border-medium)",textAlign:"center",paddingTop:40,letterSpacing:"0.2em",textTransform:"uppercase"}}>NO REQUESTS</p>}
					{filtered.map(g => {
						const sc   = STATUS_COLORS[g.latest?.status] || STATUS_COLORS.pending;
						const isSel = selected?.email === g.email;
						return (
							<button key={g.email} onClick={() => handleSelectGroup(g)}
								style={{width:"100%",textAlign:"left",padding:"12px",background:isSel?"rgba(236,91,19,0.08)":"transparent",border:isSel?"1px solid rgba(236,91,19,0.22)":"1px solid transparent",borderRadius:10,cursor:"pointer",transition:"all 160ms",marginBottom:4}}
								onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "var(--overlay-2)"; }}
								onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
								<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
									<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"var(--text-primary)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{g.email}</p>
									<div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
										{g.requests.length > 1 && (
											<span style={{display:"inline-flex",alignItems:"center",padding:"1px 6px",borderRadius:999,background:"var(--overlay-4)",border:"1px solid var(--border-medium)",fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.35)"}}>×{g.requests.length}</span>
										)}
										<span style={{display:"inline-flex",padding:"2px 7px",borderRadius:999,background:`${sc.color}14`,border:`1px solid ${sc.color}40`,fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:sc.color,textTransform:"uppercase",letterSpacing:"0.1em",whiteSpace:"nowrap"}}>{sc.label}</span>
									</div>
								</div>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
									{g.requests.length > 1 ? `${g.requests.length} REQUESTS` : `ORDER ${g.latest.order_number || g.latest.order_id?.slice(0,8)}`} · GH₵ {Number(g.latest.total_amount || 0).toLocaleString()}
								</p>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:"rgba(255,255,255,0.12)",marginTop:3,letterSpacing:"0.08em"}}>{new Date(g.latest.created_at).toLocaleDateString()}</p>
							</button>
						);
					})}
				</div>
			</div>

			{/* Detail */}
			<div className="rp-detail">
				<button className="rp-back" onClick={() => setMobileShowDetail(false)}>
					<span className="material-symbols-outlined" style={{fontSize:16}}>arrow_back</span>REQUESTS
				</button>
				{selected && displayReq ? (
					<>
						<div style={{padding:"14px 16px",background:T.obsidian,borderBottom:T.sub,flexShrink:0}}>
							<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.25em",color:T.ember,textTransform:"uppercase",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.email}</p>
							<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.25)",letterSpacing:"0.12em",textTransform:"uppercase"}}>
								ORDER {displayReq.order_number || displayReq.order_id?.slice(0,8)} · GH₵ {Number(displayReq.total_amount || 0).toLocaleString()}
							</p>
						</div>
						{selected.requests.length > 1 && (
							<div style={{padding:"10px 16px 0",borderBottom:T.sub,background:T.obsidian,flexShrink:0}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",marginBottom:8}}>ALL REQUESTS ({selected.requests.length})</p>
								<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch"}}>
									{selected.requests.map((r, i) => {
										const sc    = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
										const isAct = activeReq?.id === r.id;
										return (
											<button key={r.id} onClick={() => setActiveReq(r)}
												style={{flexShrink:0,padding:"6px 12px",borderRadius:8,border:isAct?`1px solid ${sc.color}50`:"1px solid var(--border-medium)",background:isAct?`${sc.color}14`:"transparent",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",textTransform:"uppercase",color:isAct?sc.color:"rgba(255,255,255,0.3)",transition:"all 160ms",whiteSpace:"nowrap"}}>
												#{i+1} · {r.order_number || r.order_id?.slice(0,6)} · <span style={{color:sc.color}}>{sc.label}</span>
											</button>
										);
									})}
								</div>
							</div>
						)}
						<div style={{flex:1,overflowY:"auto",padding:"16px",WebkitOverflowScrolling:"touch"}}>

							{/* Reason */}
							<div style={{background:"var(--overlay-1)",border:"1px solid var(--border-light)",borderRadius:14,padding:"16px",marginBottom:16}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(236,91,19,0.6)",marginBottom:10}}>REASON FOR RETURN</p>
								<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.75,color:"var(--text-secondary)"}}>{displayReq.reason}</p>
							</div>

							{/* Items snapshot */}
							{displayReq.items_snapshot?.length > 0 && (
								<div style={{marginBottom:16}}>
									<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",marginBottom:10}}>ORDER ITEMS</p>
									<div style={{display:"flex",flexDirection:"column",gap:8}}>
										{displayReq.items_snapshot.map((item, i) => (
											<div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"var(--overlay-1)",border:"1px solid var(--overlay-3)",borderRadius:10,padding:"10px 12px"}}>
												{item.image && <img src={item.image} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:6,flexShrink:0}} />}
												<div style={{minWidth:0,flex:1}}>
													<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
													<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.25)",letterSpacing:"0.12em"}}>QTY: {item.quantity} · GH₵ {Number(item.price || 0).toLocaleString()}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* ── UPDATE STATUS with email trigger badges ── */}
							<div>
								<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
									<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)"}}>UPDATE STATUS</p>
									{emailSending && (
										<div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:8}}>
											<div style={{width:8,height:8,borderRadius:"50%",border:"1.5px solid rgba(34,197,94,0.3)",borderTopColor:"#22c55e",animation:"crSpin 0.7s linear infinite"}} />
											<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,letterSpacing:"0.18em",textTransform:"uppercase",color:"#22c55e",margin:0}}>SENDING EMAIL</p>
										</div>
									)}
								</div>
								{!isActive && (
									<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(239,68,68,0.5)",marginBottom:8}}>
										⚠ SWITCH TO RETURN REQUESTS TAB TO UPDATE
									</p>
								)}
								<div style={{display:"flex",flexWrap:"wrap",gap:8,pointerEvents:isActive?"auto":"none",opacity:isActive?1:0.3}}>
									{Object.entries(STATUS_COLORS).map(([s, sc]) => {
										const isActive_ = displayReq.status === s;
										return (
											<button key={s} disabled={!isActive || updatingId === displayReq.id} onClick={() => updateStatus(displayReq.id, s)}
												style={{
													padding:"9px 15px",borderRadius:10,
													border:`1px solid ${sc.color}40`,
													background:isActive_?`${sc.color}20`:"transparent",
													fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.15em",textTransform:"uppercase",
													color:sc.color,cursor:(!isActive||updatingId===displayReq.id)?"not-allowed":"pointer",
													transition:"all 200ms",fontWeight:isActive_?700:400,
													display:"flex",alignItems:"center",gap:6,
												}}
												onMouseEnter={e => { if (isActive && !isActive_) e.currentTarget.style.background = `${sc.color}12`; }}
												onMouseLeave={e => { if (isActive && !isActive_) e.currentTarget.style.background = "transparent"; }}>
												{updatingId === displayReq.id ? "…" : sc.label}
												{sc.emailTrigger && (
													<span title="Sends email notification to client" style={{
														display:"inline-flex",width:14,height:14,borderRadius:"50%",
														background:`${sc.color}20`,border:`1px solid ${sc.color}50`,
														alignItems:"center",justifyContent:"center",flexShrink:0,
													}}>
														<span style={{fontSize:8}}>✉</span>
													</span>
												)}
											</button>
										);
									})}
								</div>

								{/* Email legend */}
								<div style={{display:"flex",alignItems:"center",gap:6,marginTop:12,padding:"8px 12px",background:"var(--overlay-1)",border:"1px solid var(--border-light)",borderRadius:8}}>
									<span style={{fontSize:10}}>✉</span>
									<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",margin:0}}>
										EMAIL ICON = AUTOMATIC CLIENT NOTIFICATION WILL BE SENT
									</p>
								</div>
							</div>
						</div>
					</>
				) : (
					<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,opacity:0.12}}>
						<span className="material-symbols-outlined" style={{fontSize:44}}>assignment_return</span>
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.3em",textTransform:"uppercase"}}>SELECT A RETURN REQUEST</p>
					</div>
				)}
			</div>
			<style>{`@keyframes crSpin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);
};

/* ── Root ClientMessages component ───────────────────────── */
const ClientMessages = () => {
	const [sessions, setSessions]           = useState([]);
	const [selectedSession, setSelectedSession] = useState(null);
	const [searchQuery, setSearchQuery]     = useState("");
	const [mobileShowChat, setMobileShowChat] = useState(false);
	const [activePanel, setActivePanel]     = useState("chats");
	const [liveReturnCount, setLiveReturnCount] = useState(0);
	const [seenReturnCount, setSeenReturnCount] = useState(0);
	const badgeCount = Math.max(0, liveReturnCount - seenReturnCount);

	const selectedSessionRef  = useRef(null);
	const liveReturnCountRef  = useRef(0);
	useEffect(() => { selectedSessionRef.current = selectedSession; }, [selectedSession]);
	useEffect(() => { liveReturnCountRef.current = liveReturnCount; }, [liveReturnCount]);

	const handleTabClick = (key) => {
		setActivePanel(key);
		if (key === "returns") setSeenReturnCount(liveReturnCountRef.current);
	};

	const syncSessions = useCallback(async () => {
		const { data } = await supabase.from("verp_support_sessions").select("*").not("status", "eq", "resolved").order("updated_at", { ascending:false, nullsFirst:false });
		if (data) {
			setSessions(data);
			const cur = selectedSessionRef.current;
			if (cur) {
				const r = data.find(s => s.id === cur.id);
				if (r) setSelectedSession(r);
			}
		}
	}, []);

	useEffect(() => { syncSessions(); const i = setInterval(syncSessions, 5000); return () => clearInterval(i); }, [syncSessions]);

	const handlePushBack = async () => {
		if (!selectedSession) return;
		await supabase.from("verp_support_sessions").update({ status:"live", admin_note:null }).eq("id", selectedSession.id);
		await supabase.from("verp_private_channel").insert([{ sender:"admin", content:`PUSH BACK: ${selectedSession.client_email} — you can resume the session.` }]);
		try {
			await fetch("/api/alert-staff", { method:"POST", headers:{ "Content-Type":"application/json", "x-internal-secret": getInternalSecret() }, body:JSON.stringify({ type:"PUSH_BACK", clientId:selectedSession.client_email }) });
		} catch (err) {}
		setSelectedSession(null);
		setMobileShowChat(false);
		syncSessions();
	};

	const filtered = sessions.filter(s => {
		const q = searchQuery.toLowerCase();
		return !q || s.client_email?.toLowerCase().includes(q) || s.admin_note?.toLowerCase().includes(q);
	});

	const handleSelectSession = (s) => {
		setSelectedSession(s);
		setMobileShowChat(true);
		setSeenReturnCount(liveReturnCountRef.current);
	};

	return (
		<>
			<style>{`
				@keyframes fadeUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
				@keyframes badgePop { 0%,100%{transform:scale(1);box-shadow:0 0 8px rgba(239,68,68,0.6);}50%{transform:scale(1.18);box-shadow:0 0 14px rgba(239,68,68,0.9);} }
				@keyframes cmTypingDot{0%,60%,100%{opacity:0.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
				::-webkit-scrollbar{width:3px;height:3px}
				::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.3);border-radius:99px}
				.cm-list{display:flex;flex-direction:column;width:280px;flex-shrink:0}
				.cm-chat-pane{flex:1;display:flex;flex-direction:column;overflow:hidden}
				.cm-back-btn{display:none;align-items:center;gap:6px;padding:10px 14px;background:var(--bg-panel);border:none;border-bottom:1px solid var(--overlay-2);cursor:pointer;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;flex-shrink:0;width:100%;box-sizing:border-box}
				@media(max-width:640px){
					.cm-list{width:100% !important;border-right:none !important;display:${!mobileShowChat ? "flex" : "none"} !important}
					.cm-chat-pane{display:${mobileShowChat ? "flex" : "none"} !important}
					.cm-back-btn{display:flex !important}
				}
			`}</style>
			<div style={{display:"flex",flexDirection:"column",height:"100%",background:T.void,fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>

				{/* Tabs */}
				<div style={{display:"flex",gap:4,padding:"10px 12px",borderBottom:"1px solid var(--overlay-4)",flexShrink:0,background:T.obsidian,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
					{[
						{ key:"chats",   label:"Support Chats",  icon:"forum" },
						{ key:"returns", label:"Return Requests", icon:"assignment_return" },
					].map(({ key, label, icon }) => (
						<button key={key} onClick={() => handleTabClick(key)}
							style={{position:"relative",display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,background:activePanel===key?"rgba(236,91,19,0.15)":"transparent",border:activePanel===key?"1px solid rgba(236,91,19,0.35)":"1px solid transparent",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.15em",textTransform:"uppercase",color:activePanel===key?T.ember:"rgba(255,255,255,0.3)",transition:"all 160ms",flexShrink:0,whiteSpace:"nowrap"}}>
							<span className="material-symbols-outlined" style={{fontSize:13}}>{icon}</span>
							{label}
							{key === "returns" && badgeCount > 0 && (
								<span style={{position:"absolute",top:-6,right:-6,minWidth:17,height:17,borderRadius:999,background:"#ef4444",color:"var(--text-primary)",fontFamily:"'JetBrains Mono',monospace",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",lineHeight:1,animation:"badgePop 2s ease-in-out infinite"}}>
									{badgeCount > 99 ? "99+" : badgeCount}
								</span>
							)}
						</button>
					))}
				</div>

				{/* Panels */}
				{activePanel === "returns" ? (
					<div style={{flex:1,overflow:"hidden"}}>
						<ReturnRequestsPanel onCountChange={setLiveReturnCount} isActive={activePanel === "returns"} />
					</div>
				) : (
					<div style={{flex:1,display:"flex",overflow:"hidden"}}>
						<div className="cm-list">
							<ClientMessages_SessionList sessions={filtered} selectedId={selectedSession?.id} onSelect={handleSelectSession} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
						</div>
						<div className="cm-chat-pane">
							<button className="cm-back-btn" onClick={() => setMobileShowChat(false)}>
								<span className="material-symbols-outlined" style={{fontSize:16}}>arrow_back</span>SESSIONS
							</button>
							{selectedSession ? (
								<ClientMessages_ChatWindow session={selectedSession} onPushBack={handlePushBack} onSessionUpdate={syncSessions} onResolve={() => { syncSessions(); setSelectedSession(null); setMobileShowChat(false); }} />
							) : (
								<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,opacity:0.12}}>
									<span className="material-symbols-outlined" style={{fontSize:44}}>forum</span>
									<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.3em",textTransform:"uppercase"}}>SELECT A SESSION</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ClientMessages;