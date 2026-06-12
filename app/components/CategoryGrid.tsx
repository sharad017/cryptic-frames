"use client";
import Link from "next/link";
import { useFocalPoints, getFocalStyle } from "../hooks/useFocalPoint";
import { useIsMobile } from "../hooks/useIsMobile";

type Category = { slug: string; label: string; desc: string; preview: string | null; count: number };

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const focal = useFocalPoints();
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat, i) => {
        const filename = cat.preview ? cat.preview.split("/").pop() || "" : "";
        const key = `${cat.slug}/${filename}`;
        const imgStyle = cat.preview ? getFocalStyle(focal, key, isMobile) : {};

        return (
          <Link href={`/gallery/${cat.slug}`} key={cat.slug}>
            <div
              className={`reveal reveal-delay-${i + 1} relative overflow-hidden rounded-2xl group cursor-pointer`}
              style={{ height: "clamp(240px, 30vw, 380px)", background: "#0c0c0c", border: "1px solid var(--border)" }}>

              {cat.preview ? (
                <img
                  src={cat.preview}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: 0.68,
                    filter: "saturate(0.92) brightness(1.0)",
                    transform: "scale(1.0)",
                    transition: "opacity 0.6s ease, filter 0.6s ease, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    willChange: "transform, opacity, filter",
                    ...imgStyle,
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget;
                    img.style.opacity = "0.98";
                    img.style.filter = "saturate(1.1) brightness(1.05)";
                    img.style.transform = "scale(1.06)";
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget;
                    img.style.opacity = "0.68";
                    img.style.filter = "saturate(0.92) brightness(1.0)";
                    img.style.transform = "scale(1.0)";
                  }}
                />
              ) : (
                <div className="absolute inset-0" style={{ background: "#0c0c0c" }} />
              )}

              {/* Gradient — lighter overall, fades further on hover */}
              <div
                className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-50"
                style={{ background: "linear-gradient(to top, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.22) 55%, transparent 100%)" }}
              />

              {/* Index number */}
              <div
                className="absolute top-5 right-5 text-[10px] tracking-[0.3em] tabular-nums opacity-55 group-hover:opacity-90 transition-opacity duration-300"
                style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Text block */}
              <div className="absolute bottom-0 left-0 p-6 md:p-7">
                <h3
                  className="font-light text-white mb-1 transition-colors duration-300 group-hover:text-[#b8966a]"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
                  {cat.label}
                </h3>
                <p
                  className="text-[11px] tracking-wider mb-1 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ color: "#d4cfc8", fontFamily: "var(--font-body)", opacity: 0.85, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                  {cat.desc}
                </p>
                {cat.count > 0 && (
                  <p
                    className="text-[10px] tracking-[0.3em] transition-opacity duration-300 group-hover:opacity-100"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-body)", opacity: 0.8, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                    {cat.count} {cat.count === 1 ? "frame" : "frames"}
                  </p>
                )}
              </div>

              {/* Arrow icon */}
              <div
                className="absolute top-5 left-5 w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ borderColor: "var(--accent)", background: "rgba(6,6,6,0.4)" }}>
                <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>↗</span>
              </div>

            </div>
          </Link>
        );
      })}
    </div>
  );
}
