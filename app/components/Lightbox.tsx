"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

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

// Module-level caches — persist across open/close and prev/next navigation
let exifCache: ExifMap | null = null;
const loadedImages = new Set<string>();

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

const MAX_SCALE = 4;
const MIN_SCALE = 1;
const SWIPE_THRESHOLD = 60; // px

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function Lightbox({ image, category, index, onClose, onPrev, onNext, hasPrev, hasNext }: Props) {
  // Loading state — initialise true if this image was already shown before (fixes stale-spinner bug)
  const [imgLoaded, setImgLoaded] = useState(() => loadedImages.has(image));
  const [copied, setCopied] = useState(false);

  // Zoom + pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const filename = image.split("/").pop();
  const exif = useExif(category, filename);

  // Pointer/touch tracking (refs so it doesn't trigger re-renders)
  const gesture = useRef<{
    pointers: Map<number, { x: number; y: number }>;
    lastPinchDist: number | null;
    panStart: { x: number; y: number } | null;
    swipeStart: { x: number; y: number } | null;
    didPinchOrPan: boolean;
  }>({ pointers: new Map(), lastPinchDist: null, panStart: null, swipeStart: null, didPinchOrPan: false });

  // Reset zoom + loading flag whenever the image changes
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setImgLoaded(loadedImages.has(image));
  }, [image]);

  // Mark loaded — called from onLoad AND from the ref callback (handles cached images
  // where the browser may fire `load` before React attaches the handler)
  const markLoaded = useCallback(() => {
    loadedImages.add(image);
    setImgLoaded(true);
  }, [image]);

  const imgRefCallback = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) {
      markLoaded();
    }
  }, [markLoaded]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.5, MAX_SCALE));
      if (e.key === "-" || e.key === "_") setScale((s) => Math.max(s - 0.5, MIN_SCALE));
      if (e.key === "0") { setScale(1); setOffset({ x: 0, y: 0 }); }
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Zoom: scroll wheel ──
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0018);
    setScale((s) => {
      const next = Math.min(Math.max(s * factor, MIN_SCALE), MAX_SCALE);
      if (next <= 1.01) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // ── Zoom: double click / double tap ──
  const onDoubleClick = () => {
    if (scale > 1.01) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  // ── Pointer events: pinch zoom, pan when zoomed, swipe when not ──
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current.didPinchOrPan = false;

    if (gesture.current.pointers.size === 1) {
      gesture.current.swipeStart = { x: e.clientX, y: e.clientY };
      if (scale > 1.01) {
        gesture.current.panStart = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        setIsPanning(true);
      }
    }
    if (gesture.current.pointers.size === 2) {
      const pts = Array.from(gesture.current.pointers.values());
      gesture.current.lastPinchDist = dist(pts[0], pts[1]);
      gesture.current.swipeStart = null; // cancel swipe once second finger lands
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!gesture.current.pointers.has(e.pointerId)) return;
    gesture.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (gesture.current.pointers.size === 2) {
      // Pinch zoom
      const pts = Array.from(gesture.current.pointers.values());
      const d = dist(pts[0], pts[1]);
      if (gesture.current.lastPinchDist) {
        const ratio = d / gesture.current.lastPinchDist;
        setScale((s) => {
          const next = Math.min(Math.max(s * ratio, MIN_SCALE), MAX_SCALE);
          if (next <= 1.01) setOffset({ x: 0, y: 0 });
          return next;
        });
        gesture.current.didPinchOrPan = true;
      }
      gesture.current.lastPinchDist = d;
    } else if (gesture.current.pointers.size === 1 && scale > 1.01 && gesture.current.panStart) {
      // Pan when zoomed in
      setOffset({
        x: e.clientX - gesture.current.panStart.x,
        y: e.clientY - gesture.current.panStart.y,
      });
      gesture.current.didPinchOrPan = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasSingle = gesture.current.pointers.size === 1;
    const swipeStart = gesture.current.swipeStart;
    gesture.current.pointers.delete(e.pointerId);

    if (gesture.current.pointers.size === 0) {
      gesture.current.lastPinchDist = null;
      gesture.current.panStart = null;
      setIsPanning(false);

      // Swipe navigation — only when not zoomed and wasn't a pinch/pan gesture
      if (wasSingle && scale <= 1.01 && swipeStart && !gesture.current.didPinchOrPan) {
        const dx = e.clientX - swipeStart.x;
        const dy = e.clientY - swipeStart.y;
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0 && hasNext && onNext) onNext();
          else if (dx > 0 && hasPrev && onPrev) onPrev();
        }
      }

      if (scale < MIN_SCALE) { setScale(MIN_SCALE); setOffset({ x: 0, y: 0 }); }
    }
    gesture.current.swipeStart = null;
    gesture.current.didPinchOrPan = false;
  };

  const btnStyle: React.CSSProperties = {
    color: "#9a9a9a",
    fontSize: "1.4rem",
    lineHeight: 1,
    fontWeight: 300,
    transition: "color 0.2s",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  };

  const exifPills = exif
    ? [exif.camera, exif.lens, exif.focalLength, exif.aperture, exif.shutter, exif.iso].filter(Boolean)
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
        <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}>
          {category && `${category} `}{index !== undefined && `— ${String(index + 1).padStart(2, "0")}`}
        </p>

        <div className="flex items-center gap-4">
          {scale > 1.01 && (
            <span className="text-[10px] tracking-[0.3em]" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
              {Math.round(scale * 100)}%
            </span>
          )}
          <button
            onClick={handleShare}
            style={{ ...btnStyle, fontSize: "0.7rem", letterSpacing: "0.3em", color: copied ? "var(--accent)" : "#9a9a9a", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => !copied && ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => !copied && ((e.currentTarget as HTMLElement).style.color = "#9a9a9a")}
          >
            {copied ? "Link copied ✓" : "Share ↗"}
          </button>
          <button
            onClick={onClose}
            style={btnStyle}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#9a9a9a")}
          >
            ×
          </button>
        </div>
      </div>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
          className="absolute left-2 md:left-7 top-1/2 -translate-y-1/2 z-50 p-3 hidden sm:block"
          style={btnStyle}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#9a9a9a")}
        >
          ←
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext?.(); }}
          className="absolute right-2 md:right-7 top-1/2 -translate-y-1/2 z-50 p-3 hidden sm:block"
          style={btnStyle}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#9a9a9a")}
        >
          →
        </button>
      )}

      {/* Loading spinner — only shows if image genuinely isn't ready yet */}
      {!imgLoaded && (
        <div
          className="absolute w-8 h-8 rounded-full border-t border-l animate-spin z-40"
          style={{ borderColor: "var(--accent)", opacity: 0.8 }}
        />
      )}

      {/* Image + EXIF block */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={image}
          initial={{ opacity: 0 }}
          animate={{ opacity: imgLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center"
          style={{ maxWidth: "94vw" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{ touchAction: "none", maxWidth: "94vw", maxHeight: "78vh" }}
            onWheel={onWheel}
            onDoubleClick={onDoubleClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              ref={imgRefCallback}
              src={image}
              alt=""
              onLoad={markLoaded}
              className="max-w-[94vw] max-h-[78vh] object-contain rounded-md select-none"
              style={{
                boxShadow: "0 24px 80px rgba(0,0,0,0.85)",
                display: "block",
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: isPanning ? "none" : "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
                cursor: scale > 1.01 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
              }}
              draggable={false}
            />
          </div>

          {/* EXIF strip */}
          {exifPills.length > 0 && scale <= 1.01 && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 px-2" onClick={(e) => e.stopPropagation()}>
              {exifPills.map((pill, i) => (
                <span
                  key={i}
                  className="text-[9px] tracking-[0.25em] uppercase"
                  style={{
                    color: i === 0 ? "var(--accent)" : "#a8a8a8",
                    fontFamily: "var(--font-body)",
                    opacity: i === 0 ? 0.95 : 0.7,
                  }}
                >
                  {pill}
                  {i < exifPills.length - 1 && <span style={{ marginLeft: "1rem", opacity: 0.25 }}>·</span>}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ color: "#555" }}>
        <span
          className="hidden sm:inline"
          style={{ fontSize: "0.55rem", letterSpacing: "0.35em", fontFamily: "var(--font-body)", textTransform: "uppercase" }}
        >
          ← → navigate · scroll or pinch to zoom
        </span>
        <span
          className="sm:hidden"
          style={{ fontSize: "0.55rem", letterSpacing: "0.3em", fontFamily: "var(--font-body)", textTransform: "uppercase" }}
        >
          swipe to navigate · pinch to zoom
        </span>
      </div>
    </motion.div>
  );
}
