import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { classifyItem } from "@/lib/product-classifier";
import { classifyByKeyword } from "@/lib/local-classifier";
import { getCategoryHints } from "@/lib/store-category-hints";
import { learnCategoryPatterns } from "@/lib/category-learner";

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

    // Semantic dedup: same store + date + total almost certainly means the same
    // receipt scanned twice from different image files (bypasses content-hash check).
    const receiptDateParsed = new Date(receiptDate);
    const semanticDup = await prisma.receipt.findFirst({
      where: {
        userId: session.user.id,
        storeName,
        receiptDate: receiptDateParsed,
        totalAmount,
      },
      select: { id: true },
    });
    if (semanticDup) {
      return NextResponse.json(
        { error: "Duplicate receipt detected", existingId: semanticDup.id },
        { status: 409 },
      );
    }

    // ── Tier 1: DB lookup for items we've classified before ──────────────────
    const knownItems = items.length > 0
      ? await prisma.$queryRaw<Array<{ itemNameNormalized: string; productGroup: string; subCategory: string }>>`
          SELECT DISTINCT ON ("itemNameNormalized")
            "itemNameNormalized", "productGroup", "subCategory"
          FROM "PriceHistory"
          WHERE "userId" = ${session.user.id!}
            AND "itemNameNormalized" = ANY(${items.map((i: { itemName: string }) => i.itemName.toLowerCase().trim())})
            AND "productGroup" IS NOT NULL
            AND "subCategory" IS NOT NULL
          ORDER BY "itemNameNormalized", "capturedAt" DESC
        `
      : [];
    const knownMap = new Map(knownItems.map(r => [r.itemNameNormalized, { productGroup: r.productGroup, subCategory: r.subCategory }]));

    // ── Classify items BEFORE the transaction so API calls don't cause timeout ──
    const sc = storeChain ? String(storeChain).trim() : "";

    // Fetch learned category hints for this store (if any) to inject into Claude
    const storeHints = sc ? await getCategoryHints(sc) : null;
    if (storeHints) console.log(`[Receipts] Using learned category hints for "${sc}`);
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
        const normalized = String(item.itemName).toLowerCase().trim();
        const base = {
          userId: session.user.id!,
          itemName: String(item.itemName),
          itemNameNormalized: normalized,
          quantity: Number(item.quantity ?? 1),
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal ?? item.unitPrice * (item.quantity ?? 1)),
          category: cat,
          brand: item.brand ? String(item.brand) : null,
          unit: item.unit ? String(item.unit) : null,
        };

        // Tier 1: DB lookup (previously classified same item — free, instant)
        const known = knownMap.get(normalized);
        if (known) return { ...base, productGroup: known.productGroup, subCategory: known.subCategory };

        // Tier 2: keyword rules (built-in dictionary — free, instant)
        const kw = classifyByKeyword(String(item.itemName));
        if (kw) return { ...base, productGroup: kw.productGroup, subCategory: kw.subCategory };

        // Tier 3: Claude Haiku (only for truly unknown items)
        const cls = await classifyItem(String(item.itemName), cat, storeHints).catch(() => null);
        return { ...base, productGroup: cls?.productGroup ?? null, subCategory: cls?.subCategory ?? null };
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
          data: itemRows.map(({ productGroup: _pg, subCategory: _sc, ...r }) => ({
            ...r,
            receiptId: newReceipt.id,
          })),
        });

        if (sc) {
          for (const row of itemRows) {
            if (row.unitPrice > 0) {
              await tx.$executeRaw`
                INSERT INTO "PriceHistory"
                  (id, "itemNameNormalized", "storeChain", "unitPrice", unit, category, "productGroup", "subCategory", "capturedAt", source, "userId", "receiptId")
                VALUES
                  (gen_random_uuid(), ${row.itemNameNormalized}, ${sc}, ${row.unitPrice}, ${row.unit ?? null}, ${row.category}, ${row.productGroup}, ${row.subCategory}, NOW(), 'receipt', ${session.user.id!}, ${newReceipt.id})
              `;
            }
          }
        }
      }

      return newReceipt;
    });

    // Fire-and-forget: teach the category learner agent from this receipt
    if (sc && itemRows.length > 0) {
      learnCategoryPatterns(sc, itemRows.map(r => ({
        itemName: r.itemName,
        productGroup: r.productGroup,
        subCategory: r.subCategory,
        category: r.category,
      }))).catch(() => {});
    }

    return NextResponse.json({ id: receipt.id }, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error("Create receipt error:", detail);
    return NextResponse.json({ error: "Internal server error", detail: detail.substring(0, 300) }, { status: 500 });
  }
}
