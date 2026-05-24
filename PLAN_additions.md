
---

## 9. Duplicate Receipt Detection

### Overview

Prevent duplicate receipts from corrupting analytics. Two-layer detection using perceptual image hashing (pHash) and content fingerprinting runs before any data is written to the database.

**Roadmap slot:** Phase 1 — must ship before public launch
**Version bump:** adds to v1.0 baseline
**Status:** ✅ Specced

### 9.1 Detection Methods

| Method | Confidence | Trigger | Implementation |
|--------|-----------|---------|----------------|
| pHash (perceptual image hash) | HIGH | Same receipt photo uploaded twice | blockhash-js, Hamming distance ≤ 10 |
| Content fingerprint (SHA-256) | HIGH | Different photos of same receipt | Hash of user_id + store + date + total_cents |
| Fuzzy content match | MEDIUM | Near-identical receipts (rounding) | Total within $0.05 + same store + date |
| Item-level deduplication | MEDIUM | Manual double-entry | Fuzzy name match + same date + same price |
| Split receipt detection | LOW | Two receipts = one transaction | Heuristic: two receipts same day same store sum to round number |

### 9.2 User Resolution Flow

1. Upload → pHash + content fingerprint computed (<100ms)
2. DB query against this user's existing receipts
3. No match → receipt saved normally
4. Match found → duplicate review screen with side-by-side comparison
5. User chooses: **Discard** / **Keep Both** / **Merge**
6. DB updated accordingly

### 9.3 New DB Columns on `receipts`

```sql
+ phash (BIGINT — 64-bit perceptual hash)
+ content_hash (VARCHAR(64) — SHA-256 fingerprint, indexed)
+ duplicate_of (UUID FK → receipts, nullable — set on merge/discard)
```

### 9.4 Edge Cases

- **Same store, two trips, same day:** Do NOT auto-merge — only flag if both hash AND amounts match exactly
- **Partial receipt:** Item-level cross-check catches overlapping line items
- **Household shared receipt:** Per-user hash isolation — won't trigger across users
- **Amended receipt:** Content hash differs on revised total — prompt review rather than auto-discard

### 9.5 Features Section Changes

**Phase 1 — Core:** add new feature item:

- **Duplicate Receipt Detection** — pHash + SHA-256 fingerprint detects same receipt uploaded twice before it touches the DB. Shows side-by-side comparison, user confirms Discard / Keep Both / Merge. Prevents double-counting in all analytics.

### 9.6 Data Model Changes

Add three columns to `receipts` table (additive, backward-compatible).

### 9.7 Infrastructure Changes

- Add `blockhash-js` or `sharp` to Lambda OCR job
- Add two indexes on `receipts` (content_hash, phash)
- No additional AWS services required

---

## 10. Purchase Engine — Shopping Patterns + Direct Purchase

### Overview

Two-layer feature: Shopping Pattern Intelligence (Phase 2) builds behavioral intelligence on existing data. AI Purchase Order Builder (Phase 3) generates weekly order suggestions. Direct Purchase Integration (Phase 4) routes confirmed orders to retailer partner APIs.

**Roadmap slots:** Phase 2 (patterns), Phase 3 (order builder), Phase 4 (direct purchase)
**Version bump:** extends v2.0 → v3.0
**Status:** ✅ Specced

### 10.1 Layer 1 — Shopping Pattern Intelligence (Phase 2)

New background job runs post-OCR via SQS. Updates `shopping_patterns` table per user per item with:

- `avg_restock_days` — rolling average days between purchases
- `next_predicted_at` — predicted next purchase date
- `preferred_store` — store where item is most frequently purchased
- `confidence_score` — reliability of the prediction

**New table: `shopping_patterns`**

```
id (uuid, PK) · user_id (FK → users) · item_name_normalized
avg_restock_days · last_purchased_at · next_predicted_at
avg_unit_price · preferred_store · confidence_score · updated_at
```

### 10.2 Layer 2 — AI Purchase Order Builder (Phase 3)

Weekly cron job generates suggested purchase orders per user. Claude receives:
- Items predicted to be needed within next 7 days (from shopping_patterns)
- Current local prices from price_history + vendor comparison
- User's monthly budget per category
- Preferred stores

Claude returns a ranked, cost-optimized suggested order grouped by store.

**New table: `purchase_orders`**

```
id (uuid, PK) · user_id (FK → users)
status ('draft'|'confirmed'|'placed'|'delivered')
source ('ai_suggested'|'manual') · items (jsonb array)
estimated_total · actual_total (nullable) · store_chain
external_order_id (nullable) · placed_at (nullable) · created_at
```

### 10.3 Layer 3 — Direct Purchase Integration (Phase 4)

| API | Verdict | Notes |
|-----|---------|-------|
| Instacart Connect | ✅ Start here | 1,400+ retailers, OAuth 2.0 |
| Kroger API | ✅ Feasible | Public developer portal |
| Walmart+ | ⚠️ Invite-only | Apply to partner program early |
| Amazon Fresh | ❌ No public API | Against ToS |
| DoorDash Drive | ✅ Feasible | Good for local store delivery |

### 10.4 Key Risks

| Risk | Level | Mitigation |
|------|-------|-----------|
| API availability and store coverage | HIGH | Instacart-first (1,400+ retailers via one integration) |
| Price discrepancy liability | HIGH | Estimate disclaimer + post-delivery reconciliation |
| PCI-DSS compliance | HIGH | OAuth only — never handle card data |
| Item substitution handling | MEDIUM | Expose substitution preferences; push on substitution |
| Order failure / cancellation | MEDIUM | Webhook for order status; clear error states |
| Retailer ToS changes | MEDIUM | Abstract behind unified interface; Instacart + Kroger redundancy |
| Delivery fees eroding savings | LOW | Show net savings after fees; recommend pickup when fees negate savings |

### 10.5 Features Section Changes

**Phase 2 — Intelligence:** add:
- **Shopping Pattern Intelligence** — restock predictions, basket analysis, price-timing optimization

**Phase 3 — Smart Shopping:** add:
- **AI Purchase Order Builder** — weekly AI-generated order suggestion, cost-optimized by store, user reviews and confirms

**Phase 4 — Advanced:** add:
- **Direct Purchase Integration** — Instacart Connect pilot (OAuth only, never touch payment); auto-import delivery receipt to close analytics loop

### 10.6 Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Purchase orders generated | 3+ per active user/month | Validates pattern engine utility |
| Order confirmation rate | > 40% of suggested orders confirmed | Validates AI suggestion quality |
| Direct purchase pilot orders | 100+ in first metro market | Validates retailer API integration |
| Net savings after fees | > $0 average | Validates economic case for direct purchase |

