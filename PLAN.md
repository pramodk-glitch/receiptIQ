# ReceiptIQ — Pending Changes Staging Plan

## What is ReceiptIQ?

ReceiptIQ is an AI-powered, multi-category expense tracker that turns receipts, bills, and checks into deep financial intelligence. It automatically captures every purchase — via camera scan, email ingestion, or browser extension — and provides item-level price history, cross-vendor price comparison, smart shopping list estimation, and 35+ analytics reports across spending, inflation, savings, and forecasting.

Unlike existing apps that cover only groceries or only business expenses, ReceiptIQ tracks the full picture of a person's spend: retail, dining, utilities, subscriptions, travel, medicine, insurance, and more. The core differentiator is that no manual data entry is required — receipts flow in automatically from 20+ retailers via Gmail, Outlook, or a personal forwarding address, and bills are captured the moment they land in the user's inbox with an instant push notification for one-tap approval.

**Platform:** iOS · Android · Web  
**AI:** Powered by Claude (Vision OCR, price comparison, shopping list estimation)  
**Stack:** React Native · Next.js · Node.js · PostgreSQL · AWS

---

> Changes queued here will be merged into `ReceiptIQ_ProductPlan.jsx` once all requirements are finalized.

---

## Document Summary

| # | Requirement | Version Bump | Roadmap Slot | Status |
|---|---|---|---|---|
| 1 | Auto-Ingestion (retailers via email, browser extension, API) | v1.0 → v2.0 | Phase 4A, 4B + Q1 2026 | ✅ Specced |
| 2 | Bills & Checks Auto-Ingestion + Weekly Review Flow | v2.0 → v3.0 | Phase 4B, 4C, Phase 5 | ✅ Specced |
| 3 | Instant Push Notifications for Ingestion Approval | v3.0 → v3.1 | Phase 4B | ✅ Specced |
| 4 | Custom Date Range Spending Pattern Reports | v3.1 → v3.2 | Phase 3 | ✅ Specced |

*Additional requirements will be appended below as they are finalized.*

---

## Base Product Plan

> This section captures the full original product plan content from `ReceiptIQ_ProductPlan.jsx` for reference. The Requirements sections below this describe all pending changes to be merged on top of this base.

---

### Market Gap

No existing app offers the full combination of multi-category receipt scanning + item-level price history + live vendor comparison + AI shopping list estimation + automatic retailer ingestion. ReceiptIQ occupies a unique position:

1. No single app combines receipt scanning + multi-category tracking + vendor price comparison + shopping list estimation
2. No app covers non-grocery categories (electronics, medicine, stationery) at item level
3. No app uses AI to estimate shopping list cost across local vendors in real time
4. No app tracks the same item's price inflation across stores over time
5. No app offers both mobile and full web portal with equal feature parity
6. No app automatically pulls receipts from Amazon, Costco, Walmart and other retailers via email or browser

---

### Competitor Analysis

**Verdict:** No existing app offers the full combination of multi-category receipt scanning + item-level price history + live vendor comparison + AI shopping list estimation + automatic retailer ingestion. ReceiptIQ occupies a unique position in this market.

| App | Focus | Strength | Gap | Pricing | Rating |
|---|---|---|---|---|---|
| **Groceries Tracker** | Grocery-only | AI OCR per item, store comparison, household sharing | No broad categories (medicine, electronics) | Freemium | ⭐ 4.6 |
| **Expensify** | Business expense mgmt | Industry-leading SmartScan OCR, multi-currency, policy enforcement | No item-level price tracking, no vendor comparison, not consumer-focused | $4.99–$9/mo | ⭐ 4.4 |
| **Skwad** | Household budgeting | Line-item extraction, cloud sync, receipt categorization | No vendor price comparison, no shopping list AI estimation | Freemium | ⭐ 4.2 |
| **Fetch Rewards** | Receipt rebates/loyalty | Any store receipt accepted, large user base | Rebate app only — zero spending analytics | Free (ad-supported) | ⭐ 4.3 |
| **GroceryTracker Pro** | Grocery budgeting | Household sharing, monthly trend charts, store totals | Grocery only, no cross-category analytics, no shopping AI | Free + Premium | ⭐ 4.5 |
| **Smart Receipts** | Tax documentation | Offline, open-source, CSV/PDF export | No auto-categorization, no analytics, no vendor comparison | Free / $2.99/mo | ⭐ 4.0 |
| **Ibotta / Checkout 51** | Cashback rebates | Stacks with price trackers, PayPal payout | No expense tracking, no analytics whatsoever | Free | ⭐ 4.2 |
| **Flipp / Basket** | Pre-purchase price compare | Real-time weekly flyer data, multi-store price check | No receipt ingestion, no spend history, no personal analytics | Free | ⭐ 4.1 |

---

### Core User Journeys

1. **📷 Upload Receipt** — Snap a photo → AI extracts every line item → stored with category, price, store, date
2. **⚡ Auto-Ingestion** — Connect Gmail or Costco → receipts flow in automatically — no scanning, no manual steps
3. **📈 Price Intelligence** — Click any item → see price history chart → AI fetches current vendor prices → shows savings opportunity
4. **🛒 Smart Shopping** — Type or upload your shopping list → AI estimates total cost per store → recommends optimal store split
5. **📊 Analytics** — Run 35+ reports across spending, inflation, behavior, savings, and forecasting
6. **🏠 Household Mode** — Multiple family members upload receipts → unified analytics → split-contribution view
7. **📋 Weekly Digest** — See every bill and check captured this week → auto-ingested after 24hrs → one-tap remove if needed

---

### Features — All Phases

#### Phase 1 — Core 🏗️
- **User Registration & Login** — Email/password + OAuth (Google, Apple). JWT-based sessions. Per-user encrypted data isolation.
- **Receipt Upload & OCR** — Upload photo, PDF, or screenshot. Claude Vision API extracts store name, date, total, and every line item with name, qty, unit price, total, and auto-detected category.
- **Line-Item Storage** — Each item stored individually in DB with user ID, receipt ID, date, store, category, unit price. Enables all downstream analytics.
- **Expense Dashboard** — Monthly spend overview, category breakdown pie chart, recent receipts list, quick stats (total this month, top category, biggest receipt).
- **Manual Entry** — Add items or receipts manually when no receipt is available.

#### Phase 2 — Intelligence 🧠
- **Item Price History** — Click any item to see every time it was purchased: date, store, price. Line chart shows price trend over time. Delta vs. first purchase shown prominently.
- **Vendor Price Comparison** — AI-powered lookup of current market price for the same item at Walmart, Target, Costco, Amazon, Whole Foods, Aldi, Kroger. Shows cheapest option and potential savings.
- **Category Analytics** — Deep-dive reports per category: spend trend, top items, average unit price, frequency of purchase, month-over-month change.
- **Inflation Tracker** — Track price changes for recurring items over time. Show % increase vs. 3mo/6mo/1yr ago. Compare personal inflation rate vs. CPI.
- **Store Performance** — Which stores you shop most, avg spend per visit, cost efficiency score (your price vs. market average).

