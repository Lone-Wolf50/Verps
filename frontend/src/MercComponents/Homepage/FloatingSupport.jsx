import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FloatingSupport = () => {
  const navigate = useNavigate();

  const [pos, setPos] = useState(() => ({
    x: window.innerWidth - 72,
    y: window.innerHeight * 0.42,
  }));
  const [isDragging, setIsDragging] = useState(false);

  // ✅ REF instead of state — onPointerUp always reads the latest value,
  // no stale closure bug where it's stuck at false
  const hasDraggedRef = useRef(false);
  const dragStart     = useRef(null);
  const btnRef        = useRef(null);

  useEffect(() => {
    const onResize = () =>
      setPos((p) => ({
        x: Math.min(p.x, window.innerWidth - 64),
        y: Math.min(p.y, window.innerHeight - 64),
      }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    hasDraggedRef.current = false;
    setIsDragging(true);
    dragStart.current = { startX: e.clientX - pos.x, startY: e.clientY - pos.y };
    btnRef.current?.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!dragStart.current) return;
    const newX = e.clientX - dragStart.current.startX;
    const newY = e.clientY - dragStart.current.startY;
    // Only register as a drag after moving 4px — prevents tap being treated as drag
    if (!hasDraggedRef.current) {
      const dx = Math.abs(e.clientX - (dragStart.current.startX + pos.x));
      const dy = Math.abs(e.clientY - (dragStart.current.startY + pos.y));
      if (dx > 4 || dy > 4) hasDraggedRef.current = true;
    }
    setPos({
      x: Math.max(8,  Math.min(newX, window.innerWidth  - 64)),
      y: Math.max(96, Math.min(newY, window.innerHeight - 64)),
    });
  }, [pos]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
    // ✅ Reads ref — always correct, navigates to support on clean tap
    if (!hasDraggedRef.current) {
      navigate("/support");
    }
  }, [navigate]);

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title="Go to Support"
      className="fixed z-[300] rounded-full border-0 flex items-center justify-center select-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: 52,
        height: 52,
        background: "linear-gradient(135deg,#ec5b13,#d94e0f)",
        cursor: isDragging ? "grabbing" : "pointer",
        boxShadow: isDragging
          ? "0 12px 40px rgba(236,91,19,0.55), 0 0 0 4px rgba(236,91,19,0.2)"
          : "0 6px 24px rgba(236,91,19,0.4)",
        transform: isDragging ? "scale(1.1)" : "scale(1)",
        transition: isDragging ? "none" : "box-shadow 200ms, transform 200ms",
        touchAction: "none",
      }}
    >
      <span
        className="material-symbols-outlined text-white text-2xl"
        style={{ pointerEvents: "none" }}
      >
        support_agent
      </span>
      <span
        className="absolute text-[7px] tracking-[0.15em] uppercase whitespace-nowrap text-white/25"
        style={{
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'JetBrains Mono',monospace",
          pointerEvents: "none",
        }}
      >
        SUPPORT
      </span>
    </button>
  );
};

export default FloatingSupport;