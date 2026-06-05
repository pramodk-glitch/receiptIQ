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
async function classifyProductGroup(itemName, category) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `What is the short generic product type for this retail item?
Item: "${itemName}"
Category: ${category}

Reply with ONLY the generic product name in title case, 1-3 words max.
Examples:
  "Vitamin D Whole Milk - 1gal - Good & Gather" → Milk
  "Perdue Thin Sliced Antibiotic Free Chicken Breast" → Chicken Breast
  "Pringles Snack Cups Variety Pack Potato Crisps 12.9oz" → Potato Chips
  "Fresh Broccoli Florets 12oz" → Broccoli
  "Laxmi Idly Rice 20lb" → Rice
  "King Machine Washable Extra Firm Bed Pillow" → Bed Pillow`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 20,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.content?.[0]?.text ?? "").trim().replace(/['"]/g, "") || null;
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

  // Find all distinct items that need classification
  const unclassified = await prisma.$queryRaw`
    SELECT DISTINCT "itemNameNormalized", category
    FROM "PriceHistory"
    WHERE "productGroup" IS NULL
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

    try {
      const result = await prisma.$executeRaw`
        UPDATE "PriceHistory"
        SET "productGroup" = ${group}
        WHERE "itemNameNormalized" = ${row.itemNameNormalized}
          AND "productGroup" IS NULL
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
    SELECT COUNT(*) as count FROM "PriceHistory" WHERE "productGroup" IS NULL
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

  // ── 5. Backfill PriceHistory.productGroup ────────────────────────────────
  try {
    await backfillProductGroups(prisma);
  } catch (e) {
    console.error("productGroup backfill error (non-fatal):", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    // ── 6. Start the Next.js server ──────────────────────────────────────
    require("./server.js");
  })
  .catch((e) => {
    console.error("Startup error:", e);
    require("./server.js");
  });
