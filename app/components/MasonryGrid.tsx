"use client";
import { useState } from "react";
import { useAltText, getAlt } from "@/app/hooks/useAltText";
import { useIsMobile } from "@/app/hooks/useIsMobile";

const GAP = 6;

const MOBILE_COLS: Record<number, number> = { [-1]: 1, 0: 1, 1: 2 };
const DESKTOP_COLS: Record<number, number> = { [-1]: 2, 0: 3, 1: 4 };

export default function MasonryGrid({
  images,
  category,
  onImageClick,
  sizeAdjust = 0,
}: {
  images: string[];
  category: string;
  onImageClick: (idx: number) => void;
  sizeAdjust?: number;
}) {
  const altMap = useAltText();
  const isMobile = useIsMobile();

  const columns = (isMobile ? MOBILE_COLS : DESKTOP_COLS)[sizeAdjust] ?? (isMobile ? 1 : 3);

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
    <div className="w-full" style={{ padding: "0 24px 96px" }}>
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
        background: loaded ? "transparent" : "#1a1a1a",
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
          transform: "scale(1)",
          transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.4s ease",
          willChange: "transform",
        }}
        className="group-hover:scale-[1.04] group-hover:brightness-105"
      />
      {/* Expand icon on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(6,6,6,0.55)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span className="text-white" style={{ fontSize: "9px" }}>⤢</span>
        </div>
      </div>
    </div>
  );
}
