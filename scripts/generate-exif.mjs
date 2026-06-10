/**
 * generate-exif.mjs
 * Extracts EXIF data (camera, lens, focal length, aperture, shutter, ISO, GPS)
 * from all images in manifest.json and saves to public/images/exif.json
 *
 * Usage:
 *   node scripts/generate-exif.mjs
 *
 * First run: npm install exifr --save-dev
 * Add to package.json scripts:
 *   "generate-exif": "node scripts/generate-exif.mjs"
 *
 * Safe to re-run — skips images that already have EXIF data extracted.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import exifr from "exifr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "../public/images");
const EXIF_FILE = path.join(PUBLIC, "exif.json");

const manifest = JSON.parse(
  fs.readFileSync(path.join(PUBLIC, "manifest.json"), "utf-8")
);

// Load existing EXIF so re-runs only process new images
let exifData = {};
try { exifData = JSON.parse(fs.readFileSync(EXIF_FILE, "utf-8")); } catch {}

function formatShutter(val) {
  if (!val) return null;
  if (val >= 1) return `${Math.round(val)}s`;
  const denom = Math.round(1 / val);
  return `1/${denom}s`;
}

function formatGPS(lat, lon) {
  if (!lat || !lon) return null;
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

let generated = 0;
let skipped = 0;
let noExif = 0;

for (const category of Object.keys(manifest)) {
  for (const filename of manifest[category]) {
    const key = `${category}/${filename}`;
    if (exifData[key]) { skipped++; continue; }

    const imgPath = path.join(PUBLIC, category, filename);
    if (!fs.existsSync(imgPath)) continue;

    process.stdout.write(`  Reading: ${key} ... `);

    try {
      const raw = await exifr.parse(imgPath, {
        tiff: true,
        exif: true,
        gps: true,
        xmp: false,
        icc: false,
        iptc: false,
      });

      if (!raw) {
        exifData[key] = {};
        noExif++;
        console.log("(no EXIF)");
        continue;
      }

      const entry = {};

      // Camera body
      if (raw.Make && raw.Model) {
        const make = raw.Make.trim();
        const model = raw.Model.trim();
        // Avoid duplicating brand name (e.g. "Sony SONY A7III" → "Sony A7III")
        entry.camera = model.toLowerCase().startsWith(make.toLowerCase())
          ? model
          : `${make} ${model}`;
      }

      // Lens
      if (raw.LensModel) entry.lens = raw.LensModel.trim();
      else if (raw.LensInfo) {
        const [fMin, fMax] = raw.LensInfo;
        if (fMin && fMax) entry.lens = fMin === fMax ? `${fMin}mm` : `${fMin}–${fMax}mm`;
      }

      // Focal length
      if (raw.FocalLength) entry.focalLength = `${Math.round(raw.FocalLength)}mm`;

      // Aperture
      if (raw.FNumber) entry.aperture = `f/${raw.FNumber}`;

      // Shutter speed
      if (raw.ExposureTime) entry.shutter = formatShutter(raw.ExposureTime);

      // ISO
      if (raw.ISO) entry.iso = `ISO ${raw.ISO}`;

      // GPS
      const gps = formatGPS(raw.latitude, raw.longitude);
      if (gps) entry.gps = gps;

      exifData[key] = entry;
      generated++;

      const parts = [entry.camera, entry.lens, entry.focalLength, entry.aperture, entry.shutter, entry.iso]
        .filter(Boolean).join(" · ");
      console.log(parts || "(no readable EXIF fields)");

    } catch (err) {
      exifData[key] = {};
      noExif++;
      console.log(`(error: ${err.message})`);
    }

    // Save after every image so progress is never lost
    fs.writeFileSync(EXIF_FILE, JSON.stringify(exifData, null, 2));
  }
}

fs.writeFileSync(EXIF_FILE, JSON.stringify(exifData, null, 2));

console.log("\n─────────────────────────────────────────");
console.log(`✅  Done. ${generated} with EXIF, ${noExif} without, ${skipped} skipped.`);
console.log(`📄  Saved to public/images/exif.json`);
console.log(`\nNext steps:`);
console.log(`  git add public/images/exif.json`);
console.log(`  git commit -m "add EXIF data for gallery images"`);
console.log(`  git push`);
