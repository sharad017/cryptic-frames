"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-5 md:px-12 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ borderTop: "1px solid var(--border)" }}>
      <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: "#2a2a2a", fontFamily: "var(--font-body)" }}>
        © {new Date().getFullYear()} Sharad Rajput — cryptic.frames
      </p>
      <div className="flex items-center gap-6">
        <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
          className="text-[10px] tracking-widest uppercase text-neutral-600 hover:text-[#b8966a] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          Instagram
        </a>
        <Link href="/admin" className="text-[10px] tracking-widest uppercase"
          style={{ color: "#181818", fontFamily: "var(--font-body)" }}>
          Admin
        </Link>
      </div>
    </footer>
  );
}
