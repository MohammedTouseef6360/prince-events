import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedWrite } from "@/lib/session";
import sharp from "sharp";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_DIMENSION = 8000;
const RESIZE_WIDTH = 900;

export async function POST(request: NextRequest) {
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, or WebP images are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds the 5 MB size limit" },
        { status: 400 }
      );
    }

    let output: Buffer;
    let width = 0;
    let height = 0;
    try {
      const resized = await sharp(buffer)
        .rotate()
        .resize({ width: RESIZE_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
      output = resized.data;
      width = resized.info.width;
      height = resized.info.height;
    } catch {
      return NextResponse.json(
        { error: "File is not a valid image" },
        { status: 400 }
      );
    }

    if (width <= 0 || height <= 0) {
      return NextResponse.json(
        { error: "Could not read image dimensions" },
        { status: 400 }
      );
    }

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      return NextResponse.json(
        { error: `Image must be ${MAX_DIMENSION}px or smaller on each side` },
        { status: 400 }
      );
    }

    const base64 = output.toString("base64");
    const dataUri = `data:image/webp;base64,${base64}`;

    return NextResponse.json({ url: dataUri, success: true, width, height });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
