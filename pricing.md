# ReceiptIQ — Monetisation & Pricing Strategy

---

## Summary

ReceiptIQ's infrastructure costs are low enough at Phase 1 scale that covering them requires very few paying users. The strategic question is not whether to charge, but **when** and **how** — and how to sequence free vs. paid to maximise both early adoption and long-term revenue.

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
- Phase 2 intelligence features (price history, vendor comparison) create a clear, defensible upgrade moment
- Industry standard for consumer finance apps is 3–8% freemium conversion — enough to cover costs at modest scale

### Tier Structure

| Tier | Price | Target user |
|---|---|---|
| **Free** | $0/mo | Casual users, new signups |
| **Pro** | $4.99/mo | Power users who want intelligence |
| **Family** | $7.99/mo | Households with multiple members |

### What Each Tier Includes

#### Free
- 30 receipt scans per month
- Basic spending dashboard
- Category breakdown
- 3 months of receipt history
- Manual entry
- Mobile + web access

#### Pro — $4.99/mo
- Unlimited receipt scans
- Full price history per item
- Cross-vendor price comparison
- All 40+ analytics reports
- Custom date range reports
- Labelled spending periods
- Budget alerts
- Predictive spend forecasting
- 12 months of receipt history
- CSV / PDF export
- Auto-ingestion (Gmail, Outlook, forward-to-email)
- Push notifications + weekly digest
- Bills & checks ingestion
- **AI Spending Assistant** — ask anything about your data in plain English
- **Amazon order history CSV import** — years of history in one upload
- **Bulk camera roll + cloud storage scan** — Google Drive, Dropbox
- **Bank / credit card import** — Plaid transaction history (12–24 months)

#### Family — $7.99/mo
- Everything in Pro
- Up to 5 household members
- Shared analytics dashboard
- Split-contribution view
- Household budget management
- Unified receipt history across members

---

## Break-Even Analysis

### At $4.99/mo (Pro)

| Monthly infra cost | Paid users needed | As % of 1,000 users |
|---|---|---|
| $45 (pre-launch) | 9 | < 1% |
| $140 (500 users) | 28 | 5.6% |
| $285 (1,000 users) | 57 | 5.7% |

Industry freemium conversion for consumer finance apps: **3–8%**. Break-even at 5.7% is comfortably within the expected range.

### At $2.99/mo (flat, no freemium)

| Monthly infra cost | Paid users needed |
|---|---|
| $45 | 16 |
| $140 | 47 |
| $285 | 96 |

### At $7.99/mo (Family, if majority adopt)

| Monthly infra cost | Paid users needed |
|---|---|
| $45 | 6 |
| $140 | 18 |
| $285 | 36 |

---

## Revenue Projections

Assumes freemium model, 5% Pro conversion, 1% Family conversion, rest on Free.

| Total users | Free | Pro ($4.99) | Family ($7.99) | Monthly revenue | Annual revenue |
|---|---|---|---|---|---|
| 100 | 94 | 5 | 1 | ~$33 | ~$396 |
| 500 | 470 | 25 | 5 | ~$165 | ~$1,980 |
| 1,000 | 940 | 50 | 10 | ~$329 | ~$3,948 |
| 5,000 | 4,700 | 250 | 50 | ~$1,647 | ~$19,764 |
| 10,000 | 9,400 | 500 | 100 | ~$3,294 | ~$39,528 |
| 50,000 | 47,000 | 2,500 | 500 | ~$16,470 | ~$197,640 |

Revenue becomes meaningful at 10,000+ users. The goal of Phase 1–2 is to get to 5,000–10,000 engaged users, not to generate significant revenue — that comes in Phase 3–4 when the intelligence and auto-ingestion features justify the Pro price clearly.

---

## Pricing Timeline — When to Charge

### Phase 1 — Go Free (Q1–Q2 2025)

**Recommendation: Free only, no paid tiers yet.**

