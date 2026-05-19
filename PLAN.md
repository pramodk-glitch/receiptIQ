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
| 5 | AI Spending Assistant — Conversational Chatbot | v3.2 → v4.0 | Phase 3 + Phase 4 | ✅ Specced |
| 6 | Multi-Tenancy & International Expansion | v4.0 → v5.0 | Phase 1 (foundations) → Phase 5 | ✅ Specced |
| 7 | Historical Data Ingestion | v5.0 → v5.1 | Phase 3 → Phase 5 | ✅ Specced |
| 8 | Market Strategy & Feature Optimisation | v5.1 → v5.2 | All phases | ✅ Specced |

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

---

## 5. AI Spending Assistant — Conversational Chatbot

### Overview
A conversational AI assistant that lets users ask natural language questions about their own spending data and get instant, accurate answers — with charts, tables, and proactive insights. Powered by Claude with access to the user's receipt, item, price history, and bills data. Pro-tier only.

**Roadmap slot:** Phase 3 (after sufficient user data exists to make answers interesting) — ships alongside custom date range reports  
**New UI:** Chat tab added to both mobile and web  
**Version bump:** v3.2 → v4.0  
**Tier restriction:** Pro and Family only — not available on Free

---

### 5.1 What Users Can Ask

Natural language questions that no fixed report covers today:

**Spending patterns**
- "How much did I spend on groceries last month?"
- "Am I spending more on dining out than I was 6 months ago?"
- "What was my biggest single expense this year?"
- "How does my December spending compare to last December?"

**Price intelligence**
- "Which items in my regular shopping have gotten most expensive this year?"
- "What's my personal inflation rate on groceries?"
- "When was the last time I got a good deal on olive oil?"

**Store & vendor**
- "Which store do I spend the most at?"
- "What's the one store switch that would save me the most money?"
- "How much have I spent at Costco vs. Walmart this year?"

**Bills & subscriptions**
- "Which subscriptions haven't I used in 3 months?"
- "How much do my fixed bills cost me annually?"
- "Are my utility bills higher this winter than last winter?"

**Goal & budget**
- "Am I on track for my $400 grocery budget this month?"
- "If I cut dining to $300/month, how much would I save in a year?"
- "What category am I most consistently over budget on?"

**Custom date ranges**
- "How much did the Italy trip cost me all in?"
- "What did I spend in the two weeks before Christmas?"
- "Compare my spending the month I worked from home vs. the office"

**Forecasting**
- "If milk prices keep rising at this rate, what will I pay by December?"
- "At my current pace, what will I spend this month?"
- "Which of my bills is most likely to increase next quarter?"

---

### 5.2 Technical Architecture

Two approaches used in combination:

#### Approach 1 — Pre-computed Context Injection (80% of queries)
For each conversation turn, a summary of the user's data is computed and injected into Claude's context window:

```
System context injected per turn:
- Last 90 days spend by category (totals + MoM delta)
- Top 10 merchants by spend (last 90 days)
- Top 20 frequently purchased items with avg price + last price
- Active subscriptions and recurring bills
- Monthly budget targets (if set) vs. actuals
- Price anomalies detected in last 30 days
- Labelled periods (trip names, event names)
```

Works well for conversational, pattern-based questions. Fast — no extra DB round trip.

#### Approach 2 — Text-to-SQL (20% of queries — specific numbers, edge cases)
For questions requiring exact figures the context summary can't answer:

```
1. Claude receives user question + DB schema (tables, columns, types)
2. Claude generates a parameterised SQL query
3. Query executes server-side with hardcoded WHERE user_id = $current_user
4. Results passed back to Claude
5. Claude formats as natural language response with optional chart
```

Example:
```
User: "What did I spend on dining last quarter?"

Claude generates SQL:
  SELECT SUM(line_total), COUNT(*), AVG(line_total)
  FROM receipt_items
  WHERE user_id = $1
  AND category = 'Dining'
  AND created_at >= '2024-10-01'
  AND created_at < '2025-01-01'

Result → Claude responds:
  "You spent $1,247.80 on dining last quarter across 34 visits,
   averaging $36.70 per meal. November was your highest dining
   month at $498 — likely the holidays."
```

#### Decision logic
```
User question received
  → Is it answerable from pre-computed context? → Use Approach 1
  → Does it need exact figures / specific items / date ranges? → Use Approach 2
  → Does it need both? → Approach 2 first, enrich with Approach 1 context
```

---

### 5.3 Proactive Insights

Beyond answering questions, the assistant surfaces proactive observations at the start of each session:

```
💡 You spent $340 more than usual this month — a $189 flight and
   3 restaurant visits above your average account for most of it.

📈 Your utility bills have risen 18% over 12 months, outpacing
   your grocery inflation of 9%.

🎯 You're at $320 of your $400 grocery budget with 10 days left
   — you're on track.

⚠️ You haven't used 3 of your subscriptions in 90+ days
   — that's $34.47/month potentially wasted.
```

These are generated once per session open, not on every message. Keeps it useful without being intrusive.

---

### 5.4 System Prompt Design

Critical constraints enforced via system prompt — Claude must never violate these:

```
You are a personal spending assistant for ReceiptIQ. You have access
to the user's receipt, item, and bills data.

RULES:
1. Only state numbers that appear in the query results or injected
   context. Never estimate or guess a figure.
2. If data is insufficient to answer, say so clearly —
   do not approximate.
3. Never reference any other user's data. All queries are scoped
   to user_id = {current_user_id}.
4. Keep responses concise — lead with the direct answer,
   then context. No preamble.
5. Offer a follow-up question or related insight at the end of
   each response where relevant.
6. If a question is outside spending/financial data, politely
   redirect: "I can only help with questions about your
   ReceiptIQ data."
7. Format numbers as currency where applicable. Use the user's
   preferred currency.
8. Never reproduce raw SQL to the user — only the natural
   language result.
```

---

### 5.5 Privacy & Security

**Critical:** the chatbot never has access to another user's data. Enforced at two layers:

| Layer | Mechanism |
|---|---|
| Application layer | User ID injected into every context summary server-side before Claude sees it |
| Query layer | Every Text-to-SQL result is validated — any query missing `WHERE user_id = $current_user` is rejected before execution |
| Prompt layer | System prompt explicitly states the user_id scope — Claude will not generate queries outside it |
| Audit layer | Every chatbot query and SQL generated is logged to `ai_chat_log` for review |

