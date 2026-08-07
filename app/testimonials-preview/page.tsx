import fs from "fs";
import path from "path";
import TestimonialsSection, { Testimonial } from "@/app/components/TestimonialsSection";

// This page is intentionally NOT linked in the nav or anywhere on the site.
// It exists only so you can preview the testimonials section by visiting
// the URL directly (e.g. yoursite.com/testimonials-preview).
// It reads the same public/images/testimonials.json file the admin panel
// writes to, so this always mirrors exactly what would show on the homepage —
// only entries marked "published" in admin render here too.

function getTestimonials(): Testimonial[] {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public/images/testimonials.json"), "utf-8")
    );
  } catch {
    return [];
  }
}

export default function TestimonialsPreviewPage() {
  const testimonials = getTestimonials();

  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-red-400/70">
          Preview only — not linked anywhere on the live site
        </p>
      </div>
      <TestimonialsSection testimonials={testimonials} />
    </main>
  );
}
