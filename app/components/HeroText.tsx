"use client";

export default function HeroText() {
  return (
    <div className="absolute bottom-0 left-0 w-full z-[4] px-6 md:px-14 pb-16 md:pb-24 flex flex-col items-start">
      <p className="hero-line-1 text-[10px] tracking-[0.55em] uppercase mb-5"
        style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
        Photography Portfolio
      </p>
      <h1 className="hero-line-2 font-light leading-[0.88] whitespace-nowrap mb-6"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 8vw, 9rem)", letterSpacing: "-0.02em" }}>
        cryptic.frames
      </h1>
      <p className="hero-line-3 text-sm leading-loose max-w-xs mb-9"
        style={{ color: "#888", fontFamily: "var(--font-body)" }}>
        Capturing stories through shadows,<br />silence, motion, and light.
      </p>
      <div className="hero-line-4 flex items-center gap-6">
        <a href="#categories"
          className="px-7 py-3 text-[10px] tracking-[0.3em] uppercase rounded-full transition-all duration-300 hover:text-[#b8966a]"
          style={{ border: "1px solid rgba(255,255,255,0.2)", fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}>
          Explore Work
        </a>
        <a href="#about" className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          About me
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="hero-line-4 absolute bottom-8 right-8 flex flex-col items-center gap-3">
        <span className="text-[9px] tracking-[0.4em] uppercase"
          style={{ color: "var(--muted)", fontFamily: "var(--font-body)", writingMode: "vertical-rl" }}>Scroll</span>
        <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, var(--muted), transparent)" }} />
      </div>
    </div>
  );
}