**Hallucination guard:** Claude is instructed to cite the source of every number ("based on your last 90 days", "from your 3 receipts at Walmart in January"). If no data supports a claim, it must say "I don't have enough data to answer that yet."

---

### 5.6 Cost Per Conversation

Chatbot turns are more expensive than OCR scans. Must be Pro-only.

**Per turn cost estimate (Claude Sonnet):**
- Context injection: ~3,000 tokens input
- User question: ~50 tokens
- Claude response: ~300 tokens output
- Total: ~3,350 tokens → ~$0.014 per turn

| Turns per conversation | Cost per conversation |
|---|---|
| 3 turns | ~$0.04 |
| 10 turns | ~$0.14 |
| 20 turns | ~$0.28 |

**Monthly cost per active Pro user** (assuming 5 conversations × 5 turns = 25 turns/month):
- ~$0.35/month per active chatbot user
- Pro subscription is $4.99/month → chatbot adds ~7% to per-user cost
- Acceptable margin — no additional cost controls needed at Phase 3 scale

**At scale (10,000 Pro users, all using chatbot):**
- ~$3,500/month additional Claude API cost
- Already factored into scaling cost projections in `pricing.md` from Phase 4 onward

---

### 5.7 UI & UX

#### Chat interface
- Dedicated **Chat** tab in bottom navigation (mobile) and sidebar (web)
- Persistent conversation history within a session
- Previous conversations accessible (last 30 days)
- Suggested starter questions shown on first open:
  - "How much did I spend last month?"
  - "What's my biggest recurring expense?"
  - "Which store gives me the best value?"
  - "Am I over budget this month?"

#### Response format
- Plain text for simple answers
- Inline mini-charts for trend questions (renders a sparkline or bar chart in the chat bubble)
- Tap/click any chart to expand into the full analytics view
- "Save as report" button on any response — saves to the user's saved reports

#### Suggested follow-ups
- Every response includes 2–3 tappable follow-up suggestions
- Example: after "You spent $1,247 on dining last quarter" → suggestions: "Break it down by restaurant", "Compare to previous quarter", "How can I reduce this?"

---

### 5.8 New Data Schema

#### New table: `ai_chat_sessions`
```
id (uuid, PK)
user_id (FK → users)
started_at
last_message_at
message_count (int)
session_summary (text, nullable — AI-generated summary for future context)
```

#### New table: `ai_chat_log`
```
id (uuid, PK)
session_id (FK → ai_chat_sessions)
user_id (FK → users)
role ('user' | 'assistant')
content (text)
sql_generated (text, nullable — for Text-to-SQL turns)
sql_result_rows (int, nullable)
tokens_input (int)
tokens_output (int)
cost_usd (float)
created_at
```

---

### 5.9 Roadmap Changes

**Phase 3 — Smart Shopping:** add alongside custom date range reports:
- AI Spending Assistant (chat interface)
- Context injection pipeline
- Text-to-SQL pipeline (v1 — top 20 query types)
- Proactive insights on session open
- Suggested follow-up questions

**Phase 4 — Advanced:** expand chatbot capabilities:
- Chart rendering inline in chat
- "Save as report" from chat
- Full Text-to-SQL coverage (all query types)
- Conversation history (last 30 days)
- What-if analysis ("if I cut dining by $100/month…")

---

### 5.10 Features Section Changes

**Phase 3 — Smart Shopping:** add new feature:

- **AI Spending Assistant** — Ask anything about your spending in plain English. "How much did the Italy trip cost all in?", "Which subscriptions haven't I used in 3 months?", "What's my personal inflation rate on groceries?" Claude answers instantly using your actual data — with charts, tables, and proactive insights. Pro and Family tier only.

---

### 5.11 Overview & Marketing Changes

Add to core user journeys:
- **🤖 Ask Anything** — Type any question about your spending in plain English → get an instant answer with charts and context → tap any insight to open the full report

Add to market gap:
- "No app lets you ask natural language questions about your own spending data and get accurate, sourced answers"

Update Pro tier description in `pricing.md`:
- Add "AI Spending Assistant — ask anything about your data" as a Pro feature

---

### 5.12 Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| Chatbot adoption | > 40% of Pro users open chat within 30 days | Feature discovery and utility |
| Questions per session | > 4 turns average | Indicates genuine engagement, not curiosity clicks |
| Return chat rate | > 60% of chatbot users return within 7 days | Validates ongoing utility |
| Hallucination rate | < 0.5% of responses contain unsourced numbers | Quality and trust — monitored via spot-check audit |
| Pro conversion lift | +2% conversion vs. control | Chatbot as upgrade hook |
| Cost per active chatbot user | < $0.50/month | Margin sustainability |

---

## 6. Multi-Tenancy & International Expansion

### Overview
Two related but distinct concerns: multi-tenancy (making data isolation bulletproof and adding org-level accounts for households and businesses) and internationalisation (serving users in different countries, languages, and currencies). The architectural foundations must be laid in Phase 1 even if international expansion doesn't happen until Phase 3+.

**Roadmap slot:**
- Multi-tenancy foundations → Phase 1 (architectural, cheap to do early, expensive to retrofit)
- i18n framework → Phase 2 (add framework with English-only strings, expand later)
- Currency support → Phase 2
- English-speaking international markets (UK, Canada, Australia) → Phase 2
- EU expansion → Phase 3
- India, Brazil → Phase 4
- Japan, Southeast Asia → Phase 5

**Version bump:** v4.0 → v4.1 (multi-tenancy) · v4.1 → v5.0 (international)

---

### 6.1 Multi-Tenancy Model

ReceiptIQ uses **shared database, shared schema** — the right model for a consumer app. All users share one PostgreSQL database, isolated by `user_id`. The risk is cross-user data leakage from application bugs. Four layers of defence eliminate this risk.

#### Three multi-tenancy models — decision rationale

| Model | How it works | Best for | Verdict |
|---|---|---|---|
| Shared DB, shared schema | All users in one DB, isolated by `user_id` | Consumer app | ✓ Use this |
| Shared DB, separate schema | One DB, each tenant gets own Postgres schema | SMB / B2B customers | Future option for enterprise tier |
| Separate DB per tenant | Each tenant gets own RDS instance | Enterprise, high-compliance | Too expensive at this stage |

