import type { MetadataRoute } from "next";

const BASE_URL = "https://cryptic-frames.vercel.app";

// Keep in sync with the visible categories in app/page.tsx
const CATEGORIES = ["concert", "wildlife", "travel", "event", "portrait", "street"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...CATEGORIES.map((category) => ({
      url: `${BASE_URL}/gallery/${category}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
