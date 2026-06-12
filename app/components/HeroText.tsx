"use client";

export default function HeroText() {
  return (
    <div className="absolute bottom-0 left-0 w-full z-[4] px-6 md:px-12 pb-24 md:pb-28 flex flex-col items-start">

      {/* Eyebrow */}
      <p className="hero-line-1 uppercase mb-4 md:mb-5"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem", letterSpacing: "0.45em", color: "var(--accent)" }}>
        Photography Portfolio
      </p>

      {/* Name — constrained to left side so it never touches the subject */}
      <div className="hero-line-2 mb-3 md:mb-4" style={{ maxWidth: "min(52vw, 640px)" }}>
        <h1 className="uppercase font-light leading-[0.85] block"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8.5vw, 9.5rem)",
            letterSpacing: "0.03em",
            color: "var(--fg)",
          }}>
          Sharad
        </h1>
        <h1 className="uppercase font-light leading-[0.85] block"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8.5vw, 9.5rem)",
            letterSpacing: "0.03em",
            color: "var(--fg)",
          }}>
          Rajput
        </h1>
      </div>

      {/* Gold accent line */}
      <div className="hero-line-2 mb-5 md:mb-6"
        style={{ width: "clamp(2rem, 4vw, 3.5rem)", height: "1px", background: "var(--accent)" }} />

      {/* Tagline — max width keeps it left */}
      <p className="hero-line-3 mb-8 md:mb-10"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.75rem, 1.1vw, 0.88rem)",
          color: "rgba(232,226,217,0.5)",
          lineHeight: 1.9,
          maxWidth: "min(340px, 45vw)",
          letterSpacing: "0.01em",
        }}>
        Capturing stories through shadows,<br />
        silence, motion, and light.
      </p>

      {/* CTAs */}
      <div className="hero-line-4 flex items-center gap-5 md:gap-8">
        <a href="#categories"
          className="group flex items-center gap-3 transition-all duration-300 hover:bg-white hover:text-black"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "12px 24px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: "100px",
            whiteSpace: "nowrap",
          }}>
          Explore Work
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
        <a href="#about"
          className="uppercase transition-colors duration-300 hover:text-white"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            color: "rgba(232,226,217,0.38)",
            whiteSpace: "nowrap",
          }}>
          About Me
        </a>
      </div>

      {/* Scroll to Explore — right side */}
      <div className="hero-line-4 absolute right-6 md:right-10 bottom-8 md:bottom-14 flex flex-col items-center gap-3">
        <span className="uppercase"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.48rem",
            letterSpacing: "0.35em",
            color: "rgba(232,226,217,0.2)",
            writingMode: "vertical-rl",
          }}>
          Scroll to Explore
        </span>
        <div className="w-px h-14"
          style={{ background: "linear-gradient(to bottom, rgba(184,150,106,0.45), transparent)" }} />
      </div>
    </div>
  );
}
