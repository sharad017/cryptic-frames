import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "../public/images");
const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product"];
const manifestPath = path.join(imagesDir, "manifest.json");

// Load existing manifest to preserve custom order
let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
} catch {}

const manifest = {};
for (const cat of CATEGORIES) {
  const dir = path.join(imagesDir, cat);
  let filesOnDisk = [];
  try {
    filesOnDisk = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  } catch {}

  const existingOrder = existing[cat] || [];

  // Keep existing order for files still on disk
  const ordered = existingOrder.filter(f => filesOnDisk.includes(f));

  // Append any new files not yet in the manifest
  for (const f of filesOnDisk) {
    if (!ordered.includes(f)) ordered.push(f);
  }

  manifest[cat] = ordered;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log("✓ manifest.json generated (order preserved)");
for (const [cat, imgs] of Object.entries(manifest)) {
  if (imgs.length > 0) console.log(`  ${cat}: ${imgs.length} images`);
}
