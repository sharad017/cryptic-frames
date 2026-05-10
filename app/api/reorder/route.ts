import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { category, images } = await request.json() as { category: string; images: string[] };
    if (!category || !Array.isArray(images)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const manifestPath = path.join(process.cwd(), "public", "images", "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    manifest[category] = images;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return Response.json({ success: true, images });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
