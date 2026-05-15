# ReceiptIQ — Pending Changes Staging Plan

> Changes queued here will be merged into `ReceiptIQ_ProductPlan.jsx` once all requirements are finalized.

---

## Document Summary

| # | Requirement | Version Bump | Roadmap Slot | Status |
|---|---|---|---|---|
| 1 | Auto-Ingestion (retailers via email, browser extension, API) | v1.0 → v2.0 | Phase 4A, 4B + Q1 2026 | ✅ Specced |
| 2 | Bills & Checks Auto-Ingestion + Weekly Review Flow | v2.0 → v3.0 | Phase 4B, 4C, Phase 5 | ✅ Specced |
| 3 | Instant Push Notifications for Ingestion Approval | v3.0 → v3.1 | Phase 4B | ✅ Specced |

*Additional requirements will be appended below as they are finalized.*

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
