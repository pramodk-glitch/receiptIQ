import { useState } from "react";

const SECTIONS = [
  "Overview","Market","Features","Analytics Reports","Architecture",
  "Data Model","Roadmap","Platform Strategy","Auto-Ingestion",
  "Duplicate Detection","Purchase Engine"
];

const COMPETITORS = [
  { name:"Groceries Tracker", focus:"Grocery-only", strength:"AI OCR per item, store comparison, household sharing", gap:"No broad categories (medicine, electronics)", pricing:"Freemium", rating:"⭐ 4.6", badge:"Closest match", badgeColor:"#10b981" },
  { name:"Expensify", focus:"Business expense mgmt", strength:"Industry-leading SmartScan OCR, multi-currency, policy enforcement", gap:"No item-level price tracking, no vendor comparison, not consumer-focused", pricing:"$4.99–$9/mo", rating:"⭐ 4.4", badge:"Enterprise", badgeColor:"#6366f1" },
  { name:"Skwad", focus:"Household budgeting", strength:"Line-item extraction, cloud sync, receipt categorization", gap:"No vendor price comparison, no shopping list AI estimation", pricing:"Freemium", rating:"⭐ 4.2", badge:"Budget tool", badgeColor:"#f59e0b" },
  { name:"Fetch Rewards", focus:"Receipt rebates/loyalty", strength:"Any store receipt accepted, large user base", gap:"Rebate app only — zero spending analytics", pricing:"Free (ad-supported)", rating:"⭐ 4.3", badge:"Rewards only", badgeColor:"#64748b" },
  { name:"GroceryTracker Pro", focus:"Grocery budgeting", strength:"Household sharing, monthly trend charts, store totals", gap:"Grocery only, no cross-category analytics, no shopping AI", pricing:"Free + Premium", rating:"⭐ 4.5", badge:"Grocery only", badgeColor:"#64748b" },
  { name:"Smart Receipts", focus:"Tax documentation", strength:"Offline, open-source, CSV/PDF export", gap:"No auto-categorization, no analytics, no vendor comparison", pricing:"Free / $2.99/mo", rating:"⭐ 4.0", badge:"Tax tool", badgeColor:"#94a3b8" },
  { name:"Ibotta / Checkout 51", focus:"Cashback rebates", strength:"Stacks with price trackers, PayPal payout", gap:"No expense tracking, no analytics whatsoever", pricing:"Free", rating:"⭐ 4.2", badge:"Cashback", badgeColor:"#64748b" },
  { name:"Flipp / Basket", focus:"Pre-purchase price compare", strength:"Real-time weekly flyer data, multi-store price check", gap:"No receipt ingestion, no spend history, no personal analytics", pricing:"Free", rating:"⭐ 4.1", badge:"Pre-shop only", badgeColor:"#64748b" },
];

const GAP = [
  "No single app combines receipt scanning + multi-category tracking + vendor price comparison + shopping list estimation",
  "No app covers non-grocery categories (electronics, medicine, stationery) at item level",
  "No app uses AI to estimate shopping list cost across local vendors in real time",
  "No app tracks the same item's price inflation across stores over time",
  "No app offers both mobile and full web portal with equal feature parity",
  "No app automatically pulls receipts from Amazon, Costco, Walmart and other retailers via email or browser",
  "No app detects duplicate receipts or cross-session data integrity issues",
  "No app learns personal shopping patterns to proactively build optimized purchase orders",
  "No app lets you ask natural language questions about your own spending data and get accurate, sourced answers",
  "No app captures the full picture — retail receipts + utility bills + restaurant checks + subscriptions + travel in one place",
];

