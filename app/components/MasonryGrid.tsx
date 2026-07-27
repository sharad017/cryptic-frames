"use client";
import { useState } from "react";
import { useAltText, getAlt } from "@/app/hooks/useAltText";
import { useIsMobile } from "@/app/hooks/useIsMobile";

const GAP = 6;

const MOBILE_COLS: Record<number, number> = { [-1]: 1, 0: 1, 1: 2 };
const DESKTOP_COLS: Record<number, number> = { [-1]: 2, 0: 3, 1: 4 };

// Simple sequential distribution — preserves your arranged order exactly
function sequentialColumns(
  images: { src: string; index: number; filename: string }[],
  cols: number
): { src: string; index: number; filename: string }[][] {
  const columns: { src: string; index: number; filename: string }[][] = Array.from({ length: cols }, () => []);
  images.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

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

  const items = images.map((img, i) => ({
    src: `/images/${category}/${img}`,
    index: i,
    filename: img,
  }));

  const cols = sequentialColumns(items, columns);

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
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      style={{
        width: "100%",
        background: loaded ? "transparent" : "#1a1a1a",
        opacity: loaded ? 1 : 0.7,
        transition: "opacity 0.4s ease",
      }}
      onClick={() => onClick(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          transform: hovered ? "scale(1.04)" : "scale(1)",
          filter: hovered ? "brightness(1.06)" : "brightness(1)",
          transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease",
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(6,6,6,0.55)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <span style={{ color: "white", fontSize: "9px" }}>⤢</span>
      </div>
    </div>
  );
}
