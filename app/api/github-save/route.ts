import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;

async function getFileSha(filepath: string): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filepath}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "cryptic-frames" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

async function commitFile(filepath: string, content: string, message: string) {
  const sha = await getFileSha(filepath);
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: "main",
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filepath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "cryptic-frames",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "GitHub commit failed");
  }
  return res.json();
}

// GET — test endpoint to verify credentials work
export async function GET() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return Response.json({ ok: false, error: "Missing env variables", token: !!GITHUB_TOKEN, owner: GITHUB_OWNER, repo: GITHUB_REPO });
  }
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "cryptic-frames" } }
  );
  const data = await res.json();
  if (!res.ok) return Response.json({ ok: false, error: data.message });
  return Response.json({ ok: true, repo: data.full_name, private: data.private });
}

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return Response.json({ error: "Missing env variables — check Vercel settings" }, { status: 500 });
    }

    const { type, category, data } = await request.json();

    if (type === "reorder") {
      const manifestRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/images/manifest.json`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "cryptic-frames" } }
      );
      const manifestFile = await manifestRes.json();
      const manifest = JSON.parse(Buffer.from(manifestFile.content, "base64").toString("utf-8"));
      manifest[category] = data;
      await commitFile("public/images/manifest.json", JSON.stringify(manifest, null, 2), `admin: reorder ${category}`);
      return Response.json({ success: true });
    }

    if (type === "focal") {
      const focalRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/images/focal-points.json`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "cryptic-frames" } }
      );
      let focal: Record<string, unknown> = {};
      if (focalRes.ok) {
        const focalFile = await focalRes.json();
        focal = JSON.parse(Buffer.from(focalFile.content, "base64").toString("utf-8"));
      }
      focal[data.key] = { desktop: data.desktop, mobile: data.mobile };
      await commitFile("public/images/focal-points.json", JSON.stringify(focal, null, 2), `admin: focal point ${data.key}`);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
