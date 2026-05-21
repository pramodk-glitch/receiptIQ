import { useState } from "react";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "#64748b",
    accent: "#94a3b8",
    bg: "#f8fafc",
    tag: null,
    description: "Scan, store, and see the basics.",
    limits: "Up to 10 receipts/month · 3-month history",
    features: [
      "Receipt upload + OCR (10/mo)",
      "Line-item storage",
      "Basic monthly dashboard",
      "3 categories tracked",
      "Mobile app access",
    ],
    locked: [
      "Price history & vendor comparison",
      "Inflation tracker",
      "All 35+ analytics reports",
      "Shopping list estimator",
      "Budget alerts",
      "Data export",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$6.99",
    period: "per month",
    color: "#6366f1",
    accent: "#a5b4fc",
    bg: "#eef2ff",
    tag: "Most Popular",
    description: "Full intelligence for individual users.",
    limits: "Unlimited receipts · Full history",
    features: [
      "Unlimited receipt scanning",
      "All 35+ analytics reports",
      "Item price history (full)",
      "Live vendor price comparison",
      "Inflation tracker vs. CPI",
      "Shopping list estimator",
      "Budget alerts (push + email)",
      "CSV & PDF export",
      "Web portal + mobile app",
    ],
    locked: [
      "Household / family mode",
      "QuickBooks / YNAB integration",
      "FSA/HSA tax reports",
      "Partner API access",
    ],
    cta: "Start 14-day Trial",
  },
  {
    name: "Family",
    price: "$11.99",
    period: "per month",
    color: "#10b981",
    accent: "#6ee7b7",
    bg: "#f0fdf4",
    tag: "Best Value",
    description: "Everything in Pro, shared across your household.",
    limits: "Up to 6 members · Unlimited receipts",
    features: [
      "Everything in Pro",
      "Up to 6 household members",
      "Unified household analytics",
      "Per-member spend breakdown",
      "Shared shopping lists",
      "Subscription detection",
      "Loyalty card tracker",
      "SMS budget alerts",
    ],
    locked: [
      "QuickBooks / YNAB integration",
      "Partner API access",
    ],
    cta: "Start 14-day Trial",
  },
  {
    name: "Business",
    price: "$24.99",
    period: "per month",
    color: "#f59e0b",
    accent: "#fcd34d",
    bg: "#fffbeb",
    tag: null,
    description: "For freelancers, SMBs, and tax-prep power users.",
    limits: "Unlimited · Multi-user · API access",
    features: [
      "Everything in Family",
      "QuickBooks + YNAB integration",
      "FSA / HSA tax report generation",
      "Barcode scanner (unlimited)",
      "Predictive spend forecasting",
      "Partner API (1,000 calls/mo)",
      "Priority support",
      "Custom category labels",
    ],
    locked: [],
    cta: "Contact Sales",
  },
];

const REVENUE_STREAMS = [
  {
    icon: "💳",
    title: "Subscription Revenue",
    subtitle: "Primary driver — 80% of revenue",
    color: "#6366f1",
    detail:
      "Pro + Family tiers targeting individuals and households. Low churn expected — users with 6+ months of price history are highly locked in due to data value.",
    metric: "Target: $50K MRR at 5K paid users",
  },
  {
    icon: "📊",
    title: "Anonymized Data Insights",
    subtitle: "B2B data licensing — 12% of revenue",
    color: "#10b981",
    detail:
      "Aggregated, anonymized price trends (e.g. \"avocado prices rose 18% in the Northeast this quarter\") licensed to FMCG brands, market research firms, and retail analysts. No PII sold — ever.",
    metric: "Target: $5K–$20K/mo per enterprise client",
  },
  {
    icon: "🤝",
    title: "Affiliate & Cashback Partnerships",
    subtitle: "Non-intrusive — 5% of revenue",
    color: "#f59e0b",
    detail:
      "When ReceiptIQ shows a cheaper option at another store, a tap-to-navigate or add-to-cart flow earns a referral fee from Instacart, Amazon Fresh, or Walmart+. User saves money; we earn commission.",
    metric: "~$0.30–$1.20 per converted referral",
  },
  {
    icon: "🔌",
    title: "Partner API",
    subtitle: "Developer & enterprise — 3% of revenue",
    color: "#ec4899",
    detail:
      "Expose price history and OCR endpoints for third-party budgeting apps, insurance platforms, and fintech integrations. Business tier includes 1K calls/mo; enterprise pricing beyond that.",
    metric: "Usage-based: $0.005 per API call",
  },
];

