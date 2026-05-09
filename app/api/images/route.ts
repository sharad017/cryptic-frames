import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) return Response.json([]);

  // Try reading from manifest first (works on Vercel)
  try {
    const manifestPath = path.join(process.cwd(), "public", "images", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      return Response.json(manifest[category] || []);
    }
  } catch {}

  // Fallback: read filesystem directly (works locally)
  try {
    const dir = path.join(process.cwd(), "public", "images", category);
    const files = fs.readdirSync(dir).filter((f) =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );
    return Response.json(files);
  } catch {
    return Response.json([]);
  }
}
