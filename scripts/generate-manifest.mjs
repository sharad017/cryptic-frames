import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "../public/images");
const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product", "about"];

// manifest.json = file discovery only (alphabetical, always regenerated)
// order.json = custom order (NEVER touched by this script)
const manifest = {};
for (const cat of CATEGORIES) {
  const dir = path.join(imagesDir, cat);
  try {
    manifest[cat] = fs.readdirSync(dir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
  } catch { manifest[cat] = []; }
}

fs.writeFileSync(
  path.join(imagesDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log("✅ manifest.json generated");
for (const cat of CATEGORIES) {
  console.log(`  ${cat}: ${manifest[cat].length} files`);
}