const PITCH_SLIDES = [
  {
    label: "Problem",
    color: "#ef4444",
    icon: "😤",
    headline: "You have no idea where your money actually goes",
    body: "Budgeting apps show your bank balance. They don't tell you that oat milk went up 22% at Whole Foods, that you spent $340 on medicine last quarter, or that switching your top 5 items to Aldi would save you $87/month. The data is in your receipts — but no one is reading it.",
    stat: "$1.3T spent on groceries + household goods in the US annually",
  },
  {
    label: "Solution",
    color: "#10b981",
    icon: "🧾",
    headline: "ReceiptIQ turns every receipt into financial intelligence",
    body: "Snap a photo. Claude Vision AI extracts every line item in seconds — store, date, quantity, unit price, category. Over time you get item-level price history, inflation tracking, vendor comparison, and AI-powered shopping list estimates. First app to do this across all categories.",
    stat: "35+ analytics reports from a single receipt scan",
  },
  {
    label: "Market",
    color: "#6366f1",
    icon: "📈",
    headline: "$4.2B personal finance app market, growing at 5.7% CAGR",
    body: "The household budgeting app market is large but poorly served at the item level. No competitor combines OCR + multi-category tracking + vendor price comparison. Adjacent markets include price intelligence ($2.1B) and grocery tech ($8.4B). ReceiptIQ sits at the intersection of all three.",
    stat: "TAM: $4.2B · SAM: $800M · SOM: $40M (Year 3)",
  },
  {
    label: "Traction",
    color: "#f59e0b",
    icon: "🚀",
    headline: "Key milestones to validate before raising",
    body: "Pre-seed raise should follow: working MVP with OCR accuracy >95%, 500 beta users, 8+ receipts scanned per active user per month, and a Net Promoter Score above 50. These metrics signal genuine habit formation — the leading indicator for low churn and high LTV.",
    stat: "Target: 500 beta users → $500K pre-seed round",
  },
  {
    label: "Business Model",
    color: "#ec4899",
    icon: "💰",
    headline: "Freemium SaaS with four compounding revenue streams",
    body: "Free tier drives acquisition. Pro/Family subscriptions monetize retention. Data licensing monetizes scale without selling user PII. Affiliate commissions align our incentives with saving users money — we only earn when users actually find a better deal.",
    stat: "LTV:CAC target of 4:1 at 18-month payback",
  },
  {
    label: "Ask",
    color: "#0ea5e9",
    icon: "🎯",
    headline: "Raising $500K pre-seed to reach product-market fit",
    body: "Use of funds: 60% engineering (React Native + backend), 20% AI/OCR infrastructure, 10% user acquisition for beta cohort, 10% legal + ops. Milestone: 2,000 paid subscribers and $14K MRR by month 12, positioning for a $2M–$3M seed round.",
    stat: "18-month runway · Break-even at 7,200 paid users",
  },
];

const UNIT_ECONOMICS = [
  { label: "Free → Pro Conversion", value: "8–12%", note: "Industry avg for utility apps" },
  { label: "Pro Monthly Churn", value: "< 3%", note: "Price history = high lock-in" },
  { label: "Avg Revenue Per User", value: "$7.80/mo", note: "Blended across tiers" },
  { label: "Customer Acquisition Cost", value: "~$12", note: "Organic + ASO-first" },
  { label: "Lifetime Value (24mo)", value: "~$187", note: "At 3% monthly churn" },
  { label: "LTV : CAC Ratio", value: "15.6×", note: "Highly capital efficient" },
];

