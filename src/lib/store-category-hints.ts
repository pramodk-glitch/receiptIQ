import { prisma } from "./db";

export async function getCategoryHints(storeChain: string): Promise<string | null> {
  if (!storeChain) return null;
  const row = await prisma.storeCategoryHints.findUnique({
    where: { storeChain: storeChain.toLowerCase().trim() },
  });
  return row?.hints ?? null;
}

export async function saveCategoryHints(
  storeChain: string,
  hints: string,
  itemCount: number,
): Promise<void> {
  const key = storeChain.toLowerCase().trim();
  await prisma.storeCategoryHints.upsert({
    where:  { storeChain: key },
    update: { hints, itemCount, lastUpdated: new Date() },
    create: { storeChain: key, hints, itemCount },
  });
}
