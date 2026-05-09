import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "../public/images");
const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product"];

const manifest = {};
for (const cat of CATEGORIES) {
  const dir = path.join(imagesDir, cat);
  try {
    manifest[cat] = fs.readdirSync(dir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
  } catch {
    manifest[cat] = [];
  }
}

fs.writeFileSync(
  path.join(imagesDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);
console.log("✓ manifest.json generated");
for (const [cat, imgs] of Object.entries(manifest)) {
  if (imgs.length > 0) console.log(`  ${cat}: ${imgs.length} images`);
}
