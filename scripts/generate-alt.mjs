/**
 * generate-alt.mjs
 * Generates alt text from category + filename. No API needed.
 * Usage: node scripts/generate-alt.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "../public/images");
const ALT_FILE = path.join(PUBLIC, "alt.json");

const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, "manifest.json"), "utf-8"));

// Load existing alt text so re-runs only process new images
let alt = {};
try { alt = JSON.parse(fs.readFileSync(ALT_FILE, "utf-8")); } catch {}

const CATEGORY_LABELS = {
  concert:  "Concert photography",
  wildlife: "Wildlife photography",
  travel:   "Travel photography",
  event:    "Event photography",
  portrait: "Portrait photography",
  street:   "Street photography",
  product:  "Product photography",
  featured: "Photography",
};

let generated = 0;
let skipped = 0;

for (const category of Object.keys(manifest)) {
  for (const filename of manifest[category]) {
    const key = `${category}/${filename}`;
    if (alt[key]) { skipped++; continue; }

    const label = CATEGORY_LABELS[category] || "Photography";
    alt[key] = `${label} by Sharad Rajput`;
    generated++;
  }
}

fs.writeFileSync(ALT_FILE, JSON.stringify(alt, null, 2));

console.log(`✅ Done. ${generated} generated, ${skipped} already existed.`);
console.log(`📄 Saved to public/images/alt.json`);
console.log(`\nNext: git add public/images/alt.json && git commit -m "add alt text for all gallery images" && git push`);
