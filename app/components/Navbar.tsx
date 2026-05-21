"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 px-5 md:px-10 py-4 flex items-center justify-between transition-all duration-500"
        style={{
          background: scrolled || menuOpen ? "rgba(7,7,7,0.92)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        }}
      >
        {/* Left — logo or back */}
        <div className="flex items-center gap-4">
          {!isHome && (
            <button onClick={() => router.back()}
              className="text-neutral-500 hover:text-white transition-colors duration-200 text-xl leading-none"
              aria-label="Go back">←</button>
          )}
          <Link href="/"
            className="tracking-[0.3em] text-sm font-light hover:text-[#b8966a] transition-colors duration-300"
            style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>
            cryptic.frames
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {isHome && (
            <>
              <a href="#categories" className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 hover:text-white transition-colors" style={{ fontFamily: "var(--font-body)" }}>Work</a>
              <a href="#about" className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 hover:text-white transition-colors" style={{ fontFamily: "var(--font-body)" }}>About</a>
              <a href="#contact" className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 hover:text-white transition-colors" style={{ fontFamily: "var(--font-body)" }}>Contact</a>
            </>
          )}
          <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
            className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 hover:text-[#b8966a] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}>Instagram</a>
          <Link href="/admin"
            className="text-[10px] tracking-[0.25em] uppercase text-neutral-700 hover:text-neutral-400 transition-colors"
            style={{ fontFamily: "var(--font-body)" }}>Admin</Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-1 z-50"
          onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? "w-6 rotate-45 translate-y-2.5" : "w-6"}`} />
          <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? "opacity-0 w-0" : "w-4"}`} />
          <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? "w-6 -rotate-45 -translate-y-2.5" : "w-6"}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 md:hidden flex flex-col items-center justify-center gap-8 transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(7,7,7,0.97)", backdropFilter: "blur(24px)" }}>
        {isHome && (
          <>
            <a onClick={() => setMenuOpen(false)} href="#categories" className="text-4xl font-light tracking-widest hover:text-[#b8966a] transition-colors" style={{ fontFamily: "var(--font-display)" }}>Work</a>
            <a onClick={() => setMenuOpen(false)} href="#about" className="text-4xl font-light tracking-widest hover:text-[#b8966a] transition-colors" style={{ fontFamily: "var(--font-display)" }}>About</a>
            <a onClick={() => setMenuOpen(false)} href="#contact" className="text-4xl font-light tracking-widest hover:text-[#b8966a] transition-colors" style={{ fontFamily: "var(--font-display)" }}>Contact</a>
          </>
        )}
        <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
          className="text-4xl font-light tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-display)", color: "#b8966a" }}>Instagram</a>
        <Link href="/admin" onClick={() => setMenuOpen(false)}
          className="text-sm tracking-[0.3em] text-neutral-700 uppercase mt-6"
          style={{ fontFamily: "var(--font-body)" }}>Admin</Link>
      </div>
    </>
  );
}
