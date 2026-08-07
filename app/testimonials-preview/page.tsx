import TestimonialsSection from "@/app/components/TestimonialsSection";

// This page is intentionally NOT linked in the nav or anywhere on the site.
// It exists only so you can preview the testimonials section by visiting
// the URL directly (e.g. yoursite.com/testimonials-preview).
// Always renders the section, regardless of whether it's enabled on the homepage.

export default function TestimonialsPreviewPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-red-400/70">
          Preview only — not linked anywhere on the live site
        </p>
      </div>
      <TestimonialsSection />
    </main>
  );
}
