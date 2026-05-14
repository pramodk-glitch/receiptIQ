import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts";

const SCREENS = ["Dashboard","Receipt Scan","Price History","Weekly Review","Vendor Compare","Analytics Report"];

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const spendData = [
  { month:"Aug", total:2840, groceries:820, dining:410, utilities:320, other:1290 },
  { month:"Sep", total:3120, groceries:910, dining:480, utilities:315, other:1415 },
  { month:"Oct", total:2760, groceries:780, dining:390, utilities:330, other:1260 },
  { month:"Nov", total:3450, groceries:940, dining:620, utilities:340, other:1550 },
  { month:"Dec", total:4210, groceries:1100, dining:890, utilities:330, other:1890 },
  { month:"Jan", total:3180, groceries:870, dining:510, utilities:325, other:1475 },
];
const catData = [
  { name:"Groceries", value:870, color:"#6366f1" },
  { name:"Utilities", value:325, color:"#10b981" },
  { name:"Dining", value:510, color:"#f59e0b" },
  { name:"Subscriptions", value:187, color:"#ec4899" },
  { name:"Travel", value:340, color:"#0ea5e9" },
  { name:"Other", value:948, color:"#64748b" },
];
const priceHistory = [
  { date:"Mar '24", costco:5.49, walmart:6.29, target:6.79, you:6.29 },
  { date:"May '24", costco:5.49, walmart:6.49, target:6.99, you:5.49 },
  { date:"Jul '24", costco:5.79, walmart:6.49, target:7.19, you:6.49 },
  { date:"Sep '24", costco:5.79, walmart:6.99, target:7.49, you:6.99 },
  { date:"Nov '24", costco:5.99, walmart:7.19, target:7.79, you:5.99 },
  { date:"Jan '25", costco:5.99, walmart:7.29, target:7.99, you:7.29 },
];
const reviewItems = [
  { id:1, store:"Con Edison", category:"Utilities", amount:127.43, date:"Jan 12", icon:"⚡", status:"pending", recurring:true },
  { id:2, store:"Sweetgreen", category:"Dining", amount:18.90, date:"Jan 13", icon:"🥗", status:"pending", recurring:false },
  { id:3, store:"Netflix", category:"Subscription", amount:15.49, date:"Jan 14", icon:"📺", status:"pending", recurring:true },
  { id:4, store:"Spotify", category:"Subscription", amount:9.99, date:"Jan 14", icon:"🎵", status:"pending", recurring:true },
  { id:5, store:"Verizon", category:"Phone", amount:85.00, date:"Jan 15", icon:"📱", status:"pending", recurring:true },
  { id:6, store:"Shake Shack", category:"Dining", amount:24.70, date:"Jan 15", icon:"🍔", status:"pending", recurring:false },
];
const vendorData = [
  { store:"Costco", price:5.99, badge:"Cheapest", badgeColor:"#10b981", bgColor:"#f0fdf4" },
  { store:"Walmart", price:7.29, badge:"You bought here", badgeColor:"#6366f1", bgColor:"#eef2ff" },
  { store:"Amazon", price:7.49, badge:null, badgeColor:null, bgColor:"#f8fafc" },
  { store:"Target", price:7.99, badge:null, badgeColor:null, bgColor:"#f8fafc" },
  { store:"Whole Foods", price:8.49, badge:"Most expensive", badgeColor:"#ef4444", bgColor:"#fef2f2" },
];
const receiptItems = [
  { name:"Organic Whole Milk 1gal", qty:1, price:6.49, cat:"Groceries" },
  { name:"Sourdough Bread", qty:2, price:4.99, cat:"Groceries" },
  { name:"Cage Free Eggs 12ct", qty:1, price:5.79, cat:"Groceries" },
  { name:"Laundry Detergent", qty:1, price:11.99, cat:"Household" },
  { name:"Greek Yogurt 32oz", qty:1, price:5.49, cat:"Groceries" },
  { name:"Baby Spinach 5oz", qty:2, price:3.99, cat:"Groceries" },
  { name:"Sparkling Water 12pk", qty:1, price:7.49, cat:"Beverages" },
];
const analyticsRows = [
  { category:"Groceries", budget:900, actual:870, mom:-5.4, items:147, topItem:"Organic Milk", topSpend:"$6.49" },
  { category:"Utilities", budget:350, actual:325, mom:+1.2, items:4, topItem:"Con Edison", topSpend:"$127.43" },
  { category:"Dining", budget:400, actual:510, mom:+12.6, items:23, topItem:"Sweetgreen", topSpend:"$18.90" },
  { category:"Subscriptions", budget:200, actual:187, mom:0, items:8, topItem:"Netflix", topSpend:"$15.49" },
  { category:"Travel", budget:300, actual:340, mom:+34.2, items:6, topItem:"United Airlines", topSpend:"$189.00" },
  { category:"Healthcare", budget:150, actual:98, mom:-22.1, items:3, topItem:"CVS Pharmacy", topSpend:"$43.20" },
];

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────────
const catColor = { Groceries:"#6366f1", Household:"#ec4899", Beverages:"#0ea5e9", Utilities:"#10b981", Dining:"#f59e0b", Subscription:"#ec4899", Phone:"#0ea5e9", Healthcare:"#f97316", Travel:"#06b6d4", Subscriptions:"#ec4899" };

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize:10, fontWeight:700, color, background:bg, padding:"2px 8px", borderRadius:20, letterSpacing:"0.03em" }}>{label}</span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"14px 16px", flex:1 }}>
      <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:500, color: accent || "#0f172a", marginBottom:3 }}>{value}</div>
      <div style={{ fontSize:11, color:"#64748b" }}>{sub}</div>
    </div>
  );
}

