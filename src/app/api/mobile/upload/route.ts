import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";

// The mobile upload endpoint re-uses the existing OCR pipeline by forwarding
// the image to /api/ocr and then /api/receipts — keeping all the intelligence
// in one place without duplicating logic.
export async function POST(req: NextRequest) {
  const user = getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const base = req.nextUrl.origin;

    // 1. Run OCR
    const ocrForm = new FormData();
    ocrForm.append("file", file);
    const ocrRes = await fetch(`${base}/api/ocr`, {
      method: "POST",
      headers: { Authorization: req.headers.get("authorization") ?? "" },
      body: ocrForm,
    });

    if (!ocrRes.ok) {
      const err = await ocrRes.json().catch(() => ({}));
      return NextResponse.json({ error: err.error ?? "OCR failed" }, { status: ocrRes.status });
    }

    const ocrData = await ocrRes.json();

    // 2. Save receipt (reuse existing receipts route)
    const receiptRes = await fetch(`${base}/api/receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") ?? "",
      },
      body: JSON.stringify({
        storeName:   ocrData.store_name,
        storeChain:  ocrData.store_chain,
        receiptDate: ocrData.receipt_date,
        totalAmount: ocrData.total_amount,
        currency:    ocrData.currency ?? "USD",
        source:      "lambda_ocr",
        items:       ocrData.items ?? [],
        rawOcrText:  ocrData.raw_text ?? "",
      }),
    });

    if (!receiptRes.ok) {
      const err = await receiptRes.json().catch(() => ({}));
      // 409 = duplicate — still return the existing receipt ID
      if (receiptRes.status === 409 && err.existingId) {
        return NextResponse.json({ receiptId: err.existingId, duplicate: true });
      }
      return NextResponse.json({ error: err.error ?? "Save failed" }, { status: receiptRes.status });
    }

    const saved = await receiptRes.json();
    return NextResponse.json({ receiptId: saved.id });
  } catch (e) {
    console.error("[mobile/upload]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
