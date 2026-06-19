import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = getMobileUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const receipts = await prisma.receipt.findMany({
    where: { userId: user.id },
    orderBy: { receiptDate: "desc" },
    take: 500,
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json(receipts.map(r => ({
    id: r.id,
    storeName: r.storeName || "Unknown Store",
    receiptDate: r.receiptDate.toISOString().slice(0, 10),
    totalAmount: r.totalAmount,
    currency: r.currency,
    itemCount: r._count.items,
    source: r.source,
    needsReview: r.needsReview ?? false,
  })));
}