// ── SCREENS ────────────────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <StatCard label="January Spend" value="$3,180" sub="↓ 10.6% vs December" accent="#0f172a" />
        <StatCard label="Over Budget" value="$110" sub="Dining +$110 over" accent="#ef4444" />
        <StatCard label="Saved vs Market" value="$84" sub="vs paying full price" accent="#10b981" />
        <StatCard label="Receipts Captured" value="38" sub="31 auto · 7 scanned" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>
        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#0f172a" }}>6-Month Spend</div>
            <span style={{ fontSize:11, color:"#94a3b8" }}>Aug 2024 – Jan 2025</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={spendData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, "Total"]} contentStyle={{ fontSize:11, border:"1px solid #e2e8f0", borderRadius:8 }} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" dot={{ r:3, fill:"#6366f1" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>January Breakdown</div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={catData} cx={46} cy={46} innerRadius={28} outerRadius={46} paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {catData.map((c, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:c.color }} />
                    <span style={{ fontSize:11, color:"#334155" }}>{c.name}</span>
                  </div>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748b" }}>${c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>Recent Receipts</div>
        {[
          { store:"Whole Foods", date:"Jan 15", total:"$84.32", items:14, src:"📧 Gmail", cat:"Groceries" },
          { store:"Con Edison", date:"Jan 12", total:"$127.43", items:1, src:"📧 Gmail", cat:"Utilities" },
          { store:"Sweetgreen", date:"Jan 13", total:"$18.90", items:3, src:"📧 Gmail", cat:"Dining" },
          { store:"Costco", date:"Jan 10", total:"$213.77", items:19, src:"📷 Scan", cat:"Groceries" },
          { store:"Netflix", date:"Jan 14", total:"$15.49", items:1, src:"📧 Gmail", cat:"Subscription" },
        ].map((r, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom: i < 4 ? "1px solid #f8fafc" : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:8, background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                {r.store[0]}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"#0f172a" }}>{r.store}</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>{r.date} · {r.items} items · {r.src}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500, color:"#0f172a" }}>{r.total}</div>
              <Badge label={r.cat} color={catColor[r.cat] || "#64748b"} bg={(catColor[r.cat] || "#64748b") + "18"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReceiptScan() {
  const [scanned, setScanned] = useState(true);
  const total = receiptItems.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:16 }}>
      <div>
        <div style={{ background:"#0f172a", borderRadius:14, padding:"20px", marginBottom:14, minHeight:340, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          {scanned ? (
            <div style={{ width:"100%", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🧾</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:4 }}>Whole Foods Market</div>
              <div style={{ fontSize:11, color:"#64748b", marginBottom:16 }}>1 Pine St, San Francisco · Jan 15, 2025</div>
              <div style={{ background:"rgba(99,102,241,0.15)", borderRadius:8, padding:"8px 16px", display:"inline-block" }}>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:500, color:"#a5b4fc" }}>$84.32</span>
              </div>
              <div style={{ marginTop:16, display:"flex", gap:8, justifyContent:"center" }}>
                <Badge label="✓ AI Extracted" color="#10b981" bg="rgba(16,185,129,0.15)" />
                <Badge label="14 items" color="#a5b4fc" bg="rgba(99,102,241,0.15)" />
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", border:"2px dashed #334155", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:24 }}>📷</div>
              <div style={{ color:"#64748b", fontSize:12 }}>Tap to scan a receipt</div>
            </div>
          )}
        </div>
        <div style={{ background:"#f0fdf4", borderRadius:10, padding:"12px 16px", border:"1px solid #bbf7d0" }}>
          <div style={{ fontWeight:600, fontSize:12, color:"#14532d", marginBottom:6 }}>AI Extraction Summary</div>
          <div style={{ fontSize:11, color:"#166534", lineHeight:1.7 }}>
            ✓ Store name detected<br/>
            ✓ 14 line items extracted<br/>
            ✓ Categories auto-assigned<br/>
            ✓ Duplicate check passed<br/>
            ✓ Price history updated
          </div>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>Extracted Line Items</div>
        <div style={{ marginBottom:14 }}>
          {receiptItems.map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom: i < receiptItems.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: catColor[item.cat] || "#94a3b8", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:"#0f172a" }}>{item.name}</div>
                  <div style={{ fontSize:10, color:"#94a3b8" }}>qty {item.qty} · {item.cat}</div>
                </div>
              </div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#334155" }}>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"2px solid #e2e8f0", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>Total</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, color:"#6366f1" }}>${total.toFixed(2)}</span>
        </div>
        <div style={{ marginTop:14, background:"#fef3c7", borderRadius:8, padding:"10px 14px", border:"1px solid #fde68a", fontSize:11, color:"#92400e" }}>
          💡 <strong>Organic Whole Milk</strong> is $1.80 cheaper at Costco right now.
        </div>
      </div>
    </div>
  );
}

