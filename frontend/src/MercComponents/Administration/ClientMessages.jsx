import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

const T = {
	void:"#080808", obsidian:"#0d0d0d", ember:"#ec5b13",
	shipped:"#38bdf8", live:"#22c55e", waiting:"#f59e0b", violet:"#a78bfa",
	border:"1px solid rgba(255,255,255,0.06)", sub:"1px solid rgba(255,255,255,0.03)",
};

const ClientMessages_StatusBadge = ({ status }) => {
	const map = {
		waiting:{color:T.waiting,label:"WAITING"}, live:{color:T.live,label:"LIVE"},
		escalated:{color:T.waiting,label:"PARTIAL PUSH"}, full_push:{color:T.violet,label:"ADMIN TAKEOVER"},
		resolved:{color:"rgba(255,255,255,0.2)",label:"RESOLVED"},
	};
	const {color,label}=map[status]||{color:"rgba(255,255,255,0.2)",label:status?.toUpperCase()};
	return(
		<span style={{display:"inline-flex",padding:"2px 8px",borderRadius:999,background:`${color}14`,border:`1px solid ${color}40`,fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",color,textTransform:"uppercase",whiteSpace:"nowrap"}}>
			{label}
		</span>
	);
};

const ClientMessages_SessionList = ({sessions,selectedId,onSelect,searchQuery,onSearchChange}) => (
	<div style={{width:"100%",borderRight:T.border,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",height:"100%"}}>
		<div style={{padding:"12px 12px 8px",borderBottom:T.sub,flexShrink:0}}>
			<div style={{position:"relative"}}>
				<span className="material-symbols-outlined" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"rgba(255,255,255,0.25)"}}>search</span>
				<input value={searchQuery} onChange={e=>onSearchChange(e.target.value)} placeholder="Search clients..."
					style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"9px 12px 9px 32px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,0.7)",outline:"none",boxSizing:"border-box"}}/>
			</div>
		</div>
		<div style={{flex:1,overflowY:"auto",padding:"8px"}}>
			{sessions.length===0&&<p style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",color:"rgba(255,255,255,0.12)",textTransform:"uppercase",paddingTop:40}}>NO RESULTS</p>}
			{sessions.map(s=>(
				<button key={s.id} onClick={()=>onSelect(s)}
					style={{width:"100%",textAlign:"left",padding:"12px",background:selectedId===s.id?"rgba(236,91,19,0.08)":"transparent",border:selectedId===s.id?"1px solid rgba(236,91,19,0.22)":"1px solid transparent",borderRadius:10,cursor:"pointer",transition:"all 160ms",marginBottom:4}}
					onMouseEnter={e=>{if(selectedId!==s.id)e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
					onMouseLeave={e=>{if(selectedId!==s.id)e.currentTarget.style.background="transparent";}}>
					<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,marginBottom:4}}>
						<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.8)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{s.client_email}</p>
						<ClientMessages_StatusBadge status={s.status}/>
					</div>
					{s.admin_note&&<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.admin_note.replace(/^FULL_PUSH:\s*/i,"")}</p>}
				</button>
			))}
		</div>
	</div>
);

