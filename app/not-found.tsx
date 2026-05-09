import Link from "next/link";
import Navbar from "./components/Navbar";

export default function NotFound() {
  return (
    <main className="bg-[#070707] text-[#ede8e0] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs tracking-[0.5em] uppercase mb-6" style={{ color: "#c9a96e", fontFamily: "var(--font-body)" }}>
          404 — Not Found
        </p>
        <h1
          className="text-[clamp(5rem,25vw,18rem)] font-light leading-none mb-4 text-neutral-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </h1>
        <p
          className="text-neutral-500 text-sm md:text-base max-w-sm mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}
        >
          This frame doesn't exist — maybe it was never captured, or the moment has passed.
        </p>
        <Link
          href="/"
          className="px-8 py-3 text-xs tracking-[0.25em] uppercase border rounded-full transition-all duration-300 hover:bg-[#c9a96e] hover:border-[#c9a96e] hover:text-black"
          style={{ borderColor: "rgba(255,255,255,0.15)", fontFamily: "var(--font-body)" }}
        >
          Back to Home
        </Link>
      </div>
      <footer className="px-6 md:px-14 py-6 text-center">
        <p className="text-neutral-800 text-xs tracking-[0.3em]" style={{ fontFamily: "var(--font-body)" }}>© {new Date().getFullYear()} cryptic.frames</p>
      </footer>
    </main>
  );
}