function PriceHistoryScreen() {
  return (
    <div>
      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#0f172a", marginBottom:4 }}>Organic Whole Milk 1gal</div>
            <div style={{ display:"flex", gap:8 }}>
              <Badge label="Groceries" color="#6366f1" bg="#eef2ff" />
              <Badge label="Bought 6 times" color="#64748b" bg="#f1f5f9" />
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:500, color:"#ef4444" }}>+15.9%</div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>since first purchase</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={priceHistory} margin={{ top:4, right:8, bottom:0, left:-20 }}>
            <XAxis dataKey="date" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[4.5, 9]} tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
            <Tooltip formatter={(v, n) => [`$${v}`, n]} contentStyle={{ fontSize:11, border:"1px solid #e2e8f0", borderRadius:8 }} />
            <Line type="monotone" dataKey="you" stroke="#6366f1" strokeWidth={2.5} dot={{ r:4, fill:"#6366f1" }} name="You paid" />
            <Line type="monotone" dataKey="costco" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Costco" />
            <Line type="monotone" dataKey="walmart" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Walmart" />
            <Line type="monotone" dataKey="target" stroke="#64748b" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Target" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", gap:14, marginTop:10 }}>
          {[["— You paid","#6366f1"],["-- Costco","#10b981"],["-- Walmart","#f59e0b"],["-- Target","#64748b"]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:16, height:2, background:c, borderRadius:2 }} />
              <span style={{ fontSize:10, color:"#94a3b8" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        <StatCard label="Lowest price paid" value="$5.49" sub="May 2024 · Costco" accent="#10b981" />
        <StatCard label="Highest price paid" value="$7.29" sub="Jan 2025 · Walmart" accent="#ef4444" />
        <StatCard label="Price increase" value="+$1.80" sub="vs. first purchase" accent="#f59e0b" />
      </div>

      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>Purchase History</div>
        {[
          { date:"Jan 15, 2025", store:"Walmart", price:"$7.29", note:"Most recent" },
          { date:"Nov 8, 2024", store:"Costco", price:"$5.99", note:"Best recent deal" },
          { date:"Sep 3, 2024", store:"Walmart", price:"$6.99", note:null },
          { date:"Jul 20, 2024", store:"Walmart", price:"$6.49", note:null },
          { date:"May 14, 2024", store:"Costco", price:"$5.49", note:"All-time low" },
          { date:"Mar 2, 2024", store:"Walmart", price:"$6.29", note:"First purchase" },
        ].map((row, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom: i < 5 ? "1px solid #f8fafc" : "none" }}>
            <div>
              <span style={{ fontSize:13, color:"#334155" }}>{row.date}</span>
              <span style={{ fontSize:12, color:"#94a3b8", marginLeft:10 }}>{row.store}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {row.note && <span style={{ fontSize:10, color:"#64748b", background:"#f1f5f9", padding:"2px 8px", borderRadius:20 }}>{row.note}</span>}
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500, color:"#0f172a" }}>{row.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyReview() {
  const [items, setItems] = useState(reviewItems.map(i => ({ ...i })));
  const total = items.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const kept = items.filter(i => i.status === "kept").length;
  const dismissed = items.filter(i => i.status === "dismissed").length;

  const act = (id, status) => setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  const keepAll = () => setItems(prev => prev.map(i => ({ ...i, status: i.status === "pending" ? "kept" : i.status })));

  return (
    <div>
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:14, padding:"20px 24px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#fff", marginBottom:4 }}>📋 Weekly Review</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Jan 12 – Jan 18, 2025 · {items.filter(i=>i.status==="pending").length} items pending</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:500, color:"#a5b4fc" }}>${total.toFixed(2)}</div>
          <div style={{ fontSize:11, color:"#64748b" }}>pending total</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <div style={{ flex:1, background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:500, color:"#10b981" }}>{kept}</div>
          <div style={{ fontSize:11, color:"#94a3b8" }}>Kept</div>
        </div>
        <div style={{ flex:1, background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:500, color:"#ef4444" }}>{dismissed}</div>
          <div style={{ fontSize:11, color:"#94a3b8" }}>Dismissed</div>
        </div>
        <div style={{ flex:1, background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:500, color:"#f59e0b" }}>{items.filter(i=>i.status==="pending").length}</div>
          <div style={{ fontSize:11, color:"#94a3b8" }}>Pending</div>
        </div>
        <button onClick={keepAll} style={{ flex:2, background:"#6366f1", border:"none", borderRadius:10, padding:"12px 16px", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>
          Keep All Pending
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {items.map(item => (
          <div key={item.id} style={{
            background:"#fff", border:`1px solid ${item.status === "kept" ? "#bbf7d0" : item.status === "dismissed" ? "#fecaca" : "#f1f5f9"}`,
            borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14,
            opacity: item.status !== "pending" ? 0.65 : 1, transition:"all 0.2s"
          }}>
            <div style={{ fontSize:24, width:40, textAlign:"center" }}>{item.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{item.store}</span>
                {item.recurring && <Badge label="Recurring" color="#6366f1" bg="#eef2ff" />}
              </div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>{item.date} · {item.category}</div>
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:500, color:"#0f172a", minWidth:70, textAlign:"right" }}>
              ${item.amount.toFixed(2)}
            </div>
            {item.status === "pending" ? (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => act(item.id, "kept")} style={{ width:34, height:34, borderRadius:8, border:"1px solid #bbf7d0", background:"#f0fdf4", cursor:"pointer", fontSize:14, color:"#10b981" }}>✓</button>
                <button onClick={() => act(item.id, "dismissed")} style={{ width:34, height:34, borderRadius:8, border:"1px solid #fecaca", background:"#fef2f2", cursor:"pointer", fontSize:14, color:"#ef4444" }}>✕</button>
              </div>
            ) : (
              <Badge label={item.status === "kept" ? "✓ Kept" : "✕ Dismissed"} color={item.status === "kept" ? "#10b981" : "#ef4444"} bg={item.status === "kept" ? "#f0fdf4" : "#fef2f2"} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorCompare() {
  return (
    <div>
      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#0f172a", marginBottom:4 }}>Organic Whole Milk 1gal</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginBottom:16 }}>Current prices across nearby stores · Updated Jan 15, 2025</div>
        {vendorData.map((v, i) => {
          const pct = ((v.price - vendorData[0].price) / vendorData[0].price * 100);
          const barW = (v.price / vendorData[vendorData.length-1].price) * 100;
          return (
            <div key={i} style={{ background:v.bgColor, borderRadius:10, padding:"14px 18px", marginBottom:8, border:`1px solid ${i===0?"#bbf7d0":i===1?"#c7d2fe":"#f1f5f9"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{v.store}</span>
                  {v.badge && <Badge label={v.badge} color={v.badgeColor} bg={v.badgeColor + "20"} />}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {i > 0 && <span style={{ fontSize:11, color:"#ef4444" }}>+${(v.price - vendorData[0].price).toFixed(2)} more</span>}
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:600, color: i===0?"#10b981":"#0f172a" }}>${v.price.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ height:4, background:"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${barW}%`, background: i===0?"#10b981":i===1?"#6366f1":"#cbd5e1", borderRadius:4, transition:"width 0.3s" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:"#14532d", marginBottom:3 }}>Potential monthly savings</div>
          <div style={{ fontSize:12, color:"#166534" }}>If you buy this at Costco every time (4×/mo)</div>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:700, color:"#10b981" }}>$5.20</div>
      </div>

      <div style={{ marginTop:16, background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>Your Top 5 Savings Opportunities</div>
        {[
          { item:"Cage Free Eggs 12ct", cheapest:"Costco $4.29", yourStore:"Walmart $5.79", save:"$6.00/mo" },
          { item:"Greek Yogurt 32oz", cheapest:"Aldi $3.99", yourStore:"Whole Foods $6.49", save:"$5.00/mo" },
          { item:"Sparkling Water 12pk", cheapest:"Costco $5.99", yourStore:"Target $7.99", save:"$4.00/mo" },
          { item:"Laundry Detergent", cheapest:"Amazon $9.49", yourStore:"Walmart $11.99", save:"$2.50/mo" },
          { item:"Sourdough Bread", cheapest:"Trader Joe's $3.49", yourStore:"Whole Foods $4.99", save:"$3.00/mo" },
        ].map((row, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom: i < 4 ? "1px solid #f8fafc" : "none" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:"#0f172a" }}>{row.item}</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>Cheapest: {row.cheapest} · You're at: {row.yourStore}</div>
            </div>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600, color:"#10b981", background:"#f0fdf4", padding:"3px 10px", borderRadius:20 }}>save {row.save}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsReport() {
  return (
    <div>
      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#0f172a" }}>January 2025 — Spend Report</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>38 receipts · 247 line items · 6 categories</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Badge label="↓ 10.6% vs Dec" color="#10b981" bg="#f0fdf4" />
            <Badge label="$110 over budget" color="#ef4444" bg="#fef2f2" />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={analyticsRows} margin={{ top:4, right:4, bottom:0, left:-20 }}>
            <XAxis dataKey="category" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
            <Tooltip formatter={(v,n)=>[`$${v}`,n]} contentStyle={{ fontSize:11, border:"1px solid #e2e8f0", borderRadius:8 }} />
            <Bar dataKey="budget" fill="#e2e8f0" radius={[4,4,0,0]} name="Budget" />
            <Bar dataKey="actual" radius={[4,4,0,0]} name="Actual">
              {analyticsRows.map((r,i)=><Cell key={i} fill={r.actual > r.budget ? "#ef4444" : "#6366f1"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", gap:14, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:12, height:12, borderRadius:2, background:"#e2e8f0" }} /><span style={{ fontSize:10, color:"#94a3b8" }}>Budget</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:12, height:12, borderRadius:2, background:"#6366f1" }} /><span style={{ fontSize:10, color:"#94a3b8" }}>Actual (under)</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:12, height:12, borderRadius:2, background:"#ef4444" }} /><span style={{ fontSize:10, color:"#94a3b8" }}>Actual (over budget)</span></div>
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 0.8fr 0.8fr 0.8fr 0.9fr 1.2fr 0.9fr", padding:"10px 20px", background:"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
          {["Category","Budget","Actual","vs Budget","MoM","Top Item","Top Spend"].map(h => (
            <div key={h} style={{ fontSize:10, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
          ))}
        </div>
        {analyticsRows.map((row, i) => {
          const diff = row.actual - row.budget;
          const over = diff > 0;
          return (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1.2fr 0.8fr 0.8fr 0.8fr 0.9fr 1.2fr 0.9fr", padding:"12px 20px", borderBottom: i < analyticsRows.length-1 ? "1px solid #f8fafc" : "none", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:catColor[row.category]||"#94a3b8" }} />
                <span style={{ fontSize:13, fontWeight:500, color:"#0f172a" }}>{row.category}</span>
              </div>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#64748b" }}>${row.budget}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#0f172a", fontWeight:600 }}>${row.actual}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600, color: over?"#ef4444":"#10b981" }}>
                {over ? `+$${diff}` : `-$${Math.abs(diff)}`}
              </span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color: row.mom > 0 ? "#ef4444" : row.mom < 0 ? "#10b981" : "#64748b" }}>
                {row.mom > 0 ? "+" : ""}{row.mom.toFixed(1)}%
              </span>
              <span style={{ fontSize:12, color:"#334155" }}>{row.topItem}</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#334155" }}>{row.topSpend}</span>
            </div>
          );
        })}
        <div style={{ padding:"12px 20px", background:"#f8fafc", borderTop:"2px solid #e2e8f0", display:"grid", gridTemplateColumns:"1.2fr 0.8fr 0.8fr 0.8fr 0.9fr 1.2fr 0.9fr", alignItems:"center" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>Total</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, color:"#64748b" }}>$2,300</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, color:"#0f172a" }}>$3,180</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, color:"#ef4444" }}>+$880</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#ef4444" }}>–10.6%</span>
          <span /><span />
        </div>
      </div>
    </div>
  );
}

// ── APP SHELL ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("Dashboard");

  const screenIcons = {
    "Dashboard":"📊","Receipt Scan":"📷","Price History":"📈",
    "Weekly Review":"📋","Vendor Compare":"🏪","Analytics Report":"📑"
  };

  const renderScreen = () => {
    switch(screen) {
      case "Dashboard": return <Dashboard />;
      case "Receipt Scan": return <ReceiptScan />;
      case "Price History": return <PriceHistoryScreen />;
      case "Weekly Review": return <WeeklyReview />;
      case "Vendor Compare": return <VendorCompare />;
      case "Analytics Report": return <AnalyticsReport />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#f8fafc", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        button:hover { opacity:0.85; }
      `}</style>

      {/* Top bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"0 32px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1080, margin:"0 auto", display:"flex", alignItems:"center", gap:0 }}>
          <div style={{ padding:"14px 0", marginRight:32, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🧾</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#0f172a" }}>ReceiptIQ</span>
            <span style={{ fontSize:10, color:"#94a3b8", background:"#f1f5f9", padding:"2px 8px", borderRadius:20, marginLeft:4 }}>Mock UI</span>
          </div>
          <div style={{ display:"flex", overflowX:"auto" }}>
            {SCREENS.map(s => (
              <button key={s} onClick={() => setScreen(s)} style={{
                padding:"15px 14px", border:"none", background:"transparent", cursor:"pointer",
                fontSize:12, fontWeight: screen===s ? 600 : 400,
                color: screen===s ? "#6366f1" : "#64748b",
                borderBottom: screen===s ? "2px solid #6366f1" : "2px solid transparent",
                transition:"all 0.15s", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <span>{screenIcons[s]}</span>{s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"28px 32px 64px" }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>
            {screenIcons[screen]} {screen}
          </h2>
        </div>
        {renderScreen()}
      </div>
    </div>
  );
}
