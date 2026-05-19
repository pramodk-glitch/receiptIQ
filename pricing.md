# ReceiptIQ — Monetisation & Pricing Strategy

> Updated per Requirement 8 (Market Strategy & Feature Optimisation).
> Pro raised from $4.99 → $6.99/month. Family raised from $7.99 → $9.99/month.
> Rationale: Monarch charges $8.33/month, YNAB charges $9.08/month.
> ReceiptIQ at $6.99/month is still 40% cheaper than Monarch while offering capabilities neither has.

---

## Summary

ReceiptIQ's infrastructure costs are low enough at Phase 1 scale that covering them requires very few paying users. The strategic question is not whether to charge, but when and how — and how to sequence free vs. paid to maximise both early adoption and long-term revenue.

---

## Phase 1 Infrastructure Costs to Cover

| Stage | Users | Monthly cost |
|---|---|---|
| Pre-launch | 0–10 | ~$45 |
| Early users | 10–100 | ~$50 |
| Getting traction | 100–500 | ~$140 |
| Phase 1 peak | 500–1,000 | ~$285 |

These numbers are small enough that a founder can absorb them personally during Phase 1 while validating the product.

---

## Recommended Pricing Model — Freemium

The freemium model is the right fit for ReceiptIQ because:
- It removes signup friction — users try before they commit
- Phase 1 free tier is genuinely useful (basic scanning + dashboard)
- Phase 2 intelligence features (price history, vendor comparison, net worth) create a clear, defensible upgrade moment
- Industry standard for consumer finance apps is 3–8% freemium conversion — enough to cover costs at modest scale

### Tier Structure

| Tier | Monthly | Annual | vs. Monarch ($8.33/mo) | vs. YNAB ($9.08/mo) |
|---|---|---|---|---|
| **Free** | $0 | $0 | — | — |
| **Pro** | $6.99/mo | $59.99/yr | 16% cheaper | 23% cheaper |
| **Family** | $9.99/mo | $89.99/yr | — | — |

### What Each Tier Includes

#### Free
- 30 receipt scans per month
- Basic spending dashboard
- Category breakdown
- 3 months of receipt history
- Manual entry
- Mobile + web access

#### Pro — $6.99/mo
- Unlimited receipt scans
- Full price history per item (crowd-sourced + AI-estimated)
- Cross-vendor price comparison
- All 40+ analytics reports
- Custom date range reports + labelled spending periods
- Net worth tracking (Plaid bank + investment sync)
- Plaid bank sync — ongoing live transaction feed
- Goals tracking + gamification streaks
- Budget alerts + predictive spend forecasting
- 12 months of receipt history
- CSV / PDF export + tax year summary
- Auto-ingestion (Gmail, Outlook, forward-to-email)
- Push notifications + weekly digest
- Bills & checks ingestion
- AI Spending Assistant — ask anything about your data
- Amazon order history CSV import
- Bulk camera roll + cloud storage scan
- Bank / credit card import — Plaid transaction history

#### Family — $9.99/mo
- Everything in Pro
- Up to 5 household members
- Shared analytics dashboard ("Yours / Mine / Ours" view)
- Shared goals and budgets
- Per-member contribution tracking
- Household net worth view
- Unified receipt history across members

---

## Break-Even Analysis

### At $6.99/mo (Pro)

| Monthly infra cost | Paid users needed | As % of 1,000 users |
|---|---|---|
| $45 (pre-launch) | 7 | < 1% |
| $140 (500 users) | 20 | 4.0% |
| $285 (1,000 users) | 41 | 4.1% |

Break-even at 4.1% conversion is well within the 3–8% industry range.

### At $9.99/mo (Family, if majority adopt)

| Monthly infra cost | Paid users needed |
|---|---|
| $45 | 5 |
| $140 | 14 |
| $285 | 29 |

### At $0/mo (fully free Phase 1)
Founder absorbs $45–285/month for 10–14 weeks = **~$400–1,000 total out of pocket** to reach Phase 2 launch.

---

## Revenue Projections

Assumes freemium model, 5% Pro conversion, 1% Family conversion, rest on Free.

| Total users | Free | Pro ($6.99) | Family ($9.99) | Monthly revenue |
|---|---|---|---|---|
| 100 | 94 | 5 | 1 | $44.94 |
| 250 | 235 | 12 | 2 | $103.86 |
| 500 | 470 | 25 | 5 | $224.70 |
| 1,000 | 940 | 50 | 10 | $449.40 |
| 2,500 | 2,350 | 125 | 25 | $1,123.50 |
| 5,000 | 4,700 | 250 | 50 | $2,247.00 |
| 10,000 | 9,400 | 500 | 100 | $4,494.00 |
| 25,000 | 23,500 | 1,250 | 250 | $11,235.00 |
| 50,000 | 47,000 | 2,500 | 500 | $22,470.00 |

