"use client";

export default function HeroText() {
  return (
    <div className="absolute bottom-0 left-0 w-full z-[4] px-6 md:px-12 pb-20 md:pb-28 flex flex-col items-start">

      {/* Eyebrow */}
      <p className="hero-line-1 uppercase mb-4 md:mb-5"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.45em", color: "var(--accent)" }}>
        Photography Portfolio
      </p>

      {/* Name — all caps, both lines same cream color, massive */}
      <div className="hero-line-2 mb-3 md:mb-4">
        <h1 className="uppercase font-light leading-[0.88] block"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.8rem, 11.5vw, 13rem)", letterSpacing: "0.04em", color: "var(--fg)" }}>
          Sharad
        </h1>
        <h1 className="uppercase font-light leading-[0.88] block"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.8rem, 11.5vw, 13rem)", letterSpacing: "0.04em", color: "var(--fg)" }}>
          Rajput
        </h1>
      </div>

      {/* Gold accent line under name */}
      <div className="hero-line-2 mb-6 md:mb-7" style={{ width: "clamp(2.5rem, 6vw, 5rem)", height: "1px", background: "var(--accent)" }} />

      {/* Tagline */}
      <p className="hero-line-3 mb-8 md:mb-10"
        style={{ fontFamily: "var(--font-body)", fontSize: "clamp(0.78rem, 1.3vw, 0.9rem)", color: "rgba(232,226,217,0.5)", lineHeight: 1.85, maxWidth: "22rem", letterSpacing: "0.01em" }}>
        Capturing stories through shadows,<br />silence, motion, and light.
      </p>

      {/* CTAs */}
      <div className="hero-line-4 flex items-center gap-6 md:gap-8">
        <a href="#categories"
          className="group flex items-center gap-3 transition-all duration-300 hover:bg-white hover:text-black"
          style={{
            fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.22em",
            textTransform: "uppercase", padding: "13px 26px",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "100px",
          }}>
          Explore Work
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
        <a href="#about"
          className="uppercase transition-colors duration-300 hover:text-white"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.22em", color: "rgba(232,226,217,0.4)" }}>
          About Me
        </a>
      </div>

      {/* Scroll to Explore — right side */}
      <div className="hero-line-4 absolute right-6 md:right-10 bottom-8 md:bottom-12 flex flex-col items-center gap-3">
        <span className="uppercase" style={{
          fontFamily: "var(--font-body)", fontSize: "0.5rem", letterSpacing: "0.35em",
          color: "rgba(232,226,217,0.22)", writingMode: "vertical-rl",
        }}>
          Scroll to Explore
        </span>
        <div className="w-px h-14" style={{ background: "linear-gradient(to bottom, rgba(184,150,106,0.5), transparent)" }} />
      </div>
    </div>
  );
}
