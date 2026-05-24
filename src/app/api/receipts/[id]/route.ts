import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipt = await prisma.receipt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: receipt.id,
    storeName: receipt.storeName,
    storeChain: receipt.storeChain,
    receiptDate: receipt.receiptDate.toISOString(),
    totalAmount: receipt.totalAmount,
    currency: receipt.currency,
    imageUrl: receipt.imageUrl,
    rawOcrText: receipt.rawOcrText,
    source: receipt.source,
    needsReview: receipt.needsReview,
    autoIngested: receipt.autoIngested,
    createdAt: receipt.createdAt.toISOString(),
    items: receipt.items.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      category: item.category,
      brand: item.brand,
      asin: item.asin,
    })),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipt = await prisma.receipt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  await prisma.receipt.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
