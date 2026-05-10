"use client";
import { useState, useEffect } from "react";
import { useFocalPoints } from "../hooks/useFocalPoint";
import { useIsMobile } from "../hooks/useIsMobile";

export default function HeroSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const focal = useFocalPoints();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setPrev(current);
        setCurrent((c) => (c + 1) % images.length);
        setTransitioning(false);
      }, 1200);
    }, 5500);
    return () => clearInterval(timer);
  }, [current, images.length]);

  if (images.length === 0) return <div className="absolute inset-0 bg-neutral-950" />;

  const getPos = (src: string) => {
    // key = "featured/filename.jpg" or just use the src path
    const key = src.replace("/images/", "");
    const f = focal[key];
    if (!f) return "center 30%";
    return isMobile ? f.mobile : f.desktop;
  };

  return (
    <>
      {prev !== null && (
        <img key={`prev-${prev}`} src={images[prev]} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: getPos(images[prev]), opacity: transitioning ? 0 : 1, transition: "opacity 1.8s cubic-bezier(0.4,0,0.2,1)", zIndex: 1 }} />
      )}
      <img key={`curr-${current}`} src={images[current]} alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: getPos(images[current]), opacity: 1, transition: "opacity 1.8s cubic-bezier(0.4,0,0.2,1)", zIndex: 2 }} />

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button key={i} onClick={() => { setPrev(current); setCurrent(i); }}
              className="transition-all duration-500 rounded-full"
              style={{ width: i === current ? "24px" : "6px", height: "6px", background: i === current ? "var(--accent)" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
      )}
    </>
  );
}
