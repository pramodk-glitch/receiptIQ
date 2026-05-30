import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { TextractClient, AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import pg from "pg";

const { Pool } = pg;

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const textract = new TextractClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "us-east-1" });

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

function mapTextractToReceiptIQ(expense) {
  const summaryFields = expense.SummaryFields ?? [];

  const getField = (...types) => {
    for (const type of types) {
      const f = summaryFields.find(f => f.Type?.Text === type);
      if (f?.ValueDetection?.Text) return f.ValueDetection.Text;
    }
    return "";
  };

  const storeName = getField("VENDOR_NAME", "NAME") || "Unknown Store";
  const receiptDate = parseDate(getField("INVOICE_RECEIPT_DATE", "ORDER_DATE")) ?? new Date().toISOString().split("T")[0];
  const total = parseAmount(getField("TOTAL", "AMOUNT_PAID", "SUBTOTAL"));

  const items = [];
  for (const group of expense.LineItemGroups ?? []) {
    for (const lineItem of group.LineItems ?? []) {
      const fields = lineItem.LineItemExpenseFields ?? [];
      const getItemField = (...types) => {
        for (const type of types) {
          const f = fields.find(f => f.Type?.Text === type);
          if (f?.ValueDetection?.Text) return f.ValueDetection.Text;
        }
        return "";
      };

      const itemName = getItemField("ITEM", "PRODUCT_CODE") || "Unknown Item";
      const quantity = parseFloat(getItemField("QUANTITY")) || 1;
      const lineTotal = parseAmount(getItemField("PRICE", "SUBTOTAL"));
      const unitPriceRaw = getItemField("UNIT_PRICE");
      const unitPrice = unitPriceRaw ? parseAmount(unitPriceRaw) : Math.round((lineTotal / quantity) * 100) / 100;

      items.push({
        item_name: itemName,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        category: normalizeCategory(),
      });
    }
  }

  return {
    store_name: storeName,
    store_chain: storeName,
    receipt_date: receiptDate,
    total_amount: total,
    currency: "USD",
    items,
  };
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function parsePdfText(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Store name: first non-empty line, or look for known chains
  const knownChains = ["target", "walmart", "costco", "kroger", "whole foods", "trader joe", "safeway", "cvs", "walgreens"];
  let storeName = lines[0] || "Unknown Store";
  for (const line of lines.slice(0, 10)) {
    if (knownChains.some(c => line.toLowerCase().includes(c))) {
      storeName = line;
      break;
    }
  }

  // Date: find MM/DD/YYYY or YYYY-MM-DD pattern
  let receiptDate = new Date().toISOString().split("T")[0];
  for (const line of lines) {
    const m = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) {
      const yr = m[3].length === 2 ? "20" + m[3] : m[3];
      receiptDate = `${yr}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
      break;
    }
  }

  // Total: last line matching TOTAL followed by a dollar amount
  let total = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/total/i.test(lines[i])) {
      const m = lines[i].match(/\$?\s*(\d+\.\d{2})/);
      if (m) { total = parseFloat(m[1]); break; }
      // Amount might be on the next line
      if (i + 1 < lines.length) {
        const m2 = lines[i + 1].match(/\$?\s*(\d+\.\d{2})/);
        if (m2) { total = parseFloat(m2[1]); break; }
      }
    }
  }

  // Line items: lines where text is followed by a price (e.g. "Organic Milk  3.99")
  const items = [];
  const itemRe = /^(.+?)\s{2,}\$?\s*(\d+\.\d{2})\s*$/;
  const skipWords = /^(subtotal|total|tax|change|cash|credit|debit|balance|savings|discount)/i;
  for (const line of lines) {
    if (skipWords.test(line)) continue;
    const m = line.match(itemRe);
    if (m) {
      const name = m[1].trim();
      const price = parseFloat(m[2]);
      if (name.length > 1 && price > 0 && price < 10000) {
        items.push({ item_name: name, quantity: 1, unit_price: price, line_total: price, category: "General" });
      }
    }
  }

  return {
    store_name: storeName,
    store_chain: storeName,
    receipt_date: receiptDate,
    total_amount: total,
    currency: "USD",
    items,
  };
}

async function extractWithBedrock(pdfBytes) {
  console.log("Falling back to Bedrock Claude for image-based PDF");
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: pdfBytes.toString("base64") },
        },
        {
          type: "text",
          text: `Extract all data from this receipt and return ONLY a JSON object, no markdown:
{"store_name":"string","store_chain":"string","receipt_date":"YYYY-MM-DD","total_amount":number,"currency":"USD","items":[{"item_name":"string","quantity":number,"unit_price":number,"line_total":number,"category":"string"}]}
category must be one of: Groceries, Electronics, Dining, Medicine, Household, Personal Care, Travel, Entertainment, General`,
        },
      ],
    }],
  });

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body,
  }));

  const result = JSON.parse(Buffer.from(response.body).toString());
  const text = result.content?.[0]?.text ?? "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function extractReceiptFromImage(bucket, key) {
  const isPdf = key.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const s3Obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const pdfBytes = await streamToBuffer(s3Obj.Body);

    // Try text extraction first (fast, free)
    const { text } = await pdfParse(pdfBytes);
    console.log("PDF text extracted, length:", text.length);

    if (text && text.trim().length >= 20) {
      return parsePdfText(text);
    }

    // Image-based PDF — use Bedrock Claude
    return extractWithBedrock(pdfBytes);
  }

  // Images: use Textract AnalyzeExpense
  const response = await textract.send(new AnalyzeExpenseCommand({
    Document: { S3Object: { Bucket: bucket, Name: key } },
  }));
  const expense = response.ExpenseDocuments?.[0];
  if (!expense) throw new Error("Textract returned no expense documents");
  return mapTextractToReceiptIQ(expense);
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
        `INSERT INTO "PriceHistory" (id, "itemNameNormalized", "storeChain", "unitPrice", "capturedAt", source, "userId")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), 'receipt', $4)`,
        [item.item_name.toLowerCase().trim(), ocrResult.store_chain || ocrResult.store_name, item.unit_price, userId]
      );
    }
  }
}
