import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

const BOT_OPTIONS = [
  { id: "track",   icon: "inventory_2",  label: "Track My Order" },
  { id: "payment", icon: "payments",     label: "Payment Methods" },
  { id: "return",  icon: "undo",         label: "Returns & Refunds" },
  { id: "faq",     icon: "help_outline", label: "FAQs" },
  { id: "live",    icon: "headset_mic",  label: "Talk to Support" },
];

const BOT_ANSWERS = {
  payment: "WE ACCEPT BANK CARDS AND MOBILE MONEY. TRANSACTIONS ARE SECURED VIA END-TO-END ENCRYPTION. CONFIRMATIONS ARRIVE WITHIN 10–30 MINUTES.",
  return:  "RETURNS ACCEPTED WITHIN 48 HOURS OF DELIVERY. ITEM MUST BE UNUSED IN ORIGINAL PACKAGING. CONTACT LIVE SUPPORT TO INITIATE.",
  faq:     "ORDERS SHIP WITHIN 1–3 BUSINESS DAYS. TRACKING UPDATES EVERY 6 HOURS. CUSTOM ORDERS TAKE 5–7 DAYS. REACH LIVE SUPPORT FOR ANYTHING ELSE.",
};

const INTRO_LINES = [
 
  "WELCOME TO THE VERP. I AM YOUR DEDICATED SUPPORT AGENT.",
  "HOW CAN I ASSIST YOU TODAY?",
];

const clearBotStorage = () => {
  localStorage.removeItem("vault_chat_history");
  localStorage.removeItem("vault_awaiting_order");
  localStorage.removeItem("vault_order_fulfilled"); // set when order lookup completes
};

/* ─── TYPING DOTS ──────────────────────────────────────────── */
const TypingDots = () => (
  <div style={{display:"flex",alignItems:"center",gap:5,padding:"12px 16px",
    background:"linear-gradient(135deg,#161616,#111)",border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:"4px 16px 16px 16px",width:"fit-content"}}>
    {[0,1,2].map(i=>(
      <span key={i} style={{width:5,height:5,borderRadius:"50%",background:"#ec5b13",
        display:"block",animation:`bounceDot 1s ease-in-out ${i*0.18}s infinite`}}/>
    ))}
  </div>
);

/* ─── RATING SCREEN ─────────────────────────────────────────── */
const RatingScreen = ({ chatId, onFinishedRating }) => {
  const [rating,setRating]=useState(0);
  const [hover,setHover]=useState(0);
  const [done,setDone]=useState(false);

  const submit = async (s) => {
    setRating(s); setDone(true);
    if (chatId) await supabase.from("verp_support_sessions").update({rating:s}).eq("id",chatId);
    clearBotStorage();
    setTimeout(()=>onFinishedRating(),1200);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      height:"100%",gap:28,padding:"40px 24px"}}>
      <div style={{width:60,height:60,borderRadius:"50%",
        background:"rgba(236,91,19,0.08)",border:"1px solid rgba(236,91,19,0.2)",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span className="material-symbols-outlined" style={{fontSize:26,color:"#ec5b13"}}>check_circle</span>
      </div>
      <div style={{textAlign:"center"}}>
        {done
          ? <p style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontStyle:"italic",color:"white"}}>Thank you.</p>
          : <>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontStyle:"italic",color:"white"}}>Session Complete</h3>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.28em",
              color:"rgba(255,255,255,0.3)",textTransform:"uppercase",marginTop:8}}>Rate your experience</p>
          </>}
      </div>
      {!done&&(
        <div style={{display:"flex",gap:10}}>
          {[1,2,3,4,5].map(s=>(
            <button key={s} onClick={()=>submit(s)}
              onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
              style={{fontSize:30,background:"transparent",border:"none",cursor:"pointer",transition:"all 200ms",
                color:(hover||rating)>=s?"#ec5b13":"rgba(255,255,255,0.08)",
                transform:(hover||rating)>=s?"scale(1.25)":"scale(1)",
                filter:(hover||rating)>=s?"drop-shadow(0 0 8px rgba(236,91,19,0.6))":"none"}}>★</button>
          ))}
        </div>
      )}
      {!done&&(
        <button onClick={()=>{clearBotStorage();onFinishedRating();}}
          style={{background:"transparent",border:"none",fontFamily:"'JetBrains Mono',monospace",
            fontSize:8,letterSpacing:"0.2em",color:"rgba(255,255,255,0.2)",
            textTransform:"uppercase",cursor:"pointer",textDecoration:"underline"}}>
          Skip
        </button>
      )}
    </div>
  );
};