const FEATURES = [
  {
    phase:"Phase 1 — Core",color:"#10b981",icon:"🏗️",
    items:[
      { f:"User Registration & Login", d:"Email/password + OAuth (Google, Apple). JWT-based sessions. Per-user encrypted data isolation. PostgreSQL Row-Level Security enforced at DB layer.", isNew:false },
      { f:"Receipt Upload & OCR", d:"Upload photo, PDF, or screenshot. Claude Vision API extracts store name, date, total, and every line item with name, qty, unit price, total, and auto-detected category.", isNew:false },
      { f:"Duplicate Receipt Detection", d:"Automatic detection using perceptual image hashing (pHash) + content fingerprinting (SHA-256 of store + date + total). Flags before saving, shows side-by-side comparison, user confirms merge or discard. Prevents double-counting in all analytics. See Duplicate Detection tab.", isNew:true },
      { f:"Line-Item Storage", d:"Each item stored individually in DB with user ID, receipt ID, date, store, category, unit price. Enables all downstream analytics.", isNew:false },
      { f:"Expense Dashboard", d:"Monthly spend overview, category breakdown pie chart, recent receipts list, quick stats (total this month, top category, biggest receipt).", isNew:false },
      { f:"Manual Entry", d:"Add items or receipts manually when no receipt is available.", isNew:false },
    ]
  },
  {
    phase:"Phase 2 — Intelligence",color:"#6366f1",icon:"🧠",
    items:[
      { f:"Item Price History", d:"Click any item to see every time it was purchased: date, store, price. Line chart shows price trend over time. Delta vs. first purchase shown prominently.", isNew:false },
      { f:"Vendor Price Comparison", d:"AI-powered lookup of current market price for the same item at Walmart, Target, Costco, Amazon, Whole Foods, Aldi, Kroger. Shows cheapest option and potential savings.", isNew:false },
      { f:"Shopping Pattern Intelligence", d:"Analyzes purchase history to identify recurring items, restock cycles, basket composition, and price-timing patterns. Surfaces insights like 'You buy milk every 7 days — due soon' and 'Wednesday afternoons at Aldi are 12% cheaper for produce.' Foundation for AI Purchase Orders. See Purchase Engine tab.", isNew:true },
      { f:"Net Worth Tracking", d:"Connects to bank accounts and investment portfolios via Plaid. Shows assets minus liabilities updated daily. Overlays spending data with net worth trend for a complete financial picture.", isNew:true },
      { f:"Category Analytics", d:"Deep-dive reports per category: spend trend, top items, average unit price, frequency of purchase, month-over-month change.", isNew:false },
      { f:"Inflation Tracker", d:"Track price changes for recurring items over time. Show % increase vs. 3mo/6mo/1yr ago. Compare personal inflation rate vs. CPI.", isNew:false },
      { f:"Store Performance", d:"Which stores you shop most, avg spend per visit, cost efficiency score (your price vs. market average).", isNew:false },
    ]
  },
  {
    phase:"Phase 3 — Smart Shopping + AI",color:"#f59e0b",icon:"🛒",
    items:[
      { f:"AI Purchase Order Builder", d:"Based on shopping patterns + item restock cycles + current local prices, AI auto-generates a suggested purchase order for the week. Groups items by optimal store. User reviews, edits, confirms. Includes estimated cost and savings vs. default shopping. See Purchase Engine tab.", isNew:true },
      { f:"Shopping List Estimator", d:"Type or upload a shopping list. AI estimates cost per item using your price history + current market data. Shows total estimate per store. Recommends optimal store split.", isNew:false },
      { f:"Smart List Optimization", d:"Given a shopping list, AI suggests which store to buy each item from to minimize total cost. Accounts for travel effort with configurable store radius.", isNew:false },
      { f:"Custom Date Range Reports", d:"Pick any start and end date, or use smart presets (last 30 days, this quarter, a specific trip). Get a full pattern report: category breakdown, prior-period comparison, top merchants, price anomalies, day-of-week patterns, and pace projection. Save and name any range as a labelled period for quick recall.", isNew:true },
      { f:"AI Spending Assistant", d:"Ask anything about your spending in plain English. 'How much did the Italy trip cost all in?', 'Which subscriptions haven't I used in 3 months?', 'What's my personal inflation rate?' Claude answers using your actual data — with charts, tables, and proactive insights. Pro and Family tier only.", isNew:true },
      { f:"Historical Data Import", d:"Upload your Amazon order history CSV for instant import. Bulk-scan your camera roll — select hundreds of old receipt photos for background processing. Connect Google Drive or Dropbox to scan saved receipt PDFs. Link bank/credit card via Plaid to pull 12–24 months of transaction history.", isNew:true },
      { f:"Budget Alerts", d:"Set monthly budgets per category. Real-time alerts when approaching or exceeding limits (push, email, SMS).", isNew:false },
      { f:"Predictive Spend", d:"Based on purchase patterns, forecast next month's spending per category. Highlight unusual spikes.", isNew:false },
      { f:"Goals & Streaks", d:"Set savings and spending goals with live progress tracking. Budget streaks reward consecutive weeks under target. Scan streaks reward consistent receipt capture.", isNew:true },
    ]
  },
  {
    phase:"Phase 4 — Auto-Ingestion & Scale",color:"#ec4899",icon:"🚀",
    items:[
      { f:"Auto-Ingestion — Email OAuth", d:"Connect Gmail or Outlook once. ReceiptIQ watches your inbox for receipts from 20+ retailers and ingests them automatically. Uses read-only access on emails from known receipt domains only — not full inbox. Covers Amazon, Walmart, Target, Costco, Best Buy, DoorDash, Instacart, Uber Eats, Apple, and more. See Auto-Ingestion tab.", isNew:true },
      { f:"Auto-Ingestion — Forward-to-Email", d:"Every user gets a unique address (e.g. alex-7x3k@receipts.receiptiq.app). Forward any receipt email to it — no OAuth, no inbox access required. Works with any email client, any retailer, internationally.", isNew:true },
      { f:"Auto-Ingestion — Browser Extension", d:"Chrome/Safari extension pulls full order history from Amazon, Costco, Walmart.com, and Target.com on demand. Also intercepts order confirmation pages in real time. Pending ToS legal review before Phase 4B ship.", isNew:true },
      { f:"Bills & Checks Auto-Ingestion", d:"Automatically capture utility bills, restaurant checks, subscription invoices, travel receipts, and more from email. Phase 4B covers dining, subscriptions, travel, parking. Phase 4C adds utilities, phone, rent. Phase 5 adds medical and insurance (amount + provider only — no diagnosis codes).", isNew:true },
      { f:"Instant Ingestion Approval", d:"Push notification fires within 30–60 seconds of ingestion. Tap Keep or Dismiss inline — no app open needed. Smart throttling: max 3 push/day, grouping window for same-day bills, quiet hours, amount threshold (default $20). Auto-ingests after 24hrs if no action (silence = keep). Weekly Digest as safety-net audit trail.", isNew:true },
      { f:"Direct Purchase Integration (Partner APIs)", d:"Send confirmed purchase orders directly to Instacart, Walmart+, or Kroger via official partner APIs. OAuth account linking — ReceiptIQ never touches payment info. Pilot in 3 metro markets. See Purchase Engine tab for full feasibility and risk analysis.", isNew:true },
      { f:"Household / Family Mode", d:"Shared account for household. Multiple members upload receipts. Unified analytics. Split-contribution view. Medical data excluded from shared view by default.", isNew:false },
      { f:"Export & Integrations", d:"Export to CSV, PDF, Excel. Connect to Mint, YNAB, QuickBooks. Tax report generation for FSA/HSA medicine purchases.", isNew:false },
      { f:"Barcode Scanner", d:"Scan product barcode to instantly look up current prices across vendors without a receipt.", isNew:false },
      { f:"Subscription Detection", d:"Identify recurring charges (streaming, memberships) from receipts and email bills. Track total subscription spend and flag unused services.", isNew:false },
    ]
  },
  {
    phase:"Phase 5 — Global & Personalisation",color:"#8b5cf6",icon:"🌐",
    items:[
      { f:"Item Watchlist", d:"Stocks-style home screen list of your top 20 most purchased items. Each row shows: item name, last price paid, store, trend arrow, % change vs. prior purchase. Tap any item to see full price history, vendor comparison, and personal inflation %. Drag to reorder, search to add any item.", isNew:true },
      { f:"Live Home Screen Ticker", d:"Scrolling marquee strip showing upcoming bills, weekly spend per category, price alerts, and budget status. Tap any ticker item to jump to that detail screen. Speed and items configurable. User-controlled toggle.", isNew:true },
      { f:"Home Screen Preferences", d:"Users fully control their home screen: toggle Item Watchlist, Live Ticker, Quick Stats, AI Insights card, Upcoming Bills card, and Recent Receipts on/off independently. Drag to reorder all sections. Default: minimal view.", isNew:true },
      { f:"Medical Bill & Insurance Ingestion", d:"Capture medical bills and insurance EOBs — amount + provider only, never diagnosis codes. Flagged with sensitivity: 'medical', excluded from household shared view. Phase 5 only, after privacy infrastructure established.", isNew:true },
      { f:"International Expansion", d:"Multi-currency (USD, GBP, EUR, INR, JPY and more). 8 languages roadmapped. GDPR, CCPA, LGPD, India DPDP compliant. Data residency per region. Local payment methods: UPI, PIX, SEPA, iDEAL, Konbini.", isNew:true },
      { f:"Direct Retailer API Partnerships", d:"Formal API partnerships with Costco, Kroger, Albertsons, Safeway. Pull full purchase history via official channels — richest data (barcodes, nutritional info), no ToS concerns. Phase 5 BD track, 6–18 month sales cycle.", isNew:true },
    ]
  },
];

