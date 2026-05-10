"use client";
import Link from "next/link";
import { useFocalPoints } from "../hooks/useFocalPoint";
import { useIsMobile } from "../hooks/useIsMobile";

type Category = {
  slug: string;
  label: string;
  desc: string;
  preview: string | null;
  count: number;
};

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const focal = useFocalPoints();
  const isMobile = useIsMobile();

  const getCoverPos = (slug: string, preview: string | null) => {
    if (!preview) return "center center";
    const filename = preview.split("/").pop() || "";
    const key = `${slug}/${filename}`;
    const f = focal[key];
    if (!f) return "center 40%";
    return isMobile ? f.mobile : f.desktop;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat, i) => (
        <Link href={`/gallery/${cat.slug}`} key={cat.slug}>
          <div
            className={`reveal reveal-delay-${i + 1} relative overflow-hidden rounded-2xl group cursor-pointer`}
            style={{ height: "clamp(240px, 30vw, 380px)", background: "#0c0c0c", border: "1px solid var(--border)" }}
          >
            {cat.preview ? (
              <img src={cat.preview} alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                style={{
                  opacity: 0.52,
                  filter: "saturate(0.8)",
                  willChange: "transform",
                  objectPosition: getCoverPos(cat.slug, cat.preview),
                }} />
            ) : (
              <div className="absolute inset-0" style={{ background: "#0c0c0c" }} />
            )}
            <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60"
              style={{ background: "linear-gradient(to top, rgba(6,6,6,0.93) 0%, rgba(6,6,6,0.25) 55%, transparent 100%)" }} />
            <div className="absolute top-5 right-5 text-[10px] tracking-[0.3em] tabular-nums opacity-35 group-hover:opacity-75 transition-opacity"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="absolute bottom-0 left-0 p-6 md:p-7">
              <h3 className="font-light text-white mb-1 transition-colors duration-300 group-hover:text-[#b8966a]"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}>
                {cat.label}
              </h3>
              <p className="text-[11px] tracking-wider mb-1" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                {cat.desc}
              </p>
              {cat.count > 0 && (
                <p className="text-[10px] tracking-[0.3em]" style={{ color: "var(--accent)", fontFamily: "var(--font-body)", opacity: 0.65 }}>
                  {cat.count} frames
                </p>
              )}
            </div>
            <div className="absolute top-5 left-5 w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ borderColor: "var(--accent)" }}>
              <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>↗</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