#### Phase 3 — Smart Shopping 🛒
- **Shopping List Estimator** — Type or upload a shopping list. AI estimates cost per item using your price history + current market data. Shows total estimate per store. Recommends optimal store split.
- **Smart List Optimization** — Given a shopping list, AI suggests which store to buy each item from to minimize total cost. Accounts for travel effort with configurable store radius.
- **Budget Alerts** — Set monthly budgets per category. Real-time alerts when approaching or exceeding limits (push, email, SMS).
- **Predictive Spend** — Based on purchase patterns, forecast next month's spending per category. Highlight unusual spikes.

#### Phase 4 — Advanced 🚀
- **Auto-Ingestion — Email OAuth** — Connect Gmail or Outlook once. ReceiptIQ watches your inbox for receipts from 20+ retailers and ingests them automatically in the background.
- **Auto-Ingestion — Forward-to-Email** — Every user gets a unique receipts@receiptiq.app address. Forward any receipt email to it and it's auto-parsed and added.
- **Auto-Ingestion — Browser Extension** — Chrome/Safari extension pulls full order history from Amazon, Costco, Walmart.com, and Target.com on demand.
- **Bills & Checks Auto-Ingestion** — Automatically capture utility bills, restaurant checks, subscription invoices, travel receipts, and more from email. Covers the full picture of monthly spend, not just retail.
- **Instant Ingestion Approval** — Push notification fires within 30–60 seconds of ingestion. Tap Keep or Dismiss inline. Auto-ingests after 24hrs if no action. Weekly digest as audit trail.
- **Household / Family Mode** — Shared account for household. Multiple members upload receipts. Unified analytics. Split-contribution view.
- **Export & Integrations** — Export to CSV, PDF, Excel. Connect to Mint, YNAB, QuickBooks. Tax report generation for FSA/HSA medicine purchases.
- **Barcode Scanner** — Scan product barcode to instantly look up current prices across vendors without a receipt.
- **Subscription Detection** — Identify recurring charges (streaming, memberships) from receipts. Track subscription spend.
- **Loyalty Card Tracker** — Track loyalty points and rewards across stores. Show value of unredeemed rewards.

---

### Analytics Reports (35+)

#### 📊 Spending Overview
1. Monthly Total Spend — total expenditure by month with trend line and % MoM change
2. Weekly Spend Pattern — average spend per day of week; identify high-spend days
3. Category Spend Breakdown — pie + bar chart of spend across Groceries, Electronics, Medicine, etc.
4. Annual Summary Report — full year view with category heatmap and 12-month trend
5. Spend vs. Budget Tracker — actual vs. target per category per month
6. Average Transaction Size — mean receipt total per store with outlier flagging

#### 💰 Price Intelligence
7. Item Price History — purchase price over time for any item, with trend line and stats
8. Personal Inflation Report — % price increase for your recurring items vs. CPI benchmark
9. Vendor Price Matrix — side-by-side current price comparison for top 20 items across stores
10. Best Store by Category — which store gives best price per category
11. Price Anomaly Alerts — items that spiked >10% vs. your historical average
12. Price Opportunity Map — items where you overpaid vs. cheapest available vendor

#### 🔄 Purchasing Behavior
13. Purchase Frequency Report — how often you buy each item; flag items bought more than needed
14. Store Visit Analysis — frequency, average spend, category mix per store
15. Basket Composition Report — what categories you typically combine in one trip
16. Seasonal Spend Patterns — month-by-month category spend across years
17. Brand Preference Tracker — store-brand vs. name-brand spend ratio per category
18. Impulse Buy Detector — single-quantity items not on prior shopping patterns

#### 🏥 Health & Wellness
19. Medicine & Healthcare Spend — total medical spend per month with per-item breakdown
20. Personal Care Spend Trend — monthly spend on personal care items with product detail
21. Nutritional Budget Analysis — estimated spend on fresh produce vs. processed food
22. FSA / HSA Eligible Spend — auto-flag medicine receipts for tax reimbursement tracking

#### 💡 Savings & Optimization
23. Savings Opportunities Report — if you bought each item from the cheapest vendor, total savings
24. Duplicate Purchase Detector — same item bought within short window (possible pantry excess)
25. Bulk Buy ROI — items where buying in bulk at Costco/warehouse club saves vs. regular buys
26. Store-Switch Savings — estimated monthly savings if you switched primary store for top items
27. Coupon + Deal Gap Analysis — items frequently purchased that have recurring deals you missed

#### 🔮 Forecasting & Planning
28. Next Month Spend Forecast — ML-based prediction per category using 90-day rolling history
29. Shopping List Cost Estimate — predicted total for any planned shopping list
30. Annual Expense Projection — extrapolate current patterns to full-year estimate
31. Category Budget Recommendation — AI-suggested monthly budget per category based on patterns
32. Subscription & Recurring Cost Summary — identified recurring charges and their annual impact

#### 📋 Bills & Recurring *(new — added with Requirement 2)*
33. Monthly Bills Overview — total recurring obligations vs. discretionary spend
34. Utility Spend Trend — electric, gas, water month-over-month with seasonal overlay
35. Subscription Audit — all active subscriptions, monthly cost, last used date, annual total
36. Dining Out vs. Groceries — restaurant spend vs. grocery spend over time
37. Insurance Cost Tracker — all premiums across policies, annual total, renewal dates
38. True Monthly Obligations — fixed bills as % of income
39. Travel Spend Summary — flights, hotels, car rentals aggregated per trip
40. Bill Due Date Calendar — upcoming bills based on historical patterns with estimated amounts

---

### Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Web** | React 18 + TypeScript, Next.js 14 (App Router), TailwindCSS + shadcn/ui, Recharts / D3.js, React Query, PWA |
| **Mobile App** | React Native + Expo, native camera / OCR trigger, push notifications (Expo), offline-first with SQLite sync, App Store + Google Play |
| **Backend API** | Node.js + Express / Fastify, REST API + WebSockets, JWT auth + refresh tokens, rate limiting, OpenAPI docs, Stripe billing |
| **AI / Intelligence** | Claude Sonnet (Vision OCR, JSON extraction, vendor comparison, shopping list estimation), Claude Vision fallback for email parses, LangChain for chained workflows, vector embeddings for item name fuzzy matching |
| **Data Storage** | PostgreSQL (primary), Redis (sessions, cache, rate limiting), S3 (receipt images), Pinecone (vector embeddings), TimescaleDB (price time-series) |
| **Infrastructure** | AWS ECS Fargate, RDS, ElastiCache, Lambda, SNS, SQS, SES, CloudFront, Vercel (web), SendGrid Inbound Parse (email ingestion), GitHub Actions CI/CD, Sentry, Datadog |