Rationale:
- Phase 1 doesn't include price history, vendor comparison, or auto-ingestion — the features that most justify paying
- Asking $4.99/month for a basic receipt scanner with a dashboard is a hard sell
- The goal is to get 200–500 real users scanning real receipts and generating feedback data
- Infrastructure cost is $45–140/month — trivially absorbable as a founder

Actions:
- Launch free with no credit card required
- Add a "Pro waitlist" in the app — let users express intent to pay without charging yet
- Track which features free users ask for most — that data informs what goes in the paid tier

### Phase 2 — Soft Launch Paid Tiers (Q2–Q3 2025)

**Recommendation: Introduce Pro at $4.99/mo when price history and vendor comparison ship.**

Rationale:
- "See every price you've ever paid for any item, and where it's cheapest right now" is a clear, defensible value proposition
- Waitlist users from Phase 1 convert at 2–3× the rate of cold users — they've already expressed intent
- Grandfathering early users at a discounted rate ($2.99/mo for life) rewards early adopters and creates word-of-mouth

Actions:
- Email the Pro waitlist with a founder discount: $2.99/mo for life if they subscribe in the first 30 days
- Keep Free tier generous enough that users stay engaged and refer friends
- Introduce annual plan: $39.99/year (33% discount vs. monthly) to improve cash flow

### Phase 3 — Full Pricing (Q3–Q4 2025)

**Recommendation: Introduce Family tier when household mode ships.**

- Family at $7.99/mo targets a different segment — households where multiple people shop
- One Family subscription replaces what would otherwise be 2–3 individual Pro subscriptions
- Annual Family plan: $69.99/year

---

## Scan Limit Strategy (Free Tier)

The 30 scan/month free limit needs careful calibration:

| Limit | Risk | Benefit |
|---|---|---|
| Too low (< 15/mo) | Users hit the wall before they see value — churn before converting | Forces upgrade quickly |
| Too high (> 50/mo) | Most users never need to upgrade — poor conversion | High user satisfaction |
| 30/mo (recommended) | Average household generates 20–40 receipts/month — hits limit at moderate usage | Natural upgrade trigger |

**Alternative: scanless free tier** — instead of limiting scans, limit history to 3 months and lock intelligence features. Users can scan unlimited receipts but can't see price trends or run analytics. This is a softer gate that creates ongoing value without frustrating new users immediately.

---

## Claude API Cost Mitigation at Scale

As the user base grows, Claude API costs scale with every scan and every chatbot turn. Mitigations to implement from Phase 1:

### 1. Response caching
- Hash every uploaded receipt image (SHA-256)
- If the same image is uploaded again, return the cached extraction
- Cost: near zero. Saves significantly when users re-upload or test

### 2. Scan limits as a natural cost control
- Free tier capped at 30 scans/month = max ~$0.60 in Claude API per free user per month
- Pro tier unlimited — but Pro users are paying $4.99/month, so even 200 scans = $4 in API cost with $0.99 margin before AWS
- At high Pro usage, introduce a soft cap of 500 scans/month with a notification (not a hard block) — very few users will ever hit this

### 3. Tiered model quality
- Free tier: Claude Haiku (faster, cheaper, ~4× less expensive) — sufficient for basic line-item extraction
- Pro tier: Claude Sonnet (higher accuracy, better for complex receipts, medical bills, handwritten items)
- AI Spending Assistant: Claude Sonnet always — accuracy is non-negotiable for financial data
- Estimated saving: reduces free-tier API cost by ~75%

### 4. Chatbot cost control (Phase 3+)
- AI Spending Assistant is Pro-only — free users never generate chatbot costs
- Context injection is pre-computed server-side and cached for 15 minutes — repeated questions in a session reuse the same context without re-fetching
- Conversation history is summarised after 10 turns rather than passing full history — keeps token counts bounded
- Estimated chatbot cost per active Pro user: ~$0.35/month — well within the $4.99 Pro margin

---