const ANALYTICS = [
  {
    cat:"Spending Overview",color:"#10b981",icon:"📊",
    reports:[
      "Monthly Total Spend — total expenditure by month with trend line and % MoM change",
      "Weekly Spend Pattern — average spend per day of week; identify high-spend days",
      "Category Spend Breakdown — pie + bar chart of spend across Groceries, Electronics, Medicine, etc.",
      "Annual Summary Report — full year view with category heatmap and 12-month trend",
      "Spend vs. Budget Tracker — actual vs. target per category per month",
      "Average Transaction Size — mean receipt total per store with outlier flagging",
    ]
  },
  {
    cat:"Price Intelligence",color:"#6366f1",icon:"💰",
    reports:[
      "Item Price History — purchase price over time for any item, with trend line and stats",
      "Personal Inflation Report — % price increase for your recurring items vs. CPI benchmark",
      "Vendor Price Matrix — side-by-side current price comparison for top 20 items across stores",
      "Best Store by Category — which store gives best price per category",
      "Price Anomaly Alerts — items that spiked >10% vs. your historical average",
      "Price Opportunity Map — items where you overpaid vs. cheapest available vendor",
    ]
  },
  {
    cat:"Purchasing Behavior",color:"#f59e0b",icon:"🔄",
    reports:[
      "Purchase Frequency Report — how often you buy each item; flag items bought more than needed",
      "Store Visit Analysis — frequency, average spend, category mix per store",
      "Basket Composition Report — what categories you typically combine in one trip",
      "Seasonal Spend Patterns — month-by-month category spend across years",
      "Brand Preference Tracker — store-brand vs. name-brand spend ratio per category",
      "Impulse Buy Detector — single-quantity items not on prior shopping patterns",
    ]
  },
  {
    cat:"Shopping Patterns ★",color:"#8b5cf6",icon:"🧠",
    reports:[
      "Restock Cycle Report — estimated restock date per recurring item based on consumption rate",
      "Basket Evolution — how your weekly basket composition has changed over 6/12 months",
      "Predictive Shopping List — AI-generated suggested list for next 7 days based on patterns",
      "Pattern Anomaly Detection — items missing from your usual basket (possible stockout or substitution)",
      "Cross-Store Pattern Analysis — items you split across stores and whether consolidation saves money",
      "Price-Timing Optimization — which day/time of month yields best prices per store per category",
    ]
  },
  {
    cat:"Bills & Recurring ★",color:"#06b6d4",icon:"📋",
    reports:[
      "Monthly Bills Overview — total recurring obligations vs. discretionary spend",
      "Utility Spend Trend — electric, gas, water month-over-month with seasonal overlay",
      "Subscription Audit — all active subscriptions, monthly cost, last used date, annual total",
      "Dining Out vs. Groceries — restaurant spend vs. grocery spend over time",
      "Insurance Cost Tracker — all premiums across policies, annual total, renewal dates",
      "True Monthly Obligations — fixed bills as % of income",
      "Travel Spend Summary — flights, hotels, car rentals aggregated per trip",
      "Bill Due Date Calendar — upcoming bills based on historical patterns with estimated amounts",
    ]
  },
  {
    cat:"Health & Wellness",color:"#ec4899",icon:"🏥",
    reports:[
      "Medicine & Healthcare Spend — total medical spend per month with per-item breakdown",
      "Personal Care Spend Trend — monthly spend on personal care items with product detail",
      "Nutritional Budget Analysis — estimated spend on fresh produce vs. processed food",
      "FSA / HSA Eligible Spend — auto-flag medicine receipts for tax reimbursement tracking",
    ]
  },
  {
    cat:"Savings & Optimization",color:"#f97316",icon:"💡",
    reports:[
      "Savings Opportunities Report — if you bought each item from cheapest vendor, total savings",
      "Duplicate Purchase Detector — same item bought within short window (possible pantry excess)",
      "Bulk Buy ROI — items where buying in bulk at Costco/warehouse club saves vs. regular buys",
      "Store-Switch Savings — estimated monthly savings if you switched primary store for top items",
      "Coupon + Deal Gap Analysis — items frequently purchased that have recurring deals you missed",
    ]
  },
  {
    cat:"Forecasting & Planning",color:"#06b6d4",icon:"🔮",
    reports:[
      "Next Month Spend Forecast — ML-based prediction per category using 90-day rolling history",
      "Custom Date Range Report — on-demand pattern report for any date window with prior-period comparison",
      "Annual Expense Projection — extrapolate current patterns to full-year estimate",
      "Category Budget Recommendation — AI-suggested monthly budget per category based on patterns",
      "Subscription & Recurring Cost Summary — identified recurring charges and their annual impact",
      "Shopping List Cost Estimate — predicted total for any planned shopping list",
    ]
  },
];

const TECH_STACK = [
  {
    layer:"Frontend Web", icon:"🖥️", color:"#6366f1",
    items:["React 18 + TypeScript","Next.js 14 (App Router)","TailwindCSS + shadcn/ui","Recharts / D3.js for analytics","React Query for server state","PWA manifest for offline support"]
  },
  {
    layer:"Mobile App", icon:"📱", color:"#10b981",
    items:["React Native + Expo","Shared business logic with web","Native camera / OCR trigger","Push notifications (Expo + APNs + FCM)","Offline-first with SQLite sync","App Store + Google Play"]
  },
  {
    layer:"Backend API", icon:"⚙️", color:"#f59e0b",
    items:["Node.js + Express / Fastify","REST API + WebSockets","JWT authentication + refresh tokens","Rate limiting + input validation","OpenAPI / Swagger docs","Stripe for subscription billing + Stripe Tax"]
  },
  {
    layer:"AI / Intelligence", icon:"🧠", color:"#ec4899",
    items:["Claude Sonnet (Vision OCR, JSON extraction, vendor comparison)","Claude for email parsing fallback (low-confidence receipts)","Claude for shopping pattern analysis + purchase order generation","Claude AI Spending Assistant (context injection + Text-to-SQL)","Vector embeddings for item name fuzzy matching (Pinecone)","LangChain for chained analysis workflows"]
  },
  {
    layer:"Data Storage", icon:"🗄️", color:"#06b6d4",
    items:["PostgreSQL + Row-Level Security (primary — all user data)","Redis (sessions, cache, rate limiting, job queues)","S3-compatible storage (receipt images + CloudFront CDN)","Pinecone (vector embeddings for item matching)","TimescaleDB extension for time-series price data","Plaid for bank/card sync + Plaid transaction history"]
  },
  {
    layer:"Infrastructure", icon:"☁️", color:"#f97316",
    items:["AWS ECS Fargate (API containers, auto-scaling)","AWS Lambda (OCR jobs, email parsing, 24hr auto-ingest timers)","AWS SNS → APNs + FCM (push notifications, <60s delivery)","AWS SQS (background job queues, dead-letter queues)","AWS SES + SendGrid Inbound Parse (forward-to-email ingestion)","GitHub Actions CI/CD + Sentry + Datadog APM"]
  },
];

const DATA_SCHEMA = [
  { table:"users", color:"#6366f1", fields:[
    "id (uuid, PK)","email (unique, indexed)","password_hash","display_name",
    "created_at","subscription_tier","org_id (FK → organisations, nullable)",
    "role ('owner'|'admin'|'member')","locale","preferred_currency","data_region"
  ]},
  { table:"receipts", color:"#10b981", fields:[
    "id (uuid, PK)","user_id (FK → users)","store_name","store_chain","receipt_date",
    "total_amount","currency","amount_usd","image_url (S3 key)","raw_ocr_text",
    "content_hash (SHA-256 of store+date+total) ★","phash (perceptual image hash) ★",
    "duplicate_of (FK → receipts, nullable) ★",
    "ingestion_source_id (FK, nullable)","auto_ingested (boolean)","needs_review (boolean)","created_at"
  ]},
  { table:"receipt_items", color:"#f59e0b", fields:[
    "id (uuid, PK)","receipt_id (FK → receipts)","user_id (FK, denormalized)",
    "item_name","item_name_normalized","quantity","unit","unit_price","line_total",
    "category","brand (nullable)","barcode (nullable)",
    "item_type ('product'|'service'|'bill_line'|'fee'|'tax') ★",
    "sensitivity ('standard'|'medical'|'financial') ★","created_at"
  ]},
  { table:"price_history", color:"#ec4899", fields:[
    "id (uuid, PK)","item_name_normalized","store_chain","unit_price","unit",
    "captured_at","source ('receipt'|'vendor_api'|'ai_estimate')","user_id (nullable)"
  ]},
  { table:"shopping_patterns ★", color:"#8b5cf6", fields:[
    "id (uuid, PK)","user_id (FK → users)","item_name_normalized",
    "avg_restock_days","last_purchased_at","next_predicted_at",
    "avg_unit_price","preferred_store","confidence_score","updated_at"
  ]},
  { table:"purchase_orders ★", color:"#06b6d4", fields:[
    "id (uuid, PK)","user_id (FK → users)",
    "status ('draft'|'confirmed'|'placed'|'delivered')",
    "source ('ai_suggested'|'manual')","items (jsonb array)",
    "estimated_total","actual_total (nullable)","store_chain",
    "external_order_id (nullable)","placed_at (nullable)","created_at"
  ]},
  { table:"ingestion_sources ★", color:"#10b981", fields:[
    "id (uuid, PK)","user_id (FK → users)",
    "source_type ('gmail'|'outlook'|'forward'|'extension'|'retailer_api')",
    "retailer_domain (nullable)","oauth_access_token (encrypted)",
    "oauth_refresh_token (encrypted)","connected_at","last_synced_at",
    "status ('active'|'paused'|'revoked')"
  ]},
  { table:"recurring_patterns ★", color:"#f97316", fields:[
    "id (uuid, PK)","user_id (FK → users)","source_name","category",
    "average_amount","frequency ('weekly'|'monthly'|'quarterly'|'annual')",
    "last_seen_at","auto_keep (boolean)","ingestion_source_id (FK, nullable)"
  ]},
  { table:"review_inbox ★", color:"#ec4899", fields:[
    "id (uuid, PK)","user_id (FK → users)","receipt_id (FK → receipts)",
    "captured_at","review_status ('pending'|'kept'|'dismissed')",
    "reviewed_at (nullable)","week_batch (date)","auto_kept (boolean)"
  ]},
  { table:"device_tokens ★", color:"#6366f1", fields:[
    "id (uuid, PK)","user_id (FK → users)","token (APNs or FCM)",
    "platform ('ios'|'android')","registered_at","last_active_at"
  ]},
  { table:"ai_chat_sessions ★", color:"#8b5cf6", fields:[
    "id (uuid, PK)","user_id (FK → users)","started_at",
    "last_message_at","message_count (int)","session_summary (text, nullable)"
  ]},
  { table:"spending_periods ★", color:"#06b6d4", fields:[
    "id (uuid, PK)","user_id (FK → users)","name","start_date","end_date",
    "created_at","color (hex, nullable)","auto_suggested (boolean)"
  ]},
];

