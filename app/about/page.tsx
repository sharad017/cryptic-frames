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
  description: "Sharad Rajput is a Delhi-based, self-taught photographer working across concert, wildlife, travel, portrait, street, and event photography.",
  openGraph: {
    title: "About — cryptic.frames",
    description: "Delhi-based, self-taught. Six genres. From concert pits to wildlife blinds.",
    images: ["/images/about/about_image_.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Sharad Rajput — cryptic.frames",
    description: "Self-taught photographer based in Delhi. Six genres — concert, wildlife, travel, portrait, street, event.",
    images: ["/images/about/about_image_.jpg"],
  },
};



type AboutContent = {
  bio1: string; bio2: string; bio3: string;
  stat1num: string; stat1label: string;
  stat2num: string; stat2label: string;
  stat3num: string; stat3label: string;
  stat4num: string; stat4label: string;
  notable1artist: string; notable1venue: string;
  notable2artist: string; notable2venue: string;
  gear1kind: string; gear1item: string;
  gear2kind: string; gear2item: string;
};

const DEFAULT_CONTENT: AboutContent = {
  bio1: "Self-taught. Six genres. Drawn to moments that exist for a fraction of a second — whether that's a peacock mid-display or a guitarist lost in the set.",
  bio2: "In college, I joined Confluenz — GGSIPU's student photography collective — and spent a year covering everything from intimate portrait sessions to high-energy concert pits. That year compressed what might have taken five.",
  bio3: "{c.bio3}",
  stat1num: "6", stat1label: "Genres",
  stat2num: "2023", stat2label: "Since",
  stat3num: "Delhi", stat3label: "Based in",
  stat4num: "∞", stat4label: "Frames left",
  notable1artist: "Silver Lining", notable1venue: "Piano Man Jazz Club, Gurgaon",
  notable2artist: "Desmadre Orchestra", notable2venue: "Piano Man, Eldeco Centre, Malviya Nagar",
  gear1kind: "Body", gear1item: "Sony A6600",
  gear2kind: "Lens", gear2item: "Sony E PZ 18-105mm F4 G OSS",
};

function getAboutContent(): AboutContent {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "public/images/about-content.json"), "utf-8");
    return { ...DEFAULT_CONTENT, ...JSON.parse(raw) };
  } catch { return DEFAULT_CONTENT; }
}

function getManifest(): Record<string, string[]> {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/images/manifest.json"), "utf-8")); }
  catch { return {}; }
}

function getOrder(): Record<string, string[]> {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/images/order.json"), "utf-8")); }
  catch { return {}; }
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
  const c = getAboutContent();

  return (
    <PageTransition>
      <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <CustomCursor />
        <Navbar />
        <ScrollReveal />

        <section className="px-6 md:px-14 pt-28 md:pt-36 pb-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start max-w-6xl">

            {/* LEFT — photo, no cropping */}
            {aboutImages.length > 0 && (
              <div className="reveal order-1">
                <AboutPortrait images={aboutImages} />
              </div>
            )}

            {/* RIGHT — all info stacked */}
            <div className={`order-2 ${aboutImages.length === 0 ? "lg:col-span-2" : ""}`}>

              {/* Eyebrow + Name */}
              <div className="reveal mb-8">
                <p className="text-[10px] tracking-[0.5em] uppercase mb-4"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                  The Photographer
                </p>
                <h1 className="font-light leading-[0.9]"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5.5rem)" }}>
                  Sharad<br /><em>Rajput</em>
                </h1>
              </div>

              {/* Gold line */}
              <div className="reveal mb-8"
                style={{ width: "clamp(2rem, 4vw, 3rem)", height: "1px", background: "var(--accent)" }} />

              {/* Bio */}
              <div className="reveal reveal-delay-1 space-y-4 mb-10"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: "1.85", maxWidth: "480px" }}>
                <p style={{ color: "#c8c0b4" }}>
                  {c.bio1}
                </p>
                <p style={{ color: "#7a7570" }}>
                  {c.bio2}
                </p>
                <p style={{ color: "#7a7570" }}>
                  {c.bio3}
                </p>
              </div>

              {/* Stats */}
              <div className="reveal reveal-delay-1 grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-10"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
{([{num:c.stat1num,label:c.stat1label},{num:c.stat2num,label:c.stat2label},{num:c.stat3num,label:c.stat3label},{num:c.stat4num,label:c.stat4label}]).map((s) => (
                  <div key={s.label}>
                    <p className="font-light mb-1"
                      style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--accent)", lineHeight: 1 }}>
                      {s.num}
                    </p>
                    <p className="text-[10px] tracking-[0.2em] uppercase"
                      style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Notable shoots */}
              <div className="reveal reveal-delay-2 mb-10 pb-10"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[9px] tracking-[0.4em] uppercase mb-5"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                  Notable shoots
                </p>
                <div className="space-y-4">
                  {([{artist:c.notable1artist,venue:c.notable1venue},{artist:c.notable2artist,venue:c.notable2venue}]).map((n, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <span className="font-light shrink-0"
                        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: "var(--fg)" }}>
                        {n.artist}
                      </span>
                      <span className="text-[11px] tracking-wide"
                        style={{ color: "#8a8a8a", fontFamily: "var(--font-body)" }}>
                        {n.venue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gear */}
              <div className="reveal reveal-delay-2 mb-10 pb-10"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[9px] tracking-[0.4em] uppercase mb-5"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                  Gear
                </p>
                <div className="space-y-2">
                  {([{kind:c.gear1kind,item:c.gear1item},{kind:c.gear2kind,item:c.gear2item}]).map((g, i) => (
                    <div key={i} className="flex items-baseline gap-4">
                      <span className="text-[9px] tracking-[0.3em] uppercase shrink-0"
                        style={{ color: "#7a7a7a", fontFamily: "var(--font-body)", minWidth: "36px" }}>
                        {g.kind}
                      </span>
                      <span style={{ color: "#c8c0b4", fontFamily: "var(--font-body)", fontSize: "0.92rem" }}>
                        {g.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="reveal reveal-delay-2 flex flex-wrap items-center gap-8">
                <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] tracking-[0.4em] uppercase pb-px hover:opacity-70 transition-opacity"
                  style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)", fontFamily: "var(--font-body)" }}>
                  Instagram ↗
                </a>
                <Link href="/#contact"
                  className="text-[10px] tracking-[0.4em] uppercase transition-colors hover:text-white"
                  style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}>
                  Commission a shoot →
                </Link>
                <Link href="/#categories"
                  className="text-[10px] tracking-[0.4em] uppercase transition-colors hover:text-white"
                  style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}>
                  Browse the gallery →
                </Link>
              </div>
            </div>

          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