---

## Cost Breakdown by Scale

| Total users | AWS | Claude API | Apple/Other | Total costs |
|---|---|---|---|---|
| 100 | $34 | $8 | $8 | $50 |
| 250 | $34 | $18 | $8 | $60 |
| 500 | $80 | $35 | $8 | $123 |
| 1,000 | $150 | $68 | $28 | $246 |
| 2,500 | $280 | $165 | $28 | $473 |
| 5,000 | $450 | $325 | $54 | $829 |
| 10,000 | $750 | $645 | $54 | $1,449 |
| 25,000 | $1,400 | $1,600 | $80 | $3,080 |
| 50,000 | $2,500 | $3,200 | $80 | $5,780 |

---

## Profit & Loss Projections — 100 to 50,000 Users

| Total users | Monthly revenue | Monthly costs | Monthly P&L | Annual P&L |
|---|---|---|---|---|
| 100 | $44.94 | $50 | **-$5** | **-$60** |
| 250 | $103.86 | $60 | **+$44** | **+$528** |
| 500 | $224.70 | $123 | **+$102** | **+$1,224** |
| 1,000 | $449.40 | $246 | **+$203** | **+$2,436** |
| 2,500 | $1,123.50 | $473 | **+$651** | **+$7,812** |
| 5,000 | $2,247.00 | $829 | **+$1,418** | **+$17,016** |
| 10,000 | $4,494.00 | $1,449 | **+$3,045** | **+$36,540** |
| 25,000 | $11,235.00 | $3,080 | **+$8,155** | **+$97,860** |
| 50,000 | $22,470.00 | $5,780 | **+$16,690** | **+$200,280** |

---

## Key Milestones

| Milestone | Happens at | Monthly P&L |
|---|---|---|
| **Break-even** | ~175 users | ~$0 |
| **First $100/mo profit** | ~450 users | +$102 |
| **First $1,000/mo profit** | ~5,000 users | +$1,418 |
| **Ramen profitable** (solo founder ~$3,500/mo) | ~12,000 users | +$3,045–3,500 |
| **Small team profitable** (3 people ~$15,000/mo) | ~40,000 users | +$13,000+ |
| **Fundable / acquirable revenue** ($1M ARR) | ~180,000 users | +$83,000/mo |

> **Pricing impact:** Raising from $4.99 to $6.99/month cuts the path to ramen profitable nearly in half — from ~22,000 users to ~12,000. The higher price signals premium positioning and aligns with market expectations set by Monarch ($8.33/mo) and YNAB ($9.08/mo).

---

## What the Numbers Tell You

**At 100 users — -$5/mo**
Losing $5/month — negligible. Cheaper than a streaming subscription to run a live product with real users. Goal here is feedback, not profit.

**At 175 users — breakeven**
7 paying Pro users cover all infrastructure costs. Product is self-funding from here.

**At 1,000 users — +$203/mo**
Modest but meaningful. Model works. Reinvest in features to accelerate growth.

**At 5,000 users — +$1,418/mo**
Real side income. Funds one part-time contractor or meaningful marketing spend.

**At 12,000 users — ~ramen profitable**
Full-time income for a solo founder in most cities. Half the users needed vs. the $4.99 model.

**At 25,000 users — +$8,155/mo**
Supports 2 people comfortably. Growth is now self-reinforcing if profits are reinvested.

**At 50,000 users — +$16,690/mo**
Small team of 3. At this point raising a seed round or fielding acquisition interest.

---

## Sensitivity Analysis — At 1,000 Users, Varying Conversion

| Pro conversion | Paying users | Monthly revenue | Monthly P&L |
|---|---|---|---|
| 2% (pessimistic) | 20 | $179.70 | **-$66** |
| 5% (base case) | 50 | $449.40 | **+$203** |
| 8% (optimistic) | 80 | $719.10 | **+$473** |
| 12% (best case) | 120 | $1,078.70 | **+$833** |

Even at 2% conversion (pessimistic), losses are only $66/month — trivially absorbable. The upside at 8–12% conversion is substantial. **The Pro waitlist during Phase 1 pre-qualifies users with intent to pay, pushing effective conversion well above the 5% average.**

---

## Pricing Timeline — When to Charge

### Phase 1 — Go Free (Q1–Q2 2025)
Free only, no paid tiers. Infrastructure costs ~$50/month — trivially absorbable. Goal: 200–500 engaged users, feedback data, Pro waitlist.

