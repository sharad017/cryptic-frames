"use client";
import { useState, useEffect } from "react";

/**
 * Displays photo(s) of Sharad for the About page.
 * - 0 images: renders nothing (parent falls back to single-column layout)
 * - 1 image: static display, no transition
 * - 2+ images: slow cross-fade slideshow
 */
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
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "4 / 5",
        background: "#0c0c0c",
        border: "1px solid var(--border)",
      }}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Sharad Rajput — photographer"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === index ? 1 : 0,
            transition: "opacity 1.4s ease-in-out",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Subtle dot indicators — only shown when there's more than one photo */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {images.map((_, i) => (
            <span
              key={i}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: i === index ? "var(--accent)" : "rgba(255,255,255,0.3)",
                transition: "background 0.4s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
