"use client";
import { useState } from "react";
import { useAltText, getAlt } from "@/app/hooks/useAltText";
import { useIsMobile } from "@/app/hooks/useIsMobile";

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

  return (
    <div
      className="w-full"
      style={{
        padding: "0 24px 96px",
        columns: columns,
        columnGap: "6px",
      }}
    >
      {images.map((img, i) => (
        <MasonryItem
          key={img}
          src={`/images/${category}/${img}`}
          index={i}
          alt={getAlt(altMap, category, img)}
          onClick={onImageClick}
        />
      ))}
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
        breakInside: "avoid",
        marginBottom: "6px",
        display: "block",
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
