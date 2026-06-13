import fs from "fs";
import path from "path";
import type { Metadata } from "next";
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
  { num: "6", label: "Genres" },
  { num: "Delhi", label: "Based in" },
  { num: "2023", label: "Shooting since" },
  { num: "∞", label: "Frames remaining" },
];

const GEAR = [
  { kind: "Body", item: "Sony A6600" },
  { kind: "Lens", item: "Sony E PZ 18-105mm F4 G OSS" },
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

        {/* Header */}
        <div className="px-6 md:px-14 pt-28 md:pt-36 pb-12 md:pb-16">
          {aboutImages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <p
                  className="reveal text-[10px] tracking-[0.5em] uppercase mb-3"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
                >
                  About
                </p>
                <h1
                  className="reveal font-light leading-[0.92]"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }}
                >
                  Sharad<br /><em>Rajput</em>
                </h1>
              </div>
              <div className="reveal reveal-delay-1" style={{ maxWidth: "420px" }}>
                <AboutPortrait images={aboutImages} />
              </div>
            </div>
          ) : (
            <>
              <p
                className="reveal text-[10px] tracking-[0.5em] uppercase mb-3"
                style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
              >
                About
              </p>
              <h1
                className="reveal font-light leading-[0.92]"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem, 9vw, 7.5rem)" }}
              >
                Sharad<br /><em>Rajput</em>
              </h1>
            </>
          )}
        </div>

        {/* Content */}
        <section className="px-6 md:px-14 pb-24 md:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-14 md:gap-24 max-w-5xl">

            {/* Sidebar — stats + gear */}
            <div className="reveal reveal-delay-1 order-2 lg:order-1">
              <div
                className="h-px w-full mb-8"
                style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
              />
              <div className="grid grid-cols-2 gap-6 mb-12">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <p
                      className="font-light mb-1"
                      style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "var(--accent)" }}
                    >
                      {stat.num}
                    </p>
                    <p
                      className="text-[10px] tracking-widest uppercase leading-snug"
                      style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <p
                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
              >
                Gear
              </p>
              <div className="space-y-2.5">
                {GEAR.map((g, i) => (
                  <div key={i} className="flex items-baseline gap-3">
                    <span
                      className="text-[9px] tracking-[0.25em] uppercase shrink-0"
                      style={{ color: "#6a6a6a", fontFamily: "var(--font-body)", width: "38px" }}
                    >
                      {g.kind}
                    </span>
                    <span
                      className="text-[12px]"
                      style={{ color: "#c8c0b4", fontFamily: "var(--font-body)" }}
                    >
                      {g.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div
              className="reveal reveal-delay-2 order-1 lg:order-2 space-y-6 text-sm leading-[2]"
              style={{ color: "#7a7570", fontFamily: "var(--font-body)" }}
            >
              <p className="text-base leading-relaxed" style={{ color: "var(--fg)", lineHeight: "1.85" }}>
                Photography found me before I found it. Handed a phone at a family function as a child, I composed frames without knowing what composition was. Something about the instinct was always there.
              </p>
              <p>
                The craft came later — slowly, then all at once. Self-taught through obsessive consumption: studying light, dissecting edits, analyzing why one frame works and another doesn&apos;t. No formal training. Just relentless attention.
              </p>
              <p>
                In college, I joined <em style={{ color: "#c8c0b4" }}>Confluenz</em> — one of Delhi&apos;s active student photography collectives — and spent a year covering everything from intimate portraits to high-energy concert pits. That year compressed what might have taken five.
              </p>
              <p style={{ color: "#9a9590" }}>
                I work across genres because the frame doesn&apos;t care about categories. A wildlife blind and a concert barricade demand the same thing: presence, patience, and the ability to read a moment before it happens.
              </p>
              <p>
                Currently based in Delhi. Open to work across India and beyond.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-8">
                <a
                  href="https://instagram.com/cryptic.frames"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] tracking-[0.4em] uppercase pb-px hover:opacity-70 transition-opacity"
                  style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)", fontFamily: "var(--font-body)" }}
                >
                  Instagram ↗
                </a>
                <a
                  href="/#contact"
                  className="text-[10px] tracking-[0.4em] uppercase transition-colors hover:text-white"
                  style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}
                >
                  Commission a shoot →
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
