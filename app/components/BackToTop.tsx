"use client";
import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "rgba(6,6,6,0.8)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        color: "var(--accent)",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
        transition: "border-color 0.2s, opacity 0.3s",
        opacity: visible ? 1 : 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
    >
      ↑
    </button>
  );
}
