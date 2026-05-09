"use client";

export default function PitchSection() {
  return (
    <section className="px-5 md:px-12 py-14 md:py-20" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="reveal max-w-4xl">
        <p className="font-light leading-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 3.2rem)", color: "var(--fg)" }}>
          Concert pits. Wildlife blinds. Golden hour portraits.{" "}
          <em style={{ color: "var(--accent)" }}>Whatever the frame demands.</em>
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {["Available for Hire", "Open to Collabs", "Event Coverage", "Portrait Sessions"].map((tag) => (
            <span key={tag} className="text-[10px] tracking-[0.3em] uppercase px-4 py-2 rounded-full"
              style={{ border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              {tag}
            </span>
          ))}
          <a href="#contact" className="text-[10px] tracking-[0.3em] uppercase px-4 py-2 rounded-full transition-all duration-300 hover:opacity-80"
            style={{ background: "var(--accent)", color: "#060606", fontFamily: "var(--font-body)" }}>
            Book Now →
          </a>
        </div>
      </div>
    </section>
  );
}
