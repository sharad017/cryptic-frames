"use client";
import { useRef } from "react";

export default function FeaturedStrip({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const startX = e.pageX;
    const scrollLeft = el.scrollLeft;
    let moved = false;

    const onMove = (ev: MouseEvent) => {
      moved = true;
      el.scrollLeft = scrollLeft - (ev.pageX - startX);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    void moved;
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      className="h-scroll flex gap-3 md:gap-4 overflow-x-auto px-6 md:px-14 pb-4 cursor-grab active:cursor-grabbing select-none"
      style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="flex-shrink-0 overflow-hidden rounded-2xl"
          style={{
            width: "clamp(220px, 38vw, 520px)",
            scrollSnapAlign: "start",
            aspectRatio: "3/4",  /* portrait ratio — looks great for photography */
          }}
        >
          <img
            src={`/images/featured/${img}`}
            alt=""
            draggable={false}
            loading={i < 2 ? "eager" : "lazy"}
            className="w-full h-full object-cover"
            style={{ willChange: "auto", display: "block" }}
          />
        </div>
      ))}
      {/* Trailing spacer so last card doesn't hug the edge */}
      <div className="flex-shrink-0 w-6 md:w-14" />
    </div>
  );
}