### Phase 2 — Launch Pro at $6.99/mo (Q2–Q3 2025)
Price history, vendor comparison, net worth tracking, and Plaid bank sync ship. These justify charging. Waitlist converts at 2–3× cold users.

**Founder discount:** first 30 days on the waitlist get $4.99/mo for life. Rewards early adopters, drives word-of-mouth.

### Phase 3 — Introduce Family at $9.99/mo (Q3–Q4 2025)
Household mode v1 ships in Phase 2 — introduce the Family tier alongside it. One Family subscription replaces 2 individual Pro subscriptions.

### Phase 4 — Full Pricing + Annual Plans (Q4 2025+)
Push annual plan adoption. Target 40% of paying users on annual plans within 12 months — annual users churn at roughly half the rate of monthly users.

---

## Annual Plan Strategy

| Tier | Monthly | Annual | Saving | Cash upfront |
|---|---|---|---|---|
| Pro | $6.99/mo | $59.99/yr | 28% | $59.99 |
| Family | $9.99/mo | $89.99/yr | 25% | $89.99 |

---

## Competitive Pricing Context

| App | Price | What it offers | Differentiator |
|---|---|---|---|
| Mint (RIP) | Free | Budgeting, bank sync | Dead — 25M users displaced |
| Monarch Money | $99.99/yr ($8.33/mo) | Bank sync, budgeting, net worth, couples | Post-Mint winner, $20M+ ARR |
| YNAB | $109/yr ($9.08/mo) | Zero-based budgeting methodology | Loyal community, behaviour change |
| Copilot | ~$95/yr | Apple-only, AI categorisation | Best design, iOS/Mac only |
| Quicken Simplifi | ~$47/yr | Basic budgeting, bank sync | Cheapest paid option |
| **ReceiptIQ Pro** | **$59.99/yr ($6.99/mo)** | Receipt intelligence + bills + price comparison + AI chat + net worth | **Only app with line-item price history** |

ReceiptIQ is priced between Simplifi and Monarch — positioned as premium but accessible, and the only app that does something none of the others can.

---

## Claude API Cost Mitigation at Scale

### 1. Response caching
Hash every uploaded receipt image. Same image uploaded twice returns cached extraction — no API call.

### 2. Scan limits as cost control
Free tier: 30 scans/month = max ~$0.50 Claude API per free user per month.
Pro: unlimited, but Pro users pay $6.99/month — even 300 scans/month = ~$4.80 in API cost with $2.19 margin before AWS.

### 3. Tiered model quality
- Free: Claude Haiku (~75% cheaper) — sufficient for standard line-item extraction
- Pro: Claude Sonnet — higher accuracy for complex receipts, medical bills, handwritten items
- AI Spending Assistant: Claude Sonnet always — accuracy is non-negotiable for financial data

### 4. Chatbot cost control
- AI Spending Assistant is Pro-only — free users never generate chatbot costs
- Context injection pre-computed and cached for 15 minutes per session
- Conversation history summarised after 10 turns to bound token counts
- Estimated chatbot cost per active Pro user: ~$0.35/month — well within $6.99 margin

---

## Historical Import Tier Limits

| Tier | Bulk scan | Amazon CSV | Plaid (ongoing) | Cloud storage |
|---|---|---|---|---|
| Free | 30 historical scans | ✗ | ✗ | ✗ |
| Pro | Unlimited | ✓ | ✓ | ✓ |
| Family | Unlimited (per member) | ✓ | ✓ per member | ✓ |

---

## Users Needed to Cover Infrastructure — Quick Reference

At $6.99/mo Pro, 5% conversion, mixed monthly/annual.

| Break-even goal | Paid users needed | Total users (at 5% conversion) |
|---|---|---|
| Cover pre-launch infra ($45/mo) | 7 | ~140 |
| Cover 500-user infra ($140/mo) | 20 | ~400 |
| Cover 1,000-user infra ($285/mo) | 41 | ~820 |
| First $1,000/mo revenue | 143 | ~2,860 |
| First $5,000/mo revenue | 715 | ~14,300 |
| Ramen profitable (solo founder) | ~500 | ~12,000 |

---

## Recommendation Summary

| Phase | Pricing | Goal |
|---|---|---|
| Phase 1 (Q1–Q2 2025) | Free only + Pro waitlist | 200–500 engaged users, feedback data |
| Phase 2 (Q2–Q3 2025) | Free + Pro $6.99/mo | 50+ paying users, prove willingness to pay |
| Phase 3 (Q3–Q4 2025) | Free + Pro + Family $9.99/mo | 200+ paying users, cover all costs |
| Phase 4 (Q4 2025+) | Full pricing + annual plans | 1,000+ paying users, growth mode |
