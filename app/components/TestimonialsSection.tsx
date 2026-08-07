export type Testimonial = {
  id: string;
  name: string;
  context?: string;
  quote: string;
  published: boolean;
};

export default function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const visible = testimonials.filter((t) => t.published && t.quote?.trim());

  // Nothing published yet — section doesn't exist on the page at all.
  if (visible.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="px-5 md:px-12 py-20 md:py-28"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="reveal mb-12 md:mb-16">
        <p
          className="text-[10px] tracking-[0.5em] uppercase mb-3"
          style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
        >
          Kind Words
        </p>
        <h2
          className="font-light leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem,6vw,5.5rem)",
          }}
        >
          From the People<br />I&apos;ve Worked With
        </h2>
      </div>

      <div
        className={`grid gap-6 md:gap-8 ${
          visible.length === 1
            ? "max-w-2xl"
            : visible.length === 2
            ? "md:grid-cols-2"
            : "md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {visible.map((t, i) => (
          <figure
            key={t.id}
            className={`reveal ${i % 6 < 6 ? `reveal-delay-${(i % 3) + 1}` : ""}`}
            style={{
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.02)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "3rem",
                lineHeight: 1,
                color: "var(--accent)",
                opacity: 0.5,
              }}
            >
              &ldquo;
            </span>
            <blockquote
              className="flex-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                lineHeight: 1.6,
                color: "var(--fg)",
                marginTop: "0.5rem",
              }}
            >
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
              <p
                className="text-sm"
                style={{ color: "var(--fg)", fontFamily: "var(--font-body)" }}
              >
                {t.name}
              </p>
              {t.context && (
                <p
                  className="text-[11px] tracking-widest uppercase mt-1"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                >
                  {t.context}
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
