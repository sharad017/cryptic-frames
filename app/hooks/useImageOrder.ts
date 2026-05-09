"use client";
const STORAGE_KEY = "cf_image_order";

export function getOrderedImages(category: string, serverImages: string[]): string[] {
  if (typeof window === "undefined") return serverImages;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const savedOrder: string[] = saved[category] || [];
    if (savedOrder.length === 0) return serverImages;
    // Keep saved order, filter out deleted, append new
    const ordered = savedOrder.filter((img: string) => serverImages.includes(img));
    for (const img of serverImages) {
      if (!ordered.includes(img)) ordered.push(img);
    }
    return ordered;
  } catch {
    return serverImages;
  }
}
