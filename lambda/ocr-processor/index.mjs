import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import pg from "pg";

const { Pool } = pg;

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION ?? "us-east-1" });

let dbPool = null;

async function getSecret(secretName) {
  const cmd = new GetSecretValueCommand({ SecretId: secretName });
  const res = await secretsManager.send(cmd);
  return res.SecretString;
}

async function getDb() {
  if (dbPool) return dbPool;
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.DB_SECRET_ARN) {
    connectionString = await getSecret(process.env.DB_SECRET_ARN);
  }
  dbPool = new Pool({ connectionString, max: 1, idleTimeoutMillis: 10000, ssl: { rejectUnauthorized: false } });
  return dbPool;
}

function normalizeCategory() {
  return "General";
}

function parseAmount(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.round(val * 100) / 100;
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str.trim());
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  const m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const yr = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${yr}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  return null;
}

function getImageMediaType(key) {
  const ext = key.toLowerCase().split(".").pop();
  const map = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" };
  return map[ext] ?? "image/jpeg";
}

const RECEIPT_PROMPT = `Extract all data from this receipt and return ONLY a JSON object — no markdown, no explanation, no extra text. Read only what is actually printed; do not guess or invent store names or items.

{"store_name":"string","store_chain":"string","receipt_date":"YYYY-MM-DD","total_amount":number,"currency":"USD","items":[{"item_name":"string","quantity":number,"unit_price":number,"line_total":number,"category":"string"}]}

quantity: number of units. Many receipts print qty/price on a SEPARATE LINE below the item name as "QTY @ UNIT_PRICE LINE_TOTAL" — the number BEFORE "@" is quantity (not a line number), the number AFTER "@" is unit_price.

category must be one of: Groceries, Electronics, Dining, Medicine, Household, Personal Care, Travel, Entertainment, General`;

async function callAnthropic(content) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in Lambda environment variables");

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text ?? "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function extractWithAnthropic(imageBuffer, mediaType) {
  const base64 = imageBuffer.toString("base64");
  return callAnthropic([
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    { type: "text", text: RECEIPT_PROMPT },
  ]);
}

async function extractPdfWithAnthropic(pdfBytes) {
  const base64 = pdfBytes.toString("base64");
  return callAnthropic([
    { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
    { type: "text", text: RECEIPT_PROMPT },
  ]);
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function extractReceiptFromImage(bucket, key) {
  const isPdf = key.toLowerCase().endsWith(".pdf");
  const s3Obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const fileBytes = await streamToBuffer(s3Obj.Body);

  if (isPdf) {
    console.log("Using Anthropic API for PDF OCR:", key);
    return extractPdfWithAnthropic(fileBytes);
  }

  console.log("Using Anthropic API for image OCR:", key);
  const mediaType = getImageMediaType(key);
  return extractWithAnthropic(fileBytes, mediaType);
}

export const handler = async (event) => {
  console.log("OCR Lambda triggered:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing s3://${bucket}/${key}`);

    try {
      const ocrResult = await extractReceiptFromImage(bucket, key);
      console.log("OCR result:", JSON.stringify(ocrResult));

      const db = await getDb();
      const imageUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;

      let receiptRes = { rows: [] };
      for (let attempt = 0; attempt < 5; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
        receiptRes = await db.query(
          `SELECT id, "userId" FROM "Receipt" WHERE "imageUrl" = $1 AND source = 'upload' LIMIT 1`,
          [imageUrl]
        );
        if (receiptRes.rows.length > 0) break;
        console.log(`Receipt not found yet (attempt ${attempt + 1}/5), retrying...`);
      }

      if (receiptRes.rows.length === 0) {
        console.warn(`No receipt found for key ${key} after retries — creating one`);
        const parts = key.split("/");
        const userId = parts[1];
        if (!userId) { console.error("Cannot determine userId from key:", key); continue; }

        await db.query(
          `INSERT INTO "Receipt" (id, "userId", "storeName", "storeChain", "receiptDate", "totalAmount", currency, "imageUrl", "rawOcrText", source, "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'upload', NOW())`,
          [userId, ocrResult.store_name, ocrResult.store_chain, ocrResult.receipt_date, ocrResult.total_amount, ocrResult.currency, imageUrl, JSON.stringify(ocrResult)]
        );

        const newReceipt = await db.query(`SELECT id FROM "Receipt" WHERE "imageUrl" = $1 LIMIT 1`, [imageUrl]);
        if (newReceipt.rows.length === 0) continue;
        await insertItems(db, newReceipt.rows[0].id, userId, ocrResult);
      } else {
        const { id: receiptId, userId } = receiptRes.rows[0];

        // Re-check rawOcrText right before writing — the API route OCR may have
        // finished while the Lambda was running its own OCR above.
        const freshCheck = await db.query(
          `SELECT "rawOcrText" FROM "Receipt" WHERE id = $1`,
          [receiptId]
        );
        const existingOcr = freshCheck.rows[0]?.rawOcrText;
        const hasRealOcr = existingOcr != null && !String(existingOcr).startsWith('OCR_ERROR:');
        if (hasRealOcr) {
          console.log(`Receipt ${receiptId} already processed by API route, skipping Lambda update`);
          continue;
        }

        await db.query(
          `UPDATE "Receipt" SET "storeName"=$1, "storeChain"=$2, "receiptDate"=$3, "totalAmount"=$4, currency=$5, "rawOcrText"=$6, "imageUrl"=$7 WHERE id=$8`,
          [ocrResult.store_name, ocrResult.store_chain, ocrResult.receipt_date, ocrResult.total_amount, ocrResult.currency, JSON.stringify(ocrResult), imageUrl, receiptId]
        );
        await insertItems(db, receiptId, userId, ocrResult);
      }

      console.log(`Successfully processed ${key}`);
    } catch (err) {
      console.error(`Error processing ${key}:`, err);
    }
  }
};

async function insertItems(db, receiptId, userId, ocrResult) {
  await db.query(`DELETE FROM "ReceiptItem" WHERE "receiptId" = $1`, [receiptId]);

  for (const item of ocrResult.items) {
    await db.query(
      `INSERT INTO "ReceiptItem" (id, "receiptId", "userId", "itemName", "itemNameNormalized", quantity, "unitPrice", "lineTotal", category, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [receiptId, userId, item.item_name, item.item_name.toLowerCase().trim(), item.quantity, item.unit_price, item.line_total, item.category]
    );

    if (item.unit_price > 0) {
      await db.query(
        `INSERT INTO "PriceHistory" (id, "itemNameNormalized", "storeChain", "unitPrice", category, "capturedAt", source, "userId")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), 'receipt', $5)`,
        [item.item_name.toLowerCase().trim(), ocrResult.store_chain || ocrResult.store_name, item.unit_price, item.category || 'General', userId]
      );
    }
  }
}