const ROADMAP = [
  { q:"Q1 2025", title:"Foundation", color:"#6366f1", items:[
    "User auth (email + OAuth)","Receipt upload + Claude OCR",
    "Duplicate receipt detection (pHash + content hash) ★",
    "Row-Level Security on all DB tables",
    "Line-item storage schema","Basic dashboard + category charts",
    "React Native app skeleton","Core REST API"
  ]},
  { q:"Q2 2025", title:"Intelligence", color:"#10b981", items:[
    "Item price history charts","Vendor price comparison (AI)",
    "Shopping pattern analysis engine ★","Net worth tracking (Plaid) ★",
    "Store analytics deep-dive","Inflation tracker","Mobile app feature parity"
  ]},
  { q:"Q3 2025", title:"Smart Shopping + AI", color:"#f59e0b", items:[
    "AI purchase order builder ★","Shopping list estimator",
    "Custom date range reports ★","AI Spending Assistant (Pro only) ★",
    "Historical data import (Amazon CSV, bulk scan, Plaid) ★",
    "Goals & streaks ★","Budget alerts","Barcode scanner","Household mode"
  ]},
  { q:"Q4 2025", title:"Auto-Ingestion", color:"#ec4899", items:[
    "Gmail + Outlook OAuth ingestion ★","Forward-to-email ★",
    "Top 20 retailer email parsers ★",
    "Bills ingestion (dining, subscriptions, travel) ★",
    "Instant push notifications + Keep/Dismiss ★",
    "Weekly Digest safety net ★","Inbox history backfill (opt-in) ★",
    "Direct purchase pilot — Instacart API ★"
  ]},
  { q:"Q1 2026", title:"Full Life Spend", color:"#8b5cf6", items:[
    "Browser extension (Chrome + Safari) ★",
    "Bills ingestion: utilities, phone, rent, car ★",
    "Medical bill ingestion (amount + provider only) ★",
    "CSV / PDF export + Mint / YNAB integration",
    "FSA/HSA tax report","Subscription detection",
    "EU expansion (GDPR, EUR, eu-west-1 region) ★"
  ]},
  { q:"Q2 2026", title:"Personalisation", color:"#06b6d4", items:[
    "Item Watchlist (Stocks-style) ★","Live Home Screen Ticker ★",
    "Home Screen Preferences (drag + toggle) ★",
    "Direct retailer API BD track (Costco, Kroger) ★",
    "India expansion (INR, UPI, ap-south-1 region) ★",
    "Loyalty card tracker","Public API for partners"
  ]},
];

const DUPLICATE_METHODS = [
  { title:"Image perceptual hash (pHash)", confidence:"HIGH", tag:"Receipt images", desc:"Compute a visual fingerprint of the receipt photo at upload time. Two receipts with pHash Hamming distance < 10 are flagged as visual duplicates. Handles rotation, brightness variation, and cropping. Runs in <50ms per image.", impl:"blockhash-js or sharp (Node.js) server-side. Store 64-bit hash in receipts table. Compare with Hamming distance threshold." },
  { title:"Content fingerprint hash", confidence:"HIGH", tag:"Structured data", desc:"SHA-256 of (user_id + store_chain_normalized + receipt_date + total_amount_cents). Exact match = certain duplicate. Works even when users upload different photos of the same receipt.", impl:"Computed in API layer before DB insert. Indexed for O(1) lookup. Triggers duplicate review flow if match found." },
  { title:"Fuzzy content matching", confidence:"MEDIUM", tag:"Near-duplicates", desc:"When total amounts differ by < $0.05 (rounding variance) and store + date match, flag as probable duplicate. Handles cashier-rounding and partial receipt captures.", impl:"Secondary query after content hash check. Configurable tolerance window." },
  { title:"Item-level deduplication", confidence:"MEDIUM", tag:"Line items", desc:"Even if receipts are distinct (two trips same day, same store), detect if individual line items are double-entered manually. Fuzzy item name match + same date + same price = flag.", impl:"Runs as background job post-OCR. Flags items, not entire receipts. User can dismiss per-item." },
  { title:"Split receipt detection", confidence:"LOW", tag:"Edge case", desc:"Two receipts from same store on same day that together total a round number may be one transaction split across payment methods. Surfaced as a soft suggestion, not a hard flag.", impl:"Heuristic check, not a hard block. ML model can improve accuracy over time." },
];

const DUPLICATE_EDGE_CASES = [
  { title:"Same store, two trips, same day", detail:"Do NOT merge automatically. Total amounts will differ or item mix will differ. Only flag if both hash AND amounts match exactly." },
  { title:"Partial receipt upload", detail:"User uploads a cropped photo missing the bottom. Later uploads the full receipt. Item-level cross-check catches overlapping line items." },
  { title:"Household shared receipt", detail:"Two users in the same household upload the same receipt. Per-user hash isolation means this won't trigger — each user holds their own receipt copy." },
  { title:"Amended receipt", detail:"Store re-issues a corrected receipt with a revised total. Content hash will differ; user is prompted to review and replace rather than discard." },
];

const PURCHASE_PATTERN_FEATURES = [
  { icon:"🔄", title:"Restock prediction", desc:"Analyze the gap between every purchase of each item. Build a rolling average restock cycle per item per user. Surface alerts like '5 days until your next milk run.'" },
  { icon:"🧺", title:"Basket intelligence", desc:"Identify which items you consistently buy together. Cluster purchases into trip types (quick top-up vs. full weekly shop). Use trip type to intelligently suggest related items." },
  { icon:"⏱️", title:"Price-timing optimization", desc:"Track which day of week and time of month you get the best prices at each store. Recommend optimal shopping windows per category." },
  { icon:"📉", title:"Consumption rate modeling", desc:"For household staples, infer consumption rate from purchase history. Forecast stockouts and auto-add items to upcoming purchase orders." },
  { icon:"🌿", title:"Seasonal adaptation", desc:"Adjust predictions for seasonal items (sunscreen, allergy meds). Recognize year-over-year patterns even for items bought only quarterly." },
  { icon:"🤖", title:"AI purchase order generation", desc:"Combine restock predictions + current local prices + user budget → generate a ranked, cost-optimized suggested order for the week. User reviews, edits, and confirms or places directly." },
];

const PURCHASE_APIS = [
  { name:"Instacart Connect", verdict:"✅ Best option", color:"#10b981", detail:"Covers 1,400+ retailers via one integration. Broadest reach. Start here." },
  { name:"Walmart+", verdict:"⚠️ Invite-only", color:"#f59e0b", detail:"Partner API exists but restricted. Apply early in partnership outreach." },
  { name:"Kroger API", verdict:"✅ Feasible", color:"#10b981", detail:"Public developer API with cart + order capabilities. Covers Kroger, Fred Meyer, Ralphs." },
  { name:"Amazon Fresh", verdict:"❌ No public API", color:"#ef4444", detail:"No public ordering API. Workarounds are fragile and against ToS." },
  { name:"DoorDash Drive", verdict:"✅ Feasible", color:"#10b981", detail:"Dispatch API useful for local/independent store delivery." },
  { name:"Local stores", verdict:"❌ Not feasible", color:"#ef4444", detail:"No API. Deep-link to their website is the best fallback." },
];