---

### Data Schema

#### `users`
```
id (uuid, PK) · email (unique) · password_hash · display_name
created_at · subscription_tier · household_id (FK, nullable)
```

#### `receipts`
```
id (uuid, PK) · user_id (FK) · store_name · store_chain · receipt_date
total_amount · currency · image_url (S3) · raw_ocr_text · created_at
+ ingestion_source_id (FK, nullable) · + auto_ingested (boolean)
+ ingestion_confidence (float) · + external_order_id (nullable)
+ needs_review (boolean)
```

#### `receipt_items`
```
id (uuid, PK) · receipt_id (FK) · user_id (FK) · item_name
item_name_normalized · quantity · unit · unit_price · line_total
category · brand (nullable) · barcode (nullable) · created_at
+ item_type · + sensitivity · + redacted · + recurring_pattern_id (FK)
```

#### `price_history`
```
id (uuid, PK) · item_name_normalized · store_chain · unit_price · unit
captured_at · source ('receipt'|'vendor_api'|'ai_estimate') · user_id (nullable)
```

#### `shopping_lists`
```
id (uuid, PK) · user_id (FK) · name · created_at
estimated_total · list_items (jsonb array)
```

#### `ingestion_sources` *(new — Requirement 1)*
```
id (uuid, PK) · user_id (FK) · source_type · retailer_domain (nullable)
oauth_access_token (encrypted) · oauth_refresh_token (encrypted)
oauth_scope · connected_at · last_synced_at · status
```

#### `ingestion_log` *(new — Requirement 1)*
```
id (uuid, PK) · source_id (FK) · user_id (FK) · raw_email_id (hashed)
retailer_domain · parsed_at · confidence_score · receipt_id (FK, nullable)
failure_reason (nullable) · items_extracted (int)
```

#### `recurring_patterns` *(new — Requirement 2)*
```
id (uuid, PK) · user_id (FK) · source_name · category · average_amount
frequency · last_seen_at · auto_keep (boolean) · ingestion_source_id (FK)
```

#### `review_inbox` *(new — Requirement 2)*
```
id (uuid, PK) · user_id (FK) · receipt_id (FK) · captured_at
review_status · reviewed_at (nullable) · week_batch · auto_kept (boolean)
```

#### `device_tokens` *(new — Requirement 3)*
```
id (uuid, PK) · user_id (FK) · token · platform ('ios'|'android')
registered_at · last_active_at
```

#### `notification_log` *(new — Requirement 3)*
```
id (uuid, PK) · user_id (FK) · device_token_id (FK)
notification_type · receipt_ids (array) · total_amount
sent_at · actioned_at (nullable) · action (nullable) · fallback_to_weekly
```

---

### Roadmap

| Quarter | Theme | Key Deliverables |
|---|---|---|
| **Q1 2025** | Foundation | User auth, receipt upload + Claude OCR, line-item storage, basic dashboard, React Native skeleton, core REST API |
| **Q2 2025** | Intelligence | Price history charts, vendor price comparison (AI), store analytics, category trend reports, inflation tracker, mobile parity |
| **Q3 2025** | Smart Shopping | Shopping list estimator, store optimization AI, budget alerts, predictive spend forecasting, barcode scanner, household mode |
| **Q4 2025** | Auto-Ingestion + Bills | Gmail + Outlook OAuth ⚡, forward-to-email ⚡, bills ingestion (restaurants, subscriptions, travel), instant push notifications, weekly digest |
| **Q1 2026** | Full Life Spend | Inbox history backfill, 20+ retailer parsers, browser extension (Chrome + Safari), utilities + phone + rent ingestion, medical bill ingestion (Phase 5 begins), retailer API BD track |

---

### Platform Strategy

#### 📱 Mobile App (iOS + Android — React Native + Expo)
- Native camera for receipt scanning
- Push notifications for instant ingestion approval (Keep / Dismiss inline)
- Barcode scanner via device camera
- Offline receipt queue — syncs when back online
- Home screen widgets for quick spend view
- Face ID / Touch ID login

#### 🖥️ Web Portal (Next.js)
- Drag-and-drop receipt upload (batch)
- Full analytics dashboard with advanced charts
- Data export (CSV, PDF, Excel)
- PWA installable on desktop
- Admin panel for household managers
- Keyboard shortcuts for power users

#### Shared Architecture
- TypeScript shared packages for validation, formatting, API calls
- Single Node.js API serves both platforms
- WebSockets push receipt processing updates and budget alerts to both simultaneously
- JWT tokens work across web and mobile with refresh token rotation
- GitHub Actions deploys web to Vercel and mobile via Expo EAS Build + OTA updates

---

### Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| Receipts Scanned | 5,000 / month by Q2 | Validates OCR quality + user habit |
| Item Accuracy Rate | > 95% OCR precision | Ensures analytics are trustworthy |
| Weekly Active Users | > 40% of registered | Indicates genuine utility |
| Avg Receipts / User | 8+ per month | Signals complete household use |
| Email Connect Rate | > 30% of active users | Auto-ingestion adoption |
| Auto-Ingest Share | > 60% of receipts | Core differentiator validation |
| Parser Accuracy | > 92% confidence score | Data quality baseline |
| Push Opt-in Rate | > 70% of active users | Low opt-in kills notifications feature |
| Instant Action Rate | > 60% within 1 hour | Validates real-time UX |
| Notification Disable Rate | < 5% per month | Throttling working correctly |
| Weekly Digest Removal Rate | < 10% of auto-ingested items | Auto-ingest matches user intent |

---

## New Requirements

> The sections below describe all pending changes to be merged into `ReceiptIQ_ProductPlan.jsx`.

---

## 1. Auto-Ingestion Feature

### Overview
Enable users to connect Amazon, Costco, Walmart, and 20+ other retailers so receipts flow in automatically — no manual scanning needed.

**Roadmap slot:** Phase 4 (split into 4A and 4B)
**New section tab:** "Auto-Ingestion" (⚡)
**Version bump:** v1.0 → v2.0

---

### 1.1 Ingestion Channels

| Channel | Priority | Effort | Coverage |
|---|---|---|---|
| Email OAuth (Gmail + Outlook) | Phase 4A — Ship First | Medium | ~80% of use cases |
| Forward-to-Email (receipts@receiptiq.app) | Phase 4A — Ship Alongside | Low | Any retailer, any client |
| Browser Extension (Chrome + Safari) | Phase 4B — After Email | High | Amazon, Costco, Walmart, Target |
| Direct Retailer API (partnerships) | Phase 5 | Very High | Costco, Kroger, select grocery chains |

**Recommended build order:** Ship Gmail OAuth + forward-to-email together in Phase 4A — covers 80% of use cases with medium effort and minimal legal risk. Hold the browser extension until Phase 4B pending ToS legal review. Retailer APIs are a Phase 5 BD track.

---

