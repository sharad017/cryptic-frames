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
    description: "Delhi-based, self-taught. Working across six genres — from concert pits to quiet wildlife blinds.",
    images: ["/images/hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — cryptic.frames",
    description: "Delhi-based, self-taught. Working across six genres — from concert pits to quiet wildlife blinds.",
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
    type: "Live Performance",
  },
  {
    artist: "Desmadre Orchestra",
    venue: "Piano Man Jazz Club",
    location: "Eldeco Centre, Malviya Nagar",
    type: "Live Performance",
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

  return (
    <PageTransition>
      <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <CustomCursor />
        <Navbar />
        <ScrollReveal />

        {/* ── HERO NAME — full width, massive ── */}
        <div className="px-6 md:px-14 pt-28 md:pt-36 pb-0">
          <p
            className="reveal text-[10px] tracking-[0.5em] uppercase mb-5"
            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
          >
            The Photographer
          </p>
          <h1
            className="reveal font-light leading-[0.88] pb-8 md:pb-12"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(4.5rem, 14vw, 13rem)",
              letterSpacing: "-0.01em",
            }}
          >
            Sharad <em>Rajput</em>
          </h1>
          <div
            className="reveal w-full"
            style={{ height: "1px", background: "linear-gradient(to right, var(--accent), transparent)" }}
          />
        </div>

        {/* ── PHOTO + BIO — side by side ── */}
        <div className="px-6 md:px-14 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">

          {/* Portrait */}
          {aboutImages.length > 0 && (
            <div className="reveal reveal-delay-1" style={{ maxWidth: "460px" }}>
              <AboutPortrait images={aboutImages} />
            </div>
          )}

          {/* Bio */}
          <div className={`reveal reveal-delay-2 ${aboutImages.length === 0 ? "lg:col-span-2" : ""}`}>

            {/* Tagline */}
            <p
              className="mb-8 leading-relaxed"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
                fontWeight: 300,
                color: "#c8c0b4",
                fontStyle: "italic",
                lineHeight: 1.45,
              }}
            >
              "I work across genres because the frame doesn&apos;t care about categories."
            </p>

            <div
              className="space-y-5 text-sm leading-[2]"
              style={{ color: "#7a7570", fontFamily: "var(--font-body)" }}
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
                In college, I joined <em style={{ color: "#c8c0b4" }}>Confluenz</em> — GGSIPU&apos;s
                student photography collective — and spent a year covering everything from intimate
                portrait sessions to concert pits. That year compressed what might have taken five.
              </p>
              <p>
                Currently based in Delhi. Open to work across India and beyond.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-8 mt-8">
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
                style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}
              >
                Commission a shoot →
              </Link>
            </div>
          </div>
        </div>

        {/* ── NOTABLE WORK ── */}
        <div
          className="px-6 md:px-14 py-14 md:py-20"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="reveal text-[10px] tracking-[0.5em] uppercase mb-10"
            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
          >
            Notable shoots
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NOTABLE.map((n, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.5rem 1.75rem",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <p
                  className="text-[9px] tracking-[0.4em] uppercase mb-3"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
                >
                  {n.type}
                </p>
                <h3
                  className="font-light mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                    lineHeight: 1,
                  }}
                >
                  {n.artist}
                </h3>
                <p
                  className="text-[11px] tracking-wider"
                  style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}
                >
                  {n.venue} — {n.location}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS + GEAR — horizontal strip ── */}
        <div
          className="px-6 md:px-14 py-14 md:py-20"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-light mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {stat.num}
                </p>
                <p
                  className="text-[10px] tracking-widest uppercase"
                  style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Gear */}
          <div
            className="reveal pt-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-5"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
            >
              Gear
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {GEAR.map((g, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <span
                    className="text-[9px] tracking-[0.25em] uppercase"
                    style={{ color: "#5a5a5a", fontFamily: "var(--font-body)", minWidth: "32px" }}
                  >
                    {g.kind}
                  </span>
                  <span
                    style={{ color: "#b8b0a8", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}
                  >
                    {g.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
