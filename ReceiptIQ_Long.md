# ReceiptIQ – Complete Product Plan (Long Version)

🧾 *ReceiptIQ – Complete Product Plan · v3.0*

---

🏗️ *PHASE 1 — Core:*
• User registration (email, Google, Apple OAuth) + PostgreSQL Row-Level Security from day one
• Receipt upload + Claude Vision OCR (store, date, every line item)
• **Duplicate receipt detection** — pHash + SHA-256 content fingerprint catches same receipt uploaded twice before it hits the DB
• Line-item DB storage with category, price, store, date
• Expense dashboard with charts & quick stats
• Manual entry for no-receipt situations

🧠 *PHASE 2 — Intelligence:*
• Item price history with trend charts
• Vendor price comparison across 7+ major stores
• **Shopping Pattern Intelligence** — restock cycles, basket composition, price-timing optimization
• **Net worth tracking** via Plaid (bank + investment sync)
• Category deep-dive analytics
• Personal inflation tracker vs. CPI
• Store performance & cost efficiency scoring

🛒 *PHASE 3 — Smart Shopping + AI:*
• **AI Purchase Order Builder** — pattern-driven weekly order suggestion, cost-optimized by store
• Type or upload a shopping list → AI estimates cost per store
• Store optimization (which store for which item)
• **Custom date range spending reports** with prior-period comparison and labelled periods
• **AI Spending Assistant** — ask anything in plain English (Pro only)
• **Historical Data Import** — Amazon CSV, bulk camera roll, Google Drive, Plaid transaction history
• Budget alerts (push/email/SMS)
• Predictive spend forecasting
• Goals & budget streaks

🚀 *PHASE 4 — Auto-Ingestion & Scale:*
• Auto-ingestion via Gmail/Outlook OAuth (20+ retailers, fully automatic)
• Forward-to-email (unique address per user, any retailer)
• Browser extension — Amazon, Costco, Walmart, Target order history
• Bills & checks ingestion (dining, subscriptions, travel, utilities, phone, rent)
• Instant push notifications — Keep/Dismiss within 30–60 seconds of ingestion
• Smart throttling: max 3 push/day, grouping window, quiet hours, amount threshold ($20 default)
• Weekly digest as safety-net audit trail (auto-ingested after 24hrs)
• **Direct Purchase Integration** — Instacart Connect, Kroger API (pilot); OAuth only, never touch payment info
• Inbox history backfill (opt-in)
• Household/family shared mode
• Export (CSV, PDF, Excel) + Mint/YNAB/QuickBooks
• Barcode scanner for instant price lookup
• Subscription detection & tracking
• FSA/HSA tax report generation

🌐 *PHASE 5 — Global & Personalisation:*
• Direct retailer API partnerships (Costco, Kroger, Albertsons, Whole Foods)
• Medical bill & insurance ingestion (amount + provider only — no diagnosis codes)
• Mortgage & insurance premium tracking
• **Item Watchlist** — Stocks-style home screen tracker for your top 20 items
• **Live Home Screen Ticker** — scrolling strip of bills, spend, price alerts, budget status
• **Home Screen Preferences** — drag + toggle all widgets; separate mobile and web profiles
• Auto-suggested labelled spending periods (trip detection)
• Full international expansion (India, Brazil, Japan, SE Asia)

---

📊 *ANALYTICS — 45+ Reports across 8 categories:*
• Spending Overview — monthly totals, weekly patterns, annual summary, budget vs. actual
• Price Intelligence — item history, personal inflation, vendor matrix, price anomalies
• Purchasing Behavior — frequency, basket composition, seasonal trends, brand preference
• Shopping Patterns — restock cycles, basket evolution, predictive shopping list, price-timing optimization ★
• Bills & Recurring — utility trends, subscription audit, dining vs. groceries, bill due date calendar ★
• Health & Wellness — medicine spend, personal care, FSA/HSA tracking
• Savings & Optimization — savings opportunities, bulk buy ROI, duplicate purchases
• Forecasting — next month prediction, custom date range reports, annual projection, AI budget recommendations

