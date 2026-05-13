# ReceiptIQ — Product Plan v1.0

> An AI-powered, multi-category expense tracker that turns paper receipts into deep financial intelligence — with item-level price history, cross-vendor comparison, and smart shopping list estimation.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Market Analysis](#2-market-analysis)
3. [Core User Journeys](#3-core-user-journeys)
4. [Feature Roadmap](#4-feature-roadmap)
5. [Analytics Reports](#5-analytics-reports)
6. [Tech Stack](#6-tech-stack)
7. [Data Model](#7-data-model)
8. [Platform Strategy](#8-platform-strategy)
9. [Delivery Roadmap](#9-delivery-roadmap)
10. [Success Metrics](#10-success-metrics)

---

## 1. Product Overview

ReceiptIQ solves a problem no existing app fully addresses: a single, unified platform that combines receipt scanning across all spending categories, item-level price tracking, real-time vendor price comparison, and AI-powered shopping list cost estimation.

### The Market Gap

- No single app combines receipt scanning + multi-category tracking + vendor price comparison + shopping list estimation
- No app covers non-grocery categories (electronics, medicine, stationery) at item level
- No app uses AI to estimate shopping list cost across local vendors in real time
- No app tracks the same item's price inflation across stores over time
- No app offers both mobile and full web portal with equal feature parity

---

## 2. Market Analysis

| App | Focus | Strength | Gap | Pricing |
|---|---|---|---|---|
| **Groceries Tracker** | Grocery-only | AI OCR per item, store comparison, household sharing | No broad categories (medicine, electronics) | Freemium |
| **Expensify** | Business expense mgmt | Industry-leading SmartScan OCR, multi-currency, policy enforcement | No item-level price tracking, not consumer-focused | $4.99–$9/mo |
| **Skwad** | Household budgeting | Line-item extraction, cloud sync, receipt categorization | No vendor price comparison, no shopping list AI | Freemium |
| **Fetch Rewards** | Receipt rebates/loyalty | Any store receipt accepted, large user base | Rebate app only — zero spending analytics | Free (ad-supported) |
| **GroceryTracker Pro** | Grocery budgeting | Household sharing, monthly trend charts, store totals | Grocery only, no cross-category analytics | Free + Premium |
| **Smart Receipts** | Tax documentation | Offline, open-source, CSV/PDF export | No auto-categorization, no analytics | Free / $2.99/mo |
| **Ibotta / Checkout 51** | Cashback rebates | Stacks with price trackers, PayPal payout | No expense tracking, no analytics | Free |
| **Flipp / Basket** | Pre-purchase price compare | Real-time weekly flyer data, multi-store price check | No receipt ingestion, no personal analytics | Free |

**Verdict:** No existing app offers the full combination of multi-category receipt scanning + item-level price history + live vendor comparison + AI shopping list estimation. ReceiptIQ occupies a unique position in this market.

---

## 3. Core User Journeys

### 📷 Upload Receipt
Snap a photo → AI extracts every line item → stored with category, price, store, and date.

### 📈 Price Intelligence
Click any item → see price history chart → AI fetches current vendor prices → shows savings opportunity.

### 🛒 Smart Shopping
Type your shopping list → AI estimates total cost per store → recommends optimal store split.

### 📊 Analytics
Run 35+ reports across spending, inflation, behavior, savings, and forecasting.

---

## 4. Feature Roadmap

### 🏗️ Phase 1 — Core

| Feature | Description |
|---|---|
| **User Registration & Login** | Email/password + OAuth (Google, Apple). JWT-based sessions. Per-user encrypted data isolation. |
| **Receipt Upload & OCR** | Upload photo, PDF, or screenshot. Claude Vision API extracts store name, date, total, and every line item with name, qty, unit price, total, and auto-detected category. |
| **Line-Item Storage** | Each item stored individually in DB with user ID, receipt ID, date, store, category, unit price. Enables all downstream analytics. |
| **Expense Dashboard** | Monthly spend overview, category breakdown pie chart, recent receipts list, quick stats (total this month, top category, biggest receipt). |
| **Manual Entry** | Add items or receipts manually when no receipt is available. |

### 🧠 Phase 2 — Intelligence

| Feature | Description |
|---|---|
| **Item Price History** | Click any item to see every time it was purchased: date, store, price. Line chart shows price trend over time. Delta vs. first purchase shown prominently. |
| **Vendor Price Comparison** | AI-powered lookup of current market price for the same item at Walmart, Target, Costco, Amazon, Whole Foods, Aldi, Kroger. Shows cheapest option and potential savings. |
| **Category Analytics** | Deep-dive reports per category: spend trend, top items, average unit price, frequency of purchase, month-over-month change. |
| **Inflation Tracker** | Track price changes for recurring items over time. Show % increase vs. 3mo/6mo/1yr ago. Compare personal inflation rate vs. CPI. |
| **Store Performance** | Which stores you shop most, avg spend per visit, cost efficiency score (your price vs. market average). |

### 🛒 Phase 3 — Smart Shopping

| Feature | Description |
|---|---|
| **Shopping List Estimator** | Upload or type a shopping list. AI estimates cost per item using your price history + current market data. Shows total estimate per store. Recommends optimal store split. |
| **Smart List Optimization** | Given a shopping list, AI suggests which store to buy each item from to minimize total cost. Accounts for travel effort with configurable store radius. |
| **Budget Alerts** | Set monthly budgets per category. Real-time alerts when approaching or exceeding limits (push, email, SMS). |
| **Predictive Spend** | Based on purchase patterns, forecast next month's spending per category. Highlight unusual spikes. |

### 🚀 Phase 4 — Advanced

| Feature | Description |
|---|---|
| **Household / Family Mode** | Shared account for household. Multiple members upload receipts. Unified analytics. Split-contribution view. |
| **Export & Integrations** | Export to CSV, PDF, Excel. Connect to Mint, YNAB, QuickBooks. Tax report generation for FSA/HSA medicine purchases. |
| **Barcode Scanner** | Scan product barcode to instantly look up current prices across vendors without a receipt. |
| **Subscription Detection** | Identify recurring charges (streaming, memberships) from receipts. Track subscription spend. |
| **Loyalty Card Tracker** | Track loyalty points and rewards across stores. Show value of unredeemed rewards. |

---

## 5. Analytics Reports

> Reports marked ★ require Vendor Price API integration. Reports marked ◆ require 3+ months of data.

### 📊 Spending Overview (6 reports)
1. **Monthly Total Spend** — total expenditure by month with trend line and % MoM change
2. **Weekly Spend Pattern** — average spend per day of week; identify high-spend days
3. **Category Spend Breakdown** — pie + bar chart of spend across Groceries, Electronics, Medicine, etc.
4. **Annual Summary Report** — full year view with category heatmap and 12-month trend
5. **Spend vs. Budget Tracker** — actual vs. target per category per month
6. **Average Transaction Size** — mean receipt total per store with outlier flagging

### 💰 Price Intelligence (6 reports)
1. **Item Price History** — purchase price over time for any item, with trend line and stats
2. **Personal Inflation Report** ◆ — % price increase for your recurring items vs. CPI benchmark
3. **Vendor Price Matrix** ★ — side-by-side current price comparison for top 20 items across stores
4. **Best Store by Category** ★ — which store gives best price per category
5. **Price Anomaly Alerts** — items that spiked >10% vs. your historical average
6. **Price Opportunity Map** ★ — items where you overpaid vs. cheapest available vendor

### 🔄 Purchasing Behavior (6 reports)
1. **Purchase Frequency Report** — how often you buy each item; flag items bought more than needed
2. **Store Visit Analysis** — frequency, average spend, category mix per store
3. **Basket Composition Report** — what categories you typically combine in one trip
4. **Seasonal Spend Patterns** ◆ — month-by-month category spend across years; spot seasonal trends
5. **Brand Preference Tracker** — store-brand vs. name-brand spend ratio per category
6. **Impulse Buy Detector** — single-quantity items not on prior shopping patterns

### 🏥 Health & Wellness (4 reports)
1. **Medicine & Healthcare Spend** — total medical spend per month with per-item breakdown
2. **Personal Care Spend Trend** — monthly spend on personal care items with product detail
3. **Nutritional Budget Analysis** — estimated spend on fresh produce vs. processed food
4. **FSA / HSA Eligible Spend** — auto-flag medicine receipts for tax reimbursement tracking

### 💡 Savings & Optimization (5 reports)
1. **Savings Opportunities Report** ★ — if you bought each item from cheapest vendor, total savings
2. **Duplicate Purchase Detector** — same item bought within short window (possible pantry excess)
3. **Bulk Buy ROI** ★ — items where buying in bulk at Costco/warehouse club saves vs. regular buys
4. **Store-Switch Savings** ★ ◆ — estimated monthly savings if you switched primary store for top items
5. **Coupon + Deal Gap Analysis** — items frequently purchased that have recurring deals you missed

### 🔮 Forecasting & Planning (5 reports)
1. **Next Month Spend Forecast** ◆ — ML-based prediction per category using 90-day rolling history
2. **Shopping List Cost Estimate** ★ — predicted total for any planned shopping list
3. **Annual Expense Projection** ◆ — extrapolate current patterns to full-year estimate
4. **Category Budget Recommendation** ◆ — AI-suggested monthly budget per category based on patterns
5. **Subscription & Recurring Cost Summary** — identified recurring charges and their annual impact

---

## 6. Tech Stack

### 🖥️ Frontend Web
- React 18 + TypeScript
- Next.js 14 (App Router)
- TailwindCSS + shadcn/ui
- Recharts / D3.js for analytics
- React Query for server state
- PWA manifest for offline support

### 📱 Mobile App
- React Native + Expo
- Shared business logic with web
- Native camera / OCR trigger
- Push notifications (Expo)
- Offline-first with SQLite sync
- App Store + Google Play distribution

### ⚙️ Backend API
- Node.js + Express / Fastify
- REST API + WebSockets
- JWT authentication + refresh tokens
- Rate limiting + input validation
- OpenAPI / Swagger docs
- Stripe for subscription billing

### 🧠 AI / Intelligence
- Claude claude-sonnet-4-20250514 (Vision OCR, JSON extraction)
- Claude for vendor price comparison
- Claude for shopping list estimation
- LangChain for chained analysis workflows
- Vector embeddings for item name fuzzy matching
- Caching layer to reduce API costs

### 🗄️ Data Storage
- PostgreSQL (primary — users, receipts, items)
- Redis (sessions, cache, rate limiting)
- S3-compatible storage (receipt images)
- Pinecone (vector embeddings for item matching)
- TimescaleDB extension for time-series price data
- Automatic daily backups

### ☁️ Infrastructure
- AWS / Vercel for web hosting
- AWS Lambda for OCR processing jobs
- CloudFront CDN for receipt images
- GitHub Actions CI/CD pipeline
- Sentry for error monitoring
- Datadog for performance APM

### AI Processing Flow

```
📷 Receipt Upload
       ↓
🔍 Claude Vision  →  Extract store, date, all line items as JSON
       ↓
⚙️  Normalize     →  Fuzzy-match item names, assign categories
       ↓
💾 Store          →  PostgreSQL + price_history update
       ↓
📊 Analyze        →  Trigger dashboard refresh
```

---

## 7. Data Model

> The `receipt_items` table is the heart of the system — every line item stored individually enables all analytics. The `price_history` table is populated from both receipts and AI vendor lookups, powering comparison features.

### `users`
```
id               (uuid, PK)
email            (unique, indexed)
password_hash
display_name
created_at
subscription_tier
household_id     (FK, nullable)
```

### `receipts`
```
id               (uuid, PK)
user_id          (FK → users)
store_name
store_chain
receipt_date
total_amount
currency
image_url        (S3 key)
raw_ocr_text
created_at
```

### `receipt_items`
```
id                    (uuid, PK)
receipt_id            (FK → receipts)
user_id               (FK → users, denormalized for query speed)
item_name
item_name_normalized  (lowercase, stemmed)
quantity
unit
unit_price
line_total
category
brand                 (nullable)
barcode               (nullable)
created_at
```

### `price_history`
```
id                  (uuid, PK)
item_name_normalized
store_chain
unit_price
unit
captured_at
source              ('receipt' | 'vendor_api' | 'ai_estimate')
user_id             (nullable — global prices)
```

### `shopping_lists`
```
id               (uuid, PK)
user_id          (FK → users)
name
created_at
estimated_total
list_items       (jsonb array)
```

---

## 8. Platform Strategy

### 📱 Mobile App (iOS + Android via React Native + Expo)
- Native camera for receipt scanning
- Push notifications for budget alerts
- Barcode scanner via device camera
- Offline receipt queue (sync when online)
- Bottom-tab navigation optimized for thumb reach
- Home screen widgets for quick spend view
- Face ID / Touch ID login
- App Store + Google Play distribution

**Stack:** React Native · Expo · SQLite · React Query · Expo Camera

### 🖥️ Web Portal (Full-featured browser app)
- Drag-and-drop receipt upload (batch)
- Full analytics dashboard with advanced charts
- Keyboard shortcuts for power users
- Data export (CSV, PDF, Excel)
- Multi-tab comparison views
- Print-friendly report layouts
- PWA installable on desktop
- Admin panel for household managers

**Stack:** Next.js 14 · React · TailwindCSS · Recharts · D3.js

### Shared Architecture
| Concern | Approach |
|---|---|
| **Shared Business Logic** | TypeScript shared packages for validation, formatting, and API calls — used by both web and mobile |
| **Single API Backend** | One Node.js API serves both platforms. Feature flags for platform-specific behavior. |
| **Real-time Sync** | WebSockets push receipt processing updates and budget alerts to both platforms simultaneously |
| **Unified Auth** | JWT tokens work across web and mobile. Refresh token rotation. OAuth (Google, Apple) on both. |
| **Design System** | Shared design tokens and component library. Consistent UX across web (shadcn) and mobile (NativeBase). |
| **CI/CD Pipeline** | GitHub Actions deploys web to Vercel and mobile via Expo EAS Build + OTA updates simultaneously. |

---

## 9. Delivery Roadmap

### Q1 2025 — Foundation
- [ ] User auth (email + OAuth)
- [ ] Receipt upload + Claude OCR
- [ ] Line-item storage schema
- [ ] Basic dashboard + category charts
- [ ] React Native app skeleton
- [ ] Core REST API

### Q2 2025 — Intelligence
- [ ] Item price history charts
- [ ] Vendor price comparison (AI)
- [ ] Store analytics deep-dive
- [ ] Category trend reports
- [ ] Inflation tracker
- [ ] Mobile app feature parity

### Q3 2025 — Smart Shopping
- [ ] Shopping list estimator
- [ ] Store optimization AI
- [ ] Budget alerts (push/email)
- [ ] Predictive spend forecasting
- [ ] Barcode scanner
- [ ] Household / family mode

### Q4 2025 — Growth & Scale
- [ ] CSV / PDF export
- [ ] Mint / YNAB integration
- [ ] FSA/HSA tax report
- [ ] Subscription detection
- [ ] Loyalty card tracker
- [ ] Public API for partners

---

## 10. Success Metrics

| Metric | Target | Why It Matters |
|---|---|---|
| **Receipts Scanned** | 5,000 / month by Q2 | Validates OCR quality + user habit |
| **Item Accuracy Rate** | > 95% OCR precision | Ensures analytics are trustworthy |
| **Weekly Active Users** | > 40% of registered | Indicates genuine utility |
| **Avg Receipts / User** | 8+ per month | Signals complete household use |
| **Price Alerts Actioned** | > 30% click-through | Validates intelligence value |
| **Shopping List Uses** | 3+ per active user/mo | Core differentiator usage |

---

*ReceiptIQ Product Plan v1.0 — Ready for implementation review*