const PURCHASE_RISKS = [
  { title:"API availability and store coverage", level:"HIGH", desc:"Only a handful of retailers have developer APIs. Most local/regional chains have no API. Rural users and specialty store customers would be excluded.", mitigation:"Position as premium feature for major chain users. Partner with Instacart first (broadest coverage). Display store compatibility clearly before setup." },
  { title:"Price discrepancy liability", level:"HIGH", desc:"ReceiptIQ shows an estimated price; the retailer charges the actual shelf price at order time. These can differ by 5–30% due to sales ending, substitutions, and weight-based items.", mitigation:"Always show prices as estimates with a clear disclaimer. Build a post-delivery reconciliation flow that auto-scans the delivery receipt and updates actual spend." },
  { title:"PCI-DSS compliance", level:"HIGH", desc:"If ReceiptIQ ever handles payment cards, it must be PCI-DSS compliant — significant audit, infrastructure, and legal cost.", mitigation:"Never handle payments directly. Use OAuth-based retailer account linking. ReceiptIQ places the order; it never touches the card." },
  { title:"Item substitution handling", level:"MEDIUM", desc:"Retailers frequently substitute out-of-stock items without clear user notification.", mitigation:"Expose retailer substitution preferences in the UI. Push notification when substitution occurs. Auto-flag substituted items so they don't skew price history." },
  { title:"Order failure and cancellation", level:"MEDIUM", desc:"Orders can fail due to slot unavailability, payment issues, or retailer outages.", mitigation:"Implement webhook listener for order status updates. Clear error states with one-tap retry. Separate 'order placed' from 'order confirmed' in the UI." },
  { title:"Retailer ToS changes", level:"MEDIUM", desc:"APIs can be deprecated or revoked. Over-reliance on one API creates a single point of failure.", mitigation:"Abstract the purchase layer behind a unified interface. Maintain Instacart + Kroger redundancy as minimum viable coverage." },
  { title:"Delivery fees eroding savings", level:"LOW", desc:"Delivery fees ($7–15) quickly erase the savings ReceiptIQ's optimization finds.", mitigation:"Show net savings after delivery fees prominently. Recommend in-store pickup over delivery when fees aren't justified by order size." },
  { title:"Regulatory complexity", level:"LOW", desc:"Some states have laws around grocery delivery, sales tax on prepared foods, and electronic ordering.", mitigation:"Consult legal before each state launch. Pilot in 3 metro markets first. Delegate all tax calculation to the retailer." },
];

const INGESTION_CHANNELS = [
  { channel:"Email OAuth (Gmail + Outlook)", priority:"Phase 4A — Ship First", effort:"Medium", coverage:"~80% of use cases", desc:"User connects Gmail or Outlook via OAuth2. ReceiptIQ watches for emails from known retailer domains. Fully automatic after setup. Works retroactively on inbox history (opt-in). Uses official OAuth APIs — no scraping.", risks:"Requires email access permission (read-only to receipt domains). Retailer email formats change 2–4x/year." },
  { channel:"Forward-to-Email", priority:"Phase 4A — Ship Alongside", effort:"Low", coverage:"Any retailer, any client", desc:"Every user gets a unique forwarding address (e.g. alex-7x3k@receipts.receiptiq.app). Forward any receipt email — no OAuth, no inbox access required. Simple inbound email infrastructure via SendGrid.", risks:"Manual forward step required per receipt. Users may forget to forward." },
  { channel:"Browser Extension (Chrome + Safari)", priority:"Phase 4B — After Email", effort:"High", coverage:"Amazon, Costco, Walmart, Target", desc:"Lightweight extension detects retailer order history pages and offers one-click import. Also intercepts order confirmation pages in real time. Richer data than email (item images, ASINs).", risks:"Requires extension install. Against some retailers' ToS — legal review needed before shipping. Page structure changes break the scraper." },
  { channel:"Direct Retailer API", priority:"Phase 5 BD Track", effort:"Very High", coverage:"Costco, Kroger, Albertsons", desc:"Formal API partnerships. User connects loyalty account and ReceiptIQ pulls purchase data via official APIs. Most reliable — official channel, richest data, no ToS concerns. Can back-fill years of history.", risks:"Requires retailer BD deals — long sales cycles (6–18 months). Most major retailers have no public API." },
];

const INGESTION_PARSERS = [
  { retailer:"Amazon", domain:"amazon.com", confidence:"97%", fields:"Order ID, items, qty, price, delivery date", status:"Ready" },
  { retailer:"Apple", domain:"apple.com", confidence:"98%", fields:"App/item, price, Apple ID", status:"Ready" },
  { retailer:"Uber Eats", domain:"uber.com", confidence:"95%", fields:"Restaurant, items, promo", status:"Ready" },
  { retailer:"DoorDash", domain:"doordash.com", confidence:"96%", fields:"Restaurant, items, fees, tip", status:"Ready" },
  { retailer:"Target", domain:"target.com", confidence:"94%", fields:"Items, RedCard savings, store", status:"Ready" },
  { retailer:"Instacart", domain:"instacart.com", confidence:"94%", fields:"Store, items, delivery fee", status:"Ready" },
  { retailer:"Walmart", domain:"walmart.com", confidence:"93%", fields:"Items, totals, store/online flag", status:"Ready" },
  { retailer:"Costco", domain:"costco.com", confidence:"91%", fields:"Items, membership#, warehouse", status:"Ready" },
  { retailer:"Best Buy", domain:"bestbuy.com", confidence:"89%", fields:"Items, SKU, warranty info", status:"Ready" },
  { retailer:"Whole Foods", domain:"wholefoodsmarket.com", confidence:"88%", fields:"Items, Prime savings", status:"Ready" },
  { retailer:"Walgreens", domain:"walgreens.com", confidence:"85%", fields:"Items, rewards balance", status:"Ready" },
  { retailer:"CVS", domain:"cvs.com", confidence:"83%", fields:"Items, ExtraBucks", status:"Ready" },
  { retailer:"Home Depot", domain:"homedepot.com", confidence:"87%", fields:"Items, SKU, Pro account", status:"Planned" },
  { retailer:"IKEA", domain:"ikea.com", confidence:"82%", fields:"Items, article number", status:"Planned" },
];

