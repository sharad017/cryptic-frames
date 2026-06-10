"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type ExifEntry = {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  gps?: string;
};

type ExifMap = Record<string, ExifEntry>;

// Module-level cache so exif.json is only fetched once per session
let exifCache: ExifMap | null = null;

function useExif(category: string | undefined, filename: string | undefined): ExifEntry | null {
  const [exif, setExif] = useState<ExifEntry | null>(null);

  useEffect(() => {
    if (!category || !filename) return;
    const key = `${category}/${filename}`;

    const apply = (map: ExifMap) => {
      const entry = map[key];
      setExif(entry && Object.keys(entry).length > 0 ? entry : null);
    };

    if (exifCache) { apply(exifCache); return; }

    fetch("/images/exif.json")
      .then((r) => r.json())
      .then((data: ExifMap) => { exifCache = data; apply(data); })
      .catch(() => setExif(null));
  }, [category, filename]);

  return exif;
}

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

  // Extract filename from image path for EXIF lookup
  const filename = image.split("/").pop();
  const exif = useExif(category, filename);

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

  // EXIF pills to display — only show fields that exist
  const exifPills = exif
    ? [
        exif.camera,
        exif.lens,
        exif.focalLength,
        exif.aperture,
        exif.shutter,
        exif.iso,
      ].filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
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
          <button
            onClick={handleShare}
            style={{ ...btnStyle, fontSize: "0.7rem", letterSpacing: "0.3em", color: copied ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            {copied ? "Link copied ✓" : "Share ↗"}
          </button>
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
        <div
          className="absolute w-8 h-8 rounded-full border-t border-l animate-spin z-40"
          style={{ borderColor: "var(--accent)", opacity: 0.7 }}
        />
      )}

      {/* Image + EXIF block */}
      <AnimatePresence mode="wait">
        <motion.div
          key={image}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: imgLoaded ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={image}
            alt=""
            onLoad={() => setImgLoaded(true)}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-md select-none"
            style={{
              boxShadow: "0 24px 80px rgba(0,0,0,0.85)",
              willChange: "opacity, transform",
              display: "block",
            }}
            draggable={false}
          />

          {/* EXIF strip */}
          {exifPills.length > 0 && (
            <div
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {exifPills.map((pill, i) => (
                <span
                  key={i}
                  className="text-[9px] tracking-[0.25em] uppercase"
                  style={{
                    color: i === 0 ? "var(--accent)" : "var(--muted)",
                    fontFamily: "var(--font-body)",
                    opacity: i === 0 ? 0.9 : 0.5,
                  }}
                >
                  {pill}
                  {i < exifPills.length - 1 && (
                    <span style={{ marginLeft: "1rem", opacity: 0.2 }}>·</span>
                  )}
                </span>
              ))}
            </div>
          )}
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
