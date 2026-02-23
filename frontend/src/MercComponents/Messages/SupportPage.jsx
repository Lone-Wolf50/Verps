import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ChatBot from "./ChatBot";
import LiveAssistantChat from "./LiveAssistantChat";
import Swal from "sweetalert2";

const SupportPage = () => {
  const navigate = useNavigate();
  const [sessionStatus, setSessionStatus] = useState("bot");
  const [chatId,        setChatId]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    const check = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) { setLoading(false); return; }
      const { data } = await supabase.from("verp_support_sessions")
        .select("*")
        .eq("client_email", userEmail)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) { setChatId(data.id); setSessionStatus(data.status); }
      setLoading(false);
    };
    check();
  }, []);

  useEffect(() => {
    if (!chatId) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const channel = supabase
      .channel(`sp-session-${chatId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public",
        table: "verp_support_sessions", filter: `id=eq.${chatId}`,
      }, (payload) => { setSessionStatus(payload.new.status); })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [chatId]);

  useEffect(() => {
    if (!chatId || sessionStatus === "resolved" || sessionStatus === "bot") return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from("verp_support_sessions")
        .select("status").eq("id", chatId).maybeSingle();
      if (data && data.status !== sessionStatus) setSessionStatus(data.status);
    }, 5000);
    return () => clearInterval(interval);
  }, [chatId, sessionStatus]);

  const handleEscalate = async () => {
    let userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      const { value: email } = await Swal.fire({
        title: "IDENTIFICATION REQUIRED",
        html: `<p style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.2em;margin-bottom:8px;text-transform:uppercase">ENTER YOUR EMAIL TO CONNECT</p>`,
        input: "email",
        inputPlaceholder: "your@email.com",
        background: "#0d0d0d", color: "#fff",
        confirmButtonColor: "#ec5b13", showCancelButton: true,
        customClass: { popup: "swal-vault" },
      });
      if (!email) return;
      userEmail = email;
      localStorage.setItem("userEmail", email);
    }
    const { data, error } = await supabase.from("verp_support_sessions")
      .insert([{ client_email: userEmail, status: "waiting" }])
      .select().single();
    if (data) { setChatId(data.id); setSessionStatus("waiting"); }
    else Swal.fire({ title:"CONNECTION FAILED", text: error?.message || "Could not reach the Vault.", background:"#0d0d0d", color:"#fff", icon:"error", confirmButtonColor:"#ec5b13" });
  };

  const handleSessionEnded = () => setSessionStatus("resolved");

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(236,91,19,0.15)",borderTopColor:"#ec5b13",animation:"spin 1.1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.4em",color:"rgba(236,91,19,0.5)",textTransform:"uppercase"}}>SYNCING</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .swal-vault{border:1px solid rgba(255,255,255,0.08)!important;border-radius:20px!important;}
        @keyframes spinW{to{transform:rotate(360deg)}}
        @keyframes pulseW{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes backBtnIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* Full-screen chat surface */}
      <div style={{
        position:"fixed", inset:0, background:"#080808", zIndex:200,
        display:"flex", flexDirection:"column",
      }}>

        {/* ── Premium Back Arrow Header ── */}
        <div style={{
          height:64,
          flexShrink:0,
          display:"flex",
          alignItems:"center",
          padding:"0 24px",
          borderBottom:"1px solid rgba(255,255,255,0.04)",
          background:"rgba(8,8,8,0.9)",
          backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display:"flex",
              alignItems:"center",
              gap:10,
              background:"transparent",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:999,
              padding:"7px 16px 7px 12px",
              cursor:"pointer",
              color:"rgba(255,255,255,0.5)",
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:8,
              letterSpacing:"0.25em",
              textTransform:"uppercase",
              transition:"all 200ms",
              animation:"backBtnIn 0.4s ease both",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(236,91,19,0.5)";
              e.currentTarget.style.color = "#ec5b13";
              e.currentTarget.querySelector(".back-icon").style.transform = "translateX(-3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              e.currentTarget.querySelector(".back-icon").style.transform = "translateX(0)";
            }}
          >
            <span
              className="material-symbols-outlined back-icon"
              style={{fontSize:16, transition:"transform 200ms"}}
            >
              arrow_back
            </span>
            Back
          </button>

          {/* Centre title */}
          <div style={{
            position:"absolute",left:"50%",transform:"translateX(-50%)",
            textAlign:"center",
          }}>
            <p style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:15,
              fontStyle:"italic",
              color:"rgba(255,255,255,0.8)",
              margin:0,
            }}>
              VERP SUPPORT
            </p>
            <p style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:7,
              letterSpacing:"0.3em",
              color:"rgba(255,255,255,0.2)",
              textTransform:"uppercase",
              margin:"2px 0 0",
            }}>
              {sessionStatus === "bot" && "Automated Assistant"}
              {sessionStatus === "waiting" && "Connecting..."}
              {sessionStatus === "live" && "● Live Session"}
              {sessionStatus === "resolved" && "Session Ended"}
            </p>
          </div>
        </div>

        {/* ── Chat area ── */}
        <div style={{
          flex:1,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          padding:"16px 20px 20px",
          overflow:"hidden",
        }}>
          <div style={{width:"100%", maxWidth:480, height:"100%", maxHeight:640, display:"flex", flexDirection:"column"}}>

            {sessionStatus === "bot" && <ChatBot onEscalate={handleEscalate} chatId={chatId}/>}

            {sessionStatus === "waiting" && (
              <div style={{height:"100%",background:"#0d0d0d",border:"1px solid rgba(255,255,255,0.06)",borderRadius:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28}}>
                <div style={{position:"relative",width:60,height:60}}>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid rgba(236,91,19,0.1)"}}/>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid transparent",borderTopColor:"#ec5b13",animation:"spinW 1.1s linear infinite"}}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span className="material-symbols-outlined" style={{fontSize:22,color:"#ec5b13",opacity:0.5}}>support_agent</span>
                  </div>
                </div>
                <div style={{textAlign:"center",display:"flex",flexDirection:"column",gap:8}}>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontStyle:"italic",color:"white"}}>Awaiting Agent</h2>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.3em",color:"rgba(255,255,255,0.3)",textTransform:"uppercase",animation:"pulseW 2s ease-in-out infinite"}}>
                    ESTABLISHING SECURE LINK...
                  </p>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:"rgba(255,255,255,0.15)",letterSpacing:"0.2em"}}>
                    Session will begin automatically
                  </p>
                </div>
                <button onClick={async()=>{
                  if(chatId){await supabase.from("verp_support_sessions").update({status:"resolved"}).eq("id",chatId);}
                  setChatId(null); setSessionStatus("bot");
                }} style={{background:"transparent",border:"1px solid rgba(239,68,68,0.3)",color:"rgba(239,68,68,0.6)",fontFamily:"'JetBrains Mono',monospace",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",padding:"8px 20px",borderRadius:999,cursor:"pointer",transition:"all 200ms"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.08)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  Leave Queue
                </button>
              </div>
            )}

            {(sessionStatus==="live"||sessionStatus==="escalated"||sessionStatus==="full_push") && chatId && (
              <LiveAssistantChat chatId={chatId} role="client" onSessionEnded={handleSessionEnded}/>
            )}

            {sessionStatus==="resolved" && (
              <ChatBot
                mode="rating"
                chatId={chatId}
                onFinishedRating={() => {
                  setChatId(null); setSessionStatus("bot");
                  localStorage.removeItem("vault_chat_history");
                  localStorage.removeItem("vault_awaiting_order");
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPage;
