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
    <div className="relative w-full overflow-hidden rounded-xl"
      style={{ background: "#0c0c0c" }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Sharad Rajput — cryptic.frames photographer"
          className="w-full h-auto block"
          style={{
            display: i === index ? "block" : "none",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <span key={i} style={{
              width: "4px", height: "4px", borderRadius: "50%",
              background: i === index ? "var(--accent)" : "rgba(255,255,255,0.3)",
              transition: "background 0.4s ease", display: "block",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
