"use client";
import { useState, useEffect } from "react";

export default function AboutPortrait({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ background: "#0c0c0c" }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Sharad Rajput — cryptic.frames photographer"
          style={{
            display: "block",
            width: "100%",
            height: "auto",        // natural height, zero cropping
            opacity: i === index ? 1 : 0,
            position: i === 0 ? "relative" : "absolute",
            top: 0, left: 0,
            transition: "opacity 1.2s ease-in-out",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <span key={i} style={{
              width: "4px", height: "4px", borderRadius: "50%", display: "block",
              background: i === index ? "var(--accent)" : "rgba(255,255,255,0.3)",
              transition: "background 0.4s ease",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