---

### 6.2 Row-Level Security (RLS)

Enable PostgreSQL Row-Level Security on every table. This enforces `user_id` filtering at the database level — even if application code forgets a WHERE clause, the database refuses to return another user's rows.

```sql
-- Enable RLS on receipt_items (repeat for every table)
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own rows
CREATE POLICY user_isolation ON receipt_items
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

Set `app.current_user_id` at the start of every database session from the API middleware. No query can ever cross user boundaries regardless of application bugs.

**Tables requiring RLS (all of them):**
- `receipts`, `receipt_items`, `price_history`, `shopping_lists`
- `ingestion_sources`, `ingestion_log`
- `recurring_patterns`, `review_inbox`
- `device_tokens`, `notification_log`
- `spending_periods`, `saved_reports`
- `ai_chat_sessions`, `ai_chat_log`
- `user_preferences`

---

### 6.3 Organisation Layer (B2B / Household / Enterprise)

Add an `organisations` table as a parent above `users`. This enables:
- **Family accounts** — one org, multiple members, shared analytics
- **Business accounts** — a restaurant chain tracking supplier receipts
- **White-label** — a retailer licensing ReceiptIQ for their customers
- **Enterprise** — separate schema or DB per org for compliance-heavy customers

#### New table: `organisations`
```
id (uuid, PK)
name
slug (unique — for subdomain routing e.g. acme.receiptiq.app)
plan ('consumer' | 'family' | 'business' | 'enterprise')
owner_id (FK → users)
created_at
max_members (int, default 1)
data_region ('us-east-1' | 'eu-west-1' | 'ap-southeast-1')
```

#### Additive columns to `users`
```
+ org_id (FK → organisations, nullable — null for solo consumer accounts)
+ role ('owner' | 'admin' | 'member')
+ invited_by (FK → users, nullable)
+ joined_at (nullable)
```

#### RLS update for org-scoped queries
```sql
-- Members of the same org can see shared data where permitted
CREATE POLICY org_isolation ON receipts
  USING (
    user_id = current_setting('app.current_user_id')::uuid
    OR (
      org_id = current_setting('app.current_org_id')::uuid
      AND shared = true
    )
  );
```

---

### 6.4 Cross-Tenant Leak Prevention — Test Suite

A mandatory integration test suite that runs on every deployment:

```
1. Create user A and user B in separate orgs
2. User A uploads 5 receipts, creates shopping lists, labels periods
3. All of User B's API calls must return zero results for User A's data
4. Attempt direct DB queries as User B's session — RLS must block them
5. Test chatbot: User B's AI assistant must never reference User A's data
6. Test org sharing: User A shares a receipt → only org members see it
```

---

### 6.5 Currency Support

Every monetary amount currently assumes USD. This must be fixed before international launch.

#### Schema changes
```
receipts
  + currency (varchar 3 — ISO 4217: 'USD', 'EUR', 'GBP', 'INR', 'JPY'…)
  + amount_usd (float — converted amount for analytics aggregation)

users / user_preferences
  + preferred_currency (varchar 3, default 'USD')
  + locale (varchar 10 — 'en-US', 'en-GB', 'de-DE', 'hi-IN', 'ja-JP'…)

exchange_rates (new table — daily snapshot)
  id (uuid, PK)
  from_currency (varchar 3)
  to_currency (varchar 3)
  rate (float)
  captured_at (date)
  source ('open_exchange_rates' | 'ecb')
```

#### Currency conversion strategy
- **Store:** original currency + amount, plus USD-converted amount at time of ingestion
- **Display:** original currency in receipt detail views
- **Analytics:** convert to user's preferred currency at display time using stored rates
- **Exchange rate API:** Open Exchange Rates (~$12/month) or ECB free feed (EUR base only)

#### Local price points for subscriptions
| Market | Pro | Family |
|---|---|---|
| USA | $4.99/mo | $7.99/mo |
| UK | £3.99/mo | £6.49/mo |
| EU | €4.49/mo | €6.99/mo |
| India | ₹349/mo | ₹549/mo |
| Australia | A$6.99/mo | A$10.99/mo |
| Canada | C$6.49/mo | C$9.99/mo |

Stripe handles local currency billing natively. Enable Stripe Tax for automatic VAT/GST collection and remittance.

---

### 6.6 Language & Localisation (i18n)

#### Framework
- **Web (Next.js):** `next-i18next` + `i18next`
- **Mobile (React Native):** `i18next` + `react-i18next`
- Extract all UI strings into JSON translation files from Phase 2 onward — even if only English exists initially
- Use **DeepL API** for machine translation of initial strings, human review for key copy

#### Priority languages by market size

| Priority | Language | Markets |
|---|---|---|
| 1 | English (en-US, en-GB, en-AU) | USA, UK, Australia, Canada |
| 2 | Spanish (es-ES, es-MX) | Spain, Latin America |
| 3 | Portuguese (pt-BR) | Brazil |
| 4 | German (de-DE) | Germany, Austria, Switzerland |
| 5 | French (fr-FR) | France, Belgium, Canada |
| 6 | Hindi (hi-IN) | India |
| 7 | Japanese (ja-JP) | Japan |
| 8 | Mandarin (zh-CN) | China (separate deployment required) |

#### Formatting — use platform APIs, not manual
```javascript
// Dates
new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
// Jan 15, 2025 (en-US) · 15 Jan 2025 (en-GB) · 15.01.2025 (de-DE)