export default function MonetizationPitch() {
  const [activeTab, setActiveTab] = useState("pricing");
  const [activePitch, setActivePitch] = useState(0);
  const [hoveredTier, setHoveredTier] = useState(null);

  const tabs = [
    { id: "pricing", label: "💳 Pricing Tiers" },
    { id: "revenue", label: "📊 Revenue Streams" },
    { id: "pitch", label: "🎯 Pitch Narrative" },
    { id: "economics", label: "📐 Unit Economics" },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .tier-card { transition: transform 0.2s, box-shadow 0.2s; }
        .tier-card:hover { transform: translateY(-4px); }
        .pitch-dot { transition: all 0.2s; cursor: pointer; }
        .pitch-dot:hover { transform: scale(1.3); }
        .locked-item { opacity: 0.4; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🧾</span>
          <div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc", letterSpacing: "-0.02em" }}>ReceiptIQ</span>
            <span style={{ fontSize: 12, color: "#475569", marginLeft: 10, fontFamily: "'Space Mono', monospace" }}>Monetization + Pitch Strategy</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#334155" }}>v1.0 · 2026</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "24px 40px 0", borderBottom: "1px solid #1e293b", display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)}
            style={{ padding: "10px 20px", border: "none", borderRadius: "8px 8px 0 0", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              background: activeTab === t.id ? "#1e293b" : "transparent",
              color: activeTab === t.id ? "#f8fafc" : "#64748b",
              borderBottom: activeTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
            }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "32px 40px 64px", maxWidth: 1100, margin: "0 auto" }}>

        {/* PRICING TIERS */}
        {activeTab === "pricing" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 800, fontSize: 28, color: "#f8fafc", letterSpacing: "-0.03em", marginBottom: 8 }}>
                Four tiers. One clear upgrade path.
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 580 }}>
                Free tier hooks users through OCR convenience. Pro monetizes the moment they want intelligence. Family and Business expand ARPU without friction.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {TIERS.map((tier, i) => (
                <div key={i} className="tier-card"
                  style={{ background: "#111827", border: `1px solid ${hoveredTier === i ? tier.color : "#1e293b"}`, borderRadius: 16, overflow: "hidden", position: "relative" }}
                  onMouseEnter={() => setHoveredTier(i)} onMouseLeave={() => setHoveredTier(null)}>
                  {tier.tag && (
                    <div style={{ position: "absolute", top: 12, right: 12, background: tier.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>{tier.tag}</div>
                  )}
                  <div style={{ padding: "24px 22px 20px", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: tier.color, marginBottom: 8, letterSpacing: "0.08em" }}>{tier.name.toUpperCase()}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", lineHeight: 1 }}>{tier.price}</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4, marginBottom: 12 }}>{tier.period}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 12 }}>{tier.description}</div>
                    <div style={{ fontSize: 11, color: tier.color, fontWeight: 600, background: `${tier.color}15`, padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>{tier.limits}</div>
                  </div>
                  <div style={{ padding: "16px 22px" }}>
                    {tier.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 12, color: "#cbd5e1", alignItems: "flex-start" }}>
                        <span style={{ color: tier.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                    {tier.locked.length > 0 && (
                      <>
                        <div style={{ height: 1, background: "#1e293b", margin: "10px 0" }} />
                        {tier.locked.map((f, fi) => (
                          <div key={fi} className="locked-item" style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 12, color: "#475569", alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, marginTop: 1 }}>🔒</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </>
                    )}
                    <button style={{ marginTop: 16, width: "100%", padding: "10px", background: `${tier.color}20`, border: `1px solid ${tier.color}40`, color: tier.color, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                      {tier.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, background: "#111827", borderRadius: 12, padding: "16px 24px", border: "1px solid #1e293b", display: "flex", gap: 32, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#475569" }}>💡 Annual billing discount:</span>
              <span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>Pro → $55.99/yr (save 33%)</span>
              <span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>Family → $95.99/yr (save 33%)</span>
              <span style={{ fontSize: 13, color: "#fcd34d", fontWeight: 600 }}>Business → $199.99/yr (save 33%)</span>
            </div>
          </div>
        )}

        {/* REVENUE STREAMS */}
        {activeTab === "revenue" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 800, fontSize: 28, color: "#f8fafc", letterSpacing: "-0.03em", marginBottom: 8 }}>Four revenue streams. One data flywheel.</h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 600 }}>
                More users → more receipt data → better price intelligence → more valuable product → more users. Each stream reinforces the others.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {REVENUE_STREAMS.map((s, i) => (
                <div key={i} style={{ background: "#111827", border: `1px solid ${s.color}30`, borderRadius: 16, padding: "28px 32px" }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: s.color, marginBottom: 16, letterSpacing: "0.06em" }}>{s.subtitle.toUpperCase()}</div>
                  <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }}>{s.detail}</p>
                  <div style={{ background: `${s.color}12`, border: `1px solid ${s.color}25`, borderRadius: 8, padding: "10px 14px" }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: s.color, fontWeight: 700 }}>{s.metric}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, background: "#111827", borderRadius: 12, padding: "24px 28px", border: "1px solid #1e293b" }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f8fafc", marginBottom: 12 }}>⚖️ What ReceiptIQ will never do</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {["Sell individual user data or PII", "Serve in-app ads that interrupt the experience", "Charge for data export (it's your data)"].map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#64748b", alignItems: "flex-start" }}>
                    <span style={{ color: "#ef4444", flexShrink: 0 }}>✗</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PITCH NARRATIVE */}
        {activeTab === "pitch" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 800, fontSize: 28, color: "#f8fafc", letterSpacing: "-0.03em", marginBottom: 8 }}>Pitch narrative · 6 slides</h2>
              <p style={{ color: "#64748b", fontSize: 15 }}>A lean pre-seed story. Click through each slide.</p>
            </div>
            <div style={{ background: "#111827", border: `1px solid ${PITCH_SLIDES[activePitch].color}40`, borderRadius: 20, overflow: "hidden", minHeight: 340 }}>
              <div style={{ background: `${PITCH_SLIDES[activePitch].color}12`, borderBottom: `1px solid ${PITCH_SLIDES[activePitch].color}25`, padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: PITCH_SLIDES[activePitch].color, letterSpacing: "0.1em" }}>SLIDE {activePitch + 1} / {PITCH_SLIDES.length}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#334155", letterSpacing: "0.1em" }}>— {PITCH_SLIDES[activePitch].label.toUpperCase()}</span>
              </div>
              <div style={{ padding: "40px 48px" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{PITCH_SLIDES[activePitch].icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: 24, color: "#f8fafc", letterSpacing: "-0.03em", marginBottom: 16, maxWidth: 640, lineHeight: 1.3 }}>
                  {PITCH_SLIDES[activePitch].headline}
                </h3>
                <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.75, maxWidth: 620, marginBottom: 28 }}>
                  {PITCH_SLIDES[activePitch].body}
                </p>
                <div style={{ display: "inline-block", background: `${PITCH_SLIDES[activePitch].color}15`, border: `1px solid ${PITCH_SLIDES[activePitch].color}30`, borderRadius: 10, padding: "12px 20px" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: PITCH_SLIDES[activePitch].color, fontWeight: 700 }}>
                    📌 {PITCH_SLIDES[activePitch].stat}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20, alignItems: "center" }}>
              {PITCH_SLIDES.map((s, i) => (
                <div key={i} className="pitch-dot" onClick={() => setActivePitch(i)}
                  style={{ width: i === activePitch ? 28 : 10, height: 10, borderRadius: 5, background: i === activePitch ? PITCH_SLIDES[i].color : "#1e293b", border: `1px solid ${i === activePitch ? PITCH_SLIDES[i].color : "#334155"}`, transition: "all 0.2s" }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setActivePitch(p => Math.max(0, p - 1))}
                style={{ padding: "10px 24px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", opacity: activePitch === 0 ? 0.3 : 1 }}>
                ← Previous
              </button>
              <button onClick={() => setActivePitch(p => Math.min(PITCH_SLIDES.length - 1, p + 1))}
                style={{ padding: "10px 24px", background: PITCH_SLIDES[activePitch].color, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", opacity: activePitch === PITCH_SLIDES.length - 1 ? 0.3 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* UNIT ECONOMICS */}
        {activeTab === "economics" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 800, fontSize: 28, color: "#f8fafc", letterSpacing: "-0.03em", marginBottom: 8 }}>Unit economics that make VCs lean forward</h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 560 }}>
                The key insight: price history data is a switching cost. Users with 12+ months of data almost never churn — they'd lose their entire personal inflation record.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {UNIT_ECONOMICS.map((u, i) => (
                <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: "24px 26px" }}>
                  <div style={{ fontSize: 11, color: "#475569", fontFamily: "'Space Mono', monospace", marginBottom: 10, letterSpacing: "0.06em" }}>{u.label.toUpperCase()}</div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", marginBottom: 6 }}>{u.value}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{u.note}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc", marginBottom: 16 }}>📈 Path to $1M ARR</div>
                {[
                  ["Launch (M0)", "Beta users, free only", "#334155"],
                  ["Month 6", "500 paid → ~$3.9K MRR", "#6366f1"],
                  ["Month 12", "2,000 paid → $15.6K MRR", "#10b981"],
                  ["Month 18", "7,200 paid → $56K MRR", "#f59e0b"],
                  ["Month 24", "11,000 paid → $85.8K MRR = $1M ARR", "#ec4899"],
                ].map(([stage, desc, color], i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "8px 0", borderBottom: i < 4 ? "1px solid #1e293b" : "none", alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: color, marginRight: 10 }}>{stage}</span>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc", marginBottom: 16 }}>🏹 Acquisition Strategy</div>
                {[
                  ["App Store Optimization (ASO)", "Primary — zero-cost organic discovery in Finance category"],
                  ["Inflation-anxiety content", "SEO + TikTok: \"Here's how much more you're actually paying for groceries\""],
                  ["Referral loop", "Share a savings insight card → drives word of mouth"],
                  ["Reddit / personal finance communities", "Genuine value-sharing in r/personalfinance, r/frugal"],
                  ["Influencer seeding", "FIRE community + budgeting creators — highly relevant audience"],
                ].map(([channel, desc], i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i < 4 ? "1px solid #1e293b" : "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{channel}</div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
