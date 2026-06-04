import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractReceiptFromImage, extractReceiptFromUrl, identifyStore, identifyStoreFromBuffer, extractReceiptFromPdfWithPrompt, getMediaType, RECEIPT_PROMPT } from "@/lib/claude";
import { getFormatHints, saveFormatHints, buildTwoLineHint } from "@/lib/store-formats";
import type { OcrResult } from "@/lib/claude";

// Math check: does qty × unit_price ≈ line_total?
function itemMathOk(item: OcrResult["items"][number]) {
  if (item.unit_price <= 0 || item.line_total <= 0) return true; // can't validate
  return Math.abs(item.quantity * item.unit_price - item.line_total) <= 0.02;
}

function mathPassRate(result: OcrResult) {
  if (!result.items.length) return 1;
  const ok = result.items.filter(itemMathOk).length;
  return ok / result.items.length;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageBase64, imageUrl, mediaType } = await request.json();

    if (!mediaType) {
      return NextResponse.json({ error: "mediaType is required" }, { status: 400 });
    }

    // ── Base64 path ───────────────────────────────────────────────────────────
    if (!imageUrl) {
      if (!imageBase64) {
        return NextResponse.json({ error: "imageBase64 or imageUrl is required" }, { status: 400 });
      }
      const buffer = Buffer.from(imageBase64, "base64");

      if (mediaType !== "application/pdf") {
        const result = await extractReceiptFromImage(buffer, getMediaType(mediaType));
        return NextResponse.json(result);
      }

      // PDF base64: run through format registry just like the URL path
      // Step 1: identify store from the PDF bytes
      const storeName = await identifyStoreFromBuffer(buffer);
      console.log(`[OCR] PDF base64 — identified store: "${storeName}"`);

      // Step 2: look up format hints
      const formatHints = await getFormatHints(storeName);

      // Step 3: OCR with hints
      const prompt = formatHints
        ? `${formatHints}\n\n---\n\n${RECEIPT_PROMPT}`
        : RECEIPT_PROMPT;
      let result = await extractReceiptFromPdfWithPrompt(buffer, prompt);

      // Step 4: retry with two-line hint if math fails
      const passRate = mathPassRate(result);
      if (passRate < 0.6 && !formatHints && result.items.length > 0) {
        const fallbackHint = buildTwoLineHint(storeName);
        const retryResult = await extractReceiptFromPdfWithPrompt(buffer, fallbackHint + "\n\n---\n\n" + RECEIPT_PROMPT);
        if (mathPassRate(retryResult) > passRate) {
          result = retryResult;
          if (storeName !== "Unknown") await saveFormatHints(storeName, fallbackHint);
        }
      }

      if (result.items.length === 0) {
        return NextResponse.json(
          { error: "NO_ITEMS", message: "No line items found in this PDF. Please upload the full itemised receipt.", storeName, total_amount: result.total_amount },
          { status: 422 },
        );
      }

      if (passRate >= 0.8 && storeName !== "Unknown") {
        await saveFormatHints(storeName, formatHints ?? "standard");
      }

      return NextResponse.json({ ...result, _storeName: storeName });
    }

    // ── URL path — full format-registry flow ──────────────────────────────────

    // Step 1: Identify store (lightweight pre-pass with cheap model)
    const storeName = await identifyStore(imageUrl, mediaType);
    console.log(`[OCR] Identified store: "${storeName}"`);

    // Step 2: Look up format hints for this store
    const formatHints = await getFormatHints(storeName);
    if (formatHints) {
      console.log(`[OCR] Using stored format hints for "${storeName}"`);
    }

    // Step 3: Main OCR with hints injected (if any)
    let result = await extractReceiptFromUrl(imageUrl, mediaType, formatHints ?? undefined);
    const passRate = mathPassRate(result);
    console.log(`[OCR] Math pass rate: ${Math.round(passRate * 100)}% (${result.items.length} items)`);

    // Guard: if no items found, this is likely a receipt summary/confirmation
    // screen rather than a full itemised receipt.
    if (result.items.length === 0) {
      return NextResponse.json(
        {
          error: "NO_ITEMS",
          message:
            `This image appears to be a receipt summary (store: ${storeName}, total: ${result.total_amount}). ` +
            "Please upload the full receipt image that shows the individual line items.",
          storeName,
          total_amount: result.total_amount,
        },
        { status: 422 },
      );
    }

    // Step 4: If math fails AND no hints were used, retry with generic two-line hint
    if (passRate < 0.6 && !formatHints && result.items.length > 0) {
      console.log(`[OCR] Math check failed — retrying with two-line format hint`);
      const fallbackHint = buildTwoLineHint(storeName);
      const retryResult = await extractReceiptFromUrl(imageUrl, mediaType, fallbackHint);
      const retryPassRate = mathPassRate(retryResult);
      console.log(`[OCR] Retry math pass rate: ${Math.round(retryPassRate * 100)}%`);

      if (retryPassRate > passRate) {
        result = retryResult;
        // Persist the hint so next upload from this store uses it immediately
        if (storeName !== "Unknown") {
          await saveFormatHints(storeName, fallbackHint);
          console.log(`[OCR] Saved two-line format hint for "${storeName}"`);
        }
      }
    }

    // Step 5: If math is good and this is a known store, bump sample count
    if (passRate >= 0.8 && storeName !== "Unknown") {
      // Only save if there are no pre-seeded hints already covering this store
      // (avoids overwriting curated hints with a generic success marker)
      if (!formatHints) {
        await saveFormatHints(storeName, "standard"); // marks store as seen + working
      } else {
        await saveFormatHints(storeName, formatHints); // bump sample count
      }
    }

    return NextResponse.json({ ...result, _storeName: storeName });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed";
    console.error("OCR error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