#### Email OAuth (Gmail & Outlook)
User connects Gmail or Outlook via OAuth2. ReceiptIQ watches for emails from known retailer domains and auto-parses receipts in the background — no action needed after setup.

**Retailers covered:** Amazon, Walmart, Target, Costco, Whole Foods, Best Buy, Walgreens, CVS, Home Depot, DoorDash, Instacart, Uber Eats, Apple, IKEA

**Advantages**
- Works for any store that sends receipt emails
- One-time connect, fully automatic thereafter
- Works retroactively on inbox history (opt-in)
- Uses official OAuth APIs — no scraping

**Risks**
- Requires email access permission — needs clear privacy comms
- Retailer email formats change — parser needs maintenance
- Gmail/Outlook API rate limits apply

---

#### Forward-to-Email
Every user gets a unique forwarding address (e.g. `alex-7x3k@receipts.receiptiq.app`). Forward any receipt email to it and it's auto-ingested. No OAuth, no inbox access required.

**Advantages**
- No inbox access — minimal privacy concern
- Works with any email client, any retailer, internationally
- Simple inbound email infrastructure (SendGrid Inbound Parse)
- Great for users uncomfortable with OAuth

**Risks**
- Manual forward step required per receipt
- Users may forget to forward
- Need inbound email infrastructure setup

---

#### Browser Extension (Chrome + Safari)
Lightweight extension that detects retailer order history pages and offers one-click import. Also intercepts order confirmation pages in real time.

**Retailers covered:** Amazon (order history + confirmation pages), Costco.com (purchase history), Walmart.com, Target.com

**Advantages**
- Pulls full order history retroactively
- Real-time interception on confirmation pages
- Richer data than email (item images, ASINs)

**Risks**
- Requires extension install (friction)
- Against some retailers' ToS — legal review needed before shipping
- Page structure changes break the scraper
- Chrome Web Store review process

---

#### Direct Retailer API (Phase 5)
Formal API partnerships with retailers. User connects their loyalty account and ReceiptIQ pulls purchase data via official APIs.

**Retailers targeted:** Costco (member purchase API), Kroger / King Soopers, Albertsons, Safeway, Whole Foods (via Amazon account link)

**Advantages**
- Most reliable — official channel
- Richest data (barcodes, nutritional info)
- No ToS concerns
- Can back-fill years of purchase history

**Risks**
- Requires retailer BD deals — long sales cycles (6–18 months)
- Most major retailers have no public API
- Revenue share or API fees may apply

---

### 1.2 Email Parser Coverage

| Retailer | Domain | Confidence | Fields Extracted | Status |
|---|---|---|---|---|
| Amazon | amazon.com | 97% | Order ID, items, qty, price, delivery date | ✓ Ready |
| Walmart | walmart.com | 93% | Items, totals, store/online flag | ✓ Ready |
| Costco | costco.com | 91% | Items, membership#, warehouse | ✓ Ready |
| Target | target.com | 94% | Items, RedCard savings, store | ✓ Ready |
| Best Buy | bestbuy.com | 89% | Items, SKU, warranty info | ✓ Ready |
| Whole Foods | wholefoodsmarket.com | 88% | Items, Prime savings | ✓ Ready |
| Walgreens | walgreens.com | 85% | Items, rewards balance | ✓ Ready |
| CVS | cvs.com | 83% | Items, ExtraBucks | ✓ Ready |
| DoorDash | doordash.com | 96% | Restaurant, items, fees, tip | ✓ Ready |
| Instacart | instacart.com | 94% | Store, items, delivery fee | ✓ Ready |
| Apple | apple.com | 98% | App/item, price, Apple ID | ✓ Ready |
| Uber Eats | uber.com | 95% | Restaurant, items, promo | ✓ Ready |
| Home Depot | homedepot.com | 87% | Items, SKU, Pro account | Planned |
| IKEA | ikea.com | 82% | Items, article number | Planned |

**Claude Vision fallback:** When structured parsing confidence < 0.80, raw email HTML is passed to Claude Vision for extraction. Slower but handles novel formats.

**Parser maintenance:** Retailer email templates change ~2–4x per year. Each parser has a version hash; mismatches trigger re-training on the new template.

**Duplicate detection:** SHA-256 hash of (retailer + date + total + first 3 items). Prevents the same receipt being added via email + manual upload.

---

### 1.3 Privacy & Security

> Privacy is the #1 user objection. Strategy: request minimal scope, store nothing raw, be fully transparent, and make revoking access one tap.

| Measure | Detail |
|---|---|
| 🔐 Minimal Scope OAuth | Read-only access on emails from known receipt domains only — not full inbox. Uses Gmail's label filter scope. |
| 🗑️ Email Content Not Stored | Raw email HTML parsed in-memory and immediately discarded. Only extracted line-item data is stored. |
| 🔄 Revoke Anytime | One-tap disconnect from Settings. Revoking stops ingestion immediately and optionally deletes all auto-ingested receipts. |
| 🏷️ Transparent Sourcing | Every auto-ingested receipt shows its source (📧 Gmail, 📨 Forwarded, 🧩 Extension). |
| 🌍 GDPR / CCPA Compliant | Tokens stored encrypted at rest. Full data export and deletion on request. DPA available for EU users. |
| 👁️ Audit Log | Users can see every email parsed, when, and what was extracted — full transparency. |

**Gmail OAuth scope — what we request vs. never request:**

- ✅ Request: read-only access to emails from known receipt domains only
- ✅ Request: email metadata (sender, subject, date)
- ❌ Never request: full inbox read access
- ❌ Never request: send email on user's behalf
- ❌ Never request: access to contacts or calendar
- ❌ Never store: raw email HTML/text — parsed in-memory and immediately discarded

---

### 1.4 New Data Schema

#### New table: `ingestion_sources`
```
id (uuid, PK)
user_id (FK → users)
source_type ('gmail' | 'outlook' | 'forward' | 'extension' | 'retailer_api')
retailer_domain (nullable)
oauth_access_token (encrypted)
oauth_refresh_token (encrypted)
oauth_scope
connected_at
last_synced_at
status ('active' | 'paused' | 'revoked')
```

#### New table: `ingestion_log`
```
id (uuid, PK)
source_id (FK → ingestion_sources)
user_id (FK → users)
raw_email_id (external ID, hashed)
retailer_domain
parsed_at
confidence_score (float 0–1)
receipt_id (FK → receipts, nullable — null if failed)
failure_reason (nullable)
items_extracted (int)
```

#### Additive columns to `receipts` (existing table, backward-compatible)
```
+ ingestion_source_id (FK → ingestion_sources, nullable)
+ auto_ingested (boolean, default false)
+ ingestion_confidence (float 0–1, nullable)
+ external_order_id (retailer order ID, nullable)
+ needs_review (boolean — flagged low-confidence)
```

---

### 1.5 Build Timeline

