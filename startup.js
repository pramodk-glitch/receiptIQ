// Startup sequence (runs before server.js):
// 1. Resolve ANTHROPIC_API_KEY from Secrets Manager
// 2. prisma db push (schema sync)
// 3. Idempotent column additions (category, productGroup, StoreFormat table)
// 4. Backfill PriceHistory.category from ReceiptItem
// 5. Backfill PriceHistory.productGroup via Claude Haiku (new migration)
// 6. Start Next.js server

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

// ── 1. Resolve ANTHROPIC_API_KEY ─────────────────────────────────────────────
async function resolveAnthropicKey() {
  if (process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY already set");
    return;
  }
  const secretArn = process.env.ANTHROPIC_SECRET_ARN;
  if (!secretArn) {
    console.warn("ANTHROPIC_API_KEY not set and ANTHROPIC_SECRET_ARN not configured");
    return;
  }
  try {
    const client = new SecretsManagerClient({ region: process.env.AWS_REGION ?? "us-east-1" });
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
    const value = response.SecretString?.trim();
    if (value) {
      process.env.ANTHROPIC_API_KEY = value;
      console.log("Resolved ANTHROPIC_API_KEY from Secrets Manager");
    }
  } catch (e) {
    console.error("Failed to resolve ANTHROPIC_API_KEY from Secrets Manager:", e.message);
  }
}

// ── 5. productGroup backfill via Claude Haiku ─────────────────────────────────
const SUBCATEGORY_TAXONOMY = {
  Groceries: ["Produce — Fruits","Produce — Vegetables","Dairy & Eggs","Meat & Poultry","Seafood","Bakery & Bread","Cereals & Grains","Snacks & Chips","Beverages","Frozen Foods","Canned & Packaged","Condiments & Spices","International Foods","Other Groceries"],
  Household: ["Cleaning","Paper Products","Laundry","Kitchen & Dining","Storage & Organization","Other Household"],
  "Personal Care": ["Hair Care","Skin Care","Oral Care","Medicine & Health","Other Personal Care"],
  Electronics: ["Phones & Accessories","Computers & Tablets","TV & Audio","Other Electronics"],
  Dining: ["Restaurant","Café & Coffee","Fast Food","Other Dining"],
  Travel: ["Transport","Accommodation","Other Travel"],
  Entertainment: ["Streaming","Events","Books & Media","Other Entertainment"],
  Medicine: ["Prescription","OTC Medication","Vitamins & Supplements","Other Medicine"],
  General: ["General"],
};

async function classifyProductGroup(itemName, category) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const subCats = (SUBCATEGORY_TAXONOMY[category] || SUBCATEGORY_TAXONOMY.General).join(", ");

  const prompt = `Classify this retail item. Return ONLY a JSON object, no other text.
Item: "${itemName}"
Category: ${category}

Rules:
1. productGroup: short generic name (1-4 words, title case). Strip ALL store brand names (Good & Gather, Market Pantry, Threshold, Kirkland, Great Value, etc.) and sizes/weights.
   Examples: "Vitamin D Whole Milk 1gal Good & Gather" → "Milk"
             "Fresh Broccoli Florets 12oz" → "Broccoli"
             "Perdue Thin Sliced Antibiotic Free Chicken Breast" → "Chicken Breast"
             "Frozen Crispy Hash Brown Potato Patties Market Pantry" → "Hash Browns"
2. subCategory: pick EXACTLY one from: ${subCats}

Return: {"productGroup":"string","subCategory":"string"}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 60, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text = (json.content?.[0]?.text ?? "").trim();
    return JSON.parse(text.replace(/```json\s*/i,"").replace(/```\s*$/i,"").trim());
  } catch {
    return null;
  }
}

async function backfillProductGroups(prisma) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("Skipping productGroup backfill — ANTHROPIC_API_KEY not set");
    return;
  }

  // Find all distinct items missing productGroup OR subCategory
  const unclassified = await prisma.$queryRaw`
    SELECT DISTINCT "itemNameNormalized", category
    FROM "PriceHistory"
    WHERE ("productGroup" IS NULL OR "subCategory" IS NULL)
      AND "itemNameNormalized" IS NOT NULL
      AND "itemNameNormalized" != ''
    LIMIT 200
  `;

  if (unclassified.length === 0) {
    console.log("productGroup backfill: all rows already classified");
    return;
  }

  console.log(`productGroup backfill: classifying ${unclassified.length} unique items...`);
  let updated = 0;
  let failed = 0;

  for (const row of unclassified) {
    const displayName = row.itemNameNormalized
      .replace(/[™®©]/g, "")
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const group = await classifyProductGroup(displayName, row.category);
    if (!group) { failed++; continue; }

    const pg = typeof group === "object" ? group.productGroup : group;
    const sc = typeof group === "object" ? group.subCategory  : null;

    try {
      const result = await prisma.$executeRaw`
        UPDATE "PriceHistory"
        SET "productGroup" = COALESCE("productGroup", ${pg}),
            "subCategory"  = COALESCE("subCategory",  ${sc})
        WHERE "itemNameNormalized" = ${row.itemNameNormalized}
          AND ("productGroup" IS NULL OR "subCategory" IS NULL)
      `;
      updated += Number(result);
    } catch (e) {
      console.error(`Failed to update productGroup for "${row.itemNameNormalized}":`, e.message);
      failed++;
    }

    // Small delay to avoid hitting API rate limits
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`productGroup backfill complete: ${updated} rows updated, ${failed} failed`);

  // If there are more unclassified rows (hit the 200 limit), log a reminder
  const remaining = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "PriceHistory" WHERE "productGroup" IS NULL OR "subCategory" IS NULL
  `;
  const rem = Number(remaining[0]?.count ?? 0);
  if (rem > 0) {
    console.log(`${rem} rows still unclassified — will be processed on next restart`);
  }
}

