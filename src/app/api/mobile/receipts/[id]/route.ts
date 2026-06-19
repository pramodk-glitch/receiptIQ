import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const receipt = await prisma.receipt.findFirst({
    where: { id: params.id, userId: user.id },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: receipt.id,
    storeName: receipt.storeName,
    receiptDate: receipt.receiptDate.toISOString().slice(0, 10),
    totalAmount: receipt.totalAmount,
    currency: receipt.currency,
    source: receipt.source,
    needsReview: receipt.needsReview ?? false,
    items: receipt.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      itemNameNormalized: item.itemNameNormalized,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      category: item.category,
      unit: item.unit ?? null,
    })),
  });
}