Total estimated build time: **16 weeks** for a single full-stack engineer. Ship phases in order — do not start 4B before 4A is stable in production.

#### Phase 4A — Email Ingestion (Weeks 1–6)
- Forward-to-email infrastructure (SendGrid Inbound Parse)
- Unique per-user forwarding address generation
- Gmail OAuth2 integration + token storage
- Outlook / Microsoft Graph OAuth integration
- Email receipt parser engine (regex + Claude Vision fallback)
- Parser coverage for top 12 retailers (all "Ready" in table above)
- Auto-tag receipts with ingestion source badge
- Duplicate detection (SHA-256 hash check)
- User-facing connection UI in Settings
- Privacy disclosure flow + consent screen

#### Phase 4B — Inbox History Backfill (Weeks 7–9)
- Retroactive inbox scan (user opt-in, configurable date range)
- Background job queue for batch email processing
- Progress indicator during backfill
- De-duplication against existing manual receipts
- Parser confidence scoring — flag low-confidence for user review queue
- Parser coverage expanded to 20+ retailers (add Home Depot, IKEA, and others)

#### Phase 4C — Browser Extension (Weeks 10–16)
- Chrome extension scaffold + Manifest v3
- Amazon order history scraper
- Costco.com purchase history scraper
- Real-time order confirmation page interception
- Secure token auth between extension and ReceiptIQ API
- Chrome Web Store submission + review process
- Safari extension port (via Safari Web Extension Converter)

---

### 1.6 Success Metrics (replace 2 existing metrics)

Replace "Price Alerts Actioned" and "Shopping List Uses" with:

| Metric | Target | Rationale |
|---|---|---|
| Email Connect Rate | > 30% of active users within 30 days of launch | Auto-ingestion adoption |
| Auto-Ingest Volume | > 60% of receipts via auto-ingestion within 3 months | Core differentiator validation |
| Parser Accuracy | > 92% confidence score on auto-parsed receipts | Data quality — remainder flagged for user review |

---

### 1.7 Overview Section Changes

- Version bump: `Product Plan · Version 1.0` → `Version 2.0`
- Stats grid: change "4 Phases" → "5 Phases", add fifth card: "20+ Retailers / Auto-Ingestion"
- Description: add mention of automatic receipt ingestion from 20+ retailers
- User journeys: add "⚡ Auto-Ingestion" journey card

---

### 1.8 Market Section Changes

- Verdict paragraph: add "automatic retailer ingestion" to the unique position statement
- Gap list: add 6th item — "No app automatically pulls receipts from Amazon, Costco, Walmart and other retailers via email or browser"

---

### 1.9 Features Section Changes

**Phase 4 — Advanced:** prepend 3 new feature items before existing ones:
1. **Auto-Ingestion — Email OAuth** — Connect Gmail or Outlook once. ReceiptIQ watches your inbox for receipts from 20+ retailers and ingests them automatically in the background.
2. **Auto-Ingestion — Forward-to-Email** — Every user gets a unique receipts@receiptiq.app address. Forward any receipt email to it and it's auto-parsed and added.
3. **Auto-Ingestion — Browser Extension** — Chrome/Safari extension pulls full order history from Amazon, Costco, Walmart.com, and Target.com on demand.

---

### 1.10 Architecture Section Changes

- **AI / Intelligence layer:** add "Claude Vision fallback for low-confidence email parses"
- **Infrastructure layer:** add "SendGrid Inbound Parse for email ingestion"
- **AI Processing Flow:** add a second flow diagram for the auto-ingestion pipeline:
  `📧 Email Received → 🔍 Domain Check → 🤖 Parse Email → 🔁 Deduplicate → 💾 Ingest → 🔔 Notify User`

---

### 1.11 Navigation Changes

- Add `"Auto-Ingestion"` to SECTIONS array (last position)
- In header: render ⚡ icon alongside the Auto-Ingestion tab label
- Active color for Auto-Ingestion tab: `#0ea5e9` (sky blue, distinct from existing indigo)
- Add `"NEW in v2"` badge next to the section heading

---

## 2. Bills & Checks Auto-Ingestion + Weekly Review Flow

### Overview
Expand auto-ingestion beyond retail receipts to capture bills, checks, and invoices across all spend categories — utilities, dining, medical, insurance, subscriptions, travel, and more. Pair with a weekly user-curated review notification so customers approve what stays in the system before it feeds analytics.

**Roadmap slot:** Phase 4B (alongside browser extension) and Phase 4C (medical/insurance — after privacy infrastructure is established)
**Scope impact:** Transforms ReceiptIQ from a retail receipt tracker into a whole-life spend intelligence platform
**Version bump:** v2.0 → v3.0

---

### 2.1 Why This Matters

Retail receipts currently captured by Phase 1–4 cover only a fraction of a person's real monthly spend. The uncaptured half lives in bills and checks:

| Already Captured | Missing Without This Feature |
|---|---|
| Grocery & supermarket | Utility bills (electric, gas, water, internet) |
| Electronics & retail | Restaurant & dining checks |
| Medicine & pharmacy | Medical bills & insurance EOBs |
| Online orders (Amazon etc.) | Insurance premiums (auto, health, home) |
| Food delivery apps | Rent & mortgage statements |
| | Phone & streaming subscriptions |
| | Car services (parking, tolls, repairs) |
| | Travel (hotels, airlines, Airbnb) |

Without bills, the spending dashboard is structurally incomplete — a user could think they spend $1,200/month when their true outgoings are $3,800. The analytics, forecasting, and budget alerts all become misleading.

---

### 2.2 Bill & Check Categories — Phased Rollout

Ship categories in order of parsing complexity and privacy sensitivity:

#### Phase 4B — Start Here (structured, low sensitivity)
| Category | Sources | Parsing Complexity |
|---|---|---|
| Restaurants & Dining | Square, Toast, OpenTable, Resy email receipts | Low — consistent email formats |
| Subscriptions & Streaming | Netflix, Spotify, Apple, Google, Adobe email invoices | Very low — highly structured |
| Travel | Airbnb, Booking.com, hotel folios, airline receipts, Uber/Lyft | Low-medium |
| Parking & Tolls | SpotHero, ParkWhiz, EZPass email statements | Low |

#### Phase 4C — Second Wave (semi-structured)
| Category | Sources | Parsing Complexity |
|---|---|---|
| Utilities | Electric, gas, water, internet — PDF bills via email | Medium — varies by provider |
| Phone Bills | AT&T, Verizon, T-Mobile, Mint Mobile | Medium |
| Car Services | Mechanic invoices, dealership service PDFs | Medium-high |
| Rent & HOA | Property management email statements | Medium |

