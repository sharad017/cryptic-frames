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

async function getFileContent(filepath: string): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filepath}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "cryptic-frames" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
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

// GET — verify credentials
export async function GET() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return Response.json({ ok: false, error: "Missing env vars", vars: { token: !!GITHUB_TOKEN, owner: GITHUB_OWNER, repo: GITHUB_REPO } });
  }
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "cryptic-frames" } }
  );
  const data = await res.json();
  if (!res.ok) return Response.json({ ok: false, error: data.message });
  return Response.json({ ok: true, repo: data.full_name });
}

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return Response.json({ error: "Missing env vars in Vercel settings" }, { status: 500 });
    }

    const body = await request.json();
    const { type } = body;

    // ── REORDER: saves to order.json only (never touched by build) ──
    if (type === "reorder") {
      const { category, data } = body;
      const raw = await getFileContent("public/images/order.json");
      const order = raw ? JSON.parse(raw) : {};
      order[category] = data;
      await commitFile("public/images/order.json", JSON.stringify(order, null, 2), `admin: reorder ${category}`);
      return Response.json({ success: true });
    }

    // ── FOCAL POINT: saves to focal-points.json ──
    if (type === "focal") {
      const { data } = body;
      const raw = await getFileContent("public/images/focal-points.json");
      const focal = raw ? JSON.parse(raw) : {};
      focal[data.key] = {
        desktop: data.desktop,
        mobile: data.mobile,
        mobileZoom: data.mobileZoom || 1,
        desktopZoom: data.desktopZoom || 1,
      };
      await commitFile("public/images/focal-points.json", JSON.stringify(focal, null, 2), `admin: focal ${data.key}`);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
