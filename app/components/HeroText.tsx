"use client";

export default function HeroText() {
  return (
    <div className="absolute bottom-0 left-0 w-full z-[4] px-6 md:px-14 pb-14 md:pb-20 flex flex-col items-start">

      {/* Eyebrow */}
      <div className="hero-line-1 flex items-center gap-3 mb-6 md:mb-8">
        <div className="w-8 h-px" style={{ background: "var(--accent)" }} />
        <p className="text-[9px] tracking-[0.5em] uppercase"
          style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
          Photography Portfolio
        </p>
      </div>

      {/* Name — split lines, strong composition */}
      <div className="hero-line-2 mb-6 md:mb-8">
        <h1 className="font-light leading-[0.85] block"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3.2rem, 10vw, 11rem)",
            letterSpacing: "-0.01em",
            color: "var(--fg)",
          }}>
          Sharad
        </h1>
        <h1 className="font-light leading-[0.85] block italic"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3.2rem, 10vw, 11rem)",
            letterSpacing: "-0.01em",
            color: "var(--accent)",
          }}>
          Rajput
        </h1>
      </div>

      {/* Tagline */}
      <p className="hero-line-3 mb-8 md:mb-10"
        style={{
          color: "rgba(232,226,217,0.45)",
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.75rem, 1.4vw, 0.95rem)",
          lineHeight: 1.9,
          maxWidth: "26rem",
          letterSpacing: "0.02em",
        }}>
        Cinematic frames inspired<br />
        by silence, contrast, and emotion.
      </p>

      {/* CTAs */}
      <div className="hero-line-4 flex items-center gap-5 md:gap-8">
        <a href="#categories"
          className="group flex items-center gap-3 transition-all duration-400"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "2px",
            padding: "12px 24px",
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            background: "rgba(255,255,255,0.03)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
            (e.currentTarget as HTMLElement).style.color = "inherit";
          }}>
          View Portfolio
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
        <a href="#about"
          className="transition-colors duration-300"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(232,226,217,0.35)",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--fg)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(232,226,217,0.35)")}>
          About Me
        </a>
      </div>

      {/* Scroll indicator — right side */}
      <div className="hero-line-4 absolute bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col items-center gap-3">
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.55rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(232,226,217,0.25)",
          writingMode: "vertical-rl",
          marginBottom: "8px",
        }}>
          Scroll to Explore
        </span>
        <div className="w-px h-12" style={{ background: "linear-gradient(to bottom, rgba(232,226,217,0.25), transparent)" }} />
      </div>
    </div>
  );
}
