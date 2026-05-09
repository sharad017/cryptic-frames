"use client";
import { useState, useEffect } from "react";

export default function HeroSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setPrev(current);
        setCurrent((c) => (c + 1) % images.length);
        setTransitioning(false);
      }, 1200);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, images.length]);

  if (images.length === 0) return (
    <div className="absolute inset-0 bg-neutral-950" />
  );

  return (
    <>
      {/* Previous image — fades out */}
      {prev !== null && (
        <img
          key={`prev-${prev}`}
          src={images[prev]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "center 30%",
            opacity: transitioning ? 0 : 1,
            transition: "opacity 1.8s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 1,
          }}
        />
      )}
      {/* Current image — fades in */}
      <img
        key={`curr-${current}`}
        src={images[current]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition: "center 30%",
          opacity: 1,
          transition: "opacity 1.8s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 2,
        }}
      />
      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPrev(current); setCurrent(i); }}
              className="transition-all duration-500 rounded-full"
              style={{
                width: i === current ? "24px" : "6px",
                height: "6px",
                background: i === current ? "var(--accent)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
