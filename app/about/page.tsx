import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import CustomCursor from "../components/CustomCursor";
import PageTransition from "../components/PageTransition";
import AboutPortrait from "../components/AboutPortrait";

export const metadata: Metadata = {
  title: "About — cryptic.frames",
  description:
    "Sharad Rajput is a Delhi-based, self-taught photographer working across concert, wildlife, travel, portrait, street, and event photography under the name cryptic.frames.",
  openGraph: {
    title: "About — cryptic.frames",
    description: "Delhi-based, self-taught. Six genres. From concert pits to wildlife blinds.",
    images: ["/images/hero.jpg"],
  },
};

const STATS = [
  { num: "6",     label: "Genres" },
  { num: "Delhi", label: "Based in" },
  { num: "2023",  label: "Shooting since" },
  { num: "∞",    label: "Frames remaining" },
];

const GEAR = [
  { kind: "Body", item: "Sony A6600" },
  { kind: "Lens", item: "Sony E PZ 18-105mm F4 G OSS" },
];

const NOTABLE = [
  {
    artist: "Silver Lining",
    venue: "Piano Man Jazz Club",
    location: "Gurgaon",
  },
  {
    artist: "Desmadre Orchestra",
    venue: "Piano Man Jazz Club",
    location: "Eldeco Centre, Malviya Nagar",
  },
];

function getManifest(): Record<string, string[]> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/images/manifest.json"), "utf-8"));
  } catch { return {}; }
}

function getOrder(): Record<string, string[]> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/images/order.json"), "utf-8"));
  } catch { return {}; }
}

function getAboutImages(): string[] {
  const all = getManifest()["about"] || [];
  const saved = getOrder()["about"] || [];
  if (saved.length === 0) return all;
  const ordered = saved.filter((f) => all.includes(f));
  for (const f of all) { if (!ordered.includes(f)) ordered.push(f); }
  return ordered;
}

export default function AboutPage() {
  const aboutImages = getAboutImages().map((f) => `/images/about/${f}`);
  const hasPhoto = aboutImages.length > 0;

  return (
    <PageTransition>
      <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <CustomCursor />
        <Navbar />
        <ScrollReveal />

        {/* ── HERO — split screen ── */}
        <section className="min-h-screen flex flex-col lg:flex-row">

          {/* Left — photo panel, sticky on scroll */}
          {hasPhoto && (
            <div
              className="relative lg:sticky lg:top-0 lg:h-screen w-full lg:w-[44%] shrink-0 overflow-hidden"
              style={{ minHeight: "50vw" }}
            >
              {aboutImages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt="Sharad Rajput — cryptic.frames photographer"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  style={{
                    opacity: i === 0 ? 1 : 0,
                    transition: "opacity 1.4s ease-in-out",
                  }}
                  loading="eager"
                />
              ))}
              {/* Subtle right-side fade to blend into the dark right panel */}
              <div
                className="absolute inset-0 hidden lg:block"
                style={{
                  background: "linear-gradient(to right, transparent 70%, var(--bg) 100%)",
                }}
              />
              {/* Bottom fade on mobile */}
              <div
                className="absolute inset-0 block lg:hidden"
                style={{
                  background: "linear-gradient(to bottom, transparent 60%, var(--bg) 100%)",
                }}
              />
            </div>
          )}

          {/* Right — name + bio */}
          <div
            className={`flex flex-col justify-center px-8 md:px-14 pt-32 lg:pt-0 pb-16 ${hasPhoto ? "lg:w-[56%]" : "w-full max-w-4xl mx-auto"}`}
          >
            {/* Eyebrow */}
            <p
              className="reveal text-[10px] tracking-[0.5em] uppercase mb-5"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
            >
              The Photographer
            </p>

            {/* Name */}
            <h1
              className="reveal font-light leading-[0.9] mb-8"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: hasPhoto ? "clamp(3rem, 6vw, 6.5rem)" : "clamp(4rem, 10vw, 10rem)",
                letterSpacing: "-0.01em",
              }}
            >
              Sharad<br /><em>Rajput</em>
            </h1>

            {/* Gold line */}
            <div
              className="reveal mb-8"
              style={{ width: "clamp(2rem, 5vw, 4rem)", height: "1px", background: "var(--accent)" }}
            />

            {/* Bio */}
            <div
              className="reveal reveal-delay-1 space-y-5"
              style={{ color: "#8a8580", fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: "2", maxWidth: "480px" }}
            >
              <p style={{ color: "#c8c0b4", fontSize: "0.95rem", lineHeight: "1.9" }}>
                Photography found me before I found it. Handed a phone at a family function as a child,
                I composed frames without knowing what composition was. The instinct was always there.
              </p>
              <p>
                Self-taught through obsessive attention — studying light, dissecting edits,
                analysing why one frame works and another doesn&apos;t. No formal training.
                Just relentless repetition.
              </p>
              <p>
                In college, I joined{" "}
                <em style={{ color: "#c8c0b4" }}>Confluenz</em> — GGSIPU&apos;s student
                photography collective — and spent a year covering everything from intimate
                portrait sessions to high-energy concert pits.
              </p>
              <p>Currently based in Delhi. Open to work across India and beyond.</p>
            </div>

            {/* CTAs */}
            <div className="reveal reveal-delay-2 flex flex-wrap items-center gap-8 mt-10">
              <a
                href="https://instagram.com/cryptic.frames"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tracking-[0.4em] uppercase pb-px hover:opacity-70 transition-opacity"
                style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)", fontFamily: "var(--font-body)" }}
              >
                Instagram ↗
              </a>
              <Link
                href="/#contact"
                className="text-[10px] tracking-[0.4em] uppercase transition-colors hover:text-white"
                style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}
              >
                Commission a shoot →
              </Link>
            </div>
          </div>
        </section>

        {/* ── NOTABLE SHOOTS ── */}
        <section
          className="px-8 md:px-14 py-16 md:py-24"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="reveal text-[10px] tracking-[0.5em] uppercase mb-10"
            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
          >
            Notable shoots
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {NOTABLE.map((n, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "1.5rem 1.75rem",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <p
                  className="text-[9px] tracking-[0.4em] uppercase mb-4"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)", opacity: 0.7 }}
                >
                  Live Performance
                </p>
                <h3
                  className="font-light mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    lineHeight: 1,
                    color: "var(--fg)",
                  }}
                >
                  {n.artist}
                </h3>
                <p
                  style={{
                    color: "#6a6a6a",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    marginTop: "8px",
                  }}
                >
                  {n.venue}
                </p>
                <p
                  style={{
                    color: "#4a4a4a",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.05em",
                    marginTop: "3px",
                  }}
                >
                  {n.location}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS + GEAR ── */}
        <section
          className="px-8 md:px-14 py-16 md:py-24"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Stats row */}
          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-light mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {stat.num}
                </p>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "#5a5a5a", fontFamily: "var(--font-body)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Gear */}
          <div
            className="reveal pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-6"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
            >
              Gear
            </p>
            <div className="flex flex-wrap gap-x-12 gap-y-3">
              {GEAR.map((g, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <span
                    className="text-[9px] tracking-[0.3em] uppercase"
                    style={{ color: "#4a4a4a", fontFamily: "var(--font-body)", minWidth: "32px" }}
                  >
                    {g.kind}
                  </span>
                  <span
                    style={{ color: "#a8a09a", fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
                  >
                    {g.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
