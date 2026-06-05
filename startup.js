// Runs before server.js on container start:
// 1. Resolves ANTHROPIC_API_KEY from Secrets Manager if not set directly
// 2. Applies pending schema changes (prisma db push)
// 3. Backfills PriceHistory.category from ReceiptItem for existing rows
// 4. Hands off to the Next.js standalone server

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
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION ?? "us-east-1",
    });
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );
    const value = response.SecretString?.trim();
    if (value) {
      process.env.ANTHROPIC_API_KEY = value;
      console.log("Resolved ANTHROPIC_API_KEY from Secrets Manager");
    }
  } catch (e) {
    console.error("Failed to resolve ANTHROPIC_API_KEY from Secrets Manager:", e.message);
  }
}

async function main() {
  await resolveAnthropicKey();

  // ── 2. Schema migration ──────────────────────────────────────────────────
  try {
    execSync("./node_modules/.bin/prisma db push --skip-generate", {
      stdio: "inherit",
    });
  } catch (e) {
    console.error("Schema push warning (non-fatal):", e.message);
  }

  // ── 2b. Ensure StoreFormat table exists (idempotent) ────────────────────
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StoreFormat" (
        id          TEXT        NOT NULL PRIMARY KEY,
        "storeName" TEXT        NOT NULL UNIQUE,
        "formatHints" TEXT      NOT NULL,
        "sampleCount" INTEGER   NOT NULL DEFAULT 1,
        "lastSeen"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StoreFormat_storeName_idx" ON "StoreFormat"("storeName")`;
    console.log("StoreFormat table ensured");
  } catch (e) {
    console.error("StoreFormat table error (non-fatal):", e.message);
  }

  // ── 2d. Ensure PriceHistory.category column exists (idempotent) ──────────
  // prisma db push may silently skip additive changes on some environments;
  // run the ALTER explicitly so the column is always present.
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRaw`
      ALTER TABLE "PriceHistory"
        ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'General'
    `;
    console.log("PriceHistory.category column ensured");
  } catch (e) {
    console.error("Column ensure error (non-fatal):", e.message);
  }

  // ── 2e. Ensure PriceHistory.productGroup column exists ───────────────────
  try {
    await prisma.$executeRaw`
      ALTER TABLE "PriceHistory"
        ADD COLUMN IF NOT EXISTS "productGroup" TEXT
    `;
    console.log("PriceHistory.productGroup column ensured");
  } catch (e) {
    console.error("productGroup column error (non-fatal):", e.message);
  }

  // ── 3. Backfill categories ───────────────────────────────────────────────
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
    // ── 4. Start the Next.js server ──────────────────────────────────────
    require("./server.js");
  })
  .catch((e) => {
    console.error("Startup error:", e);
    require("./server.js");
  });
