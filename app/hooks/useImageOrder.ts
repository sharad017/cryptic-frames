"use client";

// Reads order.json (custom order) first, falls back to manifest.json (alphabetical)
// order.json is ONLY written by admin — never touched by build scripts
export async function fetchOrderedImages(category: string): Promise<string[]> {
  try {
    const [orderRes, manifestRes] = await Promise.all([
      fetch("/images/order.json?t=" + Date.now()),
      fetch("/images/manifest.json?t=" + Date.now()),
    ]);
    const order = await orderRes.json();
    const manifest = await manifestRes.json();

    const allFiles: string[] = manifest[category] || [];
    const savedOrder: string[] = order[category] || [];

    if (savedOrder.length === 0) return allFiles;

    // Apply saved order: keep only files that still exist on disk
    const ordered = savedOrder.filter((f: string) => allFiles.includes(f));
    // Append any new files not yet in order
    for (const f of allFiles) {
      if (!ordered.includes(f)) ordered.push(f);
    }
    return ordered;
  } catch {
    return [];
  }
}

// Legacy export kept for compatibility
export function getOrderedImages(category: string, serverImages: string[]): string[] {
  return serverImages;
}
