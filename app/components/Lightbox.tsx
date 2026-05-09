"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  image: string;
  category?: string;
  index?: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
};

export default function Lightbox({ image, category, index, onClose, onPrev, onNext, hasPrev, hasNext }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [image, onClose, onPrev, onNext, hasPrev, hasNext]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const btnStyle: React.CSSProperties = {
    color: "#555",
    fontSize: "1.4rem",
    lineHeight: 1,
    fontWeight: 300,
    transition: "color 0.2s",
    background: "none",
    border: "none",
    cursor: "none",
    padding: "8px",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(4,4,4,0.97)" }}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Category + index */}
        <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          {category && `${category} `}{index !== undefined && `— ${String(index + 1).padStart(2, "0")}`}
        </p>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Share / copy link */}
          <button onClick={handleShare} style={{ ...btnStyle, fontSize: "0.7rem", letterSpacing: "0.3em", color: copied ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-body)" }}>
            {copied ? "Link copied ✓" : "Share ↗"}
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            style={btnStyle}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555")}
          >
            ×
          </button>
        </div>
      </div>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
          className="absolute left-3 md:left-7 top-1/2 -translate-y-1/2 z-50 p-3"
          style={btnStyle}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555")}
        >
          ←
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext?.(); }}
          className="absolute right-3 md:right-7 top-1/2 -translate-y-1/2 z-50 p-3"
          style={btnStyle}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555")}
        >
          →
        </button>
      )}

      {/* Loading spinner */}
      {!imgLoaded && (
        <div className="absolute w-8 h-8 rounded-full border-t border-l animate-spin z-40"
          style={{ borderColor: "var(--accent)", opacity: 0.7 }} />
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={image}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: imgLoaded ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={image}
            alt=""
            onLoad={() => setImgLoaded(true)}
            className="max-w-[90vw] max-h-[86vh] object-contain rounded-md select-none"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.85)", willChange: "opacity, transform", display: "block" }}
            draggable={false}
          />
          {/* Watermark on fullscreen too */}
          <div
            className="absolute bottom-3 right-4 pointer-events-none select-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(10px, 1.3vw, 14px)",
              color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.15em",
              fontStyle: "italic",
            }}
          >
            cryptic.frames
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ color: "#222" }}>
        <span style={{ fontSize: "0.55rem", letterSpacing: "0.35em", fontFamily: "var(--font-body)", textTransform: "uppercase" }}>
          ← arrow keys →
        </span>
      </div>
    </motion.div>
  );
}
