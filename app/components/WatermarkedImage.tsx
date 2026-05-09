"use client";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export default function WatermarkedImage({ src, alt = "", className = "", style = {}, onClick }: Props) {
  return (
    <div className="relative overflow-hidden" style={{ isolation: "isolate" }} onClick={onClick}>
      <img src={src} alt={alt} className={className} style={style} draggable={false} />
      {/* Subtle watermark — bottom right */}
      <div
        className="absolute bottom-2 right-3 pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(9px, 1.2vw, 13px)",
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.15em",
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          fontStyle: "italic",
          userSelect: "none",
        }}
      >
        cryptic.frames
      </div>
    </div>
  );
}
