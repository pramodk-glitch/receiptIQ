import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedUploadUrl } from "@/lib/s3";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contentType, fileName } = body;

    if (!contentType) {
      return NextResponse.json({ error: "contentType is required" }, { status: 400 });
    }

    const normalizedContentType = contentType.toLowerCase().trim();

    if (!ALLOWED_CONTENT_TYPES.includes(normalizedContentType)) {
      return NextResponse.json(
        {
          error: `Unsupported file type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let extension = EXTENSION_MAP[normalizedContentType] ?? "jpg";

    if (fileName) {
      const parts = String(fileName).split(".");
      if (parts.length > 1) {
        const fileExt = parts[parts.length - 1].toLowerCase();
        if (["jpg", "jpeg", "png", "webp", "gif", "pdf"].includes(fileExt)) {
          extension = fileExt === "jpeg" ? "jpg" : fileExt;
        }
      }
    }

    const { presignedUrl, s3Key, imageUrl } = await generatePresignedUploadUrl(
      session.user.id,
      extension,
      normalizedContentType
    );

    return NextResponse.json({ presignedUrl, s3Key, imageUrl });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
