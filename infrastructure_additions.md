
---

## Duplicate Detection Implementation

### Overview

Duplicate receipt detection runs in the API layer before any data is written to the database. Two complementary strategies cover the full surface area of duplicates.

### Strategy 1 — Perceptual Image Hash (pHash)

```
Library: blockhash-js (Node.js) or sharp with custom hash
Timing:  <50ms per image — runs synchronously before OCR
Storage: 64-bit integer column phash on receipts table
Match:   Hamming distance ≤ 10 = visual duplicate
Handles: rotation, brightness variation, cropping, JPEG compression artifacts
```

**Implementation in API middleware:**
```javascript
import { blockhash } from 'blockhash-js';

async function checkImageDuplicate(imageBuffer, userId) {
  const hash = await blockhash(imageBuffer, 16); // 256-bit → store as 4×64-bit
  const existing = await db.query(
    `SELECT id, phash FROM receipts WHERE user_id = $1 AND phash IS NOT NULL`,
    [userId]
  );
  return existing.rows.find(r => hammingDistance(r.phash, hash) <= 10) || null;
}
```

### Strategy 2 — Content Fingerprint Hash

```
Algorithm: SHA-256
Input:     user_id + store_chain_normalized + receipt_date + total_amount_cents
Storage:   content_hash column on receipts table (indexed, unique per user)
Match:     Exact match = certain duplicate (even from different photos)
```

```javascript
import { createHash } from 'crypto';

function contentFingerprint(userId, storeChain, date, totalCents) {
  return createHash('sha256')
    .update(`${userId}|${storeChain.toLowerCase().trim()}|${date}|${totalCents}`)
    .digest('hex');
}
```

### User Resolution Flow

When a duplicate is detected, the API returns a `409 Duplicate Detected` response instead of creating a new receipt. The client shows a side-by-side comparison screen with three options:

- **Discard** — new receipt deleted, existing kept
- **Keep Both** — both saved (different trips same day)  
- **Merge** — line items from both combined into one receipt

### New DB columns on `receipts`

```sql
ALTER TABLE receipts ADD COLUMN phash BIGINT;
ALTER TABLE receipts ADD COLUMN content_hash VARCHAR(64);
ALTER TABLE receipts ADD COLUMN duplicate_of UUID REFERENCES receipts(id);
CREATE INDEX idx_receipts_content_hash ON receipts(user_id, content_hash);
CREATE INDEX idx_receipts_phash ON receipts(user_id, phash);
```

---

## Purchase Engine — API Integrations

### Overview

The Purchase Engine has two layers. Layer 1 (Shopping Pattern Intelligence) runs entirely on internal data — no external dependencies. Layer 2 (Direct Purchase) integrates with retailer partner APIs.

### Layer 1 — Shopping Pattern Intelligence

Runs as a background job triggered after each receipt is ingested. Updates the `shopping_patterns` table per user per item.

```javascript
// Triggered post-OCR by SQS message
async function updateShoppingPatterns(userId, receiptItems) {
  for (const item of receiptItems) {
    const normalized = normalizeItemName(item.name);
    const history = await db.query(
      `SELECT captured_at FROM price_history 
       WHERE user_id = $1 AND item_name_normalized = $2 
       ORDER BY captured_at DESC LIMIT 20`,
      [userId, normalized]
    );
    const avgRestockDays = calculateAvgRestock(history.rows);
    await db.query(
      `INSERT INTO shopping_patterns (user_id, item_name_normalized, avg_restock_days, 
         last_purchased_at, next_predicted_at, avg_unit_price, preferred_store, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '${avgRestockDays} days', $4, $5, NOW())
       ON CONFLICT (user_id, item_name_normalized) DO UPDATE SET ...`,
      [userId, normalized, avgRestockDays, item.unit_price, item.store_chain]
    );
  }
}
```

### Layer 2 — Direct Purchase API Options

| API | Status | Auth | Coverage | Notes |
|-----|--------|------|----------|-------|
| Instacart Connect | ✅ Available | OAuth 2.0 | 1,400+ retailers | Start here — broadest coverage |
| Kroger API | ✅ Available | OAuth 2.0 | Kroger, Fred Meyer, Ralphs | Public developer portal |
| Walmart+ | ⚠️ Invite-only | OAuth 2.0 | Walmart stores | Apply early via partner portal |
| DoorDash Drive | ✅ Available | API Key | Local stores | Dispatch API for last-mile delivery |
| Amazon Fresh | ❌ No public API | — | — | Against ToS to automate |

### Critical Constraints

**PCI-DSS:** ReceiptIQ must never handle card data. Implementation uses OAuth to the user's existing retailer account — the retailer processes payment directly.

**Price disclaimer:** All prices shown are estimates. The confirmation screen must display:
```
Estimated total: $47.23
Actual total may vary based on current shelf prices, 
item availability, and applicable fees.
```

**Post-delivery reconciliation:** After delivery, ReceiptIQ auto-imports the delivery receipt email via the existing ingestion pipeline. This closes the analytics loop and updates actual spend vs. estimated.

### Instacart Connect Integration Sketch

```javascript
async function placeInstacartOrder(userId, purchaseOrderId) {
  const order = await db.query('SELECT * FROM purchase_orders WHERE id = $1', [purchaseOrderId]);
  const userToken = await getInstacartToken(userId); // stored in ingestion_sources
  
  const response = await fetch('https://connect.instacart.com/v2/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: order.rows[0].items.map(item => ({
        name: item.item_name,
        quantity: item.quantity,
        preferences: { allow_substitutions: true }
      })),
      fulfillment: { type: 'delivery' }
    })
  });
  
  const result = await response.json();
  await db.query(
    'UPDATE purchase_orders SET status = $1, external_order_id = $2, placed_at = NOW() WHERE id = $3',
    ['placed', result.order_id, purchaseOrderId]
  );
  
  // Set up webhook to receive order updates
  await registerInstacartWebhook(result.order_id, userId);
}
```

