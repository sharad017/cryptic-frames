import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "../public/images");
const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product", "about"];
const MAX_WIDTH = 2800;   // slightly wider for large monitors
const QUALITY = 93;       // high quality — portfolio grade
const SKIP_MB = 0.8;      // only skip truly tiny files under 800KB

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("❌ Sharp not installed. Run: npm install sharp");
  process.exit(1);
}

let total = 0, compressed = 0, skipped = 0, failed = 0;

for (const cat of CATEGORIES) {
  const dir = path.join(imagesDir, cat);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (files.length === 0) continue;

  console.log(`\n📁 ${cat} (${files.length} images)`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
    total++;

    if (stat.size < SKIP_MB * 1024 * 1024) {
      console.log(`  ✓ ${file} (${sizeMB}MB) — already small, skipped`);
      skipped++;
      continue;
    }

    try {
      const inputBuffer = fs.readFileSync(filePath);
      const img = sharp(inputBuffer);
      const meta = await img.metadata();
      const needsResize = (meta.width || 0) > MAX_WIDTH;

      const outBuffer = await img
        .resize(needsResize ? { width: MAX_WIDTH, withoutEnlargement: true } : undefined)
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .keepMetadata()
        .toBuffer();

      const newSizeMB = (outBuffer.length / 1024 / 1024).toFixed(1);

      const cleanName = file
        .replace(/\s*\(\d+\)\s*/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .replace(/\.(jpg|jpeg|png|webp)$/i, ".jpg");

      const outPath = path.join(dir, cleanName);
      fs.writeFileSync(outPath, outBuffer);

      if (cleanName !== file && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.log(`  ✓ ${file} → ${cleanName}: ${sizeMB}MB → ${newSizeMB}MB`);
      compressed++;
    } catch (err) {
      console.log(`  ✗ ${file}: failed — ${err.message}`);
      failed++;
    }
  }
}

console.log(`\n✅ Done — ${compressed} compressed, ${skipped} skipped, ${failed} failed, ${total} total`);
console.log("\nNow run: npm run generate-manifest");
