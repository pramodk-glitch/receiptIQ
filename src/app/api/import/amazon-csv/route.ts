import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseAmazonCsv } from "@/lib/amazon-csv";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/csv") {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const csvContent = await file.text();

    if (!csvContent.trim()) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    let orders;
    try {
      orders = parseAmazonCsv(csvContent);
    } catch (parseErr) {
      return NextResponse.json(
        {
          error: `Failed to parse CSV: ${parseErr instanceof Error ? parseErr.message : "Invalid format"}`,
        },
        { status: 400 }
      );
    }

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No valid orders found in the CSV file" },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        const existing = await prisma.receipt.findFirst({
          where: {
            userId: session.user.id!,
            externalId: order.orderId,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const receipt = await tx.receipt.create({
            data: {
              userId: session.user.id!,
              storeName: "Amazon",
              storeChain: "Amazon",
              receiptDate: new Date(order.orderDate),
              totalAmount: order.orderTotal,
              currency: "USD",
              source: "amazon_csv",
              externalId: order.orderId,
              autoIngested: true,
            },
          });

          if (order.items.length > 0) {
            await tx.receiptItem.createMany({
              data: order.items.map((item) => ({
                receiptId: receipt.id,
                userId: session.user.id!,
                itemName: item.title,
                itemNameNormalized: item.title.toLowerCase().trim(),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
                category: item.category,
                asin: item.asin || null,
                brand: null,
              })),
            });
          }

          await tx.priceHistory.createMany({
            data: order.items
              .filter((item) => item.unitPrice > 0)
              .map((item) => ({
                itemNameNormalized: item.title.toLowerCase().trim(),
                storeChain: "Amazon",
                unitPrice: item.unitPrice,
                capturedAt: new Date(order.orderDate),
                source: "amazon_csv",
                userId: session.user.id!,
              })),
          });
        });

        imported++;
      } catch (orderErr) {
        errors.push(
          `Order ${order.orderId}: ${orderErr instanceof Error ? orderErr.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({ imported, skipped, errors });
  } catch (err) {
    console.error("Amazon CSV import error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
