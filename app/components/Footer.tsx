"use client";

export default function Footer() {
  return (
    <footer className="px-5 md:px-12 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ borderTop: "1px solid var(--border)" }}>
      <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}>
        © {new Date().getFullYear()} Sharad Rajput — cryptic.frames
      </p>
      <div className="flex items-center gap-6">
        <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
          className="text-[10px] tracking-widest uppercase text-neutral-400 hover:text-[#b8966a] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          Instagram
        </a>
      </div>
    </footer>
  );
}