/* ─── BUBBLE ────────────────────────────────────────────────── */
const Bubble = ({ msg, animate }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",
      animation:animate?(isUser?"msgUser 0.25s cubic-bezier(0.16,1,0.3,1) both"
                               :"msgBot 0.25s cubic-bezier(0.16,1,0.3,1) both"):"none"}}>
      {!isUser&&(
        <div style={{flexShrink:0,width:26,height:26,borderRadius:"50%",
          background:"rgba(236,91,19,0.1)",border:"1px solid rgba(236,91,19,0.2)",
          display:"flex",alignItems:"center",justifyContent:"center",marginRight:8,marginTop:2}}>
          <span className="material-symbols-outlined" style={{fontSize:13,color:"#ec5b13"}}>smart_toy</span>
        </div>
      )}
      <div style={{maxWidth:"76%"}}>
        {!isUser&&(
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,letterSpacing:"0.3em",
            color:"rgba(236,91,19,0.5)",textTransform:"uppercase",marginBottom:4,paddingLeft:2}}>
            VAULT_BOT
          </p>
        )}
        <div style={{
          padding:isUser?"10px 14px":"12px 16px",
          background:isUser?"#ec5b13":"linear-gradient(135deg,#161616,#111111)",
          border:isUser?"none":"1px solid rgba(255,255,255,0.06)",
          borderRadius:isUser?"16px 4px 16px 16px":"4px 16px 16px 16px",
          fontFamily:"'JetBrains Mono',monospace",fontSize:10,lineHeight:1.75,
          color:isUser?"#000":"rgba(255,255,255,0.75)",
          fontWeight:isUser?600:400,letterSpacing:"0.04em",textTransform:"uppercase"}}>
          {msg.content}
        </div>
      </div>
    </div>
  );
};

/* ─── OPTION CHIP ───────────────────────────────────────────── */
const OptionChip = ({ opt, onClick }) => {
  const [hov,setHov]=useState(false);
  const isLive = opt.id==="live";
  return (
    <button onClick={()=>onClick(opt)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:7,
        padding:isLive?"10px 18px":"8px 13px",
        background:isLive?(hov?"rgba(236,91,19,0.15)":"rgba(236,91,19,0.06)")
                        :(hov?"rgba(255,255,255,0.05)":"#111"),
        border:isLive?(hov?"1px solid rgba(236,91,19,0.6)":"1px solid rgba(236,91,19,0.25)")
                     :(hov?"1px solid rgba(236,91,19,0.35)":"1px solid rgba(255,255,255,0.08)"),
        borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:600,
        letterSpacing:"0.16em",textTransform:"uppercase",
        color:isLive?"#ec5b13":(hov?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.45)"),
        cursor:"pointer",transition:"all 200ms",
        width:isLive?"100%":"auto",justifyContent:isLive?"center":"flex-start"}}>
      <span className="material-symbols-outlined"
        style={{fontSize:13,color:isLive?"#ec5b13":(hov?"#ec5b13":"rgba(255,255,255,0.3)")}}>
        {opt.icon}
      </span>
      {opt.label}
      {isLive&&<span className="material-symbols-outlined" style={{fontSize:12,marginLeft:"auto"}}>chevron_right</span>}
    </button>
  );
};

