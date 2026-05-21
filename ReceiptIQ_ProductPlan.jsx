import { useState } from "react";

const SECTIONS = ["Overview","Market","Features","Analytics Reports","Architecture","Data Model","Roadmap","Platform Strategy","Personalization"];

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
];

const FEATURES = [
  {
    phase:"Phase 1 — Core",color:"#10b981",icon:"🏗️",
    items:[
      { f:"User Registration & Login", d:"Email/password + OAuth (Google, Apple). JWT-based sessions. Per-user encrypted data isolation." },
      { f:"Receipt Upload & OCR", d:"Upload photo, PDF, or screenshot. Claude Vision API extracts store name, date, total, and every line item with name, qty, unit price, total, and auto-detected category." },
      { f:"Line-Item Storage", d:"Each item stored individually in DB with user ID, receipt ID, date, store, category, unit price. Enables all downstream analytics." },
      { f:"Expense Dashboard", d:"Monthly spend overview, category breakdown pie chart, recent receipts list, quick stats (total this month, top category, biggest receipt)." },
      { f:"Manual Entry", d:"Add items or receipts manually when no receipt is available." },
    ]
  },
  {
    phase:"Phase 2 — Intelligence",color:"#6366f1",icon:"🧠",
    items:[
      { f:"Item Price History", d:"Click any item to see every time it was purchased: date, store, price. Line chart shows price trend over time. Delta vs. first purchase shown prominently." },
      { f:"Vendor Price Comparison", d:"AI-powered lookup of current market price for the same item at Walmart, Target, Costco, Amazon, Whole Foods, Aldi, Kroger. Shows cheapest option and potential savings." },
      { f:"Category Analytics", d:"Deep-dive reports per category: spend trend, top items, average unit price, frequency of purchase, month-over-month change." },
      { f:"Inflation Tracker", d:"Track price changes for recurring items over time. Show % increase vs. 3mo/6mo/1yr ago. Compare personal inflation rate vs. CPI." },
      { f:"Store Performance", d:"Which stores you shop most, avg spend per visit, cost efficiency score (your price vs. market average)." },
    ]
  },
  {
    phase:"Phase 3 — Smart Shopping",color:"#f59e0b",icon:"🛒",
    items:[
      { f:"Shopping List Estimator", d:"Upload or type a shopping list. AI estimates cost per item using your price history + current market data. Shows total estimate per store. Recommends optimal store split." },
      { f:"Smart List Optimization", d:"Given a shopping list, AI suggests which store to buy each item from to minimize total cost. Accounts for travel effort with configurable store radius." },
      { f:"Budget Alerts", d:"Set monthly budgets per category. Real-time alerts when approaching or exceeding limits (push, email, SMS)." },
      { f:"Predictive Spend", d:"Based on purchase patterns, forecast next month's spending per category. Highlight unusual spikes." },
    ]
  },
  {
    phase:"Phase 4 — Advanced",color:"#ec4899",icon:"🚀",
    items:[
      { f:"Household / Family Mode", d:"Shared account for household. Multiple members upload receipts. Unified analytics. Split-contribution view." },
      { f:"Export & Integrations", d:"Export to CSV, PDF, Excel. Connect to Mint, YNAB, QuickBooks. Tax report generation for FSA/HSA medicine purchases." },
      { f:"Barcode Scanner", d:"Scan product barcode to instantly look up current prices across vendors without a receipt." },
      { f:"Subscription Detection", d:"Identify recurring charges (streaming, memberships) from receipts. Track subscription spend." },
      { f:"Loyalty Card Tracker", d:"Track loyalty points and rewards across stores. Show value of unredeemed rewards." },
      { f:"Item Watchlist", d:"Stocks-app style home screen list of your most purchased items. Each row shows item name, last price paid, store, trend arrow and % change vs. prior purchase. Search full purchase history to pin any item. Tap to see price history chart, vendor comparison, personal inflation %, and purchase frequency. Pin up to 20 items. User preference — opt-in." },
      { f:"Live Home Screen Ticker", d:"Scrolling marquee strip on the home screen showing real-time spend context. User chooses content: upcoming bills due, weekly category spend so far, price alerts, or budget status. Tap any item to jump to detail. Speed and item count configurable. Can be paused. User preference — opt-in." },
      { f:"Home Screen Preferences", d:"Full user control over home screen layout. Toggle on/off independently: Item Watchlist, Live Ticker, Quick Stats bar, AI Insights card, Upcoming Bills card, Recent Receipts list. Drag to reorder sections. Separate profiles for mobile and web. Default is a clean minimal view; power users can enable all widgets." },
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
      "Best Store by Category — which store gives best price per category (Groceries, Medicine, etc.)",
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
      "Seasonal Spend Patterns — month-by-month category spend across years; spot seasonal trends",
      "Brand Preference Tracker — store-brand vs. name-brand spend ratio per category",
      "Impulse Buy Detector — single-quantity items not on prior shopping patterns",
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
      "Savings Opportunities Report — if you bought each item from the cheapest vendor, total savings",
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
      "Shopping List Cost Estimate — predicted total for any planned shopping list",
      "Annual Expense Projection — extrapolate current patterns to full-year estimate",
      "Category Budget Recommendation — AI-suggested monthly budget per category based on patterns",
      "Subscription & Recurring Cost Summary — identified recurring charges and their annual impact",
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
    items:["React Native + Expo","Shared business logic with web","Native camera / OCR trigger","Push notifications (Expo)","Offline-first with SQLite sync","App Store + Google Play"]
  },
  {
    layer:"Backend API", icon:"⚙️", color:"#f59e0b",
    items:["Node.js + Express / Fastify","REST API + WebSockets","JWT authentication + refresh tokens","Rate limiting + input validation","OpenAPI / Swagger docs","Stripe for subscription billing"]
  },
  {
    layer:"AI / Intelligence", icon:"🧠", color:"#ec4899",
    items:["Claude claude-sonnet-4-20250514 (Vision OCR, JSON extraction)","Claude for vendor price comparison","Claude for shopping list estimation","LangChain for chained analysis workflows","Vector embeddings for item name fuzzy matching","Caching layer to reduce API costs"]
  },
  {
    layer:"Data Storage", icon:"🗄️", color:"#06b6d4",
    items:["PostgreSQL (primary — users, receipts, items)","Redis (sessions, cache, rate limiting)","S3-compatible storage (receipt images)","Pinecone (vector embeddings for item matching)","TimescaleDB extension for time-series price data","Automatic daily backups"]
  },
  {
    layer:"Infrastructure", icon:"☁️", color:"#f97316",
    items:["AWS / Vercel for web hosting","AWS Lambda for OCR processing jobs","CloudFront CDN for receipt images","GitHub Actions CI/CD pipeline","Sentry for error monitoring","Datadog for performance APM"]
  },
];

const DATA_SCHEMA = [
  { table:"users", color:"#6366f1", fields:[
    "id (uuid, PK)","email (unique, indexed)","password_hash","display_name","created_at","subscription_tier","household_id (FK, nullable)"
  ]},
  { table:"receipts", color:"#10b981", fields:[
    "id (uuid, PK)","user_id (FK → users)","store_name","store_chain","receipt_date","total_amount","currency","image_url (S3 key)","raw_ocr_text","created_at"
  ]},
  { table:"receipt_items", color:"#f59e0b", fields:[
    "id (uuid, PK)","receipt_id (FK → receipts)","user_id (FK → users, denormalized for query speed)","item_name","item_name_normalized (lowercase, stemmed)","quantity","unit","unit_price","line_total","category","brand (nullable)","barcode (nullable)","created_at"
  ]},
  { table:"price_history", color:"#ec4899", fields:[
    "id (uuid, PK)","item_name_normalized","store_chain","unit_price","unit","captured_at","source ('receipt' | 'vendor_api' | 'ai_estimate')","user_id (nullable — global prices)"
  ]},
  { table:"shopping_lists", color:"#06b6d4", fields:[
    "id (uuid, PK)","user_id (FK → users)","name","created_at","estimated_total","list_items (jsonb array)"
  ]},
];

const ROADMAP = [
  { q:"Q1 2025", title:"Foundation", color:"#6366f1", items:["User auth (email + OAuth)","Receipt upload + Claude OCR","Line-item storage schema","Basic dashboard + category charts","React Native app skeleton","Core REST API"] },
  { q:"Q2 2025", title:"Intelligence", color:"#10b981", items:["Item price history charts","Vendor price comparison (AI)","Store analytics deep-dive","Category trend reports","Inflation tracker","Mobile app feature parity"] },
  { q:"Q3 2025", title:"Smart Shopping", color:"#f59e0b", items:["Shopping list estimator","Store optimization AI","Budget alerts (push/email)","Predictive spend forecasting","Barcode scanner","Household / family mode"] },
  { q:"Q4 2025", title:"Growth & Scale", color:"#ec4899", items:["CSV / PDF export","Mint / YNAB integration","FSA/HSA tax report","Subscription detection","Loyalty card tracker","Public API for partners"] },
  { q:"Q2 2026", title:"Personalisation", color:"#f97316", items:["Item Watchlist (Stocks-style)","Live Home Screen Ticker","Home Screen Preferences","Widget drag-to-reorder","Per-platform layout profiles","Power mode for all widgets"] },
];

const PERSONALIZATION = [
  {
    id:"watchlist", icon:"📈", color:"#6366f1", title:"Item Watchlist",
    badge:"User preference — opt-in",
    description:"A Stocks-app style home screen that shows your most purchased items at a glance — with live price trend indicators.",
    detail:[
      { label:"Home screen list", value:"Top 10 most purchased items auto-populated on first use" },
      { label:"Each row shows", value:"Item name · Last price paid · Store · Trend arrow · % change vs. prior purchase" },
      { label:"Color indicator", value:"Green / red vs. your personal historical average for that item" },
      { label:"Search & pin", value:"Search full purchase history to find and pin any item to watchlist" },
      { label:"Max pins", value:"Up to 20 items; auto-suggested based on purchase frequency" },
      { label:"Tap → detail screen", value:"Price history chart, vendor comparison, personal inflation % (3mo/6mo/1yr), last purchased date + store, purchase frequency" },
      { label:"Reorder", value:"Drag to rearrange watchlist order" },
      { label:"Availability", value:"Mobile and full web portal" },
    ]
  },
  {
    id:"ticker", icon:"📺", color:"#10b981", title:"Live Home Screen Ticker",
    badge:"User preference — opt-in",
    description:"A scrolling marquee strip at the top of the home screen giving a live at-a-glance view of your financial pulse.",
    detail:[
      { label:"Content options", value:"Upcoming bills due in 7 days / Weekly category spend so far / Price alerts / Budget status per category" },
      { label:"Interaction", value:"Tap any ticker item to jump directly to that detail screen" },
      { label:"Customisation", value:"User selects which content types appear in the strip" },
      { label:"Speed & density", value:"Scroll speed and number of items configurable in preferences" },
      { label:"Pause", value:"Tap strip to pause; auto-resumes after 10 seconds" },
      { label:"Example items", value:"'Groceries: $84 spent this week · Electricity bill due in 3 days · Milk up 12% at Walmart · Dining: 68% of budget used'" },
    ]
  },
  {
    id:"homeprefs", icon:"⚙️", color:"#f59e0b", title:"Home Screen Preferences",
    badge:"Settings → Home Screen",
    description:"Full user control over what appears on the home screen and in what order. Default is minimal; power users can enable maximum density.",
    detail:[
      { label:"Toggleable widgets", value:"Item Watchlist · Live Ticker · Quick Stats bar · AI Insights card · Upcoming Bills card · Recent Receipts list" },
      { label:"Reorder", value:"Drag any section up or down to set preferred order" },
      { label:"Platform profiles", value:"Separate layout preferences for mobile and web portal" },
      { label:"Default view", value:"Clean minimal — Quick Stats + Recent Receipts only" },
      { label:"Power mode", value:"All widgets enabled for maximum information density" },
      { label:"Persistence", value:"Preferences saved per user account, sync across devices" },
    ]
  },
];

// ──────────────────────────────────────────────────
export default function ProductPlan() {
  const [active, setActive] = useState("Overview");
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  const renderOverview = () => (
    <div>
      <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", borderRadius:16, padding:"40px 48px", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:-40, left:80, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{ fontSize:36 }}>🧾</div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"#fff", letterSpacing:"-0.02em", margin:0 }}>ReceiptIQ</h2>
              <p style={{ color:"#818cf8", fontSize:14, margin:0, fontWeight:500 }}>Product Plan · Version 1.0</p>
            </div>
          </div>
          <p style={{ color:"#c7d2fe", fontSize:16, lineHeight:1.7, maxWidth:600, marginBottom:24 }}>
            An AI-powered, multi-category expense tracker that turns paper receipts into deep financial intelligence — with item-level price history, cross-vendor comparison, and smart shopping list estimation.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[["4 Phases","Product Roadmap"],["35+","Analytics Reports"],["6-Layer","Tech Architecture"],["9 Sections","Full Product Plan"]].map(([v,l])=>(
              <div key={l} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#a5b4fc" }}>{v}</div>
                <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>The Market Gap</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
        {GAP.map((g,i)=>(
          <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", background:"#f0fdf4", borderRadius:10, padding:"12px 16px", border:"1px solid #bbf7d0" }}>
            <span style={{ color:"#10b981", fontWeight:700, fontSize:16, marginTop:1 }}>✓</span>
            <span style={{ color:"#14532d", fontSize:14, lineHeight:1.6 }}>{g}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:16 }}>Core User Journeys</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {[
          ["📷 Upload Receipt","Snap a photo → AI extracts every line item → stored with category, price, store, date"],
          ["📈 Price Intelligence","Click any item → see price history chart → AI fetches current vendor prices → shows savings opportunity"],
          ["🛒 Smart Shopping","Type your shopping list → AI estimates total cost per store → recommends optimal store split"],
          ["📊 Analytics","Run 35+ reports across spending, inflation, behavior, savings, and forecasting"],
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
          <strong>Verdict:</strong> No existing app offers the full combination of multi-category receipt scanning + item-level price history + live vendor comparison + AI shopping list estimation. ReceiptIQ occupies a unique position in this market.
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
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Focus</div>
                <div style={{ color:"#334155" }}>{c.focus}</div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"#10b981", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>✓ Strength</div>
                <div style={{ color:"#334155" }}>{c.strength}</div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>✗ Gap</div>
                <div style={{ color:"#334155" }}>{c.gap}</div>
              </div>
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
                style={{ padding:"14px 24px", borderBottom:ii<phase.items.length-1?"1px solid #f1f5f9":"none", cursor:"pointer", transition:"background 0.1s", background: expandedFeature===`${pi}-${ii}` ? "#f8fafc" : "transparent" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:phase.color, flexShrink:0 }} />
                    <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{item.f}</span>
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
        <p style={{ color:"#0c4a6e", fontSize:14, margin:0 }}>All 35+ reports are buildable from the core data schema. Reports marked ★ require the Vendor Price API integration. Reports marked ◆ require 3+ months of data.</p>
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
        <div style={{ display:"flex", alignItems:"center", gap:0, flexWrap:"wrap" }}>
          {[
            ["📷","Receipt Upload","User uploads image or PDF"],
            ["→",null,null],
            ["🔍","Claude Vision","Extract store, date, all line items as JSON"],
            ["→",null,null],
            ["⚙️","Normalize","Fuzzy-match item names, assign categories"],
            ["→",null,null],
            ["💾","Store","PostgreSQL + price_history update"],
            ["→",null,null],
            ["📊","Analyze","Trigger dashboard refresh"],
          ].map(([icon,title,desc],i)=>(
            title ? (
              <div key={i} style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"10px 14px", minWidth:110, border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:16, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"#a5b4fc", marginBottom:3 }}>{title}</div>
                <div style={{ fontSize:11, color:"#475569", lineHeight:1.4 }}>{desc}</div>
              </div>
            ) : <div key={i} style={{ color:"#334155", fontSize:20, padding:"0 6px" }}>{icon}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataModel = () => (
    <div>
      <div style={{ background:"#f8fafc", borderRadius:12, padding:"14px 20px", marginBottom:24, border:"1px solid #e2e8f0" }}>
        <p style={{ color:"#475569", fontSize:14, margin:0 }}>The <code style={{ background:"#e2e8f0", padding:"2px 6px", borderRadius:4, fontSize:13 }}>receipt_items</code> table is the heart of the system — every line item stored individually enables all analytics. The <code style={{ background:"#e2e8f0", padding:"2px 6px", borderRadius:4, fontSize:13 }}>price_history</code> table is populated from both receipts and AI vendor lookups, powering comparison features.</p>
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
                  <span style={{ color: f.includes("PK")?"#10b981":f.includes("FK")?"#6366f1":f.includes("nullable")?"#94a3b8":"#334155" }}>{f}</span>
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
          ["Weekly Active Users","> 40% of registered","Indicates genuine utility"],
          ["Avg Receipts / User","8+ per month","Signals complete household use"],
          ["Price Alerts Actioned","> 30% click-through","Validates intelligence value"],
          ["Shopping List Uses","3+ per active user/mo","Core differentiator usage"],
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
          { title:"📱 Mobile App", sub:"iOS + Android via React Native + Expo", color:"#10b981", primary:true,
            features:["Native camera for receipt scanning","Push notifications for budget alerts","Barcode scanner via device camera","Offline receipt queue (sync when online)","Bottom-tab navigation optimized for thumb reach","Home screen widgets for quick spend view","Face ID / Touch ID login","App Store + Google Play distribution"],
            tech:"React Native · Expo · SQLite · React Query · Expo Camera" },
          { title:"🖥️ Web Portal", sub:"Full-featured browser app", color:"#6366f1", primary:true,
            features:["Drag-and-drop receipt upload (batch)","Full analytics dashboard with advanced charts","Keyboard shortcuts for power users","Data export (CSV, PDF, Excel)","Multi-tab comparison views","Print-friendly report layouts","PWA installable on desktop","Admin panel for household managers"],
            tech:"Next.js 14 · React · TailwindCSS · Recharts · D3.js" },
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
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"20px 24px", marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            ["Shared Business Logic","TypeScript shared packages for validation, formatting, and API calls — used by both web and mobile"],
            ["Single API Backend","One Node.js API serves both platforms. Feature flags for platform-specific behavior."],
            ["Real-time Sync","WebSockets push receipt processing updates and budget alerts to both platforms simultaneously"],
            ["Unified Auth","JWT tokens work across web and mobile. Refresh token rotation. OAuth (Google, Apple) on both."],
            ["Design System","Shared design tokens and component library. Consistent UX across web (shadcn) and mobile (NativeBase)."],
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

  const renderPersonalization = () => (
    <div>
      <div style={{ background:"#f0f9ff", borderRadius:12, padding:"14px 20px", marginBottom:24, border:"1px solid #bae6fd" }}>
        <p style={{ color:"#0c4a6e", fontSize:14, margin:0 }}>All three features are user preferences — opt-in only. The default home screen stays clean and minimal. Users who want more density can enable any combination from Settings → Home Screen.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {PERSONALIZATION.map((p,pi)=>(
          <div key={pi} style={{ background:"#fff", border:`1px solid ${p.color}30`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ background:`${p.color}10`, padding:"16px 24px", borderBottom:`1px solid ${p.color}20`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>{p.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#0f172a" }}>{p.title}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, background:`${p.color}18`, color:p.color }}>{p.badge}</span>
                </div>
                <p style={{ fontSize:13, color:"#64748b", margin:0, lineHeight:1.5 }}>{p.description}</p>
              </div>
            </div>
            <div style={{ padding:"8px 0" }}>
              {p.detail.map((d,di)=>(
                <div key={di} style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:16, padding:"10px 24px", borderBottom:di<p.detail.length-1?"1px solid #f8fafc":"none", alignItems:"flex-start" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.04em", paddingTop:2 }}>{d.label}</div>
                  <div style={{ fontSize:13, color:"#334155", lineHeight:1.6 }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#1e293b", margin:"32px 0 16px" }}>How They Work Together</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {[
          ["Default user","Sees Quick Stats + Recent Receipts. No ticker, no watchlist. Clean and fast."],
          ["Engaged user","Enables Watchlist + Ticker. Gets at-a-glance price trends and upcoming bills every time they open the app."],
          ["Power user","All widgets on. Full density — watchlist, ticker, AI insights, bills, stats, receipts — everything visible on open."],
        ].map(([t,d])=>(
          <div key={t} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontWeight:600, fontSize:14, color:"#0f172a", marginBottom:8 }}>{t}</div>
            <div style={{ fontSize:13, color:"#64748b", lineHeight:1.6 }}>{d}</div>
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
      case "Personalization": return renderPersonalization();
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

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"0 32px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:0, maxWidth:1100, margin:"0 auto" }}>
          <div style={{ padding:"16px 0", marginRight:32, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>🧾</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#0f172a" }}>ReceiptIQ</span>
            <span style={{ fontSize:11, color:"#94a3b8", marginLeft:4, fontWeight:500 }}>Product Plan</span>
          </div>
          <div style={{ display:"flex", gap:0, overflowX:"auto" }}>
            {SECTIONS.map(s=>(
              <button key={s} onClick={()=>setActive(s)} style={{ padding:"18px 16px", border:"none", background:"transparent", cursor:"pointer", fontSize:13, fontWeight: active===s ? 600 : 400, color: active===s ? "#6366f1" : "#64748b", borderBottom: active===s ? "2px solid #6366f1" : "2px solid transparent", transition:"all 0.15s", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 32px 64px" }}>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>{active}</h2>
        </div>
        {renderSection()}
      </div>
    </div>
  );
}
