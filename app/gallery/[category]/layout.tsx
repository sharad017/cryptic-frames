import fs from "fs";
import path from "path";
import type { Metadata } from "next";

const LABELS: Record<string, string> = {
  concert: "Concert Photography",
  wildlife: "Wildlife Photography",
  travel: "Travel Photography",
  event: "Event Photography",
  portrait: "Portrait Photography",
  street: "Street Photography",
};

const DESCRIPTIONS: Record<string, string> = {
  concert: "Concert and live music photography by Sharad Rajput — raw energy, stage lighting, and the pulse of live performance.",
  wildlife: "Wildlife photography by Sharad Rajput — birds, mammals, and nature captured across Delhi/NCR's parks and reserves.",
  travel: "Travel photography by Sharad Rajput — places, light, and moments from journeys across India.",
  event: "Event photography by Sharad Rajput — college festivals, cultural events, and candid moments worth remembering.",
  portrait: "Portrait photography by Sharad Rajput — faces, stories, and quiet character studies.",
  street: "Street photography by Sharad Rajput — life, motion, and Delhi's everyday rhythm.",
};

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

function getFirstImage(category: string): string | null {
  const all = getManifest()[category] || [];
  const saved = getOrder()[category] || [];
  const fromOrder = saved.find((f) => all.includes(f));
  return fromOrder || all[0] || null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;

  const label = LABELS[category]
    || `${category.charAt(0).toUpperCase()}${category.slice(1)} Photography`;
  const description = DESCRIPTIONS[category]
    || `${label} by Sharad Rajput — part of the cryptic.frames portfolio.`;

  const firstImage = getFirstImage(category);
  const ogImage = firstImage ? `/images/${category}/${firstImage}` : "/images/hero.jpg";

  const title = `${label} — cryptic.frames`;

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
