import fs from "fs";
import path from "path";
import Link from "next/link";
import Navbar from "./components/Navbar";
import ScrollReveal from "./components/ScrollReveal";
import ContactForm from "./components/ContactForm";
import Marquee from "./components/Marquee";
import CustomCursor from "./components/CustomCursor";
import HeroSlideshow from "./components/HeroSlideshow";
import CategoryGrid from "./components/CategoryGrid";
import HeroText from "./components/HeroText";
import PitchSection from "./components/PitchSection";
import CategoryStrip from "./components/CategoryStrip";
import Footer from "./components/Footer";

const CATEGORIES = [
  { slug: "concert",  label: "Concert",  desc: "The raw energy of live music" },
  { slug: "wildlife", label: "Wildlife",  desc: "Nature in its purest form" },
  { slug: "travel",   label: "Travel",    desc: "Worlds waiting to be seen" },
  { slug: "event",    label: "Event",     desc: "Moments worth remembering" },
  { slug: "portrait", label: "Portrait",  desc: "Faces. Stories. Silence." },
  { slug: "street",   label: "Street",    desc: "Life between the lines" },
  // product hidden until gallery is built out
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

function getImages(folder: string): string[] {
  const all = getManifest()[folder] || [];
  const saved = getOrder()[folder] || [];
  if (saved.length === 0) return all;
  const ordered = saved.filter((f: string) => all.includes(f));
  for (const f of all) { if (!ordered.includes(f)) ordered.push(f); }
  return ordered;
}

export default function Home() {
  const featuredImgs = getImages("featured").map((f) => `/images/featured/${f}`);
  const heroImages = featuredImgs.length > 0 ? featuredImgs.slice(0, 6) : ["/images/hero.jpg"];

  const categories = CATEGORIES.map((cat) => {
    const imgs = getImages(cat.slug);
    return { ...cat, preview: imgs[0] ? `/images/${cat.slug}/${imgs[0]}` : null, count: imgs.length };
  });

  const totalFrames = categories.reduce((a, c) => a + c.count, 0);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <CustomCursor />
      <Navbar />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        <HeroSlideshow images={heroImages} />
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{
          background: "linear-gradient(to bottom, rgba(6,6,6,0.15) 0%, transparent 25%, transparent 50%, rgba(6,6,6,0.65) 75%, var(--bg) 100%)"
        }} />
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{
          background: "linear-gradient(to right, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.75) 25%, rgba(6,6,6,0.45) 45%, rgba(6,6,6,0.1) 60%, transparent 75%)"
        }} />
        <HeroText />
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="px-5 md:px-12 py-20 md:py-28">
        <div className="reveal flex items-end justify-between mb-12 md:mb-16">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase mb-3"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Browse</p>
            <h2 className="font-light leading-none"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem,6vw,5.5rem)" }}>
              The Work
            </h2>
          </div>
          <p className="text-[10px] hidden md:block tracking-widest"
            style={{ color: "#6a6a6a", fontFamily: "var(--font-body)" }}>
            {totalFrames} frames · {categories.filter(c => c.count > 0).length} genres
          </p>
        </div>

        <CategoryGrid categories={categories} />
      </section>

      {/* ── ABOUT (teaser) ── */}
      <section id="about" className="px-5 md:px-12 py-20 md:py-28" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="reveal max-w-3xl">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-4"
            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>The Photographer</p>
          <h2 className="font-light leading-[0.95] mb-6"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
            Sharad <em>Rajput</em>
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#c8c0b4", maxWidth: "560px", lineHeight: "1.85" }}>
            Delhi-based, self-taught, working across six genres — from concert pits to quiet wildlife blinds. Member of Confluenz, GGSIPU&apos;s student photography collective.
          </p>
          <Link href="/about"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase pb-px hover:opacity-70 transition-opacity"
            style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)", fontFamily: "var(--font-body)" }}>
            Read the full story →
          </Link>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="px-5 md:px-12 py-20 md:py-28" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-2xl">
          <div className="reveal mb-12">
            <p className="text-[10px] tracking-[0.5em] uppercase mb-4"
              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Contact</p>
            <h2 className="font-light leading-[0.92] mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>
              Let's make<br />something real
            </h2>
            <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              Concerts, portraits, events, fashion, travel. Open to commissions and collaborations.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
