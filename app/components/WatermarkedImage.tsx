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
    </div>
  );
}
