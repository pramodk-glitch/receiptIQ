// Runs before server.js on container start:
// 1. Applies pending schema changes (prisma db push)
// 2. Backfills PriceHistory.category from ReceiptItem for existing rows
// 3. Hands off to the Next.js standalone server

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

async function main() {
  // ── 1. Schema migration ──────────────────────────────────────────────────
  try {
    execSync("./node_modules/.bin/prisma db push --skip-generate", {
      stdio: "inherit",
    });
  } catch (e) {
    console.error("Schema push warning (non-fatal):", e.message);
  }

  // ── 2. Backfill categories ───────────────────────────────────────────────
  const prisma = new PrismaClient();
  try {
    const count = await prisma.$executeRaw`
      UPDATE "PriceHistory" ph
      SET category = s.category
      FROM (
        SELECT DISTINCT ON ("itemNameNormalized", "userId")
          "itemNameNormalized", "userId", category
        FROM "ReceiptItem"
        ORDER BY "itemNameNormalized", "userId", "createdAt" DESC
      ) s
      WHERE ph."userId"              = s."userId"
        AND ph."itemNameNormalized"  = s."itemNameNormalized"
        AND ph.category              = 'General'
        AND s.category              != 'General'
    `;
    if (count > 0) console.log(`Backfilled ${count} PriceHistory rows with categories`);
  } catch (e) {
    console.error("Category backfill error (non-fatal):", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    // ── 3. Start the Next.js server ──────────────────────────────────────
    require("./server.js");
  })
  .catch((e) => {
    console.error("Startup error:", e);
    require("./server.js");
  });
