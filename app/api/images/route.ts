import fs from "fs";
import path from "path";

export async function GET(request: Request) {

  const { searchParams } =
    new URL(request.url);

  const category =
    searchParams.get("category");

  if (!category) {
    return Response.json([]);
  }

  const imagesDirectory = path.join(
    process.cwd(),
    "public/images",
    category
  );

  let images: string[] = [];

  try {
    images = fs.readdirSync(imagesDirectory);
  } catch {
    images = [];
  }

  return Response.json(images);
}