async function main() {
  await resolveAnthropicKey();

  // ── 2. Schema migration ──────────────────────────────────────────────────
  try {
    execSync("./node_modules/.bin/prisma db push --skip-generate", { stdio: "inherit" });
  } catch (e) {
    console.error("Schema push warning (non-fatal):", e.message);
  }

  // ── 3. Idempotent column/table additions ─────────────────────────────────
  // IMPORTANT: declare prisma BEFORE any prisma.* calls below
  const prisma = new PrismaClient();

  try {
    // StoreFormat table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StoreFormat" (
        id            TEXT        NOT NULL PRIMARY KEY,
        "storeName"   TEXT        NOT NULL UNIQUE,
        "formatHints" TEXT        NOT NULL,
        "sampleCount" INTEGER     NOT NULL DEFAULT 1,
        "lastSeen"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "StoreFormat_storeName_idx" ON "StoreFormat"("storeName")
    `;
    console.log("StoreFormat table ensured");
  } catch (e) {
    console.error("StoreFormat table error (non-fatal):", e.message);
  }

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StoreCategoryHints" (
        id            TEXT        NOT NULL PRIMARY KEY,
        "storeChain"  TEXT        NOT NULL UNIQUE,
        hints         TEXT        NOT NULL,
        "itemCount"   INTEGER     NOT NULL DEFAULT 0,
        "lastUpdated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "StoreCategoryHints_storeChain_idx" ON "StoreCategoryHints"("storeChain")
    `;
    console.log("StoreCategoryHints table ensured");
  } catch (e) {
    console.error("StoreCategoryHints table error (non-fatal):", e.message);
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "PriceHistory"
        ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General'
    `;
    console.log("PriceHistory.category column ensured");
  } catch (e) {
    console.error("PriceHistory.category column error (non-fatal):", e.message);
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "PriceHistory"
        ADD COLUMN IF NOT EXISTS "productGroup" TEXT
    `;
    console.log("PriceHistory.productGroup column ensured");
  } catch (e) {
    console.error("PriceHistory.productGroup column error (non-fatal):", e.message);
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "PriceHistory"
        ADD COLUMN IF NOT EXISTS "subCategory" TEXT
    `;
    console.log("PriceHistory.subCategory column ensured");
  } catch (e) {
    console.error("subCategory column error (non-fatal):", e.message);
  }

  try {
    await prisma.$executeRaw`
      ALTER TABLE "PriceHistory"
        ADD COLUMN IF NOT EXISTS "receiptId" TEXT
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "PriceHistory_receiptId_idx" ON "PriceHistory"("receiptId")
    `;
    await prisma.$executeRaw`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'PriceHistory_receiptId_fkey'
            AND table_name = 'PriceHistory'
        ) THEN
          ALTER TABLE "PriceHistory"
            ADD CONSTRAINT "PriceHistory_receiptId_fkey"
            FOREIGN KEY ("receiptId") REFERENCES "Receipt"(id) ON DELETE CASCADE;
        END IF;
      END $$
    `;
    console.log("PriceHistory.receiptId column and FK ensured");
  } catch (e) {
    console.error("PriceHistory.receiptId column error (non-fatal):", e.message);
  }

  // ── 3b. Backfill PriceHistory.unit from ReceiptItem ─────────────────────
  try {
    await prisma.$executeRaw`ALTER TABLE "PriceHistory" ADD COLUMN IF NOT EXISTS unit TEXT`;
    const unitCount = await prisma.$executeRaw`
      UPDATE "PriceHistory" ph
      SET unit = ri.unit
      FROM (
        SELECT DISTINCT ON (ri."receiptId", ri."itemNameNormalized")
          ri."receiptId", ri."itemNameNormalized", ri.unit
        FROM "ReceiptItem" ri
        WHERE ri.unit IS NOT NULL AND ri.unit != ''
      ) ri
      WHERE ph."receiptId"         = ri."receiptId"
        AND ph."itemNameNormalized" = ri."itemNameNormalized"
        AND ph.unit IS NULL
    `;
    if (unitCount > 0) console.log("Backfilled " + unitCount + " PriceHistory rows with units");
  } catch (e) {
    console.error("Unit backfill error (non-fatal):", e.message);
  }

  // ── 4. Backfill PriceHistory.category ────────────────────────────────────
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
      WHERE ph."userId"             = s."userId"
        AND ph."itemNameNormalized" = s."itemNameNormalized"
        AND ph.category             = 'General'
        AND s.category             != 'General'
    `;
    if (count > 0) console.log(`Backfilled ${count} PriceHistory rows with categories`);
  } catch (e) {
    console.error("Category backfill error (non-fatal):", e.message);
  }

  await prisma.$disconnect();
}

main()
  .then(() => {
    // ── 6. Start the Next.js server FIRST ────────────────────────────────
    // The productGroup backfill runs async in the background so it never
    // delays server startup (200 Haiku calls × ~500ms = several minutes).
    require("./server.js");

    // ── 7. Backfill productGroup in background ────────────────────────────
    const bgPrisma = new PrismaClient();
    backfillProductGroups(bgPrisma)
      .catch((e) => console.error("productGroup backfill error:", e.message))
      .finally(() => bgPrisma.$disconnect());
  })
  .catch((e) => {
    console.error("Startup error:", e);
    require("./server.js");
  });
