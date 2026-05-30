import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { TextractClient, AnalyzeExpenseCommand, StartExpenseAnalysisCommand, GetExpenseAnalysisCommand } from "@aws-sdk/client-textract";
import pg from "pg";

const { Pool } = pg;

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const textract = new TextractClient({ region: process.env.AWS_REGION ?? "us-east-1" });

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

async function extractReceiptFromImage(bucket, key) {
  const isPdf = key.toLowerCase().endsWith(".pdf");

  let expense;
  if (isPdf) {
    // AnalyzeExpense sync API only supports single-page PDFs.
    // Use async StartExpenseAnalysis + polling for multi-page PDFs.
    const { JobId } = await textract.send(new StartExpenseAnalysisCommand({
      DocumentLocation: { S3Object: { Bucket: bucket, Name: key } },
    }));
    console.log(`Textract async job started: ${JobId}`);

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const result = await textract.send(new GetExpenseAnalysisCommand({ JobId }));
      console.log(`Job status: ${result.JobStatus}`);
      if (result.JobStatus === "SUCCEEDED") {
        expense = result.ExpenseDocuments?.[0];
        break;
      } else if (result.JobStatus === "FAILED") {
        throw new Error(`Textract async job failed: ${result.StatusMessage}`);
      }
    }
    if (!expense) throw new Error("Textract async job timed out or returned no documents");
  } else {
    const response = await textract.send(new AnalyzeExpenseCommand({
      Document: { S3Object: { Bucket: bucket, Name: key } },
    }));
    expense = response.ExpenseDocuments?.[0];
    if (!expense) throw new Error("Textract returned no expense documents");
  }

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