---

⚡ *AUTO-INGESTION — 4 Channels:*
• Gmail + Outlook OAuth (Phase 4A) — 20+ retailers, fully automatic, read-only to receipt domains
• Forward-to-email (Phase 4A) — any retailer, no inbox access needed, SendGrid Inbound Parse
• Browser extension (Phase 4B) — Chrome + Safari, pulls order history (pending ToS legal review)
• Direct retailer APIs (Phase 5) — formal BD partnerships, 6–18 month sales cycle

📧 *Email Parser Coverage:*
• Amazon 97%, Apple 98%, Uber Eats 95%, DoorDash 96%, Target 94%, Instacart 94%
• Walmart 93%, Costco 91%, Best Buy 89%, Whole Foods 88%, Walgreens 85%, CVS 83%
• Claude Vision fallback for low-confidence parses (<80% threshold)
• Inbox history backfill (opt-in, configurable date range)
• SHA-256 duplicate detection: prevents same receipt added via email + manual upload

---

🔒 *DUPLICATE DETECTION:*
• pHash (perceptual image hash) — catches same photo uploaded twice. Hamming distance < 10 = duplicate. <50ms per image
• Content fingerprint — SHA-256 of (user_id + store + date + total_cents). Exact match = certain duplicate
• Fuzzy content match — total within $0.05 + same store + date = probable duplicate
• Item-level deduplication — fuzzy item name + same date + same price = flagged for review
• User resolution flow: side-by-side comparison → Discard / Keep Both / Merge
• Edge cases handled: same-day two trips, partial receipts, household sharing, amended receipts

---

🛒 *PURCHASE ENGINE:*
• Layer 1 (Phase 2) — Shopping Pattern Intelligence: restock prediction, basket intelligence, price-timing optimization, consumption rate modeling, seasonal adaptation
• Layer 2 (Phase 3) — AI Purchase Order Builder: weekly AI-generated order suggestion, cost-optimized by store, user reviews and confirms
• Layer 3 (Phase 4) — Direct Purchase: Instacart Connect (1,400+ retailers), Kroger API, DoorDash Drive. OAuth only — never touch payment info
• High risks: API availability, price discrepancy liability, PCI-DSS. Mitigated by OAuth linking, estimate disclaimers, Instacart-first strategy
• Net savings shown after delivery fees. Recommend pickup over delivery when fees erode savings

---

🤖 *AI SPENDING ASSISTANT:*
• Natural language questions about your own data
• "Which subscriptions haven't I used in 3 months?"
• "What's my personal inflation rate on groceries?"
• "Compare my Italy trip spend to my Paris trip"
• Pre-computed context injection for fast answers (~3,000 tokens per turn)
• Text-to-SQL for precise figures (parameterised queries, user_id scoped, never exposed to user)
• Proactive insights on session open: unusual spend, budget pace, subscription waste
• Inline charts in chat for trend questions
• Hallucination guard: every number must be sourced from query results or injected context
• ~$0.35/month per active Pro chatbot user — well within $6.99 margin
• Pro & Family tier only

---

📈 *ITEM WATCHLIST (Phase 5 — user preference):*
• Home screen lists top 20 most purchased items, styled like iPhone Stocks app
• Each row: item name · last price paid · store · trend arrow · % change vs. prior purchase
• Green/red indicator vs. personal historical average for that item
• Tap any item → price history chart, vendor comparison, personal inflation %, purchase frequency
• Drag to reorder, pin up to 20 items, auto-suggested based on frequency
• Available on both mobile and web portal

---

📺 *LIVE HOME SCREEN TICKER (Phase 5 — user preference):*
• Scrolling marquee strip showing real-time spend context
• User chooses: upcoming bills, weekly spend per category, price alerts, budget status
• Tap any ticker item → jumps directly to that detail screen
• Scroll speed and number of items configurable in preferences
• Can be paused or dismissed for the session

---