// ──────────────────────────────────────────────────
export default function ProductPlan() {
  const [active, setActive] = useState("Overview");
  const [expandedFeature, setExpandedFeature] = useState(null);

  const card = (extra="") => ({
    background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden", ...Object.fromEntries(extra.split(";").filter(Boolean).map(s => { const [k,v]=s.trim().split(":"); return [k.trim(), v?.trim()]; }))
  });

  const renderOverview = () => (
    <div>
      <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", borderRadius:16, padding:"40px 48px", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{ fontSize:36 }}>🧾</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"#fff", letterSpacing:"-0.02em", margin:0 }}>ReceiptIQ</h2>
              <p style={{ color:"#818cf8", fontSize:14, margin:0, fontWeight:500 }}>Product Plan · Version 3.0</p>
            </div>
          </div>
          <p style={{ color:"#c7d2fe", fontSize:16, lineHeight:1.7, maxWidth:620, marginBottom:24 }}>
            An AI-powered, multi-category expense tracker that turns receipts, bills, and checks into deep financial intelligence — with automatic ingestion from 20+ retailers, item-level price history, shopping pattern AI, purchase order generation, duplicate detection, and an AI spending assistant.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
            {[["5 Phases","Product Roadmap"],["45+","Analytics Reports"],["6 Layers","Tech Architecture"],["8 Competitors","Market Analysis"],["3 New","Core Systems"]].map(([v,l])=>(
              <div key={l} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#a5b4fc" }}>{v}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>The Market Gap</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:32 }}>
        {GAP.map((g,i)=>(
          <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", background:"#f0fdf4", borderRadius:10, padding:"11px 16px", border:"1px solid #bbf7d0" }}>
            <span style={{ color:"#10b981", fontWeight:700, fontSize:15, marginTop:1, flexShrink:0 }}>✓</span>
            <span style={{ color:"#14532d", fontSize:13, lineHeight:1.6 }}>{g}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Core User Journeys</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {[
          ["📷 Upload Receipt","Snap a photo → duplicate check → AI extracts every line item → stored with category, price, store, date"],
          ["⚡ Auto-Ingestion","Connect Gmail → receipts from Amazon, Walmart, Costco, and 20+ retailers flow in automatically — no scanning needed"],
          ["🧠 Pattern Orders","App learns your shopping rhythms → builds weekly purchase order → optimized by store and price"],
          ["🤖 Ask Anything","Type any spending question in plain English → Claude answers using your actual data with charts and insights"],
          ["📈 Price Intelligence","Click any item → see price history → AI fetches current vendor prices → shows savings opportunity"],
          ["📊 Analytics","45+ reports across spending, inflation, bills, behavior, savings, patterns, and forecasting"],
        ].map(([t,d])=>(
          <div key={t} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{t.split(" ")[0]}</div>
            <div style={{ fontWeight:600, fontSize:14, color:"#0f172a", marginBottom:6 }}>{t.slice(2)}</div>
            <div style={{ fontSize:13, color:"#64748b", lineHeight:1.6 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarket = () => (
    <div>
      <div style={{ background:"#fef3c7", borderRadius:12, padding:"16px 20px", marginBottom:28, border:"1px solid #fde68a" }}>
        <p style={{ color:"#78350f", fontSize:14, margin:0, lineHeight:1.6 }}>
          <strong>Verdict:</strong> No existing app offers the full combination of multi-category receipt scanning + item-level price history + live vendor comparison + automatic ingestion from 20+ retailers + AI shopping list estimation + duplicate detection + pattern-driven purchase orders + conversational AI assistant. ReceiptIQ occupies a unique position.
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {COMPETITORS.map((c,i)=>(
          <div key={i} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 24px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#0f172a" }}>{c.name}</span>
                <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:c.badgeColor+"18", color:c.badgeColor }}>{c.badge}</span>
              </div>
              <span style={{ fontSize:13, color:"#64748b" }}>{c.rating}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, fontSize:13 }}>
              <div><div style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Focus</div><div style={{ color:"#334155" }}>{c.focus}</div></div>
              <div><div style={{ fontSize:11, fontWeight:600, color:"#10b981", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>✓ Strength</div><div style={{ color:"#334155" }}>{c.strength}</div></div>
              <div><div style={{ fontSize:11, fontWeight:600, color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>✗ Gap</div><div style={{ color:"#334155" }}>{c.gap}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {FEATURES.map((phase,pi)=>(
        <div key={pi} style={{ background:"#fff", border:`1px solid ${phase.color}30`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ background:`${phase.color}12`, padding:"14px 24px", borderBottom:`1px solid ${phase.color}20`, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>{phase.icon}</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:phase.color }}>{phase.phase}</span>
          </div>
          <div style={{ padding:"4px 0" }}>
            {phase.items.map((item,ii)=>(
              <div key={ii} onClick={()=>setExpandedFeature(expandedFeature===`${pi}-${ii}`?null:`${pi}-${ii}`)}
                style={{ padding:"14px 24px", borderBottom:ii<phase.items.length-1?"1px solid #f1f5f9":"none", cursor:"pointer", background: expandedFeature===`${pi}-${ii}` ? "#f8fafc" : "transparent" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:phase.color, flexShrink:0 }} />
                    <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{item.f}</span>
                    {item.isNew && <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, background:"#dbeafe", color:"#1e40af" }}>New</span>}
                  </div>
                  <span style={{ color:"#94a3b8", fontSize:16 }}>{expandedFeature===`${pi}-${ii}`?"−":"+"}</span>
                </div>
                {expandedFeature===`${pi}-${ii}` && (
                  <div style={{ marginTop:10, marginLeft:18, fontSize:13, color:"#475569", lineHeight:1.7, paddingLeft:10, borderLeft:`2px solid ${phase.color}40` }}>
                    {item.d}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <div style={{ background:"#f0f9ff", borderRadius:12, padding:"14px 20px", marginBottom:24, border:"1px solid #bae6fd" }}>
        <p style={{ color:"#0c4a6e", fontSize:14, margin:0 }}>45+ reports buildable from core data schema. Categories marked ★ require Phase 4 data. Reports marked ◆ require 3+ months of data.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {ANALYTICS.map((cat,ci)=>(
          <div key={ci} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", background:`${cat.color}0f`, borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
              <span>{cat.icon}</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:cat.color }}>{cat.cat}</span>
              <span style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8", fontWeight:500 }}>{cat.reports.length} reports</span>
            </div>
            <div style={{ padding:"8px 0" }}>
              {cat.reports.map((r,ri)=>(
                <div key={ri} style={{ padding:"8px 18px", fontSize:13, color:"#334155", lineHeight:1.5, borderBottom:ri<cat.reports.length-1?"1px solid #f8fafc":"none", display:"flex", gap:8 }}>
                  <span style={{ color:`${cat.color}`, fontWeight:700, flexShrink:0 }}>{ri+1}.</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
        {TECH_STACK.map((layer,li)=>(
          <div key={li} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", background:`${layer.color}0f`, borderBottom:"1px solid #f1f5f9", display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:18 }}>{layer.icon}</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:layer.color }}>{layer.layer}</span>
            </div>
            <div style={{ padding:"12px 18px" }}>
              {layer.items.map((item,ii)=>(
                <div key={ii} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"4px 0", fontSize:13, color:"#334155" }}>
                  <span style={{ color:layer.color, fontWeight:700, fontSize:11, marginTop:3, flexShrink:0 }}>▸</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>AI Processing Flow</h3>
      <div style={{ background:"#0f172a", borderRadius:12, padding:"24px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:6 }}>
          {[
            ["📷","Receipt Upload","Photo, email, or forward"],
            ["→",null,null],
            ["🔒","Dup Check","pHash + content hash"],
            ["→",null,null],
            ["🔍","Claude Vision","Extract all line items as JSON"],
            ["→",null,null],
            ["⚙️","Normalize","Fuzzy-match + categorize"],
            ["→",null,null],
            ["💾","Store","PostgreSQL + price_history"],
            ["→",null,null],
            ["🧠","Pattern ML","Update shopping_patterns"],
            ["→",null,null],
            ["🔔","Notify","Push within 30–60s"],
            ["→",null,null],
            ["📊","Analyze","Dashboard refresh"],
          ].map(([icon,title,desc],i)=>(
            title ? (
              <div key={i} style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 14px", minWidth:100, border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:16, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"#a5b4fc", marginBottom:3 }}>{title}</div>
                <div style={{ fontSize:11, color:"#475569", lineHeight:1.4 }}>{desc}</div>
              </div>
            ) : <div key={i} style={{ color:"#334155", fontSize:20, padding:"0 2px" }}>{icon}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataModel = () => (
    <div>
      <div style={{ background:"#f8fafc", borderRadius:12, padding:"14px 20px", marginBottom:24, border:"1px solid #e2e8f0" }}>
        <p style={{ color:"#475569", fontSize:14, margin:0 }}>Tables marked <strong>★</strong> are new in v3. The <code style={{ background:"#e2e8f0", padding:"2px 6px", borderRadius:4, fontSize:13 }}>receipts</code> table gains columns for duplicate detection and ingestion tracking. <code style={{ background:"#e2e8f0", padding:"2px 6px", borderRadius:4, fontSize:13 }}>receipt_items</code> gains sensitivity and item_type fields for bill line items.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {DATA_SCHEMA.map((t,ti)=>(
          <div key={ti} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"10px 18px", background:`${t.color}0f`, borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:8 }}>
              <code style={{ fontFamily:"'Courier New',monospace", fontSize:14, fontWeight:700, color:t.color }}>{t.table}</code>
            </div>
            <div style={{ padding:"10px 0" }}>
              {t.fields.map((f,fi)=>(
                <div key={fi} style={{ padding:"5px 18px", fontSize:12, fontFamily:"'Courier New',monospace", color:"#334155", borderBottom:fi<t.fields.length-1?"1px solid #f8fafc":"none" }}>
                  <span style={{ color: f.includes("PK")?"#10b981":f.includes("FK")?"#6366f1":f.includes("nullable")||f.includes("optional")?"#94a3b8":f.includes("★")?"#8b5cf6":"#334155" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoadmap = () => (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
        {ROADMAP.map((q,qi)=>(
          <div key={qi} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 20px", background:`${q.color}10`, borderBottom:`2px solid ${q.color}30`, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:q.color }}>{q.q}</span>
              <span style={{ fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>— {q.title}</span>
            </div>
            <div style={{ padding:"12px 0" }}>
              {q.items.map((item,ii)=>(
                <div key={ii} style={{ display:"flex", gap:10, padding:"6px 20px", fontSize:13, color:"#334155", alignItems:"flex-start" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:q.color, flexShrink:0, marginTop:5 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Success Metrics</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          ["Receipts Scanned","5,000 / month by Q2","Validates OCR quality + user habit"],
          ["Item Accuracy Rate","> 95% OCR precision","Ensures analytics are trustworthy"],
          ["Dup Detection Rate","> 99% recall","Prevents analytics corruption"],
          ["Weekly Active Users","> 40% of registered","Indicates genuine utility"],
          ["Email Connect Rate","> 30% within 30 days","Auto-ingestion adoption"],
          ["Auto-Ingest Share","> 60% of receipts","Core differentiator validation"],
          ["Parser Accuracy","> 92% confidence","Data quality baseline"],
          ["Push Opt-in Rate","> 70% of active users","Low opt-in kills notifications"],
          ["Purchase Orders Built","3+ per active user/mo","Purchase engine validation"],
        ].map(([m,t,d])=>(
          <div key={m} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{m}</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:4, fontFamily:"'Syne',sans-serif" }}>{t}</div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlatform = () => (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
        {[
          { title:"📱 Mobile App", sub:"iOS + Android via React Native + Expo", color:"#10b981",
            features:["Native camera for receipt scanning","Push notifications — Keep/Dismiss inline within 30–60s","Barcode scanner via device camera","Offline receipt queue (sync when online)","Home screen widgets: Quick Stats, Upcoming Bills, Watchlist","Face ID / Touch ID login","App Store + Google Play distribution"],
            tech:"React Native · Expo · SQLite · React Query · Expo Camera · APNs + FCM" },
          { title:"🖥️ Web Portal", sub:"Full-featured browser app", color:"#6366f1",
            features:["Drag-and-drop receipt upload (batch)","Full analytics dashboard with advanced charts","Custom date range report builder","AI Spending Assistant chat interface","Data export (CSV, PDF, Excel)","PWA installable on desktop","Admin panel for household managers"],
            tech:"Next.js 14 · React · TailwindCSS · Recharts · D3.js · PWA" },
        ].map((p,pi)=>(
          <div key={pi} style={{ background:"#fff", border:`1px solid ${p.color}30`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", background:`${p.color}08`, borderBottom:`1px solid ${p.color}20` }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#0f172a", marginBottom:4 }}>{p.title}</div>
              <div style={{ fontSize:13, color:"#64748b" }}>{p.sub}</div>
            </div>
            <div style={{ padding:"16px 24px" }}>
              {p.features.map((f,fi)=>(
                <div key={fi} style={{ display:"flex", gap:10, padding:"5px 0", fontSize:13, color:"#334155", alignItems:"flex-start" }}>
                  <span style={{ color:p.color, fontWeight:700, flexShrink:0 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
              <div style={{ marginTop:16, background:"#f8fafc", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#64748b", fontFamily:"monospace" }}>{p.tech}</div>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Shared Architecture</h3>
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"20px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            ["Shared Business Logic","TypeScript shared packages for validation, formatting, and API calls — used by both web and mobile"],
            ["Single API Backend","One Node.js API serves both platforms. Feature flags for platform-specific behaviour."],
            ["Real-time Sync","WebSockets push receipt processing updates and budget alerts to both platforms simultaneously"],
            ["Unified Auth","JWT tokens work across web and mobile. Refresh token rotation. OAuth (Google, Apple) on both."],
            ["Design System","Shared design tokens and component library. Consistent UX across web (shadcn) and mobile."],
            ["CI/CD Pipeline","GitHub Actions deploys web to Vercel and mobile via Expo EAS Build + OTA updates simultaneously."],
          ].map(([t,d])=>(
            <div key={t}>
              <div style={{ fontWeight:600, fontSize:13, color:"#0f172a", marginBottom:5 }}>{t}</div>
              <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAutoIngestion = () => (
    <div>
      <div style={{ background:"#eff6ff", borderRadius:12, padding:"16px 20px", marginBottom:24, border:"1px solid #bfdbfe" }}>
        <p style={{ color:"#1e40af", fontSize:14, margin:0, lineHeight:1.6 }}>
          <strong>Version bump: v2.0.</strong> Auto-ingestion is the core differentiator — it removes the need for manual scanning entirely. Ship Gmail OAuth + forward-to-email in Phase 4A (covers 80% of use cases). Hold browser extension until Phase 4B pending ToS legal review.
        </p>
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Ingestion Channels</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:32 }}>
        {INGESTION_CHANNELS.map((ch,ci)=>(
          <div key={ci} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 24px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"#0f172a" }}>{ch.channel}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:"#eff6ff", color:"#1e40af" }}>{ch.priority}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:"#f0fdf4", color:"#166534" }}>{ch.coverage}</span>
            </div>
            <p style={{ fontSize:13, color:"#475569", lineHeight:1.7, marginBottom:8 }}>{ch.desc}</p>
            <div style={{ background:"#fff7ed", borderRadius:8, padding:"8px 12px", border:"1px solid #fed7aa" }}>
              <span style={{ fontSize:11, color:"#9a3412", fontWeight:600 }}>Risks: </span>
              <span style={{ fontSize:12, color:"#7c2d12" }}>{ch.risks}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Email Parser Coverage</h3>
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden", marginBottom:24 }}>
        <div style={{ padding:"12px 18px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:8, fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em" }}>
          {["Retailer","Domain","Confidence","Fields Extracted","Status"].map(h=><span key={h}>{h}</span>)}
        </div>
        {INGESTION_PARSERS.map((p,pi)=>(
          <div key={pi} style={{ padding:"10px 18px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:8, fontSize:13, color:"#334155", borderBottom:pi<INGESTION_PARSERS.length-1?"1px solid #f8fafc":"none", alignItems:"center" }}>
            <span style={{ fontWeight:600 }}>{p.retailer}</span>
            <span style={{ color:"#64748b", fontSize:12 }}>{p.domain}</span>
            <span style={{ color: parseFloat(p.confidence)>=90?"#10b981":"#f59e0b", fontWeight:600 }}>{p.confidence}</span>
            <span style={{ color:"#64748b", fontSize:12 }}>{p.fields}</span>
            <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, background: p.status==="Ready"?"#f0fdf4":"#fef3c7", color: p.status==="Ready"?"#166534":"#92400e", display:"inline-block" }}>{p.status}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Privacy Model</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[
          ["🔐 Minimal Scope OAuth","Read-only access on emails from known receipt domains only — not full inbox. Uses Gmail's label filter scope."],
          ["🗑️ Email Content Not Stored","Raw email HTML parsed in-memory and immediately discarded. Only extracted line-item data is stored."],
          ["🔄 Revoke Anytime","One-tap disconnect from Settings. Stops ingestion immediately and optionally deletes all auto-ingested receipts."],
          ["🏷️ Transparent Sourcing","Every auto-ingested receipt shows its source (📧 Gmail, 📨 Forwarded, 🧩 Extension)."],
          ["🌍 GDPR / CCPA Compliant","Tokens stored encrypted at rest. Full data export and deletion on request. DPA available for EU users."],
          ["👁️ Audit Log","Users can see every email parsed, when, and what was extracted — full transparency."],
        ].map(([t,d])=>(
          <div key={t} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontWeight:600, fontSize:13, color:"#0f172a", marginBottom:5 }}>{t}</div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDuplicates = () => (
    <div>
      <div style={{ background:"#f0fdf4", borderRadius:12, padding:"14px 20px", marginBottom:24, border:"1px solid #bbf7d0" }}>
        <p style={{ color:"#14532d", fontSize:14, margin:0, lineHeight:1.6 }}>
          <strong>Priority: Phase 1.</strong> Duplicate data corrupts all downstream analytics. A user who accidentally uploads the same receipt twice gets inflated spend totals, distorted price history, and incorrect pattern predictions. This must be solved before the first public release.
        </p>
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Detection Methods</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:32 }}>
        {DUPLICATE_METHODS.map((m,mi)=>(
          <div key={mi} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{m.title}</span>
                <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, background: m.confidence==="HIGH"?"#fef2f2":m.confidence==="MEDIUM"?"#fffbeb":"#f8fafc", color: m.confidence==="HIGH"?"#991b1b":m.confidence==="MEDIUM"?"#92400e":"#64748b" }}>{m.confidence}</span>
                <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, background:"#eff6ff", color:"#1e40af" }}>{m.tag}</span>
              </div>
              <p style={{ fontSize:13, color:"#475569", lineHeight:1.7, margin:0 }}>{m.desc}</p>
            </div>
            <div style={{ padding:"10px 20px", background:"#f8fafc" }}>
              <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Implementation: </span>
              <span style={{ fontSize:12, color:"#64748b", fontFamily:"monospace" }}>{m.impl}</span>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Edge Cases</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {DUPLICATE_EDGE_CASES.map((ec,i)=>(
          <div key={i} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontWeight:600, fontSize:13, color:"#0f172a", marginBottom:6 }}>⚠️ {ec.title}</div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{ec.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPurchaseEngine = () => (
    <div>
      <div style={{ background:"#eff6ff", borderRadius:12, padding:"14px 20px", marginBottom:24, border:"1px solid #bfdbfe" }}>
        <p style={{ color:"#1e40af", fontSize:14, margin:0, lineHeight:1.6 }}>
          <strong>Two-layer feature.</strong> Shopping Pattern Intelligence (Phase 2 — fully feasible) builds the behavioral foundation. Direct Purchase Integration (Phase 4 — conditionally feasible via partner APIs) sits on top. Both can ship independently.
        </p>
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Layer 1 — Shopping Pattern Intelligence</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:32 }}>
        {PURCHASE_PATTERN_FEATURES.map((f,fi)=>(
          <div key={fi} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
            <div style={{ fontWeight:600, fontSize:13, color:"#0f172a", marginBottom:5 }}>{f.title}</div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Layer 2 — Direct Purchase: API Options</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:32 }}>
        {PURCHASE_APIS.map((api,ai)=>(
          <div key={ai} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontWeight:600, fontSize:13, color:"#0f172a", marginBottom:3 }}>{api.name}</div>
            <div style={{ fontSize:12, fontWeight:600, color:api.color, marginBottom:6 }}>{api.verdict}</div>
            <div style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{api.detail}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Risks & Bottlenecks</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:32 }}>
        {PURCHASE_RISKS.map((r,ri)=>(
          <div key={ri} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{r.title}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4, background: r.level==="HIGH"?"#fef2f2":r.level==="MEDIUM"?"#fffbeb":"#f0fdf4", color: r.level==="HIGH"?"#991b1b":r.level==="MEDIUM"?"#92400e":"#166534" }}>{r.level} RISK</span>
            </div>
            <div style={{ padding:"12px 20px" }}>
              <p style={{ fontSize:13, color:"#475569", lineHeight:1.7, marginBottom:8 }}>{r.desc}</p>
              <div style={{ background:"#f0fdf4", borderRadius:8, padding:"8px 12px", border:"1px solid #bbf7d0" }}>
                <span style={{ fontSize:11, color:"#166534", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Mitigation: </span>
                <span style={{ fontSize:12, color:"#14532d", lineHeight:1.6 }}>{r.mitigation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Recommendation</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {[
          { phase:"Phase 2 — Ship now", color:"#10b981", label:"Pattern intelligence", items:["Restock predictions and basket AI","AI-generated purchase order drafts","Cost estimate per store","User reviews and edits in-app","Export list to use in-store"] },
          { phase:"Phase 4 — Post-traction", color:"#6366f1", label:"Direct purchase", items:["Launch with Instacart Connect only (widest coverage)","OAuth account linking — never touch user payment info","Pilot in 3 metro markets before broad rollout","Show net savings after delivery fees prominently","Auto-import delivery receipt to close analytics loop"] },
        ].map((rec,ri)=>(
          <div key={ri} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"18px 20px", borderLeft:`4px solid ${rec.color}` }}>
            <div style={{ fontSize:11, fontWeight:600, color:rec.color, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{rec.phase}</div>
            <div style={{ fontWeight:600, fontSize:14, color:"#0f172a", marginBottom:10 }}>{rec.label}</div>
            {rec.items.map((item,ii)=>(
              <div key={ii} style={{ display:"flex", gap:8, padding:"4px 0", fontSize:12, color:"#475569", alignItems:"flex-start" }}>
                <span style={{ color:rec.color, fontWeight:700, flexShrink:0 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = () => {
    switch(active) {
      case "Overview": return renderOverview();
      case "Market": return renderMarket();
      case "Features": return renderFeatures();
      case "Analytics Reports": return renderAnalytics();
      case "Architecture": return renderArchitecture();
      case "Data Model": return renderDataModel();
      case "Roadmap": return renderRoadmap();
      case "Platform Strategy": return renderPlatform();
      case "Auto-Ingestion": return renderAutoIngestion();
      case "Duplicate Detection": return renderDuplicates();
      case "Purchase Engine": return renderPurchaseEngine();
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:#f1f5f9; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
      `}</style>
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"0 32px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:0, maxWidth:1200, margin:"0 auto" }}>
          <div style={{ padding:"16px 0", marginRight:32, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span style={{ fontSize:22 }}>🧾</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#0f172a" }}>ReceiptIQ</span>
            <span style={{ fontSize:11, color:"#94a3b8", marginLeft:4, fontWeight:500 }}>v3.0</span>
          </div>
          <div style={{ display:"flex", gap:0, overflowX:"auto" }}>
            {SECTIONS.map(s=>(
              <button key={s} onClick={()=>setActive(s)} style={{ padding:"18px 14px", border:"none", background:"transparent", cursor:"pointer", fontSize:12, fontWeight: active===s ? 600 : 400, color: active===s ? "#6366f1" : s==="Auto-Ingestion"?"#0ea5e9":s==="Duplicate Detection"||s==="Purchase Engine"?"#8b5cf6":"#64748b", borderBottom: active===s ? "2px solid #6366f1" : "2px solid transparent", transition:"all 0.15s", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>
                {s==="Auto-Ingestion"?"⚡ "+s:s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 32px 64px" }}>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>{active}</h2>
        </div>
        {renderSection()}
      </div>
    </div>
  );
}
