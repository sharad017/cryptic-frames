"use client";
import Link from "next/link";

type Cat = { slug: string; label: string; count: number };

export default function CategoryStrip({ categories }: { categories: Cat[] }) {
  const active = categories.filter(c => c.count > 0);
  return (
    <div className="w-full overflow-x-auto" style={{ background: "rgba(6,6,6,0.85)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex min-w-max px-6 md:px-12">
        {active.map((cat, i) => (
          <Link key={cat.slug} href={`/gallery/${cat.slug}`}>
            <div className="group flex flex-col justify-center px-6 md:px-10 py-4 md:py-5 transition-all duration-300 cursor-pointer"
              style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="uppercase font-light group-hover:text-[#b8966a] transition-colors duration-300"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(0.7rem, 1.4vw, 0.85rem)", letterSpacing: "0.2em", color: "var(--fg)", whiteSpace: "nowrap" }}>
                {cat.label}
              </p>
              <p className="mt-0.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