// Currency
new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
// $1,247.80 (en-US) · £1,247.80 (en-GB) · 1.247,80 € (de-DE)
```

---

### 6.7 Retailer & Email Parser Coverage by Market

The OCR layer (Claude Vision) handles receipts in any language from day one. The email parser layer needs market-by-market additions.

| Market | Key retailers to add | Complexity | Phase |
|---|---|---|---|
| UK | Tesco, Sainsbury's, ASDA, M&S, Amazon UK, Deliveroo | Low | Phase 2 |
| Canada | Loblaws, Canadian Tire, Sobeys, Amazon CA | Low | Phase 2 |
| Australia | Woolworths, Coles, JB Hi-Fi, Amazon AU | Low | Phase 2 |
| Germany | REWE, Edeka, Lidl, DM, Amazon DE | Medium | Phase 3 |
| France | Carrefour, Leclerc, Monoprix, Amazon FR | Medium | Phase 3 |
| India | BigBasket, Amazon IN, Flipkart, Zepto, Blinkit, Swiggy | Medium | Phase 4 |
| Brazil | Mercado Livre, iFood, Rappi, Amazon BR | Medium | Phase 4 |
| Japan | Rakuten, Amazon JP, 7-Eleven, FamilyMart | High | Phase 5 |

---

### 6.8 Data Residency & Legal Compliance

#### Requirements by region

| Region | Law | Key requirements | Infrastructure impact |
|---|---|---|---|
| European Union | GDPR | Data residency option, right to erasure, DPA, consent management | EU AWS region (eu-west-1 or eu-central-1) |
| UK | UK GDPR | Same as EU GDPR effectively | Can use EU region |
| USA (California) | CCPA | Already in plan | None additional |
| Brazil | LGPD | Data subject rights, similar to GDPR | US-East or dedicated region |
| India | DPDP Act 2023 | Data localisation for sensitive data | AP region (ap-south-1 Mumbai) |
| China | PIPL | Very strict — complete data localisation | Entirely separate deployment — Phase 5+ |
| Australia | Privacy Act | Broadly similar to GDPR | AP region (ap-southeast-2 Sydney) |

#### Data residency architecture

```
Users table
  + data_region ('us-east-1' | 'eu-west-1' | 'ap-south-1' | 'ap-southeast-2')

Routing layer (API Gateway / CloudFront):
  - Detect user's region on signup
  - Route all subsequent requests to the correct regional RDS instance
  - Receipt images stored in region-matched S3 bucket
```

#### GDPR-specific additions (Phase 3, EU launch)
- Cookie consent banner (EU users only)
- Data processing agreement (DPA) available on request
- Right to erasure: full delete pipeline that removes user data from all tables, S3, and backups within 30 days
- Data export: full user data export in JSON/CSV within 72 hours of request
- Consent log: record when and how each user gave consent

---

### 6.9 International Payment Processing

Stripe is already in the tech stack. Configure for international:

- **Stripe Tax** — enable from day one. Automatically calculates, collects, and remits VAT/GST in 50+ countries. No manual tax handling needed.
- **Local payment methods** per region:

| Region | Payment methods to enable |
|---|---|
| EU | SEPA Direct Debit, iDEAL (NL), Bancontact (BE), Klarna |
| UK | Bacs Direct Debit, Klarna |
| India | UPI, Razorpay (better than Stripe IN for local methods) |
| Brazil | PIX, Boleto |
| Australia | BECS Direct Debit |
| Japan | Konbini (convenience store payment) |

---

### 6.10 Internationalisation Rollout — Phased Plan

| Phase | Markets | Key deliverables |
|---|---|---|
| Phase 1 (Q1 2025) | USA only | RLS, org table foundation, i18n framework with English strings, currency field on schema |
| Phase 2 (Q2–Q3 2025) | + UK, Canada, Australia | UK/CA/AU retailer parsers, GBP/CAD/AUD currency, local price points, Stripe Tax |
| Phase 3 (Q4 2025) | + EU (DE, FR, ES) | German/French/Spanish i18n, EUR, EU AWS region, GDPR compliance, SEPA payments |
| Phase 4 (2026) | + India, Brazil | Hindi/Portuguese i18n, INR/BRL, local parsers, UPI/PIX payments, DPDP/LGPD |
| Phase 5 (2026+) | + Japan, Southeast Asia | Japanese i18n, JPY, Konbini payments, separate AP deployment |

---

### 6.11 Schema Summary — All New / Changed Tables

#### New tables
```
organisations — org-level accounts for family, business, enterprise
exchange_rates — daily currency rate snapshots
```

#### Additive columns
```
users
  + org_id (FK → organisations, nullable)
  + role ('owner' | 'admin' | 'member')
  + invited_by (FK → users, nullable)
  + joined_at (nullable)
  + locale (varchar 10)
  + preferred_currency (varchar 3, default 'USD')
  + data_region (varchar 20)

receipts
  + currency (varchar 3)
  + amount_usd (float — converted for analytics)
  + org_id (FK → organisations, nullable — for shared org receipts)
  + shared (boolean, default false — visible to org members)
