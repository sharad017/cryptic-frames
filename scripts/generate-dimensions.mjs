/**
 * generate-dimensions.mjs
 * Reads image dimensions from manifest and saves to public/images/dimensions.json
 * Used by MasonryGrid to balance column heights properly
 * Usage: node scripts/generate-dimensions.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "../public/images");
const DIM_FILE = path.join(PUBLIC, "dimensions.json");

let sharp;
try { sharp = (await import("sharp")).default; }
catch { console.error("❌ Sharp not installed."); process.exit(1); }

const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, "manifest.json"), "utf-8"));

let dims = {};
try { dims = JSON.parse(fs.readFileSync(DIM_FILE, "utf-8")); } catch {}

let generated = 0, skipped = 0, failed = 0;

for (const category of Object.keys(manifest)) {
  for (const filename of manifest[category]) {
    const key = `${category}/${filename}`;
    if (dims[key]) { skipped++; continue; }

    const imgPath = path.join(PUBLIC, category, filename);
    if (!fs.existsSync(imgPath)) continue;

    try {
      const meta = await sharp(imgPath).metadata();
      if (meta.width && meta.height) {
        dims[key] = parseFloat((meta.width / meta.height).toFixed(4));
        generated++;
        process.stdout.write(`  ${key}: ${meta.width}x${meta.height} (${dims[key]})\n`);
      }
    } catch {
      failed++;
    }

    // Save after every image
    fs.writeFileSync(DIM_FILE, JSON.stringify(dims, null, 2));
  }
}

console.log(`\n✅ Done. ${generated} generated, ${skipped} skipped, ${failed} failed.`);
console.log(`📄 Saved to public/images/dimensions.json`);
