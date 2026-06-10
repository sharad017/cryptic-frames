"use client";
import { useState, useEffect, useRef } from "react";
import { useAltText, getAlt } from "@/app/hooks/useAltText";

const GAP = 6;

export default function MasonryGrid({
  images,
  category,
  onImageClick,
}: {
  images: string[];
  category: string;
  onImageClick: (idx: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const altMap = useAltText();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w < 480) setColumns(1);
      else if (w < 768) setColumns(2);
      else if (w < 1280) setColumns(3);
      else setColumns(4);
    };
    const obs = new ResizeObserver(update);
    obs.observe(el);
    update();
    return () => obs.disconnect();
  }, []);

  const cols: { src: string; index: number; filename: string }[][] = Array.from(
    { length: columns },
    () => []
  );
  images.forEach((img, i) => {
    cols[i % columns].push({
      src: `/images/${category}/${img}`,
      index: i,
      filename: img,
    });
  });

  return (
    <div ref={containerRef} className="w-full" style={{ padding: "0 24px 96px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${GAP}px`,
          alignItems: "start",
        }}
      >
        {cols.map((col, colIdx) => (
          <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {col.map((item) => (
              <MasonryItem
                key={item.index}
                src={item.src}
                index={item.index}
                alt={getAlt(altMap, category, item.filename)}
                onClick={onImageClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MasonryItem({
  src,
  index,
  alt,
  onClick,
}: {
  src: string;
  index: number;
  alt: string;
  onClick: (idx: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative overflow-hidden cursor-pointer group"
      style={{
        width: "100%",
        background: loaded ? "transparent" : "var(--muted, #2a2a2a)",
        opacity: loaded ? 1 : 0.7,
        transition: "opacity 0.4s ease",
      }}
      onClick={() => onClick(index)}
    >
      <img
        src={src}
        alt={alt}
        loading={index < 9 ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), brightness 0.3s ease",
          willChange: "transform",
        }}
        className="group-hover:brightness-110"
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        style={{ background: "rgba(6,6,6,0.18)" }}
      >
        <div
          className="w-9 h-9 rounded-full border flex items-center justify-center"
          style={{ borderColor: "rgba(255,255,255,0.4)" }}
        >
          <span className="text-white text-xs">⤢</span>
        </div>
      </div>
    </div>
  );
}