## Competitive Pricing Context

| App | Price | What it offers |
|---|---|---|
| Expensify | $4.99–$9/mo | Business expense management |
| Skwad | Freemium | Household budgeting |
| YNAB | $14.99/mo | Budgeting only, no receipt scanning |
| Mint (now defunct) | Free | Basic budgeting, no scanning |
| Copilot | $13.99/mo | Bank-linked budgeting, no scanning |
| **ReceiptIQ Pro** | **$4.99/mo** | Full receipt intelligence + bills + price comparison |

At $4.99/month, ReceiptIQ is priced below YNAB and Copilot while offering capabilities neither provides (receipt scanning, price comparison, vendor intelligence). The price point is defensible and leaves room to move to $6.99–7.99 as the feature set matures.

---

## Annual Plan Strategy

Offering annual plans improves cash flow and reduces churn.

| Tier | Monthly | Annual | Saving | Cash upfront |
|---|---|---|---|---|
| Pro | $4.99/mo | $39.99/yr | 33% | $39.99 |
| Family | $7.99/mo | $69.99/yr | 27% | $69.99 |

Target: 40% of paying users on annual plans within 12 months of launch. Annual users churn at roughly half the rate of monthly users.

---

## Users Needed to Cover Infrastructure — Quick Reference

Assumes $4.99/mo Pro, 5% conversion, mixed monthly/annual.

| Break-even goal | Paid users needed | Total users needed (at 5% conversion) |
|---|---|---|
| Cover pre-launch infra ($45/mo) | 9 | ~180 |
| Cover 500-user infra ($140/mo) | 28 | ~560 |
| Cover 1,000-user infra ($285/mo) | 57 | ~1,140 |
| First $1,000/mo revenue | 200 | ~4,000 |
| First $5,000/mo revenue | 1,001 | ~20,000 |
| Ramen profitable (solo founder) | ~2,000 | ~40,000 |

**Key insight:** infrastructure break-even is not the hard part. Getting to 200 paying users is the milestone that matters — it proves willingness to pay and funds continued development. Getting to 2,000 paying users (~40,000 total) is what makes this a sustainable solo or small-team business.

---

## Profit & Loss Projections — 100 to 50,000 Users

Assumptions:
- **Conversion:** 5% Pro ($4.99/mo), 1% Family ($7.99/mo), 94% Free
- **Claude API:** ~$0.016 per scan, avg 5 scans/month per free user, 20 scans/month per Pro/Family user
- **Haiku for free tier** (75% cheaper), **Sonnet for Pro/Family**
- **AWS + third-party costs** scaled per the Phase 1 cost breakdown
- **Apple Developer:** $8/mo fixed
- Figures are monthly unless stated

---

### User & Revenue Breakdown

| Total Users | Free | Pro (5%) | Family (1%) | Monthly Revenue |
|---|---|---|---|---|
| 100 | 94 | 5 | 1 | $32.94 |
| 250 | 235 | 12 | 2 | $75.86 |
| 500 | 470 | 25 | 5 | $164.75 |
| 1,000 | 940 | 50 | 10 | $329.50 |
| 2,500 | 2,350 | 125 | 25 | $823.75 |
| 5,000 | 4,700 | 250 | 50 | $1,647.50 |
| 10,000 | 9,400 | 500 | 100 | $3,295.00 |
| 25,000 | 23,500 | 1,250 | 250 | $8,237.50 |
| 50,000 | 47,000 | 2,500 | 500 | $16,475.00 |

---

### Cost Breakdown by Scale

| Total Users | AWS | Claude API | Apple/Other | Total Costs |
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

*AWS costs reflect infrastructure scaling: larger RDS, Fargate autoscaling, ElastiCache cluster growing with user base. Claude API costs assume Haiku for free-tier scans and Sonnet for Pro/Family.*

---

### Profit & Loss

