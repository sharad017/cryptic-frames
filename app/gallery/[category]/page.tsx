"use client";
import { use, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import PageTransition from "@/app/components/PageTransition";
import { getOrderedImages } from "@/app/hooks/useImageOrder";
import Lightbox from "@/app/components/Lightbox";
import WatermarkedImage from "@/app/components/WatermarkedImage";
import CustomCursor from "@/app/components/CustomCursor";

export default function GalleryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load images
  useEffect(() => {
    fetch(`/api/images?category=${category}`)
      .then((r) => r.json())
      .then((data: string[]) => {
        const ordered = getOrderedImages(category, data);
        setImages(ordered);
        setLoaded(true);
        // Open specific image if ?photo=N in URL
        const photoParam = searchParams.get("photo");
        if (photoParam !== null) {
          const idx = parseInt(photoParam, 10);
          if (!isNaN(idx) && idx >= 0 && idx < ordered.length) {
            setSelectedIndex(idx);
          }
        }
      });
  }, [category, searchParams]);

  // Update URL when image changes so it's shareable
  const openImage = useCallback((idx: number) => {
    setSelectedIndex(idx);
    const url = new URL(window.location.href);
    url.searchParams.set("photo", String(idx));
    window.history.replaceState({}, "", url.toString());
  }, []);

  const closeImage = useCallback(() => {
    setSelectedIndex(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const selectedImage = selectedIndex !== null
    ? `/images/${category}/${images[selectedIndex]}`
    : null;

  return (
    <PageTransition>
      <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <CustomCursor />
        <Navbar />

        {/* Header */}
        <div className="px-6 md:px-14 pt-28 md:pt-36 pb-10 md:pb-14">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
            Category
          </p>
          <h1
            className="font-light capitalize leading-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem, 10vw, 8rem)", letterSpacing: "-0.01em" }}
          >
            {category}
          </h1>
          {loaded && (
            <p className="mt-3 text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              {images.length} {images.length === 1 ? "frame" : "frames"}
            </p>
          )}
        </div>

        {/* Grid — 2 cols on mobile, 3 on desktop */}
        {!loaded ? (
          <div className="flex items-center justify-center py-32" style={{ color: "var(--muted)" }}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-t animate-spin" style={{ borderColor: "var(--accent)" }} />
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: "var(--font-body)" }}>Loading</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32" style={{ color: "var(--muted)" }}>
            <p className="text-5xl mb-4">∅</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-body)" }}>No images yet</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-2 lg:columns-3 gap-2 md:gap-3 px-2 md:px-6 pb-24">
            {images.map((image, index) => (
              <div
                key={index}
                className="break-inside-avoid overflow-hidden rounded-lg md:rounded-xl cursor-pointer group mb-2 md:mb-3 relative"
                onClick={() => openImage(index)}
                style={{ isolation: "isolate" }}
              >
                <WatermarkedImage
                  src={`/images/${category}/${image}`}
                  className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  style={{ willChange: "transform", transformOrigin: "center", display: "block" }}
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: "rgba(6,6,6,0.25)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full border flex items-center justify-center"
                    style={{ borderColor: "rgba(255,255,255,0.5)" }}
                  >
                    <span className="text-white" style={{ fontSize: "0.75rem" }}>⤢</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <Lightbox
              image={selectedImage}
              category={category}
              index={selectedIndex!}
              onClose={closeImage}
              onPrev={() => openImage(Math.max(0, (selectedIndex ?? 0) - 1))}
              onNext={() => openImage(Math.min(images.length - 1, (selectedIndex ?? 0) + 1))}
              hasPrev={(selectedIndex ?? 0) > 0}
              hasNext={(selectedIndex ?? 0) < images.length - 1}
            />
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
