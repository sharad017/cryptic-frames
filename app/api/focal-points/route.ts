import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FOCAL_PATH = path.join(process.cwd(), "public", "images", "focal-points.json");

function loadFocal() {
  try { return JSON.parse(fs.readFileSync(FOCAL_PATH, "utf-8")); }
  catch { return {}; }
}

export async function GET() {
  return Response.json(loadFocal());
}

export async function POST(request: NextRequest) {
  try {
    const { key, desktop, mobile } = await request.json();
    const focal = loadFocal();
    focal[key] = { desktop, mobile };
    fs.writeFileSync(FOCAL_PATH, JSON.stringify(focal, null, 2));
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