```

---

### 6.12 Infrastructure Section Changes

Add to `infrastructure.md`:
- Multi-region AWS architecture diagram
- RLS implementation notes
- GDPR compliance checklist additions
- International payment processing setup
- Data residency routing layer

---

### 6.13 Success Metrics

**Multi-tenancy**

| Metric | Target | Rationale |
|---|---|---|
| Cross-tenant leak incidents | 0 | Non-negotiable — any leak is a critical incident |
| RLS coverage | 100% of tables | No exceptions |
| Cross-tenant test suite pass rate | 100% on every deploy | Automated, blocking |

**Internationalisation**

| Metric | Target | Rationale |
|---|---|---|
| UK / CA / AU users within 6mo of Phase 2 | > 10% of total users | Validates English-market expansion |
| EU users within 6mo of Phase 3 | > 8% of total users | GDPR investment justified |
| Non-USD receipt ingestion accuracy | > 92% | Validates currency + parser coverage |
| Local payment method adoption | > 40% in each non-US market | Reduces payment friction |

---

## 7. Historical Data Ingestion

### Overview
Give users a way to backfill months or years of purchase history before they started using ReceiptIQ. Without historical data, price trends are thin, inflation comparisons are shallow, and analytics lack context for the first 3–6 months. Eight ingestion methods cover all major sources — from Amazon's official data export to bulk camera roll scanning.

**Roadmap slot:** Phase 3 (bulk scan + Amazon export) · Phase 4B (browser extension portal + email attachments) · Phase 4C (cloud storage + Plaid bank import)
**New UI:** "Import history" onboarding flow — shown to new users on first login
**Version bump:** v5.0 → v5.1

---

### 7.1 Method Overview — Priority Order

| Priority | Method | Effort | Coverage | ToS risk | Phase |
|---|---|---|---|---|---|
| 1 | Amazon order history CSV import | Low | All Amazon orders, years back | None | 3 |
| 2 | Bulk camera roll / drag-drop upload | Medium | Any paper receipt ever | None | 3 |
| 3 | Email attachment scan (PDF receipts) | Medium | Any retailer emailing PDF receipts | None | 4B |
| 4 | Browser extension — retailer portals | Medium | Costco, Walmart, Target order history | Low | 4B |
| 5 | Google Drive / Dropbox scan | Medium | Whatever user has saved | None | 4C |
| 6 | Bank / credit card import (Plaid) | High | All card transactions — no line items | None | 4C |
| 7 | CCPA data requests (Walmart, Target…) | High | Broad but slow, messy formats | None | 5 |
| 8 | Retailer OAuth (when available) | Very high | Best quality, future-proof | None | 5 |

---

### 7.2 Amazon Order History CSV Import

Amazon's "Request My Data" feature (GDPR/CCPA data portability) exports a ZIP file containing CSVs of every order ever placed — items, prices, dates, ASINs, going back years. The format is stable, well-documented, and completely legal to parse.

#### User flow
1. User goes to Amazon → Account → Request My Data → Order History
2. Amazon emails a ZIP file within 2–5 days
3. User downloads ZIP and uploads it to ReceiptIQ (web drag-drop or mobile file picker)
4. ReceiptIQ parses the CSV, maps to `receipt_items` schema, deduplicates against existing data
5. Background job processes the full history and populates price history

#### CSV fields available
```
Order ID · Order Date · Order Total · Item Name · ASIN
Category · Quantity · Unit Price · Shipping Address
```

#### Implementation notes
- Parse `Retail.OrderHistory.1.csv` (primary file in the export ZIP)
- Map ASIN → item_name_normalized via Amazon product lookup (or Claude extraction)
- Deduplicate: hash(ASIN + order_date + quantity) — prevents double-import if user re-uploads
- Mark all items with `source: 'amazon_csv_export'` and `auto_ingested: true`
- Show a progress bar during import — large histories can have 1,000+ orders

---

### 7.3 Bulk Camera Roll / Drag-Drop Upload

Most people have years of receipt photos sitting in their camera roll. On mobile, allow multi-select of photos. On web, allow drag-drop of up to 50 images at once. Each image goes through the standard Claude Vision OCR pipeline, queued as background jobs.

#### Mobile flow
- "Import from Photos" button in the History Import screen
- System photo picker opens — user selects multiple images (no limit but warn above 100)
- Images queued to SQS for background processing
- Progress indicator: "Processing 47 of 132 receipts…"
- Completed receipts appear in the history view as they finish

#### Web flow
- Drag-and-drop zone accepting JPEG, PNG, HEIC, PDF
- Batch of up to 50 files per upload session
- Same background queue as mobile

#### Cost note
At ~$0.016 per scan, 200 historical receipts = ~$3.20 in Claude API costs. Limit bulk import to Pro tier only. Free tier: max 30 historical scans (same as monthly scan limit).

---

### 7.4 Email Attachment Scan (PDF Receipts)

Separate from the email body parser (which handles inline receipt emails), this scans for PDF attachments in the user's Gmail or Outlook. Many retailers attach a PDF receipt to the email rather than embedding it inline — Whole Foods, Apple, hotel chains, airlines, and most B2B suppliers do this.

#### How it works
- When Gmail/Outlook OAuth is connected, also scan for emails with PDF attachments from known retailer domains
- Download the PDF attachment (not the email body)
- Pass to Claude Vision for extraction (PDFs rendered as images)
- Store same as any other auto-ingested receipt

#### Separate from body parser
- Body parser handles: inline HTML email receipts
- Attachment scanner handles: PDF receipts attached to emails
- Both run as part of the same OAuth connection — no additional setup from the user

#### Retailers commonly using PDF attachments
Apple, hotel chains (Marriott, Hilton, Hyatt), airlines (United, Delta, American), Whole Foods Market, most utility companies, doctors/medical offices, insurance providers

---

### 7.5 Browser Extension — Retailer Web Portal Import

Extends the Phase 4B browser extension to pull full order history from retailer web portals when the user navigates to their account page.

#### Retailer coverage and availability

| Retailer | History available | Login required | Complexity |
|---|---|---|---|
| Costco | ✓ Purchase history in member portal | Yes — Costco account | Medium |
| Walmart | ✓ Order history (online orders only) | Yes — Walmart.com account | Medium |
| Target | ✓ Circle rewards purchase history | Yes — Target Circle account | Medium |
| Best Buy | ✓ Order history | Yes — Best Buy account | Medium |
| Kroger | Partial — loyalty card history | Yes — Kroger Plus card | High |
| Whole Foods | ✗ Not available (Amazon account) | N/A | N/A |

#### User flow
1. User opens the retailer's website and logs in
2. Extension detects the order history page
3. Extension shows a banner: "Import your Costco history into ReceiptIQ?"
4. User taps Import — extension extracts all available order data
5. Data sent to ReceiptIQ API and queued for processing

#### Important: do NOT store retailer credentials
The extension operates within the user's existing browser session. ReceiptIQ never sees, requests, or stores the user's retailer username or password. The user logs in normally in their browser — the extension just reads the page DOM.

---

### 7.6 Cloud Storage Scan (Google Drive / Dropbox)

Many users save receipt PDFs to Google Drive or Dropbox — especially for warranty claims, expense reports, or just general archiving. Connect once and ReceiptIQ scans for receipt-like PDFs.

#### How it works
- User connects Google Drive or Dropbox via OAuth
- ReceiptIQ scans for PDFs with filenames matching receipt patterns (e.g. "receipt", "invoice", "order", merchant names)
- Also scans the "Receipts" folder if one exists
- Presents a review screen: "Found 43 possible receipts — tap to confirm which to import"
- User reviews thumbnails and confirms — avoids importing non-receipt PDFs

#### Privacy note
ReceiptIQ requests read-only access to Drive/Dropbox. Only files matching receipt patterns are downloaded and processed — not the full Drive contents. Raw file content discarded after parsing (same policy as email HTML).

---

### 7.7 Bank / Credit Card Import (Plaid)

Connects to the user's bank or credit card via Plaid to pull transaction history going back 12–24 months. Does not provide line items — only merchant name, date, and total. Fills in the spend picture for transactions where no receipt exists.

#### What Plaid provides
```
Merchant name (normalised) · Transaction date · Amount
Category (Plaid's own categorisation) · Account type
```

#### What ReceiptIQ does with it
- Creates a "Plaid transaction" receipt record with total and merchant only
- Flags as `source: 'plaid'`, `has_line_items: false`
- Shows in analytics as a merchant total (not item-level)
- Used for: total spend per merchant, store visit frequency, category totals
- NOT used for: price history (no line items), vendor comparison

#### Cost
Plaid Transactions product: ~$0.30/user/month. Pro tier only. Include in per-user cost model.

#### Supported institutions
Plaid covers 12,000+ US financial institutions including all major banks (Chase, BofA, Wells Fargo, Citi, Amex, Capital One) and most credit unions.

---

### 7.8 CCPA / GDPR Data Requests

Under CCPA (US) and GDPR (EU), users have the right to request all data a company holds about them. Most major retailers must respond within 45 days (CCPA) or 30 days (GDPR) with a structured data export.

#### Process
1. ReceiptIQ provides guided instructions per retailer: "Here's how to request your data from Walmart"
2. User submits the request on the retailer's website
3. Retailer emails the export (typically a ZIP with JSON or CSV files)
4. User uploads the export to ReceiptIQ
5. ReceiptIQ parses the retailer-specific format

#### Retailer formats (where known)

| Retailer | Export format | Fields available |
|---|---|---|
| Walmart | JSON | Orders, items, prices, store location |
| Target | CSV | Orders, items, Circle rewards |
| Best Buy | CSV | Orders, items, SKUs |
| Kroger | CSV | Loyalty purchase history |

#### Caveat
This is the slowest method (45-day wait) and the export formats are inconsistent and change without notice. Treat as a last resort for users who want deep history and are willing to wait. Build the parser for Walmart and Target first as they have the largest user bases.

---

### 7.9 Retailer OAuth (Future / Phase 5)

The gold standard — user authorises ReceiptIQ to pull their purchase data via the retailer's official API. No scraping, no credential storage, no ToS concerns.

**Current reality:** Almost no major US retailers offer OAuth for third-party order history access as of 2025. This is expected to change as data portability regulations strengthen (EU Digital Markets Act, proposed US data portability legislation).

**Watch list:**
- Amazon Selling Partner API (currently B2B only)
- Kroger API (exists but limited scope)
- Albertsons / Safeway (piloting retailer data programs)
- Open Banking analogues for retail (emerging in EU)

**Action:** Monitor quarterly. Build the OAuth integration framework in Phase 4 (already needed for Gmail/Outlook) so adding retailer OAuth is a configuration change, not a rebuild.

---

### 7.10 Onboarding — "Import Your History" Flow

Show this flow to every new user on first login, before the main dashboard. Make it feel like a setup wizard, not an optional feature.

```
Welcome to ReceiptIQ!

Let's start with what you already have:

[ ] Amazon order history          — Import years of orders instantly
[ ] Photos of old receipts        — Scan your camera roll in bulk
[ ] Receipt PDFs (Drive/Dropbox)  — Connect your cloud storage
[ ] Bank / credit card            — Link your card for transaction history
[ ] Other retailers (Costco, Walmart…) — Browser extension guide

[Skip for now — start fresh]     [Import selected sources →]
```

Each option checked triggers the relevant import flow immediately. Users who complete at least one import source are significantly more likely to be retained at 30 days — the analytics are immediately interesting rather than empty.

---

### 7.11 New Data Schema

#### Additive columns to `receipts`
```
+ source_detail (varchar — 'amazon_csv_export' | 'camera_roll' | 'pdf_attachment' |
                           'portal_extension' | 'google_drive' | 'dropbox' |
                           'plaid' | 'ccpa_export' | 'retailer_oauth')
+ has_line_items (boolean, default true — false for Plaid transactions)
+ historical_import_id (FK → historical_imports, nullable)
+ import_confidence (float 0–1, nullable — OCR confidence for scanned items)
```

#### New table: `historical_imports`
```
id (uuid, PK)
user_id (FK → users)
source_type (matches source_detail values above)
started_at
completed_at (nullable)
status ('queued' | 'processing' | 'completed' | 'failed')
total_records (int)
processed_records (int)
failed_records (int)
date_range_start (date — earliest record in import)
date_range_end (date — latest record in import)
error_log (text, nullable)
```

---

### 7.12 Features Section Changes

**Phase 3 — Smart Shopping:** add new feature:
- **Bulk Historical Import** — Import years of receipt history from Amazon order exports, bulk camera roll scanning, or drag-and-drop PDF upload. Analytics and price trends are meaningful from day one.

**Phase 4 — Advanced:** add new feature:
- **Full History Backfill** — Connect Google Drive or Dropbox to scan saved receipt PDFs. Import transaction history from bank/credit cards via Plaid. Browser extension pulls Costco, Walmart, and Target order history directly from your account page.

---

### 7.13 Overview & Marketing Changes

Add to core user journeys:
- **📦 Import History** — Upload your Amazon order history CSV, bulk-scan your camera roll, or connect your bank card → years of data imported in minutes → analytics are interesting from day one, not month six

Add to market gap:
- "No app gives you a structured onboarding flow to import years of existing purchase history from Amazon, your camera roll, cloud storage, and bank cards in one session"

---

### 7.14 Roadmap Changes

**Phase 3 — Smart Shopping:** add:
- Amazon order history CSV import
- Bulk camera roll import (mobile)
- Batch drag-drop upload (web, up to 50 files)
- "Import your history" onboarding flow

**Phase 4B — Bills + Notifications:** add:
- Email PDF attachment scanner (Gmail + Outlook)
- Browser extension: Costco, Walmart, Target portal history import

**Phase 4C — Extended Bills:** add:
- Google Drive + Dropbox receipt scan
- Bank / credit card import (Plaid)

**Phase 5 — Full Life Spend:** add:
- CCPA export parsers (Walmart, Target, Best Buy)
- Retailer OAuth (when available)

---

### 7.15 Pricing Changes

**Bulk historical import limits by tier:**

| Tier | Bulk scan limit | Amazon CSV | Plaid | Cloud storage |
|---|---|---|---|---|
| Free | 30 historical scans | ✗ | ✗ | ✗ |
| Pro | Unlimited | ✓ | ✓ ($0.30/mo added) | ✓ |
| Family | Unlimited (per member) | ✓ | ✓ per member | ✓ |

---

### 7.16 Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| Onboarding import completion | > 50% of new users complete ≥ 1 import | Validates the history import as a retention driver |
| Amazon CSV imports | > 20% of Pro users within 30 days | Measures awareness and willingness to export |
| Avg historical records per import | > 200 items | Validates real data depth being added |
| 30-day retention (users who imported) | > 15% higher than non-importers | Core hypothesis — history = stickiness |
| Bulk scan accuracy | > 90% confidence on camera roll photos | OCR quality on non-ideal real-world images |

---

## 8. Market Strategy & Feature Optimisation

### Overview
Based on analysis of the current personal finance app market — including Mint's shutdown, Monarch Money's $20M+ ARR post-Mint, YNAB/Copilot positioning, app retention benchmarks, and user complaint patterns — this requirement captures strategic adjustments to the feature set, roadmap, and pricing before implementation begins.

**Key market insight:** The Mint shutdown left 25M registered accounts without a home. The winners (Monarch at $99.99/year, YNAB at $109/year) all use bank aggregation via Plaid — merchant name, date, total. None of them do what ReceiptIQ does: line-item intelligence, price history per item, vendor comparison, shopping list AI. ReceiptIQ is not competing on their turf. It's doing something they cannot.

**Version bump:** v5.1 → v5.2 (additive — no breaking changes to existing requirements)

---

### 8.1 Features to Add

#### 8.1.1 Net Worth Tracking
**Priority: High — add to Phase 2**

Every successful personal finance app includes net worth tracking. Users who track net worth visit more often, stay longer, and convert to paid at higher rates. Monarch, Empower, Copilot, and YNAB all include this.

- Connect bank accounts, investment accounts, credit cards via Plaid (already in stack for Req 7)
- Show a single net worth number on the dashboard: assets − liabilities
- Net worth over time chart (monthly snapshots)
- Account balance breakdown: checking, savings, investments, credit cards, loans
- ReceiptIQ's unique angle: overlay net worth with spend data — "your net worth dropped $340 this month, driven by $510 in dining overspend"

**Implementation note:** Plaid's Balance product costs ~$0.05/connection/month on top of the Transactions product. Marginal cost per Pro user.

#### 8.1.2 Plaid Bank Sync as Ongoing Live Feature
**Priority: High — add to Phase 2 alongside net worth**

Currently Plaid is planned only for historical import (Req 7). Promote it to a core ongoing feature: live bank and credit card transaction sync running continuously in the background, the same way Monarch works.

- Every bank and card transaction synced daily (merchant + total, no line items)
- Fills the spend picture for everything without a receipt — coffee shops, ATM withdrawals, transfers
- Shown in analytics with a clear label: "Bank transaction — no line items available"
- When a receipt IS scanned for the same merchant on the same day, merge the records automatically — enriching the bank transaction with line items
- Creates a complete spending view: receipt-level detail where available, merchant-level everywhere else

**This is the bridge between ReceiptIQ (receipt intelligence) and Monarch (full spending view) — ReceiptIQ becomes both.**

#### 8.1.3 Goals Tracking
**Priority: Medium — add to Phase 3**

- Users set savings or spending goals: "Save $1,200 for a vacation by August", "Keep dining under $300/month"
- Progress indicator shown on dashboard and in push notifications
- Weekly check-in: "You're on track for your vacation goal — $340 saved of $1,200"
- Goals linked to categories: a "dining budget" goal connects to the dining category analytics
- Milestone celebrations (subtle — first goal completed, 3-month streak, etc.)

#### 8.1.4 Gamification & Streaks
**Priority: Medium — add to Phase 3**

Finance apps with streaks and milestones show meaningfully lower 90-day churn. Cost to build is low; retention impact is high.

- **Budget streak** — consecutive weeks under budget in a category: "🔥 6-week grocery streak"
- **Scan streak** — consecutive weeks with at least one receipt scanned
- **Savings milestone** — first time monthly spend drops below the previous month's average
- **Import milestone** — first Amazon import, first Plaid connection, etc.
- Weekly digest includes streak summary: "You're on a 4-week dining budget streak — keep it up"
- Streaks shown on profile/settings page — social proof when sharing with household members

#### 8.1.5 Tax Year Export & Summary
**Priority: Medium — add to Phase 4**

- One-tap "Generate my 2024 tax summary" PDF
- Includes: total spend by category for the tax year, FSA/HSA eligible items flagged and totalled, subscription costs for the full year, business-eligible expenses (if user tags them), charitable purchases
- Useful for: FSA/HSA reimbursement filing, freelancer expense tracking, general record-keeping
- Creates a strong annual retention anchor — a reason to stay subscribed even for light users

---

### 8.2 Features to Remove or Deprioritise

#### Remove: CCPA Data Requests
**Remove from roadmap entirely.**

45-day wait, messy and inconsistent export formats across retailers, and very low user uptake in practice. The effort-to-value ratio is poor. Users who want historical data from Walmart or Target are better served by the browser extension (when/if it ships) or by scanning existing paper receipts.

#### Deprioritise: Browser Extension (Phase 5 only)
**Move from Phase 4B to Phase 5.**

High engineering effort, ToS legal risk (varies by retailer), and the email ingestion channel already covers most of the same retailers more cleanly. The browser extension provides marginal additional value once email OAuth, forward-to-email, and Amazon CSV import are live. Worth building eventually — not worth the risk and effort in Phase 4.

#### Deprioritise: Loyalty Card Tracker (Phase 5 only)
**Move from Phase 4 to Phase 5.**

Niche feature — most users don't think about loyalty point value tracking. Adds onboarding complexity and support burden without driving primary retention. Build if users specifically request it post-launch.

#### Deprioritise: Barcode Scanner (Phase 5 only)
**Move from Phase 3 to Phase 5.**

The barcode scanner use case (scan a product in store to check prices) is a different user behaviour from receipt capture. It competes with existing price comparison apps (Honey, Google Shopping). Not a primary driver of ReceiptIQ's value proposition. Deprioritise until Phase 5.

---

### 8.3 Features to Reframe

#### Vendor Price Comparison — Crowd-Sourced First
**Reframe how Phase 2 vendor comparison works.**

The original spec assumes AI looks up live retail prices at Walmart, Target, Costco, Amazon. In practice, there is no clean API for this — it requires fragile web scraping, expensive third-party price feeds, or Claude's potentially stale knowledge.

**Revised approach:**
1. **Primary source: ReceiptIQ's own price database** — prices extracted from all users' scanned receipts (anonymised, store + item + price + date). As user count grows, this becomes a genuinely valuable and accurate crowd-sourced price feed for local stores
2. **Secondary source: Claude's knowledge** — for items not yet in the price database, Claude estimates based on training data, clearly labelled as "estimated"
3. **Future: retailer API / price feed partnerships** — when scale justifies the cost

This approach:
- Works from day one without any third-party dependency
- Gets more accurate as user count grows (network effect)
- Is completely ToS-compliant
- Creates a proprietary data asset no competitor can replicate

**Schema addition:**
```
price_history
  + user_count (int — how many users have purchased this item at this store)
  + is_estimated (boolean — true if Claude estimate, false if from receipts)
  + confidence ('crowd_sourced' | 'ai_estimate' | 'retailer_api')
```

---

### 8.4 Roadmap Changes

#### Move Household Mode to Phase 2
**Original:** Phase 4
**New:** Phase 2

Couples who both use the app have dramatically lower churn than solo users — switching costs double, engagement doubles, and word-of-mouth doubles. Monarch built for couples from day one and it is consistently cited as their strongest differentiator. Move household mode (shared account, multiple members, unified analytics) to Phase 2 alongside the intelligence features.

Phase 2 household scope (simplified for earlier shipping):
- Invite a household member via email
- Both users' receipts appear in a shared view
- Unified spending analytics across both members
- "Yours / Mine / Ours" split view on dashboard

Full household features (split contribution, admin panel, per-member budgets) remain Phase 4.

#### Updated Roadmap

| Quarter | Theme | Key Deliverables |
|---|---|---|
| **Q1 2025** | Foundation | Auth, receipt scanning, line-item storage, dashboard, mobile + web app |
| **Q2 2025** | Intelligence + Household | Price history, crowd-sourced vendor comparison, inflation tracker, net worth tracking, Plaid bank sync (ongoing), household mode v1 |
| **Q3 2025** | Smart Shopping + Goals | Shopping list AI (type or upload), budget alerts, goals tracking, gamification/streaks, custom date range reports, AI spending assistant |
| **Q4 2025** | Auto-Ingestion + Bills | Gmail/Outlook OAuth, forward-to-email, bills ingestion, push notifications, weekly digest, tax year export |
| **Q1 2026** | History + Scale | Amazon CSV import, bulk scan, Google Drive/Dropbox, full Plaid bank history, 20+ email parsers, household mode v2 (full features) |
| **Phase 5 2026+** | Advanced | Medical bills, browser extension (ToS-reviewed), loyalty card tracker, barcode scanner, retailer OAuth partnerships |

---

### 8.5 Pricing Changes

**Raise Pro from $4.99 to $6.99/month.** Raise Family from $7.99 to $9.99/month.

Rationale:
- Monarch charges $99.99/year ($8.33/month)
- YNAB charges $109/year ($9.08/month)
- ReceiptIQ at $6.99/month ($83.88/year) is still meaningfully cheaper than both while offering capabilities neither has
- The 40% price increase improves unit economics dramatically — ramen profitable at ~12,000 users instead of ~22,000
- Users migrating from Mint are already accustomed to paying for personal finance apps at $8–10/month
- Lower price signals lower value — at $4.99 ReceiptIQ reads as a "basic" tool; at $6.99 it reads as premium

**Updated tier pricing:**

| Tier | Monthly | Annual | vs. Monarch | vs. YNAB |
|---|---|---|---|---|
| Free | $0 | $0 | — | — |
| Pro | $6.99/mo | $59.99/yr | 40% cheaper | 45% cheaper |
| Family | $9.99/mo | $89.99/yr | — | — |

**Note:** Update all references to $4.99 and $7.99 in `pricing.md` and `receiptiq_overview.md`.

---

### 8.6 New Feature Schema Additions

#### `net_worth_snapshots` (new table)
```
id (uuid, PK)
user_id (FK → users)
captured_at (date — daily snapshot)
total_assets (float)
total_liabilities (float)
net_worth (float — computed: assets − liabilities)
account_breakdown (jsonb — per-account balances)
```

#### `goals` (new table)
```
id (uuid, PK)
user_id (FK → users)
org_id (FK → organisations, nullable — shared household goals)
goal_type ('save_amount' | 'category_budget' | 'reduce_spend' | 'custom')
name (e.g. "Vacation fund", "Cut dining to $300/mo")
target_amount (float)
target_date (date, nullable)
category (nullable — for category budget goals)
current_amount (float — updated on each relevant ingestion)
status ('active' | 'completed' | 'abandoned')
created_at
```

#### `streaks` (new table)
```
id (uuid, PK)
user_id (FK → users)
streak_type ('budget' | 'scan' | 'savings' | 'import')
category (nullable — for budget streaks)
current_count (int — weeks/days)
longest_count (int — all-time best)
last_updated (date)
active (boolean)
```

#### Additive columns to `price_history`
```
+ user_count (int, default 1)
+ is_estimated (boolean, default false)
+ confidence ('crowd_sourced' | 'ai_estimate' | 'retailer_api')
```

---

### 8.7 Files to Update

- `pricing.md` — Pro $4.99 → $6.99, Family $7.99 → $9.99, all revenue/P&L projections, milestones, break-even, sensitivity analysis, annual plans, competitive table
- `receiptiq_overview.md` — add net worth, goals, gamification; update pricing references
- `infrastructure.md` — add `net_worth_snapshots`, `goals`, `streaks` to DB tables section; update Phase 2 timeline
- Workflow SVG and architecture SVG — no changes needed (Plaid already shown; new tables are data-layer additions)

---

### 8.8 Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| 30-day retention | > 35% | Up from typical 29% industry average — history import + net worth tracking should lift this |
| 90-day retention | > 20% | Streaks and goals create habit loops that sustain past day 30 |
| Pro conversion | > 6% | Higher than 5% baseline — net worth + AI chat justify the price |
| Household adoption | > 25% of Pro users | Couples cut churn in half |
| Goals created per user | > 1.5 within 30 days | Validates emotional investment in the product |
| Streak engagement | > 40% of active users have an active streak | Measures gamification effectiveness |
| Net worth DAU | > 30% of users check net worth weekly | Validates it as a retention feature |
