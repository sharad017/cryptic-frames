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
import Footer from "./components/Footer";

const CATEGORIES = [
  { slug: "concert",  label: "Concert",  desc: "The raw energy of live music" },
  { slug: "wildlife", label: "Wildlife",  desc: "Nature in its purest form" },
  { slug: "travel",   label: "Travel",    desc: "Worlds waiting to be seen" },
  { slug: "event",    label: "Event",     desc: "Moments worth remembering" },
  { slug: "portrait", label: "Portrait",  desc: "Faces. Stories. Silence." },
  { slug: "street",   label: "Street",    desc: "Life between the lines" },
];

function getManifest(): Record<string, string[]> {
  try {
    const p = path.join(process.cwd(), "public/images/manifest.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch { return {}; }
}

function getImages(folder: string): string[] {
  return getManifest()[folder] || [];
}

export default function Home() {
  const featuredImgs = getImages("featured").map((f) => `/images/featured/${f}`);
  const heroImages = ["/images/hero.jpg", ...featuredImgs].slice(0, 6);

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
          background: "linear-gradient(to bottom, rgba(6,6,6,0.2) 0%, transparent 30%, transparent 48%, rgba(6,6,6,0.72) 78%, var(--bg) 100%)"
        }} />
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{
          background: "linear-gradient(to right, rgba(6,6,6,0.55) 0%, transparent 50%)"
        }} />
        <HeroText />
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── QUICK PITCH ── */}
      <PitchSection />

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
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            {totalFrames} frames · {categories.filter(c => c.count > 0).length} genres
          </p>
        </div>

        <CategoryGrid categories={categories} />
      </section>



      {/* ── ABOUT ── */}
      <section id="about" className="px-5 md:px-12 py-20 md:py-28" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 md:gap-20 items-start max-w-6xl">
          <div>
            <div className="reveal">
              <p className="text-[10px] tracking-[0.5em] uppercase mb-4"
                style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>The Photographer</p>
              <h2 className="font-light leading-[0.92] mb-8"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5.5rem)" }}>
                Sharad<br /><em>Rajput</em>
              </h2>
              {/* About photo — add a photo of yourself named about.jpg to public/images/ */}
              <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "4/5", maxWidth: "280px", background: "#0d0d0d", border: "1px solid var(--border)" }}>
                <img src="/images/about.jpg" alt="Sharad Rajput"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="reveal reveal-delay-2 mt-10">
              <div className="h-px w-full mb-8"
                style={{ background: "linear-gradient(to right, var(--accent), transparent)" }} />
              <div className="grid grid-cols-2 gap-6">
                {[
                  { num: "6+",  label: "Genres" },
                  { num: "Delhi", label: "Based in" },
                  { num: "2023", label: "Turned professional" },
                  { num: "∞",   label: "Frames remaining" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-light mb-1"
                      style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "var(--accent)" }}>
                      {stat.num}
                    </p>
                    <p className="text-[10px] tracking-widest uppercase leading-snug"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal reveal-delay-2 space-y-6 text-sm leading-[2]"
            style={{ color: "#7a7570", fontFamily: "var(--font-body)" }}>
            <p className="text-base leading-relaxed" style={{ color: "var(--fg)", lineHeight: "1.85" }}>
              Photography found me before I found it. Handed a phone at a family function as a child, I composed frames without knowing what composition was. Something about the instinct was always there.
            </p>
            <p>
              The craft came later — slowly, then all at once. Self-taught through obsessive consumption: studying light, dissecting edits, analyzing why one frame works and another doesn't. No formal training. Just relentless attention.
            </p>
            <p>
              In college, I joined <em style={{ color: "#c8c0b4" }}>Confluenz</em> — one of Delhi's active student photography collectives — and spent a year covering everything from intimate portraits to high-energy concert pits. That year compressed what might have taken five.
            </p>
            <p style={{ color: "#9a9590" }}>
              I work across genres because the frame doesn't care about categories. A wildlife blind and a concert barricade demand the same thing: presence, patience, and the ability to read a moment before it happens.
            </p>
            <p>
              Currently based in Delhi. Open to work across India and beyond.
            </p>
            <div className="pt-2 flex items-center gap-8">
              <a href="https://instagram.com/cryptic.frames" target="_blank" rel="noopener noreferrer"
                className="text-[10px] tracking-[0.4em] uppercase pb-px hover:opacity-70 transition-opacity"
                style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent)", fontFamily: "var(--font-body)" }}>
                Instagram ↗
              </a>
              <a href="#contact"
                className="text-[10px] tracking-[0.4em] uppercase transition-colors hover:text-white"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                Commission a shoot →
              </a>
            </div>
          </div>
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
