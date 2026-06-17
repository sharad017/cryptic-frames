"use client";
import { use, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import PageTransition from "@/app/components/PageTransition";
import Lightbox from "@/app/components/Lightbox";
import CustomCursor from "@/app/components/CustomCursor";
import MasonryGrid from "@/app/components/MasonryGrid";
import SizeToggle from "@/app/components/SizeToggle";
import { useGridSize } from "@/app/hooks/useGridSize";
import { fetchOrderedImages } from "@/app/hooks/useImageOrder";

export default function GalleryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const searchParams = useSearchParams();
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sizeAdjust, setSizeAdjust] = useGridSize();

  useEffect(() => {
    fetchOrderedImages(category).then((imgs) => {
      setImages(imgs);
      setLoaded(true);
      const p = searchParams.get("photo");
      if (p !== null) {
        const idx = parseInt(p, 10);
        if (!isNaN(idx) && idx >= 0 && idx < imgs.length) setSelectedIndex(idx);
      }
    });
  }, [category, searchParams]);

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

  const selectedImage =
    selectedIndex !== null
      ? `/images/${category}/${images[selectedIndex]}`
      : null;

  return (
    <PageTransition>
      <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <CustomCursor />
        <Navbar />

        {/* Header */}
        <div className="px-6 md:px-14 pt-28 md:pt-36 pb-10 md:pb-14">
          <p
            className="text-[10px] tracking-[0.5em] uppercase mb-3"
            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
          >
            Category
          </p>
          <h1
            className="font-light capitalize leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 10vw, 8rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {category}
          </h1>

          {loaded && images.length > 0 && (
            <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <p
                  className="text-[10px] tracking-[0.4em] uppercase"
                  style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}
                >
                  {images.length} {images.length === 1 ? "frame" : "frames"}
                </p>
                {/* Slideshow / book-mode button */}
                <button
                  onClick={() => openImage(0)}
                  className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase transition-colors hover:text-white"
                  style={{
                    color: "#9a9a9a",
                    fontFamily: "var(--font-body)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "1px solid currentColor",
                    fontSize: "8px",
                  }}>▶</span>
                  Slideshow
                </button>
              </div>
              <SizeToggle value={sizeAdjust} onChange={setSizeAdjust} />
            </div>
          )}
        </div>

        {/* Gallery */}
        {!loaded ? (
          <div className="flex items-center justify-center py-32">
            <div
              className="w-8 h-8 rounded-full border-t animate-spin"
              style={{ borderColor: "var(--accent)" }}
            />
          </div>
        ) : images.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-32"
            style={{ color: "var(--muted)" }}
          >
            <p className="text-5xl mb-4">∅</p>
            <p
              className="text-[10px] tracking-widest uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              No images yet
            </p>
          </div>
        ) : (
          <MasonryGrid
            images={images}
            category={category}
            onImageClick={openImage}
            sizeAdjust={sizeAdjust}
          />
        )}

        <AnimatePresence>
          {selectedImage && (
            <Lightbox
              image={selectedImage}
              category={category}
              index={selectedIndex ?? 0}
              onClose={closeImage}
              onPrev={
                selectedIndex !== null && selectedIndex > 0
                  ? () => openImage(selectedIndex - 1)
                  : undefined
              }
              onNext={
                selectedIndex !== null && selectedIndex < images.length - 1
                  ? () => openImage(selectedIndex + 1)
                  : undefined
              }
              hasPrev={selectedIndex !== null && selectedIndex > 0}
              hasNext={selectedIndex !== null && selectedIndex < images.length - 1}
            />
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