| Total Users | Monthly Revenue | Monthly Costs | Monthly P&L | Annual P&L |
|---|---|---|---|---|
| 100 | $32.94 | $50 | **-$17** | **-$204** |
| 250 | $75.86 | $60 | **+$16** | **+$192** |
| 500 | $164.75 | $123 | **+$42** | **+$504** |
| 1,000 | $329.50 | $246 | **+$84** | **+$1,008** |
| 2,500 | $823.75 | $473 | **+$351** | **+$4,212** |
| 5,000 | $1,647.50 | $829 | **+$819** | **+$9,828** |
| 10,000 | $3,295.00 | $1,449 | **+$1,846** | **+$22,152** |
| 25,000 | $8,237.50 | $3,080 | **+$5,158** | **+$61,896** |
| 50,000 | $16,475.00 | $5,780 | **+$10,695** | **+$128,340** |

---

### Key Milestones

| Milestone | Happens at | Monthly P&L |
|---|---|---|
| **Break-even** | ~220 users | ~$0 |
| **First $100/mo profit** | ~500 users | +$42 |
| **First $1,000/mo profit** | ~6,500 users | +$1,000 |
| **Ramen profitable** (solo founder ~$3,500/mo) | ~22,000 users | +$3,500 |
| **Small team profitable** (3 people ~$15,000/mo) | ~50,000 users | +$10,695 |
| **Fundable / acquirable revenue** ($1M ARR) | ~170,000 users | +$83,000/mo |

---

### What the Numbers Tell You

**At 100 users — -$17/mo**
You're losing $17/month. That's not a concern — it costs less than a Netflix subscription to run a live product with real users. The goal here is feedback, not profit.

**At 220 users — breakeven**
This is the first real milestone. Roughly 11 paying Pro users cover your costs entirely. At this point the product is self-funding.

**At 1,000 users — +$84/mo**
Modest but meaningful. You've proven the model works. The product funds its own hosting with a small surplus. Reinvest in features.

**At 5,000 users — +$819/mo**
Starting to feel like a real business. This covers a part-time contractor for ongoing development, or funds marketing to accelerate growth.

**At 10,000 users — +$1,846/mo**
A solid side income for a solo founder. Enough to fund one junior contractor full-time. Growth at this stage becomes self-reinforcing if you reinvest.

**At 25,000 users — +$5,158/mo**
A full-time income for a solo founder in most cities. The product is now a real business.

**At 50,000 users — +$10,695/mo**
Supports a small team of 2–3 people. At this point you're likely raising a seed round or considering acquisition offers.

---

### Sensitivity Analysis — What If Conversion Is Higher or Lower?

At 1,000 users, varying the Pro conversion rate:

| Pro conversion | Paying users | Monthly revenue | Monthly P&L |
|---|---|---|---|
| 2% (pessimistic) | 20 | $131.80 | **-$114** |
| 5% (base case) | 50 | $329.50 | **+$84** |
| 8% (optimistic) | 80 | $527.20 | **+$281** |
| 12% (best case) | 120 | $790.80 | **+$545** |

The business is very sensitive to conversion rate in the early stages. A 2% conversion at 1,000 users means you're still losing money. An 8% conversion — entirely achievable with strong product-market fit — means $281/month in profit at the same user count. **This is why the Pro waitlist during Phase 1 matters** — it pre-qualifies users who intend to pay, pushing your effective conversion rate well above the 5% industry average.

---

## Recommendation Summary

| Phase | Pricing | Goal |
|---|---|---|
| Phase 1 (Q1–Q2 2025) | Free only + Pro waitlist | 200–500 engaged users, feedback data |
| Phase 2 (Q2–Q3 2025) | Free + Pro $4.99/mo | 50+ paying users, prove willingness to pay |
| Phase 3 (Q3–Q4 2025) | Free + Pro + Family $7.99/mo | 200+ paying users, cover all costs |
| Phase 4 (Q4 2025+) | Full pricing + annual plans | 1,000+ paying users, growth mode |