⚙️ *HOME SCREEN PREFERENCES (Phase 5 — user-controlled):*
• Toggle on/off independently: Item Watchlist, Live Ticker, Quick Stats, AI Insights card, Upcoming Bills card, Recent Receipts
• Drag to reorder all sections
• Separate preference profiles for mobile and web
• Default: clean minimal view (Quick Stats + Recent Receipts only)
• Power mode: all widgets enabled

---

🆚 *COMPETITORS (8 analyzed):*
• Groceries Tracker — grocery only
• Expensify — business-focused, no item-level tracking
• Skwad — household budgeting, no vendor comparison
• Fetch Rewards — rebates only, zero analytics
• GroceryTracker Pro — grocery only, no AI
• Smart Receipts — tax tool only
• Ibotta/Checkout 51 — cashback only
• Flipp/Basket — pre-purchase only, no receipts
• ✅ None combine everything ReceiptIQ does

---

⚙️ *TECH STACK:*
• Frontend: React 18, Next.js 14, TailwindCSS, PWA
• Mobile: React Native + Expo (iOS & Android)
• Backend: Node.js, REST + WebSockets, Stripe billing + Stripe Tax
• AI: Claude Vision OCR, Claude AI Assistant, LangChain, vector embeddings
• Database: PostgreSQL + RLS, Redis, S3, Pinecone, TimescaleDB, Plaid
• Infrastructure: AWS ECS Fargate, Lambda, SNS, SQS, SES, CloudFront, Vercel, SendGrid Inbound Parse, GitHub Actions

---

🗄️ *DATA MODEL (16 tables):*
• users, receipts (+ pHash, content_hash, duplicate_of, ingestion_source_id), receipt_items (+ item_type, sensitivity)
• price_history, shopping_lists
• shopping_patterns ★, purchase_orders ★
• ingestion_sources ★, recurring_patterns ★, review_inbox ★
• device_tokens ★, spending_periods ★, ai_chat_sessions ★, ai_chat_log ★
• organisations (multi-tenancy), exchange_rates (i18n)

---

🌍 *INTERNATIONAL:*
• Multi-currency (USD, GBP, EUR, INR, JPY & more) — stored as original + USD equivalent
• 8 languages in roadmap (English, Spanish, Portuguese, German, French, Hindi, Japanese, Mandarin)
• GDPR, CCPA, LGPD, India DPDP compliant
• Data residency per region (US, EU, India, Australia)
• Local payment methods (UPI, PIX, SEPA, iDEAL & more)
• Stripe Tax for automatic VAT/GST in 50+ countries

---

🗓️ *ROADMAP:*
• Q1 2025 — Auth, OCR, duplicate detection ★, RLS, storage, basic dashboard, mobile skeleton
• Q2 2025 — Price history, vendor comparison, shopping patterns ★, net worth (Plaid) ★, inflation tracker
• Q3 2025 — AI purchase orders ★, shopping list AI, custom date reports ★, AI assistant ★, historical import ★, goals & streaks ★
• Q4 2025 — Auto-ingestion (Gmail/Outlook) ★, bills ingestion ★, push notifications ★, direct purchase pilot ★
• Q1 2026 — Browser extension ★, utilities/medical bills ★, EU expansion ★, CSV/YNAB export
• Q2 2026 — Item Watchlist ★, Live Ticker ★, Home Screen Preferences ★, India expansion ★, retailer API BD

---

🎯 *SUCCESS METRICS:*
• 5,000 receipts scanned/month by Q2
• 95%+ OCR accuracy
• 99%+ duplicate detection recall (prevents analytics corruption)
• 40%+ weekly active users
• 8+ receipts per user per month
• 30%+ email connect rate within 30 days of launch
• 60%+ receipts via auto-ingestion within 3 months
• 92%+ parser confidence score
• 70%+ push notification opt-in rate
• 60%+ instant action rate on notifications
• 3+ purchase orders built per active user per month
• 50%+ of Phase 5 users enabling at least one home screen widget
