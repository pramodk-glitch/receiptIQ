import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { classifyItem } from "@/lib/product-classifier";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const skip = (page - 1) * limit;

  const [receipts, total] = await Promise.all([
    prisma.receipt.findMany({
      where: { userId: session.user.id },
      orderBy: { receiptDate: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { items: true } },
      },
    }),
    prisma.receipt.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    receipts: receipts.map((r) => ({
      id: r.id,
      storeName: r.storeName,
      storeChain: r.storeChain,
      receiptDate: r.receiptDate.toISOString(),
      totalAmount: r.totalAmount,
      currency: r.currency,
      imageUrl: r.imageUrl,
      source: r.source,
      needsReview: r.needsReview,
      createdAt: r.createdAt.toISOString(),
      itemCount: r._count.items,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      storeName,
      storeChain,
      receiptDate,
      totalAmount,
      currency = "USD",
      imageUrl,
      s3Key,
      source = "manual",
      items = [],
      contentHashInput,
      rawOcrText,
    } = body;

    if (!storeName || !receiptDate || totalAmount === undefined) {
      return NextResponse.json(
        { error: "storeName, receiptDate, and totalAmount are required" },
        { status: 400 }
      );
    }

    let contentHash: string | null = null;
    if (contentHashInput) {
      contentHash = crypto.createHash("sha256").update(contentHashInput).digest("hex");

      const existing = await prisma.receipt.findFirst({
        where: {
          userId: session.user.id,
          contentHash,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Duplicate receipt detected", existingId: existing.id },
          { status: 409 }
        );
      }
    }

    // ── Classify items BEFORE the transaction so API calls don't cause timeout ──
    const sc = storeChain ? String(storeChain).trim() : "";
    type ItemRow = {
      receiptId: string; userId: string; itemName: string; itemNameNormalized: string;
      quantity: number; unitPrice: number; lineTotal: number;
      category: string; brand: string | null; unit: string | null;
      productGroup: string | null; subCategory: string | null;
    };
    const itemRows: Omit<ItemRow, "receiptId">[] = await Promise.all(
      items.map(async (item: {
        itemName: string; quantity?: number; unitPrice: number;
        lineTotal?: number; category?: string; brand?: string; unit?: string;
      }) => {
        const cat = String(item.category ?? "General");
        const cls = await classifyItem(String(item.itemName), cat).catch(() => null);
        return {
          userId: session.user.id!,
          itemName: String(item.itemName),
          itemNameNormalized: String(item.itemName).toLowerCase().trim(),
          quantity: Number(item.quantity ?? 1),
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal ?? item.unitPrice * (item.quantity ?? 1)),
          category: cat,
          brand: item.brand ? String(item.brand) : null,
          unit: item.unit ? String(item.unit) : null,
          productGroup: cls?.productGroup ?? null,
          subCategory: cls?.subCategory ?? null,
        };
      })
    );

    // ── Transaction: only fast DB writes, no external API calls ──────────────
    const receipt = await prisma.$transaction(async (tx) => {
      const newReceipt = await tx.receipt.create({
        data: {
          userId: session.user.id!,
          storeName: String(storeName),
          storeChain: storeChain ? String(storeChain) : null,
          receiptDate: new Date(receiptDate),
          totalAmount: Number(totalAmount),
          currency: String(currency),
          imageUrl: imageUrl ? String(imageUrl) : s3Key ? String(s3Key) : null,
          source: String(source),
          contentHash,
          rawOcrText: rawOcrText ? String(rawOcrText) : null,
        },
      });

      if (itemRows.length > 0) {
        await tx.receiptItem.createMany({
          data: itemRows.map(r => ({ ...r, receiptId: newReceipt.id })),
        });

        if (sc) {
          for (const row of itemRows) {
            if (row.unitPrice > 0) {
              await tx.$executeRaw`
                INSERT INTO "PriceHistory"
                  (id, "itemNameNormalized", "storeChain", "unitPrice", category, "productGroup", "subCategory", "capturedAt", source, "userId")
                VALUES
                  (gen_random_uuid(), ${row.itemNameNormalized}, ${sc}, ${row.unitPrice}, ${row.category}, ${row.productGroup}, ${row.subCategory}, NOW(), 'receipt', ${session.user.id!})
              `;
            }
          }
        }
      }

      return newReceipt;
    });

    return NextResponse.json({ id: receipt.id }, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error("Create receipt error:", detail);
    return NextResponse.json({ error: "Internal server error", detail: detail.substring(0, 300) }, { status: 500 });
  }
}
