
---

## Duplicate Detection — API Cost Impact

Duplicate detection adds a negligible cost per upload and significantly reduces wasted Claude API spend:

**pHash computation:** ~1ms CPU per image, no API cost.

**Content fingerprint:** SHA-256 hash, no API cost.

**Benefit:** A user who uploads the same receipt photo twice would previously incur two Claude Vision OCR calls (~$0.02 each). With duplicate detection, the second call is blocked — the cached extraction is returned instead. At 5,000 scans/month with a realistic 3% accidental duplicate rate, this saves ~150 Claude API calls/month (~$3/month). Scales meaningfully at 50k+ users.

This integrates with the existing **response caching** mitigation (hash receipt image → return cached extraction on match) and extends it to cover near-duplicate images via pHash, not just exact file-hash matches.

---

## Purchase Engine — Cost Considerations

### Layer 1 — Shopping Pattern Intelligence

No external API costs. Pattern analysis runs on internal PostgreSQL + TimescaleDB queries. The only cost is compute time for the background SQS job that updates `shopping_patterns` after each receipt ingestion — negligible at any scale.

### Layer 2 — Direct Purchase Integration

ReceiptIQ does not charge transaction fees on purchases. Revenue model remains subscription-only.

**API costs:**
- Instacart Connect: no API call fee per order; partnership agreement determines commercial terms
- Kroger API: free developer tier; commercial terms negotiated separately
- DoorDash Drive: per-delivery dispatch fee (passed through to user or absorbed into Family tier)

**Delivery fee transparency:** The confirmation screen shows:
```
Grocery subtotal (estimated):  $47.23
Instacart service fee:          $3.99
Delivery fee:                   $7.99
Tip (editable):                 $5.00
                              --------
Total (estimated):             $64.21

Your receipt-based savings:    $4.18
Net savings after fees:        -$8.80  ← shown prominently
```

When net savings are negative, the app recommends **in-store pickup** instead of delivery.

**Pro/Family tier only:** Direct Purchase is a Pro and Family feature. Free tier users can build purchase orders and export them as lists but cannot place orders directly.

---

## Updated Pro Tier Features

The Pro tier now includes:

- Unlimited receipt scans
- Full price history per item
- Cross-vendor price comparison
- All 45+ analytics reports
- Custom date range reports + labelled spending periods
- Net worth tracking (Plaid bank + investment sync)
- Goals tracking + gamification streaks
- Budget alerts + predictive spend forecasting
- 12 months of receipt history
- CSV / PDF export + tax year summary
- Auto-ingestion (Gmail, Outlook, forward-to-email)
- Push notifications + weekly digest
- Bills & checks ingestion
- **AI Spending Assistant** — ask anything about your data
- **AI Purchase Order Builder** — weekly pattern-driven order suggestions
- **Direct Purchase Integration** — Instacart, Kroger (Phase 4 launch)
- Amazon order history CSV import
- Bulk camera roll + cloud storage scan
- Bank / credit card import — Plaid transaction history

