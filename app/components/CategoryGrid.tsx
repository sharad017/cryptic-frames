"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useFocalPoints, getFocalStyle } from "../hooks/useFocalPoint";
import { useIsMobile } from "../hooks/useIsMobile";

type Category = {
  slug: string;
  label: string;
  desc: string;
  previews: string[]; // up to 3 preview images
  count: number;
};

function CategoryCard({ cat, index, focal, isMobile }: {
  cat: Category;
  index: number;
  focal: Record<string, { x: number; y: number }>;
  isMobile: boolean;
}) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startFlip = () => {
    if (cat.previews.length <= 1) return;
    setPreviewIndex(1); // immediately show second image on hover
    intervalRef.current = setInterval(() => {
      setPreviewIndex((i) => (i + 1) % cat.previews.length);
    }, 900);
  };

  const stopFlip = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPreviewIndex(0); // reset to first image
  };

  return (
    <Link href={`/gallery/${cat.slug}`}>
      <div
        className={`reveal reveal-delay-${index + 1} relative overflow-hidden rounded-2xl group cursor-pointer`}
        style={{ height: "clamp(240px, 30vw, 380px)", background: "#0c0c0c", border: "1px solid var(--border)" }}
        onMouseEnter={startFlip}
        onMouseLeave={stopFlip}
      >
        {/* All preview images stacked — only active one is visible */}
        {cat.previews.map((src, i) => {
          const filename = src.split("/").pop() || "";
          const key = `${cat.slug}/${filename}`;
          const imgStyle = getFocalStyle(focal, key, isMobile);

          return (
            <img
              key={src}
              src={src}
              alt={cat.label}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === previewIndex ? (i === 0 ? 0.68 : 0.82) : 0,
                filter: i === previewIndex && i > 0
                  ? "saturate(1.05) brightness(1.0)"
                  : "saturate(0.92) brightness(1.0)",
                transform: "scale(1.0)",
                transition: i === 0
                  ? "opacity 0.5s ease, filter 0.5s ease"
                  : "opacity 0.3s ease, filter 0.3s ease",
                willChange: "opacity",
                ...imgStyle,
              }}
            />
          );
        })}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-40"
          style={{ background: "linear-gradient(to top, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.22) 55%, transparent 100%)" }}
        />

        {/* Preview count dots — only shown on hover when there are multiple previews */}
        {cat.previews.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {cat.previews.map((_, i) => (
              <span
                key={i}
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: i === previewIndex ? "var(--accent)" : "rgba(255,255,255,0.3)",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* Index number */}
        <div
          className="absolute top-5 right-5 text-[10px] tracking-[0.3em] tabular-nums opacity-55 group-hover:opacity-90 transition-opacity duration-300"
          style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Text block */}
        <div className="absolute bottom-0 left-0 p-6 md:p-7">
          <h3
            className="font-light text-white mb-1 transition-colors duration-300 group-hover:text-[#b8966a]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            {cat.label}
          </h3>
          <p
            className="text-[11px] tracking-wider mb-1 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: "#d4cfc8", fontFamily: "var(--font-body)", opacity: 0.85, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            {cat.desc}
          </p>
          {cat.count > 0 && (
            <p
              className="text-[10px] tracking-[0.3em] transition-opacity duration-300 group-hover:opacity-100"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)", opacity: 0.8 }}
            >
              {cat.count} {cat.count === 1 ? "frame" : "frames"}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div
          className="absolute top-5 left-5 w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ borderColor: "var(--accent)", background: "rgba(6,6,6,0.4)" }}
        >
          <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>↗</span>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const focal = useFocalPoints();
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat, i) => (
        <CategoryCard key={cat.slug} cat={cat} index={i} focal={focal} isMobile={isMobile} />
      ))}
    </div>
  );
}