const ClientMessages_ChatWindow = ({session,onPushBack,onSessionUpdate,onResolve}) => {
	const [messages,setMessages]=useState([]);
	const [input,setInput]=useState("");
	const [sending,setSending]=useState(false);
	const [returnRequest,setReturnRequest]=useState(null);
	const [savingReturn,setSavingReturn]=useState(false);
	const scrollRef=useRef(null);
	const inputRef=useRef(null);

	const syncReturnRequest=useCallback(async()=>{
		let q=supabase.from("verp_return_requests").select("id,status,order_id,order_number,created_at");
		if(session.order_id) q=q.eq("order_id",session.order_id);
		else q=q.eq("customer_email",session.client_email);
		const{data}=await q.order("created_at",{ascending:false}).limit(1);
		setReturnRequest(data?.[0]??null);
	},[session.order_id,session.client_email]);

	useEffect(()=>{syncReturnRequest();},[syncReturnRequest]);

	const updateReturnStatus=async(newStatus)=>{
		if(!returnRequest||savingReturn)return;
		setSavingReturn(true);
		try{
			const{error}=await supabase.from("verp_return_requests").update({status:newStatus}).eq("id",returnRequest.id);
			if(error)throw error;
			setReturnRequest(prev=>prev?{...prev,status:newStatus}:prev);
			if(onSessionUpdate)onSessionUpdate();
		}catch(_){}
		setSavingReturn(false);
	};

	const syncMessages=useCallback(async()=>{
		const{data}=await supabase.from("verp_chat_messages").select("*").eq("chat_id",session.id).order("created_at",{ascending:true});
		if(data)setMessages(data);
	},[session.id]);

	useEffect(()=>{syncMessages();const i=setInterval(syncMessages,4500);return()=>clearInterval(i);},[syncMessages]);
	useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[messages]);

	const sendReply=async(e)=>{
		e.preventDefault();
		if(!input.trim()||sending||session.status==="escalated")return;
		setSending(true);
		const content=input.trim();
		setInput("");
		await supabase.from("verp_chat_messages").insert([{chat_id:session.id,sender_role:"admin",content}]);
		setMessages(prev=>[...prev,{id:Date.now(),chat_id:session.id,sender_role:"admin",content,created_at:new Date().toISOString()}]);
		setSending(false);
		if(inputRef.current)inputRef.current.focus();
	};

	const resolveSession=async()=>{
		await supabase.from("verp_support_sessions").update({status:"resolved",updated_at:new Date().toISOString()}).eq("id",session.id);
		if(onSessionUpdate)onSessionUpdate();
		if(onResolve)onResolve();
	};

	const isFullPush=session.status==="full_push";
	const isEscalated=session.status==="escalated";
	const currentReturnStatus=returnRequest?.status||"submitted";
	const RETURN_STATUSES=["submitted","pending","reviewing","rejected","approved","completed"];

	return(
		<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
			{/* Header */}
			<div style={{padding:"10px 14px",background:T.obsidian,borderBottom:T.sub,flexShrink:0}}>
				{/* Row 1: email + action btns */}
				<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:returnRequest?8:0}}>
					<div style={{minWidth:0,flex:1}}>
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:T.ember,textTransform:"uppercase",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>
							{session.client_email}
						</p>
						<ClientMessages_StatusBadge status={session.status}/>
					</div>
					<div style={{display:"flex",gap:6,flexShrink:0}}>
						{isEscalated&&(
							<button onClick={onPushBack} style={{background:`${T.live}15`,border:`1px solid ${T.live}40`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",textTransform:"uppercase",color:T.live,fontWeight:700,whiteSpace:"nowrap"}}>
								↩ PUSH BACK
							</button>
						)}
						{isFullPush&&(
							<button onClick={resolveSession} style={{background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.4)",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",textTransform:"uppercase",color:"#22c55e",fontWeight:700,whiteSpace:"nowrap"}}>
								RESOLVE
							</button>
						)}
					</div>
				</div>
				{/* Row 2: return status pills — horizontally scrollable */}
				{returnRequest&&(
					<div style={{display:"flex",alignItems:"center",gap:5,overflowX:"auto",paddingBottom:2,WebkitOverflowScrolling:"touch"}}>
						<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",flexShrink:0}}>Return:</span>
						{RETURN_STATUSES.map(st=>{
							const isAct=currentReturnStatus===st;
							return(
								<button key={st} disabled={savingReturn} onClick={()=>updateReturnStatus(st)}
									style={{flexShrink:0,padding:"4px 8px",borderRadius:999,border:isAct?"1px solid rgba(236,91,19,0.8)":"1px solid rgba(255,255,255,0.08)",background:isAct?"rgba(236,91,19,0.2)":"transparent",fontFamily:"'JetBrains Mono',monospace",fontSize:7,textTransform:"uppercase",color:isAct?T.ember:"rgba(255,255,255,0.35)",cursor:savingReturn?"not-allowed":"pointer",transition:"all 150ms",whiteSpace:"nowrap"}}>
									{st}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{/* Messages */}
			<div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,WebkitOverflowScrolling:"touch"}}>
				{messages.length===0&&(
					<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.15,paddingTop:40}}>
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase"}}>NO MESSAGES YET</p>
					</div>
				)}
				{messages.map((msg,idx)=>{
					const isClient=msg.sender_role==="client";
					const isAdmin=msg.sender_role==="admin";
					const bg=isClient?"rgba(255,255,255,0.08)":isAdmin?T.violet:T.ember;
					return(
						<div key={msg.id||idx} style={{display:"flex",justifyContent:isClient?"flex-start":"flex-end"}}>
							<div style={{maxWidth:"78%",display:"flex",flexDirection:"column",alignItems:isClient?"flex-start":"flex-end",gap:3}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,letterSpacing:"0.18em",textTransform:"uppercase",color:isClient?"rgba(255,255,255,0.2)":isAdmin?`${T.violet}70`:`${T.ember}70`}}>
									{isClient?"CLIENT":isAdmin?"YOU (ADMIN)":"ASSISTANT"} · {new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
								</p>
								<div style={{padding:"10px 14px",background:bg,border:isClient?T.border:"none",borderRadius:isClient?"4px 14px 14px 14px":"14px 4px 14px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:isClient?"rgba(255,255,255,0.8)":"#000",lineHeight:1.6,fontWeight:isClient?400:500,wordBreak:"break-word"}}>
									{msg.content}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Input — pinned to bottom, keyboard-safe */}
			<div style={{borderTop:T.sub,background:T.obsidian,padding:"10px 12px",flexShrink:0,paddingBottom:"max(10px,env(safe-area-inset-bottom))"}}>
				{isEscalated?(
					<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"6px 0"}}>
						CHAT ESCALATED — MONITOR ONLY
					</p>
				):(
					<form onSubmit={sendReply} style={{display:"flex",gap:8,alignItems:"flex-end"}}>
						<input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} disabled={sending}
							placeholder="Reply to client..." autoComplete="off"
							style={{flex:1,minWidth:0,background:"rgba(56,189,248,0.04)",border:"1px solid rgba(56,189,248,0.18)",borderRadius:10,padding:"11px 14px",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",WebkitAppearance:"none",boxSizing:"border-box"}}/>
						<button type="submit" disabled={sending||!input.trim()}
							style={{flexShrink:0,background:T.shipped,borderRadius:10,padding:"11px 16px",color:"#000",fontWeight:700,border:"none",cursor:sending||!input.trim()?"not-allowed":"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.1em",opacity:sending||!input.trim()?0.45:1,transition:"opacity 200ms",whiteSpace:"nowrap"}}>
							SEND
						</button>
					</form>
				)}
			</div>
		</div>
	);
};

const ReturnRequestsPanel = ({onCountChange}) => {
	const [grouped,setGrouped]=useState([]);
	const [loading,setLoading]=useState(true);
	const [selected,setSelected]=useState(null);
	const [activeReq,setActiveReq]=useState(null);
	const [updatingId,setUpdatingId]=useState(null);
	const [searchQ,setSearchQ]=useState("");
	const [mobileShowDetail,setMobileShowDetail]=useState(false);

	const selectedRef=useRef(null);
	const activeReqRef=useRef(null);
	const onCountChangeRef=useRef(onCountChange);
	useEffect(()=>{selectedRef.current=selected;},[selected]);
	useEffect(()=>{activeReqRef.current=activeReq;},[activeReq]);
	useEffect(()=>{onCountChangeRef.current=onCountChange;},[onCountChange]);

	const STATUS_COLORS={
		pending:{color:"#facc15",label:"PENDING"}, reviewing:{color:"#38bdf8",label:"REVIEWING"},
		approved:{color:"#22c55e",label:"APPROVED"}, rejected:{color:"#ef4444",label:"REJECTED"},
		completed:{color:"#a78bfa",label:"COMPLETED"},
	};

	const sync=useCallback(async()=>{
		const{data,error}=await supabase.from("verp_return_requests").select("*").order("created_at",{ascending:false});
		if(error||!data){setLoading(false);return;}
		const emailMap={};
		data.forEach(r=>{
			const key=r.customer_email||r.order_id||r.id;
			if(!emailMap[key])emailMap[key]=[];
			emailMap[key].push(r);
		});
		const groupArr=Object.entries(emailMap).map(([email,reqs])=>({
			email,requests:reqs,latest:reqs[0],
			hasUnresolved:reqs.some(r=>["pending","reviewing"].includes(r.status)),
		}));
		groupArr.sort((a,b)=>
			(b.hasUnresolved?1:0)-(a.hasUnresolved?1:0)||
			new Date(b.latest.created_at)-new Date(a.latest.created_at)
		);
		setGrouped(groupArr);
		const curSel=selectedRef.current;
		const curReq=activeReqRef.current;
		if(curSel){
			const rg=groupArr.find(g=>g.email===curSel.email);
			if(rg){
				setSelected(rg);
				if(curReq){const rr=rg.requests.find(r=>r.id===curReq.id);if(rr)setActiveReq(rr);}
			}
		}
		onCountChangeRef.current?.(groupArr.filter(g=>g.hasUnresolved).length);
		setLoading(false);
	},[]);

	useEffect(()=>{sync();const i=setInterval(sync,8000);return()=>clearInterval(i);},[sync]);

	const updateStatus=async(id,status)=>{
		setUpdatingId(id);
		const resolved_at=["approved","rejected","completed"].includes(status)?new Date().toISOString():null;
		setActiveReq(prev=>prev?.id===id?{...prev,status}:prev);
		setGrouped(prev=>prev.map(g=>({
			...g,
			requests:g.requests.map(r=>r.id===id?{...r,status}:r),
			latest:g.latest?.id===id?{...g.latest,status}:g.latest,
			hasUnresolved:g.requests.some(r=>r.id===id?["pending","reviewing"].includes(status):["pending","reviewing"].includes(r.status)),
		})));
		await supabase.from("verp_return_requests").update({status,resolved_at}).eq("id",id);
		await sync();
		setUpdatingId(null);
	};

	const filtered=grouped.filter(g=>{
		const q=searchQ.toLowerCase();
		return!q||g.email?.toLowerCase().includes(q)||g.requests.some(r=>r.order_number?.toLowerCase().includes(q));
	});

	const handleSelectGroup=(g)=>{setSelected(g);setActiveReq(g.latest);setMobileShowDetail(true);};
	const displayReq=activeReq;

	return(
		<div style={{display:"flex",height:"100%",background:T.void,overflow:"hidden"}}>
			<style>{`
				.rp-list{display:flex;flex-direction:column;width:280px;border-right:${T.border};flex-shrink:0;overflow:hidden}
				.rp-detail{flex:1;display:flex;flex-direction:column;overflow:hidden}
				.rp-back{display:none;align-items:center;gap:6px;padding:10px 14px;background:${T.obsidian};border:none;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;flex-shrink:0;width:100%}
				@media(max-width:640px){
					.rp-list{width:100%;border-right:none;display:${!mobileShowDetail?"flex":"none"} !important}
					.rp-detail{display:${mobileShowDetail?"flex":"none"} !important}
					.rp-back{display:flex !important}
				}
			`}</style>

			{/* List */}
			<div className="rp-list">
				<div style={{padding:"12px 12px 8px",borderBottom:T.sub,flexShrink:0}}>
					<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.3em",textTransform:"uppercase",color:T.ember,marginBottom:8,paddingLeft:2}}>
						RETURN REQUESTS · {grouped.filter(g=>g.hasUnresolved).length} UNRESOLVED
					</p>
					<input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search email / order..."
						style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"8px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.7)",outline:"none",boxSizing:"border-box"}}/>
				</div>
				<div style={{flex:1,overflowY:"auto",padding:8}}>
					{loading&&<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.1)",textAlign:"center",paddingTop:40,letterSpacing:"0.2em",textTransform:"uppercase"}}>LOADING…</p>}
					{!loading&&filtered.length===0&&<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.1)",textAlign:"center",paddingTop:40,letterSpacing:"0.2em",textTransform:"uppercase"}}>NO REQUESTS</p>}
					{filtered.map(g=>{
						const sc=STATUS_COLORS[g.latest?.status]||STATUS_COLORS.pending;
						const isSel=selected?.email===g.email;
						return(
							<button key={g.email} onClick={()=>handleSelectGroup(g)}
								style={{width:"100%",textAlign:"left",padding:"12px",background:isSel?"rgba(236,91,19,0.08)":"transparent",border:isSel?"1px solid rgba(236,91,19,0.22)":"1px solid transparent",borderRadius:10,cursor:"pointer",transition:"all 160ms",marginBottom:4}}
								onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
								onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent";}}>
								<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
									<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{g.email}</p>
									<div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
										{g.requests.length>1&&<span style={{display:"inline-flex",alignItems:"center",padding:"1px 6px",borderRadius:999,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.35)"}}>×{g.requests.length}</span>}
										<span style={{display:"inline-flex",padding:"2px 7px",borderRadius:999,background:`${sc.color}14`,border:`1px solid ${sc.color}40`,fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:sc.color,textTransform:"uppercase",letterSpacing:"0.1em",whiteSpace:"nowrap"}}>{sc.label}</span>
									</div>
								</div>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
									{g.requests.length>1?`${g.requests.length} REQUESTS`:`ORDER ${g.latest.order_number||g.latest.order_id?.slice(0,8)}`} · GH₵ {Number(g.latest.total_amount||0).toLocaleString()}
								</p>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:"rgba(255,255,255,0.12)",marginTop:3,letterSpacing:"0.08em"}}>{new Date(g.latest.created_at).toLocaleDateString()}</p>
							</button>
						);
					})}
				</div>
			</div>

			{/* Detail */}
			<div className="rp-detail">
				<button className="rp-back" onClick={()=>setMobileShowDetail(false)}>
					<span className="material-symbols-outlined" style={{fontSize:16}}>arrow_back</span>REQUESTS
				</button>
				{selected&&displayReq?(
					<>
						<div style={{padding:"14px 16px",background:T.obsidian,borderBottom:T.sub,flexShrink:0}}>
							<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.25em",color:T.ember,textTransform:"uppercase",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.email}</p>
							<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.25)",letterSpacing:"0.12em",textTransform:"uppercase"}}>
								ORDER {displayReq.order_number||displayReq.order_id?.slice(0,8)} · GH₵ {Number(displayReq.total_amount||0).toLocaleString()}
							</p>
						</div>
						{selected.requests.length>1&&(
							<div style={{padding:"10px 16px 0",borderBottom:T.sub,background:T.obsidian,flexShrink:0}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",marginBottom:8}}>ALL REQUESTS ({selected.requests.length})</p>
								<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch"}}>
									{selected.requests.map((r,i)=>{
										const sc=STATUS_COLORS[r.status]||STATUS_COLORS.pending;
										const isAct=activeReq?.id===r.id;
										return(
											<button key={r.id} onClick={()=>setActiveReq(r)}
												style={{flexShrink:0,padding:"6px 12px",borderRadius:8,border:isAct?`1px solid ${sc.color}50`:"1px solid rgba(255,255,255,0.08)",background:isAct?`${sc.color}14`:"transparent",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.12em",textTransform:"uppercase",color:isAct?sc.color:"rgba(255,255,255,0.3)",transition:"all 160ms",whiteSpace:"nowrap"}}>
												#{i+1} · {r.order_number||r.order_id?.slice(0,6)} · <span style={{color:sc.color}}>{sc.label}</span>
											</button>
										);
									})}
								</div>
							</div>
						)}
						<div style={{flex:1,overflowY:"auto",padding:"16px",WebkitOverflowScrolling:"touch"}}>
							<div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,padding:"16px",marginBottom:16}}>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(236,91,19,0.6)",marginBottom:10}}>REASON FOR RETURN</p>
								<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.75,color:"rgba(255,255,255,0.7)"}}>{displayReq.reason}</p>
							</div>
							{displayReq.items_snapshot?.length>0&&(
								<div style={{marginBottom:16}}>
									<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",marginBottom:10}}>ORDER ITEMS</p>
									<div style={{display:"flex",flexDirection:"column",gap:8}}>
										{displayReq.items_snapshot.map((item,i)=>(
											<div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 12px"}}>
												{item.image&&<img src={item.image} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:6,flexShrink:0}}/>}
												<div style={{minWidth:0,flex:1}}>
													<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
													<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.25)",letterSpacing:"0.12em"}}>QTY: {item.quantity} · GH₵ {Number(item.price||0).toLocaleString()}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
							<div>
								<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)",marginBottom:10}}>UPDATE STATUS</p>
								<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
									{Object.entries(STATUS_COLORS).map(([s,sc])=>(
										<button key={s} disabled={updatingId===displayReq.id} onClick={()=>updateStatus(displayReq.id,s)}
											style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${sc.color}40`,background:displayReq.status===s?`${sc.color}20`:"transparent",fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.15em",textTransform:"uppercase",color:sc.color,cursor:updatingId===displayReq.id?"not-allowed":"pointer",transition:"all 200ms",fontWeight:displayReq.status===s?700:400}}
											onMouseEnter={e=>{if(displayReq.status!==s)e.currentTarget.style.background=`${sc.color}12`;}}
											onMouseLeave={e=>{if(displayReq.status!==s)e.currentTarget.style.background="transparent";}}>
											{updatingId===displayReq.id?"…":sc.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</>
				):(
					<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,opacity:0.12}}>
						<span className="material-symbols-outlined" style={{fontSize:44}}>assignment_return</span>
						<p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.3em",textTransform:"uppercase"}}>SELECT A RETURN REQUEST</p>
					</div>
				)}
			</div>
		</div>
	);
};

const ClientMessages = () => {
	const [sessions,setSessions]=useState([]);
	const [selectedSession,setSelectedSession]=useState(null);
	const [searchQuery,setSearchQuery]=useState("");
	const [mobileShowChat,setMobileShowChat]=useState(false);
	const [activePanel,setActivePanel]=useState("chats");
	const [liveReturnCount,setLiveReturnCount]=useState(0);
	const [seenReturnCount,setSeenReturnCount]=useState(0);
	const badgeCount=Math.max(0,liveReturnCount-seenReturnCount);

	const selectedSessionRef=useRef(null);
	const liveReturnCountRef=useRef(0);
	useEffect(()=>{selectedSessionRef.current=selectedSession;},[selectedSession]);
	useEffect(()=>{liveReturnCountRef.current=liveReturnCount;},[liveReturnCount]);

	const handleTabClick=(key)=>{
		setActivePanel(key);
		if(key==="returns")setSeenReturnCount(liveReturnCountRef.current);
	};

	const syncSessions=useCallback(async()=>{
		const{data}=await supabase.from("verp_support_sessions")
			.select("*").not("status","eq","resolved")
			.order("updated_at",{ascending:false,nullsFirst:false});
		if(data){
			setSessions(data);
			const cur=selectedSessionRef.current;
			if(cur){const r=data.find(s=>s.id===cur.id);if(r)setSelectedSession(r);}
		}
	},[]);

	useEffect(()=>{syncSessions();const i=setInterval(syncSessions,5000);return()=>clearInterval(i);},[syncSessions]);

	const handlePushBack=async()=>{
		if(!selectedSession)return;
		await supabase.from("verp_support_sessions").update({status:"live",admin_note:null}).eq("id",selectedSession.id);
		await supabase.from("verp_private_channel").insert([{sender:"admin",content:`PUSH BACK: ${selectedSession.client_email} — you can resume the session.`}]);
		try{await fetch("/api/alert-staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"PUSH_BACK",clientId:selectedSession.client_email})});}catch(_){}
		syncSessions();
	};

	const filtered=sessions.filter(s=>{
		const q=searchQuery.toLowerCase();
		return!q||s.client_email?.toLowerCase().includes(q)||s.admin_note?.toLowerCase().includes(q);
	});

	const handleSelectSession=(s)=>{
		setSelectedSession(s);
		setMobileShowChat(true);
		setSeenReturnCount(liveReturnCountRef.current);
	};

	return(
		<>
			<style>{`
				@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
				@keyframes badgePop{0%,100%{transform:scale(1);box-shadow:0 0 8px rgba(239,68,68,0.6);}50%{transform:scale(1.18);box-shadow:0 0 14px rgba(239,68,68,0.9);}}
				::-webkit-scrollbar{width:3px;height:3px}
				::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.3);border-radius:99px}
				.cm-list{display:flex;flex-direction:column;width:280px;flex-shrink:0}
				.cm-chat-pane{flex:1;display:flex;flex-direction:column;overflow:hidden}
				.cm-back-btn{display:none;align-items:center;gap:6px;padding:10px 14px;background:#0d0d0d;border:none;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;flex-shrink:0;width:100%;box-sizing:border-box}
				@media(max-width:640px){
					.cm-list{width:100% !important;border-right:none !important;display:${!mobileShowChat?"flex":"none"} !important}
					.cm-chat-pane{display:${mobileShowChat?"flex":"none"} !important}
					.cm-back-btn{display:flex !important}
				}
			`}</style>
			<div style={{display:"flex",flexDirection:"column",height:"100%",background:T.void,fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>

				{/* Tabs */}
				<div style={{display:"flex",gap:4,padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0,background:T.obsidian,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
					{[{key:"chats",label:"Support Chats",icon:"forum"},{key:"returns",label:"Return Requests",icon:"assignment_return"}].map(({key,label,icon})=>(
						<button key={key} onClick={()=>handleTabClick(key)}
							style={{position:"relative",display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,background:activePanel===key?"rgba(236,91,19,0.15)":"transparent",border:activePanel===key?"1px solid rgba(236,91,19,0.35)":"1px solid transparent",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.15em",textTransform:"uppercase",color:activePanel===key?T.ember:"rgba(255,255,255,0.3)",transition:"all 160ms",flexShrink:0,whiteSpace:"nowrap"}}>
							<span className="material-symbols-outlined" style={{fontSize:13}}>{icon}</span>
							{label}
							{key==="returns"&&badgeCount>0&&(
								<span style={{position:"absolute",top:-6,right:-6,minWidth:17,height:17,borderRadius:999,background:"#ef4444",color:"#fff",fontFamily:"'JetBrains Mono',monospace",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",lineHeight:1,animation:"badgePop 2s ease-in-out infinite"}}>
									{badgeCount>99?"99+":badgeCount}
								</span>
							)}
						</button>
					))}
				</div>

				{/* Panels */}
				{activePanel==="returns"?(
					<div style={{flex:1,overflow:"hidden"}}><ReturnRequestsPanel onCountChange={setLiveReturnCount}/></div>
				):(
					<div style={{flex:1,display:"flex",overflow:"hidden"}}>
						<div className="cm-list">
							<ClientMessages_SessionList sessions={filtered} selectedId={selectedSession?.id} onSelect={handleSelectSession} searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
						</div>
						<div className="cm-chat-pane">
							<button className="cm-back-btn" onClick={()=>setMobileShowChat(false)}>
								<span className="material-symbols-outlined" style={{fontSize:16}}>arrow_back</span>SESSIONS
							</button>
							{selectedSession?(
								<ClientMessages_ChatWindow session={selectedSession} onPushBack={handlePushBack} onSessionUpdate={syncSessions}
									onResolve={()=>{syncSessions();setSelectedSession(null);setMobileShowChat(false);}}/>
							):(
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