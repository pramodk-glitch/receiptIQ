import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractReceiptFromImage, getMediaType } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageBase64, mediaType } = await request.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json(
        { error: "imageBase64 and mediaType are required" },
        { status: 400 }
      );
    }

    const validType = getMediaType(mediaType);
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const result = await extractReceiptFromImage(imageBuffer, validType);

    return NextResponse.json(result);
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
