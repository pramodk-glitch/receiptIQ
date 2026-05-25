import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import Anthropic from "@anthropic-ai/sdk";
import pg from "pg";

const { Pool } = pg;

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION ?? "us-east-1" });

let dbPool = null;
let anthropicClient = null;

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

function getAnthropic() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function normalizeCategory(raw) {
  const valid = ["Groceries", "Electronics", "Dining", "Medicine", "Household", "Personal Care", "Travel", "Entertainment", "General"];
  if (!raw) return "General";
  const found = valid.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  return found ?? "General";
}

function validateOcrResult(data) {
  if (typeof data !== "object" || data === null) throw new Error("OCR result is not an object");
  return {
    store_name: typeof data.store_name === "string" ? data.store_name : "Unknown Store",
    store_chain: typeof data.store_chain === "string" ? data.store_chain : "",
    receipt_date: typeof data.receipt_date === "string" ? data.receipt_date : new Date().toISOString().split("T")[0],
    total_amount: typeof data.total_amount === "number" ? data.total_amount : 0,
    currency: typeof data.currency === "string" ? data.currency : "USD",
    items: Array.isArray(data.items)
      ? data.items
          .filter((i) => typeof i === "object" && i !== null)
          .map((i) => ({
            item_name: typeof i.item_name === "string" ? i.item_name : "Unknown Item",
            quantity: typeof i.quantity === "number" ? i.quantity : 1,
            unit_price: typeof i.unit_price === "number" ? i.unit_price : 0,
            line_total: typeof i.line_total === "number" ? i.line_total : 0,
            category: normalizeCategory(typeof i.category === "string" ? i.category : "General"),
          }))
      : [],
  };
}


async function extractReceiptFromImage(imageBuffer, contentType) {
  const client = getAnthropic();
  const normalizedType = contentType?.toLowerCase() ?? "image/jpeg";

  const isPdf = normalizedType === "application/pdf";

  const mediaTypeMap = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/gif": "image/gif",
    "image/webp": "image/webp",
  };

  const receiptContent = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: imageBuffer.toString("base64") } }
    : { type: "image", source: { type: "base64", media_type: mediaTypeMap[normalizedType] ?? "image/jpeg", data: imageBuffer.toString("base64") } };

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          receiptContent,
          {
            type: "text",
            text: `Extract all line items from this receipt${isPdf ? " document" : " image"}. Return JSON:
{
  "store_name": string,
  "store_chain": string,
  "receipt_date": "YYYY-MM-DD",
  "total_amount": number,
  "currency": "USD",
  "items": [{"item_name": string, "quantity": number, "unit_price": number, "line_total": number, "category": string}]
}
For category use only: Groceries | Electronics | Dining | Medicine | Household | Personal Care | Travel | Entertainment | General
Return only valid JSON, no markdown.`,
          },
        ],
      },
    ],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse OCR response: ${cleaned.substring(0, 200)}`);
  }

  return validateOcrResult(parsed);
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export const handler = async (event) => {
  console.log("OCR Lambda triggered:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing s3://${bucket}/${key}`);

    try {
      const s3Obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const imageBuffer = await streamToBuffer(s3Obj.Body);
      const contentType = s3Obj.ContentType ?? "image/jpeg";

      const ocrResult = await extractReceiptFromImage(imageBuffer, contentType);
      console.log("OCR result:", JSON.stringify(ocrResult));

      const db = await getDb();
      const imageUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;

      // Find the receipt record created when the presigned URL was used
      const receiptRes = await db.query(
        `SELECT id, "userId" FROM receipts WHERE "imageUrl" = $1 AND source = 'upload' LIMIT 1`,
        [key]
      );

      if (receiptRes.rows.length === 0) {
        console.warn(`No receipt found for key ${key} — creating one`);
        // Extract userId from key pattern: receipts/{userId}/{uuid}.ext
        const parts = key.split("/");
        const userId = parts[1];
        if (!userId) {
          console.error("Cannot determine userId from key:", key);
          continue;
        }

        await db.query(
          `INSERT INTO receipts (id, "userId", "storeName", "storeChain", "receiptDate", "totalAmount", currency, "imageUrl", "rawOcrText", source, "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'upload', NOW())`,
          [userId, ocrResult.store_name, ocrResult.store_chain, ocrResult.receipt_date, ocrResult.total_amount, ocrResult.currency, key, JSON.stringify(ocrResult)]
        );

        const newReceipt = await db.query(
          `SELECT id FROM receipts WHERE "imageUrl" = $1 LIMIT 1`,
          [key]
        );
        if (newReceipt.rows.length === 0) continue;

        const receiptId = newReceipt.rows[0].id;
        await insertItems(db, receiptId, userId, ocrResult);
      } else {
        const { id: receiptId, userId } = receiptRes.rows[0];

        await db.query(
          `UPDATE receipts SET "storeName"=$1, "storeChain"=$2, "receiptDate"=$3, "totalAmount"=$4, currency=$5, "rawOcrText"=$6, "imageUrl"=$7 WHERE id=$8`,
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
  // Delete any existing items for this receipt (idempotent)
  await db.query(`DELETE FROM "receipt_items" WHERE "receiptId" = $1`, [receiptId]);

  for (const item of ocrResult.items) {
    await db.query(
      `INSERT INTO "receipt_items" (id, "receiptId", "userId", "itemName", "itemNameNormalized", quantity, "unitPrice", "lineTotal", category, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [receiptId, userId, item.item_name, item.item_name.toLowerCase().trim(), item.quantity, item.unit_price, item.line_total, item.category]
    );

    if (item.unit_price > 0) {
      await db.query(
        `INSERT INTO "price_history" (id, "itemNameNormalized", "storeChain", "unitPrice", "capturedAt", source, "userId")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), 'receipt', $4)`,
        [item.item_name.toLowerCase().trim(), ocrResult.store_chain || ocrResult.store_name, item.unit_price, userId]
      );
    }
  }
}
