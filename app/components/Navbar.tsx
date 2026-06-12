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
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-10 py-5 flex items-center justify-between transition-all duration-500"
        style={{
          background: scrolled || menuOpen ? "rgba(6,6,6,0.93)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
        }}>

        {/* Left — logo */}
        <div className="flex items-center gap-4">
          {!isHome && (
            <button onClick={() => router.back()}
              className="text-neutral-500 hover:text-white transition-colors text-lg leading-none mr-1"
              aria-label="Go back">←</button>
          )}
          <Link href="/"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", letterSpacing: "0.12em", fontWeight: 300 }}
            className="text-white hover:text-[#b8966a] transition-colors duration-300">
            cryptic.frames
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {isHome && (
            <>
              <a href="#categories" style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.22em" }}
                className="uppercase text-neutral-300 hover:text-white transition-colors">Work</a>
              <a href="#about" style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.22em" }}
                className="uppercase text-neutral-300 hover:text-white transition-colors">About</a>
              <a href="#contact" style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.22em" }}
                className="uppercase text-neutral-300 hover:text-white transition-colors">Contact</a>
            </>
          )}
          <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.22em",
              border: "1px solid rgba(255,255,255,0.35)", padding: "6px 14px", borderRadius: "2px",
            }}
            className="uppercase text-white hover:border-[#b8966a] hover:text-[#b8966a] transition-all duration-300">
            Instagram
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-[5px] p-1 z-50"
          onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? "w-5 rotate-45 translate-y-[7px]" : "w-5"}`} />
          <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? "opacity-0 w-0" : "w-3"}`} />
          <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 md:hidden flex flex-col items-center justify-center gap-8 transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(6,6,6,0.97)", backdropFilter: "blur(24px)" }}>
        {isHome && (
          <>
            <a onClick={() => setMenuOpen(false)} href="#categories"
              className="font-light tracking-widest hover:text-[#b8966a] transition-colors"
              style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem" }}>Work</a>
            <a onClick={() => setMenuOpen(false)} href="#about"
              className="font-light tracking-widest hover:text-[#b8966a] transition-colors"
              style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem" }}>About</a>
            <a onClick={() => setMenuOpen(false)} href="#contact"
              className="font-light tracking-widest hover:text-[#b8966a] transition-colors"
              style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem" }}>Contact</a>
          </>
        )}
        <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
          className="font-light tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", color: "#b8966a" }}>Instagram</a>
      </div>
    </>
  );
}
