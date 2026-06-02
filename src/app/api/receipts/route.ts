import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

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

      if (items.length > 0) {
        await tx.receiptItem.createMany({
          data: items.map((item: {
            itemName: string;
            quantity?: number;
            unitPrice: number;
            lineTotal?: number;
            category?: string;
            brand?: string;
            unit?: string;
          }) => ({
            receiptId: newReceipt.id,
            userId: session.user.id!,
            itemName: String(item.itemName),
            itemNameNormalized: String(item.itemName).toLowerCase().trim(),
            quantity: Number(item.quantity ?? 1),
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal ?? item.unitPrice * (item.quantity ?? 1)),
            category: String(item.category ?? "General"),
            brand: item.brand ? String(item.brand) : null,
            unit: item.unit ? String(item.unit) : null,
          })),
        });
      }

      return newReceipt;
    });

    return NextResponse.json({ id: receipt.id }, { status: 201 });
  } catch (err) {
    console.error("Create receipt error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