/* ─── MAIN CHATBOT ──────────────────────────────────────────── */
const ChatBot = ({ onEscalate, mode, chatId, onFinishedRating }) => {
  const [messages,       setMessages]       = useState([]);
  const [isTyping,       setIsTyping]       = useState(false);
  const [showOptions,    setShowOptions]    = useState(false);
  const [awaitingOrder,  setAwaitingOrder]  = useState(false);
  const [orderFulfilled, setOrderFulfilled] = useState(false); // order was looked up
  const [input,          setInput]          = useState("");
  const [latestMsgIdx,   setLatestMsgIdx]   = useState(-1);

  const scrollRef   = useRef(null);
  const introRan    = useRef(false);
  const restoredRef = useRef(false);

  /* ── RESTORE — only if in mid-order-lookup ────────────────── */
  useEffect(() => {
    if (mode === "rating") return;

    const savedHistory  = localStorage.getItem("vault_chat_history");
    const savedAwaiting = localStorage.getItem("vault_awaiting_order");
    const savedFulfilled = localStorage.getItem("vault_order_fulfilled");

    // If the order has already been fulfilled (user already got their status)
    // OR there's no history → start fresh
    if (savedFulfilled === "true" || !savedHistory) {
      clearBotStorage();
      return;
    }

    // Only restore if user is mid-order-lookup (awaiting their ID)
    if (savedHistory && savedAwaiting === "true") {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          restoredRef.current = true;
          setAwaitingOrder(true);
          setShowOptions(false);
        }
      } catch (_) { clearBotStorage(); }
    }
    // All other states (browsing FAQs, etc.) → fresh start
  // eslint-disable-next-line
  }, []);

  /* ── INTRO ────────────────────────────────────────────────── */
  useEffect(() => {
    if (mode === "rating")    return;
    if (restoredRef.current)  return;
    if (introRan.current)     return;
    introRan.current = true;

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const run = async () => {
      for (let i = 0; i < INTRO_LINES.length; i++) {
        setIsTyping(true);
        await delay(700 + i * 250);
        setIsTyping(false);
        setMessages(prev => { setLatestMsgIdx(prev.length); return [...prev,{role:"bot",content:INTRO_LINES[i]}]; });
        if (i < INTRO_LINES.length - 1) await delay(280);
      }
      await delay(200);
      setShowOptions(true);
    };
    run();
  // eslint-disable-next-line
  }, []);

  /* ── PERSIST (only while awaiting order ID) ──────────────── */
  useEffect(() => {
    if (mode === "rating" || messages.length === 0) return;
    if (awaitingOrder && !orderFulfilled) {
      localStorage.setItem("vault_chat_history", JSON.stringify(messages));
      localStorage.setItem("vault_awaiting_order", "true");
    }
  }, [messages, awaitingOrder, orderFulfilled, mode]);

  /* ── AUTO-SCROLL ─────────────────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const delay = ms => new Promise(r => setTimeout(r, ms));

  const addBotMsg = useCallback(async (text, skipTyping=false) => {
    if (!skipTyping) { setIsTyping(true); await delay(800); setIsTyping(false); }
    setMessages(prev => { setLatestMsgIdx(prev.length); return [...prev,{role:"bot",content:text}]; });
  // eslint-disable-next-line
  }, []);

  const handleOption = async (opt) => {
    setShowOptions(false);
    setMessages(prev=>{setLatestMsgIdx(prev.length);return[...prev,{role:"user",content:opt.label.toUpperCase()}];});
    await delay(150);

    if (opt.id === "track") {
      await addBotMsg("PLEASE ENTER YOUR ORDER ID. FORMAT: ORD-XXXXXXXX");
      setAwaitingOrder(true);
    } else if (opt.id === "live") {
      onEscalate();
    } else if (BOT_ANSWERS[opt.id]) {
      await addBotMsg(BOT_ANSWERS[opt.id]);
      // Done with FAQ — clear storage, show options fresh
      clearBotStorage();
      setShowOptions(true);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;
    setInput("");
    setMessages(prev=>{setLatestMsgIdx(prev.length);return[...prev,{role:"user",content:query.toUpperCase()}];});
    setShowOptions(false);

    if (awaitingOrder) {
      const orderID = query.toUpperCase().match(/ORD-[A-Z0-9]+/)?.[0] || query.toUpperCase();
      setIsTyping(true);
      const { data } = await supabase.from("verp_orders")
        .select("status,total_amount").eq("order_number", orderID).maybeSingle();
      setIsTyping(false);

      if (data) {
        setAwaitingOrder(false);
        setOrderFulfilled(true);
        // Mark as fulfilled so if they leave now, storage clears on return
        localStorage.setItem("vault_order_fulfilled","true");
        localStorage.removeItem("vault_awaiting_order");

        await addBotMsg(`ORDER FOUND. STATUS: [ ${data.status.toUpperCase()} ] — VALUE: GH₵ ${Number(data.total_amount).toLocaleString()}.`,true);
        await delay(300);
        await addBotMsg("IS THERE ANYTHING ELSE I CAN ASSIST YOU WITH?");
        // Now clear remaining storage — chat is "done"
        clearBotStorage();
        setShowOptions(true);
      } else {
        await addBotMsg(`ORDER "${orderID}" NOT FOUND. PLEASE CHECK YOUR ID AND TRY AGAIN.`,true);
      }
    } else {
      await addBotMsg("COMMAND NOT RECOGNISED. PLEASE USE THE OPTIONS BELOW.");
      clearBotStorage();
      setShowOptions(true);
    }
  };

  /* ── RATING MODE ─────────────────────────────────────────── */
  if (mode === "rating") {
    return (
      <div style={{height:"100%",background:"#080808",borderRadius:28,
        border:"1px solid rgba(255,255,255,0.06)",overflow:"hidden"}}>
        <RatingScreen chatId={chatId} onFinishedRating={onFinishedRating}/>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",width:"100%",
      background:"#080808",borderRadius:28,border:"1px solid rgba(255,255,255,0.06)",
      overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}}>

      {/* HEADER */}
      <div style={{height:50,background:"#0d0d0d",borderBottom:"1px solid rgba(255,255,255,0.04)",
        display:"flex",alignItems:"center",padding:"0 18px",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",gap:6}}>
          {["#ec5b13","#2a2a2a","#2a2a2a"].map((c,i)=>(
            <div key={i} style={{width:8,height:8,borderRadius:"50%",background:c}}/>
          ))}
        </div>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
          letterSpacing:"0.3em",color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>
          VAULT ASSISTANT
        </p>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",
            animation:"pulseDot 2s ease-in-out infinite"}}/>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,
            color:"rgba(34,197,94,0.7)",letterSpacing:"0.2em"}}>ONLINE</span>
        </div>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef}
        style={{flex:1,overflowY:"auto",padding:"18px 16px",
          display:"flex",flexDirection:"column",gap:12,
          scrollbarWidth:"thin",scrollbarColor:"rgba(236,91,19,0.3) transparent"}}>
        {messages.map((msg,idx)=>(
          <Bubble key={idx} msg={msg} animate={idx===latestMsgIdx}/>
        ))}
        {isTyping&&<TypingDots/>}
      </div>

      {/* FOOTER */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",background:"#0d0d0d",
        padding:"13px 16px",display:"flex",flexDirection:"column",gap:10,flexShrink:0}}>
        {showOptions&&(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {BOT_OPTIONS.filter(o=>o.id!=="live").map(opt=>(
                <OptionChip key={opt.id} opt={opt} onClick={handleOption}/>
              ))}
            </div>
            <OptionChip opt={BOT_OPTIONS.find(o=>o.id==="live")} onClick={handleOption}/>
          </div>
        )}
        <form onSubmit={handleSend} style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            placeholder={awaitingOrder?"ENTER ORDER ID (e.g. ORD-AB1234)...":"TYPE A MESSAGE..."}
            style={{flex:1,background:"#111",border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:11,padding:"10px 14px",fontFamily:"'JetBrains Mono',monospace",
              fontSize:10,color:"rgba(255,255,255,0.8)",outline:"none",
              letterSpacing:"0.04em",textTransform:"uppercase"}}/>
          <button type="submit"
            style={{background:"#ec5b13",border:"none",borderRadius:11,padding:"10px 18px",
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,
              letterSpacing:"0.15em",textTransform:"uppercase",color:"#000",transition:"filter 200ms"}}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}>
            SEND
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounceDot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.8)}}
        @keyframes msgBot{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes msgUser{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
    </div>
  );
};

export default ChatBot;
