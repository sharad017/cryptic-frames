import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { category, images } = await request.json() as { category: string; images: string[] };

    if (!category || !Array.isArray(images)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "images", category);
    if (!fs.existsSync(dir)) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    // Rename files to match new order: 001_originalname.jpg, 002_...
    // First pass: rename all to temp names to avoid conflicts
    const tempNames: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const oldPath = path.join(dir, images[i]);
      const tempName = `__temp_${i}_${images[i]}`;
      const tempPath = path.join(dir, tempName);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, tempPath);
        tempNames.push(tempName);
      }
    }

    // Second pass: rename temps to final padded names
    const finalNames: string[] = [];
    for (let i = 0; i < tempNames.length; i++) {
      const tempPath = path.join(dir, tempNames[i]);
      // Keep original name but prefix with order number
      const originalName = tempNames[i].replace(`__temp_${i}_`, "");
      const ext = path.extname(originalName);
      const base = path.basename(originalName, ext);
      // Clean base: remove any existing order prefix (e.g. "001_")
      const cleanBase = base.replace(/^\d+_/, "");
      const finalName = `${String(i + 1).padStart(3, "0")}_${cleanBase}${ext}`;
      const finalPath = path.join(dir, finalName);
      fs.renameSync(tempPath, finalPath);
      finalNames.push(finalName);
    }

    // Regenerate manifest
    try {
      await execAsync("node scripts/generate-manifest.mjs", {
        cwd: process.cwd(),
      });
    } catch {
      // Manually update manifest if script fails
      const manifestPath = path.join(process.cwd(), "public", "images", "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      manifest[category] = finalNames;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

    return Response.json({ success: true, images: finalNames });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