#### Phase 5 — Sensitive (requires privacy infrastructure + user trust)
| Category | Sources | Parsing Complexity | Sensitivity |
|---|---|---|---|
| Medical Bills | Clinic invoices, hospital statements | High | High — treat as sensitive data |
| Insurance EOBs | Health, auto, home insurer PDFs | Very high | High — HIPAA-adjacent |
| Mortgage Statements | Lender PDFs | Medium | Medium |
| Insurance Premiums | Auto, home, life email invoices | Medium | Medium |

---

### 2.3 Weekly Review Notification Flow

Rather than silently auto-ingesting all bills, users get a weekly "inbox review" — a curated summary of what was captured that week, with one-tap approve/dismiss per item.

#### Notification Design
- **Cadence:** Weekly, user-configurable (can switch to daily or monthly)
- **Delivery:** Push notification + in-app inbox + optional email digest
- **Trigger:** Every Sunday evening (or user's preferred day)
- **Copy example:** "📋 7 new bills captured this week — $843 total. Tap to review."

#### Review Screen UX
Each captured bill is shown as a card with:
- Source icon (utility company logo, restaurant name, etc.)
- Amount, date, category
- Two actions: **✓ Keep** (added to analytics) or **✗ Dismiss** (deleted, never analyzed)
- Optional: **Edit category** before keeping (in case auto-categorization was wrong)
- Bulk action: "Keep all" / "Dismiss all" for power users

#### Smart Batching Rules (to prevent review fatigue)
- Group by category — don't show 12 individual Spotify charges; show "Subscriptions — 3 items, $47.97"
- Surface high-value items first (sort by amount descending)
- Auto-keep recurring bills the user has approved 3+ consecutive weeks (with setting to disable)
- Auto-dismiss obvious duplicates before they reach the review screen
- If fewer than 3 new bills in a week, skip the notification and batch into the following week

#### Opt-out Modes
Users can configure per source:
- **Auto-keep** — always ingest without review (for trusted recurring bills like rent)
- **Always review** — default for new sources
- **Auto-dismiss** — never capture from this source (e.g. work expenses they don't want mixed in)

---

### 2.4 Privacy & Sensitivity Handling

Bills carry more sensitive data than retail receipts — account numbers, policy numbers, medical information. Additional safeguards beyond what's defined in section 1.3:

| Concern | Mitigation |
|---|---|
| Account numbers in utility bills | Detect and redact before storage — store last 4 digits only |
| Medical bill line items | Flag as `sensitivity: 'medical'` — excluded from household shared view by default |
| Insurance policy numbers | Redact before storage |
| Bank/mortgage account numbers | Detect via regex, redact to last 4 |
| EOB diagnosis codes | Do not extract or store — only capture total amount and provider name |
| Raw PDF content | Parsed in-memory, discarded immediately — same policy as email HTML |

**Medical data principle:** For Phase 5 medical bills, extract only: provider name, date, total amount billed, amount owed, insurance adjustment. Never extract diagnosis codes, procedure codes, or treatment descriptions.

---

### 2.5 New Bill-Specific Analytics Reports

Add to the Analytics Reports section under a new "Bills & Recurring" category:

- **Monthly Bills Overview** — total recurring obligations vs. discretionary spend
- **Utility Spend Trend** — electric, gas, water month-over-month with seasonal overlay
- **Subscription Audit** — all active subscriptions, monthly cost, last used date (where available), annual total
- **Dining Out vs. Groceries** — split between restaurant spend and grocery spend over time
- **Insurance Cost Tracker** — all premiums across policies, annual total, renewal dates
- **True Monthly Obligations** — fixed bills as % of income (if income is set in profile)
- **Travel Spend Summary** — flights, hotels, car rentals aggregated per trip (grouped by date proximity)
- **Bill Due Date Calendar** — upcoming bills based on historical patterns, with estimated amounts

---

### 2.6 New Data Schema Additions

#### Additive columns to `receipt_items` (for bill line items)
```
+ item_type ('product' | 'service' | 'bill_line' | 'fee' | 'tax')
+ sensitivity ('standard' | 'medical' | 'financial')
+ redacted (boolean, default false)
+ recurring_pattern_id (FK → recurring_patterns, nullable)
```

#### New table: `recurring_patterns`
```
id (uuid, PK)
user_id (FK → users)
source_name (e.g. 'Con Edison', 'Netflix', 'Allstate')
category
average_amount (float)
frequency ('weekly' | 'monthly' | 'quarterly' | 'annual')
last_seen_at
auto_keep (boolean, default false)
ingestion_source_id (FK → ingestion_sources, nullable)
```

#### New table: `review_inbox`
```
id (uuid, PK)
user_id (FK → users)
receipt_id (FK → receipts)
captured_at
review_status ('pending' | 'kept' | 'dismissed')
reviewed_at (nullable)
week_batch (date — Sunday of the review week)
auto_kept (boolean — true if kept via recurring_pattern auto-keep rule)
```

---

### 2.7 Roadmap Changes

**Phase 4B — add to existing items:**
- Bills ingestion: restaurants, subscriptions, travel, parking
- Weekly review notification flow (push + in-app)
- Review inbox UI (keep / dismiss / edit category)
- Auto-keep rules for recurring bills
- `recurring_patterns` and `review_inbox` tables

**Phase 4C — new card:**
- Bills ingestion: utilities, phone, rent, car services
- Account number redaction engine
- Bill due date calendar
- "Bills & Recurring" analytics category (8 new reports)
- Per-source auto-keep / always-review / auto-dismiss settings

**Phase 5 — add to existing items:**
- Medical bill ingestion (with sensitivity flagging)
- Insurance EOB ingestion (amount + provider only — no diagnosis codes)
- Mortgage statement ingestion
- Medical data excluded from household shared view by default

---

### 2.8 Features Section Changes

**Phase 4 — Advanced:** add after the 3 auto-ingestion items already queued in section 1.9:

4. **Bills & Checks Auto-Ingestion** — Automatically capture utility bills, restaurant checks, subscription invoices, travel receipts, and more from email. Covers the full picture of monthly spend, not just retail.
5. **Weekly Review Inbox** — Every week, a curated notification shows everything captured. One tap to keep (feeds analytics) or dismiss (deleted). Smart batching groups recurring charges and surfaces high-value items first. Auto-keep rules for trusted recurring bills.

---

### 2.9 Overview Section Changes

- Update description to mention bills, checks, and full-life spend intelligence
- Add "Weekly Review" as a 7th user journey card: "📋 Weekly Review — See every bill and check captured this week → tap to keep or dismiss → only approved data feeds your analytics"
- Update market gap list: add "No app captures the full picture — retail receipts + utility bills + restaurant checks + subscriptions + travel in one place"

---

## Corrections & Minor Edits

### C1. Shopping List Estimator — wording update

**Location:** `FEATURES` array → Phase 3 — Smart Shopping → "Shopping List Estimator" item  
**Change:** Update the feature description to include uploading a list, not just typing it.

**Current text:**
> Upload or type a shopping list. AI estimates cost per item using your price history + current market data. Shows total estimate per store. Recommends optimal store split.

**Updated text:**
> Type or upload a shopping list. AI estimates cost per item using your price history + current market data. Shows total estimate per store. Recommends optimal store split.

*(Same change applies to any other copy in the codebase referencing this feature — search for "upload or type" and flip to "type or upload".)*

---

## Pending Requirements

---

## 3. Instant Push Notifications for Ingestion Approval

### Overview
Replace the weekly review as the *primary* approval flow with instant push notifications fired the moment a receipt or bill is parsed. Users approve or reject directly from the notification — no app open required. The weekly review is demoted to a safety-net fallback for unactioned items.

**Roadmap slot:** Phase 4B — ships alongside bills ingestion  
**Dependency:** Requires Requirement 2 (Bills & Checks ingestion) to be in place  
**Version bump:** v3.0 → v3.1

---

### 3.1 How It Works

1. Email parsed → receipt/bill detected → confidence score passes threshold
2. Push notification fires within **30–60 seconds** of ingestion
3. Notification displays: merchant name, amount, category, and source channel
4. Two action buttons inline in the notification — **✓ Keep** and **✕ Dismiss** — no app open required
5. User taps one → API called in background → receipt either enters analytics or is deleted
6. If no action taken within **24 hours** → system **auto-ingests** the receipt (opt-out model: silence = keep)

---

### 3.2 Smart Throttling Rules

Volume management is non-negotiable from day one. Without it, users get notification fatigue and disable push entirely.

| Rule | Behaviour |
|---|---|
| **Grouping window** | Bills arriving within 2 hours of each other are batched into one notification: "3 subscriptions captured — $42.47 total. Review?" |
| **Amount threshold** | Only push instantly for amounts above a user-configurable threshold (default: $20). Below threshold → auto-ingested silently, no notification |
| **Trusted sources** | Sources the user has marked auto-keep (rent, known utilities) fire silently — no notification sent |
| **Frequency cap** | Max 3 push notifications per day per user, regardless of ingestion volume |
| **Quiet hours** | Respect device Do Not Disturb schedule. Bills parsed during quiet hours → held until morning |
| **Recurring low-value** | Subscriptions under $15 that have been approved 3+ consecutive times → auto-kept silently going forward |

---

### 3.3 Notification Design

#### Single item notification
```
📧 Con Edison                           Jan 15, 10:42am
Utility bill captured — $127.43
[  ✓ Keep  ]          [  ✕ Dismiss  ]
```

#### Grouped notification (throttled batch)
```
🧾 ReceiptIQ                            Jan 15, 11:00am
3 bills captured today — $152.91 total
Netflix $15.49 · Spotify $9.99 · Con Edison $127.43
[  ✓ Keep All  ]      [  Review  ]
```

**"Review" on grouped notifications** opens the weekly review inbox filtered to just that batch — so the user can act on items individually if they want.

---

### 3.4 User Preference Controls

Per-source and global settings available in the app under Settings → Notifications:

| Setting | Options | Default |
|---|---|---|
| Notification mode | Instant · Daily digest · Weekly only · Off | Instant |
| Amount threshold | $0 (all) · $10 · $20 · $50 · Custom | $20 |
| Quiet hours | On/Off + start/end time | Off |
| Frequency cap | 1 · 3 · 5 · Unlimited per day | 3/day |
| Per-source override | Auto-keep · Always notify · Auto-dismiss | Always notify |
| Grouping window | Off · 1hr · 2hr · 4hr | 2hr |

---

### 3.5 Weekly Review — Demoted to Safety Net

The weekly review flow from Requirement 2 remains but is now a lightweight audit trail rather than a primary approval flow.

**What it now catches:**
- Notifications the user explicitly dismissed (✕) — shown as "Dismissed" with one-tap restore
- Auto-ingested items (24hr timeout) — shown clearly as "Auto-ingested, tap to remove"
- Items below the amount threshold that were auto-ingested silently
- Users who have set notification mode to "Weekly only"

**What it no longer catches:**
- Pending approvals (there are none — everything is either actioned or auto-ingested within 24hrs)

**What changes in the weekly review UX:**
- Renamed to **"Weekly Digest"** — reflects that it's a summary, not an action queue
- Default view shows auto-ingested items from the week with a one-tap remove option
- Dismissed items shown separately with a one-tap restore option
- Items approved via push are hidden by default (toggle to show full week)

---

### 3.6 Technical Additions

#### New infrastructure
- **AWS SNS** — fan-out to APNs (Apple) and FCM (Google). ~$0.50 per million notifications, negligible at early scale
- **APNs + FCM tokens** stored per device per user in `device_tokens` table
- **Background fetch entitlement** (iOS) + **background service** (Android) — allows keep/dismiss API calls without opening the app
- **Notification scheduler** — respects quiet hours and frequency cap before firing; runs as a Lambda function triggered by the ingestion pipeline

#### New table: `device_tokens`
```
id (uuid, PK)
user_id (FK → users)
token (APNs or FCM device token)
platform ('ios' | 'android')
registered_at
last_active_at
```

#### New table: `notification_log`
```
id (uuid, PK)
user_id (FK → users)
device_token_id (FK → device_tokens)
notification_type ('single' | 'grouped')
receipt_ids (array of receipt IDs included)
total_amount (float)
sent_at
actioned_at (nullable)
action ('kept' | 'dismissed' | 'review_opened' | null)
fallback_to_weekly (boolean)
```

#### Additive columns to `user_preferences`
```
+ notif_mode ('instant' | 'daily' | 'weekly' | 'off')
+ notif_amount_threshold (float, default 20.00)
+ notif_quiet_hours_enabled (boolean, default false)
+ notif_quiet_start (time, nullable)
+ notif_quiet_end (time, nullable)
+ notif_frequency_cap (int, default 3)
+ notif_grouping_window_hours (int, default 2)
```

---

### 3.7 Updated Ingestion Pipeline

Extends the flow defined in section 1.10:

```
📧 Email → 🔍 Domain Check → 🤖 Parse → 🔁 Deduplicate → 💾 Ingest
→ 🔔 Notification Scheduler
     ├── Trusted source? → Auto-keep silently
     ├── Below threshold? → Queue for weekly review
     ├── Quiet hours? → Hold until morning
     ├── Grouping window active? → Batch with pending notifications
     └── Send push → await action (24hr) → auto-ingest (opt-out: silence = keep)
```

---

### 3.8 Features Section Changes

**Phase 4 — Advanced:** update the "Weekly Review Inbox" feature description added in section 2.8:

**Replace:**
> Weekly Review Inbox — Every week, a curated notification shows everything captured...

**With:**
> Instant Ingestion Approval — The moment a receipt or bill is parsed, a push notification fires with Keep and Dismiss buttons inline — no app open needed. Smart throttling batches same-day bills to prevent overload. If no action is taken within 24 hours, the receipt is auto-ingested (silence = keep). A weekly digest summarises everything captured that week with one-tap remove for anything auto-ingested.

---

### 3.9 Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| Push opt-in rate | > 70% of active users | Low opt-in kills the feature entirely |
| Instant action rate | > 60% of notifications acted on within 1 hour | Validates real-time UX over weekly digest |
| Notification disable rate | < 5% per month | Measures whether throttling is working |
| Weekly digest removal rate | < 10% of auto-ingested items removed | Validates that auto-ingest matches user intent |

---

## 4. Custom Date Range Spending Pattern Reports

### Overview
Give users a flexible date range picker to generate on-demand spending pattern reports for any custom window — not just fixed weekly or monthly periods. Pairs with a preset library for common ranges and a labelled periods feature so users can tag and recall meaningful date windows (trips, events, pay periods) by name.

**Roadmap slot:** Phase 3 (alongside analytics) — UI is straightforward, data already exists  
**New section tab:** Extends existing "Analytics Reports" tab with a "Custom Report" entry point  
**Version bump:** v3.1 → v3.2

---

### 4.1 Date Range Options

#### Free-form picker
- Start date + end date — any range, no minimum or maximum
- Available on both mobile (native date picker) and web (calendar popover)
- Range limited to dates within the user's data history

#### Smart presets (one-tap shortcuts)
| Preset | Description |
|---|---|
| Last 7 days | Rolling 7-day window ending today |
| Last 30 days | Rolling 30-day window ending today |
| Last 90 days | Rolling 90-day window ending today |
| This month | Calendar month to date |
| Last month | Full prior calendar month |
| This quarter | Q1/Q2/Q3/Q4 to date |
| Last quarter | Full prior quarter |
| This year | Jan 1 to today |
| Custom | Free-form date picker |

#### Labelled periods
Users can name and save any date range for quick recall:

- "Italy Trip — Sep 3–17 2024"
- "Holiday Season — Nov 25–Jan 5"
- "Before the raise — Jan–Mar 2024"
- Saved periods appear as one-tap shortcuts alongside the smart presets
- Accessible from a "My Periods" section in the report builder

---

### 4.2 Report Contents

Every custom date range report includes the following sections, generated in real time from the date range selected:

#### Summary strip
```
Jan 12 – Feb 12, 2025  (31 days)
Total spent:   $3,420.18
Receipts:      47
Stores visited: 12
Daily average: $110.33
```

#### Category breakdown
- Spend per category for the selected period
- % of total spend per category
- Bar chart sorted by amount descending
- Compared to the equivalent prior period automatically (e.g. select Jan → auto-compares to Dec)

#### Vs. equivalent prior period
- Every metric compared to the same-length window immediately before the selected range
- Delta shown as $ and % — green for down, red for up
- Example: "Dining $510 → $623 (+$113, +22%) vs. prior period"

#### Top merchants
- Top 10 stores ranked by spend for that period
- Amount, number of visits, average per visit

#### Price anomalies
- Items where you paid above your historical average during this window
- Shows: item name, what you paid, your usual price, overpayment amount

#### Day-of-week spend pattern
- Total and average spend per day of week within the range
- Highlights highest and lowest spend days

#### Top 5 receipts
- Largest single receipts in the period by total amount

#### Pace indicator *(only shown if range includes today)*
- "At this pace you'll spend $X this month"
- Compared to monthly budget if set

#### Upcoming bills *(only shown if range includes future dates or ends today)*
- Bills expected in the next 7 days based on recurring patterns

---

### 4.3 Labelled Periods — Detail

#### Creating a labelled period
- From the date picker: select a range → tap "Save this period" → enter a name
- From any report: tap "Save as period" in the report header
- From the weekly digest: "Label this week" shortcut

#### Using labelled periods
- Appear in the preset list under "My Periods"
- Can be compared against each other: "Italy Trip vs. Paris Trip"
- Shown on the price history chart as shaded bands so you can see spend during an event on the timeline
- Exportable as a named PDF or CSV report

#### Auto-suggested periods *(Phase 5)*
- System detects trip-like clusters (flight + hotel in a short window) and suggests "Looks like you took a trip Sep 3–17. Want to label it?"
- Requires 3+ months of data to be reliable

---

### 4.4 Weekly Digest — Spending Patterns Addition

The weekly digest email/notification gains a spending patterns block below the receipt list. Scannable in under 60 seconds:

```
📊 Week of Jan 12–18

CAPTURED THIS WEEK                    $412.81
  ✓ Kept: 8  |  Auto-ingested: 3  |  Dismissed: 1

SPENDING PATTERNS
  ↑ Dining up $43 vs. last week
  ⚠ On pace for $3,800 this month — $600 over budget
  💡 Eggs were $1.20 above your usual price at Whole Foods
  📅 Con Edison bill expected around Jan 22

                              [Open Custom Report ↗]
```

The "Open Custom Report" link deep-links into the app with the current week pre-selected as the date range.

---

### 4.5 New Data Schema

#### New table: `spending_periods`
```
id (uuid, PK)
user_id (FK → users)
name (e.g. 'Italy Trip', 'Holiday Season')
start_date
end_date
created_at
color (hex — for chart shading, nullable)
notes (nullable)
auto_suggested (boolean, default false)
```

#### New table: `saved_reports`
```
id (uuid, PK)
user_id (FK → users)
spending_period_id (FK → spending_periods, nullable)
start_date
end_date
report_type ('custom' | 'weekly_digest' | 'monthly')
generated_at
export_format (nullable — 'pdf' | 'csv')
snapshot_data (jsonb — cached report output for fast reload)
```

---

### 4.6 Features Section Changes

**Phase 3 — Smart Shopping:** add one new feature:

- **Custom Spending Reports** — Pick any date range or use smart presets (last 30 days, this quarter, custom). Get a full pattern report: category breakdown, vs. prior period comparison, top merchants, price anomalies, day-of-week patterns, and pace projection. Save and name any range as a labelled period for quick recall.

**Phase 4 — Advanced:** update Weekly Digest description to mention spending patterns block and custom report deep-link.

---

### 4.7 Analytics Reports Section Changes

Add one new report to **Forecasting & Planning** category:

- **Custom Date Range Report** — on-demand spending pattern report for any date window. Includes category breakdown, prior period comparison, top merchants, price anomalies, day-of-week patterns, top receipts, and pace projection.

Add new sub-section **My Periods** to the Analytics tab:

- Saved labelled periods with one-tap report generation
- Period-vs-period comparison view
- Auto-suggested periods (Phase 5)

---

### 4.8 Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| Custom report usage | > 25% of active users run one per month | Validates demand beyond fixed periods |
| Labelled periods created | > 2 per active user within 90 days | Shows stickiness of the naming feature |
| Preset usage vs. custom | > 50% use presets | Validates preset design covers common needs |
| Report export rate | > 10% of reports exported | Measures value for budgeting / tax use cases |
