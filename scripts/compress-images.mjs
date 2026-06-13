import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "../public/images");
const CATEGORIES = ["featured", "concert", "wildlife", "travel", "event", "portrait", "street", "product", "about"];
const MAX_WIDTH = 2500;
const QUALITY = 85;

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
    // Use Buffer to read file — avoids all path/special character issues on Windows
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
    total++;

    if (stat.size < 1.5 * 1024 * 1024) {
      console.log(`  ✓ ${file} (${sizeMB}MB) — already small, skipped`);
      skipped++;
      continue;
    }

    try {
      // Read into buffer first — bypasses Windows path issues with special chars
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

      // Always save as .jpg, clean up special chars in filename
      const cleanName = file
        .replace(/\s*\(\d+\)\s*/g, "")   // remove (1), (2) etc
        .replace(/\s+/g, "_")             // spaces to underscores
        .replace(/[^a-zA-Z0-9._-]/g, "") // remove other special chars
        .replace(/\.(jpg|jpeg|png|webp)$/i, ".jpg");

      const outPath = path.join(dir, cleanName);

      fs.writeFileSync(outPath, outBuffer);

      // Remove original if filename changed
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
